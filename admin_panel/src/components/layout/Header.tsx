import { Menu, Search, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfileDropdown } from './ProfileDropdown';
import { NotificationDropdown } from './NotificationDropdown';
import { Breadcrumbs } from './Breadcrumbs';

interface HeaderProps {
  isCollapsed: boolean;
  onToggleMobile: () => void;
}

export function Header({ isCollapsed, onToggleMobile }: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface px-4 lg:px-6 transition-all duration-300',
        isCollapsed ? 'md:ml-20' : 'md:ml-64'
      )}
    >
      <div className="flex items-center gap-4">
        <button onClick={onToggleMobile} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg md:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <button className="hidden sm:flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50">
          <Search className="h-4 w-4" />
          <span>Search...</span>
          <kbd className="hidden lg:inline-flex items-center rounded border border-gray-200 bg-gray-50 px-1.5 text-xs text-gray-400">⌘K</kbd>
        </button>

        <NotificationDropdown />
        <ProfileDropdown />
      </div>
    </header>
  );
}
