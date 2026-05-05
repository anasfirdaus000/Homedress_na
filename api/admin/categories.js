/**
 * Admin Categories API
 * GET    /api/admin/categories - List all categories
 * POST   /api/admin/categories - Create/Update category
 * DELETE /api/admin/categories - Delete category
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

  // GET: List all categories
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true })
      .order('name', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ categories: data || [] });
  }

  // POST: Create or Update category
  if (req.method === 'POST') {
    const { id, name, slug, type, image_url, is_featured, order_index } = req.body;
    
    if (!name || !slug) return res.status(400).json({ error: 'Name and Slug are required' });

    const payload = { 
      name, 
      slug: slug.toLowerCase().trim(), 
      type: type || 'catalog',
      image_url, 
      is_featured: !!is_featured,
      order_index: parseInt(order_index) || 0
    };

    let result;
    if (id) {
      result = await supabaseAdmin
        .from('categories')
        .update(payload)
        .eq('id', id)
        .select();
    } else {
      result = await supabaseAdmin
        .from('categories')
        .insert([payload])
        .select();
    }

    if (result.error) return res.status(500).json({ error: result.error.message });
    return res.status(200).json({ category: result.data[0] });
  }

  // DELETE: Delete category
  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
