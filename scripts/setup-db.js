/**
 * Database Setup Script
 * Migrates product data from products-data.js into Supabase
 * Run: node scripts/setup-db.js
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load env
const envContent = readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const [key, ...valParts] = trimmed.split('=');
  env[key.trim()] = valParts.join('=').trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Products data (from products-data.js)
const PRODUCTS = [
  {
    slug: 'setelan-santai-mint-premium',
    name: 'Setelan Santai Mint Premium',
    brand: 'HOMEDRESS_NA',
    category: ['setelan','new-in','flash-sale'],
    price: 189000,
    original_price: 270000,
    discount: 30,
    description: 'Setelan santai premium dengan warna mint yang segar dan elegan. Bahan berkualitas tinggi, nyaman dipakai seharian.',
    details: ['Bahan: Cotton Rayon Premium','Warna: Mint Green','Ukuran: S, M, L, XL, XXL','Terdiri dari: Atasan + Celana'],
    sizes: ['S','M','L','XL','XXL'],
    disabled_sizes: ['XXL'],
    images: ['/images/1_0d097d33-95ec-49db-909b-b31fb077219f.png','/images/1_0d097d33-95ec-49db-909b-b31fb077219f(1).png'],
    social_proof: '-30% OFF — Flash Sale',
    related_ids: ['dress-kasual-navy-blue','setelan-hitam-olahraga-santai','atasan-piyama-lengan-panjang','celana-santai-hitam']
  },
  {
    slug: 'dress-kasual-navy-blue',
    name: 'Dress Kasual Navy Blue',
    brand: 'HOMEDRESS_NA',
    category: ['dress','best-seller'],
    price: 145000,
    original_price: 195000,
    discount: 26,
    description: 'Dress kasual elegan dengan warna navy blue yang timeless. Cocok untuk berbagai acara santai maupun semi formal.',
    details: ['Bahan: Crinkle Airflow','Warna: Navy Blue','Ukuran: S, M, L, XL','Model: A-line flowy'],
    sizes: ['S','M','L','XL'],
    disabled_sizes: [],
    images: ['/images/Untitled_design-22_95380a0c-9058-49dc-bafa-b6a272ab8fce.png','/images/Untitled_design-22_95380a0c-9058-49dc-bafa-b6a272ab8fce(1).png'],
    social_proof: 'Laris Manis — 250+ terjual',
    related_ids: ['setelan-santai-mint-premium','atasan-piyama-lengan-panjang','daster-modern-motif-bunga','paket-bundling-2-dress']
  },
  {
    slug: 'atasan-piyama-lengan-panjang',
    name: 'Atasan Piyama Lengan Panjang',
    brand: 'HOMEDRESS_NA',
    category: ['atasan'],
    price: 99000,
    original_price: 140000,
    discount: 29,
    description: 'Atasan piyama lengan panjang dengan bahan lembut dan adem. Desain simpel namun stylish untuk tidur nyenyak.',
    details: ['Bahan: Rayon Premium','Warna: Soft Pink','Ukuran: S, M, L, XL','Lengan: Panjang'],
    sizes: ['S','M','L','XL'],
    disabled_sizes: [],
    images: ['/images/Untitled_design_29917e1b-5767-46fd-a07a-802abac5ece3.png'],
    social_proof: 'New Arrival ✨',
    related_ids: ['setelan-santai-mint-premium','dress-kasual-navy-blue','celana-santai-hitam','setelan-hitam-polos']
  },
  {
    slug: 'setelan-hitam-olahraga-santai',
    name: 'Setelan Hitam Olahraga & Santai - Midnight Black',
    brand: 'HOMEDRESS_NA',
    category: ['setelan','flash-sale'],
    price: 120000,
    original_price: 175000,
    discount: 31,
    description: 'Setelan hitam multifungsi — cocok untuk olahraga ringan maupun santai di rumah. Warna hitam elegan, bahan stretch nyaman.',
    details: ['Bahan: Cotton Stretch','Warna: Midnight Black','Ukuran: S, M, L, XL, XXL','Cocok untuk: Olahraga & Santai'],
    sizes: ['S','M','L','XL','XXL'],
    disabled_sizes: [],
    images: ['/images/17_35192b6b-4ccc-4e6a-9773-1db1109d9287.png'],
    social_proof: '-31% OFF — Clearance',
    related_ids: ['setelan-santai-mint-premium','setelan-hitam-polos','celana-santai-hitam','t-shirt-santai-abu']
  },
  {
    slug: 'celana-santai-hitam',
    name: 'Celana Santai Hitam',
    brand: 'HOMEDRESS_NA',
    category: ['bawahan'],
    price: 85000,
    original_price: 120000,
    discount: 29,
    description: 'Celana santai hitam dengan bahan lembut dan elastis. Nyaman untuk aktivitas di rumah maupun keluar.',
    details: ['Bahan: Cotton Stretch','Warna: Hitam','Ukuran: S, M, L, XL','Model: Loose fit, karet pinggang'],
    sizes: ['S','M','L','XL'],
    disabled_sizes: [],
    images: ['/images/BDB699C6-5555-4650-A463-0FE7112241FD.jpg'],
    social_proof: 'Best Seller 🔥',
    related_ids: ['setelan-hitam-olahraga-santai','celana-pendek-santai','t-shirt-santai-abu','setelan-hitam-polos']
  },
  {
    slug: 'paket-bundling-2-dress',
    name: 'Paket Bundling 2 Dress Kasual',
    brand: 'HOMEDRESS_NA',
    category: ['dress','bundling','flash-sale'],
    price: 250000,
    original_price: 390000,
    discount: 36,
    description: 'Paket hemat bundling 2 dress kasual. Dapatkan 2 dress cantik dengan harga spesial!',
    details: ['Isi: 2 Dress Kasual','Bahan: Crinkle Airflow','Ukuran: S, M, L, XL','Varian: Random motif cantik'],
    sizes: ['S','M','L','XL'],
    disabled_sizes: [],
    images: ['/images/8_4f54fd4f-987c-41db-8642-28fe4c0b8413.png','/images/45964E36-0747-4AB6-8315-23B1C57EA16E.jpg'],
    social_proof: '🔥 BUNDLING HEMAT -36%',
    related_ids: ['dress-kasual-navy-blue','daster-modern-motif-bunga','setelan-santai-mint-premium','atasan-piyama-lengan-panjang']
  },
  {
    slug: 't-shirt-santai-abu',
    name: 'T-Shirt Santai Abu-abu',
    brand: 'HOMEDRESS_NA',
    category: ['atasan'],
    price: 45000,
    original_price: 75000,
    discount: 40,
    description: 'T-shirt santai warna abu-abu dengan bahan adem. Cocok untuk daily wear di rumah atau hangout santai.',
    details: ['Bahan: Cotton Combed 30s','Warna: Abu-abu','Ukuran: S, M, L, XL, XXL','Model: Regular fit'],
    sizes: ['S','M','L','XL','XXL'],
    disabled_sizes: [],
    images: ['/images/3_7612f55d-46a6-49ac-9791-b1a123d4c6e8.png','/images/3_2543182d-5061-4d56-a47d-ceead373da5f.png'],
    social_proof: '-40% OFF — Harga Terjangkau!',
    related_ids: ['celana-santai-hitam','setelan-hitam-polos','celana-pendek-santai','setelan-hitam-olahraga-santai']
  },
  {
    slug: 'setelan-hitam-polos',
    name: 'Setelan Hitam Polos',
    brand: 'HOMEDRESS_NA',
    category: ['setelan'],
    price: 160000,
    original_price: 220000,
    discount: 27,
    description: 'Setelan hitam polos yang minimalis dan elegan. Bahan premium, nyaman untuk daily wear.',
    details: ['Bahan: Rayon Premium','Warna: Hitam','Ukuran: S, M, L, XL','Model: Oversize Top + Celana Panjang'],
    sizes: ['S','M','L','XL'],
    disabled_sizes: [],
    images: ['/images/13_2a0325a5-7366-447c-b9f4-18f8ccb48248.png'],
    social_proof: 'Minimalist Elegance — Best Seller',
    related_ids: ['setelan-hitam-olahraga-santai','setelan-santai-mint-premium','celana-santai-hitam','t-shirt-santai-abu']
  },
  {
    slug: 'daster-modern-motif-bunga',
    name: 'Daster Modern Motif Bunga',
    brand: 'HOMEDRESS_NA',
    category: ['dress','new-in'],
    price: 135000,
    original_price: 185000,
    discount: 27,
    description: 'Daster modern motif bunga yang cantik dan feminin. Bahan adem, cocok untuk di rumah maupun acara santai.',
    details: ['Bahan: Rayon Viscose','Motif: Bunga vintage','Ukuran: All Size (S-XL)','Model: A-Line longgar'],
    sizes: ['All Size (S-XL)'],
    disabled_sizes: [],
    images: ['/images/12_4c153cfc-80b6-4d22-8abe-0576d6ea0a01.png'],
    social_proof: '✨ New Arrival — Motif Cantik',
    related_ids: ['dress-kasual-navy-blue','paket-bundling-2-dress','atasan-piyama-lengan-panjang','setelan-santai-mint-premium']
  },
  {
    slug: 'celana-pendek-santai',
    name: 'Celana Pendek Santai',
    brand: 'HOMEDRESS_NA',
    category: ['bawahan','new-in'],
    price: 65000,
    original_price: 95000,
    discount: 32,
    description: 'Celana pendek santai yang ringan dan nyaman. Bahan breathable, cocok untuk di rumah atau berolahraga ringan.',
    details: ['Bahan: Cotton Blend','Warna: Hitam','Ukuran: S, M, L, XL','Model: Loose fit, karet pinggang'],
    sizes: ['S','M','L','XL'],
    disabled_sizes: [],
    images: ['/images/629F5E92-479F-4E54-AE27-6D738460207B.jpg','/images/EF98BC5E-3E05-40BC-A65D-BADFC2E66CB0.jpg'],
    social_proof: '-32% OFF — New Arrival',
    related_ids: ['celana-santai-hitam','t-shirt-santai-abu','setelan-hitam-olahraga-santai','setelan-hitam-polos']
  },
  {
    slug: 'cantika-set-batwing',
    name: 'Cantika Set - Setelan Wanita Batwing Rayon Salur',
    brand: 'HOMEDRESS_NA',
    category: ['setelan','flash-sale','viral','new-in'],
    price: 129000,
    original_price: 199000,
    discount: 35,
    description: 'Cantika Set adalah pilihan terbaik untuk setelan wanita batwing dengan kenyamanan maksimal. Bahan rayon salur premium, sangat adem dan cocok untuk aktivitas sehari-hari.',
    details: ['Bahan: Rayon Salur Premium','Model: Batwing (Loose Fit)','Karakter: Lembut, jatuh, sangat adem','Pilihan Warna: Hitam, Putih','Menyerap keringat, anti gerah','Cocok untuk: Harian, santai, hangout'],
    sizes: ['All Size (S-XL)'],
    disabled_sizes: [],
    images: [
      'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/817dbda748324cc7a6a3c84d0d0b40b2~tplv-aphluv4xwc-origin-jpeg.jpeg',
      'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/4a5c460e9b0b4a7eb88f28b6cb45c36f~tplv-aphluv4xwc-origin-jpeg.jpeg',
      'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/e1f3b63c39ca44498aa0b9a949fe6ff4~tplv-aphluv4xwc-origin-jpeg.jpeg'
    ],
    social_proof: '🔥 Flash Sale — 120+ terjual minggu ini',
    related_ids: ['setelan-santai-mint-premium','setelan-hitam-olahraga-santai','dress-kasual-navy-blue','atasan-piyama-lengan-panjang']
  }
];

async function main() {
  console.log('🚀 HOMEDRESS_NA Database Setup');
  console.log('================================\n');

  // Test connection
  console.log('1. Testing Supabase connection...');
  const { data: testData, error: testError } = await supabase.from('products').select('count').limit(1);
  
  if (testError) {
    if (testError.message.includes('relation') || testError.code === '42P01') {
      console.log('⚠️  Tabel "products" belum ada. Silakan jalankan supabase-schema.sql di Supabase Dashboard > SQL Editor terlebih dahulu!');
      console.log('📄 File: supabase-schema.sql');
      console.log('🌐 Dashboard: https://supabase.com/dashboard/project/owajvfwhhdhvhrwjbkmd/sql/new');
      process.exit(1);
    }
    console.error('❌ Connection error:', testError.message);
    process.exit(1);
  }
  console.log('✅ Connected to Supabase!\n');

  // Insert products
  console.log('2. Inserting products...');
  let inserted = 0;
  let skipped = 0;

  for (const product of PRODUCTS) {
    const { error } = await supabase.from('products').upsert(product, { onConflict: 'slug' });
    if (error) {
      console.log(`   ⚠️  ${product.slug}: ${error.message}`);
      skipped++;
    } else {
      console.log(`   ✅ ${product.slug}`);
      inserted++;
    }
  }

  console.log(`\n📊 Results: ${inserted} inserted, ${skipped} skipped`);

  // Verify
  console.log('\n3. Verifying...');
  const { data: allProducts, error: verifyError } = await supabase.from('products').select('slug, name, price');
  if (verifyError) {
    console.error('❌ Verify error:', verifyError.message);
  } else {
    console.log(`✅ ${allProducts.length} products in database:`);
    allProducts.forEach(p => console.log(`   - ${p.name} (Rp ${p.price.toLocaleString('id-ID')})`));
  }

  console.log('\n🎉 Setup complete!');
}

main().catch(console.error);
