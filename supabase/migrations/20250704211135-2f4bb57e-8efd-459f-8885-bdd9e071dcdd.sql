-- Phase 1: Database Performance Optimization - Add essential indexes for better query performance

-- Create indexes for frequently queried columns in packages table
CREATE INDEX IF NOT EXISTS idx_packages_customer_id ON public.packages(customer_id);
CREATE INDEX IF NOT EXISTS idx_packages_status ON public.packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_tracking_number ON public.packages(tracking_number);
CREATE INDEX IF NOT EXISTS idx_packages_created_at ON public.packages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_packages_status_created_at ON public.packages(status, created_at DESC);

-- Create indexes for customers table
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_customer_number ON public.customers(customer_number);

-- Create indexes for invoices table
CREATE INDEX IF NOT EXISTS idx_invoices_package_id ON public.invoices(package_id);
CREATE INDEX IF NOT EXISTS idx_invoices_uploaded_by ON public.invoices(uploaded_by);

-- Create indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_package_id ON public.notifications(package_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);