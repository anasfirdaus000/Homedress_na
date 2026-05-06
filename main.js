/* ===============================================
   HOMEDRESS_NA — Clean Main JavaScript
   Parallel Loading & Robust Error Handling
   =============================================== */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SB_URL = 'https://owajvfwhhdhvhrwjbkmd.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93YWp2ZndoaGRodmhyd2pia21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NTIzODQsImV4cCI6MjA5MzQyODM4NH0.1VTziUISWA69HlhPCRnPZ2mWQmJIcVAGlMdoF3T0nO4';
window.supabase = createClient(SB_URL, SB_KEY);

// ========== HELPERS ==========
function createCard(p) {
  if (!p) return '';
  const price = p.price || 0;
  const originalPrice = p.original_price || 0;
  const discount = p.discount || 0;
  const slug = p.slug || '';
  let images = p.images || [];
  if (typeof images === 'string') {
    try { images = JSON.parse(images); } catch(e) { images = [images]; }
  }

  const priceHtml = discount > 0 && originalPrice
    ? `<span class="product-card__price--sale">Rp ${price.toLocaleString('id-ID')}</span> <span class="product-card__price--original">Rp ${originalPrice.toLocaleString('id-ID')}</span>`
    : `Rp ${price.toLocaleString('id-ID')}`;
  
  const badgeHtml = discount > 0 ? `<div class="product-card__badge product-card__badge--sale">-${discount}% OFF</div>` : '';
  const socialBadge = p.social_proof ? `<div class="product-card__badge product-card__badge--social">${p.social_proof}</div>` : '';

  const cardId = `prod-${Math.random().toString(36).substr(2, 9)}`;

  return `
    <div class="product-card" id="${cardId}" data-slug="${slug}" data-animate>
      <div class="product-card__image-wrapper" onclick="window.location.href='/product.html?slug=${slug}'" style="cursor:pointer;">
        <img src="${images[0] || '/images/featured_images.png'}" alt="${p.name}" class="product-card__image" loading="lazy" />
        ${badgeHtml}
        ${socialBadge}
      </div>
      <div class="product-card__info">
        <p class="product-card__brand">${p.brand || 'HOMEDRESS_NA'}</p>
        <p class="product-card__name" onclick="window.location.href='/product.html?slug=${slug}'" style="cursor:pointer;">${p.name}</p>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <p class="product-card__price">${priceHtml}</p>
          <button class="add-to-cart-quick" style="background:#000; color:#fff; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.2rem; transition:0.3s;" onclick="event.stopPropagation(); window.CART.add({id:'${p.id}', name:'${p.name.replace(/'/g, "\\'")}', price:${price}, images:${JSON.stringify(images).replace(/"/g, '&quot;')}, slug:'${slug}', size:'All Size'}, document.querySelector('#${cardId} .product-card__image'))">+</button>
        </div>
      </div>
    </div>
  `;
}

