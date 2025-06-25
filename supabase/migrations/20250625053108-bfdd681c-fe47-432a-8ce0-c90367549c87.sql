
-- Update the profiles table RLS policy to allow admin access
DROP POLICY IF EXISTS "Enable read access for authenticated users to own profile" ON public.profiles;

-- Create new policy that allows users to see their own profile OR allows admins to see all profiles
CREATE POLICY "Users can view own profile or admins can view all" 
  ON public.profiles FOR SELECT 
  USING (
    auth.uid() = id OR 
    public.is_admin(auth.uid())
  );

-- Also update the packages policy to ensure it works correctly
DROP POLICY IF EXISTS "Users can view own packages or admins can view all" ON public.packages;

CREATE POLICY "Users can view own packages or admins can view all" 
  ON public.packages FOR SELECT 
  USING (
    customer_id = auth.uid() OR 
    public.is_admin(auth.uid())
  );

-- Add admin access policies for customers table
CREATE POLICY "Admins can view all customers" 
  ON public.customers FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert customers" 
  ON public.customers FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update customers" 
  ON public.customers FOR UPDATE 
  USING (public.is_admin(auth.uid()));

-- Enable RLS on customers table if not already enabled
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
