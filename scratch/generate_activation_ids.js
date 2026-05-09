const TEST_API_KEY = 'biteship_test.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiZHJlc3MiLCJ1c2VySWQiOiI2OWZlNzU1NjBiNjRjYTU5OTkwZDQ0NjYiLCJpYXQiOjE3NzgzMTkwOTJ9.F_9jPlAXnqvPC7KpIAnaaEikpU3ljnfoK63tzPkyVc4';

async function createAndFormatOrder(targetStatus) {
  const payload = {
    shipper_contact_name: "Homedress_na Store",
    shipper_contact_phone: "0895405204744",
    origin_contact_name: "Homedress_na Store",
    origin_contact_phone: "0895405204744",
    origin_address: "Sindangmulih RT.004/004, sukamenak, purbaratu, kota tasikmalaya",
    origin_area_id: "IDNP9IDNC457IDND5794IDZ46196",
    origin_postal_code: "46196",
    
    receiver_contact_name: "Customer Test " + targetStatus,
    receiver_contact_phone: "081234567890",
    destination_contact_name: "Customer Test " + targetStatus,
    destination_contact_phone: "081234567890",
    receiver_address: "Jl. Jenderal Sudirman No. 1, Gambir, Jakarta Pusat",
    destination_address: "Jl. Jenderal Sudirman No. 1, Gambir, Jakarta Pusat",
    destination_area_id: "IDNP6IDNC147IDND829IDZ10110",
    destination_postal_code: "10110",
    
    courier_company: "jne",
    courier_type: "reg",
    delivery_type: "now",
    items: [{ 
      name: "Test " + targetStatus, 
      value: 100000, 
      weight: 500, 
      quantity: 1, 
      length: 10, 
      width: 10, 
      height: 10 
    }]
  };

  const res = await fetch('https://api.biteship.com/v1/orders', {
    method: 'POST',
    headers: { 'Authorization': TEST_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  
  if (!res.ok) throw new Error('Gagal buat order: ' + (data.error || JSON.stringify(data)));

  const orderId = data.id;

  if (targetStatus === 'cancelled') {
    await fetch(`https://api.biteship.com/v1/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: { 'Authorization': TEST_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: "Testing Aktivasi" })
    });
  }

  return orderId;
}

async function main() {
  try {
    console.log('⏳ Sedang memproses ID Pesanan "DELIVERED"...');
    const deliveredId = await createAndFormatOrder('delivered');
    
    console.log('⏳ Sedang memproses ID Pesanan "CANCELLED"...');
    const cancelledId = await createAndFormatOrder('cancelled');

    console.log('\n✅ BERHASIL MENDAPATKAN ID!');
    console.log('-------------------------------------------');
    console.log('ID Pesanan DELIVERED: ', deliveredId);
    console.log('ID Pesanan CANCELLED: ', cancelledId);
    console.log('-------------------------------------------');
    console.log('Silakan masukkan kedua ID di atas ke form aktivasi Biteship.');

  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
