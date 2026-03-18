import { supabase } from '../../config/database.js';

export async function getAnalytics(req, res) {
  try {
    const { period = '30d' } = req.query;

    const now = new Date();
    let startDate = new Date();
    if (period === '7d') startDate.setDate(now.getDate() - 7);
    else if (period === '30d') startDate.setDate(now.getDate() - 30);
    else if (period === '90d') startDate.setDate(now.getDate() - 90);
    else if (period === '12m') startDate.setMonth(now.getMonth() - 12);
    else startDate.setDate(now.getDate() - 30);

    // Orders in period
    const { data: orders } = await supabase
      .from('orders')
      .select('id, total, status, payment_status, created_at, payment_method')
      .gte('created_at', startDate.toISOString());

    // All customers
    const { count: totalCustomers } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    // New customers in period
    const { count: newCustomers } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true });

    const paidOrders = (orders || []).filter(o => o.payment_status === 'paid');
    const totalRevenue = paidOrders.reduce((s, o) => s + (o.total || 0), 0);
    const totalOrders = (orders || []).length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / Math.max(paidOrders.length, 1) : 0;

    // Build daily chart data
    const days = [];
    const dayMap = {};
    const daysCount = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = period === '12m'
        ? d.toLocaleString('default', { month: 'short' })
        : `${d.getMonth() + 1}/${d.getDate()}`;
      dayMap[key] = { name: label, revenue: 0, orders: 0 };
    }

    (orders || []).forEach(o => {
      const key = o.created_at?.split('T')[0];
      if (dayMap[key]) {
        dayMap[key].orders += 1;
        if (o.payment_status === 'paid') dayMap[key].revenue += o.total || 0;
      }
    });

    const chartData = Object.values(dayMap);

    // Order status breakdown
    const statusBreakdown = (orders || []).reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    // Payment method breakdown
    const paymentBreakdown = (orders || []).reduce((acc, o) => {
      const m = o.payment_method || 'other';
      acc[m] = (acc[m] || 0) + (o.total || 0);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        period,
        stats: {
          totalRevenue,
          totalOrders,
          avgOrderValue,
          totalCustomers: totalCustomers || 0,
          newCustomers: newCustomers || 0,
          totalProducts: totalProducts || 0,
        },
        chartData,
        statusBreakdown,
        paymentBreakdown,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
