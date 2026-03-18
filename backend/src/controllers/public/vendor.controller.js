import { supabase } from '../../config/database.js';
import { toCamelCase } from '../../lib/response.js';

async function vendorsTableExists() {
  const { error } = await supabase.from('vendors').select('id').limit(0);
  return !error;
}

// GET /api/vendors — list active vendors for mobile app
export const listVendors = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to   = from + Number(limit) - 1;

    if (await vendorsTableExists()) {
      let q = supabase.from('vendors').select('id, store_name, slug, description, logo_url, banner_url, rating, total_orders, created_at', { count: 'exact' })
        .eq('status', 'active')
        .order('store_name', { ascending: true });
      if (search) q = q.ilike('store_name', `%${search}%`);
      const { data, error, count } = await q.range(from, to);
      if (!error) {
        const total = count ?? 0;
        return res.json({ success: true, data: (data || []).map(toCamelCase), total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) || 0 });
      }
    }

    res.json({ success: true, data: [], total: 0, page: Number(page), limit: Number(limit), totalPages: 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/vendors/:idOrSlug — single vendor detail
export const getVendorByIdOrSlug = async (req, res) => {
  try {
    if (!(await vendorsTableExists())) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const { idOrSlug } = req.params;
    const isUUID = /^[0-9a-f-]{36}$/.test(idOrSlug);
    let q = supabase.from('vendors')
      .select('id, store_name, slug, description, logo_url, banner_url, rating, total_orders, total_revenue, created_at')
      .eq('status', 'active');
    q = isUUID ? q.eq('id', idOrSlug) : q.eq('slug', idOrSlug);
    const { data, error } = await q.single();

    if (error || !data) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.json({ success: true, data: toCamelCase(data) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/vendors/:id/products — products belonging to a vendor
export const getVendorProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to   = from + Number(limit) - 1;

    let q = supabase.from('products')
      .select('id, name, slug, price, compare_at_price, thumbnail, images, rating, review_count, stock, status', { count: 'exact' })
      .eq('vendor_id', req.params.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (search)   q = q.ilike('name', `%${search}%`);
    if (category) q = q.eq('category_id', category);
    const { data, error, count } = await q.range(from, to);

    if (error) {
      return res.json({ success: true, data: [], total: 0, page: Number(page), limit: Number(limit), totalPages: 0 });
    }
    const total = count ?? 0;
    res.json({ success: true, data: (data || []).map(toCamelCase), total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) || 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
