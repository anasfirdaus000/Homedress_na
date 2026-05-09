import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { orderId } = req.body;
  const apiKey = process.env.BITESHIP_API_KEY;

  try {
    // 1. Get Order Detail
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchErr || !order) throw new Error('Order tidak ditemukan');

    // 2. Prepare Biteship Payload
    // Note: order.shipping_address should be a JSON or string containing destination data
    const addr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address;
    
    // We need the origin area ID from site_settings
    const { data: setting } = await supabase.from('site_settings').select('value').eq('key', 'shipping_origin_data').single();
    const origin = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;

    const payload = {
      shipper_contact_name: "HOMEDRESS_NA Admin",
      shipper_contact_phone: process.env.ADMIN_WHATSAPP_NUMBER || "628123456789",
      origin_contact_name: "HOMEDRESS_NA Store",
      origin_contact_phone: process.env.ADMIN_WHATSAPP_NUMBER || "628123456789",
      origin_address: "Store Location", // You can refine this
      origin_area_id: origin.id,
      destination_contact_name: order.customer_name,
      destination_contact_phone: order.customer_phone,
      destination_address: addr.address,
      destination_area_id: addr.area_id,
      courier_company: order.courier_code || 'jne',
      courier_type: order.courier_service || 'reg',
      delivery_type: "now",
      items: order.items.map(i => ({
        name: i.name,
        description: `Size: ${i.size}`,
        value: i.price,
        weight: i.weight || 300,
        quantity: i.qty
      }))
    };

    // 3. Call Biteship Order API
    const bitRes = await fetch('https://api.biteship.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const bitData = await bitRes.json();

    if (!bitRes.ok) {
      throw new Error(bitData.error || 'Gagal membuat pengiriman di Biteship');
    }

    // 4. Save Waybill/Resi to Database
    const trackingNumber = bitData.courier?.waybill_id || bitData.id;
    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        tracking_number: trackingNumber,
        status: 'shipped',
        shipping_status: 'allocated'
      })
      .eq('id', orderId);

    if (updateErr) throw updateErr;

    return res.status(200).json({ 
      success: true, 
      tracking_number: trackingNumber,
      message: 'Pengiriman berhasil dibuat dan resi telah diterbitkan.' 
    });

  } catch (err) {
    console.error('Shipment Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
