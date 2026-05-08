import fs from 'fs';

let content = fs.readFileSync('about-us.html', 'utf8');

// Replace Brands Section
const marqueeHtml = `<!-- FASHION MARQUEE (REPLACED BRANDS LOGO) -->
  <section id="brands" class="brands">
    <div class="brands__marquee-wrapper" style="padding: 25px 0; background: #fafafa; border-top: 1px solid #eaeaea; border-bottom: 1px solid #eaeaea;">
      <div class="brands__marquee-row brands__marquee-row--left">
        <div class="brands__marquee-content" style="gap: 50px; display: flex; align-items: center; white-space: nowrap;">
          <span style="font-size: 1.4rem; font-weight: 600; letter-spacing: 2px; color: #333;">✨ EKSKLUSIF & ELEGAN</span>
          <span style="font-size: 1.4rem; font-weight: 600; letter-spacing: 2px; color: #333;">✨ NYAMAN DIPAKAI SEHARIAN</span>
          <span style="font-size: 1.4rem; font-weight: 600; letter-spacing: 2px; color: #333;">✨ BAHAN PREMIUM BERKUALITAS</span>
          <span style="font-size: 1.4rem; font-weight: 600; letter-spacing: 2px; color: #333;">✨ GAYA MODERN & KEKINIAN</span>
          <span style="font-size: 1.4rem; font-weight: 600; letter-spacing: 2px; color: #333;">✨ KOLEKSI TERBARU SETIAP MINGGU</span>
        </div>
        <div class="brands__marquee-content" aria-hidden="true" style="gap: 50px; display: flex; align-items: center; white-space: nowrap;">
          <span style="font-size: 1.4rem; font-weight: 600; letter-spacing: 2px; color: #333;">✨ EKSKLUSIF & ELEGAN</span>
          <span style="font-size: 1.4rem; font-weight: 600; letter-spacing: 2px; color: #333;">✨ NYAMAN DIPAKAI SEHARIAN</span>
          <span style="font-size: 1.4rem; font-weight: 600; letter-spacing: 2px; color: #333;">✨ BAHAN PREMIUM BERKUALITAS</span>
          <span style="font-size: 1.4rem; font-weight: 600; letter-spacing: 2px; color: #333;">✨ GAYA MODERN & KEKINIAN</span>
          <span style="font-size: 1.4rem; font-weight: 600; letter-spacing: 2px; color: #333;">✨ KOLEKSI TERBARU SETIAP MINGGU</span>
        </div>
      </div>
    </div>
  </section>`;

content = content.replace(/<!-- BRAND LOGOS -->[\s\S]*?<\/section>/, marqueeHtml);

// Add IDs to other elements if not present
content = content.replace('<h1 style="font-size: 4.5rem; font-weight: 700; margin-bottom: 24px; text-transform: uppercase; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">', '<h1 id="about-hero-title" style="font-size: 4.5rem; font-weight: 700; margin-bottom: 24px; text-transform: uppercase; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">');
content = content.replace('<p style="font-size: 1.5rem; font-weight: 400; line-height: 1.6; max-width: 800px; margin: 0 auto 36px; text-shadow: 0 1px 5px rgba(0,0,0,0.5);">', '<p id="about-hero-subtitle" style="font-size: 1.5rem; font-weight: 400; line-height: 1.6; max-width: 800px; margin: 0 auto 36px; text-shadow: 0 1px 5px rgba(0,0,0,0.5);">');
content = content.replace('<img src="/images/1_0d097d33-95ec-49db-909b-b31fb077219f.png"', '<img id="about-vision-img" src="/images/1_0d097d33-95ec-49db-909b-b31fb077219f.png"');
content = content.replace('<h2 style="font-size: 3.2rem; font-weight: 700; margin-bottom: 24px;">Visi Kami</h2>', '<h2 id="about-vision-title" style="font-size: 3.2rem; font-weight: 700; margin-bottom: 24px;">Visi Kami</h2>');
content = content.replace('<p style="font-size: 1.4rem; font-weight: 500; line-height: 1.6; color: var(--color-fg); margin-bottom: 24px;">', '<p id="about-vision-text" style="font-size: 1.4rem; font-weight: 500; line-height: 1.6; color: var(--color-fg); margin-bottom: 24px;">');
content = content.replace('<h2 style="font-size: 3.2rem; font-weight: 700; margin-bottom: 24px;">Misi Kami</h2>', '<h2 id="about-mission-title" style="font-size: 3.2rem; font-weight: 700; margin-bottom: 24px;">Misi Kami</h2>');
content = content.replace('<p style="font-size: 1.2rem; line-height: 1.6; color: var(--color-fg-light); margin-bottom: 32px;">Melalui website ini', '<p id="about-mission-text" style="font-size: 1.2rem; line-height: 1.6; color: var(--color-fg-light); margin-bottom: 32px;">Melalui website ini');
content = content.replace('<ul style="list-style: none; display: flex; flex-direction: column; gap: 20px; padding: 0;">', '<ul id="about-mission-list" style="list-style: none; display: flex; flex-direction: column; gap: 20px; padding: 0;">');
content = content.replace('<img src="/images/12_4c153cfc-80b6-4d22-8abe-0576d6ea0a01.png"', '<img id="about-mission-img" src="/images/12_4c153cfc-80b6-4d22-8abe-0576d6ea0a01.png"');

fs.writeFileSync('about-us.html', content);
console.log('about-us.html updated successfully.');
