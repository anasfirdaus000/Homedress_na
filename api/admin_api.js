import ordersHandler from './_handlers/admin/orders.js';
import productsHandler from './_handlers/admin/products.js';
import categoriesHandler from './_handlers/admin/categories.js';
import heroHandler from './_handlers/admin/hero.js';
import featuredHandler from './_handlers/admin/featured.js';
import menusHandler from './_handlers/admin/menus.js';
import settingsHandler from './_handlers/admin/settings.js';
import uploadHandler from './_handlers/admin/upload.js';

export default async function handler(req, res) {
  const url = req.url || '';
  if (url.includes('/api/admin/orders')) return ordersHandler(req, res);
  if (url.includes('/api/admin/products')) return productsHandler(req, res);
  if (url.includes('/api/admin/categories')) return categoriesHandler(req, res);
  if (url.includes('/api/admin/hero')) return heroHandler(req, res);
  if (url.includes('/api/admin/featured')) return featuredHandler(req, res);
  if (url.includes('/api/admin/menus')) return menusHandler(req, res);
  if (url.includes('/api/admin/settings')) return settingsHandler(req, res);
  if (url.includes('/api/admin/upload')) return uploadHandler(req, res);

  return res.status(404).json({ error: 'Route not found in admin' });
}
