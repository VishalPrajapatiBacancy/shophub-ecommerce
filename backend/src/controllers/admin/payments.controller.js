import { supabase } from '../../config/database.js';

export async function listPayments(req, res) {
  try {
    const { page = 1, limit = 20, status, method, search } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    let query = supabase
      .from('orders')
      .select('id, order_number, user_id, customer_name, customer_email, total, grand_total, payment_method, payment_status, created_at', { count: 'exact' });

    if (status) query = query.eq('payment_status', status);
    if (method) query = query.eq('payment_method', method);
    if (search) query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`);

    query = query.order('created_at', { ascending: false }).range(from, to);
    const { data, count, error } = await query;

    if (error) throw error;

    // Stats
    const { data: allOrders } = await supabase
      .from('orders')
      .select('total, grand_total, payment_status, payment_method');

    const getAmount = (o) => o.total ?? o.grand_total ?? 0;

    const totalRevenue = (allOrders || []).filter(o => o.payment_status === 'paid').reduce((s, o) => s + getAmount(o), 0);
    const totalRefunded = (allOrders || []).filter(o => o.payment_status === 'refunded').reduce((s, o) => s + getAmount(o), 0);
    const pending = (allOrders || []).filter(o => o.payment_status === 'pending').length;
    const failed = (allOrders || []).filter(o => o.payment_status === 'failed').length;

    const methodBreakdown = (allOrders || []).reduce((acc, o) => {
      const m = o.payment_method || 'unknown';
      acc[m] = (acc[m] || 0) + 1;
      return acc;
    }, {});

    const formatted = (data || []).map(o => ({
      id: o.id,
      orderNumber: o.order_number || `ORD-${o.id?.slice(0, 8)}`,
      customerId: o.user_id,
      customerName: o.customer_name || 'Customer',
      customerEmail: o.customer_email || '',
      amount: o.total ?? o.grand_total ?? 0,
      method: o.payment_method || 'unknown',
      status: o.payment_status || 'pending',
      createdAt: o.created_at,
    }));

    res.json({
      success: true,
      data: formatted,
      stats: { totalRevenue, totalRefunded, pending, failed, methodBreakdown },
      total: count || 0,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil((count || 0) / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
