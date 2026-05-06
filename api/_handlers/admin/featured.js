/**
 * Admin Featured Sections API
 * GET    /api/admin/featured - Fetch all banners (active and inactive)
 * POST   /api/admin/featured - Create/Update banner
 * DELETE /api/admin/featured - Delete banner
 */
import { supabaseAdmin } from '../../_lib/supabase.js';
import { verifyAdmin } from '../../_lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await verifyAdmin(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // GET: Fetch all
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin.from('featured_sections').select('*').order('order_index', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ featured: data || [] });
  }

  // POST: Upsert
  if (req.method === 'POST') {
    const { id, type, title, subtitle, image_url, video_url, product_slug, order_index, is_active } = req.body;
    if (!type || !title || !product_slug) return res.status(400).json({ error: 'Type, title, and product slug required' });

    const payload = { type, title, subtitle, image_url, video_url, product_slug, is_active, order_index };
    
    let result;
    if (id) {
      result = await supabaseAdmin.from('featured_sections').update(payload).eq('id', id).select();
    } else {
      result = await supabaseAdmin.from('featured_sections').insert([payload]).select();
    }

    if (result.error) return res.status(500).json({ error: result.error.message });
    return res.status(200).json({ featured: result.data[0] });
  }

  // DELETE
  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID required' });

    const { error } = await supabaseAdmin.from('featured_sections').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
