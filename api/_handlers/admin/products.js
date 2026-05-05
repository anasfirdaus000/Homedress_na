/**
 * Admin Products API
 * GET    /api/admin/products — List all products
 * POST   /api/admin/products — Create/Update product
 * DELETE /api/admin/products — Delete product
 */
import { supabaseAdmin } from '../../_lib/supabase.js';
import { createClient } from '@supabase/supabase-js';

async function verifyAdmin(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  const { data: { user }, error } = await supabase.auth.getUser(token);
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

  // GET: List all products (including inactive)
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ products: data || [] });
  }

  // POST: Create or Update product
  if (req.method === 'POST') {
    const product = req.body;
    if (!product.name || !product.slug || !product.price) {
      return res.status(400).json({ error: 'name, slug, dan price wajib diisi' });
    }

    // Generate slug if not provided
    if (!product.slug) {
      product.slug = product.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    if (product.id) {
      // Update existing
      const { data, error } = await supabaseAdmin
        .from('products')
        .update({ ...product, updated_at: new Date().toISOString() })
        .eq('id', product.id)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ success: true, product: data });
    } else {
      // Insert new
      const { data, error } = await supabaseAdmin
        .from('products')
        .insert(product)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ success: true, product: data });
    }
  }

  // DELETE: Soft-delete (set is_active = false)
  if (req.method === 'DELETE') {
    const { product_id } = req.body || {};
    if (!product_id) return res.status(400).json({ error: 'product_id wajib diisi' });

    const { error } = await supabaseAdmin
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', product_id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
