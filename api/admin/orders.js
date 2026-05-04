/**
 * Admin Orders API
 * GET  /api/admin/orders — List all orders
 * POST /api/admin/orders — Update order status
 * 
 * Requires Supabase Auth token (admin role)
 */
import { supabaseAdmin } from '../_lib/supabase.js';
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await verifyAdmin(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // GET: List orders
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) return res.status(500).json({ error: error.message });

    // Get notification logs
    const orderIds = (data || []).map(o => o.id);
    const { data: logs } = await supabaseAdmin
      .from('notifications_log')
      .select('*')
      .in('order_id', orderIds);

    // Attach logs to orders
    const ordersWithLogs = (data || []).map(order => ({
      ...order,
      notifications: (logs || []).filter(l => l.order_id === order.id)
    }));

    return res.status(200).json({ orders: ordersWithLogs });
  }

  // POST: Update order status
  if (req.method === 'POST') {
    const { order_id, status } = req.body || {};
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled'];

    if (!order_id || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order_id or status' });
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', order_id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, order: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
