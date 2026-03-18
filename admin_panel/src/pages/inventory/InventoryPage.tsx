import { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingDown, CheckCircle, Minus, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { SearchInput } from '@/components/ui/SearchInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminApi } from '@/api/admin';

interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  stock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lowStockThreshold: number;
}

interface InventoryStats { totalProducts: number; inStock: number; lowStock: number; outOfStock: number }

export function InventoryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<InventoryStats>({ totalProducts: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');

  const [adjustModal, setAdjustModal] = useState(false);
  const [selected, setSelected] = useState<InventoryProduct | null>(null);
  const [adjustment, setAdjustment] = useState('');
  const [reason, setReason] = useState('Purchase/Restock');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchInventory = () => {
    setLoading(true);
    setError(null);
    adminApi.getInventory()
      .then((res) => {
        const d = res.data as { stats: InventoryStats; products: InventoryProduct[] };
        setStats(d.stats);
        setProducts(d.products);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load inventory'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInventory(); }, []);

  const filtered = products.filter(p => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const openAdjust = (p: InventoryProduct, preset?: string) => {
    setSelected(p);
    setAdjustment(preset || '');
    setReason('Purchase/Restock');
    setNotes('');
    setSaveError(null);
    setAdjustModal(true);
  };

  const handleAdjust = async () => {
    if (!selected || !adjustment.trim()) { setSaveError('Adjustment amount is required'); return; }
    const num = Number(adjustment);
    if (isNaN(num) || num === 0) { setSaveError('Enter a valid non-zero number'); return; }
    setSaving(true); setSaveError(null);
    try {
      await adminApi.updateStock(selected.id, { adjustment: num, reason, notes });
      setAdjustModal(false);
      fetchInventory();
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const statusColor = (s: string) =>
    s === 'out_of_stock' ? 'bg-red-100 text-red-800' : s === 'low_stock' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
  const statusLabel = (s: string) =>
    s === 'out_of_stock' ? 'Out of Stock' : s === 'low_stock' ? 'Low Stock' : 'In Stock';

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}</div>
      <Skeleton className="h-96 rounded-lg" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor stock levels and adjust inventory</p>
      </div>

      {error && <p className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</p>}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'In Stock', value: stats.inStock, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Out of Stock', value: stats.outOfStock, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card padding={false}>
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center justify-between">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or SKU..." className="sm:w-72" />
          <div className="flex gap-2">
            {(['all', 'low_stock', 'out_of_stock'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {f === 'all' ? 'All' : f === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-y border-border bg-gray-50/50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Threshold</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">No products found</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-6 py-3 text-gray-500 text-sm font-mono">{p.sku}</td>
                    <td className="px-6 py-3">
                      <span className={`text-lg font-bold ${p.stock === 0 ? 'text-red-600' : p.stock <= p.lowStockThreshold ? 'text-yellow-600' : 'text-gray-900'}`}>{p.stock}</span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-sm">{p.lowStockThreshold}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(p.status)}`}>{statusLabel(p.status)}</span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openAdjust(p, '-1')} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500" title="Remove 1">
                          <Minus className="h-4 w-4" />
                        </button>
                        <button onClick={() => openAdjust(p)} className="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 text-xs font-medium hover:bg-primary-100">Adjust</button>
                        <button onClick={() => openAdjust(p, '10')} className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-500" title="Add 10">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Adjust Modal */}
      <Modal isOpen={adjustModal} onClose={() => setAdjustModal(false)} title={`Adjust Stock — ${selected?.name}`} size="md">
        <div className="space-y-4">
          {saveError && <p className="text-red-600 bg-red-50 p-3 rounded text-sm">{saveError}</p>}
          {selected && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Package className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">{selected.name}</p>
                <p className="text-xs text-gray-500">Current stock: <span className="font-semibold">{selected.stock}</span></p>
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="adj-amount">Adjustment (+/-) *</Label>
            <Input id="adj-amount" type="number" value={adjustment} onChange={e => setAdjustment(e.target.value)} placeholder="e.g. 50 or -5" className="mt-1" />
            <p className="text-xs text-gray-400 mt-1">Use positive to add stock, negative to remove</p>
          </div>
          <div>
            <Label htmlFor="adj-reason">Reason</Label>
            <select id="adj-reason" value={reason} onChange={e => setReason(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              {['Purchase/Restock', 'Sales return', 'Damaged goods', 'Theft/Loss', 'Stock count correction', 'Sample/Giveaway', 'Other'].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="adj-notes">Notes (optional)</Label>
            <textarea id="adj-notes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" placeholder="Additional notes..." />
          </div>
          {adjustment && selected && !isNaN(Number(adjustment)) && (
            <div className="p-3 bg-blue-50 rounded-lg text-sm">
              New stock will be: <span className="font-semibold text-blue-700">{Math.max(0, selected.stock + Number(adjustment))}</span>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setAdjustModal(false)}>Cancel</Button>
            <Button onClick={handleAdjust} disabled={saving}>{saving ? 'Saving...' : 'Update Stock'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
