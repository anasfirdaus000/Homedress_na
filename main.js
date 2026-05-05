/* ===============================================
   HOMEDRESS_NA — Clean Main JavaScript
   Parallel Loading & Robust Error Handling
   =============================================== */

// ========== HELPERS ==========
function createCard(p) {
  if (!p) return '';
  const price = p.price || 0;
  const originalPrice = p.original_price || 0;
  const discount = p.discount || 0;
  const slug = p.slug || '';
  const images = p.images || [];

  const priceHtml = discount > 0 && originalPrice
    ? `<span class="product-card__price--sale">Rp ${price.toLocaleString('id-ID')}</span> <span class="product-card__price--original">Rp ${originalPrice.toLocaleString('id-ID')}</span>`
    : `Rp ${price.toLocaleString('id-ID')}`;
  
  const badgeHtml = discount > 0 ? `<div class="product-card__badge product-card__badge--sale">-${discount}% OFF</div>` : '';
  const socialBadge = p.social_proof ? `<div class="product-card__badge product-card__badge--social">${p.social_proof}</div>` : '';

  return `
    <div class="product-card" data-slug="${slug}" onclick="window.location.href='/product.html?slug=${slug}'" style="cursor:pointer;" data-animate>
      <div class="product-card__image-wrapper">
        <img src="${images[0] || '/images/featured_images.png'}" alt="${p.name}" class="product-card__image" loading="lazy" />
        ${badgeHtml}
        ${socialBadge}
      </div>
      <div class="product-card__info">
        <p class="product-card__brand">${p.brand || 'HOMEDRESS_NA'}</p>
        <p class="product-card__name">${p.name}</p>
        <p class="product-card__price">${priceHtml}</p>
      </div>
    </div>
  `;
}

function createMegaCard(p) {
  if (!p) return '';
  const slug = p.slug || '';
  const images = p.images || [];
  return `
    <a href="/product.html?slug=${slug}" class="megamenu__card" data-slug="${slug}">
      <div class="megamenu__img-wrap">
        <img src="${images[0] || '/images/featured_images.png'}" alt="${p.name}" loading="lazy" />
      </div>
      <span>${p.name}</span>
    </a>
  `;
}

// ========== UI COMPONENTS INJECTION ==========
function injectUI() {
  // Inject Cart Drawer if not exists
  if (!document.getElementById('cart-drawer')) {
    const drawer = document.createElement('div');
    drawer.id = 'cart-drawer';
    drawer.className = 'cart-drawer';
    drawer.innerHTML = `
      <div class="cart-drawer__overlay" id="cart-drawer-overlay"></div>
      <div class="cart-drawer__content">
        <div class="cart-drawer__header">
          <h3>Keranjang Belanja</h3>
          <button class="cart-drawer__close" id="cart-drawer-close">✕</button>
        </div>
        <div class="cart-drawer__body">
          <div id="cart-drawer-list"></div>
          <div id="cart-drawer-empty" style="display:none; text-align:center; padding:40px 0;">
            <p style="font-size:1.4rem; color:#888;">Keranjang anda kosong.</p>
            <a href="/category.html" class="btn btn--outline" style="margin-top:20px; display:inline-block;">BELANJA SEKARANG</a>
          </div>
        </div>
        <div class="cart-drawer__footer">
          <div class="cart-drawer__total-row">
            <span>Subtotal</span>
            <span id="cart-drawer-total">Rp 0</span>
          </div>
          <p style="font-size:1.1rem; color:#888; margin-bottom:20px;">Shipping & taxes calculated at checkout.</p>
          <a href="/checkout.html" class="cart-drawer__checkout-btn">PROSES CHECKOUT</a>
        </div>
      </div>
    `;
    document.body.appendChild(drawer);
    document.getElementById('cart-drawer-close').onclick = closeCartDrawer;
    document.getElementById('cart-drawer-overlay').onclick = closeCartDrawer;
  }
}

// ========== CART SYSTEM ==========
window.CART = {
  items: JSON.parse(localStorage.getItem('hd_cart') || '[]'),
  save() { 
    localStorage.setItem('hd_cart', JSON.stringify(this.items)); 
    this.updateBadge(); 
    renderCartDrawer();
    window.dispatchEvent(new CustomEvent('cart-updated'));
  },
  add(item) {
    const existing = this.items.find(i => i.id === item.id && i.size === item.size);
    if (existing) existing.qty += (item.qty || 1);
    else this.items.push({...item, qty: item.qty || 1});
    this.save();
    showToast('Berhasil ditambah ke keranjang! 🛍️');
    openCartDrawer();
  },
  updateQty(idx, delta) {
    if (!this.items[idx]) return;
    this.items[idx].qty += delta;
    if (this.items[idx].qty < 1) this.items.splice(idx, 1);
    this.save();
  },
  total() { return this.items.reduce((sum, i) => sum + (i.price * i.qty), 0); },
  count() { return this.items.reduce((sum, i) => sum + i.qty, 0); },
  updateBadge() {
    const total = this.count();
    document.querySelectorAll('#cart-count, .cart-badge, .header-badge').forEach(b => {
      b.textContent = total;
      b.style.display = total > 0 ? 'flex' : 'none';
    });
  }
};

