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

    const goTo = (index) => {
      current = ((index % total) + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    };

    const startTimer = () => {
      clearInterval(timer);
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
     BOOKING FORM — validation & success state
  ============================================= */
  const bookingFormEl = qs('#bookingForm');
  const formSuccess   = qs('.form-success');

  if (bookingFormEl) {
    bookingFormEl.addEventListener('submit', (e) => {
      e.preventDefault();

      // Basic client-side validation
      const required = qsa('[required]', bookingFormEl);
      let valid = true;

      required.forEach(field => {
        field.classList.remove('error');
        if (!field.value.trim()) {
          field.classList.add('error');
          valid = false;
        }
      });

      if (!valid) {
        const first = required.find(f => !f.value.trim());
        if (first) first.focus();
        return;
      }

      // Simulate submission — hide form, show success
      bookingFormEl.style.display = 'none';
      if (formSuccess) {
        formSuccess.classList.add('show');
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    // Re-validate field on input after error
    qsa('[required]', bookingFormEl).forEach(field => {
      field.addEventListener('input', () => {
        if (field.value.trim()) {
          field.classList.remove('error');
        }
      });
    });
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

})();
