import express from 'express';
import multer from 'multer';
import { protect, admin } from '../../middleware/auth.middleware.js';
import { getDashboard } from '../../controllers/admin/dashboard.controller.js';
import * as categoryController from '../../controllers/admin/category.controller.js';
import * as brandController from '../../controllers/admin/brand.controller.js';
import * as orderController from '../../controllers/admin/order.controller.js';
import * as customerController from '../../controllers/admin/customer.controller.js';
import * as couponController from '../../controllers/admin/coupon.controller.js';
import * as reviewController from '../../controllers/admin/review.controller.js';
import * as productAdminController from '../../controllers/admin/product.controller.js';
import * as inventoryController from '../../controllers/admin/inventory.controller.js';
import * as returnsController from '../../controllers/admin/returns.controller.js';
import * as paymentsController from '../../controllers/admin/payments.controller.js';
import * as analyticsController from '../../controllers/admin/analytics.controller.js';
import * as notificationsController from '../../controllers/admin/notifications.controller.js';
import * as rolesController from '../../controllers/admin/roles.controller.js';
import * as supportController from '../../controllers/admin/support.controller.js';
import * as settingsController from '../../controllers/admin/settings.controller.js';
import * as uploadController from '../../controllers/admin/upload.controller.js';
import * as bannerController from '../../controllers/admin/banner.controller.js';
import * as vendorController from '../../controllers/admin/vendor.controller.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.use(protect);
router.use(admin);

// Dashboard
router.get('/dashboard', getDashboard);

// Products (admin CRUD)
router.get('/products', productAdminController.listProducts);
router.get('/products/:id', productAdminController.getProductById);
router.post('/products', productAdminController.createProduct);
router.put('/products/:id', productAdminController.updateProduct);
router.delete('/products/:id', productAdminController.deleteProduct);

// Categories
router.get('/categories', categoryController.listCategories);
router.get('/categories/:id', categoryController.getCategoryById);
router.post('/categories', categoryController.createCategory);
router.put('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// Brands
router.get('/brands', brandController.listBrands);
router.get('/brands/:id', brandController.getBrandById);
router.post('/brands', brandController.createBrand);
router.put('/brands/:id', brandController.updateBrand);
router.delete('/brands/:id', brandController.deleteBrand);

// Orders
router.get('/orders', orderController.listOrders);
router.get('/orders/:id', orderController.getOrderById);
router.patch('/orders/:id', orderController.updateOrderStatus);

// Customers
router.get('/customers', customerController.listCustomers);
router.get('/customers/:id', customerController.getCustomerById);
router.post('/customers', customerController.createCustomer);

// Coupons
router.get('/coupons', couponController.listCoupons);
router.get('/coupons/:id', couponController.getCouponById);
router.post('/coupons', couponController.createCoupon);
router.put('/coupons/:id', couponController.updateCoupon);
router.delete('/coupons/:id', couponController.deleteCoupon);

// Reviews
router.get('/reviews', reviewController.listReviews);
router.get('/reviews/:id', reviewController.getReviewById);
router.patch('/reviews/:id', reviewController.updateReviewStatus);
router.delete('/reviews/:id', reviewController.deleteReview);

// Inventory
router.get('/inventory', inventoryController.getInventoryOverview);
router.patch('/inventory/:id/stock', inventoryController.updateStock);

// Returns
router.get('/returns', returnsController.listReturns);
router.patch('/returns/:id', returnsController.updateReturnStatus);

// Payments
router.get('/payments', paymentsController.listPayments);

// Analytics
router.get('/analytics', analyticsController.getAnalytics);

// Notifications
router.get('/notifications', notificationsController.listNotifications);
router.post('/notifications', notificationsController.sendNotification);

// Roles
router.get('/roles', rolesController.listRoles);
router.post('/roles', rolesController.createRole);
router.put('/roles/:id', rolesController.updateRole);
router.delete('/roles/:id', rolesController.deleteRole);

// Support
router.get('/support', supportController.listTickets);
router.get('/support/:id', supportController.getTicket);
router.post('/support', supportController.createTicket);
router.patch('/support/:id', supportController.updateTicket);

// Settings
router.get('/settings', settingsController.getSettings);
router.put('/settings', settingsController.updateSettings);

// Banners
router.get('/banners', bannerController.listBanners);
router.get('/banners/:id', bannerController.getBannerById);
router.post('/banners', bannerController.createBanner);
router.put('/banners/:id', bannerController.updateBanner);
router.delete('/banners/:id', bannerController.deleteBanner);

// Vendors
router.get('/vendors/me', vendorController.getMyVendorProfile);
router.put('/vendors/me', vendorController.updateMyVendorProfile);
router.get('/vendors', vendorController.listVendors);
router.get('/vendors/:id', vendorController.getVendorById);
router.post('/vendors', vendorController.createVendor);
router.put('/vendors/:id', vendorController.updateVendor);
router.delete('/vendors/:id', vendorController.deleteVendor);
router.patch('/vendors/:id/status', vendorController.updateVendorStatus);
router.get('/vendors/:id/products', vendorController.getVendorProducts);

// Vendor Payouts
router.get('/vendor-payouts', vendorController.listPayouts);
router.post('/vendor-payouts', vendorController.createPayout);
router.patch('/vendor-payouts/:id/status', vendorController.updatePayoutStatus);

// Image Upload
router.post('/upload', upload.single('file'), uploadController.uploadImage);

export default router;
