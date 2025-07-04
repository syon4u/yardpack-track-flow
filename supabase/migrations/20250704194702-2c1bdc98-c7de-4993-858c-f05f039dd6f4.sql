-- Create trigger to automatically send notifications when package status changes
CREATE TRIGGER trigger_package_status_notification
  BEFORE UPDATE ON public.packages
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_package_notification();