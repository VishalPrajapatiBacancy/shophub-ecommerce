import { supabase } from '../../config/database.js';

/**
 * Detect which column names the actual DB has.
 */
let _schemaCache = null;
async function detectSchema() {
  if (_schemaCache) return _schemaCache;
  const { error: newErr } = await supabase.from('products').select('name, category, price').limit(0);
  if (!newErr) {
    // Check for images array column
    const { error: imagesErr } = await supabase.from('products').select('images').limit(0);
    _schemaCache = { nameCol: 'name', categoryCol: 'category', newSchema: true, hasImages: !imagesErr };
    return _schemaCache;
  }
  _schemaCache = { nameCol: 'title', categoryCol: 'category_id', newSchema: false, hasImages: false };
  return _schemaCache;
}

const mapProduct = (p, schema) => {
  const name = schema?.newSchema ? (p.name || p.title || '') : (p.title || p.name || '');
  const slug = (n) => (n || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  // Build images array: prefer images[] column, fall back to single image
  let images = [];
  if (Array.isArray(p.images) && p.images.length > 0) {
    images = p.images.filter(Boolean);
  } else if (p.image) {
    images = [p.image];
  }
  const thumbnail = images[0] || '';

  const price = Number(p.price) || 0;
  const priceMrp = Number(p.price_mrp) || price;

  return {
    id: p.id,
    name,
    slug: slug(name),
    description: p.description || '',
    price,
    compareAtPrice: priceMrp > price ? priceMrp : null,
    costPrice: null,
    sku: (p.sku != null ? p.sku : p.id?.slice(0, 8)) || '',
    barcode: null,
    stock: Number(p.stock) ?? 0,
    lowStockThreshold: 10,
    category: p.category || '',
    categoryId: p.category_id || '',
    brand: p.brand || '',
    brandId: '',
    images,
    thumbnail,
    status: p.stock === 0 ? 'out_of_stock' : (p.status || 'active'),
    rating: Number(p.rating) || 0,
    reviewCount: Number(p.num_reviews) || 0,
    tags: [],
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
};

export const listProducts = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 20, sort = 'created_at', order = 'desc' } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const schema = await detectSchema();

    const selectCols = schema.newSchema
      ? `id, name, description, price, price_mrp, category, category_id, stock, image, ${schema.hasImages ? 'images,' : ''} brand, status, rating, num_reviews, created_at, updated_at`
      : 'id, title, stock, status, created_at, updated_at';

    let query = supabase.from('products').select(selectCols, { count: 'exact' }).order(sort, { ascending: order === 'asc' });

    if (schema.newSchema) {
      if (category) query = query.eq('category', category);
      if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    } else {
      if (search) query = query.ilike('title', `%${search}%`);
    }
    if (status === 'out_of_stock') query = query.eq('stock', 0);

    const { data: rows, error, count } = await query.range(from, to);
    if (error) return res.status(500).json({ success: false, message: error.message });

    const data = (rows || []).map((p) => mapProduct(p, schema));
    const total = count ?? data.length;

    res.json({ success: true, data, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) || 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const schema = await detectSchema();
    const { data: p, error } = await supabase.from('products').select('*').eq('id', req.params.id).single();
    if (error || !p) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: mapProduct(p, schema) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, categoryId, imageUrl, images } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Product name is required' });

    const schema = await detectSchema();

    // Build the images array
    const imagesArr = Array.isArray(images) && images.length > 0
      ? images.filter(Boolean)
      : (imageUrl ? [imageUrl] : []);
    const primaryImage = imagesArr[0] || imageUrl || null;

    let payload;
    if (schema.newSchema) {
      payload = {
        name: name.trim(),
        title: name.trim(),
        description: description || null,
        price: Number(price) || 0,
        stock: Number(stock) || 0,
        category: category || 'Uncategorized',
        image: primaryImage,
        vendor_id: null,
        brand: '',
        category_id: categoryId || null,
      };
      // price_mrp fix: if column exists, set it to price
      payload.price_mrp = Number(price) || 0;
      payload.price_sale = Number(price) || 0;
      if (schema.hasImages) {
        payload.images = imagesArr;
      }
    } else {
      payload = {
        title: name.trim(),
        stock: Number(stock) || 0,
      };
    }

    const { data: p, error } = await supabase.from('products').insert(payload).select().single();
    if (error) {
      // Retry without price_mrp/price_sale if those columns don't exist
      if (error.message.includes('price_mrp') || error.message.includes('price_sale')) {
        delete payload.price_mrp;
        delete payload.price_sale;
        const { data: p2, error: err2 } = await supabase.from('products').insert(payload).select().single();
        if (err2) return res.status(400).json({ success: false, message: err2.message + ' — Please run supabase/FIX_PRODUCTS_AND_STORAGE.sql in Supabase Dashboard.' });
        return res.status(201).json({ success: true, data: mapProduct(p2, schema) });
      }
      return res.status(400).json({
        success: false,
        message: error.message + ' — Please run supabase/FIX_PRODUCTS_AND_STORAGE.sql in Supabase Dashboard to add missing columns.',
      });
    }
    res.status(201).json({ success: true, data: mapProduct(p, schema) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, categoryId, imageUrl, images } = req.body;
    const schema = await detectSchema();
    const updates = {};

    if (schema.newSchema) {
      if (name !== undefined) { updates.name = name; updates.title = name; }
      if (description !== undefined) updates.description = description;
      if (price !== undefined) { updates.price = Number(price); updates.price_mrp = Number(price); updates.price_sale = Number(price); }
      if (category !== undefined) updates.category = category;
      if (categoryId !== undefined) updates.category_id = categoryId || null;

      // Handle images
      if (images !== undefined || imageUrl !== undefined) {
        const imagesArr = Array.isArray(images) && images.length > 0
          ? images.filter(Boolean)
          : (imageUrl ? [imageUrl] : []);
        updates.image = imagesArr[0] || null;
        if (schema.hasImages) updates.images = imagesArr;
      }
    } else {
      if (name !== undefined) updates.title = name;
    }
    if (stock !== undefined) updates.stock = Number(stock);

    // Try with price_mrp; if it fails due to unknown column, retry without it
    const { data: p, error } = await supabase.from('products').update(updates).eq('id', req.params.id).select().single();
    if (error) {
      if (error.message.includes('price_mrp') || error.message.includes('price_sale')) {
        delete updates.price_mrp;
        delete updates.price_sale;
        const { data: p2, error: err2 } = await supabase.from('products').update(updates).eq('id', req.params.id).select().single();
        if (err2) return res.status(400).json({ success: false, message: err2.message });
        if (!p2) return res.status(404).json({ success: false, message: 'Product not found' });
        return res.json({ success: true, data: mapProduct(p2, schema) });
      }
      return res.status(400).json({ success: false, message: error.message });
    }
    if (!p) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: mapProduct(p, schema) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').delete().eq('id', req.params.id).select('id').maybeSingle();
    if (error) return res.status(500).json({ success: false, message: error.message });
    if (!data) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
