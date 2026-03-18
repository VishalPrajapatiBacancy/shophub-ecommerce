/**
 * Seed dummy data into Supabase for development.
 * Run from backend folder: node scripts/seed-database.js
 *
 * Prerequisites:
 *  1. Run RESET_AND_SETUP.sql in Supabase SQL Editor first
 *  2. Ensure .env has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

const ADMIN_EMAIL = 'admin@shophub.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Admin User';

// ── Helpers ─────────────────────────────────────────────────────────────────

async function getOrCreateAuthUser(email, password, name, role) {
  // Try to find existing auth user
  const { data: listData } = await supabase.auth.admin.listUsers();
  const existing = listData?.users?.find((u) => u.email === email);
  if (existing) {
    console.log(`  Auth user exists: ${email}`);
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
  });
  if (error) {
    console.warn(`  Could not create auth user ${email}:`, error.message);
    return null;
  }
  console.log(`  Created auth user: ${email}`);
  return data.user.id;
}

async function upsertProfile(id, name, email, role) {
  // Try with all columns first; fall back to minimal columns if 'name'/'is_active' don't exist yet
  let { error } = await supabase.from('users').upsert({ id, name, email, role, is_active: true });
  if (error && (error.message.includes('column') || error.code === '42703')) {
    // Try without name and is_active
    const r2 = await supabase.from('users').upsert({ id, email, role });
    if (r2.error) console.warn(`  Profile upsert error for ${email}:`, r2.error.message);
  } else if (error) {
    console.warn(`  Profile upsert error for ${email}:`, error.message);
  }
}

// ── Seed functions ───────────────────────────────────────────────────────────

async function seedUsers() {
  console.log('\n[1/6] Seeding users...');

  const users = [
    { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: ADMIN_NAME, role: 'admin' },
    { email: 'john@example.com', password: 'password123', name: 'John Smith', role: 'user' },
    { email: 'sarah@example.com', password: 'password123', name: 'Sarah Johnson', role: 'user' },
    { email: 'mike@example.com', password: 'password123', name: 'Mike Williams', role: 'user' },
  ];

  const result = [];
  for (const u of users) {
    const id = await getOrCreateAuthUser(u.email, u.password, u.name, u.role);
    if (id) {
      await upsertProfile(id, u.name, u.email, u.role);
      result.push({ id, email: u.email, role: u.role });
    }
  }

  console.log(`  Done: ${result.length} users ready.`);
  return result;
}

async function seedProducts(adminId) {
  console.log('\n[2/6] Seeding products...');

  const { data: existing } = await supabase.from('products').select('id').limit(1);
  if (existing && existing.length > 0) {
    console.log('  Products already exist, skipping.');
    const { data } = await supabase.from('products').select('id, name');
    return data || [];
  }

  const products = [
    { name: 'Wireless Bluetooth Headphones', description: 'Premium noise-cancelling headphones with 30h battery life.', price: 79.99, category: 'Electronics', stock: 145, rating: 4.5, num_reviews: 120 },
    { name: 'Smart Watch Pro', description: 'Advanced smartwatch with health monitoring, GPS, and 7-day battery.', price: 149.99, category: 'Electronics', stock: 89, rating: 4.7, num_reviews: 89 },
    { name: 'Organic Cotton T-Shirt', description: '100% organic cotton, available in 6 colors. Eco-friendly packaging.', price: 29.99, category: 'Clothing', stock: 320, rating: 4.3, num_reviews: 56 },
    { name: 'Running Shoes Ultra', description: 'Lightweight, breathable running shoes with CloudFoam cushioning.', price: 119.99, category: 'Sports', stock: 67, rating: 4.8, num_reviews: 200 },
    { name: 'Laptop Stand Adjustable', description: 'Ergonomic aluminum laptop stand, 6 height levels, foldable.', price: 49.99, category: 'Electronics', stock: 200, rating: 4.6, num_reviews: 98 },
    { name: 'Stainless Steel Water Bottle', description: 'Double-wall insulated 500ml bottle. Keeps cold 24h, hot 12h.', price: 24.99, category: 'Home', stock: 500, rating: 4.4, num_reviews: 70 },
    { name: 'Yoga Mat Premium', description: 'Non-slip eco-friendly TPE mat, 6mm thick, carrying strap included.', price: 34.99, category: 'Sports', stock: 120, rating: 4.2, num_reviews: 45 },
    { name: 'LED Desk Lamp', description: 'Touch-control LED lamp with 5 brightness levels and USB charging port.', price: 45.00, category: 'Home', stock: 80, rating: 4.5, num_reviews: 60 },
  ];

  const inserted = [];
  for (const p of products) {
    // Try with 'name' column first; if it fails, try with 'title' (legacy schema)
    let { data: row, error } = await supabase
      .from('products')
      .insert({ ...p, created_by: adminId })
      .select('id, name')
      .single();

    if (error && (error.message.includes('column') || error.code === '42703')) {
      const { name: pName, ...rest } = p;
      const r2 = await supabase
        .from('products')
        .insert({ ...rest, title: pName, created_by: adminId })
        .select('id, title')
        .single();
      if (!r2.error && r2.data) {
        row = { id: r2.data.id, name: r2.data.title };
        error = null;
      } else {
        error = r2.error;
      }
    }

    if (!error && row) {
      inserted.push(row);
      console.log(`  + ${row.name}`);
    } else if (error) {
      console.warn(`  ! Could not insert product "${p.name}":`, error.message);
    }
  }

  console.log(`  Done: ${inserted.length} products seeded.`);
  return inserted;
}

async function seedCategories(adminId) {
  console.log('\n[3/6] Seeding categories...');

  const { data: existing } = await supabase.from('categories').select('id').limit(1);
  if (existing && existing.length > 0) {
    console.log('  Categories already exist, skipping.');
    return;
  }

  const categories = [
    { name: 'Electronics', slug: 'electronics', description: 'Devices, gadgets and accessories', sort_order: 1 },
    { name: 'Clothing', slug: 'clothing', description: 'Apparel and fashion', sort_order: 2 },
    { name: 'Home', slug: 'home', description: 'Home, kitchen and lifestyle', sort_order: 3 },
    { name: 'Sports', slug: 'sports', description: 'Sports, fitness and outdoors', sort_order: 4 },
    { name: 'Books', slug: 'books', description: 'Books and educational material', sort_order: 5 },
  ];

  for (const c of categories) {
    const { error } = await supabase.from('categories').insert({
      ...c,
      is_active: true,
      is_featured: c.sort_order <= 2,
      product_count: 0,
      created_by: adminId,
    });
    if (error) console.warn(`  ! Category "${c.name}":`, error.message);
    else console.log(`  + ${c.name}`);
  }
}

async function seedBrands(adminId) {
  console.log('\n[4/6] Seeding brands...');

  const { data: existing } = await supabase.from('brands').select('id').limit(1);
  if (existing && existing.length > 0) {
    console.log('  Brands already exist, skipping.');
    return;
  }

  const brands = [
    { name: 'TechAudio', slug: 'techaudio', description: 'Premium audio electronics' },
    { name: 'EcoWear', slug: 'ecowear', description: 'Sustainable fashion brand' },
    { name: 'SpeedFit', slug: 'speedfit', description: 'Performance sportswear' },
    { name: 'HomeGlow', slug: 'homeglow', description: 'Smart home products' },
  ];

  for (const b of brands) {
    const { error } = await supabase.from('brands').insert({
      ...b,
      is_active: true,
      is_featured: true,
      product_count: 0,
      sort_order: 0,
      created_by: adminId,
    });
    if (error) console.warn(`  ! Brand "${b.name}":`, error.message);
    else console.log(`  + ${b.name}`);
  }
}

async function seedOrdersAndItems(userRows, productRows) {
  console.log('\n[5/6] Seeding orders...');

  const { data: existing } = await supabase.from('orders').select('id').limit(1);
  if (existing && existing.length > 0) {
    console.log('  Orders already exist, skipping.');
    return;
  }

  const customers = userRows.filter((u) => u.role !== 'admin');
  if (customers.length === 0 || productRows.length === 0) {
    console.log('  No customers or products available, skipping orders.');
    return;
  }

  const orderDefs = [
    {
      user_id: customers[0].id,
      order_number: 'ORD-2024-001',
      subtotal: 129.98, tax: 10.40, shipping: 5.99, discount: 0, total: 146.37,
      status: 'delivered', payment_status: 'paid', payment_method: 'Credit Card',
      shipping_address: { street: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001', country: 'US' },
      items: [{ idx: 0, qty: 1 }, { idx: 4, qty: 1 }],
    },
    {
      user_id: (customers[1] || customers[0]).id,
      order_number: 'ORD-2024-002',
      subtotal: 149.99, tax: 12.00, shipping: 0, discount: 15.00, total: 146.99,
      status: 'shipped', payment_status: 'paid', payment_method: 'PayPal',
      shipping_address: { street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zipCode: '90001', country: 'US' },
      items: [{ idx: 1, qty: 1 }],
    },
    {
      user_id: (customers[2] || customers[0]).id,
      order_number: 'ORD-2024-003',
      subtotal: 159.96, tax: 12.80, shipping: 5.99, discount: 0, total: 178.75,
      status: 'processing', payment_status: 'paid', payment_method: 'Credit Card',
      shipping_address: { street: '789 Pine Rd', city: 'Chicago', state: 'IL', zipCode: '60601', country: 'US' },
      items: [{ idx: 2, qty: 3 }, { idx: 3, qty: 1 }],
    },
    {
      user_id: customers[0].id,
      order_number: 'ORD-2024-004',
      subtotal: 119.99, tax: 9.60, shipping: 0, discount: 12.00, total: 117.59,
      status: 'pending', payment_status: 'pending', payment_method: 'Credit Card',
      shipping_address: { street: '321 Elm St', city: 'Houston', state: 'TX', zipCode: '77001', country: 'US' },
      items: [{ idx: 3, qty: 1 }],
    },
  ];

  for (const def of orderDefs) {
    const { items: itemDefs, ...orderData } = def;
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert(orderData)
      .select('id')
      .single();

    if (orderErr || !order) {
      console.warn(`  ! Order ${def.order_number}:`, orderErr?.message);
      continue;
    }

    const itemRows = itemDefs
      .map(({ idx, qty }) => {
        const prod = productRows[idx] || productRows[0];
        const price = [79.99, 149.99, 29.99, 119.99, 49.99, 24.99, 34.99, 45.00][idx] || 49.99;
        return { order_id: order.id, product_id: prod.id, name: prod.name, price, quantity: qty, total: price * qty };
      });

    const { error: itemsErr } = await supabase.from('order_items').insert(itemRows);
    if (itemsErr) console.warn(`  ! Order items for ${def.order_number}:`, itemsErr.message);
    else console.log(`  + Order ${def.order_number} (${def.status})`);
  }
}

async function seedCoupons(adminId) {
  console.log('\n[6/6] Seeding coupons...');

  const { data: existing } = await supabase.from('coupons').select('id').limit(1);
  if (existing && existing.length > 0) {
    console.log('  Coupons already exist, skipping.');
    return;
  }

  const now = new Date();
  const twoMonthsLater = new Date(now);
  twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2);

  const coupons = [
    { code: 'WELCOME10', description: '10% off your first order', type: 'percentage', value: 10, min_order_amount: 50, usage_limit: 100, used_count: 5 },
    { code: 'FLAT20', description: '$20 flat discount on orders over $100', type: 'fixed', value: 20, min_order_amount: 100, max_discount: 20, usage_limit: 50, used_count: 12 },
    { code: 'SUMMER25', description: '25% summer sale discount', type: 'percentage', value: 25, usage_limit: 200, used_count: 30 },
    { code: 'FREESHIP', description: 'Free shipping on any order', type: 'fixed', value: 9.99, min_order_amount: 0, usage_limit: 500, used_count: 88 },
  ];

  for (const c of coupons) {
    const { error } = await supabase.from('coupons').insert({
      ...c,
      start_date: now.toISOString(),
      end_date: twoMonthsLater.toISOString(),
      status: 'active',
      created_by: adminId,
    });
    if (error) console.warn(`  ! Coupon "${c.code}":`, error.message);
    else console.log(`  + ${c.code}`);
  }
}

async function seedReviews(userRows, productRows) {
  const customers = userRows.filter((u) => u.role !== 'admin');
  if (customers.length === 0 || productRows.length < 3) return;

  const { data: existing } = await supabase.from('reviews').select('id').limit(1);
  if (existing && existing.length > 0) {
    console.log('  Reviews already exist, skipping.');
    return;
  }

  const reviews = [
    { product_id: productRows[0].id, user_id: customers[0].id, rating: 5, title: 'Absolutely love these headphones!', comment: 'Best purchase I made this year. Crystal clear sound and amazing noise cancelling.', status: 'approved' },
    { product_id: productRows[0].id, user_id: (customers[1] || customers[0]).id, rating: 4, title: 'Great value for money', comment: 'Works exactly as described. Battery life is impressive.', status: 'approved' },
    { product_id: productRows[1].id, user_id: customers[0].id, rating: 5, title: 'My favorite smartwatch', comment: 'Tracks everything accurately. The display is gorgeous.', status: 'approved' },
    { product_id: productRows[2].id, user_id: (customers[2] || customers[0]).id, rating: 3, title: 'Decent quality', comment: 'Fits well but color faded after a few washes.', status: 'pending' },
    { product_id: productRows[3].id, user_id: customers[0].id, rating: 5, title: 'Best running shoes ever!', comment: 'Super comfortable, perfect for marathon training.', status: 'approved' },
  ];

  for (const r of reviews) {
    await supabase.from('reviews').insert(r);
  }
  console.log(`  + ${reviews.length} reviews seeded.`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════╗');
  console.log('║   ShopHub Database Seeder            ║');
  console.log('╚══════════════════════════════════════╝');

  const userRows = await seedUsers();
  const adminUser = userRows.find((u) => u.email === ADMIN_EMAIL);
  const adminId = adminUser?.id;

  if (!adminId) {
    console.error('\n❌ Admin user could not be created. Make sure RESET_AND_SETUP.sql was run in Supabase SQL Editor first.');
    process.exit(1);
  }

  const productRows = await seedProducts(adminId);
  await seedCategories(adminId);
  await seedBrands(adminId);
  await seedOrdersAndItems(userRows, productRows);
  await seedCoupons(adminId);
  await seedReviews(userRows, productRows);

  console.log('\n╔══════════════════════════════════════╗');
  console.log('║   ✅ Seeding complete!               ║');
  console.log('╠══════════════════════════════════════╣');
  console.log(`║   Admin email:    ${ADMIN_EMAIL.padEnd(18)} ║`);
  console.log(`║   Admin password: ${'admin123'.padEnd(18)} ║`);
  console.log('╚══════════════════════════════════════╝\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ Seed failed:', err.message);
  process.exit(1);
});
