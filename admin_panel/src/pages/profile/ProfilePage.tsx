import { useAuth } from '@/hooks/useAuth';
import { VendorProfilePage } from './VendorProfilePage';
import { AdminProfilePage } from './AdminProfilePage';

export function ProfilePage() {
  const { user } = useAuth();
  if (user?.role === 'vendor') return <VendorProfilePage />;
  return <AdminProfilePage />;
}
