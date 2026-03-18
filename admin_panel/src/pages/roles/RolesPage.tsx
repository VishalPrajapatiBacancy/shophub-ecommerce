import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Shield, Pencil, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminApi } from '@/api/admin';

interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: Record<string, boolean | string[]>;
  staffCount?: number;
}

const MODULES = [
  'Dashboard', 'Products', 'Categories', 'Brands', 'Inventory',
  'Orders', 'Customers', 'Coupons', 'Reviews', 'Returns',
  'Payments', 'Analytics', 'Notifications', 'Support', 'Settings', 'Staff', 'Roles',
];

const ACTIONS = ['view', 'create', 'edit', 'delete'];

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-800',
  manager: 'bg-blue-100 text-blue-800',
  editor: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800',
};

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRoles = () => {
    setLoading(true);
    adminApi.getRoles()
      .then(res => setRoles(res.data as Role[]))
      .catch(err => setError((err as Error).message || 'Failed to load roles'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRoles(); }, []);

  const openAdd = () => {
    setEditingId(null); setName(''); setDescription('');
    setPermissions({}); setFormError(null); setModalOpen(true);
  };

  const openEdit = (r: Role) => {
    setEditingId(r.id); setName(r.name); setDescription(r.description);
    setPermissions(
      typeof r.permissions === 'object' && !r.permissions.all
        ? (r.permissions as Record<string, string[]>)
        : {}
    );
    setFormError(null); setModalOpen(true);
  };

  const togglePermission = (module: string, action: string) => {
    setPermissions(prev => {
      const current = prev[module.toLowerCase()] || [];
      const has = current.includes(action);
      const updated = has ? current.filter(a => a !== action) : [...current, action];
      return { ...prev, [module.toLowerCase()]: updated };
    });
  };

  const hasPermission = (module: string, action: string) => {
    const p = permissions[module.toLowerCase()];
    return Array.isArray(p) && p.includes(action);
  };

  const handleSave = async () => {
    if (!name.trim()) { setFormError('Role name is required'); return; }
    setSaving(true); setFormError(null);
    try {
      if (editingId) { await adminApi.updateRole(editingId, { name, description, permissions }); }
      else { await adminApi.createRole({ name, description, permissions }); }
      toast.success(editingId ? 'Role updated' : 'Role created');
      setModalOpen(false); fetchRoles();
    } catch (err) {
      setFormError((err as Error).message || 'Save failed');
      toast.error((err as Error).message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await adminApi.deleteRole(deleteId); setDeleteId(null); fetchRoles(); toast.success('Role deleted'); }
    catch (err) { setError((err as Error).message || 'Delete failed'); toast.error((err as Error).message || 'Delete failed'); }
    finally { setDeleting(false); }
  };

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[1,2,3,4].map(i=><Skeleton key={i} className="h-32 rounded-lg" />)}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage user roles and access controls</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Role</Button>
      </div>

      {error && <p className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map(r => (
          <Card key={r.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                  <Shield className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{r.name}</p>
                    {r.isSystem && <span className="inline-flex rounded-full px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600">System</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{r.description || 'No description'}</p>
                </div>
              </div>
              {!r.isSystem && (
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {(r.permissions as Record<string, unknown>).all ? (
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[r.id] || 'bg-blue-100 text-blue-800'}`}>Full Access</span>
              ) : (
                Object.keys(r.permissions || {}).slice(0, 5).map(mod => (
                  <span key={mod} className="inline-flex rounded-full px-2 py-0.5 text-xs bg-gray-100 text-gray-600 capitalize">{mod}</span>
                ))
              )}
              {Object.keys(r.permissions || {}).length > 5 && (
                <span className="inline-flex rounded-full px-2 py-0.5 text-xs bg-gray-100 text-gray-500">+{Object.keys(r.permissions).length - 5} more</span>
              )}
            </div>
            {r.staffCount != null && (
              <p className="text-xs text-gray-400 mt-2">{r.staffCount} staff members</p>
            )}
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Role' : 'Add Role'} size="xl">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {formError && <p className="text-red-600 bg-red-50 p-3 rounded text-sm">{formError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="r-name">Role Name *</Label>
              <Input id="r-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Order Manager" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="r-desc">Description</Label>
              <Input id="r-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description" className="mt-1" />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Permissions</Label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-5 gap-0 bg-gray-50 border-b border-gray-200">
                <div className="px-4 py-2 text-xs font-semibold uppercase text-gray-500 col-span-1">Module</div>
                {ACTIONS.map(a => <div key={a} className="px-2 py-2 text-xs font-semibold uppercase text-gray-500 text-center capitalize">{a}</div>)}
              </div>
              <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                {MODULES.map(mod => (
                  <div key={mod} className="grid grid-cols-5 gap-0 hover:bg-gray-50/50">
                    <div className="px-4 py-2 text-sm text-gray-700 col-span-1 self-center">{mod}</div>
                    {ACTIONS.map(action => (
                      <div key={action} className="flex items-center justify-center py-2">
                        <button onClick={() => togglePermission(mod, action)} className={`h-5 w-5 rounded flex items-center justify-center border transition-colors ${hasPermission(mod, action) ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300 bg-white'}`}>
                          {hasPermission(mod, action) && <Check className="h-3 w-3" />}
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-white pb-1">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Role' : 'Create Role'}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Role" size="sm">
        <div className="space-y-4">
          <p className="text-gray-600">Are you sure you want to delete this role?</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
