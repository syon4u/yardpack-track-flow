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

('p0000007-0007-0007-0007-000000000007', 'YP2023075', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Sports Equipment', '321 Paradise Dr, Negril, Jamaica', 'Dicks Sporting Goods', '345 Court St, Coraopolis, PA', 8.5, '24x12x6 inches', 320.00, 0.15, 48.00, 48.00, 'UPS', 'UPS223344556', 'picked_up', NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months' + INTERVAL '6 days', 'Tennis racket and accessories'),

('p0000008-0008-0008-0008-000000000008', 'YP2023100', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Computer Parts', '654 Beach Blvd, Ocho Rios, Jamaica', 'Best Buy', '7601 Penn Ave S, Richfield, MN', 6.8, '18x14x10 inches', 450.00, 0.15, 67.50, 67.50, 'DHL', 'DHL667788990', 'picked_up', NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month' + INTERVAL '4 days', 'Gaming PC components');