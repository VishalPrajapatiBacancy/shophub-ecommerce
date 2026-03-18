import { useState, useEffect, useCallback } from 'react';
import { Plus, Tags, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SearchInput } from '@/components/ui/SearchInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ImageUploadField } from '@/components/ui/ImageUploadField';
import { adminApi } from '@/api/admin';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Brand } from '@/types';

interface BrandForm {
  name: string;
  description: string;
  logoUrl: string;
  websiteUrl: string;
  isActive: boolean;
}

const emptyForm: BrandForm = { name: '', description: '', logoUrl: '', websiteUrl: '', isActive: true };

export function BrandsListPage() {
  const [search, setSearch] = useState('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BrandForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBrands = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi
      .getBrands({ page: 1, limit: 100, search: search || undefined })
      .then((res) => {
        setBrands(res.data);
        setTotal(res.total);
      })
      .catch((err) => setError(err.message || 'Failed to load brands'))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setFormError(null); setModalOpen(true); };
  const openEdit = (b: Brand & Record<string, unknown>) => {
    setEditingId(b.id);
    setForm({ name: b.name, description: String(b.description || ''), logoUrl: String(b.logo || (b as Record<string, unknown>).logoUrl || ''), websiteUrl: String((b as Record<string, unknown>).websiteUrl || ''), isActive: b.status !== 'inactive' });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Brand name is required'); return; }
    setSaving(true); setFormError(null);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description,
        logoUrl: form.logoUrl,
        websiteUrl: form.websiteUrl,
        isActive: form.isActive,
        status: form.isActive ? 'active' : 'inactive',
      };
      if (editingId) {
        await adminApi.updateBrand(editingId, payload);
        toast.success('Brand updated');
      } else {
        await adminApi.createBrand(payload);
        toast.success('Brand added');
      }
      setModalOpen(false);
      fetchBrands();
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
      await adminApi.deleteBrand(deleteId);
      toast.success('Brand deleted');
      setDeleteId(null);
      fetchBrands();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product brands and manufacturers ({total})</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Brand</Button>
      </div>

      {error && <p className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</p>}

      <Card padding={false}>
        <div className="p-4 border-b border-border">
          <SearchInput value={search} onChange={setSearch} placeholder="Search brands..." className="sm:w-72" />
        </div>

        {loading && brands.length === 0 ? (
          <div className="p-8"><Skeleton className="h-48 w-full rounded-lg" /></div>
        ) : brands.length === 0 ? (
          <EmptyState icon={Tags} title="No brands yet" description="Add your first brand to get started." actionLabel="Add Brand" onAction={openAdd} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y border-border bg-gray-50/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Products</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {brands.map((b) => {
                  const isActive = b.status !== 'inactive';
                  const bx = b as Brand & Record<string, unknown>;
                  return (
                    <tr key={b.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          {(bx.logoUrl || bx.logo) ? (
                            <img src={String(bx.logoUrl || bx.logo)} alt={b.name} className="h-8 w-8 rounded object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">{b.name[0]}</div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{b.name}</p>
                            {b.description && <p className="text-xs text-gray-400 truncate max-w-[180px]">{b.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-gray-600 text-sm">{b.slug}</td>
                      <td className="px-6 py-3 text-gray-600 text-sm">{(bx.productCount as number) ?? 0}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(bx)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteId(b.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Brand' : 'Add Brand'} size="md">
        <div className="space-y-4">
          {formError && <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">{formError}</p>}
          <div>
            <Label htmlFor="brand-name">Brand Name *</Label>
            <Input id="brand-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Nike" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="brand-desc">Description</Label>
            <textarea id="brand-desc" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short brand description..." rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
          <div>
            <Label>Logo Image</Label>
            <div className="mt-1">
              <ImageUploadField value={form.logoUrl} onChange={url => setForm(f => ({ ...f, logoUrl: url }))} folder="brands" />
            </div>
          </div>
          <div>
            <Label htmlFor="brand-web">Website URL</Label>
            <Input id="brand-web" value={form.websiteUrl} onChange={e => setForm(f => ({ ...f, websiteUrl: e.target.value }))} placeholder="https://brand.com" className="mt-1" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="brand-active" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
            <Label htmlFor="brand-active" className="cursor-pointer">Active</Label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Brand' : 'Add Brand'}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Brand" size="sm">
        <div className="space-y-4">
          <p className="text-gray-600">Are you sure you want to delete this brand? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
