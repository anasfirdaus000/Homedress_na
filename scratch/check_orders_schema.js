import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://owajvfwhhdhvhrwjbkmd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93YWp2ZndoaGRodmhyd2pia21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NTIzODQsImV4cCI6MjA5MzQyODM4NH0.1VTziUISWA69HlhPCRnPZ2mWQmJIcVAGlMdoF3T0nO4'
);

async function checkSchema() {
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  if (error) {
    console.error('Error fetching orders:', error);
    return;
  }
  if (data && data.length > 0) {
    console.log('Columns in orders table:', Object.keys(data[0]));
  } else {
    console.log('No orders found to determine schema.');
    // Try to get column information differently if possible, or just assume we need to add them
    const { data: cols } = await supabase.rpc('get_column_names', { table_name: 'orders' });
    console.log('Column names via RPC:', cols);
  }
}

checkSchema();
