import { useState, useEffect, useCallback } from 'react';
import { Plus, Image, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SearchInput } from '@/components/ui/SearchInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { adminApi } from '@/api/admin';
import { EmptyState } from '@/components/ui/EmptyState';

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkType: 'product' | 'category' | 'url' | 'none';
  linkValue: string;
  sortOrder: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface BannerForm {
  title: string;
  imageUrl: string;
  linkType: 'product' | 'category' | 'url' | 'none';
  linkValue: string;
  sortOrder: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

const emptyForm: BannerForm = {
  title: '',
  imageUrl: '',
  linkType: 'none',
  linkValue: '',
  sortOrder: 0,
  isActive: true,
  startDate: '',
  endDate: '',
};

const LINK_TYPE_LABELS: Record<string, string> = {
  none: 'None',
  product: 'Product',
  category: 'Category',
  url: 'URL',
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return dateStr;
  }
}

export function BannersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBanners = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi
      .getBanners({
        page: 1,
        limit: 100,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      })
      .then((res) => {
        setBanners(res.data as Banner[]);
        setTotal(res.total);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load banners'))
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditingId(b.id);
    setForm({
      title: b.title,
      imageUrl: b.imageUrl,
      linkType: b.linkType,
      linkValue: b.linkValue,
      sortOrder: b.sortOrder,
      isActive: b.isActive,
      startDate: b.startDate ? b.startDate.slice(0, 10) : '',
      endDate: b.endDate ? b.endDate.slice(0, 10) : '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setFormError('Title is required'); return; }
    setSaving(true);
    setFormError(null);
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        imageUrl: form.imageUrl,
        linkType: form.linkType,
        linkValue: form.linkType !== 'none' ? form.linkValue : '',
        sortOrder: form.sortOrder,
        isActive: form.isActive,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };
      if (editingId) {
        await adminApi.updateBanner(editingId, payload);
        toast.success('Banner updated');
      } else {
        await adminApi.createBanner(payload);
        toast.success('Banner added');
      }
      setModalOpen(false);
      fetchBanners();
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
      await adminApi.deleteBanner(deleteId);
      toast.success('Banner deleted');
      setDeleteId(null);
      fetchBanners();
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
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-sm text-gray-500 mt-1">Manage promotional banners ({total})</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Banner</Button>
      </div>

      {error && <p className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</p>}

      <Card padding={false}>
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search banners..." className="sm:w-72" />
          <div className="flex gap-2">
            {(['all', 'active', 'inactive'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading && banners.length === 0 ? (
          <div className="p-8"><Skeleton className="h-48 w-full rounded-lg" /></div>
        ) : banners.length === 0 ? (
          <EmptyState
            icon={Image}
            title="No banners yet"
            description="Add your first banner to get started."
            actionLabel="Add Banner"
            onAction={openAdd}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y border-border bg-gray-50/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Link Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Sort Order</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">End Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {banners.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3">
                      {b.imageUrl ? (
                        <img
                          src={b.imageUrl}
                          alt={b.title}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                          <Image className="h-5 w-5" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-900">{b.title}</p>
                      {b.linkType !== 'none' && b.linkValue && (
                        <p className="text-xs text-gray-400 truncate max-w-[180px]">{b.linkValue}</p>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-600 text-sm">
                      {LINK_TYPE_LABELS[b.linkType] ?? b.linkType}
                    </td>
                    <td className="px-6 py-3 text-gray-600 text-sm">{b.sortOrder}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${b.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {b.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600 text-sm">{formatDate(b.startDate)}</td>
                    <td className="px-6 py-3 text-gray-600 text-sm">{formatDate(b.endDate)}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(b)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(b.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600"
                        >
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

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Banner' : 'Add Banner'} size="md">
        <div className="space-y-4">
          {formError && <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">{formError}</p>}

          <div>
            <Label htmlFor="banner-title">Title *</Label>
            <Input
              id="banner-title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Summer Sale"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="banner-image">Image URL</Label>
            <Input
              id="banner-image"
              value={form.imageUrl}
              onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://example.com/banner.jpg"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="banner-link-type">Link Type</Label>
            <select
              id="banner-link-type"
              value={form.linkType}
              onChange={e => setForm(f => ({ ...f, linkType: e.target.value as BannerForm['linkType'], linkValue: '' }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="none">None</option>
              <option value="product">Product</option>
              <option value="category">Category</option>
              <option value="url">URL</option>
            </select>
          </div>

          {form.linkType !== 'none' && (
            <div>
              <Label htmlFor="banner-link-value">
                {form.linkType === 'product' ? 'Product ID' : form.linkType === 'category' ? 'Category ID' : 'URL'}
              </Label>
              <Input
                id="banner-link-value"
                value={form.linkValue}
                onChange={e => setForm(f => ({ ...f, linkValue: e.target.value }))}
                placeholder={form.linkType === 'url' ? 'https://example.com/page' : 'Enter ID'}
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label htmlFor="banner-sort">Sort Order</Label>
            <Input
              id="banner-sort"
              type="number"
              value={String(form.sortOrder)}
              onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="banner-start">Start Date</Label>
              <Input
                id="banner-start"
                type="date"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="banner-end">End Date</Label>
              <Input
                id="banner-end"
                type="date"
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="banner-active"
              checked={form.isActive}
              onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-primary-600"
            />
            <Label htmlFor="banner-active" className="cursor-pointer">Active</Label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Banner' : 'Add Banner'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Banner" size="sm">
        <div className="space-y-4">
          <p className="text-gray-600">Are you sure you want to delete this banner? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
