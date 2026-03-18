import { supabase } from '../../config/database.js';

const DEFAULT_ROLES = [
  { id: 'super_admin', name: 'Super Admin', description: 'Full access to all modules', isSystem: true, permissions: { all: true } },
  { id: 'manager', name: 'Store Manager', description: 'Manage store operations', isSystem: true, permissions: { dashboard: ['view'], products: ['view', 'create', 'edit', 'delete'], orders: ['view', 'edit'], customers: ['view', 'edit'], coupons: ['view', 'create', 'edit', 'delete'] } },
  { id: 'editor', name: 'Content Editor', description: 'Manage products and content', isSystem: false, permissions: { products: ['view', 'create', 'edit'], categories: ['view', 'create', 'edit'] } },
  { id: 'viewer', name: 'Viewer', description: 'View-only access', isSystem: false, permissions: { dashboard: ['view'], products: ['view'], orders: ['view'], customers: ['view'] } },
];

export async function listRoles(req, res) {
  try {
    const { data, error } = await supabase.from('roles').select('*').order('created_at', { ascending: true });
    if (error && error.code === '42P01') {
      return res.json({ success: true, data: DEFAULT_ROLES });
    }
    if (error) throw error;
    const formatted = (data || []).map(r => ({
      id: r.id,
      name: r.name,
      description: r.description || '',
      isSystem: r.is_system || false,
      permissions: r.permissions || {},
      staffCount: r.staff_count || 0,
      createdAt: r.created_at,
    }));
    res.json({ success: true, data: formatted.length > 0 ? formatted : DEFAULT_ROLES });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createRole(req, res) {
  try {
    const { name, description, permissions } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const record = { name, description: description || '', permissions: permissions || {}, is_system: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('roles').insert([record]).select().single();
    if (error && error.code === '42P01') {
      return res.json({ success: true, data: { id: Date.now().toString(), ...record } });
    }
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateRole(req, res) {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (permissions) updates.permissions = permissions;

    const { data, error } = await supabase.from('roles').update(updates).eq('id', id).select().single();
    if (error && error.code === '42P01') {
      return res.json({ success: true, data: { id, ...updates } });
    }
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteRole(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('roles').delete().eq('id', id);
    if (error && error.code === '42P01') return res.json({ success: true });
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
