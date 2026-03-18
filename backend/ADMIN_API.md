# Admin Panel API

All admin routes require **Bearer token** (from `POST /api/users/login`) and **admin role**.  
Base path: **`/api/admin`**

## Authentication

- **Login:** `POST /api/users/login` with `{ "email", "password" }`  
  Returns `{ success, data: { token, _id, name, email, role } }`. Use `data.token` in `Authorization: Bearer <token>`.
- User must have `role === 'admin'` to access `/api/admin/*`.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats, chart data, top products, recent orders |
| GET | `/api/admin/products` | List products (paginated, optional: search, category, status, page, limit, sort, order) |
| GET | `/api/admin/categories` | List categories (search, status, page, limit) |
| GET | `/api/admin/categories/:id` | Get category by ID |
| POST | `/api/admin/categories` | Create category |
| PUT | `/api/admin/categories/:id` | Update category |
| DELETE | `/api/admin/categories/:id` | Delete category |
| GET | `/api/admin/brands` | List brands (search, status, page, limit) |
| GET | `/api/admin/brands/:id` | Get brand by ID |
| POST | `/api/admin/brands` | Create brand |
| PUT | `/api/admin/brands/:id` | Update brand |
| DELETE | `/api/admin/brands/:id` | Delete brand |
| GET | `/api/admin/orders` | List orders (search, status, paymentStatus, page, limit, sort, order) |
| GET | `/api/admin/orders/:id` | Get order by ID (with items) |
| PATCH | `/api/admin/orders/:id` | Update order (body: status, trackingNumber) |
| GET | `/api/admin/customers` | List customers (search, status, page, limit) |
| GET | `/api/admin/customers/:id` | Get customer by ID |
| GET | `/api/admin/coupons` | List coupons (search, status, page, limit) |
| GET | `/api/admin/coupons/:id` | Get coupon by ID |
| POST | `/api/admin/coupons` | Create coupon |
| PUT | `/api/admin/coupons/:id` | Update coupon |
| DELETE | `/api/admin/coupons/:id` | Delete coupon |
| GET | `/api/admin/reviews` | List reviews (status, productId, page, limit) |
| GET | `/api/admin/reviews/:id` | Get review by ID |
| PATCH | `/api/admin/reviews/:id` | Update review status (body: status) |
| DELETE | `/api/admin/reviews/:id` | Delete review |

## Response shape (typical)

- **List:** `{ success: true, data: T[], total, page, limit, totalPages }`
- **Single:** `{ success: true, data: T }`
- **Create:** `201` with `{ success: true, data: T }`
- **Error:** `{ success: false, message: string }`

## Supabase tables

Existing: `users`, `products`.  
For full admin features, create extra tables via **Supabase SQL Editor** using:

- `backend/supabase/migrations/001_admin_tables.sql`

That migration adds: `categories`, `brands`, `orders`, `order_items`, `coupons`, `reviews`.  
If a table is missing, list endpoints return empty data; create/update/delete return an error.
