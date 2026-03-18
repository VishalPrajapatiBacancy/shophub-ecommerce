import express from 'express';
import { protect } from '../middleware/auth.middleware.js';

import { listCategories, getCategoryById } from '../controllers/public/categories.controller.js';
import { listBanners } from '../controllers/public/banners.controller.js';
import {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
} from '../controllers/public/cart.controller.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
} from '../controllers/public/wishlist.controller.js';
import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
} from '../controllers/public/order.controller.js';
import {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefault,
} from '../controllers/public/address.controller.js';
import { validateCoupon } from '../controllers/public/coupon.controller.js';
import { getProductReviews, submitReview } from '../controllers/public/review.controller.js';
import { listVendors, getVendorByIdOrSlug, getVendorProducts } from '../controllers/public/vendor.controller.js';

const router = express.Router();

// ─── Categories ───────────────────────────────────────────────────────────────
router.get('/categories', listCategories);
router.get('/categories/:idOrSlug', getCategoryById);

// ─── Banners ──────────────────────────────────────────────────────────────────
router.get('/banners', listBanners);

// ─── Cart ─────────────────────────────────────────────────────────────────────
router.get('/cart', protect, getCart);
router.post('/cart/add', protect, addToCart);
router.put('/cart', protect, updateCart);
router.delete('/cart/item/:productId', protect, removeFromCart);
router.delete('/cart/clear', protect, clearCart);

// ─── Wishlist ─────────────────────────────────────────────────────────────────
// NOTE: /wishlist/check must be defined BEFORE /wishlist/:productId to avoid
// Express matching "check" as a :productId param
router.get('/wishlist/check', protect, checkWishlist);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist', protect, addToWishlist);
router.delete('/wishlist/:productId', protect, removeFromWishlist);

// ─── Orders ───────────────────────────────────────────────────────────────────
router.get('/orders', protect, getOrders);
router.post('/orders', protect, createOrder);
router.get('/orders/:id', protect, getOrderById);
router.patch('/orders/:id/cancel', protect, cancelOrder);

// ─── Addresses ────────────────────────────────────────────────────────────────
router.get('/addresses', protect, listAddresses);
router.post('/addresses', protect, createAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);
router.patch('/addresses/:id/default', protect, setDefault);

// ─── Coupons ──────────────────────────────────────────────────────────────────
router.post('/coupons/validate', validateCoupon);

// ─── Reviews ──────────────────────────────────────────────────────────────────
router.get('/products/:productId/reviews', getProductReviews);
router.post('/products/:productId/reviews', protect, submitReview);

// ─── Vendors (public) ─────────────────────────────────────────────────────────
router.get('/vendors', listVendors);
router.get('/vendors/:idOrSlug/products', getVendorProducts);
router.get('/vendors/:idOrSlug', getVendorByIdOrSlug);

export default router;
