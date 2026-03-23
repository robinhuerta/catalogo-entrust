// ========================================
// ENTRUST - Main JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initStickyHeader();
  initMobileMenu();
  initBackToTop();
  initScrollAnimations();
  initProductButtons();
  initSearch();
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
// PRODUCT BUTTONS — WHATSAPP
// ========================================
function initProductButtons() {
  const phone = '51930404573';

  document.querySelectorAll('.btn--outline[data-product]').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = btn.dataset.product;
      const brand = btn.dataset.brand;
      const price = btn.dataset.price;
      const msg = `Hola! Me interesa el siguiente producto:\n*${brand} - ${product}*\nPrecio: ${price}\n¿Está disponible?`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    });
  });
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
