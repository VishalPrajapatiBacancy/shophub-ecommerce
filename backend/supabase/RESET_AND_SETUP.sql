-- ============================================================
-- SHOPHUB E-COMMERCE — FULL DATABASE RESET & SETUP
-- Run this ENTIRE script in Supabase SQL Editor
-- It drops old tables, recreates correct schema, and seeds demo data
-- Admin login: admin@shophub.com / admin123
-- ============================================================

-- STEP 1: Drop old tables (clean slate)
DROP TABLE IF EXISTS reviews       CASCADE;
DROP TABLE IF EXISTS coupons       CASCADE;
DROP TABLE IF EXISTS order_items   CASCADE;
DROP TABLE IF EXISTS orders        CASCADE;
DROP TABLE IF EXISTS products      CASCADE;
DROP TABLE IF EXISTS brands        CASCADE;
DROP TABLE IF EXISTS categories    CASCADE;
DROP TABLE IF EXISTS users         CASCADE;

-- STEP 2: Users profile table
CREATE TABLE users (
  id           UUID PRIMARY KEY,
  name         TEXT NOT NULL DEFAULT '',
  email        TEXT NOT NULL UNIQUE,
  role         TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'manager', 'editor', 'viewer')),
  is_active    BOOLEAN NOT NULL DEFAULT true,
  phone        TEXT,
  avatar       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- STEP 3: Auto-create profile on Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    CASE
      WHEN NEW.raw_user_meta_data->>'role' IN ('admin','user','manager','editor','viewer')
        THEN NEW.raw_user_meta_data->>'role'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 4: Insert existing auth users into profiles
