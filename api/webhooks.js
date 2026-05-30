import mayarWebhook from './_handlers/webhook/mayar.js';

// Keep Louvin for backward compatibility with pending orders
let louvinWebhook;
try {
  louvinWebhook = (await import('./_handlers/webhook/louvin.js')).default;
} catch (e) {
  louvinWebhook = null;
}

export default async function handler(req, res) {
  const url = req.url || '';
  if (url.includes('/api/webhook/mayar')) return mayarWebhook(req, res);
  if (url.includes('/api/webhook/louvin') && louvinWebhook) return louvinWebhook(req, res);

  return res.status(404).json({ error: 'Route not found in webhooks' });
}
