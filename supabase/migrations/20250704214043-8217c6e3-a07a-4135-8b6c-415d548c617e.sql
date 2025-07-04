-- Create database functions for advanced analytics

-- Function to calculate Customer Lifetime Value (CLV)
CREATE OR REPLACE FUNCTION calculate_customer_clv()
RETURNS TABLE (
  customerId uuid,
  customerName text,
  totalSpent numeric,
  packageCount bigint,
  avgPackageValue numeric,
  firstOrderDate timestamp with time zone,
  lastOrderDate timestamp with time zone,
  customerTenureMonths numeric,
  clvScore numeric,
  segment text,
  predictedValue numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH customer_metrics AS (
    SELECT 
      c.id as customer_id,
      c.full_name as customer_name,
      COALESCE(SUM(p.total_due), 0) as total_spent,
      COUNT(p.id) as package_count,
      COALESCE(AVG(p.total_due), 0) as avg_package_value,
      MIN(p.date_received) as first_order_date,
      MAX(p.date_received) as last_order_date,
      EXTRACT(EPOCH FROM (GREATEST(MAX(p.date_received), NOW()) - MIN(p.date_received))) / (30.44 * 24 * 3600) as tenure_months
    FROM customers c
    LEFT JOIN packages p ON c.id = p.customer_id
    WHERE p.total_due IS NOT NULL AND p.total_due > 0
    GROUP BY c.id, c.full_name
    HAVING COUNT(p.id) > 0
  ),
  clv_calculations AS (
    SELECT 
      *,
      -- CLV = (Average Order Value × Purchase Frequency × Customer Lifespan)
      CASE 
        WHEN tenure_months > 0 
        THEN (avg_package_value * (package_count / GREATEST(tenure_months, 1)) * 12) * 2
        ELSE avg_package_value * package_count
      END as clv_score,
      -- Predicted future value based on current trends
      CASE 
        WHEN tenure_months > 6 
        THEN total_spent * 1.5
        ELSE total_spent * 2
      END as predicted_value
    FROM customer_metrics
  )
  SELECT 
    customer_id,
    customer_name,
    total_spent,
    package_count,
    avg_package_value,
    first_order_date,
    last_order_date,
    tenure_months,
    clv_score,
    CASE 
      WHEN clv_score >= 1000 THEN 'high'
      WHEN clv_score >= 500 THEN 'medium'
      ELSE 'low'
    END as segment,
    predicted_value
  FROM clv_calculations
  ORDER BY clv_score DESC;
END;
$$;

-- Function for seasonal demand analysis
CREATE OR REPLACE FUNCTION get_seasonal_demand_analysis()
RETURNS TABLE (
  month text,
  year integer,
  packageCount bigint,
  totalValue numeric,
  avgValue numeric,
  trend text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH monthly_data AS (
    SELECT 
      TO_CHAR(date_received, 'Month') as month_name,
      EXTRACT(YEAR FROM date_received)::integer as year_val,
      EXTRACT(MONTH FROM date_received) as month_num,
      COUNT(*) as package_count,
      COALESCE(SUM(total_due), 0) as total_value,
      COALESCE(AVG(total_due), 0) as avg_value
    FROM packages 
    WHERE date_received >= NOW() - INTERVAL '24 months'
      AND total_due IS NOT NULL
    GROUP BY 
      TO_CHAR(date_received, 'Month'),
      EXTRACT(YEAR FROM date_received),
      EXTRACT(MONTH FROM date_received)
  ),
  trend_analysis AS (
    SELECT 
      *,
      LAG(package_count, 1) OVER (ORDER BY year_val, month_num) as prev_count
    FROM monthly_data
  )
  SELECT 
    month_name,
    year_val,
    package_count,
    total_value,
    avg_value,
    CASE 
      WHEN prev_count IS NULL THEN 'stable'
      WHEN package_count > prev_count * 1.1 THEN 'increasing'
      WHEN package_count < prev_count * 0.9 THEN 'decreasing'
      ELSE 'stable'
    END as trend
  FROM trend_analysis
  ORDER BY year_val DESC, month_num DESC
  LIMIT 24;
END;
$$;

-- Function for customer segmentation
CREATE OR REPLACE FUNCTION get_customer_segmentation()
RETURNS TABLE (
  segment text,
  customerCount bigint,
  totalValue numeric,
  avgClv numeric,
  percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH clv_data AS (
    SELECT * FROM calculate_customer_clv()
  ),
  segment_stats AS (
    SELECT 
      segment,
      COUNT(*) as customer_count,
      SUM(totalSpent) as total_value,
      AVG(clvScore) as avg_clv
    FROM clv_data
    GROUP BY segment
  ),
  total_customers AS (
    SELECT COUNT(*) as total FROM clv_data
  )
  SELECT 
    s.segment,
    s.customer_count,
    s.total_value,
    s.avg_clv,
    (s.customer_count * 100.0 / t.total) as percentage
  FROM segment_stats s
  CROSS JOIN total_customers t
  ORDER BY s.avg_clv DESC;
END;
$$;