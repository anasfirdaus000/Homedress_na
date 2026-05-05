import productsHandler from './_handlers/products.js';
import categoriesHandler from './_handlers/categories.js';
import heroHandler from './_handlers/hero.js';
import featuredHandler from './_handlers/featured.js';
import menusHandler from './_handlers/menus.js';
import searchHandler from './_handlers/search.js';

export default async function handler(req, res) {
  const url = req.url || '';
  if (url.includes('/api/products')) return productsHandler(req, res);
  if (url.includes('/api/categories')) return categoriesHandler(req, res);
  if (url.includes('/api/hero')) return heroHandler(req, res);
  if (url.includes('/api/featured')) return featuredHandler(req, res);
  if (url.includes('/api/menus')) return menusHandler(req, res);
  if (url.includes('/api/search')) return searchHandler(req, res);
  
  return res.status(404).json({ error: 'Route not found in storefront' });
}
