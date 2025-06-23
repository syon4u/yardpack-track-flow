
-- First, let's identify and clean up any packages that reference non-existent profiles
DELETE FROM public.packages 
WHERE customer_id NOT IN (SELECT id FROM public.profiles);

-- Now we can safely proceed with the enum update
-- First, remove the default value completely
ALTER TABLE public.packages ALTER COLUMN status DROP DEFAULT;

-- Update any existing 'completed' records to 'ready_for_pickup' temporarily
UPDATE public.packages SET status = 'ready_for_pickup' WHERE status = 'completed';

-- Now we can safely update the enum
ALTER TYPE public.package_status RENAME TO package_status_old;

CREATE TYPE public.package_status AS ENUM ('received', 'in_transit', 'arrived', 'ready_for_pickup', 'picked_up');

-- Update the packages table to use the new enum
ALTER TABLE public.packages ALTER COLUMN status TYPE package_status USING status::text::package_status;

-- Now update those records we temporarily changed to the new 'picked_up' status
UPDATE public.packages SET status = 'picked_up' WHERE status = 'ready_for_pickup' AND updated_at < NOW() - INTERVAL '1 minute';

-- Set the default value back with the new enum type
ALTER TABLE public.packages ALTER COLUMN status SET DEFAULT 'received'::package_status;

-- Drop the old enum type
DROP TYPE package_status_old;
