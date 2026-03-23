// ========================================
// ENTRUST - Main JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initStickyHeader();
  initMobileMenu();
  initBackToTop();
  initScrollAnimations();
  initCart();
  initSearch();
  initProductGalleries();
  initProductModal();
});

// ========================================
// HERO SLIDER
// ========================================
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero__slide');
  const dots = document.querySelectorAll('.hero__dot');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');
  let currentSlide = 0;
  let autoSlideInterval;

  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 5000);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
  }

  // Event listeners
  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoSlide(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoSlide(); });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
      resetAutoSlide();
    });
  });

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  const heroEl = document.getElementById('hero');

  if (heroEl) {
    heroEl.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    heroEl.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide();
        else prevSlide();
        resetAutoSlide();
      }
    }, { passive: true });
  }

  // Start auto-slide
  startAutoSlide();
}

// ========================================
// STICKY HEADER
// ========================================
function initStickyHeader() {
  const header = document.getElementById('header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }, { passive: true });
}

// ========================================
// MOBILE MENU
// ========================================
function initMobileMenu() {
  const hamburger = document.getElementById('hamburgerBtn');
  const nav = document.getElementById('mainNav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      nav.classList.toggle('open');
      document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu on link click
    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        nav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
}

// ========================================
// BACK TO TOP
// ========================================
function initBackToTop() {
  const btn = document.getElementById('backToTop');

  if (btn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// ========================================
// SCROLL ANIMATIONS
// ========================================
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all cards and sections
  const animateElements = document.querySelectorAll(
    '.product-card, .category-card, .brand-card, .payment-card, .section-title'
  );

  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // Add CSS for animate-in class dynamically
  const style = document.createElement('style');
  style.textContent = `
    .animate-in {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);

  // Stagger animation for product cards in same row
  const productCards = document.querySelectorAll('.product-card');
  productCards.forEach((card, index) => {
    card.style.transitionDelay = `${(index % 4) * 100}ms`;
  });
}

// ========================================
// CART
// ========================================
let cart = JSON.parse(localStorage.getItem('entrust-cart') || '[]');

function initCart() {
  document.getElementById('cartBtn')?.addEventListener('click', openCart);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
  document.getElementById('cartClose')?.addEventListener('click', closeCart);
  document.getElementById('cartClear')?.addEventListener('click', clearCart);
  document.getElementById('cartCheckout')?.addEventListener('click', checkoutWhatsApp);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCart();
  });

  document.getElementById('cartEmptyLink')?.addEventListener('click', closeCart);

  // Cart item actions via event delegation
  document.getElementById('cartItems')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const key = btn.dataset.key;
    const action = btn.dataset.action;
    if (action === 'minus') cartUpdateQty(key, -1);
    else if (action === 'plus') cartUpdateQty(key, 1);
    else if (action === 'remove') cartRemove(key);
  });

  // Add to cart buttons
  document.querySelectorAll('.btn--add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const { product, brand, price } = btn.dataset;
      const imgEl = btn.closest('.product-card')?.querySelector('.product-card__img');
      const imgSrc = imgEl?.getAttribute('src') || '';
      addToCart(product, brand, price, imgSrc, btn);
    });
  });

  updateCartUI();
}

function openCart() {
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('visible');
  document.body.style.overflow = '';
}

function addToCart(product, brand, price, imgSrc, btn) {
  const key = `${brand}||${product}`;
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ key, product, brand, price, imgSrc, qty: 1 });
  }
  saveCart();
  updateCartUI();
  openCart();

  if (btn) {
    const prev = btn.innerHTML;
    btn.innerHTML = '✓ Agregado';
    btn.classList.add('btn--added');
    setTimeout(() => {
      btn.innerHTML = prev;
      btn.classList.remove('btn--added');
    }, 1200);
  }
}

function cartRemove(key) {
  cart = cart.filter(i => i.key !== key);
  saveCart();
  updateCartUI();
}

function cartUpdateQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty = Math.max(0, item.qty + delta);
  if (item.qty === 0) cartRemove(key);
  else { saveCart(); updateCartUI(); }
}

function clearCart() {
  if (!cart.length) return;
  cart = [];
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('entrust-cart', JSON.stringify(cart));
}

function getCartTotal() {
  return cart.reduce((sum, item) => {
    const num = parseFloat(item.price.replace(/[^\d.]/g, ''));
    return sum + (isNaN(num) ? 0 : num * item.qty);
  }, 0);
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);

  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });

  const dc = document.getElementById('cartDrawerCount');
  if (dc) dc.textContent = count > 0 ? `(${count})` : '';

  renderCartItems();

  const totalEl = document.getElementById('cartSubtotal');
  if (totalEl) totalEl.textContent = `S/. ${getCartTotal().toFixed(2)}`;

  const isEmpty = cart.length === 0;
  const emptyEl = document.getElementById('cartEmpty');
  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');
  if (emptyEl) emptyEl.style.display = isEmpty ? 'flex' : 'none';
  if (itemsEl) itemsEl.style.display = isEmpty ? 'none' : 'flex';
  if (footerEl) footerEl.style.display = isEmpty ? 'none' : 'flex';
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  if (!container) return;

  container.innerHTML = cart.map(item => {
    const safeKey = item.key.replace(/"/g, '&quot;');
    return `
    <div class="cart-item">
      <div class="cart-item__img-wrap">
        <img src="${item.imgSrc}" alt="${item.product}" class="cart-item__img" onerror="this.style.display='none'">
      </div>
      <div class="cart-item__info">
        <span class="cart-item__brand">${item.brand}</span>
        <p class="cart-item__name">${item.product}</p>
        <span class="cart-item__price">${item.price}</span>
      </div>
      <div class="cart-item__right">
        <div class="cart-item__qty">
          <button class="qty-btn" data-action="minus" data-key="${safeKey}">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" data-action="plus" data-key="${safeKey}">+</button>
        </div>
        <button class="cart-item__remove" data-action="remove" data-key="${safeKey}" aria-label="Eliminar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
    </div>`;
  }).join('');
}

function checkoutWhatsApp() {
  if (!cart.length) return;
  const phone = '51930404573';
  let msg = '🛒 *Pedido Entrust*\n\n';
  cart.forEach((item, i) => {
    msg += `${i + 1}. *${item.brand} - ${item.product}*\n   ${item.price} × ${item.qty} unid.\n\n`;
  });
  msg += `*TOTAL ESTIMADO: S/. ${getCartTotal().toFixed(2)}*\n\n¿Pueden confirmar disponibilidad y coordinar envío? ¡Gracias!`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

// ========================================
// SEARCH
// ========================================
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  function doSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    const cards = document.querySelectorAll('.product-card');
    let found = 0;

    cards.forEach(card => {
      const name = card.querySelector('.product-card__name')?.textContent.toLowerCase() || '';
      const brand = card.querySelector('.product-card__brand')?.textContent.toLowerCase() || '';
      const matches = name.includes(query) || brand.includes(query);
      card.style.display = matches ? '' : 'none';
      if (matches) found++;
    });

    if (found > 0) {
      document.getElementById('hombre')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', doSearch);
  }

  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') doSearch();
    });

    // Restaurar todos los productos al borrar la búsqueda
    searchInput.addEventListener('input', () => {
      if (!searchInput.value.trim()) {
        document.querySelectorAll('.product-card').forEach(card => {
          card.style.display = '';
        });
      }
    });
  }
}


// ========================================
// PRODUCT GALLERY
// ========================================
function initProductGalleries() {
  document.querySelectorAll('.product-card__image').forEach(container => {
    const imgs = container.querySelectorAll('.gallery-img');
    const dots = container.querySelectorAll('.gallery-dot');
    if (!imgs.length) return;
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        imgs.forEach(img => img.classList.remove('gallery-img--active'));
        dots.forEach(d => d.classList.remove('gallery-dot--active'));
        imgs[i].classList.add('gallery-img--active');
        dot.classList.add('gallery-dot--active');
      });
    });
  });
}


// ========================================
// PRODUCT MODAL
// ========================================
function initProductModal() {
  const modal = document.getElementById('productModal');
  const overlay = document.getElementById('modalOverlay');
  const closeBtn = document.getElementById('modalClose');
  const mainImg = document.getElementById('modalMainImg');
  const thumbsWrap = document.getElementById('modalThumbs');
  const brandEl = document.getElementById('modalBrand');
  const nameEl = document.getElementById('modalName');
  const materialsEl = document.getElementById('modalMaterials');
  const priceWrap = document.getElementById('modalPriceWrap');
  const cartBtn = document.getElementById('modalCartBtn');

  function openModal(card, clickedImgSrc) {
    const imgs = Array.from(card.querySelectorAll('.gallery-img'));
    const sources = imgs.length
      ? imgs.map(img => ({ src: img.src, alt: img.alt }))
      : [{ src: card.querySelector('.product-card__img').src, alt: '' }];

    const brand = card.querySelector('.product-card__brand')?.textContent || '';
    const name = card.querySelector('.product-card__name')?.textContent || '';
    const materials = card.dataset.materials || '';
    const price = card.querySelector('.product-card__price')?.textContent || '';
    const priceOld = card.querySelector('.product-card__price-old')?.textContent || '';
    const addCartBtn = card.querySelector('.btn--add-cart');

    brandEl.textContent = brand;
    nameEl.textContent = name;
    materialsEl.textContent = materials;
    priceWrap.innerHTML = (priceOld ? `<span class="product-modal__price-old">${priceOld}</span>` : '') +
      `<span class="product-modal__price">${price}</span>`;

    cartBtn.dataset.product = addCartBtn?.dataset.product || name;
    cartBtn.dataset.brand = addCartBtn?.dataset.brand || brand;
    cartBtn.dataset.price = addCartBtn?.dataset.price || price;

    let startIndex = 0;
    thumbsWrap.innerHTML = '';
    sources.forEach((s, i) => {
      const thumb = document.createElement('img');
      thumb.src = s.src;
      thumb.alt = s.alt;
      thumb.className = 'product-modal__thumb';
      thumb.addEventListener('click', () => setActive(i, sources));
      thumbsWrap.appendChild(thumb);
      if (s.src === clickedImgSrc) startIndex = i;
    });

    setActive(startIndex, sources);
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function setActive(index, sources) {
    mainImg.src = sources[index].src;
    mainImg.alt = sources[index].alt;
    thumbsWrap.querySelectorAll('.product-modal__thumb').forEach((t, i) => {
      t.classList.toggle('product-modal__thumb--active', i === index);
    });
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.product-card__image').forEach(container => {
    container.addEventListener('click', e => {
      if (e.target.closest('.gallery-dot')) return;
      const card = container.closest('.product-card');
      const activeImg = container.querySelector('.gallery-img--active') || container.querySelector('.product-card__img');
      openModal(card, activeImg?.src || '');
    });
  });

  cartBtn.addEventListener('click', () => {
    const fakeBtn = document.createElement('button');
    fakeBtn.dataset.product = cartBtn.dataset.product;
    fakeBtn.dataset.brand = cartBtn.dataset.brand;
    fakeBtn.dataset.price = cartBtn.dataset.price;
    fakeBtn.classList.add('btn--add-cart');
    document.body.appendChild(fakeBtn);
    fakeBtn.click();
    document.body.removeChild(fakeBtn);
    closeModal();
  });

  overlay.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}
