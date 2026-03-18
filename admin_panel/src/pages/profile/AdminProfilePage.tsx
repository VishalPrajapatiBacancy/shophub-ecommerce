import { useNavigate } from 'react-router-dom';
import { Settings, Shield, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export function AdminProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-primary-600" /> Account Details
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-white text-xl font-bold shrink-0">
                {(user.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 capitalize">
                  {user.role}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Profile details are managed through Supabase authentication. To update your name or password, visit the Supabase dashboard.
            </p>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary-600" /> Security
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Authentication', value: 'Supabase Auth (JWT)', status: 'Active' },
                { label: 'Token Expiry', value: '1 hour', status: 'Active' },
                { label: 'Role', value: user.role.charAt(0).toUpperCase() + user.role.slice(1), status: 'Verified' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.value}</p>
                  </div>
                  <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4" /> Store Settings
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
