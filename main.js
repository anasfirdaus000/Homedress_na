/* ===============================================
   HOMEDRESS_NA — Main JavaScript
   Scroll animations, parallax, and interactivity
   =============================================== */

// ========== SCROLL REVEAL ANIMATIONS ==========
function initScrollAnimations() {
  const animateElements = document.querySelectorAll('[data-animate]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger the animation for grid items
        const parent = entry.target.parentElement;
        const siblings = parent ? parent.querySelectorAll('[data-animate]') : [];
        const siblingIndex = Array.from(siblings).indexOf(entry.target);
        
        setTimeout(() => {
          entry.target.classList.add('animate-in');
          if (entry.target.classList.contains('fade-up')) {
            entry.target.classList.add('is-visible');
          }
        }, siblingIndex * 80);
        
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  animateElements.forEach(el => observer.observe(el));
}

// ========== PARALLAX EFFECT ==========
function initParallax() {
  const parallaxSections = document.querySelectorAll('.parallax-section');
  
  if (parallaxSections.length === 0) return;
  
  let ticking = false;
  
  function updateParallax() {
    parallaxSections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (rect.top < windowHeight && rect.bottom > 0) {
        const scrollProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
        const translateY = (scrollProgress - 0.5) * 60; // Parallax intensity
        
        const img = section.querySelector('.parallax-section__image');
        if (img) {
          img.style.transform = `translateY(${translateY}px)`;
        }
      }
    });
    ticking = false;
  }
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
}

// ========== HEADER SCROLL EFFECT ==========
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;
  
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 20) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }, { passive: true });
}

// ========== PINNED SECTIONS SMOOTH EFFECT ==========
function initPinnedSections() {
  const sections = document.querySelectorAll('.pinned-section');
  if (sections.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-active');
      } else {
        entry.target.classList.remove('is-active');
      }
    });
  }, {
    threshold: 0.3
  });

  sections.forEach(sec => observer.observe(sec));
}

// ========== HERO SLIDER ==========
function initHeroSlider() {
  const slider = document.getElementById('hero-slider');
  const dots = document.querySelectorAll('#hero-dots .hero__dot');
  if (!slider || dots.length === 0) return;

  let isDown = false;
  let startX;
  let scrollLeft;
  let currentSlide = 0;
  const slideCount = dots.length;

  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.style.scrollBehavior = 'auto';
    slider.style.scrollSnapType = 'none';
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener('mouseleave', () => {
    if (!isDown) return;
    isDown = false;
    snapToSlide();
  });

  slider.addEventListener('mouseup', () => {
    if (!isDown) return;
    isDown = false;
    snapToSlide();
  });

  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.5;
    slider.scrollLeft = scrollLeft - walk;
  });

  function snapToSlide() {
    slider.style.scrollBehavior = 'smooth';
    slider.style.scrollSnapType = 'x mandatory';
    const slideWidth = slider.clientWidth;
    const targetSlide = Math.round(slider.scrollLeft / slideWidth);
    goToSlide(targetSlide);
  }

  function goToSlide(index) {
    if (index < 0) index = 0;
    if (index >= slideCount) index = slideCount - 1;
    currentSlide = index;
    const slideWidth = slider.clientWidth;
    slider.scrollTo({
      left: slideWidth * index,
      behavior: 'smooth'
    });
    updateDots(index);
  }

  function updateDots(index) {
    dots.forEach(d => d.classList.remove('hero__dot--active'));
    if(dots[index]) dots[index].classList.add('hero__dot--active');
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
      resetInterval();
    });
  });

  // Auto scroll
  let autoScrollInterval;
  function startInterval() {
    autoScrollInterval = setInterval(() => {
      currentSlide = (currentSlide + 1) % slideCount;
      goToSlide(currentSlide);
    }, 5000);
  }
  function resetInterval() {
    clearInterval(autoScrollInterval);
    startInterval();
  }

  // Handle manual scroll snapping updates
  slider.addEventListener('scroll', () => {
    if (isDown) return;
    const slideWidth = slider.clientWidth;
    const index = Math.round(slider.scrollLeft / slideWidth);
    if (index !== currentSlide && index >= 0 && index < slideCount) {
      currentSlide = index;
      updateDots(index);
    }
  }, { passive: true });

  startInterval();
}

