-- Add supporting data: invoices, notifications, settings, and operational data

-- Get some package IDs for invoices and notifications
DO $$
DECLARE
    pkg_ids UUID[];
    first_profile_id UUID;
BEGIN
    -- Get package IDs
    SELECT ARRAY(SELECT id FROM packages ORDER BY created_at DESC LIMIT 5) INTO pkg_ids;
    
    -- Get first profile ID for system operations
    SELECT id INTO first_profile_id FROM profiles LIMIT 1;
    
    -- Insert invoices for some packages
    INSERT INTO public.invoices (
        package_id, document_type, file_name, file_path, file_type, file_size,
        invoice_number, total_amount, status, uploaded_by, notes
    ) VALUES
    (pkg_ids[1], 'invoice', 'invoice_smartphone.pdf', 'invoices/2025/01/invoice_smartphone.pdf', 'application/pdf', 245760, 'INV-2025-000001', 120.00, 'approved', first_profile_id, 'Smartphone duty invoice'),
    (pkg_ids[2], 'receipt', 'receipt_clothing.pdf', 'receipts/2025/01/receipt_clothing.pdf', 'application/pdf', 198432, NULL, 37.50, 'paid', first_profile_id, 'Customer payment receipt'),
    (pkg_ids[3], 'invoice', 'invoice_business.pdf', 'invoices/2025/01/invoice_business.pdf', 'application/pdf', 187521, 'INV-2025-000002', 22.50, 'pending', first_profile_id, 'Business supplies duty invoice'),
    (pkg_ids[4], 'invoice', 'invoice_fashion.pdf', 'invoices/2025/01/invoice_fashion.pdf', 'application/pdf', 156789, 'INV-2025-000003', 18.00, 'approved', first_profile_id, 'Fashion accessories invoice');

    -- Insert tracking events for packages
    INSERT INTO public.tracking_events (
        package_id, event_type, event_description, event_location, event_timestamp, carrier, raw_data
    ) VALUES
    -- Events for smartphone package
    (pkg_ids[1], 'pickup', 'Package picked up by carrier', 'Seattle, WA, USA', NOW() - INTERVAL '5 days', 'DHL', '{"status": "picked_up", "facility": "DHL_SEA"}'),
    (pkg_ids[1], 'departure', 'Departed origin facility', 'Seattle, WA, USA', NOW() - INTERVAL '4 days', 'DHL', '{"status": "in_transit", "facility": "DHL_SEA"}'),
    (pkg_ids[1], 'arrival', 'Arrived at Miami facility', 'Miami, FL, USA', NOW() - INTERVAL '3 days', 'DHL', '{"status": "arrived", "facility": "DHL_MIA"}'),
    (pkg_ids[1], 'received', 'Received at YardParcel Miami', 'Miami, FL, USA', NOW() - INTERVAL '2 days', 'YardParcel', '{"status": "received", "facility": "YP_MIA"}'),
    
    -- Events for ready for pickup package
    (pkg_ids[4], 'pickup', 'Package picked up by carrier', 'New York, NY, USA', NOW() - INTERVAL '7 days', 'DHL', '{"status": "picked_up", "facility": "DHL_NYC"}'),
    (pkg_ids[4], 'arrival', 'Arrived in Jamaica', 'Kingston, Jamaica', NOW() - INTERVAL '4 days', 'DHL', '{"status": "arrived", "facility": "DHL_KIN"}'),
    (pkg_ids[4], 'ready', 'Ready for customer pickup', 'Kingston, Jamaica', NOW() - INTERVAL '3 days', 'YardParcel', '{"status": "ready_for_pickup", "facility": "YP_KIN"}');

    -- Insert notifications for package updates (using first profile as user)
    INSERT INTO public.notifications (
        user_id, package_id, type, recipient, subject, message, sent_at
    ) VALUES
    (first_profile_id, pkg_ids[1], 'email', 'john.doe@email.com', 'Package YP2024001 Received', 'Your package containing Electronics - Smartphone has been received at our Miami facility.', NOW() - INTERVAL '2 days'),
    (first_profile_id, pkg_ids[2], 'email', 'jane.smith@email.com', 'Package YP2024002 In Transit', 'Your package containing Clothing Bundle is currently in transit to Jamaica.', NOW() - INTERVAL '1 day'),
    (first_profile_id, pkg_ids[4], 'email', 'sarah.williams@email.com', 'Package YP2024004 Ready for Pickup', 'Your package containing Fashion Accessories is ready for pickup at our Kingston location.', NOW() - INTERVAL '3 days');
