import { supabase } from '../../config/database.js';
import { toCamelCase } from '../../lib/response.js';
import { randomUUID } from 'crypto';

/**
 * Coupons stored in Supabase Storage (admin-uploads/meta/coupons-data.json)
 * because the 'coupons' table does not yet exist in the DB.
 * Auto-switches to DB once the table is created.
 */

const BUCKET = 'admin-uploads';
const FILE   = 'meta/coupons-data.json';

async function readCoupons() {
  const { data, error } = await supabase.storage.from(BUCKET).download(FILE);
  if (error) return [];
  try { return JSON.parse(await data.text()); } catch { return []; }
}

async function writeCoupons(coupons) {
  const blob = new Blob([JSON.stringify(coupons, null, 2)], { type: 'application/json' });
  await supabase.storage.from(BUCKET).upload(FILE, blob, { upsert: true, contentType: 'application/json' });
}

async function dbTableExists() {
  const { error } = await supabase.from('coupons').select('id').limit(0);
  return !error;
}

// ─── Controllers ─────────────────────────────────────────────────────────────

export const listCoupons = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;

    if (await dbTableExists()) {
      const from = (Number(page) - 1) * Number(limit);
      const to   = from + Number(limit) - 1;
      let q = supabase.from('coupons').select('*', { count: 'exact' }).order('created_at', { ascending: false });
      if (search) q = q.or(`code.ilike.%${search}%,description.ilike.%${search}%`);
      if (status && status !== 'all') q = q.eq('status', status);
      const { data, error, count } = await q.range(from, to);
      if (!error) {
        const total = count ?? data?.length ?? 0;
        return res.json({ success: true, data: (data || []).map(toCamelCase), total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) || 0 });
      }
    }

    // Fallback: Storage JSON
    let coupons = await readCoupons();
    if (search) coupons = coupons.filter(c => c.code?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()));
    if (status && status !== 'all') coupons = coupons.filter(c => c.status === status);

    const total = coupons.length;
    const from  = (Number(page) - 1) * Number(limit);
    const paged = coupons.slice(from, from + Number(limit));
    res.json({ success: true, data: paged.map(toCamelCase), total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) || 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCouponById = async (req, res) => {
  try {
    if (await dbTableExists()) {
      const { data, error } = await supabase.from('coupons').select('*').eq('id', req.params.id).single();
      if (!error && data) return res.json({ success: true, data: toCamelCase(data) });
    }
    const coupons = await readCoupons();
    const coupon  = coupons.find(c => c.id === req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, data: toCamelCase(coupon) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { code, description, type, value, minOrderAmount, maxDiscount, usageLimit, startDate, endDate, status } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code is required' });

    const payload = {
      code: code.toUpperCase().trim(),
      description: description ?? null,
      type: type || 'percentage',
      value: Number(value) || 0,
      min_order_amount: minOrderAmount != null ? Number(minOrderAmount) : null,
      max_discount: maxDiscount != null ? Number(maxDiscount) : null,
      usage_limit: usageLimit != null ? Number(usageLimit) : null,
      used_count: 0,
      start_date: startDate ?? null,
      end_date: endDate ?? null,
      status: status || 'active',
    };

    if (await dbTableExists()) {
      const { data, error } = await supabase.from('coupons').insert(payload).select().single();
      if (!error) return res.status(201).json({ success: true, data: toCamelCase(data) });
    }

    // Fallback: Storage JSON
    const coupons = await readCoupons();
    // Check duplicate code
    if (coupons.find(c => c.code === payload.code)) {
      return res.status(400).json({ success: false, message: `Coupon code "${payload.code}" already exists` });
    }
    const newCoupon = { ...payload, id: randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    coupons.push(newCoupon);
    await writeCoupons(coupons);
    res.status(201).json({ success: true, data: toCamelCase(newCoupon) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { code, description, type, value, minOrderAmount, maxDiscount, usageLimit, startDate, endDate, status } = req.body;

    const updates = {};
    if (code        !== undefined) updates.code             = code.toUpperCase().trim();
    if (description !== undefined) updates.description      = description;
    if (type        !== undefined) updates.type             = type;
    if (value       !== undefined) updates.value            = Number(value);
    if (minOrderAmount !== undefined) updates.min_order_amount = minOrderAmount == null ? null : Number(minOrderAmount);
    if (maxDiscount !== undefined) updates.max_discount     = maxDiscount == null ? null : Number(maxDiscount);
    if (usageLimit  !== undefined) updates.usage_limit      = usageLimit == null ? null : Number(usageLimit);
    if (startDate   !== undefined) updates.start_date       = startDate;
    if (endDate     !== undefined) updates.end_date         = endDate;
    if (status      !== undefined) updates.status           = status;

    if (await dbTableExists()) {
      const { data, error } = await supabase.from('coupons').update(updates).eq('id', req.params.id).select().single();
      if (!error && data) return res.json({ success: true, data: toCamelCase(data) });
    }

    // Fallback: Storage JSON
    const coupons = await readCoupons();
    const idx = coupons.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Coupon not found' });
    coupons[idx] = { ...coupons[idx], ...updates, updated_at: new Date().toISOString() };
    await writeCoupons(coupons);
    res.json({ success: true, data: toCamelCase(coupons[idx]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    if (await dbTableExists()) {
      const { data, error } = await supabase.from('coupons').delete().eq('id', req.params.id).select('id').maybeSingle();
      if (!error && data) return res.json({ success: true, message: 'Coupon deleted' });
    }

    const coupons = await readCoupons();
    const idx = coupons.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Coupon not found' });
    coupons.splice(idx, 1);
    await writeCoupons(coupons);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
