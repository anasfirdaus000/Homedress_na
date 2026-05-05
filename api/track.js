/**
 * POST /api/track
 * 
 * Customer order tracking:
 * - Input: order_number + customer_phone
 * - Returns: order status + items (no sensitive admin data)
 */
import { supabaseAdmin } from './_lib/supabase.js';

const STATUS_LABELS = {
  pending: { label: 'Menunggu Pembayaran', icon: '⏳', step: 1 },
  confirmed: { label: 'Pembayaran Dikonfirmasi', icon: '✅', step: 2 },
  processing: { label: 'Sedang Diproses', icon: '📦', step: 3 },
  shipped: { label: 'Dalam Pengiriman', icon: '🚚', step: 4 },
  completed: { label: 'Pesanan Selesai', icon: '🎉', step: 5 },
  cancelled: { label: 'Dibatalkan', icon: '❌', step: -1 }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { order_number, customer_phone } = req.body || {};

  if (!order_number || !customer_phone) {
    return res.status(400).json({ error: 'Nomor order dan nomor HP wajib diisi' });
  }

  // Sanitize phone
  const phone = customer_phone.replace(/[\s\-()]/g, '');

  try {
    // Find order by number + phone (double verification)
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, customer_name, status, subtotal, shipping_cost, total, payment_method, created_at, payment_qr_string, payment_va_number, payment_expiry')
      .eq('order_number', order_number.toUpperCase().trim())
      .eq('customer_phone', phone)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan. Pastikan nomor order dan nomor HP sudah benar.' });
    }

    // Get order items
    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('product_name, product_image, size, quantity, price_at_time')
      .eq('order_id', order.id);

    const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.pending;

    return res.status(200).json({
      success: true,
      order: {
        order_number: order.order_number,
        customer_name: order.customer_name,
        status: order.status,
        status_label: statusInfo.label,
        status_icon: statusInfo.icon,
        status_step: statusInfo.step,
        subtotal: order.subtotal,
        shipping_cost: order.shipping_cost,
        total: order.total,
        payment_method: order.payment_method,
        created_at: order.created_at,
        payment_qr: order.payment_qr_string,
        payment_va: order.payment_va_number,
        payment_expiry: order.payment_expiry,
        items: items || []
      }
    });

  } catch (err) {
    console.error('Track error:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan. Coba lagi nanti.' });
  }
}
