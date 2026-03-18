import { User, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/lib/utils';
import { DropdownMenu, DropdownItem, DropdownDivider } from '@/components/ui/DropdownMenu';

export function ProfileDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <DropdownMenu
      trigger={
        <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white text-sm font-medium">
            {getInitials(user.name)}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-sm font-medium text-gray-700">{user.name}</p>
            <p className="text-xs text-gray-500">{user.role.replace('_', ' ')}</p>
          </div>
        </button>
      }
    >
      <div className="px-4 py-2 border-b border-border">
        <p className="text-sm font-medium text-gray-900">{user.name}</p>
        <p className="text-xs text-gray-500">{user.email}</p>
      </div>
      <DropdownItem onClick={() => navigate('/settings')}>
        <User className="h-4 w-4" /> My Profile
      </DropdownItem>
      <DropdownItem onClick={() => navigate('/settings')}>
        <Settings className="h-4 w-4" /> Settings
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem onClick={handleLogout} danger>
        <LogOut className="h-4 w-4" /> Logout
      </DropdownItem>
    </DropdownMenu>
  );
}
