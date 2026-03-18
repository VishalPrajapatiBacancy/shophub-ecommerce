import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

const supabaseUrl = config.supabaseUrl;
const supabaseKey = config.supabaseServiceRoleKey || config.supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase is not fully configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabase;