// ========== NEWSLETTER FORM ==========
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (input && input.value) {
      const btn = form.querySelector('button');
      btn.textContent = 'Subscribed ✓';
      btn.style.background = '#4CAF50';
      btn.style.borderColor = '#4CAF50';
      btn.style.color = '#fff';
      input.value = '';
      
      setTimeout(() => {
        btn.textContent = 'Subscribe';
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.style.color = '';
      }, 3000);
    }
  });
}

// ========== PRODUCT CARD HOVER EFFECT ==========
function initProductCards() {
  const cards = document.querySelectorAll('.product-card');
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      const badge = card.querySelector('.product-card__badge--social');
      if (badge) {
        badge.style.opacity = '1';
        badge.style.transform = 'translateY(0)';
      }
    });
  });
}

// ========== ANNOUNCEMENT BAR DUPLICATE FOR SEAMLESS SCROLL ==========
function initAnnouncementBar() {
  const items = document.querySelector('.announcement-bar__items');
  if (!items) return;
  
  // Clone items for seamless loop
  const clone = items.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  items.parentElement.appendChild(clone);
}

// ========== PROMO POPUP ==========
function initPromoPopup() {
  const popup = document.getElementById('promo-popup');
  const closeBtn = document.getElementById('promo-close');
  if (!popup || !closeBtn) return;
  
  setTimeout(() => {
    popup.classList.add('is-visible');
  }, 2000);
  
  closeBtn.addEventListener('click', () => {
    popup.classList.remove('is-visible');
  });
}

// ========== PRODUCT FILTERING ==========
function initProductFilter() {
  const params = new URLSearchParams(window.location.search);
  const filter = params.get('filter');
  
  if (!filter) return;
  
  const sectionTitle = document.querySelector('.section__title');
  if (sectionTitle) {
    const titleMap = {
      'dress': 'Dress / Homedress',
      'setelan': 'Setelan',
      'atasan': 'Atasan',
      'bawahan': 'Bawahan',
      'restock': 'Restock 🔄',
      'viral': 'Lagi Viral 🔥',
      'flash-sale': 'Flash Sale ⚡',
      'diskon-10-30': 'Diskon 10-30%',
      'diskon-50': 'Diskon 50%++ 🔥',
      'bundling': 'Bundling Hemat',
      'clearance': 'Clearance Sale',
      'terlaris-minggu': 'Terlaris Minggu Ini',
      'terlaris-bulan': 'Terlaris Bulan Ini',
      'rating-tinggi': 'Produk Rating Tinggi ⭐',
      'repeat-order': 'Repeat Order Terbanyak'
    };
    
    if (titleMap[filter]) {
      const svg = sectionTitle.querySelector('svg');
      if (svg) {
        sectionTitle.innerHTML = '';
        sectionTitle.appendChild(svg);
        sectionTitle.appendChild(document.createTextNode(' ' + titleMap[filter]));
      } else {
        sectionTitle.textContent = titleMap[filter];
      }
    }
  }

  const productCards = document.querySelectorAll('.product-card');
  if (productCards.length === 0) return;
  
  let matchCount = 0;
  productCards.forEach(card => {
    const categories = card.getAttribute('data-category');
    if (!categories) {
      card.style.display = 'none';
      return;
    }
    
    const catArray = categories.split(',').map(c => c.trim());
    if (catArray.includes(filter)) {
      card.style.display = '';
      matchCount++;
    } else {
      card.style.display = 'none';
    }
  });

  // If no match found, show all so it doesn't look broken
  if (matchCount === 0) {
    productCards.forEach(card => card.style.display = '');
  }
}

