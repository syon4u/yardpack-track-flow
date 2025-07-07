-- Performance optimization indexes for YardPack
-- These indexes will significantly improve query performance for common operations

-- Packages table indexes
CREATE INDEX IF NOT EXISTS idx_packages_customer_id ON packages(customer_id);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_date_received ON packages(date_received DESC);
CREATE INDEX IF NOT EXISTS idx_packages_tracking_number ON packages(tracking_number);
CREATE INDEX IF NOT EXISTS idx_packages_status_customer ON packages(status, customer_id);
CREATE INDEX IF NOT EXISTS idx_packages_magaya_shipment ON packages(magaya_shipment_id) WHERE magaya_shipment_id IS NOT NULL;

-- Customers table indexes
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_customer_number ON customers(customer_number);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(customer_type);

-- Invoices table indexes
CREATE INDEX IF NOT EXISTS idx_invoices_package_id ON invoices(package_id);
CREATE INDEX IF NOT EXISTS idx_invoices_uploaded_by ON invoices(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_uploaded_at ON invoices(uploaded_at DESC);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_package_id ON notifications(package_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Tracking events table indexes
CREATE INDEX IF NOT EXISTS idx_tracking_events_package_id ON tracking_events(package_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_timestamp ON tracking_events(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_events_carrier ON tracking_events(carrier);

-- Package pickup records indexes
CREATE INDEX IF NOT EXISTS idx_pickup_records_package_id ON package_pickup_records(package_id);
CREATE INDEX IF NOT EXISTS idx_pickup_records_timestamp ON package_pickup_records(pickup_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_pickup_records_authorized_by ON package_pickup_records(authorized_by_staff);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_packages_customer_status_date ON packages(customer_id, status, date_received DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, created_at DESC) WHERE sent_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_package_status ON invoices(package_id, status);

-- Optimize text search for tracking numbers and descriptions
CREATE INDEX IF NOT EXISTS idx_packages_tracking_text ON packages USING gin(to_tsvector('english', tracking_number || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_customers_name_text ON customers USING gin(to_tsvector('english', full_name));

-- Update table statistics for better query planning
ANALYZE packages;
ANALYZE customers;
ANALYZE invoices;
ANALYZE notifications;
ANALYZE tracking_events;
ANALYZE package_pickup_records;