-- Phase 1: Critical Security Fixes - Row Level Security
-- Enable RLS on critical tables that don't have it

-- 1. Enable RLS on packages table
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on customers table  
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- 3. Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Enable RLS on tracking_events table
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for packages table
-- Customers can view their own packages
CREATE POLICY "Customers can view their own packages" 
ON public.packages 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.customers WHERE id = packages.customer_id AND user_id = auth.uid())
);

-- Admins and warehouse staff can view all packages
CREATE POLICY "Staff can view all packages" 
ON public.packages 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'warehouse'))
);

-- Staff can manage all packages
CREATE POLICY "Staff can manage all packages" 
ON public.packages 
FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'warehouse'))
);

-- RLS Policies for customers table
-- Users can view their own customer record
CREATE POLICY "Users can view their own customer record" 
ON public.customers 
FOR SELECT 
USING (user_id = auth.uid());

-- Admins can view all customers
CREATE POLICY "Admins can view all customers" 
ON public.customers 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Admins can manage all customers
CREATE POLICY "Admins can manage all customers" 
ON public.customers 
FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Users can update their own customer record
CREATE POLICY "Users can update their own customer record" 
ON public.customers 
FOR UPDATE 
USING (user_id = auth.uid());

-- RLS Policies for profiles table
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Admins can manage all profiles
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- System can insert profiles (for new user trigger)
CREATE POLICY "System can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for tracking_events table
-- Customers can view tracking events for their packages
CREATE POLICY "Customers can view their package tracking events" 
ON public.tracking_events 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.packages p
    JOIN public.customers c ON c.id = p.customer_id
    WHERE p.id = tracking_events.package_id AND c.user_id = auth.uid()
  )
);

-- Staff can view all tracking events
CREATE POLICY "Staff can view all tracking events" 
ON public.tracking_events 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'warehouse'))
);

-- Staff can manage all tracking events
CREATE POLICY "Staff can manage all tracking events" 
ON public.tracking_events 
FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'warehouse'))
);