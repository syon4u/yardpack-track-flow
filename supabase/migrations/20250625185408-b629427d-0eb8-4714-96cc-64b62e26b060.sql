
-- First, let's check the current RLS policies and ensure they're properly configured

-- Drop existing policies to recreate them with proper logic
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own packages or admins can view all" ON public.packages;
DROP POLICY IF EXISTS "Users can read their own customer record" ON public.customers;
DROP POLICY IF EXISTS "Admins can read all customer records" ON public.customers;
DROP POLICY IF EXISTS "Admins can insert customer records" ON public.customers;
DROP POLICY IF EXISTS "Admins can update customer records" ON public.customers;

-- Ensure RLS is enabled on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- PROFILES table policies
CREATE POLICY "Users can view own profile or admins can view all" 
  ON public.profiles FOR SELECT 
  USING (
    auth.uid() = id OR 
    public.is_admin(auth.uid())
  );

CREATE POLICY "Users can update own profile or admins can update all" 
  ON public.profiles FOR UPDATE 
  USING (
    auth.uid() = id OR 
    public.is_admin(auth.uid())
  );

-- PACKAGES table policies
CREATE POLICY "Users can view own packages or admins can view all" 
  ON public.packages FOR SELECT 
  USING (
    customer_id IN (
      SELECT id FROM public.customers WHERE user_id = auth.uid()
    ) OR 
    public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can insert packages" 
  ON public.packages FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update packages" 
  ON public.packages FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete packages" 
  ON public.packages FOR DELETE 
  USING (public.is_admin(auth.uid()));

-- CUSTOMERS table policies
CREATE POLICY "Users can read their own customer record or admins can read all" 
  ON public.customers FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    public.is_admin(auth.uid())
  );

CREATE POLICY "Users can update their own customer record or admins can update all" 
  ON public.customers FOR UPDATE 
  USING (
    user_id = auth.uid() OR 
    public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can insert customer records" 
  ON public.customers FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete customer records" 
  ON public.customers FOR DELETE 
  USING (public.is_admin(auth.uid()));
