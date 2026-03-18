import { supabase } from '../config/database.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    
    let query = supabase
      .from('products')
      .select(
        'id, name, description, price, price_mrp, category, stock, image, images, rating, num_reviews, brand, status, created_at, updated_at'
      );

    if (category) {
      // Support both category name and category UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category);
      if (isUuid) {
        query = query.eq('category_id', category);
      } else {
        query = query.eq('category', category);
      }
    }

    if (search) {
      // search in name and description (case-insensitive)
      const term = `%${search}%`;
      query = query.or(
        `name.ilike.${term},description.ilike.${term}`
      );
    }

    if (sort === 'price_asc') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price_desc') {
      query = query.order('price', { ascending: false });
    } else if (sort === 'rating') {
      query = query.order('rating', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: products, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    res.json({
      success: true,
      count: products?.length || 0,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select(
        'id, name, description, price, price_mrp, category, stock, image, images, rating, num_reviews, brand, status, created_at, updated_at'
      )
      .eq('id', req.params.id)
      .single();

    if (error || !product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, image } = req.body;
    
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price,
        category,
        stock,
        image,
        vendor_id: req.user._id || req.user.id,
      })
      .select(
        'id, name, description, price, price_mrp, category, stock, image, images, rating, num_reviews, brand, status, created_at, updated_at'
      )
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      stock: req.body.stock,
      image: req.body.image,
    };

    Object.keys(updates).forEach((key) => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    const { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', req.params.id)
      .select(
        'id, name, description, price, price_mrp, category, stock, image, images, rating, num_reviews, brand, status, created_at, updated_at'
      )
      .single();

    if (error || !product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id)
      .select('id')
      .maybeSingle();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product removed',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
