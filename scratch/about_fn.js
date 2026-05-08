
async function initAboutUsPage() {
  if (!document.getElementById('about-hero-title')) return;
  console.log('📖 Initializing About Us page content...');
  try {
    const { data, error } = await window.supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'about_us')
      .single();
    
    if (error || !data) {
      console.warn('About Us settings not found in DB.');
      return;
    }
    
    const val = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    
    if (val.hero_title) document.getElementById('about-hero-title').textContent = val.hero_title;
    if (val.hero_subtitle) document.getElementById('about-hero-subtitle').textContent = val.hero_subtitle;
    if (val.hero_image) document.getElementById('about-hero-img').src = val.hero_image;
    
    if (val.vision_title) document.getElementById('about-vision-title').textContent = val.vision_title;
    if (val.vision_text) document.getElementById('about-vision-text').textContent = val.vision_text;
    if (val.vision_image) document.getElementById('about-vision-img').src = val.vision_image;
    if (val.vision_subtext) document.getElementById('about-vision-subtext').innerHTML = `<p style="font-size: 1.2rem; line-height: 1.6; color: var(--color-fg-light); margin-bottom: 32px;">${val.vision_subtext}</p>`;

    if (val.mission_title) document.getElementById('about-mission-title').textContent = val.mission_title;
    if (val.mission_text) document.getElementById('about-mission-text').textContent = val.mission_text;
    if (val.mission_image) document.getElementById('about-mission-img').src = val.mission_image;
    if (val.mission_list && Array.isArray(val.mission_list)) {
      document.getElementById('about-mission-list').innerHTML = val.mission_list.map(item => `
        <li style="display: flex; gap: 16px; align-items: flex-start; font-size: 1.15rem; color: var(--color-fg); font-weight: 500;">
          <svg style="flex-shrink: 0; margin-top: 2px;" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-black)" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>${item}</span>
        </li>
      `).join('');
    }
  } catch (e) {
    console.error('Error loading about us:', e);
  }
}