// ========== PDP INTERACTIVITY ==========
function initPDP() {
  const sizeBtns = document.querySelectorAll('.pdp-size__btn:not(.pdp-size__btn--disabled)');
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const grid = e.target.closest('.pdp-size__grid');
      if (grid) {
        grid.querySelectorAll('.pdp-size__btn').forEach(b => b.classList.remove('pdp-size__btn--active'));
        e.target.classList.add('pdp-size__btn--active');
      }
    });
  });
}

// ========== PRODUCT CARD CLICK ==========
function initProductCardClick() {
  const cards = document.querySelectorAll('.product-card, .megamenu__card');
  cards.forEach(card => {
    if (card.tagName.toLowerCase() !== 'a' && !card.closest('a')) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        if (e.target.closest('.wishlist-btn') || e.target.closest('.quick-add-btn')) return;
        const nameEl = card.querySelector('.product-card__name') || card.querySelector('span');
        const name = nameEl ? nameEl.textContent.trim() : '';
        const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
        window.location.href = '/product.html?id=' + slug;
      });
    }
  });
}

// ========== CART SYSTEM ==========
window.CART = {
  items: JSON.parse(localStorage.getItem('hd_cart') || '[]'),
  save() { localStorage.setItem('hd_cart', JSON.stringify(this.items)); this.updateBadge(); },
  add(item) {
    const existing = this.items.find(i => i.id === item.id && i.size === item.size);
    if (existing) existing.qty++; else this.items.push({...item, qty: 1});
    this.save(); showToast('Ditambahkan ke keranjang!'); openCartDrawer();
  },
  remove(idx) { this.items.splice(idx, 1); this.save(); renderCartDrawer(); },
  updateQty(idx, delta) {
    this.items[idx].qty += delta;
    if (this.items[idx].qty < 1) this.items.splice(idx, 1);
    this.save(); renderCartDrawer();
  },
  total() { return this.items.reduce((s, i) => s + i.price * i.qty, 0); },
  count() { return this.items.reduce((s, i) => s + i.qty, 0); },
  updateBadge() {
    document.querySelectorAll('.cart-badge').forEach(b => {
      const c = this.count();
      b.textContent = c; b.style.display = c > 0 ? 'flex' : 'none';
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
      <img src="${item.img}" alt="${item.name}" class="cart-item__img"/>
      <div class="cart-item__info">
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__size">${item.size ? 'Size: ' + item.size : ''}</p>
        <p class="cart-item__price">Rp ${item.price.toLocaleString('id-ID')}</p>
        <div class="cart-item__qty">
          <button onclick="CART.updateQty(${i},-1)">−</button>
          <span>${item.qty}</span>
          <button onclick="CART.updateQty(${i},1)">+</button>
        </div>
      </div>
      <button class="cart-item__remove" onclick="CART.remove(${i})">✕</button>
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

function initCart() {
  CART.updateBadge();
  document.querySelectorAll('#cart-toggle').forEach(btn => btn.addEventListener('click', openCartDrawer));
  const closeBtn = document.getElementById('cart-drawer-close');
  if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
  const overlay = document.getElementById('cart-drawer-overlay');
  if (overlay) overlay.addEventListener('click', closeCartDrawer);
  const checkoutBtn = document.getElementById('cart-checkout-btn');
  if (checkoutBtn) checkoutBtn.addEventListener('click', () => { window.location.href = '/checkout.html'; });

  // PDP add to cart
  const addBtn = document.querySelector('.pdp-btn-cart');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const name = document.querySelector('.pdp-info__title')?.textContent || 'Product';
      const brand = document.querySelector('.pdp-info__brand')?.textContent || '';
      const priceEl = document.querySelector('.pdp-info__price--sale') || document.querySelector('.pdp-info__price');
      const price = parseInt((priceEl?.textContent || '0').replace(/\D/g, ''));
      const img = document.querySelector('.pdp-gallery__img')?.src || '';
      const sizeBtn = document.querySelector('.pdp-size__btn--active');
      const size = sizeBtn ? sizeBtn.textContent : '';
      CART.add({ id: name.toLowerCase().replace(/\s/g,'-'), name: brand + ' - ' + name, price, img, size });
    });
  }
  // Complete the look add
  document.querySelectorAll('.pdp-complete__add').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.pdp-complete__item');
      const name = item.querySelector('.pdp-complete__name')?.textContent || '';
      const price = parseInt((item.querySelector('.pdp-complete__price')?.textContent || '0').replace(/\D/g, ''));
      const img = item.querySelector('.pdp-complete__img')?.src || '';
      CART.add({ id: name.toLowerCase().replace(/\s/g,'-'), name, price, img, size: '' });
    });
  });
}

