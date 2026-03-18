/**
 * Creates the banners table in Supabase.
 *
 * Option A (automatic): Set SUPABASE_ACCESS_TOKEN in .env
 *   Get token from: https://supabase.com/dashboard/account/tokens
 *   Then run: node scripts/create-banners-table.js
 *
 * Option B (manual): Run the SQL in the Supabase SQL Editor:
 *   https://supabase.com/dashboard/project/qljzsiwixcuegmnrkdds/sql/new
 *   Paste contents of: supabase/ADD_BANNERS_TABLE.sql
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const PROJECT_REF = 'qljzsiwixcuegmnrkdds';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const sqlPath = join(__dirname, '..', 'supabase', 'ADD_BANNERS_TABLE.sql');
const sql = readFileSync(sqlPath, 'utf8');

async function createBannersTable() {
  if (!ACCESS_TOKEN) {
    console.log('ℹ️  SUPABASE_ACCESS_TOKEN not set — showing manual steps.\n');
    console.log('▶ Option A: Add your Supabase personal access token to .env:');
    console.log('  SUPABASE_ACCESS_TOKEN=your_token_here');
    console.log('  Get one at: https://supabase.com/dashboard/account/tokens\n');
    console.log('▶ Option B: Run this SQL in the Supabase SQL Editor:');
    console.log('  https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new\n');
    console.log('─'.repeat(60));
    console.log(sql);
    console.log('─'.repeat(60));
    process.exit(0);
  }

  console.log('Creating banners table via Supabase Management API...');

  const response = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    console.error('❌ Failed to create banners table:', body);
    process.exit(1);
  }

  console.log('✅ Banners table created successfully!');
  console.log('   Restart your backend server to reload the schema cache.');
}

createBannersTable().catch((err) => {
  console.error('❌ Unexpected error:', err.message);
  process.exit(1);
});
