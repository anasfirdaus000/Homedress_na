import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { orderId } = req.body;
  const apiKey = process.env.BITESHIP_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'BITESHIP_API_KEY belum dikonfigurasi di environment variables.' });
  }

  try {
    // 1. Get Order Detail with order_items
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (fetchErr || !order) throw new Error('Order tidak ditemukan: ' + (fetchErr?.message || 'null'));

    // 2. Get Origin from site_settings
    const { data: setting } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'shipping_origin_data')
      .single();
    
    if (!setting?.value) throw new Error('Konfigurasi asal pengiriman belum diatur. Buka Admin > Pengaturan Web.');
    const origin = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;

    // 3. Build shipping address string
    // shipping_address is plain text (NOT JSON) from the checkout form
    const destinationAddress = [
      order.shipping_address,
      order.destination_name || order.city,
      order.postal_code
    ].filter(Boolean).join(', ');

    // 4. Parse courier info from shipping_method_code (format: "courier_service" e.g. "jnt_ez")
    let courierCompany = 'jne';
    let courierType = 'reg';
    
    if (order.shipping_method_code) {
      const parts = order.shipping_method_code.split('_');
      courierCompany = parts[0] || 'jne';
      courierType = parts.slice(1).join('_') || 'reg';
    } else if (order.shipping_courier_name) {
      // Fallback: try to derive from courier name
      const name = order.shipping_courier_name.toLowerCase();
      if (name.includes('j&t') || name.includes('jnt')) courierCompany = 'jnt';
      else if (name.includes('sicepat')) courierCompany = 'sicepat';
      else if (name.includes('anteraja')) courierCompany = 'anteraja';
      else if (name.includes('ninja')) courierCompany = 'ninja';
      else if (name.includes('pos')) courierCompany = 'pos';
      else if (name.includes('tiki')) courierCompany = 'tiki';
      else courierCompany = 'jne';
    }

    // 5. Build items from order_items (joined from DB)
    const items = (order.order_items || []).map(i => ({
      name: i.product_name || 'Produk',
      description: `Size: ${i.size || 'All Size'}`,
      value: i.price_at_time || 0,
      weight: 300, // Default weight per item
      quantity: i.quantity || 1
    }));

    if (items.length === 0) throw new Error('Order tidak memiliki item produk.');

    // 6. Prepare Biteship Payload
    const payload = {
      shipper_contact_name: "HOMEDRESS_NA",
      shipper_contact_phone: process.env.ADMIN_WHATSAPP_NUMBER || "6285216854492",
      origin_contact_name: "HOMEDRESS_NA Store",
      origin_contact_phone: process.env.ADMIN_WHATSAPP_NUMBER || "6285216854492",
      origin_address: origin.name || "Store Location",
      origin_area_id: order.origin_area_id || origin.id,
      destination_contact_name: order.customer_name,
      destination_contact_phone: order.customer_phone,
      destination_address: destinationAddress,
      destination_area_id: order.destination_area_id || '',
      courier_company: courierCompany,
      courier_type: courierType,
      delivery_type: "now",
      order_note: order.notes || '',
      items: items
    };

    console.log('Biteship Payload:', JSON.stringify(payload, null, 2));

    // 7. Call Biteship Order API
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
      console.error('Biteship Error:', JSON.stringify(bitData));
      const errorMsg = bitData.error || bitData.message || bitData.errors?.[0]?.message || 'Gagal membuat pengiriman di Biteship';
      throw new Error(errorMsg);
    }

    // 8. Save Waybill/Resi to Database
    const trackingNumber = bitData.courier?.waybill_id || bitData.id || '';
    const biteshipOrderId = bitData.id || '';

    const updateData = {
      status: 'shipped',
      updated_at: new Date().toISOString()
    };

    // Only add columns that exist (safe approach)
    if (trackingNumber) updateData.shipping_tracking_number = trackingNumber;
    
    // Try updating with tracking_number column name as well (backwards compat)
    const { error: updateErr } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (updateErr) {
      console.warn('Order update warning:', updateErr.message);
      // Try minimal update
      await supabase.from('orders')
        .update({ status: 'shipped', updated_at: new Date().toISOString() })
        .eq('id', orderId);
    }

    return res.status(200).json({ 
      success: true, 
      tracking_number: trackingNumber,
      biteship_order_id: biteshipOrderId,
      courier: bitData.courier || {},
      message: 'Pengiriman berhasil dibuat dan resi telah diterbitkan.' 
    });

  } catch (err) {
    console.error('Shipment Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
