# Seeding Dummy Data

Two ways to add dummy data to your Supabase database.

## Option 1: Node seed script (recommended if your schema matches)

From the **backend** folder:

```bash
npm run seed
```

This will:

- Create an **admin user**: `admin@shophub.com` / `admin123` (password is bcrypt-hashed)
- Create 3 customer users (password: `password123`)
- Insert products, categories, brands, orders, order items, coupons, and reviews (if the corresponding tables exist)

**Required table columns:**

- **users:** `id` (UUID), `name`, `email`, `password_hash`, `role`. Optional: `is_active`, `created_at`, `updated_at`
- **products:** `id`, `name`, `description`, `price`, `category`, `stock`, `image`, `created_by`, and optionally `rating`, `num_reviews`, `created_at`, `updated_at`

If you see errors like `Could not find the 'name' column`, your Supabase tables use different column names. Either align your schema with the above or use Option 2 and edit the SQL to match your columns.

## Option 2: SQL in Supabase Dashboard

1. In Supabase, go to **SQL Editor**.
2. Run the migrations first (so all tables exist):
   - Run `supabase/migrations/001_admin_tables.sql`.
3. Ensure **users** and **products** tables exist with the expected columns (see above). If not, create them (see below).
4. Run `supabase/seed-data.sql` in the SQL Editor.

**Admin login after SQL seed:** `admin@shophub.com` / `admin123`  
(The SQL file uses a pre-generated bcrypt hash for `admin123`.)

**Customer passwords in SQL seed:** The hash in the file is for `password` (Laravel default). To use `password123` for customers, run the Node seed once for users only, or generate a bcrypt hash and replace it in the SQL.

## Creating `users` and `products` tables (if missing)

Run this in Supabase SQL Editor **before** seeding if you don’t have these tables yet:

```sql
-- Users table (for app auth; not Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  category TEXT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  image TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  num_reviews INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Then run `001_admin_tables.sql` for categories, brands, orders, order_items, coupons, reviews, and finally run the seed (Node or SQL).