// ========== WISHLIST SYSTEM ==========
window.WISHLIST = {
  items: JSON.parse(localStorage.getItem('hd_wish') || '[]'),
  save() { localStorage.setItem('hd_wish', JSON.stringify(this.items)); this.updateBadge(); },
  toggle(id, name, price, img) {
    const idx = this.items.findIndex(i => i.id === id);
    if (idx >= 0) { this.items.splice(idx, 1); showToast('Dihapus dari wishlist'); }
    else { this.items.push({id, name, price, img}); showToast('Ditambahkan ke wishlist ♥'); }
    this.save(); updateWishlistButtons();
  },
  has(id) { return this.items.some(i => i.id === id); },
  updateBadge() {
    document.querySelectorAll('.wishlist-badge').forEach(b => {
      b.textContent = this.items.length; b.style.display = this.items.length > 0 ? 'flex' : 'none';
    });
  }
};

function updateWishlistButtons() {
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    const id = btn.dataset.id;
    if (WISHLIST.has(id)) { btn.classList.add('is-active'); btn.innerHTML = '♥'; }
    else { btn.classList.remove('is-active'); btn.innerHTML = '♡'; }
  });
}

function initWishlist() {
  WISHLIST.updateBadge();
  // Inject wishlist buttons into product cards
  document.querySelectorAll('.product-card').forEach(card => {
    const imgWrap = card.querySelector('.product-card__image-wrapper');
    if (!imgWrap || imgWrap.querySelector('.wishlist-btn')) return;
    const nameEl = card.querySelector('.product-card__name');
    const priceEl = card.querySelector('.product-card__price');
    const imgEl = card.querySelector('.product-card__image');
    const name = nameEl?.textContent || '';
    const id = name.toLowerCase().replace(/\s/g,'-').replace(/[^a-z0-9-]/g,'');
    const price = priceEl?.textContent || '';
    const img = imgEl?.src || '';
    const btn = document.createElement('button');
    btn.className = 'wishlist-btn'; btn.dataset.id = id;
    btn.innerHTML = WISHLIST.has(id) ? '♥' : '♡';
    if (WISHLIST.has(id)) btn.classList.add('is-active');
    btn.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); WISHLIST.toggle(id, name, price, img); });
    imgWrap.appendChild(btn);
  });
  // Header wishlist button → wishlist page
  document.querySelectorAll('[aria-label="Wishlist"]').forEach(btn => {
    btn.style.position = 'relative';
    if (!btn.querySelector('.wishlist-badge')) {
      const badge = document.createElement('span'); badge.className = 'wishlist-badge header-badge';
      badge.textContent = WISHLIST.items.length; badge.style.display = WISHLIST.items.length > 0 ? 'flex' : 'none';
      btn.appendChild(badge);
    }
    btn.addEventListener('click', () => { window.location.href = '/wishlist.html'; });
  });
}

