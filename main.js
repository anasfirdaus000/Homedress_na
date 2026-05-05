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

function closeCartDrawer() { 
  const d = document.getElementById('cart-drawer');
  if (d) { d.classList.remove('is-open'); document.body.style.overflow = ''; }
}

// Attach cart toggle listener
document.addEventListener('click', (e) => {
  if (e.target.closest('#cart-toggle') || e.target.closest('.header__cart-btn')) {
    openCartDrawer();
  }
});

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
  form.onsubmit = async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    const input = form.querySelector('input');
    const originalText = btn.textContent;
    
    btn.textContent = 'Menyimpan...';
    btn.disabled = true;

    // Simulate API call for now (can be connected to a real DB table later)
    setTimeout(() => {
      btn.textContent = 'Berhasil! ✓';
      input.value = '';
      showToast('Terima kasih! Anda telah terdaftar di newsletter kami.');
    }, 800);
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
  const navs = document.querySelectorAll('#dynamic-nav, #main-nav');
  if (navs.length === 0) return;
  try {
    const res = await fetch('/api/menus');
    if (res.ok) {
      const { menus } = await res.json();
      const main = menus.filter(m => m.menu_group === 'main_nav' && !m.parent_id);
      const html = main.map(m => `
        <div class="header__nav-item">
          <a href="${m.category_slug ? `/category.html?filter=${m.category_slug}` : (m.custom_url || '#')}" class="header__nav-link">${m.label}</a>
        </div>
      `).join('');
      navs.forEach(nav => nav.innerHTML = html);
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
    initCategoryPagination(pData);
  }
  if (window.location.pathname.includes('checkout.html')) {
    initCheckoutPage();
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

// ========== CATEGORY PAGINATION ==========
function initCategoryPagination(products = []) {
  const grid = document.getElementById('category-product-grid');
  const sortSelect = document.getElementById('category-sort');
  const countText = document.getElementById('pagination-count-text');
  if (!grid) return;

  const urlParams = new URLSearchParams(window.location.search);
  const filter = urlParams.get('filter');
  
  let filtered = [...products];
  if (filter) {
    if (filter === 'flash-sale') filtered = products.filter(p => p.discount > 0);
    else if (filter === 'best-seller') filtered = products.filter(p => p.social_proof?.toLowerCase().includes('terlaris') || p.rating >= 4.5);
    else if (filter === 'new-in') filtered = products.slice(0, 12);
    else filtered = products.filter(p => p.category_slug === filter || p.category_id === filter);
  }

  const render = (data) => {
    if (data.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1; padding:100px 0; text-align:center; color:#888;">Produk tidak ditemukan.</div>';
      countText.textContent = 'Menampilkan 0 produk';
      return;
    }
    grid.innerHTML = data.map(createCard).join('');
    countText.textContent = `Menampilkan ${data.length} produk`;
    initScrollAnimations();
  };

  if (sortSelect) {
    sortSelect.onchange = () => {
      const val = sortSelect.value;
      if (val === 'price-asc') filtered.sort((a,b) => a.price - b.price);
      else if (val === 'price-desc') filtered.sort((a,b) => b.price - a.price);
      else if (val === 'name-asc') filtered.sort((a,b) => a.name.localeCompare(b.name));
      else filtered.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
      render(filtered);
    };
  }

  render(filtered);
}

// ========== CHECKOUT PAGE ==========
function initCheckoutPage() {
  const form = document.getElementById('checkout-form');
  const summary = document.getElementById('checkout-summary');
  if (!form || !summary) return;

  const renderSummary = () => {
    const items = CART.items;
    if (items.length === 0) {
      summary.innerHTML = '<p>Keranjang kosong.</p>';
      return;
    }

    const subtotal = CART.total();
    const shipping = subtotal >= 200000 ? 0 : 15000;
    const total = subtotal + shipping;

    summary.innerHTML = `
      <div class="checkout-summary-list">
        ${items.map(item => `
          <div class="summary-item" style="display:flex; gap:12px; margin-bottom:16px; align-items:center;">
            <div style="position:relative;">
              <img src="${item.img || '/images/placeholder.jpg'}" style="width:64px; height:64px; object-fit:cover; border-radius:4px;" />
              <span style="position:absolute; top:-8px; right:-8px; background:#000; color:#fff; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1rem;">${item.qty}</span>
            </div>
            <div style="flex:1;">
              <p style="font-weight:600; margin:0;">${item.name}</p>
              <p style="font-size:1.1rem; color:#888; margin:0;">${item.size || 'N/A'}</p>
            </div>
            <p style="font-weight:600; margin:0;">Rp ${(item.price * item.qty).toLocaleString('id-ID')}</p>
          </div>
        `).join('')}
      </div>
      <div style="border-top:1px solid #eee; margin-top:20px; padding-top:20px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Subtotal</span><span>Rp ${subtotal.toLocaleString('id-ID')}</span></div>
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Ongkos Kirim</span><span>${shipping === 0 ? 'GRATIS' : 'Rp ' + shipping.toLocaleString('id-ID')}</span></div>
        <div style="display:flex; justify-content:space-between; margin-top:16px; font-weight:800; font-size:1.8rem;"><span>TOTAL</span><span>Rp ${total.toLocaleString('id-ID')}</span></div>
      </div>
    `;
  };

  renderSummary();

  form.onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-checkout');
    const errDiv = document.getElementById('checkout-error');
    
    if (CART.items.length === 0) {
      alert('Keranjang belanja kosong!');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'MEMPROSES...';
    errDiv.style.display = 'none';

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Add items to payload
    data.items = CART.items.map(i => ({
      product_id: i.id, // This should be the slug
      size: i.size,
      quantity: i.qty
    }));

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (res.ok && result.success) {
        CART.items = [];
        CART.save();
        // Redirect to success page
        window.location.href = `/order-confirmation.html?order=${result.order.order_number}`;
      } else {
        throw new Error(result.error || 'Gagal memproses pesanan');
      }
    } catch (err) {
      errDiv.textContent = err.message;
      errDiv.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'BUAT PESANAN';
    }
  };
}
