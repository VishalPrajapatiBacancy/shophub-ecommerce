import { supabase } from '../../config/database.js';

function formatBanner(b) {
  return {
    id: b.id,
    title: b.title,
    imageUrl: b.image_url,
    linkType: b.link_type,
    linkValue: b.link_value,
    sortOrder: b.sort_order,
    isActive: b.is_active,
    startDate: b.start_date,
    endDate: b.end_date,
    createdAt: b.created_at,
  };
}

export async function listBanners(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const { data, count, error } = await supabase
      .from('banners')
      .select('id, title, image_url, link_type, link_value, sort_order, is_active, start_date, end_date, created_at', { count: 'exact' })
      .order('sort_order', { ascending: true })
      .range(from, to);

    if (error && error.code === '42P01') {
      return res.json({
        success: true,
        data: [],
        total: 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: 0,
      });
    }

    if (error) throw error;

    res.json({
      success: true,
      data: (data || []).map(formatBanner),
      total: count || 0,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil((count || 0) / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getBannerById(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('banners')
      .select('id, title, image_url, link_type, link_value, sort_order, is_active, start_date, end_date, created_at')
      .eq('id', id)
      .single();

    if (error && error.code === '42P01') {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    if (error) throw error;

    res.json({ success: true, data: formatBanner(data) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createBanner(req, res) {
  try {
    const { title, imageUrl, linkType, linkValue, sortOrder, isActive, startDate, endDate } = req.body;

    const { data, error } = await supabase
      .from('banners')
      .insert({
        title,
        image_url: imageUrl,
        link_type: linkType || 'none',
        link_value: linkValue,
        sort_order: sortOrder ?? 0,
        is_active: isActive ?? true,
        start_date: startDate || null,
        end_date: endDate || null,
      })
      .select('id, title, image_url, link_type, link_value, sort_order, is_active, start_date, end_date, created_at')
      .single();

    if (error && error.code === '42P01') {
      return res.status(503).json({ success: false, message: 'Banners table does not exist. Run ADD_BANNERS_TABLE.sql first.' });
    }

    if (error) throw error;

    res.status(201).json({ success: true, data: formatBanner(data) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateBanner(req, res) {
  try {
    const { id } = req.params;
    const { title, imageUrl, linkType, linkValue, sortOrder, isActive, startDate, endDate } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (imageUrl !== undefined) updates.image_url = imageUrl;
    if (linkType !== undefined) updates.link_type = linkType;
    if (linkValue !== undefined) updates.link_value = linkValue;
    if (sortOrder !== undefined) updates.sort_order = sortOrder;
    if (isActive !== undefined) updates.is_active = isActive;
    if (startDate !== undefined) updates.start_date = startDate;
    if (endDate !== undefined) updates.end_date = endDate;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('banners')
      .update(updates)
      .eq('id', id)
      .select('id, title, image_url, link_type, link_value, sort_order, is_active, start_date, end_date, created_at')
      .single();

    if (error && error.code === '42P01') {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    if (error) throw error;

    res.json({ success: true, data: formatBanner(data) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteBanner(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id);

    if (error && error.code === '42P01') {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    if (error) throw error;

    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
