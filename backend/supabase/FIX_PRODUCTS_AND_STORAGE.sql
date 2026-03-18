-- ============================================================
-- RUN THIS ONCE in Supabase Dashboard → SQL Editor
-- Fixes: products table schema + creates image storage bucket
-- ============================================================

-- ─── 1. Relax NOT NULL constraints that block admin inserts ──────────
-- The products table was created with vendor_id, brand, category_id
-- as NOT NULL without defaults. We make them optional below.
DO $$
BEGIN
  -- vendor_id: drop NOT NULL (we don't require it from the admin panel)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'vendor_id'
  ) THEN
    ALTER TABLE products ALTER COLUMN vendor_id DROP NOT NULL;
  END IF;

  -- category_id: drop NOT NULL (we use the new TEXT 'category' column instead)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE products ALTER COLUMN category_id DROP NOT NULL;
  END IF;

  -- brand: give it a safe default so inserts without it still work
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'brand'
  ) THEN
    ALTER TABLE products ALTER COLUMN brand SET DEFAULT '';
  END IF;

  -- title: drop NOT NULL (we use the new TEXT 'name' column going forward)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'title'
  ) THEN
    ALTER TABLE products ALTER COLUMN title DROP NOT NULL;
  END IF;

  -- status: give it a safe default if the column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'status'
  ) THEN
    ALTER TABLE products ALTER COLUMN status SET DEFAULT 'active';
  END IF;
END $$;

-- ─── 2. Add missing columns needed by the admin panel ────────────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS name         TEXT,
  ADD COLUMN IF NOT EXISTS description  TEXT,
  ADD COLUMN IF NOT EXISTS price        DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS category     TEXT NOT NULL DEFAULT 'Uncategorized',
  ADD COLUMN IF NOT EXISTS image        TEXT,
  ADD COLUMN IF NOT EXISTS images       TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS rating       DECIMAL(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS num_reviews  INT NOT NULL DEFAULT 0;

-- Fix price_mrp NOT NULL constraint if the column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'price_mrp'
  ) THEN
    ALTER TABLE products ALTER COLUMN price_mrp SET DEFAULT 0;
    UPDATE products SET price_mrp = COALESCE(price, 0) WHERE price_mrp IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'price_sale'
  ) THEN
    ALTER TABLE products ALTER COLUMN price_sale SET DEFAULT 0;
    UPDATE products SET price_sale = COALESCE(price, 0) WHERE price_sale IS NULL;
  END IF;
END $$;

-- Copy existing 'title' → 'name' where name is still empty
UPDATE products SET name = title WHERE name IS NULL AND title IS NOT NULL;

-- Ensure every product has a non-null name
UPDATE products SET name = 'Untitled Product' WHERE name IS NULL OR name = '';

-- ─── 3. Add missing columns to categories table ─────────────────────
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS description      TEXT,
  ADD COLUMN IF NOT EXISTS is_featured      BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS seo_title        TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS product_count    INT NOT NULL DEFAULT 0;

-- ─── 4. Refresh PostgREST schema cache ──────────────────────────────
NOTIFY pgrst, 'reload schema';

-- ─── 4. Create public storage bucket for image uploads ───────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'admin-uploads',
  'admin-uploads',
  true,
  5242880,
  ARRAY['image/jpeg','image/jpg','image/png','image/gif','image/webp','image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ─── 5. Storage RLS policies ────────────────────────────────────────
DROP POLICY IF EXISTS "Public read admin-uploads"          ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload admin-uploads"  ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update admin-uploads"  ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete admin-uploads"  ON storage.objects;

CREATE POLICY "Public read admin-uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'admin-uploads');

CREATE POLICY "Authenticated upload admin-uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'admin-uploads');

CREATE POLICY "Authenticated update admin-uploads"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'admin-uploads');

CREATE POLICY "Authenticated delete admin-uploads"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'admin-uploads');

-- ─── Done! ───────────────────────────────────────────────────────────
-- After running this SQL, restart your backend server.
-- The in-memory schema cache will reset and products CRUD will work.
