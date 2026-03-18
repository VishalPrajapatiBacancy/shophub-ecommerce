import { supabase } from '../config/database.js';

// Protect routes - validate Supabase Auth JWT
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Validate token with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }

    // Get profile for name + role from public users table
    let profile = null;
    {
      const { data: p1, error: e1 } = await supabase
        .from('users')
        .select('id, name, email, role, is_active')
        .eq('id', user.id)
        .maybeSingle();
      if (!e1) profile = p1;
      else {
        const { data: p2 } = await supabase
          .from('users')
          .select('id, email, role')
          .eq('id', user.id)
          .maybeSingle();
        profile = p2;
      }
    }

    // Auto-create profile if missing (e.g. first login after auth creation)
    if (!profile) {
      const meta = user.user_metadata || {};
      const allowedRoles = ['admin', 'vendor'];
      const role = allowedRoles.includes(meta.role) ? meta.role : 'customer';
      const { data: created } = await supabase.from('users').upsert({
        id: user.id,
        name: meta.name || user.email.split('@')[0],
        email: user.email,
        role,
        is_active: true,
      }).select('id, name, email, role, is_active').maybeSingle();
      if (created) profile = created;
    }

    if (profile?.is_active === false) {
      return res.status(403).json({ success: false, message: 'User account is inactive' });
    }

    req.user = {
      _id: user.id,
      id: user.id,
      name: profile?.name || user.user_metadata?.name || user.email,
      email: user.email,
      role: profile?.role || (user.user_metadata?.role === 'admin' ? 'admin' : 'customer'),
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

// Admin/Vendor role check middleware
export const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'vendor')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Admin role required' });
  }
};
