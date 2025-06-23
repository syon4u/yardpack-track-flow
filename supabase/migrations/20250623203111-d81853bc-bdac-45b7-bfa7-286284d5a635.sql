
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Customers can view their own packages" ON public.packages;
DROP POLICY IF EXISTS "Admins can insert packages" ON public.packages;
DROP POLICY IF EXISTS "Admins can update packages" ON public.packages;

-- Create simplified, non-recursive policies for profiles
CREATE POLICY "Enable read access for authenticated users to own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create a security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Create policies for packages using the security definer function
CREATE POLICY "Users can view own packages or admins can view all" 
  ON public.packages FOR SELECT 
  USING (
    customer_id = auth.uid() OR 
    public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can insert packages" 
  ON public.packages FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update packages" 
  ON public.packages FOR UPDATE 
  USING (public.is_admin(auth.uid()));