// ========== TOAST NOTIFICATION ==========
function showToast(msg) {
  let t = document.getElementById('toast-notification');
  if (!t) { t = document.createElement('div'); t.id = 'toast-notification'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('is-visible');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('is-visible'), 2500);
}

// ========== SEARCH OVERLAY ==========
function initSearch() {
  const searchInput = document.querySelector('.header__search-input');
  if (!searchInput) return;
  let overlay = document.getElementById('search-overlay');
  if (!overlay) {
    overlay = document.createElement('div'); overlay.id = 'search-overlay'; overlay.className = 'search-overlay';
    overlay.innerHTML = `<div class="search-overlay__inner">
      <div class="search-overlay__header"><input type="text" placeholder="Cari produk..." class="search-overlay__input" id="search-overlay-input"/><button id="search-overlay-close" class="search-overlay__close">✕</button></div>
      <div class="search-overlay__results" id="search-results"><p class="search-overlay__hint">Ketik untuk mencari produk...</p></div>
    </div>`;
    document.body.appendChild(overlay);
  }
  searchInput.addEventListener('focus', () => { overlay.classList.add('is-open'); document.getElementById('search-overlay-input')?.focus(); document.body.style.overflow = 'hidden'; });
  document.getElementById('search-overlay-close')?.addEventListener('click', () => { overlay.classList.remove('is-open'); document.body.style.overflow = ''; });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) { overlay.classList.remove('is-open'); document.body.style.overflow = ''; }});
  
  const sInput = document.getElementById('search-overlay-input');
  // Use PRODUCTS from products-data.js if available, else fallback
  const getSearchProducts = () => {
    if (window.PRODUCTS) return window.PRODUCTS;
    return [
      {id:'setelan-santai-mint-premium',name:'Setelan Santai Mint Premium',price:189000,images:['/images/1_0d097d33-95ec-49db-909b-b31fb077219f.png']},
      {id:'dress-kasual-navy-blue',name:'Dress Kasual Navy Blue',price:145000,images:['/images/Untitled_design-22_95380a0c-9058-49dc-bafa-b6a272ab8fce.png']},
      {id:'setelan-hitam-olahraga-santai',name:'Setelan Hitam Olahraga & Santai',price:120000,images:['/images/17_35192b6b-4ccc-4e6a-9773-1db1109d9287.png']},
      {id:'atasan-piyama-lengan-panjang',name:'Atasan Piyama Lengan Panjang',price:99000,images:['/images/Untitled_design_29917e1b-5767-46fd-a07a-802abac5ece3.png']},
      {id:'celana-santai-hitam',name:'Celana Santai Hitam',price:85000,images:['/images/BDB699C6-5555-4650-A463-0FE7112241FD.jpg']},
    ];
  };
  if (sInput) sInput.addEventListener('input', () => {
    const q = sInput.value.toLowerCase().trim();
    const res = document.getElementById('search-results');
    if (!q) { res.innerHTML = '<p class="search-overlay__hint">Ketik untuk mencari produk...</p>'; return; }
    const products = getSearchProducts();
    const matches = products.filter(p => p.name.toLowerCase().includes(q));
    if (matches.length === 0) { res.innerHTML = '<p class="search-overlay__hint">Tidak ada hasil untuk "'+q+'"</p>'; return; }
    res.innerHTML = matches.map(p => `<a href="/product.html?id=${p.id}" class="search-result-item"><img src="${p.images[0]}" alt=""/><div><strong>${p.name}</strong><span>Rp ${p.price.toLocaleString('id-ID')}</span></div></a>`).join('');
  });
}

