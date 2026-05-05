/**
 * Admin Menus API
 */
import { supabaseAdmin } from '../../_lib/supabase.js';
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

  // GET: List all menus
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('menus')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ menus: data || [] });
  }

  // POST: Create or Update menu
  if (req.method === 'POST') {
    const { id, label, parent_id, category_slug, custom_url, menu_group, order_index } = req.body;
    
    if (!label || !menu_group) return res.status(400).json({ error: 'Label and Menu Group are required' });

    const payload = { 
      label, 
      parent_id: parent_id || null, 
      category_slug: category_slug || null,
      custom_url: custom_url || null,
      menu_group,
      order_index: parseInt(order_index) || 0
    };

    let result;
    if (id) {
      result = await supabaseAdmin.from('menus').update(payload).eq('id', id).select();
    } else {
      result = await supabaseAdmin.from('menus').insert([payload]).select();
    }

    if (result.error) return res.status(500).json({ error: result.error.message });
    return res.status(200).json({ menu: result.data[0] });
  }

  // DELETE: Delete menu
  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID is required' });
    const { error } = await supabaseAdmin.from('menus').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
