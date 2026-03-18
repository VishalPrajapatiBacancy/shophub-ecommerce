import { supabase } from '../../config/database.js';
import { toCamelCase } from '../../lib/response.js';

// @desc    List all active categories sorted by sort_order
// @route   GET /api/categories
// @access  Public
export const listCategories = async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, slug, parent_id, image_url, description, is_active, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    // Fetch product counts per category
    const { data: countRows, error: countError } = await supabase
      .from('products')
      .select('category_id')
      .eq('status', 'active');

    const countMap = {};
    if (!countError && countRows) {
      for (const row of countRows) {
        if (row.category_id) {
          countMap[row.category_id] = (countMap[row.category_id] || 0) + 1;
        }
      }
    }

    const data = (categories || []).map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parent_id,
      imageUrl: cat.image_url,
      description: cat.description,
      isActive: cat.is_active,
      sortOrder: cat.sort_order,
      productCount: countMap[cat.id] || 0,
    }));

    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get a single category by ID or slug
// @route   GET /api/categories/:idOrSlug
// @access  Public
export const getCategoryById = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    // Try matching by UUID pattern first, then by slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    let query = supabase
      .from('categories')
      .select('id, name, slug, parent_id, image_url, description, is_active, sort_order');

    query = isUuid ? query.eq('id', idOrSlug) : query.eq('slug', idOrSlug);

    const { data: cat, error } = await query.maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Fetch product count for this category
    const { count: productCount } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', cat.id)
      .eq('status', 'active');

    const data = {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parent_id,
      imageUrl: cat.image_url,
      description: cat.description,
      isActive: cat.is_active,
      sortOrder: cat.sort_order,
      productCount: productCount || 0,
    };

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
