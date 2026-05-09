/**
 * Biteship Area Search API
 * GET /api/shipping/areas?input=...
 */
export default async function handler(req, res) {
  const { input } = req.query;
  if (!input || input.length < 3) {
    return res.status(400).json({ areas: [] });
  }

  const apiKey = process.env.BITESHIP_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Biteship API Key not configured' });
  }

  try {
    const response = await fetch(`https://api.biteship.com/v1/maps/areas?countries=id&input=${encodeURIComponent(input)}&type=single`, {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    // Biteship returns { success: true, areas: [...] }
    return res.status(200).json({ areas: data.areas || [] });
  } catch (err) {
    console.error('Biteship Area Search Error:', err);
    return res.status(500).json({ error: 'Failed to fetch areas' });
  }
}
