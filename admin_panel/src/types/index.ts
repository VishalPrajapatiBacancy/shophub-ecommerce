export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku: string;
  barcode?: string;
  stock: number;
  lowStockThreshold: number;
  category: string;
  categoryId: string;
  brand: string;
  brandId: string;
  images: string[];
  thumbnail: string;
  status: 'active' | 'draft' | 'archived' | 'out_of_stock';
  rating: number;
  reviewCount: number;
  tags: string[];
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'placed' | 'confirmed' | 'packed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned' | 'refunded';
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  shippingAddress: Address;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  thumbnail?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  status: 'active' | 'inactive' | 'blocked';
  addresses: Address[];
  createdAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: string;
  productCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  productCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'disabled';
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customer: { id: string; name: string; avatar?: string };
  rating: number;
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalCustomers: number;
  customersChange: number;
  totalProducts: number;
  productsChange: number;
}

export interface ChartDataPoint {
  name: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  name: string;
  thumbnail: string;
  sales: number;
  revenue: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Vendor {
  id: string;
  storeName: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: Record<string, string>;
  commissionRate: number;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  totalRevenue: number;
  totalOrders: number;
  rating: number;
  bankAccount?: Record<string, string>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorPayout {
  id: string;
  vendorId: string;
  vendors?: { storeName: string };
  amount: number;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  periodStart?: string;
  periodEnd?: string;
  ordersCount: number;
  transactionId?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'product' | 'customer' | 'system';
  read: boolean;
  createdAt: string;
}
