# E-Commerce Backend API

A RESTful API built with Node.js, Express, and MongoDB following the MVC (Model-View-Controller) architecture pattern.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Usage Examples](#usage-examples)

## ✨ Features

- **MVC Architecture** - Clean separation of concerns
- **User Authentication** - JWT-based authentication
- **Role-Based Access Control** - Admin and User roles
- **Product Management** - CRUD operations for products
- **Input Validation** - Request validation using express-validator
- **Error Handling** - Centralized error handling middleware
- **Password Security** - Bcrypt password hashing
- **MongoDB Integration** - Mongoose ODM for database operations
- **CORS Support** - Cross-Origin Resource Sharing enabled
- **Query Features** - Search, filter, and sort products

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Password Hashing**: Bcryptjs
- **CORS**: cors middleware

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection configuration
│   │   └── env.js                # Environment variables configuration
│   ├── controllers/
│   │   ├── user.controller.js    # User business logic
│   │   └── product.controller.js # Product business logic
│   ├── models/
│   │   ├── User.model.js         # User schema and methods
│   │   └── Product.model.js      # Product schema
│   ├── routes/
│   │   ├── index.js              # Main router
│   │   ├── user.routes.js        # User routes
│   │   └── product.routes.js     # Product routes
│   ├── middleware/
│   │   ├── auth.middleware.js    # Authentication & authorization
│   │   ├── error.middleware.js   # Error handling
│   │   └── validator.middleware.js # Input validation
│   └── index.js                  # Application entry point
├── .env.example                  # Example environment variables
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies and scripts
└── README.md                     # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/ecommerce_db
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start at `http://localhost:5000`

## 📡 API Endpoints

### Health Check
- `GET /` - Welcome message
- `GET /api/health` - API health check

### User Routes

#### Public Routes
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user

#### Protected Routes (Requires Authentication)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

#### Admin Routes (Requires Admin Role)
- `GET /api/users` - Get all users

### Product Routes

#### Public Routes
- `GET /api/products` - Get all products (with query filters)
- `GET /api/products/:id` - Get product by ID

#### Admin Routes (Requires Admin Role)
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/ecommerce_db |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost:3000 |

## 📝 Usage Examples

### Register a User

```bash
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login

```bash
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Products (with filters)

```bash
# Get all products
GET /api/products

# Filter by category
GET /api/products?category=Electronics

# Search products
GET /api/products?search=laptop

# Sort products
GET /api/products?sort=price_asc
```

### Create Product (Admin only)

```bash
POST /api/products
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 999.99,
  "category": "Electronics",
  "stock": 50
}
```

## 🔒 Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

The token is returned upon successful registration or login.

## 🧪 Testing

You can test the API using:
- **Postman** - Import the endpoints and test
- **cURL** - Command line testing
- **Thunder Client** (VS Code extension)
- **Insomnia** - API client

## 🏗 MVC Architecture Explanation

### Model (M)
- Defines the data structure and database schema
- Contains business logic related to data
- Located in `src/models/`

### Controller (C)
- Handles incoming requests
- Processes data from models
- Sends responses to clients
- Located in `src/controllers/`

### Routes (R) - Router layer
- Maps URLs to controller functions
- Applies middleware (auth, validation)
- Located in `src/routes/`

### Middleware
- Authentication and authorization
- Input validation
- Error handling
- Located in `src/middleware/`

## 📦 Dependencies

### Production Dependencies
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `dotenv` - Environment variables
- `cors` - CORS middleware
- `express-validator` - Input validation

### Development Dependencies
- `nodemon` - Auto-restart server on changes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

Your Name

## 📧 Support

For support, email your-email@example.com or open an issue in the repository.
