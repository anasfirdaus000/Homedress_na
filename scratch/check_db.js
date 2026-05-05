import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://owajvfwhhdhvhrwjbkmd.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93YWp2ZndoaGRodmhyd2pia21kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzg1MjM4NCwiZXhwIjoyMDkzNDI4Mzg0fQ.HfCkuGppQ6knipGdw5j4ecHiidMlLQidh6UgsQKbLwU';

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkData() {
  console.log('--- PRODUCTS ---');
  const { data: products, error: pError } = await supabase.from('products').select('slug, name, is_active');
  if (pError) console.error(pError);
  else console.log(products);

  console.log('--- CATEGORIES ---');
  const { data: categories, error: cError } = await supabase.from('categories').select('slug, name');
  if (cError) console.error(cError);
  else console.log(categories);

  console.log('--- HERO SLIDES ---');
  const { data: hero, error: hError } = await supabase.from('hero_slides').select('title, is_active');
  if (hError) console.error(hError);
  else console.log(hero);

  console.log('--- FEATURED SECTIONS ---');
  const { data: featured, error: fError } = await supabase.from('featured_sections').select('title, is_active');
  if (fError) console.error(fError);
  else console.log(featured);
}

checkData();
