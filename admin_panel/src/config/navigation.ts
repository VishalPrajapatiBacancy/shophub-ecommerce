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
  Store,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  group: string;
  roles: string[]; // which roles can see this item
}

const ALL = ['admin', 'vendor'];
const ADMIN = ['admin'];

export const navigation: NavItem[] = [
  { label: 'Dashboard',     path: '/',             icon: LayoutDashboard, group: 'Main',       roles: ALL },
  { label: 'Products',      path: '/products',     icon: Package,         group: 'Catalog',    roles: ALL },
  { label: 'Categories',    path: '/categories',   icon: FolderTree,      group: 'Catalog',    roles: ADMIN },
  { label: 'Brands',        path: '/brands',       icon: Tags,            group: 'Catalog',    roles: ADMIN },
  { label: 'Inventory',     path: '/inventory',    icon: Warehouse,       group: 'Catalog',    roles: ADMIN },
  { label: 'Vendors',       path: '/vendors',      icon: Store,           group: 'Sales',      roles: ALL },
  { label: 'Orders',        path: '/orders',       icon: ShoppingCart,    group: 'Sales',      roles: ALL },
  { label: 'Customers',     path: '/customers',    icon: Users,           group: 'Sales',      roles: ADMIN },
  { label: 'Coupons',       path: '/coupons',      icon: Ticket,          group: 'Sales',      roles: ADMIN },
  { label: 'Banners',       path: '/banners',      icon: Image,           group: 'Sales',      roles: ADMIN },
  { label: 'Reviews',       path: '/reviews',      icon: Star,            group: 'Sales',      roles: ADMIN },
  { label: 'Returns',       path: '/returns',      icon: Undo2,           group: 'Sales',      roles: ADMIN },
  { label: 'Shipping',      path: '/shipping',     icon: Truck,           group: 'Operations', roles: ADMIN },
  { label: 'Payments',      path: '/payments',     icon: CreditCard,      group: 'Operations', roles: ADMIN },
  { label: 'Analytics',     path: '/analytics',    icon: BarChart3,       group: 'Reports',    roles: ADMIN },
  { label: 'Notifications', path: '/notifications',icon: Bell,            group: 'System',     roles: ADMIN },
  { label: 'Roles',         path: '/roles',        icon: Shield,          group: 'System',     roles: ADMIN },
  { label: 'Support',       path: '/support',      icon: HeadphonesIcon,  group: 'System',     roles: ADMIN },
  { label: 'Settings',      path: '/settings',     icon: Settings,        group: 'System',     roles: ADMIN },
];

export function getNavGroups(userRole = 'admin'): { group: string; items: NavItem[] }[] {
  const groups: Record<string, NavItem[]> = {};
  for (const item of navigation) {
    if (!item.roles.includes(userRole)) continue;
    if (!groups[item.group]) groups[item.group] = [];
    groups[item.group].push(item);
  }
  return Object.entries(groups).map(([group, items]) => ({ group, items }));
}
