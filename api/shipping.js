import areasHandler from './_handlers/shipping_areas.js';
import ratesHandler from './_handlers/shipping_rates.js';
import createShipmentHandler from './_handlers/create_shipment.js';

export default async function handler(req, res) {
  const url = req.url || '';
  
  if (url.includes('/api/shipping/areas')) return areasHandler(req, res);
  if (url.includes('/api/shipping/rates')) return ratesHandler(req, res);
  if (url.includes('/api/shipping/create-shipment')) return createShipmentHandler(req, res);

  return res.status(404).json({ error: 'Shipping route not found' });
}
