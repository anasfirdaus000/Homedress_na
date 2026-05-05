
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://owajvfwhhdhvhrwjbkmd.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93YWp2ZndoaGRodmhyd2pia21kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzg1MjM4NCwiZXhwIjoyMDkzNDI4Mzg0fQ.HfCkuGppQ6knipGdw5j4ecHiidMlLQidh6UgsQKbLwU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setup() {
  console.log('--- POPULATING FEATURED SECTIONS ---');
  
  const featured = [
    {
      type: 'pinned_banner',
      title: 'KOLEKSI JESSY SET',
      subtitle: 'Setelan premium gaya Korea yang nyaman dan stylish.',
      image_url: '/images/Untitled_design-19_ecd62676-bd1a-4b2f-a5d3-ed2d838d8217.png',
      product_slug: 'jessy-set',
      is_active: true
    },
    {
      type: 'floating_promo',
      title: 'PROMO SPESIAL',
      subtitle: 'Diskon 50% untuk Cantika Set!',
      image_url: '/images/17_35192b6b-4ccc-4e6a-9773-1db1109d9287.png',
      product_slug: 'cantika-set-batwing',
      is_active: true
    }
  ];

  for (const f of featured) {
    const { error } = await supabase.from('featured_sections').insert(f);
    if (error) console.error(`Error inserting featured:`, error);
    else console.log(`Inserted featured: ${f.title}`);
  }

  console.log('--- POPULATING MENUS ---');
  // Note: I'm assuming the 'menus' table MIGHT exist or I can skip it if it fails
  try {
    const menus = [
      { label: 'Beranda', custom_url: '/', menu_group: 'main_nav', order_index: 1 },
      { label: 'Flash Sale ⚡', category_slug: 'flash-sale', menu_group: 'main_nav', order_index: 2 },
      { label: 'Best Seller 🔥', category_slug: 'best-seller', menu_group: 'main_nav', order_index: 3 },
      { label: 'Setelan', category_slug: 'setelan', menu_group: 'main_nav', order_index: 4 },
      { label: 'Dress', category_slug: 'dress', menu_group: 'main_nav', order_index: 5 },
      { label: 'New Arrival', category_slug: 'new-in', menu_group: 'main_nav', order_index: 6 },
      { label: 'Explore', custom_url: '/about-us.html', menu_group: 'main_nav', order_index: 7 }
    ];
    
    for (const m of menus) {
      await supabase.from('menus').insert(m);
    }
    console.log('Menus populated (if table existed)');
  } catch (e) {
    console.log('Menus table likely missing, skipping...');
  }

  console.log('--- RE-INSERTING HERO SLIDES (without upsert) ---');
  const slides = [
    {
      title: 'Koleksi Homedress Premium ✨',
      subtitle: 'Nyaman dipakai seharian dengan bahan Rayon Grade A',
      image_url: '/images/hero_homedress_elegant_1777973102564.png',
      link_url: '/category.html?filter=dress',
      is_active: true,
      slide_order: 1
    },
    {
      title: 'Setelan Viral Kekinian 🔥',
      subtitle: 'Tampil cantik di rumah maupun saat hangout',
      image_url: '/images/hero_fashion_yellow_1777971832869.png',
      link_url: '/category.html?filter=setelan',
      is_active: true,
      slide_order: 2
    }
  ];

  const { error: slideError } = await supabase.from('hero_slides').insert(slides);
  if (slideError) console.error('Error inserting slides:', slideError);
  else console.log('Slides inserted.');
}

setup();
