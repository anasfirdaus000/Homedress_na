// No import needed for fetch in Node.js 18+

const TEST_API_KEY = 'biteship_test.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiZHJlc3MiLCJ1c2VySWQiOiI2OWZlNzU1NjBiNjRjYTU5OTkwZDQ0NjYiLCJpYXQiOjE3NzgzMTkwOTJ9.F_9jPlAXnqvPC7KpIAnaaEikpU3ljnfoK63tzPkyVc4';

async function createTestOrder() {
  console.log('🚀 Sedang membuat Test Order ke Biteship...');

  const payload = {
    shipper_contact_name: "Homedress_na Store",
    shipper_contact_phone: "0895405204744",
    origin_contact_name: "Homedress_na Store",
    origin_contact_phone: "0895405204744",
    origin_address: "Sindangmulih RT.004/004, sukamenak, purbaratu, kota tasikmalaya",
    origin_area_id: "IDNP9IDNC457IDND5794IDZ46196",
    origin_postal_code: "46196",
    
    receiver_contact_name: "Customer Pengetesan",
    receiver_contact_phone: "081234567890",
    destination_contact_name: "Customer Pengetesan",
    destination_contact_phone: "081234567890",
    receiver_address: "Jl. Jenderal Sudirman No. 1, Gambir, Jakarta Pusat",
    destination_address: "Jl. Jenderal Sudirman No. 1, Gambir, Jakarta Pusat",
    destination_area_id: "IDNP6IDNC147IDND829IDZ10110",
    destination_postal_code: "10110",
    
    courier_company: "jne",
    courier_type: "reg",
    delivery_type: "now",
    
    items: [
      {
        name: "Test Product - Aktivasi",
        description: "Size: L",
        value: 100000,
        weight: 500,
        quantity: 1,
        length: 10,
        width: 10,
        height: 10
      }
    ]
  };

  try {
    const response = await fetch('https://api.biteship.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': TEST_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok && data.success !== false) {
      console.log('\n✅ BERHASIL!');
      console.log('-----------------------------------');
      console.log('ORDER ID ANDA:', data.id);
      console.log('-----------------------------------');
      console.log('Gunakan ID di atas untuk mengisi form Aktivasi Order API di Biteship.');
    } else {
      console.log('\n❌ GAGAL!');
      console.log('Pesan Error:', data.error || data.message || JSON.stringify(data));
    }
  } catch (err) {
    console.error('Terjadi kesalahan sistem:', err.message);
  }
}

createTestOrder();