function showSkeletons(containerId, count = 4) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = Array(count).fill(0).map(() => `
    <div class="product-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton skeleton-text skeleton-title" style="margin-top:15px; width:100%;"></div>
      <div class="skeleton skeleton-text skeleton-price" style="width:60%;"></div>
    </div>
  `).join('');
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
  // 1. Cart Drawer
  if (!document.getElementById('cart-drawer')) {
    const drawer = document.createElement('div');
    drawer.id = 'cart-drawer';
    drawer.className = 'cart-drawer';
    drawer.innerHTML = `
      <div class="cart-drawer__header">
        <h3>Keranjang Belanja</h3>
        <button class="cart-drawer__close" id="cart-drawer-close">✕</button>
      </div>
      <div class="cart-drawer__list" id="cart-drawer-list"></div>
      <div id="cart-drawer-empty" class="cart-drawer__empty" style="display:none;">
        Keranjang anda kosong.
        <a href="/category.html" class="cart-drawer__shop-btn">BELANJA SEKARANG</a>
      </div>
      <div class="cart-drawer__footer">
        <div class="cart-drawer__total"><span>Subtotal</span><span id="cart-drawer-total">Rp 0</span></div>
        <a href="/checkout.html" class="cart-drawer__checkout">PROSES CHECKOUT</a>
      </div>
    `;
    document.body.appendChild(drawer);

    // Overlay as sibling (matches CSS: .cart-drawer.is-open ~ .drawer-overlay)
    const overlay = document.createElement('div');
    overlay.id = 'cart-drawer-overlay';
    overlay.className = 'drawer-overlay';
    document.body.appendChild(overlay);
  }

  // 2. Wishlist Drawer
  if (!document.getElementById('wishlist-drawer')) {
    const wDrawer = document.createElement('div');
    wDrawer.id = 'wishlist-drawer';
    wDrawer.className = 'cart-drawer'; // reuse same CSS class
    wDrawer.style.zIndex = '9998';
    wDrawer.innerHTML = `
      <div class="cart-drawer__header">
        <h3>Wishlist ❤️</h3>
        <button class="cart-drawer__close" id="wishlist-drawer-close">✕</button>
      </div>
      <div class="cart-drawer__list" id="wishlist-drawer-list"></div>
    `;
    document.body.appendChild(wDrawer);

    const wOverlay = document.createElement('div');
    wOverlay.id = 'wishlist-drawer-overlay';
    wOverlay.className = 'drawer-overlay';
    document.body.appendChild(wOverlay);
  }

  // 3. Toast Notification
  if (!document.getElementById('toast-notification')) {
    const toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }


  // GLOBAL DELEGATION FOR ALL BUTTONS
  document.body.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.getAttribute('data-action');
    if (action === 'open-cart') { e.preventDefault(); openCartDrawer(); }
    if (action === 'open-wishlist') { e.preventDefault(); openWishlistDrawer(); }
    if (action === 'open-account') { e.preventDefault(); window.location.href = window.AUTH?.user ? '/account.html' : '/login.html'; }
  });

  // Explicit listeners for header icons (fallback)
  const cartToggle = document.getElementById('cart-toggle');
  if (cartToggle) cartToggle.onclick = (e) => { e.preventDefault(); openCartDrawer(); };

  const wishlistToggle = document.querySelector('[aria-label="Wishlist"]');
  if (wishlistToggle) wishlistToggle.onclick = (e) => { e.preventDefault(); openWishlistDrawer(); };

  const accountToggle = document.querySelector('[aria-label="Account"]');
  if (accountToggle) accountToggle.onclick = (e) => { e.preventDefault(); window.location.href = window.AUTH?.user ? '/account.html' : '/login.html'; };

  // Close buttons
  const closes = [
    { btn: 'cart-drawer-close', overlay: 'cart-drawer-overlay', fn: closeCartDrawer },
    { btn: 'wishlist-drawer-close', overlay: 'wishlist-drawer-overlay', fn: closeWishlistDrawer }
  ];
  closes.forEach(c => {
    const b = document.getElementById(c.btn); if (b) b.onclick = c.fn;
    const o = document.getElementById(c.overlay); if (o) o.onclick = c.fn;
  });
}

function openCartDrawer() {
  document.getElementById('cart-drawer').classList.add('is-open');
  renderCartDrawer();
}
function closeCartDrawer() { document.getElementById('cart-drawer').classList.remove('is-open'); }

function openWishlistDrawer() {
  document.getElementById('wishlist-drawer').classList.add('is-open');
  renderWishlistDrawer();
}
function closeWishlistDrawer() { document.getElementById('wishlist-drawer').classList.remove('is-open'); }

function showToast(msg) {
  const t = document.getElementById('toast-notification');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('is-visible');
  setTimeout(() => t.classList.remove('is-visible'), 3000);
}

