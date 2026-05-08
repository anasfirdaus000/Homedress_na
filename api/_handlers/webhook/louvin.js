/**
 * Louvin Webhook Handler
 * Updates order status based on payment notification
 */
import { supabaseAdmin } from '../../_lib/supabase.js';
import { sendWhatsApp, formatPaymentSuccessNotification } from '../../_lib/notify.js';

export default async function handler(req, res) {
  // CORS (Louvin might need it or not, but good to have)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { event, data } = req.body;
  console.log(`[Louvin Webhook] Event: ${event} for Order: ${data?.order_id}`);

  try {
    // Louvin usually sends the order number in 'reference' or 'external_id'
    const orderRef = data?.reference || data?.order_id || data?.external_id;

    if (!orderRef) {
      console.warn('[Louvin Webhook] No order reference found in payload, but acknowledging event.');
      return res.status(200).json({ success: true, message: 'Awaiting reference' });
    }

    // 1. Update Order Status
    let newStatus = null;
    if (event === 'payment.settled' || event === 'payment.success') {
      newStatus = 'confirmed'; // Payment received
    } else if (event === 'payment.failed' || event === 'payment.expired') {
      newStatus = 'cancelled'; // Payment expired or failed
    }

    if (newStatus) {
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString() 
        })
        .eq('order_number', orderRef);

      if (updateError) throw new Error('Failed to update order status: ' + updateError.message);
      
      console.log(`[Louvin Webhook] Order ${orderRef} updated to ${newStatus}`);

        // 2. STOCK REDUCTION & NOTIFICATIONS if settled
      if (event === 'payment.settled' || event === 'payment.success') {
        const { data: fullOrder } = await supabaseAdmin
          .from('orders')
          .select('*, order_items(*)')
          .eq('order_number', orderRef)
          .single();

        if (fullOrder) {
          // --- A. REDUCE STOCK ---
          if (fullOrder.order_items) {
            for (const item of fullOrder.order_items) {
              if (item.product_id) {
                const { data: p } = await supabaseAdmin.from('products').select('stock').eq('id', item.product_id).single();
                if (p && p.stock !== undefined) {
                  const newStock = Math.max(0, p.stock - (item.quantity || 1));
                  await supabaseAdmin.from('products').update({ stock: newStock }).eq('id', item.product_id);
                }
              }
            }
          }

          // --- B. NOTIFY CUSTOMER ---
          if (fullOrder.customer_phone) {
            const msg = formatPaymentSuccessNotification(fullOrder);
            const result = await sendWhatsApp(fullOrder.customer_phone, msg);
            await supabaseAdmin.from('notifications_log').insert({
              order_id: fullOrder.id, channel: 'whatsapp', provider: 'fonnte',
              recipient: fullOrder.customer_phone, status: result.success ? 'sent' : 'failed',
              error_message: result.error || null
            });
          }

          // --- C. NOTIFY ADMIN ---
          const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
          if (adminPhone) {
            const adminMsg = `✅ *PEMBAYARAN DITERIMA*\n\nOrder *${fullOrder.order_number}* oleh *${fullOrder.customer_name}* telah lunas!\nTotal: Rp ${fullOrder.total.toLocaleString('id-ID')}\n\nSilakan segera diproses di Admin Panel.`;
            const adminRes = await sendWhatsApp(adminPhone, adminMsg);
            await supabaseAdmin.from('notifications_log').insert({
              order_id: fullOrder.id, channel: 'whatsapp', provider: 'fonnte',
              recipient: adminPhone, status: adminRes.success ? 'sent' : 'failed',
              error_message: adminRes.error || null
            });
          }
        }
      }
    } else {
      console.log(`[Louvin Webhook] Event ${event} ignored (not a final status).`);
    }

    // Always return 200 to Louvin
    return res.status(200).json({ success: true, received: true });

  } catch (err) {
    console.error('[Louvin Webhook Error]:', err.message);
    // Even if it fails internally, Louvin expects 200 if the endpoint is reachable
    return res.status(200).json({ success: false, error: err.message });
  }
}
