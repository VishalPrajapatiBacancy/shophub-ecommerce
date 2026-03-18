import { supabase } from '../../config/database.js';
import { toCamelCase } from '../../lib/response.js';

async function safeQuery(fn) {
  try {
    const res = await fn();
    if (res.error) return { data: [], count: 0 };
    return { data: res.data || [], count: res.count ?? res.data?.length ?? 0 };
  } catch {
    return { data: [], count: 0 };
  }
}

/**
 * GET /api/admin/dashboard
 * Returns stats, chart data, top products, recent orders for admin panel
 */
export const getDashboard = async (req, res) => {
  try {
    const [productCountRes, userCountRes, ordersRes] = await Promise.all([
      safeQuery(() => supabase.from('products').select('id', { count: 'exact', head: true })),
      safeQuery(() => supabase.from('users').select('id', { count: 'exact', head: true })),
      safeQuery(() =>
        supabase
          .from('orders')
          .select('id, total, status, created_at', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(1000)
      ),
    ]);

    const productCount = productCountRes.count ?? 0;
    const customerCount = userCountRes.count ?? 0;
    const ordersData = ordersRes.data || [];
    const orderCount = ordersRes.count ?? ordersData.length;

    let totalRevenue = 0;
    const ordersByStatus = { pending: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0, returned: 0, refunded: 0 };
    ordersData.forEach((o) => {
      totalRevenue += Number(o.total) || 0;
      const s = (o.status || 'pending').toLowerCase();
      if (ordersByStatus[s] !== undefined) ordersByStatus[s]++;
      else ordersByStatus.pending++;
    });

    const stats = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      revenueChange: 0,
      totalOrders: orderCount,
      ordersChange: 0,
      totalCustomers: customerCount,
      customersChange: 0,
      totalProducts: productCount,
      productsChange: 0,
    };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let revenueChartData = [];
    if (ordersData.length > 0) {
      const byMonth = {};
      ordersData.forEach((o) => {
        const d = new Date(o.created_at);
        const label = months[d.getMonth()];
        if (!byMonth[label]) byMonth[label] = { name: label, revenue: 0, orders: 0 };
        byMonth[label].revenue += Number(o.total) || 0;
        byMonth[label].orders += 1;
      });
      revenueChartData = months.map((name) => byMonth[name] || { name, revenue: 0, orders: 0 });
    } else {
      revenueChartData = months.map((name) => ({ name, revenue: 0, orders: 0 }));
    }

    let topProducts = [];
    try {
      const { data: items } = await supabase.from('order_items').select('product_id, quantity, total').limit(5000);
      if (items && items.length > 0) {
        const byProduct = {};
        items.forEach((i) => {
          const id = i.product_id;
          if (!byProduct[id]) byProduct[id] = { productId: id, sales: 0, revenue: 0 };
          byProduct[id].sales += Number(i.quantity) || 0;
          byProduct[id].revenue += Number(i.total) || 0;
        });
        const sorted = Object.entries(byProduct).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);
        const productIds = sorted.map(([id]) => id);
        const { data: prods } = await supabase.from('products').select('id, name, image').in('id', productIds);
        const nameMap = (prods || []).reduce((acc, p) => ({ ...acc, [p.id]: { name: p.name, thumbnail: p.image || '' } }), {});
        topProducts = sorted.map(([id, v]) => ({
          id,
          name: nameMap[id]?.name || 'Product',
          thumbnail: nameMap[id]?.thumbnail || '',
          sales: v.sales,
          revenue: v.revenue,
        }));
      }
    } catch {
      // order_items or products might not exist
    }

    let recentOrders = [];
    try {
      const { data: recentOrdersData } = await supabase
        .from('orders')
        .select('id, order_number, total, status, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentOrdersData && recentOrdersData.length > 0) {
        const userIds = [...new Set(recentOrdersData.map((o) => o.user_id).filter(Boolean))];
        const { data: usersData } = await supabase.from('users').select('id, email').in('id', userIds);
        const { data: profilesData } = await supabase.from('customer_profiles').select('user_id, full_name').in('user_id', userIds);
        const emailMap = (usersData || []).reduce((acc, u) => ({ ...acc, [u.id]: u.email }), {});
        const nameMap = (profilesData || []).reduce((acc, p) => ({ ...acc, [p.user_id]: p.full_name }), {});
        recentOrders = recentOrdersData.map((o) => ({
          id: o.id,
          orderNumber: o.order_number,
          total: o.total,
          status: o.status,
          createdAt: o.created_at,
          customer: o.user_id ? { id: o.user_id, name: nameMap[o.user_id] || emailMap[o.user_id]?.split('@')[0] || '', email: emailMap[o.user_id] || '' } : { id: '', name: '', email: '' },
        }));
      }
    } catch {
      // orders or users might not exist
    }

    res.json({
      success: true,
      data: {
        stats: toCamelCase(stats),
        revenueChartData,
        topProducts,
        recentOrders: toCamelCase(recentOrders),
        ordersByStatus: toCamelCase(ordersByStatus),
      },
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to load dashboard',
    });
  }
};
