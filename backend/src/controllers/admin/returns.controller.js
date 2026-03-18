import { supabase } from '../../config/database.js';

// Try to use a returns table; fall back to mock/derived data from orders
export async function listReturns(req, res) {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    // Try returns table first
    let query = supabase.from('returns').select('*', { count: 'exact' });
    if (status) query = query.eq('status', status);
    if (search) query = query.ilike('order_number', `%${search}%`);
    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error && error.code === '42P01') {
      // Table doesn't exist – derive from orders with status=returned
      const { data: orders, count: ordersCount, error: ordErr } = await supabase
        .from('orders')
        .select('*, order_items(*)', { count: 'exact' })
        .eq('status', 'returned')
        .order('updated_at', { ascending: false })
        .range(from, to);

      if (ordErr) throw ordErr;

      const returns = (orders || []).map(o => ({
        id: o.id,
        orderId: o.id,
        orderNumber: o.order_number || `ORD-${o.id?.slice(0, 8)}`,
        customerId: o.user_id,
        customerName: o.customer_name || 'Customer',
        customerEmail: o.customer_email || '',
        status: 'approved',
        reason: 'Customer request',
        refundAmount: o.total ?? o.grand_total ?? 0,
        refundStatus: 'pending',
        createdAt: o.created_at,
        updatedAt: o.updated_at,
      }));

      return res.json({
        success: true,
        data: returns,
        total: ordersCount || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((ordersCount || 0) / Number(limit)),
      });
    }

    if (error) throw error;

    const formatted = (data || []).map(r => ({
      id: r.id,
      orderId: r.order_id,
      orderNumber: r.order_number || `ORD-${r.order_id?.slice(0, 8)}`,
      customerId: r.user_id,
      customerName: r.customer_name || 'Customer',
      customerEmail: r.customer_email || '',
      status: r.status || 'pending',
      reason: r.reason || '',
      refundAmount: r.refund_amount || 0,
      refundStatus: r.refund_status || 'pending',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    res.json({
      success: true,
      data: formatted,
      total: count || 0,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil((count || 0) / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateReturnStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, refundStatus } = req.body;

    // Try returns table
    const { data, error } = await supabase
      .from('returns')
      .update({ status, refund_status: refundStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error && error.code === '42P01') {
      // Fall back to updating order status
      await supabase.from('orders').update({ status: 'returned' }).eq('id', id);
      return res.json({ success: true, data: { id, status, refundStatus } });
    }

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
