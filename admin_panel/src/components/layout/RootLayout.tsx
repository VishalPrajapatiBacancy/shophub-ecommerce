import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/hooks/useSidebar';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';
import { navigation } from '@/config/navigation';

export function RootLayout() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const { isCollapsed, isMobileOpen, toggle, toggleMobile, closeMobile } = useSidebar();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user?.role ?? 'customer';

  // If vendor tries to access an admin-only route, redirect to /vendors
  const currentNav = navigation.find(n => n.path === location.pathname);
  if (currentNav && !currentNav.roles.includes(userRole)) {
    return <Navigate to="/vendors" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onToggle={toggle}
        onCloseMobile={closeMobile}
        userRole={userRole}
      />
      <div className={cn('transition-all duration-300', isCollapsed ? 'md:ml-20' : 'md:ml-64')}>
        <Header isCollapsed={isCollapsed} onToggleMobile={toggleMobile} />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
