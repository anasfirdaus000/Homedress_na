
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://owajvfwhhdhvhrwjbkmd.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93YWp2ZndoaGRodmhyd2pia21kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzg1MjM4NCwiZXhwIjoyMDkzNDI4Mzg0fQ.HfCkuGppQ6knipGdw5j4ecHiidMlLQidh6UgsQKbLwU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setup() {
  console.log('--- RESETTING & POPULATING CATEGORIES ---');
  
  // Define categories requested by user
  const categories = [
    { name: 'Homedress', slug: 'homedress', is_featured: true, image_url: '/images/hero_homedress_elegant_1777973102564.png', order_index: 1 },
    { name: 'Gamis', slug: 'gamis', is_featured: true, image_url: '/images/editorial_modern.png', order_index: 2 },
    { name: 'One Set', slug: 'one-set', is_featured: true, image_url: '/images/17_35192b6b-4ccc-4e6a-9773-1db1109d9287.png', order_index: 3 },
    { name: 'Hijab', slug: 'hijab', is_featured: true, image_url: '/images/Untitled_design-105.png', order_index: 4 },
    { name: 'Mukena', slug: 'mukena', is_featured: true, image_url: '/images/Untitled_design-151.png', order_index: 5 },
    { name: 'Koleksi Terbaru', slug: 'new-in', is_featured: true, image_url: '/images/Mobile_Website_banner-3.png', order_index: 6 }
  ];

  for (const c of categories) {
    const { error } = await supabase.from('categories').upsert(c, { onConflict: 'slug' });
    if (error) console.error(`Error upserting category ${c.slug}:`, error);
    else console.log(`Upserted category: ${c.slug}`);
  }

  console.log('--- UPDATING PRODUCTS TO MATCH CATEGORIES ---');
  const products = [
    {
      slug: 'jessy-set',
      name: 'Jessy Set - Setelan Korea',
      category: ['one-set', 'new-in'],
      images: ['/images/Untitled_design-19_ecd62676-bd1a-4b2f-a5d3-ed2d838d8217.png'],
      price: 145000,
      is_active: true
    },
    {
      slug: 'naila-set-vol2',
      name: 'Naila Set Vol 2',
      category: ['one-set', 'homedress'],
      images: ['/images/Untitled_design-22_95380a0c-9058-49dc-bafa-b6a272ab8fce.png'],
      price: 135000,
      is_active: true
    },
    {
      slug: 'cantika-set-batwing',
      name: 'Cantika Set Batwing',
      category: ['one-set', 'gamis'],
      images: ['/images/17_35192b6b-4ccc-4e6a-9773-1db1109d9287.png'],
      price: 125000,
      is_active: true
    }
  ];

  for (const p of products) {
    const { error } = await supabase.from('products').upsert(p, { onConflict: 'slug' });
    if (error) console.error(`Error upserting product ${p.slug}:`, error);
    else console.log(`Upserted product: ${p.slug}`);
  }
}

setup();
