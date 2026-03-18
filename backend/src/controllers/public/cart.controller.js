import { supabase } from '../../config/database.js';

// Helper: enrich cart items with live product details
async function enrichItems(rawItems) {
  if (!rawItems || rawItems.length === 0) return [];

  const productIds = [...new Set(rawItems.map((i) => i.productId).filter(Boolean))];

  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, stock, image, images, status')
    .in('id', productIds);

  const productMap = {};
  (products || []).forEach((p) => { productMap[p.id] = p; });

  return rawItems.map((item) => {
    const product = productMap[item.productId] || null;
    return {
      productId: item.productId,
      quantity: item.quantity,
      variantSku: item.variantSku || null,
      price: item.price ?? product?.price ?? 0,
      name: item.name || product?.name || '',
      image: item.image || product?.image || (product?.images?.[0] ?? ''),
      stock: product?.stock ?? null,
      status: product?.status ?? null,
      subtotal: (item.price ?? product?.price ?? 0) * item.quantity,
    };
  });
}

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const { data: cart, error } = await supabase
      .from('carts')
      .select('id, user_id, items, currency, updated_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    if (!cart) {
      return res.json({ success: true, data: { items: [], total: 0, currency: 'USD' } });
    }

    let rawItems = cart.items;
    if (typeof rawItems === 'string') {
      try { rawItems = JSON.parse(rawItems); } catch { rawItems = []; }
    }
    rawItems = Array.isArray(rawItems) ? rawItems : [];

    const items = await enrichItems(rawItems);
    const total = items.reduce((sum, i) => sum + i.subtotal, 0);

    return res.json({
      success: true,
      data: {
        id: cart.id,
        currency: cart.currency || 'USD',
        updatedAt: cart.updated_at,
        items,
        total: parseFloat(total.toFixed(2)),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Replace entire cart items
// @route   PUT /api/cart
// @access  Private
export const updateCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items, currency } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'items must be an array' });
    }

    const normalizedItems = items.map((item) => ({
      productId: item.productId,
      quantity: Math.max(1, parseInt(item.quantity) || 1),
      variantSku: item.variantSku || null,
      price: item.price ?? null,
      name: item.name || '',
      image: item.image || '',
    }));

    const { data: cart, error } = await supabase
      .from('carts')
      .upsert(
        {
          user_id: userId,
          items: JSON.stringify(normalizedItems),
          currency: currency || 'USD',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select('id, user_id, items, currency, updated_at')
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    let rawItems = cart.items;
    if (typeof rawItems === 'string') {
      try { rawItems = JSON.parse(rawItems); } catch { rawItems = []; }
    }

    const enriched = await enrichItems(Array.isArray(rawItems) ? rawItems : []);
    const total = enriched.reduce((sum, i) => sum + i.subtotal, 0);

    return res.json({
      success: true,
      message: 'Cart updated',
      data: {
        id: cart.id,
        currency: cart.currency || 'USD',
        updatedAt: cart.updated_at,
        items: enriched,
        total: parseFloat(total.toFixed(2)),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add a single item to cart (merge if exists)
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1, variantSku } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' });
    }

    // Fetch product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, price, stock, image, images, status')
      .eq('id', productId)
      .maybeSingle();

    if (productError || !product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Product is not available' });
    }

    const qty = Math.max(1, parseInt(quantity) || 1);

    if (product.stock !== null && qty > product.stock) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} units in stock` });
    }

    // Fetch existing cart
    const { data: existingCart } = await supabase
      .from('carts')
      .select('items, currency')
      .eq('user_id', userId)
      .maybeSingle();

    let currentItems = [];
    if (existingCart?.items) {
      try {
        currentItems = typeof existingCart.items === 'string'
          ? JSON.parse(existingCart.items)
          : existingCart.items;
        if (!Array.isArray(currentItems)) currentItems = [];
      } catch {
        currentItems = [];
      }
    }

    // Merge: if item already in cart with same productId + variantSku, update qty
    const matchIndex = currentItems.findIndex(
      (i) => i.productId === productId && (i.variantSku || null) === (variantSku || null)
    );

    if (matchIndex >= 0) {
      const newQty = currentItems[matchIndex].quantity + qty;
      if (product.stock !== null && newQty > product.stock) {
        return res.status(400).json({ success: false, message: `Only ${product.stock} units in stock` });
      }
      currentItems[matchIndex].quantity = newQty;
    } else {
      currentItems.push({
        productId: product.id,
        quantity: qty,
        variantSku: variantSku || null,
        price: product.price,
        name: product.name,
        image: product.image || (product.images?.[0] ?? ''),
      });
    }

    const { data: cart, error } = await supabase
      .from('carts')
      .upsert(
        {
          user_id: userId,
          items: JSON.stringify(currentItems),
          currency: existingCart?.currency || 'USD',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select('id, user_id, items, currency, updated_at')
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    let rawItems = cart.items;
    if (typeof rawItems === 'string') {
      try { rawItems = JSON.parse(rawItems); } catch { rawItems = []; }
    }

    const enriched = await enrichItems(Array.isArray(rawItems) ? rawItems : []);
    const total = enriched.reduce((sum, i) => sum + i.subtotal, 0);

    return res.json({
      success: true,
      message: 'Item added to cart',
      data: {
        id: cart.id,
        currency: cart.currency || 'USD',
        updatedAt: cart.updated_at,
        items: enriched,
        total: parseFloat(total.toFixed(2)),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Remove a single item from cart by productId
// @route   DELETE /api/cart/item/:productId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { variantSku } = req.query;

    const { data: existingCart, error: fetchError } = await supabase
      .from('carts')
      .select('items, currency')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      return res.status(500).json({ success: false, message: fetchError.message });
    }
    if (!existingCart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    let currentItems = [];
    try {
      currentItems = typeof existingCart.items === 'string'
        ? JSON.parse(existingCart.items)
        : existingCart.items;
      if (!Array.isArray(currentItems)) currentItems = [];
    } catch {
      currentItems = [];
    }

    const updatedItems = currentItems.filter((i) => {
      if (i.productId !== productId) return true;
      if (variantSku) return (i.variantSku || null) !== (variantSku || null);
      return false;
    });

    const { data: cart, error } = await supabase
      .from('carts')
      .upsert(
        {
          user_id: userId,
          items: JSON.stringify(updatedItems),
          currency: existingCart.currency || 'USD',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select('id, user_id, items, currency, updated_at')
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    let rawItems = cart.items;
    if (typeof rawItems === 'string') {
      try { rawItems = JSON.parse(rawItems); } catch { rawItems = []; }
    }

    const enriched = await enrichItems(Array.isArray(rawItems) ? rawItems : []);
    const total = enriched.reduce((sum, i) => sum + i.subtotal, 0);

    return res.json({
      success: true,
      message: 'Item removed from cart',
      data: {
        id: cart.id,
        currency: cart.currency || 'USD',
        updatedAt: cart.updated_at,
        items: enriched,
        total: parseFloat(total.toFixed(2)),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Clear all items from cart
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const { error } = await supabase
      .from('carts')
      .upsert(
        {
          user_id: userId,
          items: JSON.stringify([]),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.json({ success: true, message: 'Cart cleared', data: { items: [], total: 0 } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
