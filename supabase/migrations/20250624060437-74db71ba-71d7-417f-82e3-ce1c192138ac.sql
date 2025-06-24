
-- Add carrier and external tracking fields to packages table
ALTER TABLE public.packages 
ADD COLUMN carrier TEXT,
ADD COLUMN external_tracking_number TEXT,
ADD COLUMN last_api_sync TIMESTAMP WITH TIME ZONE,
ADD COLUMN api_sync_status TEXT DEFAULT 'pending',
ADD COLUMN delivery_estimate TIMESTAMP WITH TIME ZONE;

-- Create tracking_events table for historical tracking data
CREATE TABLE public.tracking_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  carrier TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_description TEXT NOT NULL,
  event_location TEXT,
  event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create api_configurations table for storing carrier credentials
CREATE TABLE public.api_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  carrier TEXT NOT NULL UNIQUE,
  api_key_name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  rate_limit_per_minute INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_configurations ENABLE ROW LEVEL SECURITY;

-- RLS policies for tracking_events
CREATE POLICY "Users can view tracking events for their packages" ON public.tracking_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.packages WHERE id = package_id AND customer_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can insert tracking events" ON public.tracking_events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS policies for api_configurations
CREATE POLICY "Only admins can manage API configurations" ON public.api_configurations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Insert default carrier configurations
INSERT INTO public.api_configurations (carrier, api_key_name, base_url, rate_limit_per_minute) VALUES
('USPS', 'USPS_API_KEY', 'https://secure.shippingapis.com/ShippingAPI.dll', 60),
('FEDEX', 'FEDEX_API_KEY', 'https://apis.fedex.com', 100),
('UPS', 'UPS_API_KEY', 'https://onlinetools.ups.com/api', 60),
('DHL', 'DHL_API_KEY', 'https://api-eu.dhl.com', 50);

-- Add trigger for updated_at on api_configurations
CREATE TRIGGER handle_api_configurations_updated_at 
  BEFORE UPDATE ON public.api_configurations 
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add indexes for better performance
CREATE INDEX idx_tracking_events_package_id ON public.tracking_events(package_id);
CREATE INDEX idx_tracking_events_carrier ON public.tracking_events(carrier);
CREATE INDEX idx_packages_carrier ON public.packages(carrier);
CREATE INDEX idx_packages_external_tracking ON public.packages(external_tracking_number);
