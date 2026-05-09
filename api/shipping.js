import areasHandler from './_handlers/shipping_areas.js';
import ratesHandler from './_handlers/shipping_rates.js';

export default async function handler(req, res) {
  const url = req.url || '';
  
  if (url.includes('/api/shipping/areas')) return areasHandler(req, res);
  if (url.includes('/api/shipping/rates')) return ratesHandler(req, res);

  return res.status(404).json({ error: 'Shipping route not found' });
}
