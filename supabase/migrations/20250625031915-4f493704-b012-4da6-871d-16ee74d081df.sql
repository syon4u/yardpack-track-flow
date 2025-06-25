
-- Step 1: Clean up orphaned data
-- Delete orphaned packages that reference non-existent customers
DELETE FROM public.packages 
WHERE customer_id NOT IN (SELECT id FROM public.customers);

-- Delete any orphaned invoices that might reference deleted packages
DELETE FROM public.invoices 
WHERE package_id NOT IN (SELECT id FROM public.packages);

-- Delete any orphaned tracking events that might reference deleted packages
DELETE FROM public.tracking_events 
WHERE package_id NOT IN (SELECT id FROM public.packages);

-- Delete any orphaned notifications that might reference deleted packages
DELETE FROM public.notifications 
WHERE package_id IS NOT NULL AND package_id NOT IN (SELECT id FROM public.packages);

-- Step 2: Add Foreign Key Constraints
-- Add FK constraint: packages.customer_id → customers.id
ALTER TABLE public.packages 
ADD CONSTRAINT fk_packages_customer_id 
FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;

-- Add FK constraint: invoices.package_id → packages.id
ALTER TABLE public.invoices 
ADD CONSTRAINT fk_invoices_package_id 
FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE CASCADE;

-- Add FK constraint: invoices.uploaded_by → profiles.id
ALTER TABLE public.invoices 
ADD CONSTRAINT fk_invoices_uploaded_by 
FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add FK constraint: notifications.user_id → profiles.id
ALTER TABLE public.notifications 
ADD CONSTRAINT fk_notifications_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add FK constraint: notifications.package_id → packages.id (optional reference)
ALTER TABLE public.notifications 
ADD CONSTRAINT fk_notifications_package_id 
FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE SET NULL;

-- Add FK constraint: tracking_events.package_id → packages.id
ALTER TABLE public.tracking_events 
ADD CONSTRAINT fk_tracking_events_package_id 
FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE CASCADE;

-- Add FK constraint: customers.user_id → profiles.id (for registered customers)
ALTER TABLE public.customers 
ADD CONSTRAINT fk_customers_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Step 3: Add Essential Indexes
-- Index on packages.customer_id (most queried relationship)
CREATE INDEX IF NOT EXISTS idx_packages_customer_id ON public.packages(customer_id);

-- Index on packages.status (for filtering)
CREATE INDEX IF NOT EXISTS idx_packages_status ON public.packages(status);

-- Index on packages.tracking_number (for lookups)
CREATE INDEX IF NOT EXISTS idx_packages_tracking_number ON public.packages(tracking_number);

-- Index on customers.user_id (for user-customer mapping)
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);

-- Index on invoices.package_id (for package-invoice queries)
CREATE INDEX IF NOT EXISTS idx_invoices_package_id ON public.invoices(package_id);

-- Index on notifications.user_id (for user notifications)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- Index on tracking_events.package_id (for package tracking history)
CREATE INDEX IF NOT EXISTS idx_tracking_events_package_id ON public.tracking_events(package_id);

-- Step 4: Add Basic Data Validation
-- Add check constraint for positive package values
ALTER TABLE public.packages 
ADD CONSTRAINT chk_packages_positive_value 
CHECK (package_value IS NULL OR package_value >= 0);

-- Add check constraint for positive duty amounts
ALTER TABLE public.packages 
ADD CONSTRAINT chk_packages_positive_duty 
CHECK (duty_amount IS NULL OR duty_amount >= 0);

-- Add check constraint for positive total due
ALTER TABLE public.packages 
ADD CONSTRAINT chk_packages_positive_total_due 
CHECK (total_due IS NULL OR total_due >= 0);

-- Add check constraint for positive weight
ALTER TABLE public.packages 
ADD CONSTRAINT chk_packages_positive_weight 
CHECK (weight IS NULL OR weight >= 0);

-- Add check constraint for duty rate between 0 and 1 (0% to 100%)
ALTER TABLE public.packages 
ADD CONSTRAINT chk_packages_duty_rate_range 
CHECK (duty_rate IS NULL OR (duty_rate >= 0 AND duty_rate <= 1));

-- Add check constraint for valid email format in customers table
ALTER TABLE public.customers 
ADD CONSTRAINT chk_customers_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add check constraint for valid email format in profiles table
ALTER TABLE public.profiles 
ADD CONSTRAINT chk_profiles_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add check constraint for positive file sizes
ALTER TABLE public.invoices 
ADD CONSTRAINT chk_invoices_positive_file_size 
CHECK (file_size IS NULL OR file_size >= 0);