-- This picks up anyone already in auth.users (including admin)
INSERT INTO users (id, email, name, role)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
  CASE
    WHEN email = 'admin@shophub.com' THEN 'admin'
    WHEN raw_user_meta_data->>'role' IN ('admin','user','manager','editor','viewer')
      THEN raw_user_meta_data->>'role'
    ELSE 'user'
  END
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- STEP 5: Products table
CREATE TABLE products (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  price        DECIMAL(12,2) NOT NULL DEFAULT 0,
  category     TEXT NOT NULL DEFAULT 'Uncategorized',
  stock        INT NOT NULL DEFAULT 0,
  image        TEXT,
  rating       DECIMAL(3,2) DEFAULT 0,
  num_reviews  INT NOT NULL DEFAULT 0,
  created_by   UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- STEP 6: Categories table
CREATE TABLE categories (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT,
  parent_id        UUID REFERENCES categories(id),
  image_url        TEXT,
  banner_url       TEXT,
  icon_url         TEXT,
  sort_order       INT NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  is_featured      BOOLEAN NOT NULL DEFAULT false,
  product_count    INT NOT NULL DEFAULT 0,
  seo_title        TEXT,
  meta_description TEXT,
  created_by       UUID,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- STEP 7: Brands table
CREATE TABLE brands (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT,
  logo_url         TEXT,
  banner_url       TEXT,
  website_url      TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  is_featured      BOOLEAN NOT NULL DEFAULT false,
  product_count    INT NOT NULL DEFAULT 0,
  sort_order       INT NOT NULL DEFAULT 0,
  seo_title        TEXT,
  meta_description TEXT,
  created_by       UUID,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- STEP 8: Orders table
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     TEXT NOT NULL UNIQUE,
  user_id          UUID NOT NULL REFERENCES users(id),
  status           TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','processing','packed','shipped','out_for_delivery','delivered','cancelled','returned','refunded')),
  payment_status   TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('paid','pending','failed','refunded')),
  payment_method   TEXT,
  payment_id       TEXT,
  transaction_id   TEXT,
  subtotal         DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax              DECIMAL(12,2) NOT NULL DEFAULT 0,
  shipping         DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount         DECIMAL(12,2) NOT NULL DEFAULT 0,
  total            DECIMAL(12,2) NOT NULL DEFAULT 0,
  shipping_address JSONB,
  billing_address  JSONB,
  tracking_number  TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- STEP 9: Order items table
CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL,
  name        TEXT NOT NULL,
  price       DECIMAL(12,2) NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  total       DECIMAL(12,2) NOT NULL,
  thumbnail   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- STEP 10: Coupons table
CREATE TABLE coupons (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code             TEXT NOT NULL UNIQUE,
  description      TEXT,
  type             TEXT NOT NULL DEFAULT 'percentage'
    CHECK (type IN ('percentage','fixed')),
  value            DECIMAL(12,2) NOT NULL,
  min_order_amount DECIMAL(12,2),
  max_discount     DECIMAL(12,2),
  usage_limit      INT,
  used_count       INT NOT NULL DEFAULT 0,
  start_date       TIMESTAMPTZ,
  end_date         TIMESTAMPTZ,
  status           TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','expired','disabled')),
  created_by       UUID,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- STEP 11: Reviews table
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL,
  user_id     UUID NOT NULL REFERENCES users(id),
  rating      INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title       TEXT,
  comment     TEXT,
  status      TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- STEP 12: Indexes
CREATE INDEX idx_products_category    ON products(category);
CREATE INDEX idx_orders_user_id       ON orders(user_id);
CREATE INDEX idx_orders_created_at    ON orders(created_at DESC);
CREATE INDEX idx_orders_status        ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_reviews_product_id   ON reviews(product_id);
CREATE INDEX idx_reviews_status       ON reviews(status);

-- ============================================================
-- STEP 13: SEED DEMO DATA
-- ============================================================

-- === Categories ===
INSERT INTO categories (name, slug, description, sort_order, is_active, is_featured, product_count)
VALUES
  ('Electronics', 'electronics', 'Devices, gadgets and accessories', 1, true, true, 3),
  ('Clothing',    'clothing',    'Apparel and fashion',               2, true, true, 1),
  ('Home',        'home',        'Home, kitchen and lifestyle',        3, true, false, 2),
  ('Sports',      'sports',      'Sports, fitness and outdoors',       4, true, false, 2),
  ('Books',       'books',       'Books and educational material',     5, true, false, 0);

-- === Brands ===
INSERT INTO brands (name, slug, description, is_active, is_featured, product_count)
VALUES
  ('TechAudio', 'techaudio', 'Premium audio electronics',  true, true, 1),
  ('SmartGear', 'smartgear', 'Smart devices and wearables', true, true, 1),
  ('EcoWear',   'ecowear',   'Sustainable fashion brand',   true, true, 1),
  ('SpeedFit',  'speedfit',  'Performance sportswear',      true, true, 2),
  ('HomeGlow',  'homeglow',  'Smart home products',         true, true, 2);

-- === Products ===
DO $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id FROM users WHERE email = 'admin@shophub.com' LIMIT 1;
  IF admin_id IS NULL THEN
    admin_id := gen_random_uuid(); -- fallback (shouldn't happen)
  END IF;

  INSERT INTO products (id, name, description, price, category, stock, rating, num_reviews, created_by) VALUES
    ('b0000001-0000-4000-8000-000000000001', 'Wireless Bluetooth Headphones',
     'Premium noise-cancelling headphones with 30h battery life and foldable design.',
     79.99, 'Electronics', 145, 4.5, 120, admin_id),
    ('b0000002-0000-4000-8000-000000000002', 'Smart Watch Pro',
     'Advanced smartwatch with heart rate monitor, GPS, sleep tracking and 7-day battery.',
     149.99, 'Electronics', 89, 4.7, 89, admin_id),
    ('b0000003-0000-4000-8000-000000000003', 'Organic Cotton T-Shirt',
     '100% GOTS-certified organic cotton. Available in 6 colors. Eco-friendly packaging.',
     29.99, 'Clothing', 320, 4.3, 56, admin_id),
    ('b0000004-0000-4000-8000-000000000004', 'Running Shoes Ultra',
     'Lightweight breathable mesh upper with CloudFoam cushioning. Perfect for long runs.',
     119.99, 'Sports', 67, 4.8, 200, admin_id),
    ('b0000005-0000-4000-8000-000000000005', 'Laptop Stand Adjustable',
     'Ergonomic aluminum stand with 6 height levels. Reduces neck and back strain.',
     49.99, 'Electronics', 200, 4.6, 98, admin_id),
    ('b0000006-0000-4000-8000-000000000006', 'Stainless Steel Water Bottle',
     'Double-wall vacuum insulated 500ml bottle. Keeps cold 24h, hot 12h. BPA-free.',
     24.99, 'Home', 500, 4.4, 70, admin_id),
    ('b0000007-0000-4000-8000-000000000007', 'Yoga Mat Premium',
     'Non-slip TPE surface, 6mm thick, eco-friendly. Includes carry strap.',
     34.99, 'Sports', 120, 4.2, 45, admin_id),
    ('b0000008-0000-4000-8000-000000000008', 'LED Desk Lamp',
     'Touch-control with 5 brightness levels and USB charging port. Eye-care technology.',
     45.00, 'Home', 80, 4.5, 60, admin_id);
END $$;

-- === Demo customer profiles (linked to real auth users if they exist) ===
DO $$
DECLARE
  u1 UUID; u2 UUID; u3 UUID;
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id FROM users WHERE email = 'admin@shophub.com' LIMIT 1;

  -- Get customer IDs from auth.users if they exist
  SELECT id INTO u1 FROM auth.users WHERE email = 'john@example.com' LIMIT 1;
  SELECT id INTO u2 FROM auth.users WHERE email = 'sarah@example.com' LIMIT 1;
  SELECT id INTO u3 FROM auth.users WHERE email = 'mike@example.com' LIMIT 1;

  -- Use fixed UUIDs as fallback (demo only, won't have auth login)
  IF u1 IS NULL THEN u1 := 'a0000002-0000-4000-8000-000000000002'; END IF;
  IF u2 IS NULL THEN u2 := 'a0000003-0000-4000-8000-000000000003'; END IF;
  IF u3 IS NULL THEN u3 := 'a0000004-0000-4000-8000-000000000004'; END IF;

  -- Insert customer profiles
  INSERT INTO users (id, name, email, role) VALUES
    (u1, 'John Smith',    'john@example.com',  'user'),
    (u2, 'Sarah Johnson', 'sarah@example.com', 'user'),
    (u3, 'Mike Williams', 'mike@example.com',  'user')
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;

  -- === Orders ===
  INSERT INTO orders (id, order_number, user_id, status, payment_status, payment_method,
                      subtotal, tax, shipping, discount, total, shipping_address, created_at) VALUES
    ('c0000001-0000-4000-8000-000000000001', 'ORD-2024-001', u1, 'delivered', 'paid', 'Credit Card',
     129.98, 10.40, 5.99, 0, 146.37,
     '{"street":"123 Main St","city":"New York","state":"NY","zipCode":"10001","country":"US"}'::jsonb,
     now() - interval '30 days'),
    ('c0000002-0000-4000-8000-000000000002', 'ORD-2024-002', u2, 'shipped', 'paid', 'PayPal',
     149.99, 12.00, 0, 15.00, 146.99,
     '{"street":"456 Oak Ave","city":"Los Angeles","state":"CA","zipCode":"90001","country":"US"}'::jsonb,
     now() - interval '15 days'),
    ('c0000003-0000-4000-8000-000000000003', 'ORD-2024-003', u3, 'processing', 'paid', 'Credit Card',
     159.96, 12.80, 5.99, 0, 178.75,
     '{"street":"789 Pine Rd","city":"Chicago","state":"IL","zipCode":"60601","country":"US"}'::jsonb,
     now() - interval '7 days'),
    ('c0000004-0000-4000-8000-000000000004', 'ORD-2024-004', u1, 'pending', 'pending', 'Credit Card',
     119.99, 9.60, 0, 12.00, 117.59,
     '{"street":"321 Elm St","city":"Houston","state":"TX","zipCode":"77001","country":"US"}'::jsonb,
     now() - interval '2 days'),
    ('c0000005-0000-4000-8000-000000000005', 'ORD-2024-005', u2, 'confirmed', 'paid', 'Apple Pay',
     74.98, 6.00, 5.99, 0, 86.97,
     '{"street":"555 Sunset Blvd","city":"Los Angeles","state":"CA","zipCode":"90028","country":"US"}'::jsonb,
     now() - interval '1 day')
  ON CONFLICT (order_number) DO NOTHING;

  -- === Order Items ===
  INSERT INTO order_items (order_id, product_id, name, price, quantity, total) VALUES
    ('c0000001-0000-4000-8000-000000000001', 'b0000001-0000-4000-8000-000000000001', 'Wireless Bluetooth Headphones', 79.99, 1, 79.99),
    ('c0000001-0000-4000-8000-000000000001', 'b0000005-0000-4000-8000-000000000005', 'Laptop Stand Adjustable', 49.99, 1, 49.99),
    ('c0000002-0000-4000-8000-000000000002', 'b0000002-0000-4000-8000-000000000002', 'Smart Watch Pro', 149.99, 1, 149.99),
    ('c0000003-0000-4000-8000-000000000003', 'b0000003-0000-4000-8000-000000000003', 'Organic Cotton T-Shirt', 29.99, 3, 89.97),
    ('c0000003-0000-4000-8000-000000000003', 'b0000004-0000-4000-8000-000000000004', 'Running Shoes Ultra', 119.99, 1, 119.99),
    ('c0000004-0000-4000-8000-000000000004', 'b0000004-0000-4000-8000-000000000004', 'Running Shoes Ultra', 119.99, 1, 119.99),
    ('c0000005-0000-4000-8000-000000000005', 'b0000006-0000-4000-8000-000000000006', 'Stainless Steel Water Bottle', 24.99, 2, 49.98),
    ('c0000005-0000-4000-8000-000000000005', 'b0000007-0000-4000-8000-000000000007', 'Yoga Mat Premium', 34.99, 1, 34.99);

  -- === Reviews ===
  INSERT INTO reviews (product_id, user_id, rating, title, comment, status) VALUES
    ('b0000001-0000-4000-8000-000000000001', u1, 5, 'Absolutely love these!',     'Best headphones I''ve owned. Amazing noise cancelling.', 'approved'),
    ('b0000001-0000-4000-8000-000000000001', u2, 4, 'Great value for money',      'Works exactly as described. Battery life is impressive.', 'approved'),
    ('b0000002-0000-4000-8000-000000000002', u1, 5, 'My favorite smartwatch',     'Tracks everything accurately. The display is gorgeous.', 'approved'),
    ('b0000003-0000-4000-8000-000000000003', u3, 3, 'Decent quality',             'Fits well but color faded a bit after washing.', 'pending'),
    ('b0000004-0000-4000-8000-000000000004', u1, 5, 'Best running shoes ever!',   'Super comfortable, perfect for marathon training.', 'approved'),
    ('b0000005-0000-4000-8000-000000000005', u2, 5, 'Game-changer for WFH',       'Completely fixed my neck pain. Worth every penny.', 'approved'),
    ('b0000006-0000-4000-8000-000000000006', u3, 4, 'Keeps drinks cold all day',  'Excellent insulation. A little heavy but worth it.', 'approved'),
    ('b0000007-0000-4000-8000-000000000007', u2, 4, 'Good mat, great grip',       'Non-slip surface is great. Slight smell at first but fades.', 'pending');
END $$;

-- === Coupons ===
INSERT INTO coupons (code, description, type, value, min_order_amount, max_discount, usage_limit, used_count, start_date, end_date, status)
VALUES
  ('WELCOME10', '10% off your first order',          'percentage', 10, 50,   NULL, 100, 5,  now(), now() + interval '2 months', 'active'),
  ('FLAT20',    '$20 flat discount on orders $100+', 'fixed',      20, 100,  20,   50,  12, now(), now() + interval '2 months', 'active'),
  ('SUMMER25',  '25% summer sale discount',          'percentage', 25, 0,    NULL, 200, 30, now(), now() + interval '2 months', 'active'),
  ('FREESHIP',  'Free shipping on any order',        'fixed',      9.99, 0,  9.99, 500, 88, now(), now() + interval '2 months', 'active')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- ✅ DONE! Admin login: admin@shophub.com / admin123
-- Next: Run `node scripts/seed-database.js` to create customer
--       auth accounts (optional, for login testing)
-- ============================================================
