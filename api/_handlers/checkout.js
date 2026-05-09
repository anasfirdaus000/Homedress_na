/**
 * POST /api/checkout
 * 
 * Secure checkout endpoint:
 * 1. Rate limit check
 * 2. Validate & sanitize input
 * 3. Get REAL prices from database (ignore frontend prices)
 * 4. Calculate totals server-side
 * 5. Insert order + order_items
 * 6. Send WA notifications + log result
 * 7. Return order confirmation
 */
import { supabaseAdmin } from '../_lib/supabase.js';
import { rateLimit } from '../_lib/rate-limit.js';
import { validateCheckoutInput } from '../_lib/validate.js';
import { sendWhatsApp, formatAdminNotification, formatCustomerNotification } from '../_lib/notify.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 1. RATE LIMIT
  const { allowed, remaining } = rateLimit(req);
  res.setHeader('X-RateLimit-Remaining', remaining);
  if (!allowed) {
    return res.status(429).json({
      error: 'Terlalu banyak request. Coba lagi dalam 10 menit.',
      fallback_wa: true
    });
  }

  try {
    // 2. VALIDATE INPUT
    const { valid, errors, sanitized } = validateCheckoutInput(req.body);
    if (!valid) {
      return res.status(400).json({ error: 'Validasi gagal', details: errors });
    }

    // 3. GET REAL PRICES FROM DATABASE
    const productIds = sanitized.items.map(i => i.product_id); // frontend sends UUID as product_id
    const { data: dbProducts, error: prodError } = await supabaseAdmin
      .from('products')
      .select('id, slug, name, price, images, is_active')
      .in('id', productIds);

    if (prodError) throw new Error('Gagal mengambil data produk: ' + prodError.message);

    // Check all products exist and are active
    const productMap = {};
    for (const p of (dbProducts || [])) {
      productMap[p.id] = p; // Map by id
    }

    for (const item of sanitized.items) {
      const dbProd = productMap[item.product_id];
      if (!dbProd) {
        return res.status(400).json({ error: `Produk "${item.product_id}" tidak ditemukan` });
      }
      if (!dbProd.is_active) {
        return res.status(400).json({ error: `Produk "${dbProd.name}" sedang tidak tersedia` });
      }
    }

    // 4. CALCULATE TOTALS SERVER-SIDE (ignore any price from frontend!)
    let subtotal = 0;
    const orderItemsData = sanitized.items.map(item => {
      const dbProd = productMap[item.product_id];
      const lineTotal = dbProd.price * item.quantity;
      subtotal += lineTotal;
      return {
        product_id: dbProd.id, // Use actual DB UUID
        product_name: dbProd.name,
        product_image: dbProd.images?.[0] || null,
        size: item.size,
        quantity: item.quantity,
        price_at_time: dbProd.price
      };
    });

    // 5. SHIPPING COST (From Biteship)
    const shippingCost = sanitized.shipping_cost || 0;
    const total = subtotal + shippingCost;

    // 5. STOCK CHECK
    const { data: stockCheck } = await supabaseAdmin
      .from('products')
      .select('id, name, stock')
      .in('id', productIds);
    
    for (const item of sanitized.items) {
      const dbProd = (stockCheck || []).find(p => p.id === productMap[item.product_id]?.id);
      if (dbProd && dbProd.stock < item.quantity) {
        return res.status(400).json({ error: `Maaf, stok "${dbProd.name}" tidak mencukupi (Tersisa: ${dbProd.stock})` });
      }
    }

    // 6. GENERATE ORDER NUMBER
    const { data: orderNumData, error: orderNumError } = await supabaseAdmin
      .rpc('generate_order_number');

    if (orderNumError) throw new Error('Gagal membuat nomor order: ' + orderNumError.message);
    const orderNumber = orderNumData;

    // 6. INSERT ORDER
    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: sanitized.user_id,
        order_number: orderNumber,
        customer_name: sanitized.customer_name,
        customer_phone: sanitized.customer_phone,
        customer_email: sanitized.customer_email,
        shipping_address: sanitized.shipping_address,
        city: sanitized.city,
        postal_code: sanitized.postal_code,
        province: sanitized.province,
        notes: sanitized.notes,
        payment_method: sanitized.payment_method,
        subtotal,
        shipping_cost: shippingCost,
        total,
        status: 'pending',
        
        // Shipping Metadata (Biteship)
        shipping_courier_name: sanitized.shipping_courier_name,
        shipping_method_code: sanitized.shipping_method,
        destination_area_id: sanitized.destination_area_id,
        origin_area_id: sanitized.origin_area_id,
        origin_name: sanitized.origin_name,
        destination_name: sanitized.destination_name
      })
      .select()
      .single();

    if (orderError) throw new Error('Gagal menyimpan order: ' + orderError.message);

    // 7. INSERT ORDER ITEMS
    const itemsWithOrderId = orderItemsData.map(item => ({
      ...item,
      order_id: newOrder.id
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsError) throw new Error('Gagal menyimpan detail order: ' + itemsError.message);

    // 8. SEND NOTIFICATIONS (non-blocking, failures are logged)
    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;

    // Notify Admin
    const adminMsg = formatAdminNotification(newOrder, orderItemsData);
    const adminResult = await sendWhatsApp(adminPhone, adminMsg);
    await supabaseAdmin.from('notifications_log').insert({
      order_id: newOrder.id,
      channel: 'whatsapp',
      provider: 'fonnte',
      recipient: adminPhone,
      status: adminResult.success ? 'sent' : 'failed',
      error_message: adminResult.error || null
    });

    // Notify Customer
    if (sanitized.customer_phone) {
      const custMsg = formatCustomerNotification(newOrder, orderItemsData);
      const custResult = await sendWhatsApp(sanitized.customer_phone, custMsg);
      await supabaseAdmin.from('notifications_log').insert({
        order_id: newOrder.id,
        channel: 'whatsapp',
        provider: 'fonnte',
        recipient: sanitized.customer_phone,
        status: custResult.success ? 'sent' : 'failed',
        error_message: custResult.error || null
      });
    }

    // 9. INITIALIZE LOUVIN TRANSACTION (Automatic Payment)
    let louvinData = null;

    if (process.env.LOUVIN_API_KEY && sanitized.payment_method !== 'cod') {
      try {
        const louvinRes = await fetch('https://api.louvin.dev/create-transaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.LOUVIN_API_KEY
          },
          body: JSON.stringify({
            amount: total,
            payment_type: sanitized.payment_method,
            customer_name: sanitized.customer_name,
            customer_email: sanitized.customer_email || 'customer@homedressna.com',
            description: `Order ${orderNumber}`,
            reference: orderNumber
          })
        });

        if (louvinRes.ok) {
          louvinData = await louvinRes.json();
          
          if (louvinData.success) {
            // Update order with Louvin details
            await supabaseAdmin.from('orders')
              .update({ 
                louvin_transaction_id: louvinData.transaction.id,
                payment_qr_string: louvinData.payment.qr_string || null,
                payment_va_number: louvinData.payment.va_number || null,
                payment_expiry: louvinData.payment.expired_at || null,
                status: 'pending' // ensure status is pending
              })
              .eq('id', newOrder.id);
          }
        } else {
          const errData = await louvinRes.json();
          console.error('Louvin Error Details:', errData);
        }
      } catch (louError) {
        console.error('Louvin Connection Error:', louError);
      }
    }

    // 10. RETURN SUCCESS
    return res.status(200).json({
      success: true,
      order: {
        order_number: newOrder.order_number,
        total: newOrder.total,
        status: newOrder.status,
        created_at: newOrder.created_at,
        payment_method: sanitized.payment_method,
        louvin: louvinData ? {
          transaction_id: louvinData.transaction.id,
          qr_string: louvinData.payment.qr_string,
          va_number: louvinData.payment.va_number,
          total_payment: louvinData.payment.total_payment,
          expired_at: louvinData.payment.expired_at
        } : null
      }
    });

  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(500).json({
      error: 'Terjadi kesalahan saat memproses pesanan: ' + err.message,
      details: err.stack,
      fallback_wa: true
    });
  }
}
