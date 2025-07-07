-- Add comprehensive test data with proper UUIDs

-- Insert additional customers with various types
INSERT INTO public.customers (customer_type, full_name, email, phone_number, address, user_id, preferred_contact_method, notes) VALUES
('registered', 'John Doe', 'john.doe@email.com', '+1-876-555-0003', '789 Customer Rd, Montego Bay, Jamaica', NULL, 'email', 'Regular customer, prefers email updates'),
('registered', 'Jane Smith', 'jane.smith@email.com', '+1-876-555-0004', '321 Paradise Dr, Negril, Jamaica', NULL, 'sms', 'VIP customer, fast processing requested'),
('registered', 'Mike Johnson', 'mike.johnson@email.com', '+1-876-555-0005', '654 Beach Blvd, Ocho Rios, Jamaica', NULL, 'email', 'Business customer, bulk packages'),
('registered', 'Sarah Williams', 'sarah.williams@email.com', '+1-876-555-0006', '987 Hill View, Port Antonio, Jamaica', NULL, 'phone', 'Frequent international shopper'),
('guest', 'Robert Brown', 'robert.brown@email.com', '+1-876-555-0008', '258 Guest Ave, Kingston, Jamaica', NULL, 'email', 'One-time guest user'),
('package_only', 'Maria Garcia', NULL, '+1-876-555-0009', '369 Package St, Spanish Town, Jamaica', NULL, 'phone', 'Package only, no account needed'),
('guest', 'David Wilson', 'david.wilson@email.com', '+1-876-555-0010', '741 Visitor Rd, Mandeville, Jamaica', NULL, 'email', 'Visiting relative, temporary address');

-- Add packages using the existing customer from the database
INSERT INTO public.packages (
    tracking_number, customer_id, description, delivery_address, sender_name, sender_address,
    weight, dimensions, package_value, duty_rate, duty_amount, total_due, carrier, external_tracking_number,
    status, date_received, estimated_delivery, notes
) 
SELECT 
    'YP2024' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
    (SELECT id FROM customers ORDER BY created_at DESC LIMIT 1 OFFSET (ROW_NUMBER() OVER() - 1) % 7),
    package_data.description,
    package_data.delivery_address,
    package_data.sender_name,
    package_data.sender_address,
    package_data.weight,
    package_data.dimensions,
    package_data.package_value,
    0.15,
    package_data.package_value * 0.15,
    package_data.package_value * 0.15,
    package_data.carrier,
    package_data.external_tracking,
    package_data.status,
    package_data.date_received,
    package_data.estimated_delivery,
    package_data.notes
FROM (
    VALUES 
        ('Electronics - Smartphone', '789 Customer Rd, Montego Bay, Jamaica', 'Amazon', '410 Terry Ave N, Seattle, WA', 2.5, '6x4x1 inches', 800.00, 'DHL', 'DHL12345678', 'received', NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', 'High value item, handle with care'),
        ('Clothing Bundle', '321 Paradise Dr, Negril, Jamaica', 'Nike Store', '1 Bowerman Dr, Beaverton, OR', 1.8, '12x8x4 inches', 250.00, 'FedEx', 'FDX987654321', 'in_transit', NOW() - INTERVAL '5 days', NOW() + INTERVAL '2 days', 'Multiple items in one package'),
        ('Business Supplies', '654 Beach Blvd, Ocho Rios, Jamaica', 'Office Depot', '6600 N Military Trail, Boca Raton, FL', 5.2, '16x12x8 inches', 150.00, 'UPS', 'UPS111222333', 'arrived', NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 day', 'Office equipment for business'),
        ('Fashion Accessories', '987 Hill View, Port Antonio, Jamaica', 'Zara', '500 5th Ave, New York, NY', 0.8, '8x6x2 inches', 120.00, 'DHL', 'DHL88899900', 'ready_for_pickup', NOW() - INTERVAL '3 days', NOW(), 'Designer handbag and accessories'),
        ('Home Goods', '258 Guest Ave, Kingston, Jamaica', 'Target', '1000 Nicollet Mall, Minneapolis, MN', 3.7, '14x10x6 inches', 85.00, 'USPS', 'USPS556677889', 'picked_up', NOW() - INTERVAL '7 days', NOW() - INTERVAL '2 days', 'Kitchen appliances'),
        ('Books Collection', '789 Customer Rd, Montego Bay, Jamaica', 'Barnes & Noble', '122 5th Ave, New York, NY', 4.2, '12x9x8 inches', 75.00, 'FedEx', 'FDX445566778', 'picked_up', NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months' + INTERVAL '5 days', 'Educational textbooks'),
        ('Sports Equipment', '321 Paradise Dr, Negril, Jamaica', 'Dicks Sporting Goods', '345 Court St, Coraopolis, PA', 8.5, '24x12x6 inches', 320.00, 'UPS', 'UPS223344556', 'picked_up', NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months' + INTERVAL '6 days', 'Tennis racket and accessories'),
        ('Computer Parts', '654 Beach Blvd, Ocho Rios, Jamaica', 'Best Buy', '7601 Penn Ave S, Richfield, MN', 6.8, '18x14x10 inches', 450.00, 'DHL', 'DHL667788990', 'picked_up', NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month' + INTERVAL '4 days', 'Gaming PC components'),
        ('Personal Care Items', '369 Package St, Spanish Town, Jamaica', 'CVS Pharmacy', '1 CVS Dr, Woonsocket, RI', 1.2, '8x6x3 inches', 45.00, 'USPS', 'USPS123456789', 'in_transit', NOW() - INTERVAL '3 days', NOW() + INTERVAL '3 days', 'Health and beauty products'),
        ('Automotive Parts', '741 Visitor Rd, Mandeville, Jamaica', 'AutoZone', '123 S Front St, Memphis, TN', 12.5, '20x16x8 inches', 180.00, 'UPS', 'UPS987654321', 'arrived', NOW() - INTERVAL '2 days', NOW() + INTERVAL '1 day', 'Car maintenance parts')
) AS package_data(description, delivery_address, sender_name, sender_address, weight, dimensions, package_value, carrier, external_tracking, status, date_received, estimated_delivery, notes);