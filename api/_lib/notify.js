/**
 * WhatsApp Notification via Fonnte
 * Server-side only — API key never exposed to frontend
 */
export async function sendWhatsApp(phone, message) {
  const apiKey = process.env.FONNTE_API_KEY;
  if (!apiKey) {
    console.error('FONNTE_API_KEY not set');
    return { success: false, error: 'API key not configured' };
  }

  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: phone,
        message: message,
        countryCode: '62'
      })
    });

    const result = await response.json();

    if (result.status === true || result.detail === 'sent') {
      return { success: true };
    } else {
      return { success: false, error: result.reason || result.detail || 'Unknown error' };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Format order notification for Admin
 */
export function formatAdminNotification(order, items) {
  const itemList = items.map(i => `- ${i.product_name} (${i.size || 'N/A'}) x${i.quantity} = Rp ${(i.price_at_time * i.quantity).toLocaleString('id-ID')}`).join('\n');

  return `🛍️ *PESANAN BARU*

No. Order: *${order.order_number}*
Waktu: ${new Date(order.created_at).toLocaleString('id-ID')}

*Data Customer:*
Nama: ${order.customer_name}
HP: ${order.customer_phone}
${order.customer_email ? `Email: ${order.customer_email}` : ''}

*Alamat:*
${order.shipping_address}
${order.city ? `${order.city}, ` : ''}${order.province || ''}
${order.postal_code ? `Kode Pos: ${order.postal_code}` : ''}

*Detail Pesanan:*
${itemList}

Subtotal: Rp ${order.subtotal.toLocaleString('id-ID')}
Ongkir: Rp ${order.shipping_cost.toLocaleString('id-ID')}
*TOTAL: Rp ${order.total.toLocaleString('id-ID')}*

Bayar: ${order.payment_method.toUpperCase()}
${order.notes ? `\nCatatan: ${order.notes}` : ''}

Mohon segera diproses 🙏`;
}

/**
 * Format order confirmation for Customer
 */
export function formatCustomerNotification(order, items) {
  const itemList = items.map(i => `- ${i.product_name} x${i.quantity}`).join('\n');

  return `Halo kak *${order.customer_name}* 👋

Terima kasih sudah order di *HOMEDRESS_NA*! 🛍️

No. Order: *${order.order_number}*

*Pesanan Kamu:*
${itemList}

*Total: Rp ${order.total.toLocaleString('id-ID')}*

Status: ⏳ Menunggu Pembayaran

Silakan lakukan pembayaran sesuai metode yang dipilih (${order.payment_method}).

Kami akan memproses pesanan kamu setelah pembayaran dikonfirmasi.

Terima kasih! 🙏
_HOMEDRESS_NA — Homewear Premium_`;
}
