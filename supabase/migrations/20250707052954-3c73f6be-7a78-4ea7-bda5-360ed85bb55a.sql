-- Add comprehensive test data for proper application testing

-- Insert additional profiles with different roles
INSERT INTO public.profiles (id, email, full_name, phone_number, address, role, push_notifications_enabled) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@yardparcel.com', 'Admin User', '+1-876-555-0001', '123 Admin St, Kingston, Jamaica', 'admin', true),
('22222222-2222-2222-2222-222222222222', 'warehouse@yardparcel.com', 'Warehouse Manager', '+1-876-555-0002', '456 Warehouse Ave, Spanish Town, Jamaica', 'warehouse', true),
('33333333-3333-3333-3333-333333333333', 'john.doe@email.com', 'John Doe', '+1-876-555-0003', '789 Customer Rd, Montego Bay, Jamaica', 'customer', false),
('44444444-4444-4444-4444-444444444444', 'jane.smith@email.com', 'Jane Smith', '+1-876-555-0004', '321 Paradise Dr, Negril, Jamaica', 'customer', true),
('55555555-5555-5555-5555-555555555555', 'mike.johnson@email.com', 'Mike Johnson', '+1-876-555-0005', '654 Beach Blvd, Ocho Rios, Jamaica', 'customer', false),
('66666666-6666-6666-6666-666666666666', 'sarah.williams@email.com', 'Sarah Williams', '+1-876-555-0006', '987 Hill View, Port Antonio, Jamaica', 'customer', true),
('77777777-7777-7777-7777-777777777777', 'guest.user@email.com', 'Guest User', '+1-876-555-0007', '147 Temp St, Kingston, Jamaica', 'customer', false);

-- Insert additional customers with various types
INSERT INTO public.customers (id, customer_type, full_name, email, phone_number, address, user_id, preferred_contact_method, notes) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'registered', 'John Doe', 'john.doe@email.com', '+1-876-555-0003', '789 Customer Rd, Montego Bay, Jamaica', '33333333-3333-3333-3333-333333333333', 'email', 'Regular customer, prefers email updates'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'registered', 'Jane Smith', 'jane.smith@email.com', '+1-876-555-0004', '321 Paradise Dr, Negril, Jamaica', '44444444-4444-4444-4444-444444444444', 'sms', 'VIP customer, fast processing requested'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'registered', 'Mike Johnson', 'mike.johnson@email.com', '+1-876-555-0005', '654 Beach Blvd, Ocho Rios, Jamaica', '55555555-5555-5555-5555-555555555555', 'email', 'Business customer, bulk packages'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'registered', 'Sarah Williams', 'sarah.williams@email.com', '+1-876-555-0006', '987 Hill View, Port Antonio, Jamaica', '66666666-6666-6666-6666-666666666666', 'phone', 'Frequent international shopper'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'guest', 'Robert Brown', 'robert.brown@email.com', '+1-876-555-0008', '258 Guest Ave, Kingston, Jamaica', NULL, 'email', 'One-time guest user'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'package_only', 'Maria Garcia', NULL, '+1-876-555-0009', '369 Package St, Spanish Town, Jamaica', NULL, 'phone', 'Package only, no account needed'),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'guest', 'David Wilson', 'david.wilson@email.com', '+1-876-555-0010', '741 Visitor Rd, Mandeville, Jamaica', NULL, 'email', 'Visiting relative, temporary address');