// ========== UI ANIMATIONS ==========
function animateFlyToCart(sourceImg) {
  if (!sourceImg) return;
  const cartIcon = document.getElementById('cart-toggle');
  if (!cartIcon) return;

  const rect = sourceImg.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();

  const flyer = sourceImg.cloneNode();
  flyer.classList.add('fly-to-cart');
  flyer.style.top = (rect.top + window.scrollY) + 'px';
  flyer.style.left = rect.left + 'px';
  flyer.style.width = rect.width + 'px';
  flyer.style.height = rect.height + 'px';

  document.body.appendChild(flyer);

  requestAnimationFrame(() => {
    flyer.style.top = (cartRect.top + window.scrollY) + 'px';
    flyer.style.left = cartRect.left + 'px';
    flyer.style.width = '20px';
    flyer.style.height = '20px';
    flyer.style.opacity = '0';
  });

  setTimeout(() => {
    flyer.remove();
    cartIcon.style.transform = 'scale(1.2)';
    setTimeout(() => cartIcon.style.transform = 'scale(1)', 200);
  }, 800);
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
  add(item, sourceImg = null) {
    if (sourceImg) animateFlyToCart(sourceImg);
    
    const existing = this.items.find(i => i.id === item.id && i.size === item.size);
    if (existing) existing.qty += (item.qty || 1);
    else this.items.push({...item, qty: item.qty || 1});
    this.save();
    
    if (sourceImg) {
      // Optional: don't open drawer immediately if flying
    } else {
      showToast('Berhasil ditambah ke keranjang! 🛍️');
      openCartDrawer();
    }
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

// ========== WISHLIST SYSTEM ==========
window.WISHLIST = {
  items: JSON.parse(localStorage.getItem('hd_wishlist') || '[]'),
  async save() { 
    localStorage.setItem('hd_wishlist', JSON.stringify(this.items));
    this.updateUI();

    // Sync with DB if logged in
    const { data: { session } } = await window.supabase.auth.getSession();
    if (session) {
      const userId = session.user.id;
      // Simple sync: clear and insert (or use individual upsert for better perf)
      // For now, let's just handle individual toggles for efficiency
    }
  },
  async toggle(product) {
    const idx = this.items.findIndex(i => i.slug === product.slug);
    const { data: { session } } = await window.supabase.auth.getSession();
    
    if (idx > -1) {
      this.items.splice(idx, 1);
      showToast('Dihapus dari wishlist 🤍');
      if (session) {
        await window.supabase.from('user_wishlist').delete().eq('user_id', session.user.id).eq('product_slug', product.slug);
      }
    } else {
      this.items.push(product);
      showToast('Ditambah ke wishlist ❤️');
      if (session) {
        await window.supabase.from('user_wishlist').insert([{ user_id: session.user.id, product_slug: product.slug }]);
      }
    }
    this.save();
  },
  async syncFromDB() {
    const { data: { session } } = await window.supabase.auth.getSession();
    if (!session) return;
    
    const { data, error } = await window.supabase.from('user_wishlist').select('product_slug').eq('user_id', session.user.id);
    if (!error && data) {
      // Merge with local (optional, or just overwrite)
      const slugs = data.map(d => d.product_slug);
      // Fetch full product info for these slugs if needed, or just keep slugs
      // For UI consistency, we usually need the full product object
    }
  },
  has(slug) { return this.items.some(i => i.slug === slug); },
  updateUI() {
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
      const slug = btn.dataset.slug;
      if (this.has(slug)) btn.classList.add('is-active');
      else btn.classList.remove('is-active');
    });
  }
};

