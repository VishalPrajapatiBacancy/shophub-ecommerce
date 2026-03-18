import { Bell } from 'lucide-react';
import { notifications } from '@/data/notifications';
import { formatDate } from '@/lib/utils';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { cn } from '@/lib/utils';

export function NotificationDropdown() {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu
      trigger={
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      }
    >
      <div className="w-80 max-h-96 overflow-y-auto">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
        </div>
        {notifications.slice(0, 5).map((notification) => (
          <div
            key={notification.id}
            className={cn(
              'px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-border last:border-0',
              !notification.read && 'bg-blue-50/50'
            )}
          >
            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
            <p className="text-xs text-gray-400 mt-1">{formatDate(notification.createdAt)}</p>
          </div>
        ))}
        <div className="px-4 py-2 text-center border-t border-border">
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all notifications
          </button>
        </div>
      </div>
    </DropdownMenu>
  );
}
