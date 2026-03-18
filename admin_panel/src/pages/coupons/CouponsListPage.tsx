import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Ticket, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SearchInput } from '@/components/ui/SearchInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { adminApi } from '@/api/admin';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Coupon } from '@/types';

interface CouponForm {
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: string;
  minOrderAmount: string;
  maxDiscount: string;
  usageLimit: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'disabled';
}

const emptyForm: CouponForm = {
  code: '', description: '', type: 'percentage', value: '', minOrderAmount: '',
  maxDiscount: '', usageLimit: '', startDate: '', endDate: '', status: 'active',
};

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function CouponsListPage() {
  const [search, setSearch] = useState('');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCoupons = useCallback(() => {
    setLoading(true); setError(null);
    adminApi.getCoupons({ page: 1, limit: 100, search: search || undefined })
      .then(res => { setCoupons(res.data); setTotal(res.total); })
      .catch(err => setError(err.message || 'Failed to load coupons'))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setFormError(null); setModalOpen(true); };
  const openEdit = (c: Coupon) => {
    setEditingId(c.id);
    setForm({
      code: c.code, description: c.description || '', type: c.type, value: String(c.value),
      minOrderAmount: c.minOrderAmount ? String(c.minOrderAmount) : '',
      maxDiscount: c.maxDiscount ? String(c.maxDiscount) : '',
      usageLimit: c.usageLimit ? String(c.usageLimit) : '',
      startDate: c.startDate ? c.startDate.split('T')[0] : '',
      endDate: c.endDate ? c.endDate.split('T')[0] : '',
      status: c.status === 'active' ? 'active' : 'disabled',
    });
    setFormError(null); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) { setFormError('Coupon code is required'); return; }
    if (!form.value || isNaN(Number(form.value))) { setFormError('Valid discount value is required'); return; }
    setSaving(true); setFormError(null);
    try {
      const payload: Partial<Coupon> = {
        code: form.code.trim().toUpperCase(),
        description: form.description,
        type: form.type,
        value: Number(form.value),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        status: form.status,
      };
      if (editingId) { await adminApi.updateCoupon(editingId, payload); }
      else { await adminApi.createCoupon(payload); }
      toast.success(editingId ? 'Coupon updated' : 'Coupon created');
      setModalOpen(false); fetchCoupons();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Save failed');
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await adminApi.deleteCoupon(deleteId); setDeleteId(null); fetchCoupons(); toast.success('Coupon deleted'); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Delete failed'); toast.error(err instanceof Error ? err.message : 'Delete failed'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">Manage discount coupons and promotional codes ({total})</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Create Coupon</Button>
      </div>

      {error && <p className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</p>}

      <Card padding={false}>
        <div className="p-4 border-b border-border">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by code..." className="sm:w-72" />
        </div>
        {loading && coupons.length === 0 ? (
          <div className="p-8"><Skeleton className="h-48 w-full rounded-lg" /></div>
        ) : coupons.length === 0 ? (
          <EmptyState icon={Ticket} title="No coupons yet" description="Create your first coupon to offer discounts." actionLabel="Create Coupon" onAction={openAdd} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y border-border bg-gray-50/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Min Order</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Used</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 font-mono font-semibold text-gray-900">{c.code}</td>
                    <td className="px-6 py-3 text-gray-600 capitalize">{c.type}</td>
                    <td className="px-6 py-3 font-medium text-gray-900">{c.type === 'percentage' ? `${c.value}%` : formatCurrency(c.value)}</td>
                    <td className="px-6 py-3 text-gray-500 text-sm">{c.minOrderAmount ? formatCurrency(c.minOrderAmount) : '—'}</td>
                    <td className="px-6 py-3 text-gray-600">{c.usedCount}{c.usageLimit != null ? ` / ${c.usageLimit}` : ''}</td>
                    <td className="px-6 py-3 text-gray-500 text-xs">
                      {c.startDate ? formatDate(c.startDate) : '—'} → {c.endDate ? formatDate(c.endDate) : '—'}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${c.status === 'active' ? 'bg-green-100 text-green-800' : c.status === 'expired' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Coupon' : 'Create Coupon'} size="lg">
        <div className="space-y-4">
          {formError && <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">{formError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="c-code">Coupon Code *</Label>
              <div className="flex gap-2 mt-1">
                <Input id="c-code" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. SAVE20" className="uppercase" />
                <Button variant="outline" onClick={() => setForm(f => ({ ...f, code: generateCode() }))} className="shrink-0">Auto</Button>
              </div>
            </div>
            <div>
              <Label htmlFor="c-status">Status</Label>
              <select id="c-status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'active' | 'disabled' }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="c-desc">Description</Label>
            <Input id="c-desc" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. 20% off all orders" className="mt-1" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="c-type">Discount Type</Label>
              <select id="c-type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as 'percentage' | 'fixed' }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="c-value">Discount Value *</Label>
              <Input id="c-value" type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder={form.type === 'percentage' ? 'e.g. 20' : 'e.g. 10.00'} className="mt-1" min="0" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="c-min">Min Order Amount</Label>
              <Input id="c-min" type="number" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} placeholder="e.g. 50" className="mt-1" min="0" />
            </div>
            {form.type === 'percentage' && (
              <div>
                <Label htmlFor="c-maxd">Max Discount Cap</Label>
                <Input id="c-maxd" type="number" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} placeholder="e.g. 100" className="mt-1" min="0" />
              </div>
            )}
            <div>
              <Label htmlFor="c-limit">Usage Limit</Label>
              <Input id="c-limit" type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} placeholder="Leave blank for unlimited" className="mt-1" min="1" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="c-start">Start Date</Label>
              <Input id="c-start" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="c-end">End Date</Label>
              <Input id="c-end" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="mt-1" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Coupon" size="sm">
        <div className="space-y-4">
          <p className="text-gray-600">Are you sure you want to delete this coupon?</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
