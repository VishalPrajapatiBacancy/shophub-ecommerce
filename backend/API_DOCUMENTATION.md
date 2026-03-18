# API Documentation

## Base URL
```
http://localhost:5000
```

## Response Format

All responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ /* validation errors if any */ ]
}
```

---

## Authentication

### Register User
**Endpoint:** `POST /api/users/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "jwt_token_here"
  }
}
```

### Login User
**Endpoint:** `POST /api/users/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "jwt_token_here"
  }
}
```

---

## User Management

### Get User Profile
**Endpoint:** `GET /api/users/profile`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true
  }
}
```

### Update User Profile
**Endpoint:** `PUT /api/users/profile`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "password": "newpassword123" // optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Updated",
    "email": "john.updated@example.com",
    "role": "user",
    "token": "new_jwt_token"
  }
}
```

### Get All Users (Admin Only)
**Endpoint:** `GET /api/users`

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
    // ... more users
  ]
}
```

---

## Product Management

### Get All Products
**Endpoint:** `GET /api/products`

**Query Parameters:**
- `category` (optional) - Filter by category
- `search` (optional) - Search in name and description
- `sort` (optional) - Sort options: `price_asc`, `price_desc`, `rating`, default: newest first

**Examples:**
```
GET /api/products
GET /api/products?category=Electronics
GET /api/products?search=laptop
GET /api/products?sort=price_asc
GET /api/products?category=Electronics&sort=rating
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "product_id",
      "name": "Laptop",
      "description": "High-performance laptop",
      "price": 999.99,
      "category": "Electronics",
      "stock": 50,
      "image": "laptop.jpg",
      "rating": 4.5,
      "numReviews": 100,
      "createdBy": {
        "_id": "user_id",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
    // ... more products
  ]
}
```

### Get Product by ID
**Endpoint:** `GET /api/products/:id`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "product_id",
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "category": "Electronics",
    "stock": 50,
    "image": "laptop.jpg",
    "rating": 4.5,
    "numReviews": 100,
    "createdBy": {
      "_id": "user_id",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Create Product (Admin Only)
**Endpoint:** `POST /api/products`

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "name": "Laptop",
  "description": "High-performance laptop with latest specs",
  "price": 999.99,
  "category": "Electronics",
  "stock": 50,
  "image": "laptop.jpg" // optional
}
```

**Valid Categories:**
- Electronics
- Clothing
- Books
- Home
- Sports
- Other

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "product_id",
    "name": "Laptop",
    "description": "High-performance laptop with latest specs",
    "price": 999.99,
    "category": "Electronics",
    "stock": 50,
    "image": "laptop.jpg",
    "rating": 0,
    "numReviews": 0,
    "createdBy": "user_id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Product (Admin Only)
**Endpoint:** `PUT /api/products/:id`

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Laptop",
  "description": "Updated description",
  "price": 899.99,
  "category": "Electronics",
  "stock": 30,
  "image": "new-laptop.jpg"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "product_id",
    "name": "Updated Laptop",
    "description": "Updated description",
    "price": 899.99,
    "category": "Electronics",
    "stock": 30,
    "image": "new-laptop.jpg",
    "rating": 4.5,
    "numReviews": 100,
    "createdBy": "user_id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Delete Product (Admin Only)
**Endpoint:** `DELETE /api/products/:id`

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product removed"
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (not authorized) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Authentication Flow

1. **Register** or **Login** to get JWT token
2. Include token in Authorization header for protected routes:
   ```
   Authorization: Bearer <your_jwt_token>
   ```
3. Token expires after 7 days (configurable in .env)

---

## Admin Access

To test admin features, you need to manually update a user's role in the database:

```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Or create an admin seeder script to initialize admin users.

---

## Rate Limiting

Currently not implemented. Consider adding rate limiting in production using packages like:
- `express-rate-limit`
- `rate-limiter-flexible`

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Products
```bash
curl http://localhost:5000/api/products
```

### Create Product (Admin)
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "category": "Electronics",
    "stock": 50
  }'
```
