import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Tags,
  Ticket,
  Star,
  Warehouse,
  BarChart3,
  Undo2,
  Truck,
  CreditCard,
  Bell,
  Shield,
  Settings,
  HeadphonesIcon,
  Image,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  group: string;
}

export const navigation: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, group: 'Main' },
  { label: 'Products', path: '/products', icon: Package, group: 'Catalog' },
  { label: 'Categories', path: '/categories', icon: FolderTree, group: 'Catalog' },
  { label: 'Brands', path: '/brands', icon: Tags, group: 'Catalog' },
  { label: 'Inventory', path: '/inventory', icon: Warehouse, group: 'Catalog' },
  { label: 'Orders', path: '/orders', icon: ShoppingCart, group: 'Sales' },
  { label: 'Customers', path: '/customers', icon: Users, group: 'Sales' },
  { label: 'Coupons', path: '/coupons', icon: Ticket, group: 'Sales' },
  { label: 'Banners', path: '/banners', icon: Image, group: 'Sales' },
  { label: 'Reviews', path: '/reviews', icon: Star, group: 'Sales' },
  { label: 'Returns', path: '/returns', icon: Undo2, group: 'Sales' },
  { label: 'Shipping', path: '/shipping', icon: Truck, group: 'Operations' },
  { label: 'Payments', path: '/payments', icon: CreditCard, group: 'Operations' },
  { label: 'Analytics', path: '/analytics', icon: BarChart3, group: 'Reports' },
  { label: 'Notifications', path: '/notifications', icon: Bell, group: 'System' },
  { label: 'Roles', path: '/roles', icon: Shield, group: 'System' },
  { label: 'Support', path: '/support', icon: HeadphonesIcon, group: 'System' },
  { label: 'Settings', path: '/settings', icon: Settings, group: 'System' },
];

export function getNavGroups(): { group: string; items: NavItem[] }[] {
  const groups: Record<string, NavItem[]> = {};
  for (const item of navigation) {
    if (!groups[item.group]) groups[item.group] = [];
    groups[item.group].push(item);
  }
  return Object.entries(groups).map(([group, items]) => ({ group, items }));
}
