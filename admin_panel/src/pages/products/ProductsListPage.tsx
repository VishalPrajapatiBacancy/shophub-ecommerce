import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Star, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { MultiImageUploadField } from '@/components/ui/MultiImageUploadField';
import { adminApi } from '@/api/admin';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency } from '@/lib/utils';
import type { Product, Category } from '@/types';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
  category: string;
  images: string[];
  status: 'active' | 'draft' | 'archived';
}

const emptyForm: ProductForm = {
  name: '', description: '', price: '', stock: '', categoryId: '', category: '', images: [], status: 'active',
};

export function ProductsListPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const categoriesFetched = useRef(false);

  const debouncedSearch = useDebounce(search, 300);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    adminApi
      .getProducts({
        page, limit,
        search: debouncedSearch || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
      })
      .then((res) => { setProducts(res.data); setTotal(res.total); })
      .catch((err) => toast.error(err.message || 'Failed to load products'))
      .finally(() => setLoading(false));
  }, [page, limit, debouncedSearch, categoryFilter, statusFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    if (categoriesFetched.current) return;
    categoriesFetched.current = true;
    adminApi.getCategories({ limit: 200, status: 'active' })
      .then((res) => setCategories(res.data))
      .catch(() => { /* non-critical */ });
  }, []);

  const handleSearch = useCallback((value: string) => { setSearch(value); setPage(1); }, []);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setFormError(null); setModalOpen(true); };
  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name, description: p.description || '', price: String(p.price),
      stock: String(p.stock),
      categoryId: p.categoryId || '',
      category: p.category || '',
      images: p.images && p.images.length > 0 ? p.images : (p.thumbnail ? [p.thumbnail] : []),
      status: (p.status === 'out_of_stock' ? 'active' : p.status) as 'active' | 'draft' | 'archived',
    });
    setFormError(null); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Product name is required'); return; }
    if (!form.price || isNaN(Number(form.price))) { setFormError('Valid price is required'); return; }
    setSaving(true); setFormError(null);
    try {
      const payload = {
        name: form.name.trim(), description: form.description,
        price: Number(form.price), stock: Number(form.stock) || 0,
        category: form.category,
        categoryId: form.categoryId || undefined,
        images: form.images,
        imageUrl: form.images[0] || '',
      };
      if (editingId) {
        await adminApi.updateProduct(editingId, payload);
        toast.success('Product updated');
      } else {
        await adminApi.createProduct(payload);
        toast.success('Product added');
      }
      setModalOpen(false); fetchProducts();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteProduct(deleteId);
      toast.success('Product deleted');
      setDeleteId(null); fetchProducts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally { setDeleting(false); }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const columns: Column<Product>[] = [
    {
      key: 'name', label: 'Product', sortable: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-medium overflow-hidden">
            {p.thumbnail ? <img src={p.thumbnail} alt="" className="h-10 w-10 object-cover" /> : 'IMG'}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{p.name}</p>
            <p className="text-xs text-gray-500">SKU: {p.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category', label: 'Category', sortable: true,
      render: (p) => <span className="text-gray-600">{p.category || '—'}</span>,
    },
    {
      key: 'price', label: 'Price', sortable: true,
      render: (p) => (
        <div>
          <p className="font-medium text-gray-900">{formatCurrency(p.price)}</p>
          {p.compareAtPrice != null && p.compareAtPrice > 0 && (
            <p className="text-xs text-gray-400 line-through">{formatCurrency(p.compareAtPrice)}</p>
          )}
        </div>
      ),
    },
    {
      key: 'stock', label: 'Stock', sortable: true,
      render: (p) => (
        <span className={p.stock <= p.lowStockThreshold ? 'text-red-600 font-medium' : 'text-gray-700'}>
          {p.stock}
        </span>
      ),
    },
    {
      key: 'rating', label: 'Rating', sortable: true,
      render: (p) => p.rating > 0 ? (
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-sm text-gray-700">{p.rating}</span>
          <span className="text-xs text-gray-400">({p.reviewCount})</span>
        </div>
      ) : <span className="text-xs text-gray-400">No reviews</span>,
    },
    {
      key: 'status', label: 'Status',
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: 'id' as keyof Product, label: '', className: 'w-20',
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); openEdit(p); }} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteId(p.id); }} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{loading ? 'Loading…' : `${total} products found`}</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <SearchInput value={search} onChange={handleSearch} placeholder="Search products…" className="sm:w-72" />
          <Select
            options={[{ value: '', label: 'All Categories' }, ...categories.map(c => ({ value: c.name, label: c.name }))]}
            placeholder="All Categories"
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="sm:w-44"
          />
          <Select options={statusOptions} placeholder="All Statuses" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="sm:w-40" />
        </div>
        {loading && products.length === 0 ? (
          <div className="p-8"><Skeleton className="h-64 w-full rounded-lg" /></div>
        ) : (
          <DataTable
            data={products as unknown as Record<string, unknown>[]}
            columns={columns as Column<Record<string, unknown>>[]}
            keyExtractor={(item) => (item as unknown as Product).id}
            currentPage={page} totalPages={totalPages} onPageChange={setPage}
          />
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Product' : 'Add Product'} size="lg">
        <div className="space-y-4">
          {formError && <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">{formError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="p-name">Product Name *</Label>
              <Input id="p-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Running Shoes" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="p-price">Price ($) *</Label>
              <Input id="p-price" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" className="mt-1" min="0" step="0.01" />
            </div>
            <div>
              <Label htmlFor="p-stock">Stock Quantity</Label>
              <Input id="p-stock" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" className="mt-1" min="0" />
            </div>
            <div>
              <Label htmlFor="p-category">Category</Label>
              <select
                id="p-category"
                value={form.categoryId}
                onChange={e => {
                  const selected = categories.find(c => c.id === e.target.value);
                  setForm(f => ({ ...f, categoryId: e.target.value, category: selected?.name || '' }));
                }}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">— Select Category —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Status</Label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'active' | 'draft' | 'archived' }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label>Product Images</Label>
              <div className="mt-1">
                <MultiImageUploadField
                  values={form.images}
                  onChange={urls => setForm(f => ({ ...f, images: urls }))}
                  folder="products"
                  maxImages={10}
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="p-desc">Description</Label>
              <textarea id="p-desc" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Product description…" rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update Product' : 'Add Product'}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Product" size="sm">
        <div className="space-y-4">
          <p className="text-gray-600">Are you sure you want to delete this product? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
