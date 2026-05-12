/**
 * Input Validation for Checkout API
 * All validation happens SERVER-SIDE — never trust frontend data
 */

// Indonesian phone number regex (flexible: handles 08xxx, 628xxx, +628xxx)
const PHONE_REGEX = /^(\+?62|0)8\d{8,13}$/;

export function validateCheckoutInput(body) {
  const errors = [];

  // Required fields
  if (!body.customer_name || body.customer_name.trim().length < 2) {
    errors.push('Nama lengkap wajib diisi (min 2 karakter)');
  }

  // Phone validation - clean thoroughly first
  let phone = (body.customer_phone || '').replace(/[\s\-\(\)\+]/g, '');
  // Normalize: convert 08xx to 628xx
  if (phone.startsWith('08')) {
    phone = '62' + phone.substring(1);
  }
  // Remove leading 0 if leftover from +62 → 628...
  if (!phone.startsWith('62') && !phone.startsWith('08')) {
    // Try to salvage: if it starts with 8, prepend 62
    if (phone.startsWith('8')) {
      phone = '62' + phone;
    }
  }

  // After normalization, validate: should be 628xxxxxxxxx (10-15 total digits)
  if (!/^628\d{7,12}$/.test(phone)) {
    errors.push('Nomor HP tidak valid (format: 08xxxxxxxxxx atau 628xxxxxxxxxx)');
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
    errors.push(`Metode pembayaran "${body.payment_method}" tidak valid`);
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
        size: (item.size || 'All Size').trim().substring(0, 20),
        weight: parseInt(item.weight) || 300
      }))
    }
  };
}