-- Insert multiple packages with various statuses and details
INSERT INTO public.packages (
    id, tracking_number, customer_id, description, delivery_address, sender_name, sender_address,
    weight, dimensions, package_value, duty_rate, duty_amount, total_due, carrier, external_tracking_number,
    status, date_received, estimated_delivery, notes
) VALUES
-- Recent packages
('p0000001-0001-0001-0001-000000000001', 'YP2024001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Electronics - Smartphone', '789 Customer Rd, Montego Bay, Jamaica', 'Amazon', '410 Terry Ave N, Seattle, WA', 2.5, '6x4x1 inches', 800.00, 0.15, 120.00, 120.00, 'DHL', 'DHL12345678', 'received', NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', 'High value item, handle with care'),

('p0000002-0002-0002-0002-000000000002', 'YP2024002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Clothing Bundle', '321 Paradise Dr, Negril, Jamaica', 'Nike Store', '1 Bowerman Dr, Beaverton, OR', 1.8, '12x8x4 inches', 250.00, 0.15, 37.50, 37.50, 'FedEx', 'FDX987654321', 'in_transit', NOW() - INTERVAL '5 days', NOW() + INTERVAL '2 days', 'Multiple items in one package'),

('p0000003-0003-0003-0003-000000000003', 'YP2024003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Business Supplies', '654 Beach Blvd, Ocho Rios, Jamaica', 'Office Depot', '6600 N Military Trail, Boca Raton, FL', 5.2, '16x12x8 inches', 150.00, 0.15, 22.50, 22.50, 'UPS', 'UPS111222333', 'arrived', NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 day', 'Office equipment for business'),

('p0000004-0004-0004-0004-000000000004', 'YP2024004', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Fashion Accessories', '987 Hill View, Port Antonio, Jamaica', 'Zara', '500 5th Ave, New York, NY', 0.8, '8x6x2 inches', 120.00, 0.15, 18.00, 18.00, 'DHL', 'DHL88899900', 'ready_for_pickup', NOW() - INTERVAL '3 days', NOW(), 'Designer handbag and accessories'),

('p0000005-0005-0005-0005-000000000005', 'YP2024005', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Home Goods', '258 Guest Ave, Kingston, Jamaica', 'Target', '1000 Nicollet Mall, Minneapolis, MN', 3.7, '14x10x6 inches', 85.00, 0.15, 12.75, 12.75, 'USPS', 'USPS556677889', 'picked_up', NOW() - INTERVAL '7 days', NOW() - INTERVAL '2 days', 'Kitchen appliances'),

-- Older packages for analytics
('p0000006-0006-0006-0006-000000000006', 'YP2023050', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Books Collection', '789 Customer Rd, Montego Bay, Jamaica', 'Barnes & Noble', '122 5th Ave, New York, NY', 4.2, '12x9x8 inches', 75.00, 0.15, 11.25, 11.25, 'FedEx', 'FDX445566778', 'picked_up', NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months' + INTERVAL '5 days', 'Educational textbooks'),

('p0000007-0007-0007-0007-000000000007', 'YP2023075', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Sports Equipment', '321 Paradise Dr, Negril, Jamaica', 'Dick\'s Sporting Goods', '345 Court St, Coraopolis, PA', 8.5, '24x12x6 inches', 320.00, 0.15, 48.00, 48.00, 'UPS', 'UPS223344556', 'picked_up', NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months' + INTERVAL '6 days', 'Tennis racket and accessories'),

('p0000008-0008-0008-0008-000000000008', 'YP2023100', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Computer Parts', '654 Beach Blvd, Ocho Rios, Jamaica', 'Best Buy', '7601 Penn Ave S, Richfield, MN', 6.8, '18x14x10 inches', 450.00, 0.15, 67.50, 67.50, 'DHL', 'DHL667788990', 'picked_up', NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month' + INTERVAL '4 days', 'Gaming PC components');

-- Insert invoices for some packages
INSERT INTO public.invoices (
    id, package_id, document_type, file_name, file_path, file_type, file_size,
    invoice_number, total_amount, status, uploaded_by, notes
) VALUES
('i0000001-0001-0001-0001-000000000001', 'p0000001-0001-0001-0001-000000000001', 'invoice', 'invoice_YP2024001.pdf', 'invoices/2024/01/invoice_YP2024001.pdf', 'application/pdf', 245760, 'INV-2024-000001', 120.00, 'approved', '11111111-1111-1111-1111-111111111111', 'Smartphone duty invoice'),

('i0000002-0002-0002-0002-000000000002', 'p0000002-0002-0002-0002-000000000002', 'receipt', 'receipt_YP2024002.pdf', 'receipts/2024/01/receipt_YP2024002.pdf', 'application/pdf', 198432, NULL, 37.50, 'paid', '44444444-4444-4444-4444-444444444444', 'Customer uploaded payment receipt'),

('i0000003-0003-0003-0003-000000000003', 'p0000004-0004-0004-0004-000000000004', 'invoice', 'invoice_YP2024004.pdf', 'invoices/2024/01/invoice_YP2024004.pdf', 'application/pdf', 187521, 'INV-2024-000002', 18.00, 'pending', '11111111-1111-1111-1111-111111111111', 'Fashion accessories duty invoice');

-- Insert tracking events for packages
INSERT INTO public.tracking_events (
    id, package_id, event_type, event_description, event_location, event_timestamp, carrier, raw_data
) VALUES
-- Events for YP2024001 (smartphone)
('t0000001-0001-0001-0001-000000000001', 'p0000001-0001-0001-0001-000000000001', 'pickup', 'Package picked up by carrier', 'Seattle, WA, USA', NOW() - INTERVAL '5 days', 'DHL', '{"status": "picked_up", "facility": "DHL_SEA"}'),
('t0000002-0002-0002-0002-000000000002', 'p0000001-0001-0001-0001-000000000001', 'departure', 'Departed origin facility', 'Seattle, WA, USA', NOW() - INTERVAL '4 days', 'DHL', '{"status": "in_transit", "facility": "DHL_SEA"}'),
('t0000003-0003-0003-0003-000000000003', 'p0000001-0001-0001-0001-000000000001', 'arrival', 'Arrived at Miami facility', 'Miami, FL, USA', NOW() - INTERVAL '3 days', 'DHL', '{"status": "arrived", "facility": "DHL_MIA"}'),
('t0000004-0004-0004-0004-000000000004', 'p0000001-0001-0001-0001-000000000001', 'received', 'Received at YardParcel Miami', 'Miami, FL, USA', NOW() - INTERVAL '2 days', 'YardParcel', '{"status": "received", "facility": "YP_MIA"}'),

-- Events for YP2024004 (ready for pickup)
('t0000005-0005-0005-0005-000000000005', 'p0000004-0004-0004-0004-000000000004', 'pickup', 'Package picked up by carrier', 'New York, NY, USA', NOW() - INTERVAL '7 days', 'DHL', '{"status": "picked_up", "facility": "DHL_NYC"}'),
('t0000006-0006-0006-0006-000000000006', 'p0000004-0004-0004-0004-000000000004', 'arrival', 'Arrived in Jamaica', 'Kingston, Jamaica', NOW() - INTERVAL '4 days', 'DHL', '{"status": "arrived", "facility": "DHL_KIN"}'),
('t0000007-0007-0007-0007-000000000007', 'p0000004-0004-0004-0004-000000000004', 'ready', 'Ready for customer pickup', 'Kingston, Jamaica', NOW() - INTERVAL '3 days', 'YardParcel', '{"status": "ready_for_pickup", "facility": "YP_KIN"}');

-- Insert pickup verification methods
INSERT INTO public.pickup_verification_methods (
    id, name, description, requires_code, requires_photo, requires_signature, is_active
) VALUES
('v0000001-0001-0001-0001-000000000001', 'Photo ID', 'Verify identity with government-issued photo ID', false, true, false, true),
('v0000002-0002-0002-0002-000000000002', 'SMS Code', 'Send verification code via SMS', true, false, false, true),
('v0000003-0003-0003-0003-000000000003', 'Signature + ID', 'Require signature and photo ID verification', false, true, true, true),
('v0000004-0004-0004-0004-000000000004', 'Digital Signature', 'Electronic signature on mobile device', false, false, true, true);

-- Insert pickup records for completed packages
INSERT INTO public.package_pickup_records (
    id, package_id, verification_method_id, pickup_person_name, pickup_person_phone,
    pickup_person_relationship, pickup_timestamp, verification_successful, package_condition,
    customer_satisfied, authorized_by_staff, pickup_notes
) VALUES
('r0000001-0001-0001-0001-000000000001', 'p0000005-0005-0005-0005-000000000005', 'v0000001-0001-0001-0001-000000000001', 'Guest User', '+1-876-555-0007', 'self', NOW() - INTERVAL '2 days', true, 'good', true, '22222222-2222-2222-2222-222222222222', 'Package delivered in perfect condition'),

('r0000002-0002-0002-0002-000000000002', 'p0000006-0006-0006-0006-000000000006', 'v0000003-0003-0003-0003-000000000003', 'John Doe', '+1-876-555-0003', 'self', NOW() - INTERVAL '2 months' + INTERVAL '5 days', true, 'good', true, '22222222-2222-2222-2222-222222222222', 'Books delivered safely');

-- Insert notifications for package updates
INSERT INTO public.notifications (
    id, user_id, package_id, type, recipient, subject, message, sent_at
) VALUES
('n0000001-0001-0001-0001-000000000001', '33333333-3333-3333-3333-333333333333', 'p0000001-0001-0001-0001-000000000001', 'email', 'john.doe@email.com', 'Package YP2024001 Received', 'Your package containing Electronics - Smartphone has been received at our Miami facility.', NOW() - INTERVAL '2 days'),

('n0000002-0002-0002-0002-000000000002', '44444444-4444-4444-4444-444444444444', 'p0000002-0002-0002-0002-000000000002', 'email', 'jane.smith@email.com', 'Package YP2024002 In Transit', 'Your package containing Clothing Bundle is currently in transit to Jamaica.', NOW() - INTERVAL '1 day'),

('n0000003-0003-0003-0003-000000000003', '66666666-6666-6666-6666-666666666666', 'p0000004-0004-0004-0004-000000000004', 'email', 'sarah.williams@email.com', 'Package YP2024004 Ready for Pickup', 'Your package containing Fashion Accessories is ready for pickup at our Kingston location.', NOW() - INTERVAL '3 days');

-- Insert email templates for automated notifications
INSERT INTO public.email_templates (
    id, template_name, subject, html_content, text_content, is_active
) VALUES
('e0000001-0001-0001-0001-000000000001', 'package_received', 'Package {{tracking_number}} Received', '<h2>Package Received</h2><p>Your package <strong>{{tracking_number}}</strong> containing {{description}} has been received at our facility.</p><p>Estimated delivery: {{estimated_delivery}}</p>', 'Package {{tracking_number}} containing {{description}} has been received. Estimated delivery: {{estimated_delivery}}', true),

('e0000002-0002-0002-0002-000000000002', 'package_ready', 'Package {{tracking_number}} Ready for Pickup', '<h2>Ready for Pickup</h2><p>Your package <strong>{{tracking_number}}</strong> is ready for pickup at our {{location}} location.</p><p>Please bring valid ID for verification.</p>', 'Package {{tracking_number}} is ready for pickup at {{location}}. Please bring valid ID.', true),

('e0000003-0003-0003-0003-000000000003', 'invoice_due', 'Invoice Due for Package {{tracking_number}}', '<h2>Invoice Payment Required</h2><p>Payment of ${{amount}} is required for package {{tracking_number}}.</p><p>Please pay online or at pickup.</p>', 'Payment of ${{amount}} is required for package {{tracking_number}}. Pay online or at pickup.', true);

-- Insert API configurations for carrier integrations
INSERT INTO public.api_configurations (
    id, carrier, api_key_name, base_url, is_active, rate_limit_per_minute
) VALUES
('a0000001-0001-0001-0001-000000000001', 'DHL', 'DHL_API_KEY', 'https://api-eu.dhl.com/track/shipments', true, 100),
('a0000002-0002-0002-0002-000000000002', 'FedEx', 'FEDEX_API_KEY', 'https://apis.fedex.com/track/v1/trackingnumbers', true, 150),
('a0000003-0003-0003-0003-000000000003', 'UPS', 'UPS_API_KEY', 'https://onlinetools.ups.com/api/track/v1/details', true, 120),
('a0000004-0004-0004-0004-000000000004', 'USPS', 'USPS_API_KEY', 'https://secure.shippingapis.com/ShippingAPI.dll', true, 80);

-- Insert additional system settings
INSERT INTO public.system_settings (
    id, setting_key, setting_value, setting_type, display_name, description, category, is_public
) VALUES
('s0000002-0002-0002-0002-000000000002', 'default_duty_rate', '0.15', 'number', 'Default Duty Rate', 'Default duty rate percentage applied to packages', 'financial', false),
('s0000003-0003-0003-0003-000000000003', 'max_package_weight', '50', 'number', 'Maximum Package Weight (lbs)', 'Maximum weight allowed per package in pounds', 'operations', true),
('s0000004-0004-0004-0004-000000000004', 'pickup_hours', '9:00 AM - 5:00 PM', 'text', 'Pickup Hours', 'Business hours for package pickup', 'operations', true),
('s0000005-0005-0005-0005-000000000005', 'notification_from_email', 'notifications@yardparcel.com', 'email', 'Notification From Email', 'Email address used for sending notifications', 'notifications', false),
('s0000006-0006-0006-0006-000000000006', 'currency_symbol', 'USD', 'text', 'Currency Symbol', 'Currency used for pricing and invoicing', 'financial', true),
('s0000007-0007-0007-0007-000000000007', 'auto_notification_enabled', 'true', 'boolean', 'Auto Notifications Enabled', 'Enable automatic status update notifications', 'notifications', false);

-- Insert Magaya auto-sync configuration
INSERT INTO public.magaya_auto_sync_config (
    id, is_enabled, sync_on_status_changes, retry_attempts, retry_delay_seconds
) VALUES
('m0000001-0001-0001-0001-000000000001', true, ARRAY['arrived', 'ready_for_pickup', 'picked_up'], 3, 30);