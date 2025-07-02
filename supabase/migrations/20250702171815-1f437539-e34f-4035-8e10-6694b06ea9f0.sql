-- Phase 1: Critical Infrastructure Setup

-- 1. Create the missing trigger to automatically create notification records
CREATE TRIGGER package_status_notification_trigger
  BEFORE UPDATE ON public.packages
  FOR EACH ROW 
  EXECUTE FUNCTION public.trigger_package_notification();

-- 2. Add RLS policies for notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can view their own notifications
CREATE POLICY "Customers can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Admins can manage all notifications
CREATE POLICY "Admins can manage all notifications" 
ON public.notifications 
FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policy: System can insert notifications (for the trigger)
CREATE POLICY "System can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);