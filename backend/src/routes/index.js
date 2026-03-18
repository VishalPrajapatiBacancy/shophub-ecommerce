import express from 'express';
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';
import adminRoutes from './admin/index.js';
import publicRoutes from './public.routes.js';
import { createAdmin } from '../controllers/setup.controller.js';
import { supabase } from '../config/database.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running...',
    timestamp: new Date().toISOString(),
  });
});

// Supabase connection test (uses Auth API so it doesn't depend on table schema)
router.get('/health/supabase', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return res.status(503).json({
        success: false,
        message: 'Supabase connection failed',
        error: error.message,
      });
    }
    res.json({
      success: true,
      message: 'Supabase connected',
      timestamp: new Date().toISOString(),
      supabase: { connected: true },
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      message: 'Supabase connection error',
      error: err.message,
    });
  }
});

// One-time setup: create admin user (admin@shophub.com / admin123) if not exists
router.post('/setup/create-admin', createAdmin);

// API routes
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/admin', adminRoutes);
router.use('/', publicRoutes);

export default router;
