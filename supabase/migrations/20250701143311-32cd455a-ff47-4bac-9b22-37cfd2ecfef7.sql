
-- Add Magaya-specific fields to packages table
ALTER TABLE public.packages 
ADD COLUMN magaya_shipment_id TEXT,
ADD COLUMN magaya_reference_number TEXT,
ADD COLUMN warehouse_location TEXT,
ADD COLUMN consolidation_status TEXT DEFAULT 'pending';

-- Create index for better performance on Magaya lookups
CREATE INDEX idx_packages_magaya_shipment_id ON public.packages(magaya_shipment_id);
CREATE INDEX idx_packages_magaya_reference ON public.packages(magaya_reference_number);

-- Insert Magaya API configuration
INSERT INTO public.api_configurations (
  carrier,
  base_url,
  api_key_name,
  is_active,
  rate_limit_per_minute
) VALUES (
  'MAGAYA',
  'https://api.magaya.com/v1',
  'MAGAYA_API_TOKEN',
  true,
  100
) ON CONFLICT (carrier) DO UPDATE SET
  base_url = EXCLUDED.base_url,
  api_key_name = EXCLUDED.api_key_name,
  is_active = EXCLUDED.is_active,
  rate_limit_per_minute = EXCLUDED.rate_limit_per_minute;

-- Create table for Magaya sync status tracking
CREATE TABLE IF NOT EXISTS public.magaya_sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL, -- 'create', 'update', 'status_change'
  sync_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed'
  magaya_response JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on sync log table
ALTER TABLE public.magaya_sync_log ENABLE ROW LEVEL SECURITY;

-- Create policy for sync log access (admin only)
CREATE POLICY "Admins can manage sync logs"
  ON public.magaya_sync_log
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add trigger for updated_at on sync log
CREATE TRIGGER handle_magaya_sync_log_updated_at
  BEFORE UPDATE ON public.magaya_sync_log
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
