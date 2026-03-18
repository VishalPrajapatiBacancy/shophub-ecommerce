import { supabase } from '../../config/database.js';

// @desc    Get user's wishlist with product details
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const { data: rows, error } = await supabase
      .from('wishlists')
      .select(`
        id,
        created_at,
        product_id,
        products (
          id, name, price, image, images, rating, num_reviews, stock, status, category
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const data = (rows || []).map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      product: row.products
        ? {
            id: row.products.id,
            name: row.products.name,
            price: row.products.price,
            image: row.products.image || (row.products.images?.[0] ?? ''),
            rating: row.products.rating,
            numReviews: row.products.num_reviews,
            stock: row.products.stock,
            status: row.products.status,
            category: row.products.category,
          }
        : null,
    }));

    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' });
    }

    // Verify product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', productId)
      .maybeSingle();

    if (productError || !product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if already in wishlist
    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ success: false, message: 'Product already in wishlist' });
    }

    const { data: row, error } = await supabase
      .from('wishlists')
      .insert({ user_id: userId, product_id: productId })
      .select('id, product_id, created_at')
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
      data: {
        id: row.id,
        productId: row.product_id,
        createdAt: row.created_at,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const { data, error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)
      .select('id')
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    if (!data) {
      return res.status(404).json({ success: false, message: 'Product not found in wishlist' });
    }

    return res.json({ success: true, message: 'Product removed from wishlist' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Check if a product is in the user's wishlist
// @route   GET /api/wishlist/check?productId=xxx
// @access  Private
export const checkWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.query;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId query param is required' });
    }

    const { data: row } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    return res.json({ success: true, data: { inWishlist: !!row } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
