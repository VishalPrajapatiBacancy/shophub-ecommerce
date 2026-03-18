import type { DashboardStats, ChartDataPoint, TopProduct } from '@/types';

export const dashboardStats: DashboardStats = {
  totalRevenue: 284750.00,
  revenueChange: 12.5,
  totalOrders: 1847,
  ordersChange: 8.2,
  totalCustomers: 3249,
  customersChange: 15.3,
  totalProducts: 456,
  productsChange: -2.4,
};

export const revenueChartData: ChartDataPoint[] = [
  { name: 'Jan', revenue: 18500, orders: 142 },
  { name: 'Feb', revenue: 22300, orders: 168 },
  { name: 'Mar', revenue: 19800, orders: 155 },
  { name: 'Apr', revenue: 27400, orders: 201 },
  { name: 'May', revenue: 25100, orders: 189 },
  { name: 'Jun', revenue: 31200, orders: 234 },
  { name: 'Jul', revenue: 28900, orders: 212 },
  { name: 'Aug', revenue: 34500, orders: 256 },
  { name: 'Sep', revenue: 30100, orders: 228 },
  { name: 'Oct', revenue: 36800, orders: 271 },
  { name: 'Nov', revenue: 42300, orders: 312 },
  { name: 'Dec', revenue: 38900, orders: 289 },
];

export const topProducts: TopProduct[] = [
  { id: '1', name: 'Wireless Bluetooth Headphones', thumbnail: '', sales: 342, revenue: 25650 },
  { id: '2', name: 'Smart Watch Pro', thumbnail: '', sales: 289, revenue: 43350 },
  { id: '3', name: 'Organic Cotton T-Shirt', thumbnail: '', sales: 256, revenue: 7680 },
  { id: '4', name: 'Running Shoes Ultra', thumbnail: '', sales: 198, revenue: 23760 },
  { id: '5', name: 'Laptop Stand Adjustable', thumbnail: '', sales: 176, revenue: 8800 },
];
