-- Create table for auto-sync configuration
CREATE TABLE IF NOT EXISTS public.magaya_auto_sync_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  is_enabled BOOLEAN DEFAULT false,
  sync_on_status_changes TEXT[] DEFAULT ARRAY['arrived', 'ready_for_pickup', 'picked_up'],
  retry_attempts INTEGER DEFAULT 3,
  retry_delay_seconds INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on auto-sync config table
ALTER TABLE public.magaya_auto_sync_config ENABLE ROW LEVEL SECURITY;

-- Create policy for auto-sync config access (admin only)
CREATE POLICY "Admins can manage auto-sync config"
  ON public.magaya_auto_sync_config
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add trigger for updated_at on auto-sync config
CREATE TRIGGER handle_magaya_auto_sync_config_updated_at
  BEFORE UPDATE ON public.magaya_auto_sync_config
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default configuration
INSERT INTO public.magaya_auto_sync_config (is_enabled, sync_on_status_changes, retry_attempts, retry_delay_seconds)
VALUES (false, ARRAY['arrived', 'ready_for_pickup', 'picked_up'], 3, 30)
ON CONFLICT DO NOTHING;

-- Create function to handle automatic Magaya sync
CREATE OR REPLACE FUNCTION public.trigger_magaya_auto_sync()
RETURNS TRIGGER AS $$
DECLARE
  sync_config RECORD;
BEGIN
  -- Only trigger if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get auto-sync configuration
    SELECT * INTO sync_config FROM public.magaya_auto_sync_config LIMIT 1;
    
    -- Check if auto-sync is enabled and this status change should trigger sync
    IF sync_config.is_enabled AND NEW.status = ANY(sync_config.sync_on_status_changes) THEN
      -- Call the Magaya API function asynchronously
      PERFORM net.http_post(
        url := 'https://lkvelwwrztkmnvgeknpa.supabase.co/functions/v1/magaya-api',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrdmVsd3dyenRrbW52Z2VrbnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MDU5MDksImV4cCI6MjA2NjI4MTkwOX0.FYncO6mPqw5mJr4ek8kQdgvdo15nXU42vqq-TUtwuts'
        ),
        body := jsonb_build_object(
          'action', 'auto_sync_status',
          'packageId', NEW.id::text,
          'oldStatus', OLD.status,
          'newStatus', NEW.status,
          'retryAttempts', sync_config.retry_attempts,
          'retryDelay', sync_config.retry_delay_seconds
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on packages table for auto-sync
CREATE TRIGGER trigger_packages_magaya_auto_sync
  AFTER UPDATE ON public.packages
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_magaya_auto_sync();