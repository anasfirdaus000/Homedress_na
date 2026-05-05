import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get env from process.env (passed via --env-file)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const templatePath = path.join(__dirname, 'product-template.html');
const indexPath = path.join(__dirname, 'index.html');

async function build() {
  console.log('🚀 Starting Static PDP Build (ESM)...');

  const template = fs.readFileSync(templatePath, 'utf8');
  const index = fs.readFileSync(indexPath, 'utf8');

  const footerStart = index.indexOf('<footer');
  const footerEnd = index.indexOf('</footer>') + 9;
  const footerHtml = index.substring(footerStart, footerEnd);

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('❌ Error fetching products:', error);
    return;
  }

  console.log(`📦 Found ${products.length} active products.`);

  for (const product of products) {
    console.log(`📄 Generating: ${product.slug}.html`);

    const priceFormatted = (product.price || 0).toLocaleString('id-ID');
    const descriptionText = (product.description || '').replace(/<[^>]*>/g, '').substring(0, 160);
    
    let galleryHtml = '';
    const imgs = [...(product.images || [])];
    if (imgs.length > 0) {
      for (let i = 0; i < imgs.length; i++) {
        const isFull = (i % 3 === 0);
        if (isFull) {
          galleryHtml += `
            <div class="pdp-gallery__item pdp-gallery__item--full">
              <img src="${imgs[i]}" alt="${product.name}" class="pdp-gallery__img" loading="lazy" />
              ${i === 0 && product.social_proof ? `<div class="pdp-gallery__social-badge">${product.social_proof}</div>` : ''}
            </div>`;
        } else {
          if (i + 1 < imgs.length && (i % 3 !== 0)) {
            galleryHtml += `
              <div class="pdp-gallery__grid-2">
                <div class="pdp-gallery__item"><img src="${imgs[i]}" class="pdp-gallery__img" loading="lazy" /></div>
                <div class="pdp-gallery__item"><img src="${imgs[i+1]}" class="pdp-gallery__img" loading="lazy" /></div>
              </div>`;
            i++; // skip next
          } else {
            galleryHtml += `<div class="pdp-gallery__item pdp-gallery__item--full"><img src="${imgs[i]}" class="pdp-gallery__img" loading="lazy" /></div>`;
          }
        }
      }
    }

    let variantsHtml = '';
    const colors = [...new Set((product.variants || []).map(v => v.color).filter(Boolean))];
    const sizes = [...new Set((product.variants || []).map(v => v.size).filter(Boolean))];

    if (colors.length > 0) {
      variantsHtml += `
        <div class="pdp-size">
          <span class="pdp-size__label">WARNA: <strong id="selected-color-name">${colors[0]}</strong></span>
          <div class="pdp-size__grid">
            ${colors.map((c, i) => `<button class="pdp-size__btn color-btn ${i === 0 ? 'pdp-size__btn--active' : ''}" data-value="${c}">${c}</button>`).join('')}
          </div>
        </div>`;
    }
    
    // Always show size grid, fallback to Standard if empty
    const sizeList = sizes.length > 0 ? sizes : ['All Size'];
    variantsHtml += `
      <div class="pdp-size">
        <span class="pdp-size__label">UKURAN: <strong id="selected-size-name">${sizeList[0]}</strong></span>
        <div class="pdp-size__grid">
          ${sizeList.map((s, i) => `<button class="pdp-size__btn size-btn ${i === 0 ? 'pdp-size__btn--active' : ''}" data-value="${s}">${s}</button>`).join('')}
        </div>
      </div>`;

    const detailsHtml = (product.details || []).length > 0 
      ? `<details class="pdp-accordion">
          <summary class="pdp-accordion__summary">Details <span>+</span></summary>
          <div class="pdp-accordion__content"><ul>${product.details.map(d => `<li>${d}</li>`).join('')}</ul></div>
        </details>`
      : '';

    let html = template
      .replace(/{{PRODUCT_NAME}}/g, product.name)
      .replace(/{{PRODUCT_DESCRIPTION_TEXT}}/g, descriptionText)
      .replace(/{{PRODUCT_DESCRIPTION_HTML}}/g, product.description || '')
      .replace(/{{PRODUCT_IMAGE_PRIMARY}}/g, product.images?.[0] || '')
      .replace(/{{PRODUCT_SLUG}}/g, product.slug)
      .replace(/{{PRODUCT_PRICE}}/g, product.price)
      .replace(/{{PRODUCT_PRICE_FORMATTED}}/g, priceFormatted)
      .replace(/{{PRODUCT_GALLERY_HTML}}/g, galleryHtml)
      .replace(/{{PRODUCT_VARIANTS_HTML}}/g, variantsHtml)
      .replace(/{{PRODUCT_DETAILS_ACCORDION}}/g, detailsHtml)
      .replace(/{{FOOTER_HTML}}/g, footerHtml)
      .replace(/{{PRODUCT_JSON}}/g, JSON.stringify(product))
      .replace(/{{SELECTED_COLOR}}/g, JSON.stringify(colors[0] || null))
      .replace(/{{SELECTED_SIZE}}/g, JSON.stringify(sizes[0] || null))
      .replace(/{{PRODUCT_ORIGINAL_PRICE_HTML}}/g, product.original_price ? `<span class="pdp-info__price pdp-info__price--original">Rp ${product.original_price.toLocaleString('id-ID')}</span>` : '');

    fs.writeFileSync(path.join(__dirname, `${product.slug}.html`), html);
  }

  // 3. Generate Sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://homedressna.com/</loc><priority>1.0</priority></url>
  <url><loc>https://homedressna.com/category.html</loc><priority>0.8</priority></url>
  ${products.map(p => `  <url><loc>https://homedressna.com/${p.slug}.html</loc><priority>0.7</priority></url>`).join('\n')}
</urlset>`;
  fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap);
  console.log('🗺️ sitemap.xml generated!');

  console.log('✅ All product pages generated successfully!');
}

build();