function renderCartDrawer() {
  const list = document.getElementById('cart-drawer-list');
  const total = document.getElementById('cart-drawer-total');
  const empty = document.getElementById('cart-drawer-empty');
  if (!list) return;
  if (CART.items.length === 0) {
    list.innerHTML = ''; total.textContent = 'Rp 0';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  list.innerHTML = CART.items.map((item, i) => `
    <div class="cart-item">
      <img src="${item.img || '/images/placeholder.jpg'}" alt="${item.name}" class="cart-item__img"/>
      <div class="cart-item__info">
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__size">${item.size ? 'Size: '+item.size : ''}</p>
        <p class="cart-item__price">Rp ${item.price.toLocaleString('id-ID')}</p>
        <div class="cart-item__qty">
          <button onclick="CART.updateQty(${i},-1)">−</button>
          <span>${item.qty}</span>
          <button onclick="CART.updateQty(${i},1)">+</button>
        </div>
      </div>
    </div>
  `).join('');
  total.textContent = 'Rp ' + CART.total().toLocaleString('id-ID');
}

function openCartDrawer() { 
  const d = document.getElementById('cart-drawer');
  if (d) { d.classList.add('is-open'); document.body.style.overflow = 'hidden'; renderCartDrawer(); }
}
function closeCartDrawer() { 
  const d = document.getElementById('cart-drawer');
  if (d) { d.classList.remove('is-open'); document.body.style.overflow = ''; }
}

// ========== SCROLL REVEAL ANIMATIONS ==========
function initScrollAnimations() {
  const animateElements = document.querySelectorAll('[data-animate]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in', 'is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  animateElements.forEach(el => observer.observe(el));
}

// ========== HEADER SCROLL EFFECT ==========
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('header--scrolled');
      header.classList.remove('header--transparent');
    } else {
      header.classList.remove('header--scrolled');
      header.classList.add('header--transparent');
    }
  }, { passive: true });
}

// ========== ANNOUNCEMENT BAR ==========
function initAnnouncementBar() {
  const items = document.querySelector('.announcement-bar__items');
  if (!items) return;
  const clone = items.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  items.parentElement.appendChild(clone);
}

// ========== NEWSLETTER ==========
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  form.onsubmit = (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.textContent = 'Subscribed ✓';
    btn.disabled = true;
  };
}

// ========== PARALLAX ==========
function initParallax() {
  const sections = document.querySelectorAll('.parallax-section');
  window.addEventListener('scroll', () => {
    sections.forEach(sec => {
      const img = sec.querySelector('img');
      if (!img) return;
      const speed = 0.5;
      const rect = sec.getBoundingClientRect();
      const offset = (window.innerHeight - rect.top) * speed;
      img.style.transform = `translateY(${offset * 0.1}px)`;
    });
  }, { passive: true });
}

// ========== DATA LOADING ==========
async function initHeroSlider(slides = []) {
  const slider = document.getElementById('hero-slider');
  const dotsContainer = document.getElementById('hero-dots');
  if (!slider || slides.length === 0) return;

  slider.innerHTML = slides.map(s => `
    <div class="hero__slide">
      <a href="${s.link_url || '/category.html'}" class="hero__link-wrapper">
        <div class="hero__image-wrapper">
          <img src="${s.image_url || '/images/placeholder.jpg'}" alt="${s.title}" class="hero__image" style="object-position:${s.object_position || 'center'};"/>
        </div>
        <div class="hero__content">
          <h1 class="hero__title">${s.title.replace(/\n/g, '<br/>')}</h1>
          <p class="hero__subtitle">${(s.subtitle || '').replace(/\n/g, '<br/>')}</p>
          <span class="hero__cta">SHOP NOW</span>
        </div>
      </a>
    </div>
  `).join('');

  if (dotsContainer) {
    dotsContainer.innerHTML = slides.map((_, i) => `<span class="hero__dot ${i===0?'hero__dot--active':''}" data-index="${i}"></span>`).join('');
    const dots = dotsContainer.querySelectorAll('.hero__dot');
    let current = 0;
    const goTo = (idx) => {
      current = (idx + slides.length) % slides.length;
      slider.scrollTo({ left: slider.clientWidth * current, behavior: 'smooth' });
      dots.forEach((d, i) => d.classList.toggle('hero__dot--active', i === current));
    };
    dots.forEach((d, i) => d.onclick = () => goTo(i));
    setInterval(() => goTo(current + 1), 6000);
  }
}

async function initShopByCategory(categories = []) {
  const grid = document.getElementById('category-grid');
  if (!grid || categories.length === 0) return;
  
  const displayCats = categories.filter(c => c.is_featured).slice(0, 6);
  grid.innerHTML = displayCats.map(c => `
    <a href="/category.html?filter=${c.slug}" class="category-card" data-animate>
      <div class="category-card__image-wrapper">
        <img src="${c.image_url || '/images/featured_images.png'}" alt="${c.name}" class="category-card__image" loading="lazy" />
      </div>
      <span class="category-card__label">${c.name}</span>
    </a>
  `).join('');
}

