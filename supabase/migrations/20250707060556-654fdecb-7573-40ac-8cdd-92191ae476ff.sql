-- Phase 1: Database Enhancements for Admin Invoice System

-- Add invoice type enum
CREATE TYPE public.invoice_type AS ENUM ('shipping_invoice', 'receipt');

-- Add new columns to invoices table for shipping/customs details
ALTER TABLE public.invoices 
ADD COLUMN invoice_type public.invoice_type DEFAULT 'receipt',
ADD COLUMN auto_generated boolean DEFAULT false,
ADD COLUMN shipping_cost numeric DEFAULT 0,
ADD COLUMN customs_duty numeric DEFAULT 0,
ADD COLUMN handling_fee numeric DEFAULT 0,
ADD COLUMN tax_amount numeric DEFAULT 0,
ADD COLUMN payment_status text DEFAULT 'pending',
ADD COLUMN payment_due_date timestamp with time zone;

-- Create invoice line items table for detailed breakdown
CREATE TABLE public.invoice_line_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
    item_type text NOT NULL, -- 'shipping', 'customs', 'handling', 'tax', 'other'
    description text NOT NULL,
    quantity numeric DEFAULT 1,
    unit_price numeric NOT NULL,
    total_amount numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on line items
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for invoice line items
CREATE POLICY "Admins can manage invoice line items"
ON public.invoice_line_items FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Users can view their invoice line items"
ON public.invoice_line_items FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM invoices i
    JOIN packages p ON p.id = i.package_id
    JOIN customers c ON c.id = p.customer_id
    WHERE i.id = invoice_line_items.invoice_id 
    AND c.user_id = auth.uid()
));

-- Function to calculate total invoice amount from line items
CREATE OR REPLACE FUNCTION public.calculate_invoice_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the invoice total when line items change
    UPDATE public.invoices 
    SET total_amount = (
        SELECT COALESCE(SUM(total_amount), 0)
        FROM public.invoice_line_items 
        WHERE invoice_id = CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.invoice_id 
            ELSE NEW.invoice_id 
        END
    )
    WHERE id = CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.invoice_id 
        ELSE NEW.invoice_id 
    END;
    
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate invoice totals
CREATE TRIGGER calculate_invoice_total_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.invoice_line_items
    FOR EACH ROW EXECUTE FUNCTION public.calculate_invoice_total();

-- Function to auto-generate shipping invoices when package status changes to in_transit
CREATE OR REPLACE FUNCTION public.auto_generate_shipping_invoice()
RETURNS TRIGGER AS $$
DECLARE
    default_shipping_cost numeric := 25.00;
    default_handling_fee numeric := 5.00;
    calculated_customs_duty numeric;
    invoice_id_var uuid;
BEGIN
    -- Only generate invoice when status changes to 'in_transit'
    IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'in_transit' THEN
        -- Calculate customs duty based on package value and duty rate
        calculated_customs_duty := COALESCE(NEW.package_value * NEW.duty_rate, 0);
        
        -- Create the shipping invoice
        INSERT INTO public.invoices (
            package_id,
            invoice_type,
            document_type,
            auto_generated,
            shipping_cost,
            customs_duty,
            handling_fee,
            total_amount,
            status,
            payment_status,
            payment_due_date,
            file_name,
            file_path,
            file_type,
            uploaded_by
        ) VALUES (
            NEW.id,
            'shipping_invoice',
            'invoice',
            true,
            default_shipping_cost,
            calculated_customs_duty,
            default_handling_fee,
            default_shipping_cost + calculated_customs_duty + default_handling_fee,
            'pending',
            'pending',
            NOW() + INTERVAL '30 days',
            'Shipping_Invoice_' || NEW.tracking_number || '.pdf',
            'invoices/auto/' || NEW.tracking_number || '.pdf',
            'application/pdf',
            (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
        ) RETURNING id INTO invoice_id_var;
        
        -- Create line items for the invoice
        INSERT INTO public.invoice_line_items (invoice_id, item_type, description, unit_price, total_amount) VALUES
        (invoice_id_var, 'shipping', 'Shipping and handling charges', default_shipping_cost, default_shipping_cost),
        (invoice_id_var, 'handling', 'Processing and handling fee', default_handling_fee, default_handling_fee);
        
        -- Add customs duty line item if applicable
        IF calculated_customs_duty > 0 THEN
            INSERT INTO public.invoice_line_items (invoice_id, item_type, description, unit_price, total_amount) 
            VALUES (invoice_id_var, 'customs', 'Customs duty and taxes', calculated_customs_duty, calculated_customs_duty);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate shipping invoices
CREATE TRIGGER auto_generate_shipping_invoice_trigger
    AFTER UPDATE ON public.packages
    FOR EACH ROW EXECUTE FUNCTION public.auto_generate_shipping_invoice();