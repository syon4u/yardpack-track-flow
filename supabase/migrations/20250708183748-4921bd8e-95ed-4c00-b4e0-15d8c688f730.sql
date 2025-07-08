-- Add supplier filter to API configurations
ALTER TABLE public.api_configurations 
ADD COLUMN supplier_filter TEXT[];

-- Create magaya sync sessions table to track bulk sync operations
CREATE TABLE public.magaya_sync_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  initiated_by UUID NOT NULL REFERENCES public.profiles(id),
  session_type TEXT NOT NULL DEFAULT 'bulk_sync',
  supplier_filter TEXT NOT NULL DEFAULT 'Jhavar Leakey',
  status TEXT NOT NULL DEFAULT 'in_progress',
  total_shipments INTEGER DEFAULT 0,
  processed_shipments INTEGER DEFAULT 0,
  created_packages INTEGER DEFAULT 0,
  updated_packages INTEGER DEFAULT 0,
  created_customers INTEGER DEFAULT 0,
  mapped_customers INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  session_data JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer mapping rules table for auto/manual mapping
CREATE TABLE public.customer_mapping_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_session_id UUID REFERENCES public.magaya_sync_sessions(id) ON DELETE CASCADE,
  magaya_customer_data JSONB NOT NULL,
  yardpack_customer_id UUID REFERENCES public.customers(id),
  mapping_type TEXT NOT NULL DEFAULT 'auto', -- 'auto', 'manual', 'create_new'
  mapping_confidence DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0 confidence score
  mapping_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.magaya_sync_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_mapping_rules ENABLE ROW LEVEL SECURITY;

-- RLS policies for magaya_sync_sessions
CREATE POLICY "Admins can manage sync sessions" 
ON public.magaya_sync_sessions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'::app_role
));

CREATE POLICY "Users can view their own sync sessions" 
ON public.magaya_sync_sessions 
FOR SELECT 
USING (initiated_by = auth.uid());

-- RLS policies for customer_mapping_rules
CREATE POLICY "Admins can manage mapping rules" 
ON public.customer_mapping_rules 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'::app_role
));

-- Add triggers for updated_at
CREATE TRIGGER update_magaya_sync_sessions_updated_at
  BEFORE UPDATE ON public.magaya_sync_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_customer_mapping_rules_updated_at
  BEFORE UPDATE ON public.customer_mapping_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Update existing API configuration for Magaya to include supplier filter
UPDATE public.api_configurations 
SET supplier_filter = ARRAY['Jhavar Leakey']
WHERE carrier = 'MAGAYA';