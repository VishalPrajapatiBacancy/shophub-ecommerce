import { supabase } from '../config/database.js';

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: 'user' },
    });

    if (authError) {
      return res.status(400).json({ success: false, message: authError.message });
    }

    // Upsert profile (trigger may have already inserted it)
    await supabase
      .from('users')
      .upsert({ id: authData.user.id, name, email, role: 'customer', is_active: true })
      .eq('id', authData.user.id);

    // Sign in to get a session token
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({ email, password });
    if (sessionError) {
      return res.status(400).json({ success: false, message: sessionError.message });
    }

    res.status(201).json({
      success: true,
      data: {
        _id: authData.user.id,
        name,
        email,
        role: 'user',
        token: sessionData.session.access_token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Sign in via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const userId = data.user.id;

    // Get profile (name + role) — handle missing columns gracefully
    let profile = null;
    {
      const { data: p1, error: e1 } = await supabase
        .from('users')
        .select('id, name, email, role, is_active')
        .eq('id', userId)
        .maybeSingle();
      if (!e1) profile = p1;
      else {
        // Fallback: try minimal columns
        const { data: p2 } = await supabase
          .from('users')
          .select('id, email, role')
          .eq('id', userId)
          .maybeSingle();
        profile = p2;
      }
    }

    // If profile missing, create it from auth metadata
    if (!profile) {
      const meta = data.user.user_metadata || {};
      // Try full upsert, fall back to minimal if columns missing
      const role = (meta.role === 'admin') ? 'admin' : 'customer';
      const { error: upErr } = await supabase.from('users').upsert({
        id: userId,
        name: meta.name || email.split('@')[0],
        email,
        role,
        is_active: true,
      });
      if (upErr && (upErr.code === '42703' || upErr.message.includes('column'))) {
        await supabase.from('users').upsert({ id: userId, email, role });
      }
    }

    const name = profile?.name || data.user.user_metadata?.name || email.split('@')[0];
    const role = profile?.role || data.user.user_metadata?.role || 'user';
    const isActive = profile?.is_active ?? true;

    if (isActive === false) {
      return res.status(403).json({ success: false, message: 'User account is inactive' });
    }

    res.json({
      success: true,
      data: {
        _id: userId,
        name,
        email,
        role,
        token: data.session.access_token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, is_active')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.is_active,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const updates = {};

    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) updates.email = req.body.email;

    if (req.body.password) {
      const { error: pwError } = await supabase.auth.admin.updateUserById(userId, {
        password: req.body.password,
      });
      if (pwError) {
        return res.status(400).json({ success: false, message: pwError.message });
      }
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from('users').update(updates).eq('id', userId);
      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
    }

    const { data: updatedUser } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', userId)
      .single();

    // Re-sign in to refresh token if email changed
    const { data: sessionData } = await supabase.auth.getSession();

    res.json({
      success: true,
      data: {
        _id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        token: sessionData?.session?.access_token || req.headers.authorization?.split(' ')[1],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, is_active, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({ success: true, count: users?.length || 0, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
