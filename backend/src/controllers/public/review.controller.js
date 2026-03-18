import { supabase } from '../../config/database.js';

// @desc    Get approved reviews for a product (paginated)
// @route   GET /api/products/:productId/reviews
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    // Verify product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, rating, num_reviews')
      .eq('id', productId)
      .maybeSingle();

    if (productError) {
      return res.status(500).json({ success: false, message: productError.message });
    }
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { data: reviews, error, count } = await supabase
      .from('reviews')
      .select(
        `
        id, rating, title, comment, created_at,
        users ( id, name )
        `,
        { count: 'exact' }
      )
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const data = (reviews || []).map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      createdAt: r.created_at,
      user: r.users
        ? { id: r.users.id, name: r.users.name }
        : null,
    }));

    // Compute rating summary
    const { data: allRatings } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('status', 'approved');

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;
    (allRatings || []).forEach((r) => {
      ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
      ratingSum += r.rating;
    });
    const totalReviews = (allRatings || []).length;
    const averageRating = totalReviews > 0 ? parseFloat((ratingSum / totalReviews).toFixed(1)) : 0;

    return res.json({
      success: true,
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      summary: {
        averageRating,
        totalReviews,
        ratingCounts,
      },
      data,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Submit a review for a product
// @route   POST /api/products/:productId/reviews
// @access  Private
export const submitReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Verify product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', productId)
      .maybeSingle();

    if (productError) {
      return res.status(500).json({ success: false, message: productError.message });
    }
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this product' });
    }

    // Insert review (pending approval)
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: userId,
        rating: parseInt(rating),
        title: title || null,
        comment: comment || null,
        status: 'pending',
      })
      .select('id, rating, title, comment, status, created_at')
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Review submitted and pending approval',
      data: {
        id: review.id,
        productId,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        status: review.status,
        createdAt: review.created_at,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