// ========== MOBILE MENU ==========
function initMobileMenu() {
  const header = document.getElementById('header');
  if (!header || header.querySelector('.mobile-menu-btn')) return;
  const btn = document.createElement('button');
  btn.className = 'mobile-menu-btn'; btn.setAttribute('aria-label','Menu');
  btn.innerHTML = '<span></span><span></span><span></span>';
  header.querySelector('.header__left')?.prepend(btn);
  
  let mobileNav = document.getElementById('mobile-nav-drawer');
  if (!mobileNav) {
    const nav = header.querySelector('.header__nav');
    mobileNav = document.createElement('div'); mobileNav.id = 'mobile-nav-drawer'; mobileNav.className = 'mobile-nav-drawer';
    const links = nav ? nav.querySelectorAll('.header__nav-item') : [];
    let html = '<div class="mobile-nav__header"><span class="mobile-nav__logo">HOMEDRESS_NA</span><button class="mobile-nav__close" id="mobile-nav-close">✕</button></div><nav class="mobile-nav__links">';
    links.forEach(item => {
      const a = item.querySelector('.header__nav-link');
      if (a) html += `<a href="${a.getAttribute('href')}" class="mobile-nav__link">${a.textContent.replace('▼','').trim()}</a>`;
    });
    html += '</nav>';
    mobileNav.innerHTML = html;
    document.body.appendChild(mobileNav);
  }
  btn.addEventListener('click', () => { mobileNav.classList.add('is-open'); document.body.style.overflow = 'hidden'; });
  document.getElementById('mobile-nav-close')?.addEventListener('click', () => { mobileNav.classList.remove('is-open'); document.body.style.overflow = ''; });
}

// ========== ACCOUNT POPUP ==========
function initAccount() {
  document.querySelectorAll('[aria-label="Account"]').forEach(btn => {
    btn.addEventListener('click', () => { showToast('Fitur login akan segera hadir!'); });
  });
}

// ========== PRODUCT COUNT & SORT ==========
function initSortAndCount() {
  const grid = document.getElementById('category-product-grid');
  if (!grid) return;
  const header = grid.closest('section')?.querySelector('.section__header');
  if (!header) return;
  // Product count
  const visibleCards = grid.querySelectorAll('.product-card:not([style*="display: none"])');
  let countEl = document.getElementById('product-count');
  if (!countEl) {
    countEl = document.createElement('span'); countEl.id = 'product-count'; countEl.className = 'product-count';
    header.querySelector('.section__title')?.after(countEl);
  }
  countEl.textContent = ` (${visibleCards.length} produk)`;
  // Sort dropdown
  if (!document.getElementById('sort-select')) {
    const sortWrap = document.createElement('div'); sortWrap.className = 'sort-wrap';
    sortWrap.innerHTML = `<label>Sort by:</label><select id="sort-select"><option value="default">Default</option><option value="price-asc">Harga: Rendah ke Tinggi</option><option value="price-desc">Harga: Tinggi ke Rendah</option><option value="name-asc">A - Z</option></select>`;
    header.appendChild(sortWrap);
  }
  document.getElementById('sort-select')?.addEventListener('change', (e) => {
    const cards = Array.from(grid.querySelectorAll('.product-card'));
    cards.sort((a, b) => {
      const pa = parseInt((a.querySelector('.product-card__price')?.textContent || '0').replace(/\D/g, ''));
      const pb = parseInt((b.querySelector('.product-card__price')?.textContent || '0').replace(/\D/g, ''));
      const na = a.querySelector('.product-card__name')?.textContent || '';
      const nb = b.querySelector('.product-card__name')?.textContent || '';
      if (e.target.value === 'price-asc') return pa - pb;
      if (e.target.value === 'price-desc') return pb - pa;
      if (e.target.value === 'name-asc') return na.localeCompare(nb);
      return 0;
    });
    cards.forEach(c => grid.appendChild(c));
  });
}

