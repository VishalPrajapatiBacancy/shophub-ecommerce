import { useState, useEffect, useCallback } from 'react';
import { Store, Plus, Pencil, Trash2, CheckCircle, XCircle, PauseCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SearchInput } from '@/components/ui/SearchInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { ImageUploadField } from '@/components/ui/ImageUploadField';
import { EmptyState } from '@/components/ui/EmptyState';
import { adminApi } from '@/api/admin';
import type { Vendor, VendorPayout } from '@/types';

interface VendorForm {
  storeName: string;
  description: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  commissionRate: number;
  status: string;
  notes: string;
}

const emptyForm: VendorForm = {
  storeName: '',
  description: '',
  logoUrl: '',
  contactEmail: '',
  contactPhone: '',
  commissionRate: 10,
  status: 'pending',
  notes: '',
};

interface PayoutForm {
  vendorId: string;
  amount: string;
  periodStart: string;
  periodEnd: string;
  notes: string;
}

const statusColors: Record<string, string> = {
  active:    'bg-green-100 text-green-800',
  pending:   'bg-yellow-100 text-yellow-800',
  suspended: 'bg-orange-100 text-orange-800',
  rejected:  'bg-red-100 text-red-800',
};

const payoutStatusColors: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  paid:       'bg-green-100 text-green-800',
  failed:     'bg-red-100 text-red-800',
};

