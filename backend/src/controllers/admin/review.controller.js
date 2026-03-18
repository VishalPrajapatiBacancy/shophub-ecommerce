import { supabase } from '../../config/database.js';
import { toCamelCase } from '../../lib/response.js';

const TABLE = 'reviews';

export const listReviews = async (req, res) => {
  try {
    const { status, productId, page = 1, limit = 20 } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    let query = supabase.from(TABLE).select('*', { count: 'exact' }).order('created_at', { ascending: false });

    if (status && status !== 'all') query = query.eq('status', status);
    if (productId) query = query.eq('product_id', productId);

    const { data: reviews, error, count } = await query.range(from, to);

    if (error) {
      if (error.code === '42P01') {
        return res.json({ success: true, data: [], total: 0, page: 1, limit: Number(limit), totalPages: 0 });
      }
      return res.status(500).json({ success: false, message: error.message });
    }

    const list = reviews || [];
    const userIds = [...new Set(list.map((r) => r.user_id).filter(Boolean))];
    const productIds = [...new Set(list.map((r) => r.product_id).filter(Boolean))];
    let userMap = {};
    let productMap = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from('customer_profiles').select('user_id, full_name').in('user_id', userIds);
      userMap = (profiles || []).reduce((acc, p) => ({ ...acc, [p.user_id]: { id: p.user_id, name: p.full_name || '' } }), {});
    }
    if (productIds.length > 0) {
      const { data: prods } = await supabase.from('products').select('id, name').in('id', productIds);
      productMap = (prods || []).reduce((acc, p) => ({ ...acc, [p.id]: p.name }), {});
    }

    const data = list.map((r) => ({
      id: r.id,
      productId: r.product_id,
      productName: productMap[r.product_id] || '',
      customer: userMap[r.user_id] ? { id: userMap[r.user_id].id, name: userMap[r.user_id].name, avatar: null } : { id: r.user_id, name: '', avatar: null },
      rating: r.rating,
      title: r.title || '',
      comment: r.comment || '',
      status: r.status || 'pending',
      createdAt: r.created_at,
    }));

    const total = count ?? data.length;
    res.json({
      success: true,
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)) || 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getReviewById = async (req, res) => {
  try {
    const { data: review, error } = await supabase.from(TABLE).select('*').eq('id', req.params.id).single();
    if (error || !review) return res.status(404).json({ success: false, message: 'Review not found' });

    const [profileRes, productRes] = await Promise.all([
      supabase.from('customer_profiles').select('user_id, full_name').eq('user_id', review.user_id).maybeSingle(),
      supabase.from('products').select('id, name').eq('id', review.product_id).single(),
    ]);

    res.json({
      success: true,
      data: {
        id: review.id,
        productId: review.product_id,
        productName: productRes.data?.name || '',
        customer: profileRes.data ? { id: review.user_id, name: profileRes.data.full_name || '', avatar: null } : { id: review.user_id, name: '', avatar: null },
        rating: review.rating,
        title: review.title || '',
        comment: review.comment || '',
        status: review.status || 'pending',
        createdAt: review.created_at,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'status is required' });

    const { data, error } = await supabase.from(TABLE).update({ status }).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });
    if (!data) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, data: toCamelCase(data) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { data, error } = await supabase.from(TABLE).delete().eq('id', req.params.id).select('id').maybeSingle();
    if (error) return res.status(500).json({ success: false, message: error.message });
    if (!data) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