// ========== INJECT CART DRAWER HTML ==========
function injectCartDrawer() {
  if (document.getElementById('cart-drawer')) return;
  const drawer = document.createElement('div');
  drawer.innerHTML = `
  <div id="cart-drawer-overlay" class="drawer-overlay"></div>
  <div id="cart-drawer" class="cart-drawer">
    <div class="cart-drawer__header">
      <h3>Keranjang Belanja</h3>
      <button id="cart-drawer-close" class="cart-drawer__close">✕</button>
    </div>
    <div id="cart-drawer-empty" class="cart-drawer__empty" style="display:block;">
      <p>Keranjang masih kosong</p><a href="/category.html" class="cart-drawer__shop-btn">BELANJA SEKARANG</a>
    </div>
    <div id="cart-drawer-list" class="cart-drawer__list"></div>
    <div class="cart-drawer__footer">
      <div class="cart-drawer__total"><span>Total:</span><strong id="cart-drawer-total">Rp 0</strong></div>
      <button id="cart-checkout-btn" class="cart-drawer__checkout">CHECKOUT</button>
    </div>
  </div>`;
  document.body.appendChild(drawer);
  // Add cart badge to cart buttons
  document.querySelectorAll('#cart-toggle').forEach(btn => {
    btn.style.position = 'relative';
    if (!btn.querySelector('.cart-badge')) {
      const badge = document.createElement('span'); badge.className = 'cart-badge header-badge';
      btn.appendChild(badge);
    }
  });
}

// ========== CHECKOUT PAGE ==========
function initCheckout() {
  const form = document.getElementById('checkout-form');
  if (!form) return;
  const summary = document.getElementById('checkout-summary');
  if (summary) {
    if (CART.items.length === 0) {
      summary.innerHTML = '<p>Keranjang kosong. <a href="/category.html">Belanja dulu</a></p>';
    } else {
      summary.innerHTML = CART.items.map(i => `<div class="checkout-item"><img src="${i.img}" alt=""/><div><strong>${i.name}</strong><p>${i.size ? 'Size: '+i.size : ''} × ${i.qty}</p><p>Rp ${(i.price*i.qty).toLocaleString('id-ID')}</p></div></div>`).join('') + `<div class="checkout-total"><strong>Total: Rp ${CART.total().toLocaleString('id-ID')}</strong></div>`;
    }
  }
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (CART.items.length === 0) {
      alert("Keranjang belanja kosong!");
      return;
    }

    const submitBtn = document.getElementById('btn-submit-checkout');
    const errorEl = document.getElementById('checkout-error');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'MEMPROSES...';
    errorEl.style.display = 'none';

    try {
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      
      // Add cart items
      payload.items = CART.items.map(item => ({
        product_id: item.id, // backend expects the slug
        quantity: item.qty,
        size: item.size || null
      }));

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat memproses pesanan.');
      }

      // Success
      CART.items = []; 
      CART.save();
      
      showToast('Pesanan berhasil dibuat! 🎉');
      
      // Redirect to tracking page
      setTimeout(() => { 
        window.location.href = `/track-order.html?order_id=${data.order.order_number}&phone=${payload.customer_phone}`; 
      }, 1500);

    } catch (err) {
      console.error(err);
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'BUAT PESANAN';
    }
  });
}

// ========== 3D TILT EFFECT ==========
function initTilt() {
  const tiltElements = document.querySelectorAll('.seo-hero__image-wrapper');
  tiltElements.forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xPercent = (x / rect.width - 0.5) * 20; // max rotation
      const yPercent = (y / rect.height - 0.5) * -20;
      el.style.transform = `perspective(1000px) rotateX(${yPercent}deg) rotateY(${xPercent}deg)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
  });
}

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', () => {
  injectCartDrawer();
  initScrollAnimations();
  initParallax();
  initHeaderScroll();
  initHeroSlider();
  initNewsletter();
  initProductCards();
  initAnnouncementBar();
  initPinnedSections();
  initPromoPopup();
  initProductFilter();
  initPDP();
  initProductCardClick();
  initTilt();
  initCart();
  initWishlist();
  initSearch();
  initMobileMenu();
  initAccount();
  initSortAndCount();
  initCheckout();
});
