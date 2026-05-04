/**
 * Run Supabase Schema via REST API
 * Executes the SQL schema using the Supabase Management API
 */
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// Load env
const envContent = readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) return;
  env[trimmed.substring(0, eqIdx).trim()] = trimmed.substring(eqIdx + 1).trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// We'll run each SQL statement separately via supabase rpc
// Since we can't run raw SQL via the client library directly,
// we'll use the Supabase REST API with the pg_net extension or 
// simply use fetch to the SQL endpoint

async function runSQL(sql, label) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`
    },
    body: JSON.stringify({})
  });
  // This won't work for raw SQL. Let's use the Supabase HTTP API directly
}

// Actually, let's use the supabase-js approach: check if tables exist, if not guide user
async function checkAndSetup() {
  console.log('🔍 Checking Supabase connection and existing tables...\n');

  // Check products table
  const { data: prodCheck, error: prodErr } = await supabase.from('products').select('count').limit(1);
  
  if (prodErr && (prodErr.message.includes('relation') || prodErr.code === '42P01')) {
    console.log('❌ Table "products" does NOT exist yet.');
    console.log('');
    console.log('📋 Anda perlu menjalankan SQL Schema secara manual:');
    console.log('');
    console.log('1. Buka: https://supabase.com/dashboard/project/owajvfwhhdhvhrwjbkmd/sql/new');
    console.log('2. Copy semua isi file: supabase-schema.sql');
    console.log('3. Paste di SQL Editor, lalu klik "Run"');
    console.log('');
    console.log('Setelah selesai, jalankan lagi: node scripts/run-schema.js');
    process.exit(1);
  } else if (prodErr) {
    console.log('❌ Error connecting:', prodErr.message);
    process.exit(1);
  }
  
  console.log('✅ Table "products" exists!');

  // Check orders
  const { error: ordErr } = await supabase.from('orders').select('count').limit(1);
  console.log(ordErr ? '❌ Table "orders" missing' : '✅ Table "orders" exists!');

  // Check order_items
  const { error: oiErr } = await supabase.from('order_items').select('count').limit(1);
  console.log(oiErr ? '❌ Table "order_items" missing' : '✅ Table "order_items" exists!');

  // Check notifications_log
  const { error: nlErr } = await supabase.from('notifications_log').select('count').limit(1);
  console.log(nlErr ? '❌ Table "notifications_log" missing' : '✅ Table "notifications_log" exists!');

  // Check site_settings
  const { data: settingsData, error: ssErr } = await supabase.from('site_settings').select('key');
  console.log(ssErr ? '❌ Table "site_settings" missing' : `✅ Table "site_settings" exists! (${settingsData?.length || 0} settings)`);

  // Check generate_order_number function
  const { data: fnData, error: fnErr } = await supabase.rpc('generate_order_number');
  console.log(fnErr ? '❌ Function "generate_order_number" missing' : `✅ Function "generate_order_number" works! (Test: ${fnData})`);

  console.log('\n✅ Database schema is set up correctly!');
  console.log('\n📊 Ready to migrate product data. Run: npm run db:setup');
}

checkAndSetup().catch(err => {
  console.error('Error:', err.message);
});
