import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, ShoppingBag } from 'lucide-react';
import { getNavGroups } from '@/config/navigation';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggle: () => void;
  onCloseMobile: () => void;
  userRole?: string;
}

export function Sidebar({ isCollapsed, isMobileOpen, onToggle, onCloseMobile, userRole = 'admin' }: SidebarProps) {
  const navGroups = getNavGroups(userRole);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && <span className="text-lg font-bold text-white">ShopHub</span>}
        </div>
        {/* Close button for mobile */}
        <button onClick={onCloseMobile} className="p-1 text-gray-400 hover:text-white md:hidden">
          <X className="h-5 w-5" />
        </button>
        {/* Collapse button for desktop */}
        <button onClick={onToggle} className="hidden md:block p-1 text-gray-400 hover:text-white">
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map(({ group, items }) => (
          <div key={group}>
            {!isCollapsed && (
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {group}
              </p>
            )}
            <div className="space-y-1">
              {items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isCollapsed && 'justify-center',
                      isActive
                        ? 'bg-sidebar-active text-white'
                        : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
                    )
                  }
                  end={item.path === '/'}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onCloseMobile} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-300 md:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 bg-sidebar transition-all duration-300 z-30',
          isCollapsed ? 'md:w-20' : 'md:w-64'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
