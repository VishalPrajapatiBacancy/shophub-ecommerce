/**
 * Admin panel API – all calls to backend /api/admin/* (requires auth token + admin role)
 */
import { apiClient } from '@/lib/api-client';
import type {
  DashboardStats,
  ChartDataPoint,
  TopProduct,
  Product,
  Order,
  Customer,
  Category,
  Brand,
  Coupon,
  Review,
  Vendor,
  VendorPayout,
} from '@/types';

const BASE = '/admin';

export interface DashboardResponse {
  success: boolean;
  data: {
    stats: DashboardStats;
    revenueChartData: ChartDataPoint[];
    topProducts: TopProduct[];
    recentOrders: Array<{
      id: string;
      orderNumber: string;
      total: number;
      status: string;
      createdAt: string;
      customer: { id: string; name: string; email: string };
    }>;
    ordersByStatus: Record<string, number>;
  };
}

export interface ApiListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  paymentStatus?: string;
  productId?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  period?: string;
  priority?: string;
  method?: string;
}

function buildParams(params?: ApiListParams): Record<string, string> {
  const p: Record<string, string> = {};
  if (!params) return p;
  if (params.page != null) p.page = String(params.page);
  if (params.limit != null) p.limit = String(params.limit);
  if (params.search) p.search = params.search;
  if (params.status) p.status = params.status;
  if (params.category) p.category = params.category;
  if (params.paymentStatus) p.paymentStatus = params.paymentStatus;
  if (params.productId) p.productId = params.productId;
  if (params.sort) p.sort = params.sort;
  if (params.order) p.order = params.order;
  if (params.period) p.period = params.period;
  if (params.priority) p.priority = params.priority;
  if (params.method) p.method = params.method;
  return p;
}

