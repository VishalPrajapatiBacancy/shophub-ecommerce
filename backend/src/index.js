import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import routes from './routes/index.js';
import setupSwagger from './config/swagger.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';
import { runMigrations } from './config/migrate.js';

// Initialize express app
const app = express();

// Middleware
app.use(
  cors({
    origin: '*', // allow all origins; change to your frontend URL if you want to restrict
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger middleware (development)
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to E-Commerce API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      products: '/api/products',
      admin: '/api/admin (dashboard, products, categories, brands, orders, customers, coupons, reviews)',
    },
  });
});

// Swagger docs
setupSwagger(app);

// API routes
app.use('/api', routes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server (only in non-serverless environments)
const PORT = config.port;

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', async () => {
    await runMigrations();
    console.log(`
    ╔═══════════════════════════════════════╗
    ║  Server running in ${config.nodeEnv} mode  ║
    ║  Port: ${PORT}                         ║
    ║  URL: http://localhost:${PORT}         ║
    ╚═══════════════════════════════════════╝
    `);
  });
}

export default app;
