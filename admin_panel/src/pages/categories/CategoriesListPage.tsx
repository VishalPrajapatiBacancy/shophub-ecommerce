import { useState, useEffect, useCallback } from 'react';
import { Plus, FolderTree, Pencil, Trash2 } from 'lucide-react';
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
import type { Category } from '@/types';

// ── localStorage helpers for description (fallback until DB column is added) ──
const LS_KEY = (id: string) => `cat_desc_${id}`;
const getLocalDesc = (id: string) => localStorage.getItem(LS_KEY(id)) ?? '';
const setLocalDesc = (id: string, desc: string) => {
  if (desc.trim()) localStorage.setItem(LS_KEY(id), desc);
  else localStorage.removeItem(LS_KEY(id));
};
const clearLocalDesc = (id: string) => localStorage.removeItem(LS_KEY(id));

// ── helper: read isActive from API response (returns isActive bool, not status string) ──
const getIsActive = (c: Record<string, unknown>) =>
  c.isActive !== undefined ? c.isActive !== false : c.status !== 'inactive';

interface CategoryForm {
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

const emptyForm: CategoryForm = { name: '', description: '', imageUrl: '', isActive: true };

export function CategoriesListPage() {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(() => {
    setLoading(true);
    adminApi.getCategories({ page: 1, limit: 50, search: search || undefined })
      .then(res => { setCategories(res.data); setTotal(res.total); })
      .catch(err => toast.error(err.message || 'Failed to load categories'))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (c: Category & Record<string, unknown>) => {
    setEditingId(c.id);
    // DB description takes priority; fall back to localStorage cache
    const dbDesc = String(c.description ?? (c as Record<string, unknown>).description ?? '');
    const description = dbDesc || getLocalDesc(c.id);
    setForm({
      name: c.name,
      description,
      imageUrl: String((c as Record<string, unknown>).imageUrl ?? c.image ?? ''),
      isActive: getIsActive(c as Record<string, unknown>),
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Category name is required'); return; }
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description,
        imageUrl: form.imageUrl,
        isActive: form.isActive,
      };

      if (editingId) {
        await adminApi.updateCategory(editingId, payload as Partial<Category>);
        // Always persist description locally (no-op once DB column exists)
        setLocalDesc(editingId, form.description);
        toast.success('Category updated');
      } else {
        const res = await adminApi.createCategory(payload as Partial<Category>);
        // Save description locally keyed by the new category's ID
        const newId = (res as { data?: { id?: string } }).data?.id;
        if (newId) setLocalDesc(newId, form.description);
        toast.success('Category added');
      }
      setModalOpen(false);
      fetchCategories();
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
      await adminApi.deleteCategory(deleteId);
      clearLocalDesc(deleteId);
      toast.success('Category deleted');
      setDeleteId(null);
      fetchCategories();
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
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product categories ({total})</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Category</Button>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-border">
          <SearchInput value={search} onChange={setSearch} placeholder="Search categories…" className="sm:w-72" />
        </div>
        {loading && categories.length === 0 ? (
          <div className="p-8"><Skeleton className="h-48 w-full rounded-lg" /></div>
        ) : categories.length === 0 ? (
          <EmptyState icon={FolderTree} title="No categories yet" description="Add your first category to organize products." actionLabel="Add Category" onAction={openAdd} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y border-border bg-gray-50/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Products</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((c) => {
                  const cx = c as Category & Record<string, unknown>;
                  const isActive = getIsActive(cx as Record<string, unknown>);
                  const imgSrc = String((cx as Record<string, unknown>).imageUrl || cx.image || '');
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          {imgSrc && <img src={imgSrc} alt={c.name} className="h-8 w-8 rounded object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                          <div>
                            <span className="font-medium text-gray-900">{c.name}</span>
                            {getLocalDesc(c.id) && (
                              <p className="text-xs text-gray-400 truncate max-w-[200px]">{getLocalDesc(c.id)}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-gray-600 text-sm">{c.slug}</td>
                      <td className="px-6 py-3 text-gray-600 text-sm">{(cx.productCount as number) ?? 0}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(cx)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
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
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Category' : 'Add Category'} size="md">
        <div className="space-y-4">
          {formError && <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">{formError}</p>}
          <div>
            <Label htmlFor="cat-name">Category Name *</Label>
            <Input id="cat-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Electronics" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="cat-desc">Description</Label>
            <textarea
              id="cat-desc"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Short description…"
              rows={2}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
          <div>
            <Label>Category Image</Label>
            <div className="mt-1">
              <ImageUploadField value={form.imageUrl} onChange={url => setForm(f => ({ ...f, imageUrl: url }))} folder="categories" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="cat-active" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
            <Label htmlFor="cat-active" className="cursor-pointer">Active</Label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update Category' : 'Add Category'}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Category" size="sm">
        <div className="space-y-4">
          <p className="text-gray-600">Are you sure you want to delete this category?</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
