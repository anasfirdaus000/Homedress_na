/**
 * Admin Hero API
 * GET    /api/admin/hero - List all slides
 * POST   /api/admin/hero - Create/Update slide
 * DELETE /api/admin/hero - Delete slide
 */
import { supabaseAdmin } from '../../_lib/supabase.js';
import { verifyAdmin } from '../../_lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await verifyAdmin(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // GET: List all slides
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('hero_slides')
      .select('*')
      .order('slide_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ slides: data || [] });
  }

  // POST: Create or Update slide
  if (req.method === 'POST') {
    const { id, title, subtitle, link_url, image_url, video_url, slide_order, is_active, object_position } = req.body;
    
    if (!title) return res.status(400).json({ error: 'Title is required' });

    // Build clean payload — empty strings become null
    const payload = {
      title: title.trim(),
      subtitle: subtitle?.trim() || null,
      link_url: link_url?.trim() || null,
      image_url: image_url?.trim() || null,
      video_url: video_url?.trim() || null,
      slide_order: parseInt(slide_order) || 0,
      is_active: is_active !== undefined ? is_active : true,
      object_position: object_position?.trim() || 'center',
      updated_at: new Date().toISOString()
    };

    let result;
    if (id) {
      // UPDATE: use the sanitized payload, NOT raw req.body
      result = await supabaseAdmin.from('hero_slides').update(payload).eq('id', id).select().single();
    } else {
      // INSERT
      result = await supabaseAdmin.from('hero_slides').insert([payload]).select().single();
    }

    if (result.error) {
      console.error('Hero Save Error:', result.error);
      return res.status(500).json({ error: result.error.message });
    }
    return res.status(200).json({ slide: result.data });
  }

  // DELETE: "Soft delete" or deactivate a slide
  if (req.method === 'DELETE') {
    const { slide_id } = req.body;
    if (!slide_id) return res.status(400).json({ error: 'slide_id is required' });

    // Actually delete or just mark inactive? We'll just delete.
    const { error } = await supabaseAdmin.from('hero_slides').delete().eq('id', slide_id);
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
