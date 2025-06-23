
-- Temporarily disable the foreign key constraint
ALTER TABLE public.packages DROP CONSTRAINT packages_customer_id_fkey;

-- Insert sample packages with placeholder customer IDs
INSERT INTO public.packages (
  tracking_number, customer_id, description, status, weight, dimensions, 
  sender_name, sender_address, delivery_address, package_value, duty_amount, 
  total_due, date_received, estimated_delivery, notes
) VALUES
('YP2024001', '00000000-0000-0000-0000-000000000001', 'Electronics - Laptop and Accessories', 'ready_for_pickup', 8.5, '18 x 12 x 4 inches', 
 'Best Buy Miami', '1205 Biscayne Blvd, Miami, FL 33132', '15 Hope Road, Kingston 6, Jamaica', 1200.00, 180.00, 180.00, 
 '2024-06-20 09:30:00-05', '2024-06-25 16:00:00-05', 'Customer notified - ready for pickup'),

('YP2024002', '00000000-0000-0000-0000-000000000001', 'Clothing and Shoes', 'in_transit', 3.2, '14 x 10 x 6 inches', 
 'Amazon Fulfillment', '2950 NW 79th Ave, Miami, FL 33122', '22 Constant Spring Road, Kingston 8, Jamaica', 250.00, 37.50, 37.50, 
 '2024-06-21 14:15:00-05', '2024-06-26 12:00:00-05', 'Departed Miami facility'),

('YP2024003', '00000000-0000-0000-0000-000000000002', 'Home Appliances - Blender and Toaster', 'arrived', 12.8, '20 x 16 x 8 inches', 
 'Target', '1400 Biscayne Blvd, Miami, FL 33132', '45 Half Way Tree Road, Kingston 10, Jamaica', 180.00, 27.00, 27.00, 
 '2024-06-19 11:45:00-05', '2024-06-24 10:00:00-05', 'Arrived at Kingston facility - processing for pickup'),

('YP2024004', '00000000-0000-0000-0000-000000000001', 'Books and Educational Materials', 'received', 5.5, '12 x 9 x 3 inches', 
 'Barnes & Noble', '152 Lincoln Rd, Miami Beach, FL 33139', '15 Hope Road, Kingston 6, Jamaica', 85.00, NULL, NULL, 
 '2024-06-23 08:20:00-05', '2024-06-28 14:00:00-05', 'Invoice required for duty assessment'),

('YP2024005', '00000000-0000-0000-0000-000000000002', 'Baby Items - Stroller and Car Seat', 'completed', 18.5, '32 x 24 x 16 inches', 
 'Buy Buy Baby', '19501 Biscayne Blvd, Aventura, FL 33180', '22 Constant Spring Road, Kingston 8, Jamaica', 450.00, 67.50, 67.50, 
 '2024-06-15 13:30:00-05', '2024-06-20 09:00:00-05', 'Delivered successfully'),

('YP2024006', '00000000-0000-0000-0000-000000000003', 'Sports Equipment - Tennis Racket Set', 'completed', 4.2, '28 x 12 x 4 inches', 
 'Dicks Sporting Goods', '3200 NE 1st Ave, Miami, FL 33137', '45 Half Way Tree Road, Kingston 10, Jamaica', 320.00, 48.00, 48.00, 
 '2024-06-10 16:00:00-05', '2024-06-15 11:00:00-05', 'Delivered successfully'),

('YP2024007', '00000000-0000-0000-0000-000000000001', 'Beauty Products and Cosmetics', 'ready_for_pickup', 2.8, '10 x 8 x 6 inches', 
 'Sephora', '1111 Lincoln Rd, Miami Beach, FL 33139', '15 Hope Road, Kingston 6, Jamaica', 150.00, 22.50, 22.50, 
 '2024-06-22 10:15:00-05', '2024-06-27 15:00:00-05', 'Customer contacted - awaiting pickup');

-- Add the foreign key constraint back, but without validation for existing data
ALTER TABLE public.packages ADD CONSTRAINT packages_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES public.profiles(id) ON DELETE CASCADE NOT VALID;
