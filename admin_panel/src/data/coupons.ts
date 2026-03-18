import type { Coupon } from '@/types';

export const coupons: Coupon[] = [
  { id: 'cp1', code: 'WELCOME10', description: '10% off for new customers', type: 'percentage', value: 10, minOrderAmount: 50, usageLimit: 1000, usedCount: 456, startDate: '2024-01-01T00:00:00Z', endDate: '2024-12-31T23:59:59Z', status: 'active', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cp2', code: 'SAVE20', description: '$20 off orders over $100', type: 'fixed', value: 20, minOrderAmount: 100, usageLimit: 500, usedCount: 234, startDate: '2024-02-01T00:00:00Z', endDate: '2024-06-30T23:59:59Z', status: 'active', createdAt: '2024-02-01T00:00:00Z' },
  { id: 'cp3', code: 'SUMMER25', description: '25% off summer collection', type: 'percentage', value: 25, maxDiscount: 50, usageLimit: 200, usedCount: 200, startDate: '2024-06-01T00:00:00Z', endDate: '2024-08-31T23:59:59Z', status: 'expired', createdAt: '2024-05-15T00:00:00Z' },
  { id: 'cp4', code: 'FREESHIP', description: 'Free shipping on all orders', type: 'fixed', value: 5.99, usageLimit: 0, usedCount: 789, startDate: '2024-03-01T00:00:00Z', endDate: '2024-03-31T23:59:59Z', status: 'active', createdAt: '2024-03-01T00:00:00Z' },
  { id: 'cp5', code: 'VIP15', description: '15% off for VIP members', type: 'percentage', value: 15, maxDiscount: 75, usageLimit: 0, usedCount: 123, startDate: '2024-01-01T00:00:00Z', endDate: '2024-12-31T23:59:59Z', status: 'active', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cp6', code: 'FLASH50', description: '$50 off orders over $200', type: 'fixed', value: 50, minOrderAmount: 200, usageLimit: 100, usedCount: 45, startDate: '2024-03-10T00:00:00Z', endDate: '2024-03-15T23:59:59Z', status: 'disabled', createdAt: '2024-03-10T00:00:00Z' },
];
