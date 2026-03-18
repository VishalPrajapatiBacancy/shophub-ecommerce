import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ProductsListPage } from '@/pages/products/ProductsListPage';
import { OrdersListPage } from '@/pages/orders/OrdersListPage';
import { CustomersListPage } from '@/pages/customers/CustomersListPage';
import { CategoriesListPage } from '@/pages/categories/CategoriesListPage';
import { BrandsListPage } from '@/pages/brands/BrandsListPage';
import { InventoryPage } from '@/pages/inventory/InventoryPage';
import { CouponsListPage } from '@/pages/coupons/CouponsListPage';
import { ReviewsListPage } from '@/pages/reviews/ReviewsListPage';
import { ReturnsPage } from '@/pages/returns/ReturnsPage';
import { ShippingPage } from '@/pages/shipping/ShippingPage';
import { PaymentsPage } from '@/pages/payments/PaymentsPage';
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { RolesPage } from '@/pages/roles/RolesPage';
import { SupportPage } from '@/pages/support/SupportPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { BannersPage } from '@/pages/banners/BannersPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'products', element: <ProductsListPage /> },
      { path: 'orders', element: <OrdersListPage /> },
      { path: 'customers', element: <CustomersListPage /> },
      { path: 'categories', element: <CategoriesListPage /> },
      { path: 'brands', element: <BrandsListPage /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'coupons', element: <CouponsListPage /> },
      { path: 'reviews', element: <ReviewsListPage /> },
      { path: 'returns', element: <ReturnsPage /> },
      { path: 'shipping', element: <ShippingPage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'roles', element: <RolesPage /> },
      { path: 'support', element: <SupportPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'banners', element: <BannersPage /> },
    ],
  },
]);