// ========== AUTH SYSTEM ==========
window.AUTH = {
  user: null,
  async init() {
    const { data: { session } } = await window.supabase.auth.getSession();
    this.user = session?.user || null;
    this.updateUI();
    
    window.supabase.auth.onAuthStateChange((_event, session) => {
      this.user = session?.user || null;
      this.updateUI();
    });
  },
  updateUI() {
    const accBtn = document.querySelector('[aria-label="Account"]');
    if (accBtn) {
      accBtn.onclick = () => {
        window.location.href = this.user ? '/account.html' : '/login.html';
      };
      if (this.user) accBtn.classList.add('is-logged-in');
      else accBtn.classList.remove('is-logged-in');
    }
  },
  async logout() {
    await window.supabase.auth.signOut();
    window.location.href = '/';
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
      <img src="${(Array.isArray(item.images) ? item.images[0] : (item.images || item.img || item.image || '/images/placeholder.jpg'))}" alt="${item.name}" class="cart-item__img"/>
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

function renderWishlistDrawer() {
  const list = document.getElementById('wishlist-drawer-list');
  if (!list) return;
  if (WISHLIST.items.length === 0) {
    list.innerHTML = '<div style="text-align:center; padding:40px 0;"><p style="color:#888;">Wishlist anda kosong.</p></div>';
    return;
  }
  list.innerHTML = WISHLIST.items.map((item, i) => `
    <div class="wishlist-item">
      <img src="${(Array.isArray(item.images) ? item.images[0] : (item.images || item.img || item.image || '/images/placeholder.jpg'))}" alt="${item.name}" class="wishlist-item__img"/>
      <div class="wishlist-item__info">
        <p class="wishlist-item__name">${item.name}</p>
        <p class="wishlist-item__price">Rp ${(item.price || 0).toLocaleString('id-ID')}</p>
        <div style="display:flex; gap:10px;">
          <a href="/product.html?slug=${item.slug}" class="btn btn--outline" style="padding:6px 12px; font-size:0.8rem;">LIHAT</a>
          <button onclick="WISHLIST.toggle({slug:'${item.slug}'})" class="btn btn--outline" style="padding:6px 12px; font-size:0.8rem; color:red;">HAPUS</button>
        </div>
      </div>
    </div>
  `).join('');
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
async function initAnnouncementBar() {
  const bar = document.querySelector('.announcement-bar');
  const itemsContainer = document.querySelector('.announcement-bar__items');
  if (!bar || !itemsContainer) return;

  try {
    const { data, error } = await window.supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'announcement_text')
      .single();

    if (!error && data) {
      // Repeat the text to ensure the marquee loop is smooth
      const text = data.value;
      itemsContainer.innerHTML = Array(8).fill(`<span class="announcement-bar__item">${text}</span>`).join('');
      
      // Clone for infinite loop
      const clone = itemsContainer.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      itemsContainer.parentElement.appendChild(clone);
    }
  } catch (e) {
    console.error('Error loading announcement:', e);
  }
}

// ========== NEWSLETTER ==========
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  form.onsubmit = async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    const input = form.querySelector('input');
    const email = input.value.trim();
    
    btn.textContent = 'Menyimpan...';
    btn.disabled = true;

    try {
      const { error } = await window.supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') throw new Error('Email sudah terdaftar!');
        throw error;
      }

      btn.textContent = 'Berhasil! ✓';
      input.value = '';
      showToast('Terima kasih! Anda telah terdaftar di newsletter kami.');
    } catch (err) {
      showToast(err.message || 'Gagal mendaftar newsletter.');
      btn.textContent = 'Daftar';
      btn.disabled = false;
    }
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
  const footerLinks = document.getElementById('dynamic-footer-links');
  
  try {
    const [menuRes, catRes] = await Promise.all([
      fetch('/api/menus'),
      fetch('/api/categories')
    ]);

    if (menuRes.ok && catRes.ok) {
      const { menus } = await menuRes.json();
      const { categories } = await catRes.json();
      
      // 1. Main Nav Rendering Logic
      if (navs.length > 0) {
        const rootMenus = menus.filter(m => m.menu_group === 'main_nav' && !m.parent_id);
        
        const html = rootMenus.map(m => {
          let children = menus.filter(c => c.parent_id === m.id);
          const labelLower = m.label.toLowerCase();
          
          // Special Case: Auto-populate 'Kategori' if it has no children in DB
          if (labelLower.includes('kategori') && children.length === 0) {
            children = categories.map(cat => ({
              label: cat.name,
              custom_url: `/category.html?filter=${cat.slug}`
            }));
          }

          if (children.length > 0) {
            // Check if we should use Mega Menu (more than 5 items or 'Kategori')
            const isMega = children.length > 5 || labelLower.includes('kategori') || labelLower.includes('explore');

            if (isMega) {
              return `
                <div class="header__nav-item has-megamenu">
                  <a href="${m.custom_url || '#'}" class="header__nav-link">
                    ${m.label} <span class="nav-arrow">▼</span>
                  </a>
                  <div class="header__megamenu">
                    <div class="megamenu__inner">
                      <div class="megamenu__col megamenu__col--list">
                        <h4 class="megamenu__title">${labelLower.includes('kategori') ? 'SHOP BY CATEGORIES' : 'EXPLORE'}</h4>
                        <ul class="megamenu__list">
                          ${children.map(c => `
                            <li><a href="${c.custom_url || `/category.html?filter=${c.category_slug}`}">${c.label}</a></li>
                          `).join('')}
                        </ul>
                        ${labelLower.includes('kategori') ? '<a href="/category.html" class="megamenu__all-btn">VIEW ALL CATEGORIES →</a>' : ''}
                      </div>
                      <div class="megamenu__col megamenu__col--featured">
                        <h4 class="megamenu__title">FEATURED COLLECTIONS</h4>
                        <div class="megamenu__featured-grid">
                          ${products.slice(0, 4).map(p => `
                            <a href="/product.html?slug=${p.slug}" class="megamenu__card">
                              <div class="megamenu__img-wrap"><img src="${p.images[0]}" alt="${p.name}" /></div>
                              <span class="megamenu__card-name">${p.name}</span>
                            </a>
                          `).join('')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            } else {
              // Standard Dropdown for smaller menus
              return `
                <div class="header__nav-item has-dropdown">
                  <a href="${m.custom_url || '#'}" class="header__nav-link">
                    ${m.label} <span class="nav-arrow">▼</span>
                  </a>
                  <div class="header__dropdown">
                    <ul class="dropdown__list">
                      ${children.map(c => `
                        <li><a href="${c.custom_url || `/category.html?filter=${c.category_slug}`}">${c.label}</a></li>
                      `).join('')}
                    </ul>
                  </div>
                </div>
              `;
            }
          } else {
            return `
              <div class="header__nav-item">
                <a href="${m.category_slug ? `/category.html?filter=${m.category_slug}` : (m.custom_url || '#')}" class="header__nav-link">${m.label}</a>
              </div>
            `;
          }
        }).join('');
        
        navs.forEach(nav => nav.innerHTML = html);
      }

      // 2. Footer Nav
      if (footerLinks) {
        const groups = [
          { key: 'footer_shop', title: 'SHOP' },
          { key: 'footer_explore', title: 'EXPLORE' },
          { key: 'footer_care', title: 'CUSTOMER CARE' }
        ];
        footerLinks.innerHTML = groups.map(g => {
          const groupMenus = menus.filter(m => m.menu_group === g.key);
          if (groupMenus.length === 0) return '';
          return `
            <div class="footer__links-group">
              <h4 class="footer__links-title">${g.title}</h4>
              ${groupMenus.map(m => `
                <a href="${m.category_slug ? `/category.html?filter=${m.category_slug}` : (m.custom_url || '#')}" class="footer__link">${m.label}</a>
              `).join('')}
            </div>
          `;
        }).join('');
      }
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
        <div id="popular-searches" class="search-overlay__popular">
           <h4 style="font-size: 0.8rem; letter-spacing: 2px; color: #999; margin-bottom: 20px;">POPULAR COLLECTIONS</h4>
           <div style="display: flex; gap: 15px; flex-wrap: wrap;" id="popular-list">
             <a href="/category.html?filter=homedress" style="text-decoration:none; padding: 8px 16px; border: 1px solid #eee; border-radius: 4px; color: #333; font-size: 0.9rem;">Homedress</a>
             <a href="/category.html?filter=one-set" style="text-decoration:none; padding: 8px 16px; border: 1px solid #eee; border-radius: 4px; color: #333; font-size: 0.9rem;">One Set</a>
             <a href="/category.html?filter=new-in" style="text-decoration:none; padding: 8px 16px; border: 1px solid #eee; border-radius: 4px; color: #333; font-size: 0.9rem;">New Arrival</a>
             <a href="/category.html?filter=flash-sale" style="text-decoration:none; padding: 8px 16px; border: 1px solid #eee; border-radius: 4px; color: #333; font-size: 0.9rem;">Flash Sale ⚡</a>
           </div>
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
  const popular = document.getElementById('popular-searches');
  let timeout;

  sInput.oninput = () => {
    clearTimeout(timeout);
    const q = sInput.value.trim();
    if (q.length === 0) { 
      sResults.innerHTML = ''; 
      popular.style.display = 'block';
      return; 
    }
    popular.style.display = 'none';
    if (q.length < 2) return;

    timeout = setTimeout(async () => {
      const { data, error } = await window.supabase
        .from('products')
        .select('*')
        .ilike('name', `%${q}%`)
        .limit(10);
      
      const prods = data || [];
      if (prods.length === 0) {
        sResults.innerHTML = '<p style="padding: 20px; color: #999;">Tidak menemukan produk dengan nama tersebut.</p>';
        return;
      }
      sResults.innerHTML = prods.map(p => `
        <a href="/product.html?slug=${p.slug}" class="search-result-item">
          <img src="${(Array.isArray(p.images) ? p.images[0] : (p.images || '/images/placeholder.jpg'))}" />
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
  
  // Show Skeletons immediately
  showSkeletons('new-in-grid', 4);
  showSkeletons('home-new-arrivals', 4);
  showSkeletons('flash-sale-grid', 4);
  
  CART.updateBadge();
  WISHLIST.updateUI();
  AUTH.init();

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
  const path = window.location.pathname;
  if (path.includes('category.html')) initCategoryPagination(pData);
  if (path.includes('checkout.html')) initCheckoutPage();
  if (path.includes('faq.html')) initFAQPage();
  if (path.includes('blog')) initBlogPage();

  // Animation triggers
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('animate-in', 'is-visible');
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

  console.log('✨ Ready.');
});

// ========== CATEGORY PAGINATION ==========
function initCategoryPagination(products = []) {
  const grid = document.getElementById('category-product-grid');
  const sortSelect = document.getElementById('category-sort');
  const countText = document.getElementById('pagination-count-text');
  const titleEl = document.getElementById('category-title');
  if (!grid) return;

  const urlParams = new URLSearchParams(window.location.search);
  const filter = urlParams.get('filter');
  
  let filtered = [...products];
  if (filter) {
    if (titleEl) {
      // Set title based on filter
      const prettyTitle = filter.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      titleEl.textContent = prettyTitle;
    }

    if (filter === 'flash-sale') {
      filtered = products.filter(p => p.discount > 0 || (Array.isArray(p.category) && p.category.includes('flash-sale')));
    } else if (filter === 'best-seller') {
      filtered = products.filter(p => p.social_proof?.toLowerCase().includes('terlaris') || p.rating >= 4.5 || (Array.isArray(p.category) && p.category.includes('best-seller')));
    } else if (filter === 'new-in') {
      filtered = products.filter(p => (Array.isArray(p.category) && p.category.includes('new-in'))).slice(0, 15);
      if (filtered.length === 0) filtered = products.slice(0, 12);
    } else {
      const fLower = filter.toLowerCase();
      filtered = products.filter(p => {
        const pCats = Array.isArray(p.category) ? p.category.map(c => c.toLowerCase()) : [];
        // Match slug, or includes in array, or mapping common names
        return pCats.includes(fLower) || 
               (fLower === 'one-set' && pCats.includes('setelan')) ||
               (fLower === 'dress' && pCats.includes('homedress')) ||
               (p.category_slug && p.category_slug.toLowerCase() === fLower);
      });
    }
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
async function initCheckoutPage() {
  const form = document.getElementById('checkout-form');
  const summary = document.getElementById('checkout-summary');
  const shippingContainer = document.getElementById('shipping-options');
  const provinceInput = form?.querySelector('[name="province"]');
  if (!form || !summary) return;

  let selectedShipping = null;
  let shippingMethods = [];
  let currentProvince = '';

  const fetchShippingOptions = async (province = '') => {
    if (shippingContainer) shippingContainer.innerHTML = '<p style="color: #888;">Menghitung ongkir...</p>';
    
    try {
      // Fetch base methods
      const { data: methods } = await window.supabase.from('shipping_methods').select('*').eq('is_active', true);
      
      // Fetch rates for province
      const { data: rates } = await window.supabase.from('shipping_rates').select('*').eq('province', province || 'Jawa Timur');
      
      shippingMethods = (methods || []).map(m => {
        const rate = (rates || []).find(r => r.courier_id === m.id) || (rates || []).find(r => r.province === 'Luar Jawa' && r.courier_id === m.id);
        return {
          ...m,
          final_cost: parseFloat(m.base_cost) + (rate ? parseFloat(rate.additional_cost) : 0),
          estimation: rate ? rate.estimated_days : '3-5 hari'
        };
      });

      if (shippingContainer && shippingMethods.length > 0) {
        shippingContainer.innerHTML = shippingMethods.map((m, i) => `
          <label class="shipping-option" style="display:flex; align-items:center; gap:12px; padding:16px; border:1px solid #eee; border-radius:8px; margin-bottom:12px; cursor:pointer;">
            <input type="radio" name="shipping_method" value="${m.code}" ${i===0?'checked':''} data-cost="${m.final_cost}" />
            <div style="flex:1;">
              <p style="font-weight:600; margin:0;">${m.name}</p>
              <p style="font-size:0.85rem; color:#888; margin:0;">Estimasi ${m.estimation}</p>
            </div>
            <span style="font-weight:600;">Rp ${parseInt(m.final_cost).toLocaleString('id-ID')}</span>
          </label>
        `).join('');

        shippingContainer.querySelectorAll('input').forEach(input => {
          input.onchange = () => {
            selectedShipping = shippingMethods.find(m => m.code === input.value);
            renderSummary();
          };
        });
        selectedShipping = shippingMethods[0];
        renderSummary();
      }
    } catch (e) { console.error('Error fetching shipping:', e); }
  };

  // Listen for province change
  if (provinceInput) {
    provinceInput.onchange = (e) => {
      currentProvince = e.target.value;
      fetchShippingOptions(currentProvince);
    };
    // Initial fetch
    fetchShippingOptions(provinceInput.value);
  } else {
    fetchShippingOptions();
  }

  const renderSummary = () => {
    const items = CART.items;
    if (items.length === 0) {
      summary.innerHTML = '<p>Keranjang kosong.</p>';
      return;
    }

    const subtotal = CART.total();
    const shippingCost = selectedShipping ? parseFloat(selectedShipping.final_cost) : 0;
    const total = subtotal + shippingCost;

    summary.innerHTML = `
      <div class="checkout-summary-list">
        ${items.map(item => `
          <div class="summary-item" style="display:flex; gap:12px; margin-bottom:16px; align-items:center;">
            <div style="position:relative;">
              <img src="${(Array.isArray(item.images) ? item.images[0] : (item.images || item.img || '/images/placeholder.jpg'))}" style="width:64px; height:64px; object-fit:cover; border-radius:4px;" />
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
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Ongkos Kirim</span><span>Rp ${shippingCost.toLocaleString('id-ID')}</span></div>
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
    
    // Add user_id and items to payload
    if (window.supabase) {
      const { data: { session } } = await window.supabase.auth.getSession();
      if (session) data.user_id = session.user.id;
    }

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
        let errorMsg = result.error || 'Gagal memproses pesanan';
        if (result.details && Array.isArray(result.details)) {
          errorMsg += ': ' + result.details.join(', ');
        }
        throw new Error(errorMsg);
      }
    } catch (err) {
      errDiv.textContent = err.message;
      errDiv.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'BUAT PESANAN';
    }
  };
}

// ========== CMS LOADERS ==========
async function initFAQPage() {
  const container = document.getElementById('faq-container');
  if (!container) return;
  try {
    const { data, error } = await window.supabase.from('faqs').select('*').order('order_index');
    if (error) throw error;
    container.innerHTML = data.map(f => `
      <details class="pdp-accordion" style="margin-bottom:12px; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <summary class="pdp-accordion__summary" style="padding: 16px; background: #fafafa; font-weight: 600; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center;">
          ${f.question} <span style="font-size: 1.2rem;">+</span>
        </summary>
        <div class="pdp-accordion__content" style="padding: 20px; border-top: 1px solid #eee; line-height: 1.6; color: #555;">
          ${f.answer}
        </div>
      </details>
    `).join('');
  } catch (e) {
    container.innerHTML = '<p>Gagal memuat FAQ.</p>';
  }
}

async function initBlogPage() {
  const grid = document.getElementById('blog-grid');
  const detail = document.getElementById('blog-detail');
  if (!grid && !detail) return;

  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  if (slug && detail) {
    const { data } = await window.supabase.from('blogs').select('*').eq('slug', slug).single();
    if (data) {
      detail.innerHTML = `
        <article class="blog-post" style="max-width: 800px; margin: 0 auto; padding: 40px 20px;">
          <img src="${data.image_url}" class="blog-post__hero" style="width: 100%; height: 400px; object-fit: cover; border-radius: 12px; margin-bottom: 32px;"/>
          <h1 style="font-size: 3.2rem; font-weight: 800; margin-bottom: 16px; letter-spacing: -1px;">${data.title}</h1>
          <div class="blog-post__meta" style="color: #888; font-size: 1.1rem; margin-bottom: 40px;">By ${data.author} • ${new Date(data.created_at).toLocaleDateString()}</div>
          <div class="blog-post__content" style="font-size: 1.2rem; line-height: 1.8; color: #333;">${data.content}</div>
        </article>
      `;
    }
  } else if (grid) {
    const { data } = await window.supabase.from('blogs').select('*').eq('is_published', true).order('created_at', { ascending: false });
    if (data) {
      grid.innerHTML = data.map(b => `
        <a href="/blog.html?slug=${b.slug}" class="blog-card" style="display: block; text-decoration: none; color: inherit; transition: transform 0.3s ease;">
          <div style="aspect-ratio: 16/9; overflow: hidden; border-radius: 12px; margin-bottom: 16px;">
            <img src="${b.image_url}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;"/>
          </div>
          <h3 style="font-size: 1.6rem; font-weight: 700; margin-bottom: 8px;">${b.title}</h3>
          <p style="color: #666; margin-bottom: 12px;">${b.content.substring(0, 100)}...</p>
          <span style="font-weight: 700; color: var(--color-accent);">Read More →</span>
        </a>
      `).join('');
    }
  }
}
