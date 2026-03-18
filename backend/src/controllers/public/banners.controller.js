import { supabase } from '../../config/database.js';

// @desc    List active banners within current date range (or no date restriction)
// @route   GET /api/banners
// @access  Public
export const listBanners = async (req, res) => {
  try {
    const now = new Date().toISOString();

    const { data: banners, error } = await supabase
      .from('banners')
      .select('id, title, image_url, link_type, link_value, sort_order, is_active, start_date, end_date')
      .eq('is_active', true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('sort_order', { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const data = (banners || []).map((b) => ({
      id: b.id,
      title: b.title,
      imageUrl: b.image_url,
      linkType: b.link_type,
      linkValue: b.link_value,
      sortOrder: b.sort_order,
      isActive: b.is_active,
      startDate: b.start_date,
      endDate: b.end_date,
    }));

    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
