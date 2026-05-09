/**
 * Biteship Shipping Rates API
 * POST /api/shipping/rates
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { origin_area_id, destination_area_id, items } = req.body;

  if (!origin_area_id || !destination_area_id || !items) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const apiKey = process.env.BITESHIP_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Biteship API Key not configured' });
  }

  try {
    // Ensure items have correct types for Biteship
    const cleansedItems = items.map(item => ({
      name: item.name || 'Produk',
      value: parseInt(item.value) || 0,
      weight: parseInt(item.weight) || 300,
      quantity: parseInt(item.quantity) || 1
    }));

    const response = await fetch('https://api.biteship.com/v1/rates/couriers', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        origin_area_id,
        destination_area_id,
        couriers: 'jne,jnt,sicepat',
        items: cleansedItems
      })
    });

    const data = await response.json();

    if (!data.success) {
      return res.status(400).json({ error: data.error || 'Failed to fetch rates' });
    }

    // Return the pricing options
    return res.status(200).json({ pricings: data.pricing || [] });
  } catch (err) {
    console.error('Biteship Rates Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
