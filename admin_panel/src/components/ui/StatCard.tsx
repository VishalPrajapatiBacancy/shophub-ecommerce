import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export function StatCard({ title, value, change, icon: Icon, iconColor = 'text-primary-600', iconBg = 'bg-primary-50' }: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={cn('rounded-lg p-3', iconBg)}>
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1">
        {isPositive ? (
          <TrendingUp className="h-4 w-4 text-success" />
        ) : (
          <TrendingDown className="h-4 w-4 text-danger" />
        )}
        <span className={cn('text-sm font-medium', isPositive ? 'text-success' : 'text-danger')}>
          {isPositive ? '+' : ''}{change}%
        </span>
        <span className="text-sm text-gray-500">vs last month</span>
      </div>
    </div>
  );
}
