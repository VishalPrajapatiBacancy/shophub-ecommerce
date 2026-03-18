import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const badgeVariants = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, BadgeProps['variant']> = {
    active: 'success',
    delivered: 'success',
    approved: 'success',
    paid: 'success',
    confirmed: 'info',
    processing: 'info',
    shipped: 'info',
    pending: 'warning',
    draft: 'default',
    inactive: 'default',
    cancelled: 'danger',
    rejected: 'danger',
    failed: 'danger',
    blocked: 'danger',
    returned: 'warning',
    refunded: 'default',
    expired: 'default',
    disabled: 'default',
    archived: 'default',
    out_of_stock: 'danger',
  };

  return (
    <Badge variant={variantMap[status] || 'default'}>
      {status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
    </Badge>
  );
}
