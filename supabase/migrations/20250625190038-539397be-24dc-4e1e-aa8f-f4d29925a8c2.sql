
-- Temporarily disable RLS on all affected tables for testing
-- This will bypass all Row Level Security checks

-- Disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on packages table
ALTER TABLE public.packages DISABLE ROW LEVEL SECURITY;

-- Disable RLS on customers table
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;

-- Disable RLS on other related tables that might have RLS enabled
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_configurations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
