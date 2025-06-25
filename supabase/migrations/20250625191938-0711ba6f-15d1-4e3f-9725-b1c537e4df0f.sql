
-- Disable RLS on all tables to remove JWT/authentication requirements
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_configurations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies since they rely on authentication
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile or admins can update all" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users to own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own packages or admins can view all" ON public.packages;
DROP POLICY IF EXISTS "Admins can insert packages" ON public.packages;
DROP POLICY IF EXISTS "Admins can update packages" ON public.packages;
DROP POLICY IF EXISTS "Admins can delete packages" ON public.packages;

DROP POLICY IF EXISTS "Users can read their own customer record or admins can read all" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customer record or admins can update all" ON public.customers;
DROP POLICY IF EXISTS "Admins can insert customer records" ON public.customers;
DROP POLICY IF EXISTS "Admins can delete customer records" ON public.customers;
DROP POLICY IF EXISTS "Admins can manage all customers" ON public.customers;
DROP POLICY IF EXISTS "Users can view their customer record" ON public.customers;
DROP POLICY IF EXISTS "Users can update their customer record" ON public.customers;

DROP POLICY IF EXISTS "Users can view invoices for their packages" ON public.invoices;
DROP POLICY IF EXISTS "Admins can manage all invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can upload invoices for their packages" ON public.invoices;

DROP POLICY IF EXISTS "Users can view tracking events for their packages" ON public.tracking_events;
DROP POLICY IF EXISTS "Admins can insert tracking events" ON public.tracking_events;

DROP POLICY IF EXISTS "Only admins can manage API configurations" ON public.api_configurations;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Comment out the is_admin function since it's no longer needed
-- The function will remain but won't be used
COMMENT ON FUNCTION public.is_admin(uuid) IS 'Function disabled - JWT authentication removed from application';
