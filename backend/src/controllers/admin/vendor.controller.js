import { supabase } from '../../config/database.js';
import { toCamelCase } from '../../lib/response.js';
import { randomUUID } from 'crypto';

const BUCKET = 'admin-uploads';
const FILE   = 'meta/vendors-data.json';
const PAYOUTS_FILE = 'meta/vendor-payouts-data.json';

function makeSlug(name) {
  return (name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

async function readJson(file) {
  const { data, error } = await supabase.storage.from(BUCKET).download(file);
  if (error) return [];
  const text = await data.text();
  try { return JSON.parse(text); } catch { return []; }
}

async function writeJson(file, arr) {
  const json = JSON.stringify(arr, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  await supabase.storage.from(BUCKET).upload(file, blob, { upsert: true, contentType: 'application/json' });
}

async function vendorsTableExists() {
  const { error } = await supabase.from('vendors').select('id').limit(0);
  return !error;
}

async function payoutsTableExists() {
  const { error } = await supabase.from('vendor_payouts').select('id').limit(0);
  return !error;
}

// ─── Vendors CRUD ─────────────────────────────────────────────────────────────

export const listVendors = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to   = from + Number(limit) - 1;

    if (await vendorsTableExists()) {
      let q = supabase.from('vendors').select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
      if (search) q = q.or(`store_name.ilike.%${search}%,contact_email.ilike.%${search}%`);
      if (status) q = q.eq('status', status);
      const { data, error, count } = await q.range(from, to);
      if (!error) {
        const total = count ?? 0;
        return res.json({ success: true, data: (data || []).map(toCamelCase), total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) || 0 });
      }
    }

    // Fallback: Storage JSON
    let vendors = await readJson(FILE);
    if (search) vendors = vendors.filter(v => v.store_name?.toLowerCase().includes(search.toLowerCase()) || v.contact_email?.toLowerCase().includes(search.toLowerCase()));
    if (status) vendors = vendors.filter(v => v.status === status);
    const total = vendors.length;
    const paged = vendors.slice(from, from + Number(limit));
    res.json({ success: true, data: paged.map(toCamelCase), total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) || 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getVendorById = async (req, res) => {
  try {
    if (await vendorsTableExists()) {
      const { data, error } = await supabase.from('vendors').select('*').eq('id', req.params.id).single();
      if (!error && data) return res.json({ success: true, data: toCamelCase(data) });
    }
    const vendors = await readJson(FILE);
    const vendor = vendors.find(v => v.id === req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.json({ success: true, data: toCamelCase(vendor) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createVendor = async (req, res) => {
  try {
    const { storeName, slug, description, logoUrl, bannerUrl, contactEmail, contactPhone, address, commissionRate, status, bankAccount, notes } = req.body;
    if (!storeName) return res.status(400).json({ success: false, message: 'Store name is required' });

    const payload = {
      store_name: storeName.trim(),
      slug: slug || makeSlug(storeName),
      description: description ?? null,
      logo_url: logoUrl ?? null,
      banner_url: bannerUrl ?? null,
      contact_email: contactEmail ?? null,
      contact_phone: contactPhone ?? null,
      address: address ?? {},
      commission_rate: commissionRate ?? 10,
      status: status ?? 'pending',
      bank_account: bankAccount ?? {},
      notes: notes ?? null,
      total_revenue: 0,
      total_orders: 0,
      rating: 0,
    };

    if (await vendorsTableExists()) {
      const { data, error } = await supabase.from('vendors').insert(payload).select().single();
      if (!error) return res.status(201).json({ success: true, data: toCamelCase(data) });
    }

    const vendors = await readJson(FILE);
    const newVendor = { ...payload, id: randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    vendors.push(newVendor);
    await writeJson(FILE, vendors);
    res.status(201).json({ success: true, data: toCamelCase(newVendor) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateVendor = async (req, res) => {
  try {
    const { storeName, slug, description, logoUrl, bannerUrl, contactEmail, contactPhone, address, commissionRate, status, bankAccount, notes } = req.body;

    const updates = { updated_at: new Date().toISOString() };
    if (storeName    !== undefined) { updates.store_name = storeName; updates.slug = slug || makeSlug(storeName); }
    if (slug         !== undefined) updates.slug          = slug;
    if (description  !== undefined) updates.description   = description;
    if (logoUrl      !== undefined) updates.logo_url      = logoUrl;
    if (bannerUrl    !== undefined) updates.banner_url    = bannerUrl;
    if (contactEmail !== undefined) updates.contact_email = contactEmail;
    if (contactPhone !== undefined) updates.contact_phone = contactPhone;
    if (address      !== undefined) updates.address       = address;
    if (commissionRate !== undefined) updates.commission_rate = commissionRate;
    if (status       !== undefined) updates.status        = status;
    if (bankAccount  !== undefined) updates.bank_account  = bankAccount;
    if (notes        !== undefined) updates.notes         = notes;

    if (await vendorsTableExists()) {
      const { data, error } = await supabase.from('vendors').update(updates).eq('id', req.params.id).select().single();
      if (!error && data) return res.json({ success: true, data: toCamelCase(data) });
    }

    const vendors = await readJson(FILE);
    const idx = vendors.findIndex(v => v.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Vendor not found' });
    vendors[idx] = { ...vendors[idx], ...updates };
    await writeJson(FILE, vendors);
    res.json({ success: true, data: toCamelCase(vendors[idx]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteVendor = async (req, res) => {
  try {
    if (await vendorsTableExists()) {
      const { data, error } = await supabase.from('vendors').delete().eq('id', req.params.id).select('id').maybeSingle();
      if (!error && data) return res.json({ success: true, message: 'Vendor deleted' });
    }
    const vendors = await readJson(FILE);
    const idx = vendors.findIndex(v => v.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Vendor not found' });
    vendors.splice(idx, 1);
    await writeJson(FILE, vendors);
    res.json({ success: true, message: 'Vendor deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── My Vendor Profile (for vendor-role users) ────────────────────────────────

export const getMyVendorProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    if (await vendorsTableExists()) {
      const { data, error } = await supabase.from('vendors').select('*').eq('user_id', userId).single();
      if (!error && data) return res.json({ success: true, data: toCamelCase(data) });
    }

    const vendors = await readJson(FILE);
    const vendor = vendors.find(v => v.user_id === userId);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    res.json({ success: true, data: toCamelCase(vendor) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateMyVendorProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { storeName, description, logoUrl, bannerUrl, contactEmail, contactPhone } = req.body;

    const updates = { updated_at: new Date().toISOString() };
    if (storeName     !== undefined) updates.store_name    = storeName;
    if (description   !== undefined) updates.description   = description;
    if (logoUrl       !== undefined) updates.logo_url      = logoUrl;
    if (bannerUrl     !== undefined) updates.banner_url    = bannerUrl;
    if (contactEmail  !== undefined) updates.contact_email = contactEmail;
    if (contactPhone  !== undefined) updates.contact_phone = contactPhone;

    if (await vendorsTableExists()) {
      const { data, error } = await supabase.from('vendors').update(updates).eq('user_id', userId).select().single();
      if (!error && data) return res.json({ success: true, data: toCamelCase(data) });
    }

    const vendors = await readJson(FILE);
    const idx = vendors.findIndex(v => v.user_id === userId);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    vendors[idx] = { ...vendors[idx], ...updates };
    await writeJson(FILE, vendors);
    res.json({ success: true, data: toCamelCase(vendors[idx]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'active', 'suspended', 'rejected'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });
    }

    const updates = { status, updated_at: new Date().toISOString() };

    if (await vendorsTableExists()) {
      const { data, error } = await supabase.from('vendors').update(updates).eq('id', req.params.id).select().single();
      if (!error && data) return res.json({ success: true, data: toCamelCase(data) });
    }

    const vendors = await readJson(FILE);
    const idx = vendors.findIndex(v => v.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Vendor not found' });
    vendors[idx] = { ...vendors[idx], ...updates };
    await writeJson(FILE, vendors);
    res.json({ success: true, data: toCamelCase(vendors[idx]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Vendor Products ──────────────────────────────────────────────────────────

export const getVendorProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to   = from + Number(limit) - 1;

    let q = supabase.from('products').select('*', { count: 'exact' })
      .eq('vendor_id', req.params.id)
      .order('created_at', { ascending: false });
    if (search) q = q.ilike('name', `%${search}%`);
    if (status) q = q.eq('status', status);
    const { data, error, count } = await q.range(from, to);

    if (error) {
      // vendor_id column might not exist yet
      return res.json({ success: true, data: [], total: 0, page: Number(page), limit: Number(limit), totalPages: 0 });
    }
    const total = count ?? 0;
    res.json({ success: true, data: (data || []).map(toCamelCase), total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) || 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Vendor Payouts ───────────────────────────────────────────────────────────

export const listPayouts = async (req, res) => {
  try {
    const { vendorId, status, page = 1, limit = 20 } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to   = from + Number(limit) - 1;

    if (await payoutsTableExists()) {
      let q = supabase.from('vendor_payouts').select('*, vendors(store_name)', { count: 'exact' })
        .order('created_at', { ascending: false });
      if (vendorId) q = q.eq('vendor_id', vendorId);
      if (status)   q = q.eq('status', status);
      const { data, error, count } = await q.range(from, to);
      if (!error) {
        const total = count ?? 0;
        return res.json({ success: true, data: (data || []).map(toCamelCase), total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) || 0 });
      }
    }

    let payouts = await readJson(PAYOUTS_FILE);
    if (vendorId) payouts = payouts.filter(p => p.vendor_id === vendorId);
    if (status)   payouts = payouts.filter(p => p.status === status);
    const total = payouts.length;
    const paged = payouts.slice(from, from + Number(limit));
    res.json({ success: true, data: paged.map(toCamelCase), total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) || 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createPayout = async (req, res) => {
  try {
    const { vendorId, amount, periodStart, periodEnd, ordersCount, notes } = req.body;
    if (!vendorId || !amount) return res.status(400).json({ success: false, message: 'vendorId and amount are required' });

    const payload = {
      vendor_id: vendorId,
      amount: Number(amount),
      status: 'pending',
      period_start: periodStart ?? null,
      period_end: periodEnd ?? null,
      orders_count: ordersCount ?? 0,
      notes: notes ?? null,
      transaction_id: null,
      paid_at: null,
    };

    if (await payoutsTableExists()) {
      const { data, error } = await supabase.from('vendor_payouts').insert(payload).select().single();
      if (!error) return res.status(201).json({ success: true, data: toCamelCase(data) });
    }

    const payouts = await readJson(PAYOUTS_FILE);
    const newPayout = { ...payload, id: randomUUID(), created_at: new Date().toISOString() };
    payouts.push(newPayout);
    await writeJson(PAYOUTS_FILE, payouts);
    res.status(201).json({ success: true, data: toCamelCase(newPayout) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updatePayoutStatus = async (req, res) => {
  try {
    const { status, transactionId } = req.body;
    const allowed = ['pending', 'processing', 'paid', 'failed'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });
    }

    const updates = { status };
    if (transactionId) updates.transaction_id = transactionId;
    if (status === 'paid') updates.paid_at = new Date().toISOString();

    if (await payoutsTableExists()) {
      const { data, error } = await supabase.from('vendor_payouts').update(updates).eq('id', req.params.id).select().single();
      if (!error && data) return res.json({ success: true, data: toCamelCase(data) });
    }

    const payouts = await readJson(PAYOUTS_FILE);
    const idx = payouts.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Payout not found' });
    payouts[idx] = { ...payouts[idx], ...updates };
    await writeJson(PAYOUTS_FILE, payouts);
    res.json({ success: true, data: toCamelCase(payouts[idx]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};