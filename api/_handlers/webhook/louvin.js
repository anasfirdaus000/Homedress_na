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

      // 2. Notify Customer if settled
      if (event === 'payment.settled' || event === 'payment.success') {
        const { data: fullOrder } = await supabaseAdmin
          .from('orders')
          .select('*')
          .eq('order_number', orderRef)
          .single();

        if (fullOrder && fullOrder.customer_phone) {
          const msg = formatPaymentSuccessNotification(fullOrder);
          const result = await sendWhatsApp(fullOrder.customer_phone, msg);
          
          await supabaseAdmin.from('notifications_log').insert({
            order_id: fullOrder.id,
            channel: 'whatsapp',
            provider: 'fonnte',
            recipient: fullOrder.customer_phone,
            status: result.success ? 'sent' : 'failed',
            error_message: result.error || null
          });
          console.log(`[Louvin Webhook] WA notification sent to ${fullOrder.customer_phone}`);
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
