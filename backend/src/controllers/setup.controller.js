import { supabase } from '../config/database.js';

const ADMIN_EMAIL = 'admin@shophub.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Admin User';

/**
 * POST /api/setup/create-admin
 * One-time: create admin user if not exists.
 */
export const createAdmin = async (req, res) => {
  try {
    // Check if admin profile already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', ADMIN_EMAIL)
      .maybeSingle();

    if (existing) {
      return res.json({
        success: true,
        message: `Admin already exists. Login with: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`,
      });
    }

    // Try to create the auth user via admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { name: ADMIN_NAME, role: 'admin' },
    });

    if (authError) {
      // If user already exists in auth but not in profiles table
      if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
        // List users and find by email
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existingAuthUser = listData?.users?.find((u) => u.email === ADMIN_EMAIL);
        if (existingAuthUser) {
          // Upsert profile — try with all columns, fall back if schema differs
          const { error: syncErr } = await supabase.from('users').upsert({
            id: existingAuthUser.id,
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            role: 'admin',
            is_active: true,
          });
          if (syncErr && (syncErr.code === '42703' || syncErr.message.includes('column'))) {
            await supabase.from('users').upsert({ id: existingAuthUser.id, email: ADMIN_EMAIL, role: 'admin' });
          }
          return res.json({
            success: true,
            message: `Admin synced. Login with: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`,
          });
        }
      }
      return res.status(400).json({ success: false, message: authError.message });
    }

    // Upsert profile (trigger may have already done this)
    const { error: upErr } = await supabase.from('users').upsert({
      id: authData.user.id,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      role: 'admin',
      is_active: true,
    });
    if (upErr && (upErr.code === '42703' || upErr.message.includes('column'))) {
      // Fallback: minimal columns only
      await supabase.from('users').upsert({ id: authData.user.id, email: ADMIN_EMAIL, role: 'admin' });
    }

    res.status(201).json({
      success: true,
      message: 'Admin created successfully.',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
