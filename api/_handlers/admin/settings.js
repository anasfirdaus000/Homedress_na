/**
 * Admin Settings API (CMS)
 * GET  /api/admin/settings — Get all site settings
 * POST /api/admin/settings — Update a setting
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET: Public settings (no auth needed for reading)
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('*');
    if (error) return res.status(500).json({ error: error.message });

    // Convert to key-value object
    const settings = {};
    (data || []).forEach(row => { settings[row.key] = row.value; });
    return res.status(200).json({ settings });
  }

  // POST: Update settings (auth required)
  if (req.method === 'POST') {
    const user = await verifyAdmin(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { key, value } = req.body || {};
    if (!key || value === undefined) {
      return res.status(400).json({ error: 'key dan value wajib diisi' });
    }

    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString()
      });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
