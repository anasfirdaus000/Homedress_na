import { supabaseAdmin } from './_lib/supabase.js';

export default async function handler(req, res) {
  const baseUrl = 'https://homedress-na.vercel.app';
  
  // 1. Static Pages
  const staticPages = [
    '',
    '/category.html',
    '/new-in.html',
    '/promo.html',
    '/about-us.html',
    '/faq.html'
  ];

  // 2. Fetch Products
  const { data: products } = await supabaseAdmin.from('products').select('slug, updated_at');
  
  // 3. Fetch Categories
  const { data: categories } = await supabaseAdmin.from('categories').select('slug');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Add Static
  staticPages.forEach(page => {
    xml += `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>daily</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`;
  });

  // Add Categories
  (categories || []).forEach(cat => {
    xml += `
  <url>
    <loc>${baseUrl}/category.html?category=${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  // Add Products
  (products || []).forEach(prod => {
    xml += `
  <url>
    <loc>${baseUrl}/product.html?slug=${prod.slug}</loc>
    <lastmod>${new Date(prod.updated_at || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
  });

  xml += '\n</urlset>';

  res.setHeader('Content-Type', 'text/xml');
  return res.status(200).send(xml);
}
