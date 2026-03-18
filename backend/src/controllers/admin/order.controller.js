import { supabase } from '../../config/database.js';
import { toCamelCase } from '../../lib/response.js';

export const listOrders = async (req, res) => {
  try {
    const { search, status, paymentStatus, page = 1, limit = 20, sort = 'created_at', order = 'desc' } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    let query = supabase
      .from('orders')
      .select(
        `
        id, order_number, user_id, status, payment_status, payment_method,
        subtotal, tax, shipping, discount, total,
        shipping_address, tracking_number, notes, created_at, updated_at
      `,
        { count: 'exact' }
      )
      .order(sort, { ascending: order === 'asc' });

    if (status && status !== 'all') query = query.eq('status', status);
    if (paymentStatus) query = query.eq('payment_status', paymentStatus);
    if (search) {
      query = query.ilike('order_number', `%${search}%`);
    }

    const { data: ordersData, error, count } = await query.range(from, to);

    if (error) {
      if (error.code === '42P01') {
        return res.json({ success: true, data: [], total: 0, page: 1, limit: Number(limit), totalPages: 0 });
      }
      return res.status(500).json({ success: false, message: error.message });
    }

    const orders = ordersData || [];
    const userIds = [...new Set(orders.map((o) => o.user_id).filter(Boolean))];
    let userMap = {};
    if (userIds.length > 0) {
      const { data: users } = await supabase.from('users').select('id, name, email').in('id', userIds);
      userMap = (users || []).reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
    }

    const list = orders.map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      customer: userMap[o.user_id] ? { id: userMap[o.user_id].id, name: userMap[o.user_id].name, email: userMap[o.user_id].email } : { id: o.user_id, name: '', email: '' },
      items: [], // filled in detail
      subtotal: o.subtotal,
      tax: o.tax,
      shipping: o.shipping,
      discount: o.discount,
      total: o.total,
      status: o.status,
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      shippingAddress: o.shipping_address,
      trackingNumber: o.tracking_number,
      notes: o.notes,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
    }));

    const total = count ?? list.length;
    res.json({
      success: true,
      data: list,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)) || 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { data: order, error: orderError } = await supabase.from('orders').select('*').eq('id', req.params.id).single();
    if (orderError || !order) return res.status(404).json({ success: false, message: 'Order not found' });

    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', req.params.id);
    const { data: user } = await supabase.from('users').select('id, name, email').eq('id', order.user_id).single();

    const payload = {
      id: order.id,
      orderNumber: order.order_number,
      customer: user ? { id: user.id, name: user.name, email: user.email } : { id: order.user_id, name: '', email: '' },
      items: (items || []).map((i) => ({
        id: i.id,
        productId: i.product_id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        total: i.total,
        thumbnail: i.thumbnail,
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      discount: order.discount,
      total: order.total,
      status: order.status,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      shippingAddress: order.shipping_address,
      trackingNumber: order.tracking_number,
      notes: order.notes,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    };

    res.json({ success: true, data: payload });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const VALID_ORDER_STATUSES = [
  'placed', 'confirmed', 'packed', 'processing',
  'shipped', 'out_for_delivery', 'delivered',
  'cancelled', 'returned', 'refunded',
];

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;

    if (!status && !trackingNumber) {
      return res.status(400).json({ success: false, message: 'status or trackingNumber is required' });
    }
    if (status !== undefined && !VALID_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status "${status}". Allowed: ${VALID_ORDER_STATUSES.join(', ')}`,
      });
    }

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (trackingNumber !== undefined) updates.tracking_number = trackingNumber;

    const { data, error } = await supabase.from('orders').update(updates).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });
    if (!data) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: toCamelCase(data) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
