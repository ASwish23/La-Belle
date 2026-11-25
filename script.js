/* ================================================
   LA BELLE — script.js
   Vanilla JavaScript — No dependencies
   ================================================ */

(function () {
  'use strict';

  /* =============================================
     UTILITY
  ============================================= */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* =============================================
     HEADER — scroll shrink effect
  ============================================= */
  const header = qs('.header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }

  /* =============================================
     ACTIVE NAV LINK — highlight current page
  ============================================= */
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  qsa('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentFile) {
      link.classList.add('active');
    }
  });

  /* =============================================
     MOBILE HAMBURGER MENU
  ============================================= */
  const hamburger = qs('.hamburger');
  const nav       = qs('.nav');

  if (hamburger && nav) {
    const toggleMenu = (state) => {
      const open = state !== undefined ? state : !hamburger.classList.contains('open');
      hamburger.classList.toggle('open', open);
      nav.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    };

    hamburger.addEventListener('click', () => toggleMenu());

    // Close on nav link click
    qsa('.nav-link', nav).forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target)) toggleMenu(false);
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') toggleMenu(false);
    });
  }

  /* =============================================
     HERO CAROUSEL
  ============================================= */
  const carousel   = qs('.carousel');
  const track      = qs('.carousel-track');
  const slides     = qsa('.carousel-slide');
  const dots       = qsa('.dot');
  const prevBtn    = qs('.carousel-btn.prev');
  const nextBtn    = qs('.carousel-btn.next');

  if (track && slides.length > 0) {
    let current   = 0;
    let timer     = null;
    const total   = slides.length;
    const DELAY   = 5500; // ms between auto-advances
    // No auto-advance for visitors who ask their OS for reduced motion
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const goTo = (index) => {
      current = ((index % total) + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    };

    const startTimer = () => {
      clearInterval(timer);
      if (reduceMotion) return;
      timer = setInterval(() => goTo(current + 1), DELAY);
    };

    const stopTimer = () => clearInterval(timer);

    if (prevBtn) {
      prevBtn.addEventListener('click', () => { goTo(current - 1); stopTimer(); startTimer(); });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => { goTo(current + 1); stopTimer(); startTimer(); });
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { goTo(i); stopTimer(); startTimer(); });
    });

    // Keyboard navigation (left / right arrows) when carousel is in view
    document.addEventListener('keydown', (e) => {
      // Arrow keys inside the reviews carousel scroll the reviews, not the hero
      if (e.target.closest && e.target.closest('.reviews-track')) return;
      if (e.key === 'ArrowLeft')  { goTo(current - 1); stopTimer(); startTimer(); }
      if (e.key === 'ArrowRight') { goTo(current + 1); stopTimer(); startTimer(); }
    });

    // Touch / swipe support
    let touchStartX = 0;
    let touchStartY = 0;
    if (carousel) {
      carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }, { passive: true });

      carousel.addEventListener('touchend', (e) => {
        const dx = touchStartX - e.changedTouches[0].clientX;
        const dy = touchStartY - e.changedTouches[0].clientY;
        // Only count horizontal swipes (ignore vertical scrolls)
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
          goTo(current + (dx > 0 ? 1 : -1));
          stopTimer();
          startTimer();
        }
      }, { passive: true });
    }

    // Pause on hover
    if (carousel) {
      carousel.addEventListener('mouseenter', stopTimer);
      carousel.addEventListener('mouseleave', startTimer);
    }

    // Init
    goTo(0);
    startTimer();
  }

  /* =============================================
     REVIEWS CAROUSEL
     The track is a native sideways scroller with CSS snap points
     (swipe works on its own). Arrows and dots move one "page" — as
     many cards as fit in view — and wrap around at the ends.
  ============================================= */
  qsa('[data-reviews-carousel]').forEach(root => {
    const track    = qs('.reviews-track', root);
    const cards    = qsa('.testimonial-card', track);
    const prev     = qs('.reviews-btn.prev', root);
    const next     = qs('.reviews-btn.next', root);
    const dotsWrap = qs('.reviews-dots', root);
    if (!track || cards.length === 0) return;

    // Distance from one card's start to the next (card width + gap)
    const step     = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth);
    const perView  = () => Math.max(1, Math.round(track.clientWidth / step()));
    const pages    = () => Math.ceil(cards.length / perView());
    const maxLeft  = () => track.scrollWidth - track.clientWidth;
    const pageLeft = (page) => Math.min(page * perView(), cards.length - perView()) * step();

    const currentPage = () => {
      if (track.scrollLeft >= maxLeft() - 4) return pages() - 1;
      return Math.round(track.scrollLeft / step() / perView());
    };

    // While a button/dot-triggered scroll is animating, show its target page
    // right away instead of flickering through the pages in between
    let lockedPage = null;
    let lockTimer  = null;
    const releaseLock = () => { lockedPage = null; updateDots(); };

    const goToPage = (page) => {
      const total = pages();
      const target = ((page % total) + total) % total; // wrap around
      lockedPage = target;
      clearTimeout(lockTimer);
      lockTimer = setTimeout(releaseLock, 900);
      track.scrollTo({ left: pageLeft(target) });
      updateDots();
    };

    let dots = [];
    const buildDots = () => {
      dotsWrap.innerHTML = '';
      const total = pages();
      dots = Array.from({ length: total }, (_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'reviews-dot';
        dot.setAttribute('aria-label', `Show reviews, page ${i + 1} of ${total}`);
        dot.addEventListener('click', () => goToPage(i));
        dotsWrap.appendChild(dot);
        return dot;
      });
      // Hide the controls entirely when every review already fits
      qs('.reviews-controls', root).hidden = total < 2;
      updateDots();
    };

    const updateDots = () => {
      const active = lockedPage !== null ? lockedPage : currentPage();
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === active);
        if (i === active) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
    };

    prev.addEventListener('click', () => goToPage(currentPage() - 1));
    next.addEventListener('click', () => goToPage(currentPage() + 1));

    // Cheap (a handful of dots), so update on every scroll event, plus once
    // more when scrolling settles in browsers that support 'scrollend'
    track.addEventListener('scroll', updateDots, { passive: true });
    track.addEventListener('scrollend', () => { clearTimeout(lockTimer); releaseLock(); });

    let lastPerView = perView();
    window.addEventListener('resize', () => {
      if (perView() !== lastPerView) { lastPerView = perView(); buildDots(); }
      else updateDots();
    });

    buildDots();
  });

  /* =============================================
     SCROLL REVEAL (Intersection Observer)
  ============================================= */
  const revealEls = qsa('.reveal');
  if (revealEls.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all immediately
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* =============================================
     GALLERY LIGHTBOX (simple, accessible)
  ============================================= */
  const galleryItems = qsa('.gallery-item');

  if (galleryItems.length > 0) {
    // Create lightbox elements
    const overlay = document.createElement('div');
    overlay.id = 'lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Enlarged image');
    overlay.style.cssText = [
      'display:none',
      'position:fixed',
      'inset:0',
      'z-index:9999',
      'background:rgba(10,18,35,0.94)',
      'align-items:center',
      'justify-content:center',
      'padding:2rem',
      'cursor:zoom-out',
    ].join(';');

    const lbImg = document.createElement('img');
    lbImg.style.cssText = [
      'max-width:90vw',
      'max-height:88vh',
      'object-fit:contain',
      'border-radius:6px',
      'box-shadow:0 25px 80px rgba(0,0,0,0.6)',
      'cursor:default',
    ].join(';');

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.style.cssText = [
      'position:absolute',
      'top:0.75rem',
      'right:0.75rem',
      'background:none',
      'border:none',
      'color:#fff',
      'font-size:1.6rem',
      'padding:0.75rem',
      'cursor:pointer',
      'line-height:1',
      'opacity:0.7',
      'transition:opacity .2s',
    ].join(';');
    closeBtn.addEventListener('mouseenter', () => (closeBtn.style.opacity = '1'));
    closeBtn.addEventListener('mouseleave', () => (closeBtn.style.opacity = '0.7'));

    overlay.append(closeBtn, lbImg);
    document.body.appendChild(overlay);

    const openLightbox = (src, alt) => {
      lbImg.src = src;
      lbImg.alt = alt || '';
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };

    const closeLightbox = () => {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    };

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = qs('img', item);
        if (img) openLightbox(img.src, img.alt);
      });
      // Keyboard accessibility
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const img = qs('img', item);
          if (img) openLightbox(img.src, img.alt);
        }
      });
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target === closeBtn) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.style.display === 'flex') closeLightbox();
    });
  }

  /* =============================================
     COOKIE CONSENT
     The visitor's choice is saved in localStorage as 'all' or
     'essential'. Third-party embeds marked [data-consent-embed]
     (the Google map on programare.html) only load with 'all', or
     when the visitor clicks "Show map" on that embed. The footer's
     "Cookie Settings" button [data-cookie-settings] reopens the banner.
  ============================================= */
  const CONSENT_KEY = 'labelle-cookie-consent';
  const readConsent = () => {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  };
  const saveConsent = (value) => {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) { /* private mode: ask again next visit */ }
  };

  const loadEmbed = (wrap) => {
    const frame = wrap && qs('iframe[data-src]', wrap);
    if (!frame) return;
    frame.src = frame.dataset.src;
    frame.removeAttribute('data-src');
    frame.hidden = false;
    wrap.classList.add('is-loaded');
  };
  const loadAllEmbeds = () => qsa('[data-consent-embed]').forEach(loadEmbed);

  qsa('[data-load-embed]').forEach(btn => {
    btn.addEventListener('click', () => loadEmbed(btn.closest('[data-consent-embed]')));
  });

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.hidden = true;
  banner.innerHTML = `
    <p class="cookie-banner-title">We value your privacy</p>
    <p class="cookie-banner-text">
      This site only uses what it needs to work, including our online booking tool.
      With your permission we'll also load Google Maps, which may set its own cookies.
      See our <a href="privacy.html#cookies">Privacy Policy</a>.
    </p>
    <div class="cookie-banner-actions">
      <button type="button" class="cookie-btn cookie-btn-essential" data-consent="essential">Essential only</button>
      <button type="button" class="cookie-btn cookie-btn-accept" data-consent="all">Accept all</button>
    </div>`;
  document.body.appendChild(banner);

  let hideTimer = null;
  const showBanner = (focus) => {
    clearTimeout(hideTimer);
    banner.hidden = false;
    requestAnimationFrame(() => banner.classList.add('is-visible'));
    if (focus) qs('.cookie-btn', banner).focus();
  };
  const hideBanner = () => {
    banner.classList.remove('is-visible');
    hideTimer = setTimeout(() => { banner.hidden = true; }, 400);
  };

  qsa('[data-consent]', banner).forEach(btn => {
    btn.addEventListener('click', () => {
      const choice = btn.dataset.consent;
      saveConsent(choice);
      if (choice === 'all') loadAllEmbeds();
      hideBanner();
    });
  });

  qsa('[data-cookie-settings]').forEach(btn => {
    btn.addEventListener('click', () => showBanner(true));
  });

  const savedConsent = readConsent();
  if (savedConsent === 'all') loadAllEmbeds();
  if (!savedConsent) showBanner(false);

})();
