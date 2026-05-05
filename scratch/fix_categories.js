
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://owajvfwhhdhvhrwjbkmd.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93YWp2ZndoaGRodmhyd2pia21kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzg1MjM4NCwiZXhwIjoyMDkzNDI4Mzg0fQ.HfCkuGppQ6knipGdw5j4ecHiidMlLQidh6UgsQKbLwU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setup() {
  console.log('--- RESETTING & POPULATING CATEGORIES (BASIC COLUMNS ONLY) ---');
  
  const categories = [
    { name: 'Homedress', slug: 'homedress' },
    { name: 'Gamis', slug: 'gamis' },
    { name: 'One Set', slug: 'one-set' },
    { name: 'Hijab', slug: 'hijab' },
    { name: 'Mukena', slug: 'mukena' },
    { name: 'Koleksi Terbaru', slug: 'new-in' }
  ];

  // Delete all existing categories to ensure clean slate
  await supabase.from('categories').delete().neq('slug', 'null');

  for (const c of categories) {
    const { error } = await supabase.from('categories').upsert(c, { onConflict: 'slug' });
    if (error) console.error(`Error upserting category ${c.slug}:`, error);
    else console.log(`Upserted category: ${c.slug}`);
  }
}

setup();
