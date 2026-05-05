/**
 * Search API
 * GET /api/search?q=query
 */
import { supabaseAdmin } from '../_lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { q } = req.query || {};
  if (!q || q.trim().length < 2) {
    return res.status(200).json({ products: [] });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${q}%,description.ilike.%${q}%,slug.ilike.%${q}%`)
      .limit(10);

    if (error) throw error;

    return res.status(200).json({ products: data || [] });
  } catch (error) {
    console.error('Search API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
