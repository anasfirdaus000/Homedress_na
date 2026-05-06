import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SB_URL = 'https://owajvfwhhdhvhrwjbkmd.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93YWp2ZndoaGRodmhyd2pia21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NTIzODQsImV4cCI6MjA5MzQyODM4NH0.1VTziUISWA69HlhPCRnPZ2mWQmJIcVAGlMdoF3T0nO4';
const supabase = createClient(SB_URL, SB_KEY);

async function checkSettings() {
  const { data, error } = await supabase.from('site_settings').select('key, value').ilike('key', 'editorial%');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Settings:', JSON.stringify(data, null, 2));
  }
}

checkSettings();
