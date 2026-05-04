/**
 * Public Hero API
 * GET /api/hero — List all ACTIVE hero slides
 */
import { supabaseAdmin } from './_lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const { data: slides, error } = await supabaseAdmin
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('slide_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({ slides: slides || [] });
    } catch (error) {
      console.error('Hero API error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