export const adminApi = {
  // ─── Dashboard ────────────────────────────────────────────────────────────
  getDashboard(): Promise<DashboardResponse> {
    return apiClient.get<DashboardResponse>(`${BASE}/dashboard`);
  },

  // ─── Products ─────────────────────────────────────────────────────────────
  getProducts(params?: ApiListParams): Promise<{ success: boolean; data: Product[]; total: number; page: number; limit: number; totalPages: number }> {
    return apiClient.get(`${BASE}/products`, { params: buildParams(params) });
  },
  getProduct(id: string): Promise<{ success: boolean; data: Product }> {
    return apiClient.get(`${BASE}/products/${id}`);
  },
  createProduct(body: Partial<Product> & { imageUrl?: string; images?: string[] }): Promise<{ success: boolean; data: Product }> {
    return apiClient.post(`${BASE}/products`, body);
  },
  updateProduct(id: string, body: Partial<Product> & { imageUrl?: string; images?: string[] }): Promise<{ success: boolean; data: Product }> {
    return apiClient.put(`${BASE}/products/${id}`, body);
  },
  deleteProduct(id: string): Promise<{ success: boolean }> {
    return apiClient.delete(`${BASE}/products/${id}`);
  },

  // ─── Categories ───────────────────────────────────────────────────────────
  getCategories(params?: ApiListParams): Promise<{ success: boolean; data: Category[]; total: number; page: number; limit: number; totalPages: number }> {
    return apiClient.get(`${BASE}/categories`, { params: buildParams(params) });
  },
  getCategory(id: string): Promise<{ success: boolean; data: Category }> {
    return apiClient.get(`${BASE}/categories/${id}`);
  },
  createCategory(body: Partial<Category>): Promise<{ success: boolean; data: Category }> {
    return apiClient.post(`${BASE}/categories`, body);
  },
  updateCategory(id: string, body: Partial<Category>): Promise<{ success: boolean; data: Category }> {
    return apiClient.put(`${BASE}/categories/${id}`, body);
  },
  deleteCategory(id: string): Promise<{ success: boolean }> {
    return apiClient.delete(`${BASE}/categories/${id}`);
  },

  // ─── Brands ───────────────────────────────────────────────────────────────
  getBrands(params?: ApiListParams): Promise<{ success: boolean; data: Brand[]; total: number; page: number; limit: number; totalPages: number }> {
    return apiClient.get(`${BASE}/brands`, { params: buildParams(params) });
  },
  getBrand(id: string): Promise<{ success: boolean; data: Brand }> {
    return apiClient.get(`${BASE}/brands/${id}`);
  },
  createBrand(body: Partial<Brand>): Promise<{ success: boolean; data: Brand }> {
    return apiClient.post(`${BASE}/brands`, body);
  },
  updateBrand(id: string, body: Partial<Brand>): Promise<{ success: boolean; data: Brand }> {
    return apiClient.put(`${BASE}/brands/${id}`, body);
  },
  deleteBrand(id: string): Promise<{ success: boolean }> {
    return apiClient.delete(`${BASE}/brands/${id}`);
  },

  // ─── Orders ───────────────────────────────────────────────────────────────
  getOrders(params?: ApiListParams): Promise<{ success: boolean; data: Order[]; total: number; page: number; limit: number; totalPages: number }> {
    return apiClient.get(`${BASE}/orders`, { params: buildParams(params) });
  },
  getOrder(id: string): Promise<{ success: boolean; data: Order }> {
    return apiClient.get(`${BASE}/orders/${id}`);
  },
  updateOrderStatus(id: string, body: { status?: string; trackingNumber?: string }): Promise<{ success: boolean; data: unknown }> {
    return apiClient.patch(`${BASE}/orders/${id}`, body);
  },

  // ─── Customers ────────────────────────────────────────────────────────────
  getCustomers(params?: ApiListParams): Promise<{ success: boolean; data: Customer[]; total: number; page: number; limit: number; totalPages: number }> {
    return apiClient.get(`${BASE}/customers`, { params: buildParams(params) });
  },
  getCustomer(id: string): Promise<{ success: boolean; data: Customer }> {
    return apiClient.get(`${BASE}/customers/${id}`);
  },
  createCustomer(body: { name: string; email: string; phone?: string; password: string }): Promise<{ success: boolean; data: Customer }> {
    return apiClient.post(`${BASE}/customers`, body);
  },

  // ─── Coupons ──────────────────────────────────────────────────────────────
  getCoupons(params?: ApiListParams): Promise<{ success: boolean; data: Coupon[]; total: number; page: number; limit: number; totalPages: number }> {
    return apiClient.get(`${BASE}/coupons`, { params: buildParams(params) });
  },
  getCoupon(id: string): Promise<{ success: boolean; data: Coupon }> {
    return apiClient.get(`${BASE}/coupons/${id}`);
  },
  createCoupon(body: Partial<Coupon>): Promise<{ success: boolean; data: Coupon }> {
    return apiClient.post(`${BASE}/coupons`, body);
  },
  updateCoupon(id: string, body: Partial<Coupon>): Promise<{ success: boolean; data: Coupon }> {
    return apiClient.put(`${BASE}/coupons/${id}`, body);
  },
  deleteCoupon(id: string): Promise<{ success: boolean }> {
    return apiClient.delete(`${BASE}/coupons/${id}`);
  },

  // ─── Reviews ──────────────────────────────────────────────────────────────
  getReviews(params?: ApiListParams): Promise<{ success: boolean; data: Review[]; total: number; page: number; limit: number; totalPages: number }> {
    return apiClient.get(`${BASE}/reviews`, { params: buildParams(params) });
  },
  getReview(id: string): Promise<{ success: boolean; data: Review }> {
    return apiClient.get(`${BASE}/reviews/${id}`);
  },
  updateReviewStatus(id: string, status: string): Promise<{ success: boolean }> {
    return apiClient.patch(`${BASE}/reviews/${id}`, { status });
  },
  deleteReview(id: string): Promise<{ success: boolean }> {
    return apiClient.delete(`${BASE}/reviews/${id}`);
  },

  // ─── Inventory ────────────────────────────────────────────────────────────
  getInventory(): Promise<{ success: boolean; data: { stats: Record<string, number>; products: unknown[] } }> {
    return apiClient.get(`${BASE}/inventory`);
  },
  updateStock(id: string, body: { adjustment: number; reason: string; notes?: string }): Promise<{ success: boolean; data: unknown }> {
    return apiClient.patch(`${BASE}/inventory/${id}/stock`, body);
  },

  // ─── Returns ──────────────────────────────────────────────────────────────
  getReturns(params?: ApiListParams): Promise<{ success: boolean; data: unknown[]; total: number; page: number; limit: number; totalPages: number }> {
    return apiClient.get(`${BASE}/returns`, { params: buildParams(params) });
  },
  updateReturn(id: string, body: { status?: string; refundStatus?: string }): Promise<{ success: boolean; data: unknown }> {
    return apiClient.patch(`${BASE}/returns/${id}`, body);
  },

  // ─── Payments ─────────────────────────────────────────────────────────────
  getPayments(params?: ApiListParams): Promise<{ success: boolean; data: unknown[]; stats: Record<string, unknown>; total: number; page: number; limit: number; totalPages: number }> {
    return apiClient.get(`${BASE}/payments`, { params: buildParams(params) });
  },

  // ─── Analytics ────────────────────────────────────────────────────────────
  getAnalytics(params?: ApiListParams): Promise<{ success: boolean; data: unknown }> {
    return apiClient.get(`${BASE}/analytics`, { params: buildParams(params) });
  },

  // ─── Notifications ────────────────────────────────────────────────────────
  getNotifications(params?: ApiListParams): Promise<{ success: boolean; data: unknown[]; total: number; page: number; limit: number; totalPages: number }> {
    return apiClient.get(`${BASE}/notifications`, { params: buildParams(params) });
  },
  sendNotification(body: { title: string; message: string; type?: string; targetType?: string }): Promise<{ success: boolean; data: unknown }> {
    return apiClient.post(`${BASE}/notifications`, body);
  },

  // ─── Roles ────────────────────────────────────────────────────────────────
  getRoles(): Promise<{ success: boolean; data: unknown[] }> {
    return apiClient.get(`${BASE}/roles`);
  },
  createRole(body: { name: string; description?: string; permissions?: Record<string, string[]> }): Promise<{ success: boolean; data: unknown }> {
    return apiClient.post(`${BASE}/roles`, body);
  },
  updateRole(id: string, body: { name?: string; description?: string; permissions?: Record<string, string[]> }): Promise<{ success: boolean; data: unknown }> {
    return apiClient.put(`${BASE}/roles/${id}`, body);
  },
  deleteRole(id: string): Promise<{ success: boolean }> {
    return apiClient.delete(`${BASE}/roles/${id}`);
  },

  // ─── Support ──────────────────────────────────────────────────────────────
  getTickets(params?: ApiListParams): Promise<{ success: boolean; data: unknown[]; total: number; page: number; limit: number; totalPages: number }> {
    return apiClient.get(`${BASE}/support`, { params: buildParams(params) });
  },
  getTicket(id: string): Promise<{ success: boolean; data: unknown }> {
    return apiClient.get(`${BASE}/support/${id}`);
  },
  createTicket(body: { subject: string; customerName?: string; customerEmail?: string; category?: string; priority?: string; message?: string }): Promise<{ success: boolean; data: unknown }> {
    return apiClient.post(`${BASE}/support`, body);
  },
  updateTicket(id: string, body: { status?: string; priority?: string; assignedTo?: string }): Promise<{ success: boolean; data: unknown }> {
    return apiClient.patch(`${BASE}/support/${id}`, body);
  },

  // ─── Settings ─────────────────────────────────────────────────────────────
  getSettings(): Promise<{ success: boolean; data: Record<string, unknown> }> {
    return apiClient.get(`${BASE}/settings`);
  },
  updateSettings(body: Record<string, unknown>): Promise<{ success: boolean; data: Record<string, unknown> }> {
    return apiClient.put(`${BASE}/settings`, body);
  },

  // ─── Banners ──────────────────────────────────────────────────────────────
  getBanners(params?: ApiListParams): Promise<{ success: boolean; data: unknown[]; total: number; page: number; limit: number; totalPages: number }> {
    return apiClient.get(`${BASE}/banners`, { params: buildParams(params) });
  },
  getBanner(id: string): Promise<{ success: boolean; data: unknown }> {
    return apiClient.get(`${BASE}/banners/${id}`);
  },
  createBanner(body: Record<string, unknown>): Promise<{ success: boolean; data: unknown }> {
    return apiClient.post(`${BASE}/banners`, body);
  },
  updateBanner(id: string, body: Record<string, unknown>): Promise<{ success: boolean; data: unknown }> {
    return apiClient.put(`${BASE}/banners/${id}`, body);
  },
  deleteBanner(id: string): Promise<{ success: boolean }> {
    return apiClient.delete(`${BASE}/banners/${id}`);
  },

  // ─── Vendors ──────────────────────────────────────────────────────────────
  getMyVendorProfile(): Promise<{ success: boolean; data: Vendor }> {
    return apiClient.get(`${BASE}/vendors/me`);
  },
  updateMyVendorProfile(body: Partial<Vendor>): Promise<{ success: boolean; data: Vendor }> {
    return apiClient.put(`${BASE}/vendors/me`, body);
  },
  getVendors(params?: ApiListParams): Promise<{ success: boolean; data: Vendor[]; total: number; page: number; limit: number; totalPages: number }> {
    return apiClient.get(`${BASE}/vendors`, { params: buildParams(params) });
  },
  getVendor(id: string): Promise<{ success: boolean; data: Vendor }> {
    return apiClient.get(`${BASE}/vendors/${id}`);
  },
  createVendor(body: Partial<Vendor>): Promise<{ success: boolean; data: Vendor }> {
    return apiClient.post(`${BASE}/vendors`, body);
  },
  updateVendor(id: string, body: Partial<Vendor>): Promise<{ success: boolean; data: Vendor }> {
    return apiClient.put(`${BASE}/vendors/${id}`, body);
  },
  deleteVendor(id: string): Promise<{ success: boolean }> {
    return apiClient.delete(`${BASE}/vendors/${id}`);
  },
  updateVendorStatus(id: string, status: string): Promise<{ success: boolean; data: Vendor }> {
    return apiClient.patch(`${BASE}/vendors/${id}/status`, { status });
  },
  getVendorProducts(id: string, params?: ApiListParams): Promise<{ success: boolean; data: Product[]; total: number; page: number; limit: number; totalPages: number }> {
    return apiClient.get(`${BASE}/vendors/${id}/products`, { params: buildParams(params) });
  },

  // ─── Vendor Payouts ───────────────────────────────────────────────────────
  getVendorPayouts(params?: ApiListParams & { vendorId?: string }): Promise<{ success: boolean; data: VendorPayout[]; total: number; page: number; limit: number; totalPages: number }> {
    const p = buildParams(params);
    if (params?.vendorId) p.vendorId = params.vendorId;
    return apiClient.get(`${BASE}/vendor-payouts`, { params: p });
  },
  createVendorPayout(body: { vendorId: string; amount: number; periodStart?: string; periodEnd?: string; ordersCount?: number; notes?: string }): Promise<{ success: boolean; data: VendorPayout }> {
    return apiClient.post(`${BASE}/vendor-payouts`, body);
  },
  updatePayoutStatus(id: string, status: string, transactionId?: string): Promise<{ success: boolean; data: VendorPayout }> {
    return apiClient.patch(`${BASE}/vendor-payouts/${id}/status`, { status, transactionId });
  },

  // ─── Image Upload ─────────────────────────────────────────────────────────
  uploadImage(file: File, folder = 'general'): Promise<{ success: boolean; url: string }> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    return apiClient.upload(`${BASE}/upload`, fd);
  },
};
