import { useState, useEffect } from 'react';
import { Save, Store, Phone, Mail, FileText, Image } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/Badge';
import { adminApi } from '@/api/admin';
import { useAuth } from '@/hooks/useAuth';
import type { Vendor } from '@/types';

export function VendorProfilePage() {
  const { user } = useAuth();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    storeName: '',
    description: '',
    logoUrl: '',
    bannerUrl: '',
    contactEmail: '',
    contactPhone: '',
  });

  useEffect(() => {
    setLoading(true);
    adminApi
      .getMyVendorProfile()
      .then((res) => {
        const v = res.data;
        setVendor(v);
        setForm({
          storeName: v.storeName || '',
          description: v.description || '',
          logoUrl: v.logoUrl || '',
          bannerUrl: v.bannerUrl || '',
          contactEmail: v.contactEmail || '',
          contactPhone: v.contactPhone || '',
        });
      })
      .catch((err) => toast.error(err.message || 'Failed to load vendor profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await adminApi.updateMyVendorProfile({
        storeName: form.storeName,
        description: form.description,
        logoUrl: form.logoUrl,
        bannerUrl: form.bannerUrl,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
      });
      setVendor(res.data);
      toast.success('Store profile updated successfully!');
    } catch (err) {
      toast.error((err as Error).message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const upd = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Store Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your store information visible to customers
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Store Info Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Store className="h-4 w-4 text-primary-600" /> Store Information
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="vp-name">Store Name</Label>
                <Input
                  id="vp-name"
                  value={form.storeName}
                  onChange={(e) => upd('storeName', e.target.value)}
                  placeholder="Your store name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="vp-desc">Description</Label>
                <textarea
                  id="vp-desc"
                  value={form.description}
                  onChange={(e) => upd('description', e.target.value)}
                  rows={3}
                  placeholder="Describe your store..."
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary-600" /> Contact Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vp-email">Contact Email</Label>
                <Input
                  id="vp-email"
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => upd('contactEmail', e.target.value)}
                  placeholder="store@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="vp-phone">Contact Phone</Label>
                <Input
                  id="vp-phone"
                  value={form.contactPhone}
                  onChange={(e) => upd('contactPhone', e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="mt-1"
                />
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Image className="h-4 w-4 text-primary-600" /> Store Images
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="vp-logo">Logo URL</Label>
                <Input
                  id="vp-logo"
                  value={form.logoUrl}
                  onChange={(e) => upd('logoUrl', e.target.value)}
                  placeholder="https://..."
                  className="mt-1"
                />
                {form.logoUrl && (
                  <img
                    src={form.logoUrl}
                    alt="Logo preview"
                    className="mt-2 h-16 w-16 rounded-lg object-cover border border-gray-200"
                    onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                  />
                )}
              </div>
              <div>
                <Label htmlFor="vp-banner">Banner URL</Label>
                <Input
                  id="vp-banner"
                  value={form.bannerUrl}
                  onChange={(e) => upd('bannerUrl', e.target.value)}
                  placeholder="https://..."
                  className="mt-1"
                />
                {form.bannerUrl && (
                  <img
                    src={form.bannerUrl}
                    alt="Banner preview"
                    className="mt-2 h-24 w-full rounded-lg object-cover border border-gray-200"
                    onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                  />
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Account Info */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Account</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white text-sm font-semibold shrink-0">
                  {(user?.name || 'V').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
          </Card>

          {/* Store Status */}
          {vendor && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Store Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <StatusBadge status={vendor.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Commission</span>
                  <span className="text-sm font-medium text-gray-900">{vendor.commissionRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Orders</span>
                  <span className="text-sm font-medium text-gray-900">{vendor.totalOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₹{Number(vendor.totalRevenue || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Info note */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <FileText className="h-3 w-3 inline mr-1" />
              Commission rate and store status are managed by the platform admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
