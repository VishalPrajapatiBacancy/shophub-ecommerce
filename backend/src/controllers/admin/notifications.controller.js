import { supabase } from '../../config/database.js';

export async function listNotifications(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const { data, count, error } = await supabase
      .from('admin_notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error && error.code === '42P01') {
      return res.json({ success: true, data: [], total: 0, page: 1, limit: Number(limit), totalPages: 0 });
    }
    if (error) throw error;

    const formatted = (data || []).map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type || 'general',
      targetType: n.target_type || 'all',
      sentAt: n.sent_at || n.created_at,
      status: n.status || 'sent',
      createdAt: n.created_at,
    }));

    res.json({ success: true, data: formatted, total: count || 0, page: Number(page), limit: Number(limit), totalPages: Math.ceil((count || 0) / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function sendNotification(req, res) {
  try {
    const { title, message, type = 'general', targetType = 'all' } = req.body;
    if (!title || !message) return res.status(400).json({ success: false, message: 'Title and message are required' });

    const record = {
      title,
      message,
      type,
      target_type: targetType,
      status: 'sent',
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('admin_notifications').insert([record]).select().single();
    if (error && error.code === '42P01') {
      return res.json({ success: true, data: { id: crypto.randomUUID(), ...record } });
    }
    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
