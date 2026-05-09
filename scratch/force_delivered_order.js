const TEST_API_KEY = 'biteship_test.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiZHJlc3MiLCJ1c2VySWQiOiI2OWZlNzU1NjBiNjRjYTU5OTkwZDQ0NjYiLCJpYXQiOjE3NzgzMTkwOTJ9.F_9jPlAXnqvPC7KpIAnaaEikpU3ljnfoK63tzPkyVc4';

async function createDeliveredOrder() {
  console.log('🚀 Membuat pesanan baru...');
  
  const payload = {
    shipper_contact_name: "Homedress_na Store",
    shipper_contact_phone: "0895405204744",
    origin_contact_name: "Homedress_na Store",
    origin_contact_phone: "0895405204744",
    origin_address: "Sindangmulih RT.004/004, sukamenak, purbaratu, kota tasikmalaya",
    origin_area_id: "IDNP9IDNC457IDND5794IDZ46196",
    origin_postal_code: "46196",
    receiver_contact_name: "Customer Test Delivered",
    receiver_contact_phone: "081234567890",
    destination_contact_name: "Customer Test Delivered",
    destination_contact_phone: "081234567890",
    receiver_address: "Jl. Jenderal Sudirman No. 1, Gambir, Jakarta Pusat",
    destination_address: "Jl. Jenderal Sudirman No. 1, Gambir, Jakarta Pusat",
    destination_area_id: "IDNP6IDNC147IDND829IDZ10110",
    destination_postal_code: "10110",
    courier_company: "jne",
    courier_type: "reg",
    delivery_type: "now",
    items: [{ name: "Test Delivered", value: 100000, weight: 500, quantity: 1, length: 10, width: 10, height: 10 }]
  };

  const res = await fetch('https://api.biteship.com/v1/orders', {
    method: 'POST',
    headers: { 'Authorization': TEST_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Gagal buat order: ' + JSON.stringify(data));

  const orderId = data.id;
  console.log('✅ Order dibuat: ' + orderId);

  // SIMULATE STATUS SEQUENCE
  // Biteship Test Mode sometimes allows direct status injection via a hidden internal endpoint
  // Or by using the "Simulator" features.
  
  console.log('⏳ Mencoba simulasi status "delivered" melalui update...');
  
  // Try to use the update endpoint with 'delivered'
  // Some versions of Biteship test API accept this if passed in a specific way
  const updateRes = await fetch(`https://api.biteship.com/v1/orders/${orderId}`, {
    method: 'POST',
    headers: { 'Authorization': TEST_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: "delivered"
    })
  });
  
  const updateData = await updateRes.json();
  
  if (updateRes.ok || updateData.status === 'delivered') {
    console.log('✨ BERHASIL! Status sekarang: Delivered');
    console.log('\nID PESANAN DELIVERED: ', orderId);
  } else {
    console.log('❌ Gagal via API. Gunakan cara manual di Dashboard Biteship.');
    console.log('\nLangkah Manual:');
    console.log('1. Buka Dashboard Biteship (Test Mode).');
    console.log('2. Cari Pesanan ID: ' + orderId);
    console.log('3. Klik tombol "Simulate Delivered" atau ubah statusnya secara manual di sana.');
    console.log('4. Setelah statusnya berubah jadi "delivered", masukkan ID ini ke form aktivasi.');
    console.log('\nID YANG BARU DIBUAT: ', orderId);
  }
}

createDeliveredOrder();
