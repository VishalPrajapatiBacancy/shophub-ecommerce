import { useState, useEffect } from 'react';
import { Save, Store, DollarSign, Truck, Shield, Bell } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminApi } from '@/api/admin';

interface Settings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  taxRate: number;
  taxEnabled: boolean;
  freeShippingThreshold: number;
  defaultShippingRate: number;
  expressShippingRate: number;
  orderPrefix: string;
  autoConfirmOrders: boolean;
  lowStockThreshold: number;
  primaryColor: string;
}

const TABS = [
  { id: 'general', label: 'General', icon: Store },
  { id: 'currency', label: 'Currency & Tax', icon: DollarSign },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'orders', label: 'Orders', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminApi.getSettings()
      .then(res => setSettings(res.data as Settings))
      .catch(err => setError((err as Error).message || 'Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true); setError(null); setSuccess(false);
    try {
      await adminApi.updateSettings(settings as unknown as Record<string, unknown>);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError((err as Error).message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const upd = (key: keyof Settings, value: unknown) => setSettings(prev => prev ? { ...prev, [key]: value } : prev);

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-96 rounded-lg" />
    </div>
  );

  if (!settings) return <p className="text-red-600">{error || 'Failed to load'}</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure your store settings and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {error && <p className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</p>}
      {success && <p className="text-green-700 bg-green-50 p-4 rounded-lg">Settings saved successfully!</p>}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-52 shrink-0">
          <Card padding={false}>
            <nav className="divide-y divide-border">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-colors text-left ${activeTab === tab.id ? 'bg-primary-50 text-primary-700 border-l-2 border-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <tab.icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <Card>
              <h2 className="text-base font-semibold text-gray-900 mb-4">General Settings</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="s-name">Store Name</Label>
                  <Input id="s-name" value={settings.storeName} onChange={e => upd('storeName', e.target.value)} className="mt-1" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="s-email">Store Email</Label>
                    <Input id="s-email" type="email" value={settings.storeEmail} onChange={e => upd('storeEmail', e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="s-phone">Store Phone</Label>
                    <Input id="s-phone" value={settings.storePhone} onChange={e => upd('storePhone', e.target.value)} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="s-addr">Store Address</Label>
                  <textarea id="s-addr" value={settings.storeAddress} onChange={e => upd('storeAddress', e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="s-tz">Timezone</Label>
                    <select id="s-tz" value={settings.timezone} onChange={e => upd('timezone', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                      {['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Kolkata', 'Australia/Sydney'].map(tz => <option key={tz}>{tz}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="s-color">Primary Color</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <input type="color" id="s-color" value={settings.primaryColor} onChange={e => upd('primaryColor', e.target.value)} className="h-9 w-12 rounded cursor-pointer border border-gray-300" />
                      <Input value={settings.primaryColor} onChange={e => upd('primaryColor', e.target.value)} className="flex-1 font-mono" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'currency' && (
            <Card>
              <h2 className="text-base font-semibold text-gray-900 mb-4">Currency & Tax</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="s-curr">Currency Code</Label>
                    <Input id="s-curr" value={settings.currency} onChange={e => upd('currency', e.target.value)} placeholder="USD" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="s-sym">Currency Symbol</Label>
                    <Input id="s-sym" value={settings.currencySymbol} onChange={e => upd('currencySymbol', e.target.value)} placeholder="$" className="mt-1" />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                  <input type="checkbox" id="s-tax" checked={settings.taxEnabled} onChange={e => upd('taxEnabled', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
                  <div>
                    <Label htmlFor="s-tax" className="cursor-pointer">Enable Tax Calculation</Label>
                    <p className="text-xs text-gray-400">Apply tax to orders automatically</p>
                  </div>
                </div>
                {settings.taxEnabled && (
                  <div>
                    <Label htmlFor="s-taxrate">Default Tax Rate (%)</Label>
                    <Input id="s-taxrate" type="number" value={settings.taxRate} onChange={e => upd('taxRate', Number(e.target.value))} placeholder="8" min="0" max="100" className="mt-1 max-w-xs" />
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeTab === 'shipping' && (
            <Card>
              <h2 className="text-base font-semibold text-gray-900 mb-4">Shipping Settings</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="s-fship">Free Shipping Threshold ($)</Label>
                  <Input id="s-fship" type="number" value={settings.freeShippingThreshold} onChange={e => upd('freeShippingThreshold', Number(e.target.value))} min="0" className="mt-1 max-w-xs" />
                  <p className="text-xs text-gray-400 mt-1">Orders above this amount get free shipping</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="s-dship">Default Shipping Rate ($)</Label>
                    <Input id="s-dship" type="number" value={settings.defaultShippingRate} onChange={e => upd('defaultShippingRate', Number(e.target.value))} min="0" step="0.01" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="s-eship">Express Shipping Rate ($)</Label>
                    <Input id="s-eship" type="number" value={settings.expressShippingRate} onChange={e => upd('expressShippingRate', Number(e.target.value))} min="0" step="0.01" className="mt-1" />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'orders' && (
            <Card>
              <h2 className="text-base font-semibold text-gray-900 mb-4">Order Settings</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="s-prefix">Order Number Prefix</Label>
                  <Input id="s-prefix" value={settings.orderPrefix} onChange={e => upd('orderPrefix', e.target.value)} placeholder="ORD-" className="mt-1 max-w-xs" />
                </div>
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                  <input type="checkbox" id="s-autoconf" checked={settings.autoConfirmOrders} onChange={e => upd('autoConfirmOrders', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
                  <div>
                    <Label htmlFor="s-autoconf" className="cursor-pointer">Auto-confirm Orders</Label>
                    <p className="text-xs text-gray-400">Automatically confirm orders when payment is received</p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="s-lowstock">Low Stock Threshold</Label>
                  <Input id="s-lowstock" type="number" value={settings.lowStockThreshold} onChange={e => upd('lowStockThreshold', Number(e.target.value))} min="1" className="mt-1 max-w-xs" />
                  <p className="text-xs text-gray-400 mt-1">Alert when product stock falls below this number</p>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <h2 className="text-base font-semibold text-gray-900 mb-4">Security Settings</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">Security settings are managed through Supabase authentication. Visit your Supabase dashboard to configure password policies, 2FA, and session management.</p>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Supabase Auth', desc: 'JWT-based authentication with 1-hour token expiry', status: 'Enabled' },
                    { label: 'Row Level Security', desc: 'Database-level security via Supabase RLS', status: 'Active' },
                    { label: 'Admin Role Check', desc: 'All admin routes require admin role verification', status: 'Active' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
