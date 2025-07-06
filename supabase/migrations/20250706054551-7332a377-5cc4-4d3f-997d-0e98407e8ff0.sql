-- Create system settings table for configurable metrics
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type TEXT NOT NULL DEFAULT 'text',
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage system settings" 
ON public.system_settings 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'::app_role
));

CREATE POLICY "Public settings viewable by all authenticated users"
ON public.system_settings
FOR SELECT
USING (is_public = true AND auth.uid() IS NOT NULL);

-- Insert default performance metrics
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, display_name, description, category, is_public) VALUES
('customer_satisfaction_percentage', '94.2', 'number', 'Customer Satisfaction %', 'Overall customer satisfaction percentage', 'performance', true),
('delivery_efficiency_percentage', '87.8', 'number', 'Delivery Efficiency %', 'Delivery efficiency percentage', 'performance', true),
('cost_optimization_percentage', '12.5', 'number', 'Cost Optimization %', 'Cost optimization improvement percentage', 'performance', true),
('system_version', 'v2.1.4', 'text', 'System Version', 'Current system version', 'system', true),
('active_users_count', '127', 'number', 'Active Users', 'Number of currently active users', 'system', true);

-- Create updated_at trigger
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();