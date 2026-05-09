/**
 * Louvin Webhook Handler
 * Updates order status based on payment notification
 */
import { supabaseAdmin } from '../../_lib/supabase.js';
import { sendWhatsApp, formatPaymentSuccessNotification } from '../../_lib/notify.js';

import { supabaseAdmin } from '../../_lib/supabase.js';
import { sendWhatsApp, formatPaymentSuccessNotification } from '../../_lib/notify.js';
import { autoCreateShipment } from '../../_lib/shipment.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { event, data } = req.body;
  console.log(`[Louvin Webhook] Event: ${event} for Order: ${data?.reference || data?.order_id}`);

  try {
    const orderRef = data?.reference || data?.order_id || data?.external_id;
    if (!orderRef) return res.status(200).json({ success: true, message: 'No reference' });

    if (event === 'payment.settled' || event === 'payment.success') {
      // 1. Fetch Order with Items
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('*, order_items(*)')
        .eq('order_number', orderRef)
        .single();

      if (!order) throw new Error('Order not found');
      if (order.status === 'shipped' || order.status === 'completed') {
        return res.status(200).json({ success: true, message: 'Already processed' });
      }

      // 2. Reduce Stock
      if (order.order_items) {
        for (const item of order.order_items) {
          const { data: p } = await supabaseAdmin.from('products').select('stock').eq('id', item.product_id).single();
          if (p && p.stock !== undefined) {
            const newStock = Math.max(0, p.stock - (item.quantity || 1));
            await supabaseAdmin.from('products').update({ stock: newStock }).eq('id', item.product_id);
            console.log(`[Stock] Reduced stock for ${item.product_name} to ${newStock}`);
          }
        }
      }

      // 3. Generate Auto Resi (Biteship)
      let resi = null;
      try {
        resi = await autoCreateShipment(order.id);
        console.log(`[Biteship] Auto Resi generated: ${resi}`);
      } catch (shipErr) {
        console.error('[Biteship Error] Failed auto-shipment:', shipErr.message);
        // We still continue to notify the user even if resi fails (they paid anyway)
      }

      // 4. Update Status to Shipped (if resi success) or Confirmed
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ 
          status: resi ? 'shipped' : 'confirmed',
          updated_at: new Date().toISOString() 
        })
        .eq('id', order.id);

      // 5. Notify Customer via WhatsApp
      if (order.customer_phone) {
        let msg = formatPaymentSuccessNotification(order);
        if (resi) {
          msg += `\n\n🚚 *INFO PENGIRIMAN*\nNomor Resi: *${resi}*\nStatus: Paket sedang disiapkan untuk kurir.\n\nAnda bisa melacak paket langsung di menu 'Akun Saya' pada website kami.`;
        }
        await sendWhatsApp(order.customer_phone, msg);
      }

      // 6. Notify Admin
      const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
      if (adminPhone) {
        const adminMsg = `✅ *PEMBAYARAN LUNAS & AUTO-RESI*\n\nOrder: *${order.order_number}*\nCustomer: *${order.customer_name}*\nResi: *${resi || 'GAGAL GENERATE'}*\n\nStok sudah terpotong otomatis.`;
        await sendWhatsApp(adminPhone, adminMsg);
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Louvin Webhook Error]:', err.message);
    return res.status(200).json({ success: false, error: err.message });
  }
}
