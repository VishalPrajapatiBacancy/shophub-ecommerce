import { cn } from '@/lib/utils';

interface StatusDotProps {
  status: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}

const dotColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
};

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span className={cn('inline-block h-2.5 w-2.5 rounded-full', dotColors[status], className)} />
  );
}
