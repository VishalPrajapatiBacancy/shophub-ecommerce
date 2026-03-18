import { supabase } from '../../config/database.js';

// Actual users table columns: id, email, role, phone, created_at, updated_at
// Name is stored in Supabase Auth user_metadata.name

export const listCustomers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const pageNum  = Number(page);
    const limitNum = Number(limit);

    // Fetch all auth users (includes user_metadata.name)
    const { data: authData, error: authErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (authErr) return res.status(500).json({ success: false, message: authErr.message });

    // Fetch public users table for role/phone
    const { data: dbUsers } = await supabase.from('users').select('id, email, role, phone, created_at');
    const dbMap = {};
    (dbUsers || []).forEach(u => { dbMap[u.id] = u; });

    // Merge
    let users = (authData?.users || []).map(au => {
      const db = dbMap[au.id] || {};
      return {
        id: au.id,
        name: au.user_metadata?.name || au.email?.split('@')[0] || 'Unknown',
        email: au.email,
        role: db.role || au.user_metadata?.role || 'customer',
        phone: db.phone || null,
        createdAt: au.created_at,
      };
    });

    // Filter out admin users from customer list
    users = users.filter(u => u.role !== 'admin');

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }

    const total = users.length;

    // Paginate
    const paged = users.slice((pageNum - 1) * limitNum, (pageNum - 1) * limitNum + limitNum);

    // Fetch order stats
    let orderStats = {};
    try {
      const { data: orders } = await supabase.from('orders').select('user_id, total, created_at');
      (orders || []).forEach(o => {
        if (!orderStats[o.user_id]) orderStats[o.user_id] = { totalOrders: 0, totalSpent: 0, lastOrderDate: null };
        orderStats[o.user_id].totalOrders += 1;
        orderStats[o.user_id].totalSpent  += Number(o.total) || 0;
        if (!orderStats[o.user_id].lastOrderDate || o.created_at > orderStats[o.user_id].lastOrderDate) {
          orderStats[o.user_id].lastOrderDate = o.created_at;
        }
      });
    } catch { /* orders table may not exist */ }

    const data = paged.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      totalOrders: orderStats[u.id]?.totalOrders ?? 0,
      totalSpent:  orderStats[u.id]?.totalSpent  ?? 0,
      lastOrderDate: orderStats[u.id]?.lastOrderDate ?? null,
      status: 'active',
      addresses: [],
      createdAt: u.createdAt,
    }));

    res.json({
      success: true,
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const { data: authUser, error: authErr } = await supabase.auth.admin.getUserById(req.params.id);
    if (authErr || !authUser?.user) return res.status(404).json({ success: false, message: 'Customer not found' });

    const au = authUser.user;
    const { data: db } = await supabase.from('users').select('role, phone').eq('id', au.id).maybeSingle();

    let totalOrders = 0, totalSpent = 0, lastOrderDate = null;
    try {
      const { data: orders } = await supabase.from('orders').select('id, total, created_at').eq('user_id', au.id).order('created_at', { ascending: false });
      if (orders?.length) {
        totalOrders = orders.length;
        totalSpent  = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
        lastOrderDate = orders[0].created_at;
      }
    } catch {}

    res.json({
      success: true,
      data: {
        id: au.id,
        name: au.user_metadata?.name || au.email?.split('@')[0] || 'Unknown',
        email: au.email,
        phone: db?.phone || null,
        totalOrders,
        totalSpent,
        lastOrderDate,
        status: 'active',
        addresses: [],
        createdAt: au.created_at,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!email)    return res.status(400).json({ success: false, message: 'Email is required' });
    if (!password || password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || email.split('@')[0], role: 'customer' },
      email_confirm: true,
    });
    if (authError) return res.status(400).json({ success: false, message: authError.message });

    const userId   = authData.user.id;
    const userName = name || email.split('@')[0];

    // Upsert into users table — only columns that exist
    try {
      await supabase.from('users').upsert({ id: userId, email, role: 'customer', phone: phone || null });
    } catch { /* schema mismatch — ignore */ }

    res.status(201).json({
      success: true,
      data: {
        id: userId,
        name: userName,
        email,
        phone: phone || null,
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: null,
        status: 'active',
        addresses: [],
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
