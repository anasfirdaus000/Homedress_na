import louvinWebhook from './_handlers/webhook/louvin.js';

export default async function handler(req, res) {
  const url = req.url || '';
  if (url.includes('/api/webhook/louvin')) return louvinWebhook(req, res);

  return res.status(404).json({ error: 'Route not found in webhooks' });
}
