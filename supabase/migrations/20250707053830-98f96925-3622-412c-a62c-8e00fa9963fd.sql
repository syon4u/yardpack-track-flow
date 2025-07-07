-- Add test data with guest and package_only customers (no user_id required)

-- Insert customers with types that don't require user_id
INSERT INTO public.customers (customer_type, full_name, email, phone_number, address, preferred_contact_method, notes) VALUES
('guest', 'John Doe', 'john.doe@email.com', '+1-876-555-0003', '789 Customer Rd, Montego Bay, Jamaica', 'email', 'Regular guest customer, prefers email updates'),
('guest', 'Jane Smith', 'jane.smith@email.com', '+1-876-555-0004', '321 Paradise Dr, Negril, Jamaica', 'sms', 'VIP guest customer, fast processing requested'),
('package_only', 'Mike Johnson', NULL, '+1-876-555-0005', '654 Beach Blvd, Ocho Rios, Jamaica', 'phone', 'Business customer, bulk packages'),
('guest', 'Sarah Williams', 'sarah.williams@email.com', '+1-876-555-0006', '987 Hill View, Port Antonio, Jamaica', 'phone', 'Frequent international shopper'),
('guest', 'Robert Brown', 'robert.brown@email.com', '+1-876-555-0008', '258 Guest Ave, Kingston, Jamaica', 'email', 'One-time guest user'),
('package_only', 'Maria Garcia', NULL, '+1-876-555-0009', '369 Package St, Spanish Town, Jamaica', 'phone', 'Package only, no account needed'),
('guest', 'David Wilson', 'david.wilson@email.com', '+1-876-555-0010', '741 Visitor Rd, Mandeville, Jamaica', 'email', 'Visiting relative, temporary address'),
('package_only', 'Lisa Anderson', NULL, '+1-876-555-0011', '852 Commerce St, Kingston, Jamaica', 'phone', 'Corporate packages only'),
('guest', 'Carlos Rodriguez', 'carlos.r@email.com', '+1-876-555-0012', '963 Harbor View, Port Royal, Jamaica', 'email', 'Tourist, temporary stay');

-- Get the customer IDs for package assignment
DO $$
DECLARE
    customer_ids UUID[];
    package_counter INTEGER := 1;
BEGIN
    -- Get all customer IDs into an array
    SELECT ARRAY(SELECT id FROM customers ORDER BY created_at DESC LIMIT 9) INTO customer_ids;
    
    -- Insert packages for each customer
    INSERT INTO public.packages (
        tracking_number, customer_id, description, delivery_address, sender_name, sender_address,
        weight, dimensions, package_value, duty_rate, duty_amount, total_due, carrier, external_tracking_number,
        status, date_received, estimated_delivery, notes
    ) VALUES
    ('YP2024001', customer_ids[1], 'Electronics - Smartphone', '789 Customer Rd, Montego Bay, Jamaica', 'Amazon', '410 Terry Ave N, Seattle, WA', 2.5, '6x4x1 inches', 800.00, 0.15, 120.00, 120.00, 'DHL', 'DHL12345678', 'received', NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', 'High value item, handle with care'),
    ('YP2024002', customer_ids[2], 'Clothing Bundle', '321 Paradise Dr, Negril, Jamaica', 'Nike Store', '1 Bowerman Dr, Beaverton, OR', 1.8, '12x8x4 inches', 250.00, 0.15, 37.50, 37.50, 'FedEx', 'FDX987654321', 'in_transit', NOW() - INTERVAL '5 days', NOW() + INTERVAL '2 days', 'Multiple items in one package'),
    ('YP2024003', customer_ids[3], 'Business Supplies', '654 Beach Blvd, Ocho Rios, Jamaica', 'Office Depot', '6600 N Military Trail, Boca Raton, FL', 5.2, '16x12x8 inches', 150.00, 0.15, 22.50, 22.50, 'UPS', 'UPS111222333', 'arrived', NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 day', 'Office equipment for business'),
    ('YP2024004', customer_ids[4], 'Fashion Accessories', '987 Hill View, Port Antonio, Jamaica', 'Zara', '500 5th Ave, New York, NY', 0.8, '8x6x2 inches', 120.00, 0.15, 18.00, 18.00, 'DHL', 'DHL88899900', 'ready_for_pickup', NOW() - INTERVAL '3 days', NOW(), 'Designer handbag and accessories'),
    ('YP2024005', customer_ids[5], 'Home Goods', '258 Guest Ave, Kingston, Jamaica', 'Target', '1000 Nicollet Mall, Minneapolis, MN', 3.7, '14x10x6 inches', 85.00, 0.15, 12.75, 12.75, 'USPS', 'USPS556677889', 'picked_up', NOW() - INTERVAL '7 days', NOW() - INTERVAL '2 days', 'Kitchen appliances'),
    ('YP2024006', customer_ids[6], 'Personal Care Items', '369 Package St, Spanish Town, Jamaica', 'CVS Pharmacy', '1 CVS Dr, Woonsocket, RI', 1.2, '8x6x3 inches', 45.00, 0.15, 6.75, 6.75, 'USPS', 'USPS123456789', 'in_transit', NOW() - INTERVAL '3 days', NOW() + INTERVAL '3 days', 'Health and beauty products'),
    ('YP2024007', customer_ids[7], 'Automotive Parts', '741 Visitor Rd, Mandeville, Jamaica', 'AutoZone', '123 S Front St, Memphis, TN', 12.5, '20x16x8 inches', 180.00, 0.15, 27.00, 27.00, 'UPS', 'UPS987654321', 'arrived', NOW() - INTERVAL '2 days', NOW() + INTERVAL '1 day', 'Car maintenance parts'),
    ('YP2024008', customer_ids[8], 'Books Collection', '852 Commerce St, Kingston, Jamaica', 'Barnes & Noble', '122 5th Ave, New York, NY', 4.2, '12x9x8 inches', 75.00, 0.15, 11.25, 11.25, 'FedEx', 'FDX445566778', 'picked_up', NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months' + INTERVAL '5 days', 'Educational textbooks'),
    ('YP2024009', customer_ids[9], 'Sports Equipment', '963 Harbor View, Port Royal, Jamaica', 'Dicks Sporting Goods', '345 Court St, Coraopolis, PA', 8.5, '24x12x6 inches', 320.00, 0.15, 48.00, 48.00, 'UPS', 'UPS223344556', 'picked_up', NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months' + INTERVAL '6 days', 'Tennis racket and accessories'),
    ('YP2023100', customer_ids[1], 'Computer Parts', '789 Customer Rd, Montego Bay, Jamaica', 'Best Buy', '7601 Penn Ave S, Richfield, MN', 6.8, '18x14x10 inches', 450.00, 0.15, 67.50, 67.50, 'DHL', 'DHL667788990', 'picked_up', NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month' + INTERVAL '4 days', 'Gaming PC components');
END $$;