END $$;

-- Insert pickup verification methods
INSERT INTO public.pickup_verification_methods (
    name, description, requires_code, requires_photo, requires_signature, is_active
) VALUES
('Photo ID', 'Verify identity with government-issued photo ID', false, true, false, true),
('SMS Code', 'Send verification code via SMS', true, false, false, true),
('Signature + ID', 'Require signature and photo ID verification', false, true, true, true),
('Digital Signature', 'Electronic signature on mobile device', false, false, true, true);

-- Insert email templates for automated notifications
INSERT INTO public.email_templates (
    template_name, subject, html_content, text_content, is_active
) VALUES
('package_received', 'Package {{tracking_number}} Received', '<h2>Package Received</h2><p>Your package <strong>{{tracking_number}}</strong> containing {{description}} has been received at our facility.</p><p>Estimated delivery: {{estimated_delivery}}</p>', 'Package {{tracking_number}} containing {{description}} has been received. Estimated delivery: {{estimated_delivery}}', true),
('package_ready', 'Package {{tracking_number}} Ready for Pickup', '<h2>Ready for Pickup</h2><p>Your package <strong>{{tracking_number}}</strong> is ready for pickup at our {{location}} location.</p><p>Please bring valid ID for verification.</p>', 'Package {{tracking_number}} is ready for pickup at {{location}}. Please bring valid ID.', true),
('invoice_due', 'Invoice Due for Package {{tracking_number}}', '<h2>Invoice Payment Required</h2><p>Payment of ${{amount}} is required for package {{tracking_number}}.</p><p>Please pay online or at pickup.</p>', 'Payment of ${{amount}} is required for package {{tracking_number}}. Pay online or at pickup.', true),
('package_delivered', 'Package {{tracking_number}} Delivered', '<h2>Package Delivered</h2><p>Your package <strong>{{tracking_number}}</strong> has been successfully delivered.</p><p>Thank you for using YardParcel!</p>', 'Package {{tracking_number}} has been delivered. Thank you for using YardParcel!', true);

-- Insert API configurations for carrier integrations
INSERT INTO public.api_configurations (
    carrier, api_key_name, base_url, is_active, rate_limit_per_minute
) VALUES
('DHL', 'DHL_API_KEY', 'https://api-eu.dhl.com/track/shipments', true, 100),
('FedEx', 'FEDEX_API_KEY', 'https://apis.fedex.com/track/v1/trackingnumbers', true, 150),
('UPS', 'UPS_API_KEY', 'https://onlinetools.ups.com/api/track/v1/details', true, 120),
('USPS', 'USPS_API_KEY', 'https://secure.shippingapis.com/ShippingAPI.dll', true, 80);

-- Insert additional system settings
INSERT INTO public.system_settings (
    setting_key, setting_value, setting_type, display_name, description, category, is_public
) VALUES
('default_duty_rate', '0.15', 'number', 'Default Duty Rate', 'Default duty rate percentage applied to packages', 'financial', false),
('max_package_weight', '50', 'number', 'Maximum Package Weight (lbs)', 'Maximum weight allowed per package in pounds', 'operations', true),
('pickup_hours', '9:00 AM - 5:00 PM', 'text', 'Pickup Hours', 'Business hours for package pickup', 'operations', true),
('notification_from_email', 'notifications@yardparcel.com', 'email', 'Notification From Email', 'Email address used for sending notifications', 'notifications', false),
('currency_symbol', 'USD', 'text', 'Currency Symbol', 'Currency used for pricing and invoicing', 'financial', true),
('auto_notification_enabled', 'true', 'boolean', 'Auto Notifications Enabled', 'Enable automatic status update notifications', 'notifications', false),
('warehouse_locations', 'Kingston,Spanish Town,Montego Bay', 'text', 'Warehouse Locations', 'Available pickup locations', 'operations', true),
('max_pickup_days', '30', 'number', 'Maximum Pickup Days', 'Days after which unclaimed packages are returned', 'operations', false),
('minimum_package_value', '5.00', 'number', 'Minimum Package Value', 'Minimum value for duty calculation', 'financial', false);

-- Insert Magaya auto-sync configuration
INSERT INTO public.magaya_auto_sync_config (
    is_enabled, sync_on_status_changes, retry_attempts, retry_delay_seconds
) VALUES
(true, ARRAY['arrived', 'ready_for_pickup', 'picked_up'], 3, 30);