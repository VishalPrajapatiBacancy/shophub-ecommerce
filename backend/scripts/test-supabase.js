/**
 * Test Supabase connection using env from backend/.env
 * Run from backend: node scripts/test-supabase.js
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

async function testSupabase() {
  console.log('Testing Supabase connection...\n');
  console.log('SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.slice(0, 40)}...` : '(missing)');
  console.log('Key set:', !!supabaseKey ? 'yes' : 'no');

  if (!supabaseUrl || !supabaseKey) {
    console.error('\n❌ FAIL: SUPABASE_URL and SUPABASE_ANON_KEY (or SERVICE_ROLE_KEY) must be set in .env');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    console.log('\n✅ Supabase connection OK (Auth API reached)');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Supabase connection failed:', err.message);
    process.exit(1);
  }
}

testSupabase();
