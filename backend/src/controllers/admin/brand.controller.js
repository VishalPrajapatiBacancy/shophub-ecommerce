import { supabase } from '../../config/database.js';
import { toCamelCase } from '../../lib/response.js';
import { randomUUID } from 'crypto';

/**
 * Brands are stored as a JSON file in Supabase Storage (admin-uploads/brands-data.json)
 * because the 'brands' table does not yet exist in the DB.
 * Once the table is created via SQL, swap back to DB queries.
 */

const BUCKET = 'admin-uploads';
const FILE   = 'meta/brands-data.json';

async function readBrands() {
  const { data, error } = await supabase.storage.from(BUCKET).download(FILE);
  if (error) return [];          // file not found → empty list
  const text = await data.text();
  try { return JSON.parse(text); } catch { return []; }
}

async function writeBrands(brands) {
  const json = JSON.stringify(brands, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  await supabase.storage.from(BUCKET).upload(FILE, blob, { upsert: true, contentType: 'application/json' });
}

function makeSlug(name) {
  return (name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ── Also try the real DB table; if it doesn't exist fall back to Storage ────

async function dbTableExists() {
  const { error } = await supabase.from('brands').select('id').limit(0);
  return !error;
}

// ─── Controllers ─────────────────────────────────────────────────────────────

export const listBrands = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;

    // Try real DB first
    if (await dbTableExists()) {
      const from = (Number(page) - 1) * Number(limit);
      const to   = from + Number(limit) - 1;
      let q = supabase.from('brands').select('*', { count: 'exact' })
        .order('sort_order', { ascending: true }).order('name', { ascending: true });
      if (search) q = q.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
      if (status === 'active')   q = q.eq('is_active', true);
      if (status === 'inactive') q = q.eq('is_active', false);
      const { data, error, count } = await q.range(from, to);
      if (!error) {
        const total = count ?? data?.length ?? 0;
        return res.json({ success: true, data: (data || []).map(toCamelCase), total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) || 0 });
      }
    }

    // Fallback: Storage JSON
    let brands = await readBrands();
    if (search) brands = brands.filter(b => b.name?.toLowerCase().includes(search.toLowerCase()));
    if (status === 'active')   brands = brands.filter(b => b.is_active);
    if (status === 'inactive') brands = brands.filter(b => !b.is_active);

    const total = brands.length;
    const from  = (Number(page) - 1) * Number(limit);
    const paged = brands.slice(from, from + Number(limit));

    res.json({ success: true, data: paged.map(toCamelCase), total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) || 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBrandById = async (req, res) => {
  try {
    if (await dbTableExists()) {
      const { data, error } = await supabase.from('brands').select('*').eq('id', req.params.id).single();
      if (!error && data) return res.json({ success: true, data: toCamelCase(data) });
    }
    const brands = await readBrands();
    const brand  = brands.find(b => b.id === req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.json({ success: true, data: toCamelCase(brand) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createBrand = async (req, res) => {
  try {
    const { name, slug, description, logoUrl, bannerUrl, websiteUrl, isActive, isFeatured, sortOrder, seoTitle, metaDescription } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Brand name is required' });

    const payload = {
      name: name.trim(),
      slug: slug || makeSlug(name),
      description: description ?? null,
      logo_url: logoUrl ?? null,
      banner_url: bannerUrl ?? null,
      website_url: websiteUrl ?? null,
      is_active: isActive !== false,
      is_featured: isFeatured === true,
      sort_order: sortOrder ?? 0,
      product_count: 0,
      seo_title: seoTitle ?? null,
      meta_description: metaDescription ?? null,
    };

    // Try real DB first
    if (await dbTableExists()) {
      const { data, error } = await supabase.from('brands').insert(payload).select().single();
      if (!error) return res.status(201).json({ success: true, data: toCamelCase(data) });
    }

    // Fallback: Storage JSON
    const brands = await readBrands();
    const newBrand = { ...payload, id: randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    brands.push(newBrand);
    await writeBrands(brands);
    res.status(201).json({ success: true, data: toCamelCase(newBrand) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { name, slug, description, logoUrl, bannerUrl, websiteUrl, isActive, isFeatured, sortOrder, seoTitle, metaDescription } = req.body;

    const updates = {};
    if (name        !== undefined) { updates.name = name; updates.slug = slug || makeSlug(name); }
    if (slug        !== undefined) updates.slug         = slug;
    if (description !== undefined) updates.description  = description;
    if (logoUrl     !== undefined) updates.logo_url     = logoUrl;
    if (bannerUrl   !== undefined) updates.banner_url   = bannerUrl;
    if (websiteUrl  !== undefined) updates.website_url  = websiteUrl;
    if (isActive    !== undefined) updates.is_active    = isActive;
    if (isFeatured  !== undefined) updates.is_featured  = isFeatured;
    if (sortOrder   !== undefined) updates.sort_order   = sortOrder;
    if (seoTitle    !== undefined) updates.seo_title    = seoTitle;
    if (metaDescription !== undefined) updates.meta_description = metaDescription;

    // Try real DB first
    if (await dbTableExists()) {
      const { data, error } = await supabase.from('brands').update(updates).eq('id', req.params.id).select().single();
      if (!error && data) return res.json({ success: true, data: toCamelCase(data) });
    }

    // Fallback: Storage JSON
    const brands = await readBrands();
    const idx = brands.findIndex(b => b.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Brand not found' });
    brands[idx] = { ...brands[idx], ...updates, updated_at: new Date().toISOString() };
    await writeBrands(brands);
    res.json({ success: true, data: toCamelCase(brands[idx]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    // Try real DB first
    if (await dbTableExists()) {
      const { data, error } = await supabase.from('brands').delete().eq('id', req.params.id).select('id').maybeSingle();
      if (!error && data) return res.json({ success: true, message: 'Brand deleted' });
    }

    // Fallback: Storage JSON
    const brands = await readBrands();
    const idx = brands.findIndex(b => b.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Brand not found' });
    brands.splice(idx, 1);
    await writeBrands(brands);
    res.json({ success: true, message: 'Brand deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
