import checkoutHandler from './_handlers/checkout.js';
import trackHandler from './_handlers/track.js';

export default async function handler(req, res) {
  const url = req.url || '';
  if (url.includes('/api/checkout')) return checkoutHandler(req, res);
  if (url.includes('/api/track')) return trackHandler(req, res);

  return res.status(404).json({ error: 'Route not found in order ops' });
}
