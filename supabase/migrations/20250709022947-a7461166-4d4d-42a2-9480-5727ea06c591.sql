
-- Add credentials field to api_configurations for storing multiple credential types
ALTER TABLE public.api_configurations 
ADD COLUMN credentials JSONB DEFAULT '{}';

-- Update existing MAGAYA configuration to reflect SOAP API requirements
UPDATE public.api_configurations 
SET 
  base_url = 'https://tracking.magaya.com/WebService/LiveTrackWebService.asmx',
  api_key_name = 'SOAP Credentials',
  credentials = jsonb_build_object(
    'network_id', '',
    'username', '', 
    'password', '',
    'api_url', 'https://tracking.magaya.com/WebService/LiveTrackWebService.asmx'
  )
WHERE carrier = 'MAGAYA';

-- Insert MAGAYA configuration if it doesn't exist
INSERT INTO public.api_configurations (carrier, base_url, api_key_name, is_active, rate_limit_per_minute, supplier_filter, credentials)
SELECT 'MAGAYA', 'https://tracking.magaya.com/WebService/LiveTrackWebService.asmx', 'SOAP Credentials', true, 60, ARRAY['Jhavar Leakey'], 
jsonb_build_object(
  'network_id', '',
  'username', '', 
  'password', '',
  'api_url', 'https://tracking.magaya.com/WebService/LiveTrackWebService.asmx'
)
WHERE NOT EXISTS (SELECT 1 FROM public.api_configurations WHERE carrier = 'MAGAYA');
