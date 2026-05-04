/**
 * Admin Hero API
 * GET    /api/admin/hero - List all slides
 * POST   /api/admin/hero - Create/Update slide
 * DELETE /api/admin/hero - Delete slide
 */
import { supabaseAdmin } from '../_lib/supabase.js';
import { createClient } from '@supabase/supabase-js';

async function verifyAdmin(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  const tempClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  const { data: { user }, error } = await tempClient.auth.getUser(token);
  
  if (error || !user) return null;
  return user;
}

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
    const { id, title, subtitle, link_url, image_url, video_url, slide_order, is_active } = req.body;
    
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const payload = {
      title,
      subtitle: subtitle || null,
      link_url: link_url || null,
      image_url: image_url || null,
      video_url: video_url || null,
      slide_order: slide_order || 0,
      is_active: is_active !== undefined ? is_active : true,
      updated_at: new Date().toISOString()
    };

    let result;
    if (id) {
      result = await supabaseAdmin.from('hero_slides').update(payload).eq('id', id).select().single();
    } else {
      result = await supabaseAdmin.from('hero_slides').insert([payload]).select().single();
    }

    if (result.error) return res.status(500).json({ error: result.error.message });
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
