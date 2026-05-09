/**
 * Input Validation for Checkout API
 * All validation happens SERVER-SIDE — never trust frontend data
 */

// Indonesian phone number regex (08xxx or 628xxx, 10-15 digits)
const PHONE_REGEX = /^(08|628)\d{8,13}$/;

export function validateCheckoutInput(body) {
  const errors = [];

  // Required fields
  if (!body.customer_name || body.customer_name.trim().length < 2) {
    errors.push('Nama lengkap wajib diisi (min 2 karakter)');
  }

  // Phone validation
  const phone = (body.customer_phone || '').replace(/[\s\-()]/g, '');
  if (!PHONE_REGEX.test(phone)) {
    errors.push('Nomor HP tidak valid (format: 08xxxxxxxxxx)');
  }

  // Address
  if (!body.shipping_address || body.shipping_address.trim().length < 10) {
    errors.push('Alamat wajib diisi (min 10 karakter)');
  }

  // Items
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    errors.push('Keranjang belanja kosong');
  } else {
    for (let i = 0; i < body.items.length; i++) {
      const item = body.items[i];
      if (!item.product_id) errors.push(`Item ${i + 1}: product_id wajib diisi`);
      if (!item.quantity || item.quantity < 1 || item.quantity > 100) {
        errors.push(`Item ${i + 1}: quantity harus 1-100`);
      }
    }
  }

  // Payment method
  const validPayments = ['transfer', 'ewallet', 'cod', 'qris', 'bni_va', 'bri_va', 'permata_va', 'gopay', 'shopeepay'];
  if (body.payment_method && !validPayments.includes(body.payment_method)) {
    errors.push('Metode pembayaran tidak valid');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      user_id: body.user_id || null,
      customer_name: (body.customer_name || '').trim().substring(0, 100),
      customer_phone: phone,
      customer_email: (body.customer_email || '').trim().substring(0, 100),
      shipping_address: (body.shipping_address || '').trim().substring(0, 500),
      city: (body.city || '').trim().substring(0, 100),
      postal_code: (body.postal_code || '').trim().substring(0, 10),
      province: (body.province || '').trim().substring(0, 100),
      notes: (body.notes || '').trim().substring(0, 500),
      payment_method: body.payment_method || 'transfer',
      
      // Biteship Fields
      shipping_method: body.shipping_method || '',
      shipping_courier_name: body.shipping_courier_name || '',
      shipping_cost: parseFloat(body.shipping_cost) || 0,
      destination_area_id: body.destination_area_id || '',
      origin_area_id: body.origin_area_id || '',
      origin_name: body.origin_name || '',
      destination_name: body.destination_name || '',

      items: (body.items || []).map(item => ({
        product_id: item.product_id,
        quantity: Math.min(Math.max(parseInt(item.quantity) || 1, 1), 100),
        size: (item.size || '').trim().substring(0, 20),
        weight: parseInt(item.weight) || 300
      }))
    }
  };
}
