
-- Create the missing check_duplicate_customers function
CREATE OR REPLACE FUNCTION public.check_duplicate_customers()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::integer
  FROM (
    SELECT user_id
    FROM public.customers
    WHERE user_id IS NOT NULL
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) duplicate_users;
$$;
