import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * Automatically creates a shipment in Biteship and updates the database
 */
export async function autoCreateShipment(orderId) {
  const apiKey = process.env.BITESHIP_API_KEY;

  try {
    // 1. Get Order Detail
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (fetchErr || !order) throw new Error('Order tidak ditemukan');
    if (order.tracking_number) return order.tracking_number; // Already has resi

    // 2. Prepare Biteship Payload
    const addr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address;
    const { data: setting } = await supabase.from('site_settings').select('value').eq('key', 'shipping_origin_data').single();
    const origin = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;

    const payload = {
      shipper_contact_name: "HOMEDRESS_NA Admin",
      shipper_contact_phone: process.env.ADMIN_WHATSAPP_NUMBER || "62895405204744",
      origin_contact_name: "HOMEDRESS_NA Store",
      origin_contact_phone: process.env.ADMIN_WHATSAPP_NUMBER || "62895405204744",
      origin_address: "Sindangmulih RT.004/004, sukamenak, purbaratu, kota tasikmalaya",
      origin_area_id: origin.id,
      destination_contact_name: order.customer_name,
      destination_contact_phone: order.customer_phone,
      destination_address: addr.address,
      destination_area_id: addr.area_id,
      courier_company: order.shipping_courier_code || 'jne',
      courier_type: order.shipping_courier_service || 'reg',
      delivery_type: "now",
      items: order.order_items.map(i => ({
        name: i.product_name,
        description: `Size: ${i.size}`,
        value: i.price_at_time,
        weight: i.weight || 300,
        quantity: i.quantity,
        length: 10,
        width: 10,
        height: 10
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
    if (!bitRes.ok) throw new Error(bitData.error || 'Biteship API Error');

    const trackingNumber = bitData.courier?.waybill_id || bitData.id;

    // 4. Update Database
    await supabase.from('orders').update({
      tracking_number: trackingNumber,
      status: 'shipped',
      shipping_status: 'allocated'
    }).eq('id', orderId);

    return trackingNumber;

  } catch (err) {
    console.error('[Shipment Utils Error]:', err.message);
    throw err;
  }
}
