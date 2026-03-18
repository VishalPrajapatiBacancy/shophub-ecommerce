export const API_BASE_URL = '/api';

export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
  REFUNDED: 'refunded',
} as const;

export const ORDER_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-800' },
  processing: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  shipped: { bg: 'bg-purple-100', text: 'text-purple-800' },
  delivered: { bg: 'bg-green-100', text: 'text-green-800' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
  returned: { bg: 'bg-orange-100', text: 'text-orange-800' },
  refunded: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

export const PRODUCT_STATUSES = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
  OUT_OF_STOCK: 'out_of_stock',
} as const;

export const PRODUCT_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-800' },
  draft: { bg: 'bg-gray-100', text: 'text-gray-800' },
  archived: { bg: 'bg-red-100', text: 'text-red-800' },
  out_of_stock: { bg: 'bg-orange-100', text: 'text-orange-800' },
};

export const USER_ROLES = ['super_admin', 'admin', 'manager', 'editor', 'viewer'] as const;

export const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;
export const DEFAULT_ITEMS_PER_PAGE = 10;
