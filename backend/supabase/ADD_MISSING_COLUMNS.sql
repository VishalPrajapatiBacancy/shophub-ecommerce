-- ============================================================
-- ADD MISSING COLUMNS TO EXISTING TABLES (Non-destructive)
-- Run this in Supabase SQL Editor if you want to keep existing data.
-- If starting fresh, use RESET_AND_SETUP.sql instead.
-- ============================================================

-- === USERS TABLE ===
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;

-- === PRODUCTS TABLE ===
-- If products has 'title' column, rename/add 'name'
DO $$
BEGIN
  -- Add name column if it doesn't exist (use title as default if title exists)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='name' AND table_schema='public') THEN
    ALTER TABLE products ADD COLUMN name TEXT NOT NULL DEFAULT '';
    -- If title column exists, copy it to name
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='title' AND table_schema='public') THEN
      UPDATE products SET name = title WHERE name = '';
    END IF;
  END IF;
END $$;

ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Uncategorized';
ALTER TABLE products ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS num_reviews INT NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_by UUID;

-- === ORDERS TABLE ===
DO $$
BEGIN
  -- Add total column if it doesn't exist (use grand_total as source if it exists)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='total' AND table_schema='public') THEN
    ALTER TABLE orders ADD COLUMN total DECIMAL(12,2) NOT NULL DEFAULT 0;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='grand_total' AND table_schema='public') THEN
      UPDATE orders SET total = grand_total WHERE total = 0;
    END IF;
  END IF;
END $$;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- === CREATE MISSING TABLES ===

-- Brands
CREATE TABLE IF NOT EXISTS brands (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  logo_url        TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  product_count   INT NOT NULL DEFAULT 0,
  sort_order      INT NOT NULL DEFAULT 0,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code             TEXT NOT NULL UNIQUE,
  description      TEXT,
  type             TEXT NOT NULL DEFAULT 'percentage',
  value            DECIMAL(12,2) NOT NULL,
  min_order_amount DECIMAL(12,2),
  max_discount     DECIMAL(12,2),
  usage_limit      INT,
  used_count       INT NOT NULL DEFAULT 0,
  start_date       TIMESTAMPTZ,
  end_date         TIMESTAMPTZ,
  status           TEXT NOT NULL DEFAULT 'active',
  created_by       UUID,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL,
  user_id     UUID NOT NULL,
  rating      INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title       TEXT,
  comment     TEXT,
  status      TEXT NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- === TRIGGER for auto-creating user profiles ===
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
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

-- Done! Now run: node scripts/seed-database.js from the backend folder.
