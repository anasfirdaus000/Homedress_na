/**
 * Louvin Webhook Handler
 * Updates order status based on payment notification
 */
import { supabaseAdmin } from '../../_lib/supabase.js';

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
    if (!data || !data.order_id) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // 1. Update Order Status
    let newStatus = null;
    if (event === 'payment.settled') {
      newStatus = 'confirmed'; // Payment received
    } else if (event === 'payment.failed') {
      newStatus = 'cancelled'; // Payment expired or failed
    }

    if (newStatus) {
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString() 
        })
        .eq('order_number', data.order_id);

      if (updateError) throw new Error('Failed to update order status: ' + updateError.message);
      
      console.log(`[Louvin Webhook] Order ${data.order_id} updated to ${newStatus}`);

      // 2. Notify Customer if settled
      if (event === 'payment.settled') {
        // We can fetch user email from orders if needed, or just use notify lib
        console.log(`[Louvin Webhook] Sending confirmation for Order ${data.order_id}`);
        // Logic for sending confirmation email/WA can go here
      }
    }

    // Always return 200 to Louvin
    return res.status(200).json({ success: true, received: true });

  } catch (err) {
    console.error('[Louvin Webhook Error]:', err.message);
    // Even if it fails internally, Louvin expects 200 if the endpoint is reachable
    return res.status(200).json({ success: false, error: err.message });
  }
}
