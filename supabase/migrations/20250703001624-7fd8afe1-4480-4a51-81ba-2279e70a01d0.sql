-- First, add a type column to distinguish between receipts and invoices
ALTER TABLE public.invoices ADD COLUMN document_type TEXT NOT NULL DEFAULT 'receipt';

-- Add invoice-specific columns
ALTER TABLE public.invoices ADD COLUMN invoice_number TEXT UNIQUE;
ALTER TABLE public.invoices ADD COLUMN total_amount DECIMAL(10,2);
ALTER TABLE public.invoices ADD COLUMN due_date DATE;
ALTER TABLE public.invoices ADD COLUMN status TEXT DEFAULT 'draft';
ALTER TABLE public.invoices ADD COLUMN line_items JSONB;
ALTER TABLE public.invoices ADD COLUMN notes TEXT;

-- Update existing data to be marked as receipts
UPDATE public.invoices SET document_type = 'receipt' WHERE document_type = 'receipt';

-- Create auto-increment sequence for invoice numbers
CREATE SEQUENCE invoice_number_seq START 1000;

-- Create storage bucket for receipts (customers upload)
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);

-- Create storage bucket for invoices (admin generated)
INSERT INTO storage.buckets (id, name, public) VALUES ('customer-invoices', 'customer-invoices', false);

-- RLS policies for receipts storage
CREATE POLICY "Customers can upload their own receipts" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Customers can view their own receipts" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all receipts" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'receipts' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS policies for invoices storage
CREATE POLICY "Admins can manage customer invoices" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'customer-invoices' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Customers can view their own invoices" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'customer-invoices' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for the invoices table
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Customers can manage their own receipts
CREATE POLICY "Customers can manage their own receipts" 
ON public.invoices 
FOR ALL 
USING (
  document_type = 'receipt' 
  AND uploaded_by = auth.uid()
);

-- Admins can view all receipts
CREATE POLICY "Admins can view all receipts" 
ON public.invoices 
FOR SELECT 
USING (
  document_type = 'receipt' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can manage all invoices
CREATE POLICY "Admins can manage invoices" 
ON public.invoices 
FOR ALL 
USING (
  document_type = 'invoice' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Customers can view invoices sent to them
CREATE POLICY "Customers can view their invoices" 
ON public.invoices 
FOR SELECT 
USING (
  document_type = 'invoice' 
  AND package_id IN (
    SELECT p.id FROM public.packages p
    JOIN public.customers c ON c.id = p.customer_id
    WHERE c.user_id = auth.uid()
  )
);

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('invoice_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invoice numbers
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.document_type = 'invoice' AND NEW.invoice_number IS NULL THEN
    NEW.invoice_number = generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invoice_number
BEFORE INSERT ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION set_invoice_number();