import { supabase } from './database.js';

async function columnExists(table, column) {
  const { error } = await supabase.from(table).select(column).limit(0);
  return !error;
}

export async function runMigrations() {
  try {
    const missing = [];
    for (const col of ['description', 'is_featured', 'seo_title', 'meta_description', 'product_count']) {
      if (!(await columnExists('categories', col))) missing.push(col);
    }
    if (missing.length > 0) {
      console.warn(`⚠️  categories table is missing columns: ${missing.join(', ')}`);
      console.warn('   → Run supabase/FIX_PRODUCTS_AND_STORAGE.sql in your Supabase Dashboard to add them.');
    }
  } catch (err) {
    // Non-fatal
  }
}
