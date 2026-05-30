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
      return res.status(400).json({ error: errors.join('. '), details: errors });
    }

    // 3. GET REAL PRICES FROM DATABASE
    // Frontend sends product_id which could be UUID (from DB) or slug (from static pages)
    const productIds = sanitized.items.map(i => i.product_id);
    
    // Try lookup by UUID first, fallback to slug
    const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    const uuids = productIds.filter(isUUID);
    const slugs = productIds.filter(id => !isUUID(id));
    
    let dbProducts = [];
    
    if (uuids.length > 0) {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('id, slug, name, price, images, is_active, stock')
        .in('id', uuids);
      if (error) throw new Error('Gagal mengambil data produk: ' + error.message);
      if (data) dbProducts.push(...data);
    }
    
    if (slugs.length > 0) {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('id, slug, name, price, images, is_active, stock')
        .in('slug', slugs);
      if (error) throw new Error('Gagal mengambil data produk: ' + error.message);
      if (data) dbProducts.push(...data);
    }

    // Check all products exist and are active
    const productMap = {};
    for (const p of dbProducts) {
      productMap[p.id] = p;
      productMap[p.slug] = p; // Also map by slug for easy lookup
    }

    for (const item of sanitized.items) {
      const dbProd = productMap[item.product_id];
      if (!dbProd) {
        return res.status(400).json({ error: `Produk "${item.product_id}" tidak ditemukan di database` });
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

    // 5. STOCK CHECK (using data already fetched above)
    for (const item of sanitized.items) {
      const dbProd = productMap[item.product_id];
      if (dbProd && dbProd.stock !== null && dbProd.stock !== undefined && dbProd.stock < item.quantity) {
        return res.status(400).json({ error: `Maaf, stok "${dbProd.name}" tidak mencukupi (Tersisa: ${dbProd.stock})` });
      }
    }

    // 6. GENERATE ORDER NUMBER
    const { data: orderNumData, error: orderNumError } = await supabaseAdmin
      .rpc('generate_order_number');

    if (orderNumError) throw new Error('Gagal membuat nomor order: ' + orderNumError.message);
    const orderNumber = orderNumData;

    // 6. INSERT ORDER (with fallback if shipping columns don't exist yet)
    const baseOrderData = {
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
      status: 'pending'
    };

    const shippingMetadata = {
      shipping_courier_name: sanitized.shipping_courier_name,
      shipping_method_code: sanitized.shipping_method,
      destination_area_id: sanitized.destination_area_id,
      origin_area_id: sanitized.origin_area_id,
      origin_name: sanitized.origin_name,
      destination_name: sanitized.destination_name
    };

    let newOrder, orderError;

    // Try with shipping metadata first
    ({ data: newOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({ ...baseOrderData, ...shippingMetadata })
      .select()
      .single());

    // If failed (possibly missing columns), try without shipping metadata
    if (orderError && orderError.message?.includes('column')) {
      console.warn('Shipping columns not found, inserting without them:', orderError.message);
      ({ data: newOrder, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert(baseOrderData)
        .select()
        .single());
    }

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

    // 8. SEND NOTIFICATIONS (fire-and-forget, never block checkout response)
    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;

    // Run notifications in background - don't await them
    const notifyPromises = [];

    // Notify Admin
    notifyPromises.push(
      (async () => {
        try {
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
        } catch (e) { console.error('Admin WA notification failed:', e.message); }
      })()
    );

    // Notify Customer
    if (sanitized.customer_phone) {
      notifyPromises.push(
        (async () => {
          try {
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
          } catch (e) { console.error('Customer WA notification failed:', e.message); }
        })()
      );
    }

    // 9. INITIALIZE MAYAR PAYMENT (synchronous for non-COD orders)
    let paymentUrl = null;
    let mayarInvoiceId = null;

    if (process.env.MAYAR_API_KEY && sanitized.payment_method !== 'cod') {
      try {
        const mayarBaseUrl = process.env.MAYAR_IS_PRODUCTION === 'true'
          ? 'https://api.mayar.id'
          : 'https://api.mayar.club';

        const mayarController = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const mayarTimeout = mayarController ? setTimeout(() => mayarController.abort(), 15000) : null;

        // Determine redirect URL based on environment
        const siteUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : (process.env.SITE_URL || 'https://homedressna.com');

        // Build items list for Mayar invoice API
        const mayarItems = orderItemsData.map(item => ({
          quantity: item.quantity,
          rate: item.price_at_time,
          description: `${item.product_name}${item.size ? ` (Size: ${item.size})` : ''}`
        }));

        if (shippingCost > 0) {
          mayarItems.push({
            quantity: 1,
            rate: shippingCost,
            description: `Ongkos Kirim (${sanitized.shipping_courier_name || 'Kurir'})`
          });
        }

        const mayarRes = await fetch(`${mayarBaseUrl}/hl/v1/invoice/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MAYAR_API_KEY}`
          },
          body: JSON.stringify({
            name: sanitized.customer_name,
            email: sanitized.customer_email || 'customer@homedressna.com',
            mobile: sanitized.customer_phone,
            description: `Order ${orderNumber}`,
            redirectUrl: `${siteUrl}/order-confirmation.html?order=${orderNumber}`,
            expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            items: mayarItems
          }),
          ...(mayarController ? { signal: mayarController.signal } : {})
        });

        if (mayarTimeout) clearTimeout(mayarTimeout);

        if (mayarRes.ok) {
          const mayarData = await mayarRes.json();
          console.log('[Mayar] Invoice created:', JSON.stringify(mayarData).substring(0, 300));

          // Extract payment URL and invoice ID from response
          mayarInvoiceId = mayarData?.data?.id || mayarData?.id || null;
          paymentUrl = mayarData?.data?.link || mayarData?.data?.paymentUrl || mayarData?.link || null;

          if (mayarInvoiceId || paymentUrl) {
            // Update order with Mayar payment data
            const updateFields = {};
            if (mayarInvoiceId) updateFields.mayar_invoice_id = mayarInvoiceId;
            if (paymentUrl) updateFields.mayar_payment_url = paymentUrl;

            await supabaseAdmin.from('orders')
              .update(updateFields)
              .eq('id', newOrder.id);
          }
        } else {
          const errData = await mayarRes.text().catch(() => 'Unknown error');
          console.error('[Mayar] Error creating invoice:', mayarRes.status, errData);
        }
      } catch (mayarError) {
        console.error('[Mayar] Connection Error:', mayarError.message);
        // Payment gateway failure is non-critical - order is still created
        // Customer can be redirected to manual payment instructions
      }
    }

    // Fire background notification tasks
    Promise.allSettled(notifyPromises).catch(() => {});

    // 10. RETURN SUCCESS
    return res.status(200).json({
      success: true,
      order: {
        order_number: newOrder.order_number,
        total: newOrder.total,
        status: newOrder.status,
        created_at: newOrder.created_at,
        payment_method: sanitized.payment_method
      },
      payment_url: paymentUrl
    });

  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(500).json({
      error: 'Terjadi kesalahan saat memproses pesanan: ' + err.message,
      fallback_wa: true
    });
  }
}
