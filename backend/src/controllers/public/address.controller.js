import { supabase } from '../../config/database.js';

// @desc    List all addresses for the user
// @route   GET /api/addresses
// @access  Private
export const listAddresses = async (req, res) => {
  try {
    const userId = req.user._id;

    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('id, full_name, phone, line1, line2, city, state, postal_code, country, is_default, created_at')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const data = (addresses || []).map((a) => ({
      id: a.id,
      fullName: a.full_name,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      state: a.state,
      postalCode: a.postal_code,
      country: a.country,
      isDefault: a.is_default,
      createdAt: a.created_at,
    }));

    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create a new address
// @route   POST /api/addresses
// @access  Private
export const createAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, phone, line1, line2, city, state, postalCode, country, isDefault } = req.body;

    if (!fullName || !line1 || !city || !postalCode || !country) {
      return res.status(400).json({
        success: false,
        message: 'fullName, line1, city, postalCode, and country are required',
      });
    }

    // If setting as default, unset all existing defaults first
    if (isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data: address, error } = await supabase
      .from('addresses')
      .insert({
        user_id: userId,
        full_name: fullName,
        phone: phone || null,
        line1,
        line2: line2 || null,
        city,
        state: state || null,
        postal_code: postalCode,
        country,
        is_default: isDefault || false,
      })
      .select('id, full_name, phone, line1, line2, city, state, postal_code, country, is_default, created_at')
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Address created',
      data: {
        id: address.id,
        fullName: address.full_name,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.postal_code,
        country: address.country,
        isDefault: address.is_default,
        createdAt: address.created_at,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update an address
// @route   PUT /api/addresses/:id
// @access  Private
export const updateAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { fullName, phone, line1, line2, city, state, postalCode, country, isDefault } = req.body;

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('addresses')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      return res.status(500).json({ success: false, message: fetchError.message });
    }
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // If setting as default, unset others first
    if (isDefault === true) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
        .neq('id', id);
    }

    const updates = {};
    if (fullName !== undefined) updates.full_name = fullName;
    if (phone !== undefined) updates.phone = phone;
    if (line1 !== undefined) updates.line1 = line1;
    if (line2 !== undefined) updates.line2 = line2;
    if (city !== undefined) updates.city = city;
    if (state !== undefined) updates.state = state;
    if (postalCode !== undefined) updates.postal_code = postalCode;
    if (country !== undefined) updates.country = country;
    if (isDefault !== undefined) updates.is_default = isDefault;

    const { data: address, error } = await supabase
      .from('addresses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select('id, full_name, phone, line1, line2, city, state, postal_code, country, is_default, created_at')
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.json({
      success: true,
      message: 'Address updated',
      data: {
        id: address.id,
        fullName: address.full_name,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.postal_code,
        country: address.country,
        isDefault: address.is_default,
        createdAt: address.created_at,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete an address
// @route   DELETE /api/addresses/:id
// @access  Private
export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select('id')
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    if (!data) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    return res.json({ success: true, message: 'Address deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Set an address as the default
// @route   PATCH /api/addresses/:id/default
// @access  Private
export const setDefault = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('addresses')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      return res.status(500).json({ success: false, message: fetchError.message });
    }
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Unset all defaults for this user
    const { error: unsetError } = await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);

    if (unsetError) {
      return res.status(500).json({ success: false, message: unsetError.message });
    }

    // Set the chosen address as default
    const { data: address, error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id)
      .select('id, full_name, phone, line1, line2, city, state, postal_code, country, is_default, created_at')
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.json({
      success: true,
      message: 'Default address updated',
      data: {
        id: address.id,
        fullName: address.full_name,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.postal_code,
        country: address.country,
        isDefault: address.is_default,
        createdAt: address.created_at,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
