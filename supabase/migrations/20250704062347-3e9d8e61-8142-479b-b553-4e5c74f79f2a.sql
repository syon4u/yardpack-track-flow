-- Temporarily disable RLS on all tables for debugging
ALTER TABLE public.api_configurations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.magaya_auto_sync_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.magaya_sync_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_pickup_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_dispute_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_verification_methods DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events DISABLE ROW LEVEL SECURITY;