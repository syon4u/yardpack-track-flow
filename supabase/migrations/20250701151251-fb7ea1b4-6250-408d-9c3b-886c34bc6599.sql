
-- Create pickup verification methods table
CREATE TABLE public.pickup_verification_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_signature BOOLEAN NOT NULL DEFAULT false,
  requires_photo BOOLEAN NOT NULL DEFAULT false,
  requires_code BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default verification methods
INSERT INTO public.pickup_verification_methods (name, description, requires_signature, requires_photo, requires_code) VALUES
('digital_signature', 'Digital signature capture on tablet/device', true, false, false),
('photo_id', 'Photo verification with government ID', false, true, false),
('qr_code', 'QR code verification from customer app/email', false, false, true),
('pin_code', 'PIN code provided to customer via SMS/email', false, false, true),
('staff_verification', 'Manual verification by staff member', false, false, false);

-- Create package pickup records table
CREATE TABLE public.package_pickup_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  verification_method_id UUID NOT NULL REFERENCES public.pickup_verification_methods(id),
  pickup_person_name TEXT NOT NULL,
  pickup_person_phone TEXT,
  pickup_person_relationship TEXT, -- 'customer', 'authorized_representative', 'family_member', etc.
  authorized_by_staff UUID NOT NULL REFERENCES public.profiles(id), -- Staff member who authorized pickup
  pickup_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verification_data JSONB, -- Store signature, photo paths, codes, etc.
  verification_successful BOOLEAN NOT NULL DEFAULT true,
  pickup_notes TEXT,
  package_condition TEXT DEFAULT 'good', -- 'good', 'damaged', 'opened', etc.
  customer_satisfied BOOLEAN DEFAULT true,
  dispute_reported BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pickup codes table for QR/PIN verification
CREATE TABLE public.pickup_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  code_type TEXT NOT NULL CHECK (code_type IN ('qr', 'pin')),
  code_value TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  generated_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pickup dispute logs table
CREATE TABLE public.pickup_dispute_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES public.packages(id),
  pickup_record_id UUID REFERENCES public.package_pickup_records(id),
  dispute_type TEXT NOT NULL, -- 'never_picked_up', 'wrong_person', 'damaged_package', etc.
  reported_by UUID NOT NULL REFERENCES public.profiles(id),
  dispute_description TEXT NOT NULL,
  evidence_files JSONB, -- Array of file paths for evidence
  resolution_status TEXT NOT NULL DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'closed'
  resolution_notes TEXT,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_pickup_records_package_id ON public.package_pickup_records(package_id);
CREATE INDEX idx_pickup_records_staff ON public.package_pickup_records(authorized_by_staff);
CREATE INDEX idx_pickup_records_timestamp ON public.package_pickup_records(pickup_timestamp);
CREATE INDEX idx_pickup_codes_package ON public.pickup_codes(package_id);
CREATE INDEX idx_pickup_codes_active ON public.pickup_codes(is_active, expires_at);
CREATE INDEX idx_dispute_logs_package ON public.pickup_dispute_logs(package_id);
CREATE INDEX idx_dispute_logs_status ON public.pickup_dispute_logs(resolution_status);

-- Add RLS policies for security
ALTER TABLE public.pickup_verification_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_pickup_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_dispute_logs ENABLE ROW LEVEL SECURITY;

-- Verification methods - admins can manage, others can read
CREATE POLICY "Admins can manage pickup verification methods" ON public.pickup_verification_methods
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'warehouse'))
  );

CREATE POLICY "All authenticated users can view pickup verification methods" ON public.pickup_verification_methods
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Pickup records - admins and warehouse staff can manage, customers can view their own
CREATE POLICY "Staff can manage pickup records" ON public.package_pickup_records
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'warehouse'))
  );

CREATE POLICY "Customers can view their own pickup records" ON public.package_pickup_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.packages p 
      JOIN public.customers c ON c.id = p.customer_id 
      WHERE p.id = package_id AND c.user_id = auth.uid()
    )
  );

-- Pickup codes - staff can manage, customers can view their own
CREATE POLICY "Staff can manage pickup codes" ON public.pickup_codes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'warehouse'))
  );

CREATE POLICY "Customers can view their own pickup codes" ON public.pickup_codes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.packages p 
      JOIN public.customers c ON c.id = p.customer_id 
      WHERE p.id = package_id AND c.user_id = auth.uid()
    )
  );

-- Dispute logs - similar access patterns
CREATE POLICY "Staff can manage dispute logs" ON public.pickup_dispute_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'warehouse'))
  );

CREATE POLICY "Customers can view their own dispute logs" ON public.pickup_dispute_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.packages p 
      JOIN public.customers c ON c.id = p.customer_id 
      WHERE p.id = package_id AND c.user_id = auth.uid()
    )
  );

-- Add trigger to update timestamps
CREATE OR REPLACE FUNCTION public.handle_pickup_record_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pickup_records_updated_at
  BEFORE UPDATE ON public.package_pickup_records
  FOR EACH ROW EXECUTE FUNCTION public.handle_pickup_record_updated_at();

CREATE TRIGGER dispute_logs_updated_at
  BEFORE UPDATE ON public.pickup_dispute_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_pickup_record_updated_at();

CREATE TRIGGER verification_methods_updated_at
  BEFORE UPDATE ON public.pickup_verification_methods
  FOR EACH ROW EXECUTE FUNCTION public.handle_pickup_record_updated_at();

-- Add function to automatically update package status when pickup is recorded
CREATE OR REPLACE FUNCTION public.handle_package_pickup()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if pickup was successful
  IF NEW.verification_successful = true THEN
    UPDATE public.packages 
    SET 
      status = 'picked_up',
      actual_delivery = NEW.pickup_timestamp,
      updated_at = now()
    WHERE id = NEW.package_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER package_pickup_status_update
  AFTER INSERT ON public.package_pickup_records
  FOR EACH ROW EXECUTE FUNCTION public.handle_package_pickup();
