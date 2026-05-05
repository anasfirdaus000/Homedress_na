/**
 * Public Products API
 * GET /api/products — List all ACTIVE products
 */
import { supabaseAdmin } from './_lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { slug } = req.query || {};

    try {
      if (slug) {
        // Fetch single product by slug
        const { data: product, error } = await supabaseAdmin
          .from('products')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (error) throw error;
        return res.status(200).json({ product });
      }

      // Default: List all active products
      const { data: products, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ products: products || [] });
    } catch (error) {
      console.error('Products API error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
