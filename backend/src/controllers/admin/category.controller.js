import { supabase } from '../../config/database.js';
import { toCamelCase } from '../../lib/response.js';

const TABLE = 'categories';

// Actual columns confirmed in DB:
// id, name, slug, parent_id, image_url, sort_order, is_active, created_at, updated_at
// Optional (added via FIX SQL): description, is_featured, seo_title, meta_description, product_count

async function hasExtraColumns() {
  const { error } = await supabase.from(TABLE).select('description').limit(0);
  return !error;
}

function makeSlug(name) {
  return (name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export const listCategories = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    let query = supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (search) query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
    if (status === 'active') query = query.eq('is_active', true);
    if (status === 'inactive') query = query.eq('is_active', false);

    const { data, error, count } = await query.range(from, to);

    if (error) {
      if (error.code === '42P01') {
        return res.json({ success: true, data: [], total: 0, page: 1, limit: Number(limit), totalPages: 0 });
      }
      return res.status(500).json({ success: false, message: error.message });
    }

    const total = count ?? data?.length ?? 0;
    res.json({
      success: true,
      data: (data || []).map(toCamelCase),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)) || 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: toCamelCase(data) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, parentId, imageUrl, sortOrder, isActive, isFeatured, seoTitle, metaDescription } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });

    // Core columns that always exist
    const payload = {
      name: name.trim(),
      slug: slug || makeSlug(name),
      parent_id: parentId ?? null,
      image_url: imageUrl ?? null,
      sort_order: sortOrder ?? 0,
      is_active: isActive !== false,
    };

    // Add optional columns only if they exist in the DB
    const extra = await hasExtraColumns();
    if (extra) {
      payload.description = description ?? null;
      payload.is_featured = isFeatured === true;
      payload.seo_title = seoTitle ?? null;
      payload.meta_description = metaDescription ?? null;
      payload.product_count = 0;
    }

    const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });
    res.status(201).json({ success: true, data: toCamelCase(data) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, slug, description, parentId, imageUrl, sortOrder, isActive, isFeatured, seoTitle, metaDescription } = req.body;

    // Core columns
    const updates = {};
    if (name !== undefined) { updates.name = name; updates.slug = slug || makeSlug(name); }
    if (slug !== undefined) updates.slug = slug;
    if (parentId !== undefined) updates.parent_id = parentId;
    if (imageUrl !== undefined) updates.image_url = imageUrl;
    if (sortOrder !== undefined) updates.sort_order = sortOrder;
    if (isActive !== undefined) updates.is_active = isActive;

    // Optional columns
    const extra = await hasExtraColumns();
    if (extra) {
      if (description !== undefined) updates.description = description;
      if (isFeatured !== undefined) updates.is_featured = isFeatured;
      if (seoTitle !== undefined) updates.seo_title = seoTitle;
      if (metaDescription !== undefined) updates.meta_description = metaDescription;
    }

    // Nothing to update — just return the existing row
    if (Object.keys(updates).length === 0) {
      const { data: existing, error: fetchErr } = await supabase.from(TABLE).select('*').eq('id', req.params.id).single();
      if (fetchErr || !existing) return res.status(404).json({ success: false, message: 'Category not found' });
      return res.json({ success: true, data: toCamelCase(existing) });
    }

    const { data, error } = await supabase.from(TABLE).update(updates).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });
    if (!data) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: toCamelCase(data) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { data, error } = await supabase.from(TABLE).delete().eq('id', req.params.id).select('id').maybeSingle();
    if (error) return res.status(500).json({ success: false, message: error.message });
    if (!data) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
