/**
 * Mayar.id Webhook Handler
 * Handles payment notifications from Mayar.id payment gateway
 * 
 * Webhook event: payment.received
 * Docs: https://docs.mayar.id
 */
import { supabaseAdmin } from '../../_lib/supabase.js';
import { sendWhatsApp, formatPaymentSuccessNotification } from '../../_lib/notify.js';
import { autoCreateShipment } from '../../_lib/shipment.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body = req.body;
  if (body && typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      console.error('[Mayar Webhook] Failed to parse body string:', e.message);
    }
  }

  const { event, data } = body || {};
  console.log(`[Mayar Webhook] Event: ${event}`, JSON.stringify(data).substring(0, 200));

  try {
    // Mayar sends order reference in the description field ("Order HDN-XXXX")
    // or in custom metadata. We extract the order number.
    const description = data?.description || data?.name || '';
    const orderRefMatch = description.match(/(HDN-[\w-]+)/i);
    const orderRef = orderRefMatch ? orderRefMatch[1] : (data?.reference || data?.id);

    if (!orderRef) {
      console.log('[Mayar Webhook] No order reference found in payload');
      return res.status(200).json({ success: true, message: 'No reference found' });
    }

    console.log(`[Mayar Webhook] Processing order: ${orderRef}`);

    if (event === 'payment.received') {
      // 1. Fetch Order with Items (match by order number OR invoice ID OR payment URL)
      let orConditions = `order_number.eq.${orderRef}`;
      const invoiceId = data?.invoiceId || data?.id;
      if (invoiceId) {
        orConditions += `,mayar_invoice_id.eq.${invoiceId}`;
      }
      const paymentUrl = data?.link || data?.paymentUrl || data?.payment_link;
      if (paymentUrl) {
        orConditions += `,mayar_payment_url.eq.${paymentUrl}`;
      }

      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('*, order_items(*)')
        .or(orConditions)
        .single();

      if (!order) {
        console.error(`[Mayar Webhook] Order not found: ${orderRef} (invoiceId: ${invoiceId})`);
        try {
          await supabaseAdmin.from('notifications_log').insert({
            channel: 'webhook',
            provider: 'mayar',
            recipient: event || 'payment.received',
            status: 'failed',
            error_message: `Order not found for ref ${orderRef} (invoiceId: ${invoiceId}). Payload: ${JSON.stringify(body)}`
          });
        } catch (e) {}
        return res.status(200).json({ success: true, message: 'Order not found' });
      }

      // Log receipt of webhook
      try {
        await supabaseAdmin.from('notifications_log').insert({
          order_id: order.id,
          channel: 'webhook',
          provider: 'mayar',
          recipient: event || 'payment.received',
          status: 'processing',
          error_message: `Processing webhook. Payload: ${JSON.stringify(body)}`
        });
      } catch (e) {}

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
      let shipErrorLog = '';
      try {
        resi = await autoCreateShipment(order.id);
        console.log(`[Biteship] Auto Resi generated: ${resi}`);
      } catch (shipErr) {
        console.error('[Biteship Error] Failed auto-shipment:', shipErr.message);
        shipErrorLog = `Auto-resi failed: ${shipErr.message}`;
      }

      // 4. Update Status to Shipped (if resi success) or Confirmed
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ 
          status: resi ? 'shipped' : 'confirmed',
          updated_at: new Date().toISOString() 
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('[Mayar Webhook] Failed to update order status:', updateError.message);
      }

      // Log success or resi warning
      try {
        await supabaseAdmin.from('notifications_log').insert({
          order_id: order.id,
          channel: 'webhook',
          provider: 'mayar',
          recipient: event || 'payment.received',
          status: updateError ? 'failed' : (resi ? 'sent' : 'warning'),
          error_message: updateError ? `DB Update Error: ${updateError.message}` : (shipErrorLog || 'Webhook processed successfully, status updated to confirmed')
        });
      } catch (e) {}

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
        const adminMsg = `✅ *PEMBAYARAN LUNAS (MAYAR)*\n\nOrder: *${order.order_number}*\nCustomer: *${order.customer_name}*\nTotal: Rp ${order.total?.toLocaleString('id-ID')}\nResi: *${resi || 'GAGAL GENERATE'}*\n\nStok sudah terpotong otomatis.`;
        await sendWhatsApp(adminPhone, adminMsg);
      }

      console.log(`[Mayar Webhook] ✅ Order ${orderRef} processed successfully`);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Mayar Webhook Error]:', err.message);
    try {
      await supabaseAdmin.from('notifications_log').insert({
        channel: 'webhook',
        provider: 'mayar',
        recipient: event || 'error',
        status: 'failed',
        error_message: `General Error: ${err.message}. Body: ${JSON.stringify(body || {})}`
      });
    } catch (e) {}
    // Always return 200 to prevent Mayar from retrying indefinitely
    return res.status(200).json({ success: false, error: err.message });
  }
}
