import { supabase } from '../../config/database.js';

// Generate a short unique order number
function generateOrderNumber() {
  return 'ORD-' + Date.now().toString(36).toUpperCase();
}

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items, shippingAddress, paymentMethod, couponCode, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order items are required' });
    }
    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }
    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: 'Payment method is required' });
    }

    // Validate all products and fetch current prices
    const productIds = [...new Set(items.map((i) => i.productId))];
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock, status')
      .in('id', productIds);

    if (productsError) {
      return res.status(500).json({ success: false, message: productsError.message });
    }

    const productMap = {};
    (products || []).forEach((p) => { productMap[p.id] = p; });

    // Validate each item
    const orderItems = [];
    for (const item of items) {
      const product = productMap[item.productId];
      if (!product) {
        return res.status(400).json({ success: false, message: `Product ${item.productId} not found` });
      }
      if (product.status !== 'active') {
        return res.status(400).json({ success: false, message: `Product "${product.name}" is not available` });
      }
      const qty = Math.max(1, parseInt(item.quantity) || 1);
      if (product.stock !== null && qty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}`,
        });
      }
      orderItems.push({
        productId: product.id,
        quantity: qty,
        price: product.price,
        totalPrice: parseFloat((product.price * qty).toFixed(2)),
        variantSku: item.variantSku || null,
        name: product.name,
      });
    }

    // Calculate totals
    const subtotal = parseFloat(
      orderItems.reduce((sum, i) => sum + i.totalPrice, 0).toFixed(2)
    );
    const taxRate = 0.0; // Adjust as needed
    const tax = parseFloat((subtotal * taxRate).toFixed(2));
    const shippingCost = 0.0; // Adjust as needed
    let discount = 0.0;

    // Validate coupon if provided
    if (couponCode) {
      const now = new Date().toISOString();
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('status', 'active')
        .maybeSingle();

      if (coupon) {
        const validStart = !coupon.start_date || coupon.start_date <= now;
        const validEnd = !coupon.end_date || coupon.end_date >= now;
        const withinLimit = !coupon.usage_limit || coupon.used_count < coupon.usage_limit;
        const meetsMinOrder = !coupon.min_order_amount || subtotal >= coupon.min_order_amount;

        if (validStart && validEnd && withinLimit && meetsMinOrder) {
          if (coupon.type === 'percentage') {
            discount = parseFloat(((subtotal * coupon.value) / 100).toFixed(2));
            if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
          } else if (coupon.type === 'fixed') {
            discount = Math.min(coupon.value, subtotal);
          }
        }
      }
    }

    const total = parseFloat((subtotal + tax + shippingCost - discount).toFixed(2));
    const orderNumber = generateOrderNumber();

    // Insert order
    const itemsSnapshot = orderItems.map((i) => ({
      product_id: i.productId,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      total_price: i.totalPrice,
      variant_sku: i.variantSku,
    }));

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: userId,
        vendor_id: null,
        status: 'placed',
        payment_method: paymentMethod,
        payment_status: 'pending',
        total,
        grand_total: total,
        subtotal,
        tax,
        shipping: shippingCost,
        discount,
        notes: notes || null,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        address_snapshot: shippingAddress,
        items: itemsSnapshot,
      })
      .select('id, order_number, status, payment_method, payment_status, total, subtotal, tax, shipping, discount, created_at')
      .single();

    if (orderError) {
      return res.status(500).json({ success: false, message: orderError.message });
    }

    // Insert order items
    const itemsToInsert = orderItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
      total_price: item.totalPrice,
      variant_sku: item.variantSku,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsError) {
      // Attempt cleanup on failure
      await supabase.from('orders').delete().eq('id', order.id);
      return res.status(500).json({ success: false, message: itemsError.message });
    }

    // Deduct stock for each product
    for (const item of orderItems) {
      const product = productMap[item.productId];
      if (product.stock !== null) {
        await supabase
          .from('products')
          .update({ stock: product.stock - item.quantity })
          .eq('id', item.productId);
      }
    }

    // Increment coupon used_count if applicable
    if (couponCode && discount > 0) {
      await supabase.rpc('increment_coupon_used_count', { coupon_code: couponCode.toUpperCase() })
        .catch(() => {}); // Non-critical
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        total: order.total,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        discount: order.discount,
        createdAt: order.created_at,
        items: orderItems.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          totalPrice: i.totalPrice,
          variantSku: i.variantSku,
        })),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get user's orders (paginated)
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const { data: orders, error, count } = await supabase
      .from('orders')
      .select(
        'id, order_number, status, payment_method, payment_status, total, subtotal, discount, shipping, tax, created_at, updated_at, tracking_number, order_items ( id, product_id, quantity, price, total_price )',
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const data = (orders || []).map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      status: o.status,
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      total: o.total,
      subtotal: o.subtotal,
      discount: o.discount,
      shipping: o.shipping,
      tax: o.tax,
      trackingNumber: o.tracking_number,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      items: (o.order_items || []).map((item) => ({
        id: item.id,
        productId: item.product_id,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.total_price,
      })),
    }));

    return res.json({
      success: true,
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      data,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get a single order with items
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id, order_number, status, payment_method, payment_status,
        total, subtotal, tax, shipping, discount, notes,
        shipping_address, billing_address, tracking_number,
        created_at, updated_at,
        order_items (
          id, product_id, quantity, price, total_price, variant_sku,
          products ( id, name, image, images )
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const items = (order.order_items || []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      name: item.products?.name || '',
      image: item.products?.image || (item.products?.images?.[0] ?? ''),
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.total_price,
      variantSku: item.variant_sku,
    }));

    return res.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        total: order.total,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        discount: order.discount,
        notes: order.notes,
        shippingAddress: order.shipping_address,
        billingAddress: order.billing_address,
        trackingNumber: order.tracking_number,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        items,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Cancel an order
// @route   PATCH /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, order_items ( product_id, quantity )')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      return res.status(500).json({ success: false, message: fetchError.message });
    }
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!['placed', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order with status "${order.status}"`,
      });
    }

    const { data: updated, error: updateError } = await supabase
      .from('orders')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, order_number, status, updated_at')
      .single();

    if (updateError) {
      return res.status(500).json({ success: false, message: updateError.message });
    }

    // Restore stock for each item
    for (const item of order.order_items || []) {
      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .maybeSingle();

      if (product && product.stock !== null) {
        await supabase
          .from('products')
          .update({ stock: product.stock + item.quantity })
          .eq('id', item.product_id);
      }
    }

    return res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: {
        id: updated.id,
        orderNumber: updated.order_number,
        status: updated.status,
        updatedAt: updated.updated_at,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
