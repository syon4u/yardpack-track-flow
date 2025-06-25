
-- Enable RLS on customers table if not already enabled
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their customer record" ON public.customers;
DROP POLICY IF EXISTS "Users can update their customer record" ON public.customers;
DROP POLICY IF EXISTS "Admins can manage all customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can view all customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can update customers" ON public.customers;

-- Create policy for users to read only their own customer record
CREATE POLICY "Users can read their own customer record" 
ON public.customers 
FOR SELECT 
USING (user_id = auth.uid());

-- Create policy for admins to insert customer records
CREATE POLICY "Admins can insert customer records" 
ON public.customers 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create policy for admins to update customer records
CREATE POLICY "Admins can update customer records" 
ON public.customers 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create policy for admins to read all customer records
CREATE POLICY "Admins can read all customer records" 
ON public.customers 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
