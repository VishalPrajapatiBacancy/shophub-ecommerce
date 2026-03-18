-- ============================================================
-- ADD_MISSING_TABLES.sql
-- Run this in: https://supabase.com/dashboard/project/qljzsiwixcuegmnrkdds/sql/new
-- ============================================================

-- ─── 1. BANNERS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.banners (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  image_url   TEXT,
  link_type   TEXT DEFAULT 'none' CHECK (link_type IN ('product', 'category', 'url', 'none')),
  link_value  TEXT,
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  start_date  TIMESTAMPTZ,
  end_date    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. REVIEWS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id  UUID,
  user_id     UUID,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       TEXT,
  comment     TEXT,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. RETURNS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.returns (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id       UUID,
  order_number   TEXT,
  user_id        UUID,
  customer_name  TEXT,
  customer_email TEXT,
  reason         TEXT,
  status         TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'refunded')),
  refund_amount  DECIMAL(12,2) DEFAULT 0,
  refund_status  TEXT DEFAULT 'pending' CHECK (refund_status IN ('pending', 'processed', 'failed')),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. ORDERS — add missing columns ────────────────────────
-- Your DB uses grand_total; add total + other missing cols so controllers work
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_name   TEXT,
  ADD COLUMN IF NOT EXISTS customer_email  TEXT,
  ADD COLUMN IF NOT EXISTS total           DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax             DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping        DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount        DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes           TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address JSONB,
  ADD COLUMN IF NOT EXISTS billing_address  JSONB,
  ADD COLUMN IF NOT EXISTS created_at      TIMESTAMPTZ DEFAULT NOW();

-- Sync total from grand_total for existing rows
UPDATE public.orders SET total = grand_total WHERE total = 0 AND grand_total IS NOT NULL AND grand_total > 0;

-- ─── 5. ADMIN NOTIFICATIONS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT DEFAULT 'general' CHECK (type IN ('general', 'order', 'product', 'system', 'promotion')),
  target_type TEXT DEFAULT 'all' CHECK (target_type IN ('all', 'specific')),
  status      TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'draft', 'scheduled')),
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 6. ROLES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.roles (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system   BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT '{}',
  staff_count INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 7. SUPPORT TICKETS ──────────────────────────────────────
-- Table already exists — add only the missing columns
ALTER TABLE public.support_tickets
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.support_tickets
  ALTER COLUMN message SET DEFAULT '',
  ALTER COLUMN message DROP NOT NULL;

ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS ticket_number  TEXT,
  ADD COLUMN IF NOT EXISTS customer_name  TEXT,
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS category       TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS priority       TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS assigned_to    TEXT,
  ADD COLUMN IF NOT EXISTS messages       JSONB DEFAULT '[]';

-- Add check constraints only if they don't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'support_tickets_category_check'
  ) THEN
    ALTER TABLE public.support_tickets
      ADD CONSTRAINT support_tickets_category_check
      CHECK (category IN ('general', 'order', 'payment', 'shipping', 'product', 'return', 'refund', 'technical', 'other'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'support_tickets_priority_check'
  ) THEN
    ALTER TABLE public.support_tickets
      ADD CONSTRAINT support_tickets_priority_check
      CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
  END IF;
END $$;

-- ─── 9. DISABLE RLS ON ALL ADMIN TABLES ──────────────────────
-- The backend uses the service_role key which should bypass RLS,
-- but disabling it explicitly prevents any edge-case blocks.
ALTER TABLE public.support_tickets     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners             DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews             DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns             DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles               DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders              DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users               DISABLE ROW LEVEL SECURITY;

-- ─── 8. SETTINGS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.settings (
  id         INTEGER PRIMARY KEY DEFAULT 1,
  value      JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings row (only if empty)
INSERT INTO public.settings (id, value) VALUES (1, '{
  "storeName": "ShopHub",
  "storeEmail": "admin@shophub.com",
  "storePhone": "+1 234 567 8900",
  "storeAddress": "123 Main St, New York, NY 10001",
  "currency": "USD",
  "currencySymbol": "$",
  "timezone": "America/New_York",
  "taxRate": 8,
  "taxEnabled": true,
  "freeShippingThreshold": 50,
  "defaultShippingRate": 5.99,
  "expressShippingRate": 15.99,
  "orderPrefix": "ORD-",
  "autoConfirmOrders": false,
  "lowStockThreshold": 10,
  "logo": "",
  "favicon": "",
  "primaryColor": "#2563EB"
}')
ON CONFLICT (id) DO NOTHING;

-- ─── SAMPLE DATA ─────────────────────────────────────────────

INSERT INTO public.banners (title, image_url, link_type, sort_order, is_active) VALUES
  ('Summer Sale - Up to 50% Off', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200', 'url', 1, true),
  ('New Arrivals - Fashion Collection', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200', 'category', 2, true),
  ('Electronics Mega Sale', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200', 'category', 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.roles (name, description, is_system, permissions) VALUES
  ('Super Admin',    'Full access to all modules',           true,  '{"all": true}'),
  ('Store Manager',  'Manage store operations',              true,  '{"dashboard":["view"],"products":["view","create","edit","delete"],"orders":["view","edit"],"customers":["view","edit"]}'),
  ('Content Editor', 'Manage products and content',          false, '{"products":["view","create","edit"],"categories":["view","create","edit"]}'),
  ('Viewer',         'View-only access',                     false, '{"dashboard":["view"],"products":["view"],"orders":["view"],"customers":["view"]}')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.admin_notifications (title, message, type, target_type, status, sent_at) VALUES
  ('Welcome to ShopHub', 'Admin panel is ready to use.', 'system', 'all', 'sent', NOW())
ON CONFLICT DO NOTHING;
