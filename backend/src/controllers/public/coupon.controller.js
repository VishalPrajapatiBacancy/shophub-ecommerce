import { supabase } from '../../config/database.js';

// @desc    Validate a coupon code against an order amount
// @route   POST /api/coupons/validate
// @access  Public
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }
    if (orderAmount === undefined || orderAmount === null) {
      return res.status(400).json({ success: false, message: 'orderAmount is required' });
    }

    const amount = parseFloat(orderAmount);
    if (isNaN(amount) || amount < 0) {
      return res.status(400).json({ success: false, message: 'orderAmount must be a valid number' });
    }

    const now = new Date().toISOString();

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('id, code, type, value, min_order_amount, max_discount, usage_limit, used_count, start_date, end_date, status')
      .eq('code', code.toUpperCase())
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    // Check status
    if (coupon.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Coupon is not active' });
    }

    // Check start date
    if (coupon.start_date && coupon.start_date > now) {
      return res.status(400).json({ success: false, message: 'Coupon is not yet valid' });
    }

    // Check end date
    if (coupon.end_date && coupon.end_date < now) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit has been reached' });
    }

    // Check minimum order amount
    if (coupon.min_order_amount && amount < coupon.min_order_amount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ${coupon.min_order_amount} is required for this coupon`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = parseFloat(((amount * coupon.value) / 100).toFixed(2));
      if (coupon.max_discount) {
        discountAmount = Math.min(discountAmount, coupon.max_discount);
      }
    } else if (coupon.type === 'fixed') {
      discountAmount = Math.min(coupon.value, amount);
    }

    const finalAmount = parseFloat((amount - discountAmount).toFixed(2));

    return res.json({
      success: true,
      message: 'Coupon is valid',
      data: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount,
        finalAmount,
        minOrderAmount: coupon.min_order_amount,
        maxDiscount: coupon.max_discount,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
