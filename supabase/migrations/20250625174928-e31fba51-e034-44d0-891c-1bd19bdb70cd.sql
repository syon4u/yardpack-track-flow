
-- Remove the outdated foreign key constraint on packages.customer_id that references profiles
-- This ensures single-customer ownership through the customers table only
ALTER TABLE public.packages 
DROP CONSTRAINT IF EXISTS packages_customer_id_fkey;

-- Ensure the correct foreign key constraint exists (to customers table)
-- This should already exist from previous migrations, but we'll ensure it's there
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_packages_customer_id' 
        AND table_name = 'packages'
    ) THEN
        ALTER TABLE public.packages 
        ADD CONSTRAINT fk_packages_customer_id 
        FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;
    END IF;
END $$;
