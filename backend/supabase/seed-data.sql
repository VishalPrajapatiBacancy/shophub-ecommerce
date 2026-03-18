-- Dummy data for E-Commerce backend
-- Run this in Supabase SQL Editor AFTER:
-- 1. You have a "users" table with columns: id (UUID), name, email, password_hash, role (and optionally is_active)
-- 2. You have a "products" table with columns: id, name, description, price, category, stock, image, created_by, etc.
-- 3. You ran 001_admin_tables.sql for categories, brands, orders, order_items, coupons, reviews
--
-- If your column names differ (e.g. full_name instead of name), edit the INSERTs below.

-- Fixed UUIDs for references
-- Admin: a0000001-0000-4000-8000-000000000001
-- Customer 1: a0000002-0000-4000-8000-000000000002
-- Customer 2: a0000003-0000-4000-8000-000000000003
-- Customer 3: a0000004-0000-4000-8000-000000000004
-- Bcrypt hash below is for password: admin123

-- ========== USERS (adjust column names to match your table) ==========
INSERT INTO users (id, name, email, password_hash, role)
VALUES
  ('a0000001-0000-4000-8000-000000000001', 'Admin User', 'admin@shophub.com', '$2a$10$rJbOqveeQ6ghXdmuwDnd1OD7MfOdP2K88eWzWda1GDpNPswXM9bRO', 'admin'),
  ('a0000002-0000-4000-8000-000000000002', 'John Smith', 'john@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
  ('a0000003-0000-4000-8000-000000000003', 'Sarah Johnson', 'sarah@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
  ('a0000004-0000-4000-8000-000000000004', 'Mike Williams', 'mike@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user')
ON CONFLICT (id) DO NOTHING;
-- If your table has no id primary key, remove the ON CONFLICT line.

-- ========== PRODUCTS (requires created_by, adjust columns if needed) ==========
INSERT INTO products (id, name, description, price, category, stock, image, created_by, rating, num_reviews)
VALUES
  ('b0000001-0000-4000-8000-000000000001', 'Wireless Bluetooth Headphones', 'Premium noise-cancelling headphones.', 79.99, 'Electronics', 145, NULL, 'a0000001-0000-4000-8000-000000000001', 4.5, 120),
  ('b0000002-0000-4000-8000-000000000002', 'Smart Watch Pro', 'Advanced smartwatch with health monitoring.', 149.99, 'Electronics', 89, NULL, 'a0000001-0000-4000-8000-000000000001', 4.7, 89),
  ('b0000003-0000-4000-8000-000000000003', 'Organic Cotton T-Shirt', '100% organic cotton t-shirt.', 29.99, 'Clothing', 320, NULL, 'a0000001-0000-4000-8000-000000000001', 4.3, 56),
  ('b0000004-0000-4000-8000-000000000004', 'Running Shoes Ultra', 'Lightweight running shoes.', 119.99, 'Sports', 67, NULL, 'a0000001-0000-4000-8000-000000000001', 4.8, 200),
  ('b0000005-0000-4000-8000-000000000005', 'Laptop Stand Adjustable', 'Ergonomic aluminum laptop stand.', 49.99, 'Electronics', 200, NULL, 'a0000001-0000-4000-8000-000000000001', 4.6, 98),
  ('b0000006-0000-4000-8000-000000000006', 'Stainless Steel Water Bottle', 'Insulated 500ml bottle.', 24.99, 'Home', 500, NULL, 'a0000001-0000-4000-8000-000000000001', 4.4, 70),
  ('b0000007-0000-4000-8000-000000000007', 'Yoga Mat Premium', 'Non-slip eco-friendly mat.', 34.99, 'Sports', 120, NULL, 'a0000001-0000-4000-8000-000000000001', 4.2, 45),
  ('b0000008-0000-4000-8000-000000000008', 'Desk Lamp LED', 'Adjustable LED desk lamp.', 45.00, 'Home', 80, NULL, 'a0000001-0000-4000-8000-000000000001', 4.5, 60)
ON CONFLICT (id) DO NOTHING;

-- ========== CATEGORIES ==========
INSERT INTO categories (id, name, slug, description, sort_order, is_active, product_count)
VALUES
  (gen_random_uuid(), 'Electronics', 'electronics', 'Devices and gadgets', 1, true, 0),
  (gen_random_uuid(), 'Clothing', 'clothing', 'Apparel and fashion', 2, true, 0),
  (gen_random_uuid(), 'Home', 'home', 'Home and kitchen', 3, true, 0),
  (gen_random_uuid(), 'Sports', 'sports', 'Sports and outdoors', 4, true, 0);

-- ========== BRANDS ==========
INSERT INTO brands (id, name, slug, is_active, product_count, sort_order)
VALUES
  (gen_random_uuid(), 'TechAudio', 'techaudio', true, 0, 0),
  (gen_random_uuid(), 'EcoWear', 'ecowear', true, 0, 0),
  (gen_random_uuid(), 'SpeedFit', 'speedfit', true, 0, 0);

-- ========== ORDERS ==========
INSERT INTO orders (id, order_number, user_id, status, payment_status, payment_method, subtotal, tax, shipping, discount, total, shipping_address)
VALUES
  ('c0000001-0000-4000-8000-000000000001', 'ORD-2024-001', 'a0000002-0000-4000-8000-000000000002', 'delivered', 'paid', 'Credit Card', 129.98, 10.40, 5.99, 0, 146.37, '{"street":"123 Main St","city":"New York","state":"NY","zipCode":"10001","country":"US"}'::jsonb),
  ('c0000002-0000-4000-8000-000000000002', 'ORD-2024-002', 'a0000003-0000-4000-8000-000000000003', 'shipped', 'paid', 'PayPal', 149.99, 12.00, 0, 15.00, 146.99, '{"street":"456 Oak Ave","city":"Los Angeles","state":"CA","zipCode":"90001","country":"US"}'::jsonb),
  ('c0000003-0000-4000-8000-000000000003', 'ORD-2024-003', 'a0000004-0000-4000-8000-000000000004', 'processing', 'paid', 'Credit Card', 159.96, 12.80, 5.99, 0, 178.75, '{"street":"789 Pine Rd","city":"Chicago","state":"IL","zipCode":"60601","country":"US"}'::jsonb),
  ('c0000004-0000-4000-8000-000000000004', 'ORD-2024-004', 'a0000002-0000-4000-8000-000000000002', 'pending', 'pending', 'Credit Card', 119.99, 9.60, 0, 12.00, 117.59, '{"street":"321 Elm St","city":"Houston","state":"TX","zipCode":"77001","country":"US"}'::jsonb)
ON CONFLICT (order_number) DO NOTHING;

-- ========== ORDER ITEMS ==========
INSERT INTO order_items (order_id, product_id, name, price, quantity, total)
VALUES
  ('c0000001-0000-4000-8000-000000000001', 'b0000001-0000-4000-8000-000000000001', 'Wireless Bluetooth Headphones', 79.99, 1, 79.99),
  ('c0000001-0000-4000-8000-000000000001', 'b0000005-0000-4000-8000-000000000005', 'Laptop Stand Adjustable', 49.99, 1, 49.99),
  ('c0000002-0000-4000-8000-000000000002', 'b0000002-0000-4000-8000-000000000002', 'Smart Watch Pro', 149.99, 1, 149.99),
  ('c0000003-0000-4000-8000-000000000003', 'b0000003-0000-4000-8000-000000000003', 'Organic Cotton T-Shirt', 29.99, 3, 89.97),
  ('c0000003-0000-4000-8000-000000000003', 'b0000004-0000-4000-8000-000000000004', 'Running Shoes Ultra', 119.99, 1, 119.99),
  ('c0000004-0000-4000-8000-000000000004', 'b0000004-0000-4000-8000-000000000004', 'Running Shoes Ultra', 119.99, 1, 119.99);

-- ========== COUPONS ==========
INSERT INTO coupons (code, description, type, value, min_order_amount, usage_limit, used_count, start_date, end_date, status)
VALUES
  ('WELCOME10', 'Welcome discount', 'percentage', 10, 50, 100, 0, now(), now() + interval '2 months', 'active'),
  ('FLAT20', 'Flat $20 off', 'fixed', 20, 100, 50, 0, now(), now() + interval '2 months', 'active'),
  ('SUMMER25', 'Summer sale', 'percentage', 25, 0, 200, 0, now(), now() + interval '2 months', 'active')
ON CONFLICT (code) DO NOTHING;

-- ========== REVIEWS ==========
INSERT INTO reviews (product_id, user_id, rating, title, comment, status)
VALUES
  ('b0000001-0000-4000-8000-000000000001', 'a0000002-0000-4000-8000-000000000002', 5, 'Great product', 'Very happy with this purchase.', 'approved'),
  ('b0000001-0000-4000-8000-000000000001', 'a0000003-0000-4000-8000-000000000003', 4, 'Good value', 'Works as described.', 'approved'),
  ('b0000002-0000-4000-8000-000000000002', 'a0000002-0000-4000-8000-000000000002', 5, 'Excellent', 'Highly recommend.', 'approved'),
  ('b0000003-0000-4000-8000-000000000003', 'a0000004-0000-4000-8000-000000000004', 3, 'Okay', 'Decent quality.', 'pending');
