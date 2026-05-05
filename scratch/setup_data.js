
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://owajvfwhhdhvhrwjbkmd.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93YWp2ZndoaGRodmhyd2pia21kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzg1MjM4NCwiZXhwIjoyMDkzNDI4Mzg0fQ.HfCkuGppQ6knipGdw5j4ecHiidMlLQidh6UgsQKbLwU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setup() {
  console.log('--- UPDATING SCHEMA ---');
  
  // 1. Update Categories Table
  const { error: catUpdateError } = await supabase.rpc('run_sql', {
    sql: `
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT;
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
    `
  });
  // Note: run_sql might not be enabled by default in Supabase for RPC. 
  // If it fails, I'll try to just insert data and hope for the best, 
  // but usually I'd need to do this via SQL editor.
  // However, I can try to use a different approach if RPC is not available.
  
  // Let's assume I can't run arbitrary SQL via RPC if not set up.
  // I'll try to just check if I can insert into these columns.
  
  console.log('--- INSERTING MENUS TABLE ---');
  await supabase.rpc('run_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS menus (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        label TEXT NOT NULL,
        category_slug TEXT,
        custom_url TEXT,
        parent_id UUID REFERENCES menus(id) ON DELETE CASCADE,
        menu_group TEXT NOT NULL DEFAULT 'main_nav', -- 'main_nav', 'footer_shop', etc.
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Public can read menus" ON menus FOR SELECT USING (true);
    `
  });

  // Since I might not have RPC 'run_sql', I'll just provide the SQL to the user 
  // to run in their dashboard if my automated attempt fails.
  // BUT I will try to populate the existing tables with good data first.

  console.log('--- POPULATING DATA ---');

  // Products with images and categories
  const products = [
    {
      slug: 'jessy-set',
      name: 'Jessy Set - Setelan Wanita Korea',
      brand: 'HOMEDRESS_NA',
      category: ['setelan', 'new-in', 'viral'],
      price: 145000,
      original_price: 185000,
      discount: 22,
      images: ['/images/Untitled_design-19_ecd62676-bd1a-4b2f-a5d3-ed2d838d8217.png'],
      is_active: true
    },
    {
      slug: 'cantika-set-batwing',
      name: 'Cantika Set - Rayon Salur',
      brand: 'HOMEDRESS_NA',
      category: ['setelan', 'flash-sale'],
      price: 125000,
      original_price: 175000,
      discount: 28,
      images: ['/images/17_35192b6b-4ccc-4e6a-9773-1db1109d9287.png'],
      is_active: true
    },
    {
      slug: 'naila-set-vol2',
      name: 'Naila Set Vol 2',
      brand: 'HOMEDRESS_NA',
      category: ['setelan', 'best-seller'],
      price: 135000,
      original_price: 165000,
      discount: 18,
      images: ['/images/Untitled_design-22_95380a0c-9058-49dc-bafa-b6a272ab8fce.png'],
      is_active: true
    }
  ];

  for (const p of products) {
    const { error } = await supabase.from('products').upsert(p, { onConflict: 'slug' });
    if (error) console.error(`Error upserting product ${p.slug}:`, error);
    else console.log(`Upserted product: ${p.slug}`);
  }

  // Categories
  const categories = [
    { name: 'Atasan', slug: 'atasan' },
    { name: 'Bawahan', slug: 'bawahan' },
    { name: 'Dress', slug: 'dress' },
    { name: 'Setelan', slug: 'setelan' },
    { name: 'Flash Sale', slug: 'flash-sale' },
    { name: 'New In', slug: 'new-in' }
  ];

  for (const c of categories) {
    const { error } = await supabase.from('categories').upsert(c, { onConflict: 'slug' });
    if (error) console.error(`Error upserting category ${c.slug}:`, error);
    else console.log(`Upserted category: ${c.slug}`);
  }

  // Hero Slides
  const slides = [
    {
      title: 'Koleksi Homedress Premium',
      subtitle: 'Nyaman dipakai seharian dengan bahan Rayon Grade A',
      image_url: '/images/hero_homedress_elegant_1777973102564.png',
      link_url: '/category.html?filter=dress',
      is_active: true
    },
    {
      title: 'Setelan Viral Kekinian',
      subtitle: 'Tampil cantik di rumah maupun saat hangout',
      image_url: '/images/hero_fashion_yellow_1777971832869.png',
      link_url: '/category.html?filter=setelan',
      is_active: true
    }
  ];

  for (const s of slides) {
    const { error } = await supabase.from('hero_slides').upsert(s, { onConflict: 'title' });
    if (error) console.error(`Error upserting slide ${s.title}:`, error);
    else console.log(`Upserted slide: ${s.title}`);
  }
}

setup();
