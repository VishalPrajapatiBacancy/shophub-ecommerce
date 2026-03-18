import { useState } from 'react';
import { Truck, MapPin, Package, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';

interface Zone {
  id: string;
  name: string;
  regions: string;
  standardRate: number;
  expressRate: number;
  freeThreshold: number;
  estimatedDays: string;
  active: boolean;
}

const DEFAULT_ZONES: Zone[] = [
  { id: '1', name: 'Domestic', regions: 'United States', standardRate: 5.99, expressRate: 15.99, freeThreshold: 50, estimatedDays: '3-5', active: true },
  { id: '2', name: 'Canada', regions: 'Canada', standardRate: 9.99, expressRate: 24.99, freeThreshold: 100, estimatedDays: '5-7', active: true },
  { id: '3', name: 'International', regions: 'All other countries', standardRate: 14.99, expressRate: 39.99, freeThreshold: 150, estimatedDays: '7-14', active: true },
];

export function ShippingPage() {
  const [zones, setZones] = useState<Zone[]>(DEFAULT_ZONES);
  const [editId, setEditId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const updateZone = (id: string, field: keyof Zone, value: unknown) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, [field]: value } : z));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipping</h1>
          <p className="text-sm text-gray-500 mt-1">Configure shipping zones, rates and delivery options</p>
        </div>
        <Button onClick={handleSave}><Package className="h-4 w-4 mr-2" />Save Configuration</Button>
      </div>

      {saved && <p className="text-green-700 bg-green-50 p-4 rounded-lg">Shipping configuration saved!</p>}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Truck, label: 'Standard Shipping', desc: 'Free over $50', color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: Clock, label: 'Express Shipping', desc: 'Next-day delivery', color: 'text-orange-600', bg: 'bg-orange-50' },
          { icon: MapPin, label: 'Shipping Zones', desc: `${zones.filter(z => z.active).length} active zones`, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(({ icon: Icon, label, desc, color, bg }) => (
          <Card key={label}>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}><Icon className={`h-5 w-5 ${color}`} /></div>
              <div>
                <p className="font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Zones */}
      <Card>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Shipping Zones & Rates</h2>
        <div className="space-y-4">
          {zones.map(zone => (
            <div key={zone.id} className={`border rounded-lg overflow-hidden ${zone.active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={zone.active} onChange={e => updateZone(zone.id, 'active', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">{zone.name}</p>
                    <p className="text-xs text-gray-500">{zone.regions}</p>
                  </div>
                </div>
                <button onClick={() => setEditId(editId === zone.id ? null : zone.id)} className="text-sm text-primary-600 hover:text-primary-700">
                  {editId === zone.id ? 'Done' : 'Edit rates'}
                </button>
              </div>
              <div className="px-4 py-3">
                {editId === zone.id ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <Label>Standard Rate ($)</Label>
                      <Input type="number" value={zone.standardRate} onChange={e => updateZone(zone.id, 'standardRate', Number(e.target.value))} min="0" step="0.01" className="mt-1" />
                    </div>
                    <div>
                      <Label>Express Rate ($)</Label>
                      <Input type="number" value={zone.expressRate} onChange={e => updateZone(zone.id, 'expressRate', Number(e.target.value))} min="0" step="0.01" className="mt-1" />
                    </div>
                    <div>
                      <Label>Free Shipping Over ($)</Label>
                      <Input type="number" value={zone.freeThreshold} onChange={e => updateZone(zone.id, 'freeThreshold', Number(e.target.value))} min="0" className="mt-1" />
                    </div>
                    <div>
                      <Label>Est. Days</Label>
                      <Input value={zone.estimatedDays} onChange={e => updateZone(zone.id, 'estimatedDays', e.target.value)} placeholder="3-5" className="mt-1" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="text-gray-600">Standard: <strong>${zone.standardRate}</strong></span>
                    <span className="text-gray-600">Express: <strong>${zone.expressRate}</strong></span>
                    <span className="text-gray-600">Free over: <strong>${zone.freeThreshold}</strong></span>
                    <span className="text-gray-600">Est. delivery: <strong>{zone.estimatedDays} days</strong></span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Carriers */}
      <Card>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Supported Carriers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['FedEx', 'UPS', 'USPS', 'DHL'].map(carrier => (
            <div key={carrier} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
              <Truck className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">{carrier}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
