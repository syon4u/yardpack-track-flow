
-- Drop the customers table if it exists to start fresh
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TYPE IF EXISTS public.customer_type CASCADE;

-- Create customer_type enum
CREATE TYPE public.customer_type AS ENUM ('registered', 'guest', 'package_only');

-- Create a sequence for customer numbers
CREATE SEQUENCE public.customer_number_seq START 1000;

-- Create customers table with proper customer number generation
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_number TEXT NOT NULL UNIQUE DEFAULT 'CUST-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('customer_number_seq')::TEXT, 6, '0'),
  full_name TEXT NOT NULL,
  email TEXT,
  phone_number TEXT,
  address TEXT,
  customer_type public.customer_type NOT NULL DEFAULT 'guest',
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  preferred_contact_method TEXT DEFAULT 'email',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Ensure registered customers have a user_id
  CONSTRAINT check_registered_user_id CHECK (
    (customer_type = 'registered' AND user_id IS NOT NULL) OR 
    (customer_type != 'registered')
  )
);

-- Create indexes for better performance
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customers_customer_type ON public.customers(customer_type);
CREATE INDEX idx_customers_customer_number ON public.customers(customer_number);

-- Add updated_at trigger
CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers table
-- Admins can do everything
CREATE POLICY "Admins can manage all customers" ON public.customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Registered customers can view and update their own customer record
CREATE POLICY "Users can view their customer record" ON public.customers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their customer record" ON public.customers
  FOR UPDATE USING (user_id = auth.uid());

-- Migrate existing data from profiles to customers
-- First, create customer records for all existing profiles
INSERT INTO public.customers (
  full_name,
  email,
  phone_number,
  address,
  customer_type,
  user_id,
  created_at,
  updated_at
)
SELECT 
  p.full_name,
  p.email,
  p.phone_number,
  p.address,
  'registered'::public.customer_type,
  p.id,
  p.created_at,
  p.updated_at
FROM public.profiles p;

-- Create customer records for package-only customers (from packages without matching profiles)
INSERT INTO public.customers (
  full_name,
  email,
  phone_number,
  address,
  customer_type,
  user_id,
  created_at,
  updated_at
)
SELECT DISTINCT
  COALESCE(pkg.sender_name, 'Unknown Customer'),
  NULL, -- No email for package-only customers initially
  NULL, -- No phone for package-only customers initially  
  pkg.delivery_address,
  'package_only'::public.customer_type,
  NULL,
  MIN(pkg.created_at),
  NOW()
FROM public.packages pkg
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = pkg.customer_id
)
AND pkg.sender_name IS NOT NULL
AND pkg.delivery_address IS NOT NULL
GROUP BY pkg.sender_name, pkg.delivery_address;

-- Add new customer_id column to packages table
ALTER TABLE public.packages ADD COLUMN new_customer_id UUID REFERENCES public.customers(id);

-- Update packages to reference customers instead of profiles
-- For packages with existing profile references
UPDATE public.packages 
SET new_customer_id = (
  SELECT c.id 
  FROM public.customers c 
  WHERE c.user_id = packages.customer_id
)
WHERE EXISTS (
  SELECT 1 FROM public.customers c WHERE c.user_id = packages.customer_id
);

-- For packages without profile references (package-only customers)
UPDATE public.packages 
SET new_customer_id = (
  SELECT c.id 
  FROM public.customers c 
  WHERE c.customer_type = 'package_only' 
    AND c.full_name = COALESCE(packages.sender_name, 'Unknown Customer')
    AND c.address = packages.delivery_address
  LIMIT 1
)
WHERE new_customer_id IS NULL
AND sender_name IS NOT NULL 
AND delivery_address IS NOT NULL;

-- Make new_customer_id NOT NULL after migration
ALTER TABLE public.packages ALTER COLUMN new_customer_id SET NOT NULL;

-- Drop the old customer_id column and rename new_customer_id
ALTER TABLE public.packages DROP COLUMN customer_id;
ALTER TABLE public.packages RENAME COLUMN new_customer_id TO customer_id;

-- Add index for the new foreign key
CREATE INDEX idx_packages_customer_id ON public.packages(customer_id);

-- Update foreign key constraint names for clarity  
ALTER TABLE public.packages ADD CONSTRAINT packages_customer_id_fkey 
  FOREIGN KEY (customer_id) REFERENCES public.customers(id);