export function VendorsListPage() {
  const [tab, setTab] = useState<'vendors' | 'payouts'>('vendors');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VendorForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Payouts tab
  const [payouts, setPayouts] = useState<VendorPayout[]>([]);
  const [payoutsTotal, setPayoutsTotal] = useState(0);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutForm, setPayoutForm] = useState<PayoutForm>({ vendorId: '', amount: '', periodStart: '', periodEnd: '', notes: '' });
  const [payoutSaving, setPayoutSaving] = useState(false);
  const [payoutFormError, setPayoutFormError] = useState<string | null>(null);

  const fetchVendors = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi
      .getVendors({ page: 1, limit: 100, search: search || undefined, status: statusFilter || undefined })
      .then((res) => { setVendors(res.data); setTotal(res.total); })
      .catch((err) => setError(err.message || 'Failed to load vendors'))
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  const fetchPayouts = useCallback(() => {
    setPayoutsLoading(true);
    adminApi
      .getVendorPayouts({ page: 1, limit: 100 })
      .then((res) => { setPayouts(res.data); setPayoutsTotal(res.total); })
      .catch(() => {})
      .finally(() => setPayoutsLoading(false));
  }, []);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);
  useEffect(() => { if (tab === 'payouts') fetchPayouts(); }, [tab, fetchPayouts]);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setFormError(null); setModalOpen(true); };
  const openEdit = (v: Vendor) => {
    setEditingId(v.id);
    setForm({
      storeName: v.storeName,
      description: v.description || '',
      logoUrl: v.logoUrl || '',
      contactEmail: v.contactEmail || '',
      contactPhone: v.contactPhone || '',
      commissionRate: v.commissionRate ?? 10,
      status: v.status,
      notes: v.notes || '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.storeName.trim()) { setFormError('Store name is required'); return; }
    setSaving(true); setFormError(null);
    try {
      const payload = {
        storeName: form.storeName.trim(),
        description: form.description,
        logoUrl: form.logoUrl,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        commissionRate: Number(form.commissionRate),
        status: form.status,
        notes: form.notes,
      };
      if (editingId) {
        await adminApi.updateVendor(editingId, payload);
        toast.success('Vendor updated');
      } else {
        await adminApi.createVendor(payload);
        toast.success('Vendor created');
      }
      setModalOpen(false);
      fetchVendors();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteVendor(deleteId);
      toast.success('Vendor deleted');
      setDeleteId(null);
      fetchVendors();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await adminApi.updateVendorStatus(id, status);
      toast.success(`Vendor ${status}`);
      fetchVendors();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleCreatePayout = async () => {
    if (!payoutForm.vendorId || !payoutForm.amount) { setPayoutFormError('Vendor and amount are required'); return; }
    setPayoutSaving(true); setPayoutFormError(null);
    try {
      await adminApi.createVendorPayout({
        vendorId: payoutForm.vendorId,
        amount: Number(payoutForm.amount),
        periodStart: payoutForm.periodStart || undefined,
        periodEnd: payoutForm.periodEnd || undefined,
        notes: payoutForm.notes || undefined,
      });
      toast.success('Payout created');
      setPayoutModalOpen(false);
      setPayoutForm({ vendorId: '', amount: '', periodStart: '', periodEnd: '', notes: '' });
      fetchPayouts();
    } catch (err: unknown) {
      setPayoutFormError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setPayoutSaving(false);
    }
  };

  const handlePayoutStatusChange = async (id: string, status: string) => {
    try {
      await adminApi.updatePayoutStatus(id, status);
      toast.success(`Payout marked as ${status}`);
      fetchPayouts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="text-sm text-gray-500 mt-1">Manage marketplace sellers and payouts</p>
        </div>
        {tab === 'vendors' && (
          <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Vendor</Button>
        )}
        {tab === 'payouts' && (
          <Button onClick={() => { setPayoutForm({ vendorId: '', amount: '', periodStart: '', periodEnd: '', notes: '' }); setPayoutFormError(null); setPayoutModalOpen(true); }}>
            <DollarSign className="h-4 w-4 mr-1" /> Create Payout
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['vendors', 'payouts'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${tab === t ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t === 'vendors' ? `Vendors (${total})` : `Payouts (${payoutsTotal})`}
          </button>
        ))}
      </div>

      {/* ── VENDORS TAB ── */}
      {tab === 'vendors' && (
        <Card padding={false}>
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search vendors..." className="sm:w-64" />
            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="sm:w-44"
              options={[
                { value: '', label: 'All statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'active', label: 'Active' },
                { value: 'suspended', label: 'Suspended' },
                { value: 'rejected', label: 'Rejected' },
              ]}
            />
          </div>

          {error && <p className="text-red-600 bg-red-50 p-4 m-4 rounded-lg">{error}</p>}

          {loading && vendors.length === 0 ? (
            <div className="p-8"><Skeleton className="h-48 w-full rounded-lg" /></div>
          ) : vendors.length === 0 ? (
            <EmptyState icon={Store} title="No vendors yet" description="Add your first vendor to start the marketplace." actionLabel="Add Vendor" onAction={openAdd} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-y border-border bg-gray-50/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Commission</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {vendors.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          {v.logoUrl ? (
                            <img src={v.logoUrl} alt={v.storeName} className="h-9 w-9 rounded-lg object-cover" />
                          ) : (
                            <div className="h-9 w-9 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                              {v.storeName[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{v.storeName}</p>
                            <p className="text-xs text-gray-400">{v.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-sm text-gray-700">{v.contactEmail || '—'}</p>
                        <p className="text-xs text-gray-400">{v.contactPhone || ''}</p>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">{v.commissionRate}%</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{v.totalOrders ?? 0}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">${(v.totalRevenue ?? 0).toLocaleString()}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[v.status] ?? 'bg-gray-100 text-gray-800'}`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {v.status !== 'active' && (
                            <button title="Approve" onClick={() => handleStatusChange(v.id, 'active')} className="p-1.5 rounded hover:bg-green-50 text-gray-500 hover:text-green-600">
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          {v.status === 'active' && (
                            <button title="Suspend" onClick={() => handleStatusChange(v.id, 'suspended')} className="p-1.5 rounded hover:bg-orange-50 text-gray-500 hover:text-orange-600">
                              <PauseCircle className="h-4 w-4" />
                            </button>
                          )}
                          {v.status !== 'rejected' && v.status !== 'active' && (
                            <button title="Reject" onClick={() => handleStatusChange(v.id, 'rejected')} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600">
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => openEdit(v)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteId(v.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ── PAYOUTS TAB ── */}
      {tab === 'payouts' && (
        <Card padding={false}>
          {payoutsLoading ? (
            <div className="p-8"><Skeleton className="h-48 w-full rounded-lg" /></div>
          ) : payouts.length === 0 ? (
            <EmptyState icon={DollarSign} title="No payouts yet" description="Create your first payout for a vendor." actionLabel="Create Payout" onAction={() => { setPayoutForm({ vendorId: '', amount: '', periodStart: '', periodEnd: '', notes: '' }); setPayoutFormError(null); setPayoutModalOpen(true); }} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-y border-border bg-gray-50/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payouts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3 text-sm text-gray-700 font-medium">{p.vendors?.storeName ?? p.vendorId.slice(0, 8)}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-900">${p.amount.toLocaleString()}</td>
                      <td className="px-6 py-3 text-sm text-gray-500">
                        {p.periodStart ? `${p.periodStart} → ${p.periodEnd ?? '...'}` : '—'}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">{p.ordersCount}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${payoutStatusColors[p.status] ?? 'bg-gray-100 text-gray-800'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {p.status === 'pending' && (
                            <button onClick={() => handlePayoutStatusChange(p.id, 'processing')} className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">Process</button>
                          )}
                          {p.status === 'processing' && (
                            <button onClick={() => handlePayoutStatusChange(p.id, 'paid')} className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100">Mark Paid</button>
                          )}
                          {(p.status === 'pending' || p.status === 'processing') && (
                            <button onClick={() => handlePayoutStatusChange(p.id, 'failed')} className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100">Fail</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Add/Edit Vendor Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Vendor' : 'Add Vendor'} size="lg">
        <div className="space-y-4">
          {formError && <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">{formError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="v-name">Store Name *</Label>
              <Input id="v-name" value={form.storeName} onChange={e => setForm(f => ({ ...f, storeName: e.target.value }))} placeholder="e.g. TechZone Store" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="v-email">Contact Email</Label>
              <Input id="v-email" type="email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} placeholder="vendor@email.com" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="v-phone">Contact Phone</Label>
              <Input id="v-phone" value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} placeholder="+1 555-000-0000" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="v-commission">Commission Rate (%)</Label>
              <Input id="v-commission" type="number" min="0" max="100" step="0.5" value={form.commissionRate} onChange={e => setForm(f => ({ ...f, commissionRate: Number(e.target.value) }))} className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="v-desc">Description</Label>
            <textarea id="v-desc" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description of the store..." rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
          <div>
            <Label>Logo</Label>
            <div className="mt-1">
              <ImageUploadField value={form.logoUrl} onChange={url => setForm(f => ({ ...f, logoUrl: url }))} folder="vendors" />
            </div>
          </div>
          <div>
            <Label htmlFor="v-status">Status</Label>
            <Select
              id="v-status"
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="mt-1"
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'active', label: 'Active' },
                { value: 'suspended', label: 'Suspended' },
                { value: 'rejected', label: 'Rejected' },
              ]}
            />
          </div>
          <div>
            <Label htmlFor="v-notes">Notes</Label>
            <textarea id="v-notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Internal notes..." rows={2} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Vendor' : 'Add Vendor'}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Vendor" size="sm">
        <div className="space-y-4">
          <p className="text-gray-600">Are you sure you want to delete this vendor? This cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
          </div>
        </div>
      </Modal>

      {/* Create Payout Modal */}
      <Modal isOpen={payoutModalOpen} onClose={() => setPayoutModalOpen(false)} title="Create Payout" size="md">
        <div className="space-y-4">
          {payoutFormError && <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">{payoutFormError}</p>}
          <div>
            <Label htmlFor="p-vendor">Vendor *</Label>
            <Select
              id="p-vendor"
              value={payoutForm.vendorId}
              onChange={e => setPayoutForm(f => ({ ...f, vendorId: e.target.value }))}
              className="mt-1"
              options={[
                { value: '', label: 'Select vendor...' },
                ...vendors.filter(v => v.status === 'active').map(v => ({ value: v.id, label: v.storeName })),
              ]}
            />
          </div>
          <div>
            <Label htmlFor="p-amount">Amount ($) *</Label>
            <Input id="p-amount" type="number" min="0" step="0.01" value={payoutForm.amount} onChange={e => setPayoutForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="p-start">Period Start</Label>
              <Input id="p-start" type="date" value={payoutForm.periodStart} onChange={e => setPayoutForm(f => ({ ...f, periodStart: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="p-end">Period End</Label>
              <Input id="p-end" type="date" value={payoutForm.periodEnd} onChange={e => setPayoutForm(f => ({ ...f, periodEnd: e.target.value }))} className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="p-notes">Notes</Label>
            <textarea id="p-notes" value={payoutForm.notes} onChange={e => setPayoutForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setPayoutModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreatePayout} disabled={payoutSaving}>{payoutSaving ? 'Creating...' : 'Create Payout'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
