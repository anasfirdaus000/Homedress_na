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
    let destinationAddress = '';
    let destinationAreaId = '';

    try {
      const addr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address;
      destinationAddress = (addr && typeof addr === 'object' && addr.address) ? addr.address : order.shipping_address;
      destinationAreaId = (addr && typeof addr === 'object' && addr.area_id) ? addr.area_id : (order.destination_area_id || '');
    } catch (e) {
      destinationAddress = [
        order.shipping_address,
        order.destination_name || order.city,
        order.postal_code
      ].filter(Boolean).join(', ');
      destinationAreaId = order.destination_area_id || '';
    }

    const { data: setting } = await supabase.from('site_settings').select('value').eq('key', 'shipping_origin_data').single();
    const origin = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;

    let courierCompany = 'jne';
    let courierType = 'reg';
    
    if (order.shipping_method_code) {
      const parts = order.shipping_method_code.split('_');
      courierCompany = parts[0] || 'jne';
      courierType = parts.slice(1).join('_') || 'reg';
    } else if (order.shipping_courier_name) {
      const name = order.shipping_courier_name.toLowerCase();
      if (name.includes('j&t') || name.includes('jnt')) courierCompany = 'jnt';
      else if (name.includes('sicepat')) courierCompany = 'sicepat';
      else if (name.includes('anteraja')) courierCompany = 'anteraja';
      else if (name.includes('ninja')) courierCompany = 'ninja';
      else if (name.includes('pos')) courierCompany = 'pos';
      else if (name.includes('tiki')) courierCompany = 'tiki';
      else courierCompany = 'jne';
    }

    const payload = {
      shipper_contact_name: "HOMEDRESS_NA Admin",
      shipper_contact_phone: process.env.ADMIN_WHATSAPP_NUMBER || "62895405204744",
      origin_contact_name: "HOMEDRESS_NA Store",
      origin_contact_phone: process.env.ADMIN_WHATSAPP_NUMBER || "62895405204744",
      origin_address: origin.name || "Store Location",
      origin_area_id: order.origin_area_id || origin.id,
      destination_contact_name: order.customer_name,
      destination_contact_phone: order.customer_phone,
      destination_address: destinationAddress,
      destination_area_id: destinationAreaId,
      courier_company: courierCompany,
      courier_type: courierType,
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
    const biteshipOrderId = bitData.id;

    // 4. Update Database
    await supabase.from('orders').update({
      shipping_tracking_number: trackingNumber,
      tracking_number: biteshipOrderId,
      status: 'shipped',
      shipping_status: 'allocated'
    }).eq('id', orderId);

    return trackingNumber;

  } catch (err) {
    console.error('[Shipment Utils Error]:', err.message);
    throw err;
  }
}