async function initDynamicHome(products = [], featured = []) {
  const newInGrid = document.getElementById('new-in-grid');
  const homeNewArrivals = document.getElementById('home-new-arrivals');
  const flashSaleGrid = document.getElementById('flash-sale-grid');
  
  if (newInGrid) {
    newInGrid.innerHTML = products.slice(0, 10).map(createCard).join('');
  }
  if (homeNewArrivals) {
    homeNewArrivals.innerHTML = products.slice(0, 10).map(createCard).join('');
  }
  if (flashSaleGrid) {
    const saleProds = products.filter(p => p.discount > 0).slice(0, 10);
    flashSaleGrid.innerHTML = saleProds.length ? saleProds.map(createCard).join('') : '<p>Belum ada promo aktif.</p>';
  }

  // Pinned Editorial
  const pinnedContainer = document.querySelector('.pinned-container');
  const pinned = featured.filter(f => f.type === 'pinned_banner');
  if (pinnedContainer && pinned.length > 0) {
    pinnedContainer.innerHTML = pinned.map(b => `
      <section class="reprimo-banner pinned-section">
        <div class="reprimo-banner__bg"><img src="${b.image_url}" class="reprimo-banner__bg-img" /></div>
        <div class="reprimo-banner__model"><img src="${b.image_url}" class="reprimo-banner__model-img" /></div>
        <div class="reprimo-banner__content">
          <h2 class="reprimo-banner__title">${b.title}</h2>
          <p class="reprimo-banner__text">${b.subtitle || ''}</p>
          <a href="/product.html?slug=${b.product_slug || ''}" class="reprimo-banner__cta">SHOP NOW</a>
        </div>
      </section>
    `).join('');
  }
}

async function initDynamicMenus(products = []) {
  const nav = document.getElementById('dynamic-nav');
  if (!nav) return;
  try {
    const res = await fetch('/api/menus');
    if (res.ok) {
      const { menus } = await res.json();
      const main = menus.filter(m => m.menu_group === 'main_nav' && !m.parent_id);
      nav.innerHTML = main.map(m => `
        <div class="header__nav-item">
          <a href="${m.category_slug ? `/category.html?filter=${m.category_slug}` : (m.custom_url || '#')}" class="header__nav-link">${m.label}</a>
        </div>
      `).join('');
    }
  } catch (e) {}
}

// ========== SEARCH SYSTEM ==========
function initSearch() {
  const searchInput = document.querySelector('.header__search-input');
  if (!searchInput) return;
  
  let overlay = document.getElementById('search-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'search-overlay';
    overlay.className = 'search-overlay';
    overlay.innerHTML = `
      <div class="search-overlay__inner">
        <div class="search-overlay__header">
          <input type="text" placeholder="Cari produk..." class="search-overlay__input" id="search-overlay-input"/>
          <button id="search-overlay-close" class="search-overlay__close">✕</button>
        </div>
        <div class="search-overlay__results" id="search-results"></div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  searchInput.onfocus = () => { overlay.classList.add('is-open'); document.getElementById('search-overlay-input').focus(); };
  document.getElementById('search-overlay-close').onclick = () => overlay.classList.remove('is-open');

  const sInput = document.getElementById('search-overlay-input');
  const sResults = document.getElementById('search-results');
  let timeout;

  sInput.oninput = () => {
    clearTimeout(timeout);
    const q = sInput.value.trim();
    if (q.length < 2) { sResults.innerHTML = ''; return; }
    timeout = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const prods = data.products || [];
      sResults.innerHTML = prods.map(p => `
        <a href="/product.html?slug=${p.slug}" class="search-result-item">
          <img src="${p.images[0]}" />
          <div><p>${p.name}</p><span>Rp ${p.price.toLocaleString('id-ID')}</span></div>
        </a>
      `).join('');
    }, 400);
  };
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async () => {
  injectUI();
  initSearch();
  initHeaderScroll();
  initAnnouncementBar();
  initNewsletter();
  initParallax();
  initScrollAnimations();
  CART.updateBadge();

  console.log('🔄 Loading Dynamic Content...');
  const fetchSafe = (url) => fetch(url).then(r => r.ok ? r.json() : null).catch(() => null);

  const [products, categories, featured, hero] = await Promise.all([
    fetchSafe('/api/products'),
    fetchSafe('/api/categories'),
    fetchSafe('/api/featured'),
    fetchSafe('/api/hero')
  ]);

  const pData = products?.products || [];
  const cData = categories?.categories || [];
  const fData = featured?.featured || [];
  const hData = hero?.slides || [];

  await Promise.all([
    initHeroSlider(hData),
    initShopByCategory(cData),
    initDynamicHome(pData, fData),
    initDynamicMenus(pData)
  ]);

  // Page specific logic
  if (window.location.pathname.includes('category.html')) {
     // initCategoryPagination logic...
  }

  // Animation triggers
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('animate-in', 'is-visible');
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

  console.log('✨ Ready.');
});

function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('is-visible');
  setTimeout(() => t.classList.remove('is-visible'), 3000);
}
