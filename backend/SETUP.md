# ShopHub Backend — Quick Setup Guide

## Admin Login Credentials
```
Email:    admin@shophub.com
Password: admin123
```

## Step 1: Set Up Database Schema (Supabase SQL Editor)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project → **SQL Editor**
3. Copy and run the contents of `supabase/RESET_AND_SETUP.sql`
   - This drops old tables, recreates the correct schema, and seeds all demo data
   - Admin user profile and all demo orders/products/categories will be inserted

## Step 2: Seed Auth Users (Optional — for customer login testing)

```bash
cd backend
node scripts/seed-database.js
```

This creates Supabase Auth accounts for:
- `john@example.com` / `password123`
- `sarah@example.com` / `password123`
- `mike@example.com` / `password123`

## Step 3: Start the Backend

```bash
cd backend
npm run dev   # development (nodemon)
# or
npm start     # production
```

Backend runs on `http://localhost:5000`

## Step 4: Start the Admin Panel

```bash
cd admin_panel
npm run dev
```

Admin panel runs on `http://localhost:5173` and proxies `/api` to the backend.

---

## Troubleshooting

### "Invalid email or password"
Run `Step 1` (RESET_AND_SETUP.sql) to fix the database schema, then restart the backend.

### Dashboard shows all zeros
Run `Step 1` (RESET_AND_SETUP.sql) — it seeds demo orders, products, and customers.

### Auth middleware errors
The backend now uses **Supabase Auth JWT tokens** (not custom JWTs). Tokens are valid for 1 hour.

---

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/users/login | Admin login |
| POST | /api/users/register | Register user |
| GET | /api/admin/dashboard | Dashboard stats |
| GET | /api/admin/products | List products |
| GET | /api/admin/orders | List orders |
| GET | /api/admin/customers | List customers |
| GET | /api/admin/categories | List categories |
| GET | /api/admin/brands | List brands |
| GET | /api/admin/coupons | List coupons |
| GET | /api/admin/reviews | List reviews |
