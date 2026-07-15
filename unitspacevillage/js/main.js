(() => {
  'use strict';

  const doc = document;
  const hasGSAP = typeof window.gsap !== 'undefined';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (hasGSAP && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* --------------------------------------------------------------------
   * Loader
   * ------------------------------------------------------------------ */
  const loader = doc.querySelector('.loader');
  const hideLoader = () => {
    if (!loader) return;
    if (hasGSAP && !reduceMotion) {
      gsap.to(loader, { opacity: 0, duration: 0.6, ease: 'power2.out', delay: 0.35, onComplete: () => loader.remove() });
    } else {
      loader.remove();
    }
  };
  window.addEventListener('load', hideLoader);
  setTimeout(hideLoader, 2200);

  /* --------------------------------------------------------------------
   * Footer year
   * ------------------------------------------------------------------ */
  const yearEl = doc.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* --------------------------------------------------------------------
   * Custom cursor
   * ------------------------------------------------------------------ */
  if (isFinePointer && hasGSAP) {
    const dot = doc.querySelector('.cursor-dot');
    const ring = doc.querySelector('.cursor-ring');
    const cursorLabel = doc.querySelector('[data-cursor-label]');
    if (dot && ring) {
      const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power2.out' });
      const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power2.out' });
      const ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' });
      const ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });
      window.addEventListener('mousemove', (e) => {
        dotX(e.clientX); dotY(e.clientY); ringX(e.clientX); ringY(e.clientY);
      });

      doc.querySelectorAll('a, button, [data-tilt], input, textarea, select').forEach((el) => {
        if (el.hasAttribute('data-cursor')) return; // handled separately below
        el.addEventListener('mouseenter', () => ring.classList.add('is-active'));
        el.addEventListener('mouseleave', () => ring.classList.remove('is-active'));
      });

      // Cards that show a text label ("View") inside the cursor ring on hover
      doc.querySelectorAll('[data-cursor]').forEach((el) => {
        el.addEventListener('mouseenter', () => {
          if (cursorLabel) cursorLabel.textContent = el.getAttribute('data-cursor');
          ring.classList.add('has-label');
        });
        el.addEventListener('mouseleave', () => {
          ring.classList.remove('has-label');
        });
      });
    }
  }

  /* --------------------------------------------------------------------
   * Header show/hide + scrolled state
   * ------------------------------------------------------------------ */
  const header = doc.querySelector('[data-header]');
  if (header) {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 12);
      if (y > lastY && y > 160) header.classList.add('is-hidden');
      else header.classList.remove('is-hidden');
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --------------------------------------------------------------------
   * Mobile nav
   * ------------------------------------------------------------------ */
  const burger = doc.querySelector('[data-burger]');
  const mobileNav = doc.querySelector('[data-mobile-nav]');
  if (burger && mobileNav) {
    const closeMenu = () => {
      burger.classList.remove('is-open');
      mobileNav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    };
    burger.addEventListener('click', () => {
      const isOpen = burger.classList.toggle('is-open');
      mobileNav.classList.toggle('is-open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
    });
    mobileNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  }

  /* --------------------------------------------------------------------
   * Magnetic buttons
   * ------------------------------------------------------------------ */
  if (isFinePointer && hasGSAP) {
    doc.querySelectorAll('[data-magnetic]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'elastic.out(1,0.4)' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'elastic.out(1,0.4)' });
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.3);
      });
      el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  /* --------------------------------------------------------------------
   * Tilt cards
   * ------------------------------------------------------------------ */
  if (isFinePointer && hasGSAP) {
    doc.querySelectorAll('[data-tilt]').forEach((el) => {
      const rotX = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' });
      const rotY = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' });
      const lift = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
      el.style.transformPerspective = 800;
      el.style.transformStyle = 'preserve-3d';
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        rotY(px * 8); rotX(py * -8); lift(-4);
      });
      el.addEventListener('mouseleave', () => { rotX(0); rotY(0); lift(0); });
    });
  }

  /* --------------------------------------------------------------------
   * Opening scene entrance (title/subtitle/actions fade+rise on load)
   * ------------------------------------------------------------------ */
  if (hasGSAP) {
    gsap.from('.scenes__panel.is-active .scenes__title', {
      opacity: 0, y: reduceMotion ? 0 : 28, duration: 0.9, ease: 'expo.out', delay: reduceMotion ? 0 : 0.5,
    });
    gsap.from('.scenes__panel.is-active .scenes__subtitle, .scenes__panel.is-active .scenes__actions, .scenes__top', {
      opacity: 0, y: reduceMotion ? 0 : 16, duration: 0.7, ease: 'power2.out', stagger: 0.1, delay: reduceMotion ? 0 : 0.85,
    });
  }

  /* --------------------------------------------------------------------
   * Cinematic scroll-pinned scene sequence
   * (crossfading photography + Ken Burns + synced captions + counter,
   *  driven entirely by scroll position — not a timer)
   * ------------------------------------------------------------------ */
  const scenesSection = doc.querySelector('[data-scenes]');
  if (scenesSection) {
    const images = Array.from(scenesSection.querySelectorAll('[data-scene-img]'));
    const panels = Array.from(scenesSection.querySelectorAll('[data-scene-panel]'));
    const counterCurrent = scenesSection.querySelector('[data-scene-current]');
    const counterTotal = scenesSection.querySelector('[data-scene-total]');
    const hint = scenesSection.querySelector('[data-scenes-hint]');
    const n = images.length;
    if (counterTotal) counterTotal.textContent = String(n).padStart(2, '0');

    if (hasGSAP && window.ScrollTrigger && !reduceMotion && n > 1) {
      const perScene = 90; // vh-equivalent scroll distance per scene
      let activeIndex = 0;
      let hintHidden = false;

      const st = {
        trigger: scenesSection,
        start: 'top top',
        end: () => '+=' + n * perScene + '%',
        scrub: 0.5,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (!hintHidden && self.progress > 0.02 && hint) {
            hintHidden = true;
            gsap.to(hint, { opacity: 0, duration: 0.4 });
          }
          const idx = Math.min(n - 1, Math.floor(self.progress * n));
          if (idx !== activeIndex) {
            images[activeIndex].classList.remove('is-active');
            images[idx].classList.add('is-active');
            panels[activeIndex].classList.remove('is-active');
            panels[idx].classList.add('is-active');
            if (counterCurrent) counterCurrent.textContent = String(idx + 1).padStart(2, '0');
            activeIndex = idx;
          }
        },
      };

      const tl = gsap.timeline({ scrollTrigger: st });

      images.forEach((img, i) => {
        // Continuous slow push-in for the entire window this image is on screen
        tl.fromTo(img, { scale: 1.14 }, { scale: 1, ease: 'none', duration: 1 }, i);
        if (i > 0) {
          tl.to(images[i - 1], { opacity: 0, duration: 0.28, ease: 'power1.inOut' }, i - 0.14);
          tl.fromTo(images[i], { opacity: 0 }, { opacity: 1, duration: 0.28, ease: 'power1.inOut' }, i - 0.14);
          tl.to(panels[i - 1], { opacity: 0, y: -18, duration: 0.22, ease: 'power1.in' }, i - 0.16);
          tl.fromTo(panels[i], { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, i - 0.02);
        }
      });
    } else {
      // Reduced motion / no GSAP: reveal each panel+image as it scrolls into view
      images.forEach((img) => img.classList.add('is-active'));
    }
  }

  /* --------------------------------------------------------------------
   * Scroll reveals
   * ------------------------------------------------------------------ */
  if (hasGSAP && window.ScrollTrigger && !reduceMotion) {
    doc.querySelectorAll('[data-reveal]').forEach((el) => {
      gsap.from(el, {
        opacity: 0, y: 28, duration: 0.7, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
      });
    });

    gsap.utils.toArray('.apt-card').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0, y: 46, rotate: i % 2 === 0 ? -1.5 : 1.5, duration: 0.8, ease: 'expo.out', delay: (i % 4) * 0.09,
        scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none reverse' },
      });
    });

    gsap.utils.toArray('.amenity-card').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0, scale: 0.9, y: 20, duration: 0.65, ease: 'expo.out', delay: (i % 3) * 0.08,
        scrollTrigger: { trigger: card, start: 'top 92%', toggleActions: 'play none none reverse' },
      });
    });

    // Cinematic clip-path reveal for large section photography (welcome, price guarantee)
    doc.querySelectorAll('[data-reveal-media]').forEach((wrap) => {
      const img = wrap.querySelector('img');
      gsap.fromTo(
        wrap,
        { clipPath: 'inset(0 0 100% 0)' },
        {
          clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'expo.inOut',
          scrollTrigger: { trigger: wrap, start: 'top 85%', toggleActions: 'play none none reverse' },
        }
      );
      if (img) {
        gsap.fromTo(img, { scale: 1.25, y: -20 }, {
          scale: 1, y: 0, duration: 1.3, ease: 'expo.out',
          scrollTrigger: { trigger: wrap, start: 'top 85%', toggleActions: 'play none none reverse' },
        });
        // Subtle continuous parallax while the image scrolls through the viewport
        gsap.to(img, {
          yPercent: 8, ease: 'none',
          scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        });
      }
    });
  }

  /* --------------------------------------------------------------------
   * Marquee — seamless loop that speeds up with scroll velocity
   * ------------------------------------------------------------------ */
  const marqueeTrack = doc.querySelector('.marquee__track');
  if (marqueeTrack && hasGSAP && !reduceMotion) {
    const width = marqueeTrack.scrollWidth / 2;
    const baseDuration = width / 55;
    const marqueeTween = gsap.to(marqueeTrack, { x: -width, duration: baseDuration, ease: 'none', repeat: -1 });

    if (window.ScrollTrigger) {
      ScrollTrigger.create({
        trigger: marqueeTrack,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const boost = 1 + Math.min(3, Math.abs(self.getVelocity()) / 1200);
          gsap.to(marqueeTween, { timeScale: boost, duration: 0.3, overwrite: true });
        },
        onLeave: () => gsap.to(marqueeTween, { timeScale: 1, duration: 0.6 }),
        onLeaveBack: () => gsap.to(marqueeTween, { timeScale: 1, duration: 0.6 }),
      });
    }
  }

  /* --------------------------------------------------------------------
   * Animated counters
   * ------------------------------------------------------------------ */
  const counters = doc.querySelectorAll('[data-counter]');
  if (counters.length) {
    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute('data-target'), 10) || 0;
      if (reduceMotion || !hasGSAP) { el.textContent = target; return; }
      const obj = { val: 0 };
      gsap.to(obj, { val: target, duration: 1.5, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(obj.val); } });
    };
    if (hasGSAP && window.ScrollTrigger) {
      counters.forEach((el) => {
        ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => animateCounter(el) });
      });
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* --------------------------------------------------------------------
   * Portal transitions
   * ------------------------------------------------------------------ */
  if (hasGSAP && window.ScrollTrigger && !reduceMotion) {
    doc.querySelectorAll('[data-portal]').forEach((portal) => {
      const circle = portal.querySelector('[data-portal-circle]');
      if (!circle) return;
      const toColor = portal.getAttribute('data-portal-color') || '#f6f1e7';
      gsap.timeline({ scrollTrigger: { trigger: portal, start: 'top top', end: 'bottom bottom', scrub: 0.6 } })
        .fromTo(circle, { scale: 0.2, opacity: 0.85 }, { scale: 70, opacity: 1, ease: 'power1.inOut', duration: 1 }, 0)
        .to(circle, { backgroundColor: toColor, duration: 0.45 }, 0.6);
    });
  }

  /* --------------------------------------------------------------------
   * FAQ accordion
   * ------------------------------------------------------------------ */
  doc.querySelectorAll('.accordion__item').forEach((item) => {
    const trigger = item.querySelector('.accordion__trigger');
    trigger.addEventListener('click', () => {
      const wasOpen = item.classList.contains('is-open');
      item.closest('[data-accordion]').querySelectorAll('.accordion__item').forEach((i) => i.classList.remove('is-open'));
      if (!wasOpen) item.classList.add('is-open');
    });
  });

  /* --------------------------------------------------------------------
   * Contact form (demo validation only)
   * ------------------------------------------------------------------ */
  const form = doc.querySelector('[data-form]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      const nameInput = form.querySelector('#name');
      const emailInput = form.querySelector('#email');

      const setError = (input, message) => {
        const row = input.closest('.form__row');
        const errorEl = form.querySelector(`[data-error-for="${input.name}"]`);
        if (message) { row.classList.add('has-error'); if (errorEl) errorEl.textContent = message; valid = false; }
        else { row.classList.remove('has-error'); if (errorEl) errorEl.textContent = ''; }
      };

      setError(nameInput, nameInput.value.trim().length < 2 ? 'Please enter your name' : '');
      setError(emailInput, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim()) ? 'Please enter a valid email' : '');

      if (!valid) return;

      form.classList.add('is-success');
      if (!form.querySelector('.form__success')) {
        const success = doc.createElement('p');
        success.className = 'form__success';
        success.textContent = 'Thank you — we will reply shortly.';
        form.appendChild(success);
      }
      form.reset();
    });
  }
})();
