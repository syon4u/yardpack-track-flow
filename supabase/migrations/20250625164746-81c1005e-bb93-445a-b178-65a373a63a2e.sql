
-- Disable RLS on all tables and drop existing policies

-- Disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users to own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;

-- Disable RLS on packages table
ALTER TABLE public.packages DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own packages or admins can view all" ON public.packages;
DROP POLICY IF EXISTS "Admins can insert packages" ON public.packages;
DROP POLICY IF EXISTS "Admins can update packages" ON public.packages;

-- Disable RLS on customers table
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view all customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can update customers" ON public.customers;
DROP POLICY IF EXISTS "Users can view their customer record" ON public.customers;
DROP POLICY IF EXISTS "Users can update their customer record" ON public.customers;
DROP POLICY IF EXISTS "Admins can manage all customers" ON public.customers;

-- Disable RLS on invoices table
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view invoices for their packages" ON public.invoices;
DROP POLICY IF EXISTS "Admins can manage all invoices" ON public.invoices;

-- Disable RLS on tracking_events table
ALTER TABLE public.tracking_events DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view tracking events for their packages" ON public.tracking_events;
DROP POLICY IF EXISTS "Admins can insert tracking events" ON public.tracking_events;

-- Disable RLS on api_configurations table
ALTER TABLE public.api_configurations DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only admins can manage API configurations" ON public.api_configurations;

-- Disable RLS on notifications table (if it exists)
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
