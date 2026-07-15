(() => {
  'use strict';

  const doc = document;
  const hasGSAP = typeof window.gsap !== 'undefined';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (hasGSAP && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
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
    if (dot && ring) {
      const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power2.out' });
      const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power2.out' });
      const ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' });
      const ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });
      window.addEventListener('mousemove', (e) => {
        dotX(e.clientX); dotY(e.clientY); ringX(e.clientX); ringY(e.clientY);
      });
      doc.querySelectorAll('a, button, [data-tilt], input, textarea, select').forEach((el) => {
        el.addEventListener('mouseenter', () => ring.classList.add('is-active'));
        el.addEventListener('mouseleave', () => ring.classList.remove('is-active'));
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
   * Hero headline reveal (manual word-split)
   * ------------------------------------------------------------------ */
  doc.querySelectorAll('[data-split]').forEach((line) => {
    const words = line.textContent.trim().split(/\s+/);
    line.innerHTML = words
      .map((w) => `<span class="word" style="display:inline-block;overflow:hidden;vertical-align:top;"><span class="word__inner" style="display:inline-block;">${w}&nbsp;</span></span>`)
      .join('');
  });

  if (hasGSAP) {
    const wordInners = doc.querySelectorAll('.hero__title .word__inner');
    if (reduceMotion) {
      gsap.set(wordInners, { y: 0, opacity: 1 });
    } else {
      gsap.set(wordInners, { yPercent: 110, opacity: 0 });
      gsap.to(wordInners, { yPercent: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.05, delay: 0.5 });
    }
    gsap.from('.hero__subtitle, .hero__actions, .eyebrow', {
      opacity: 0, y: reduceMotion ? 0 : 16, duration: 0.7, ease: 'power2.out', stagger: 0.1, delay: reduceMotion ? 0 : 0.9,
    });
  }

  /* --------------------------------------------------------------------
   * Hero cinematic slideshow (crossfade + Ken Burns)
   * ------------------------------------------------------------------ */
  const heroSlides = doc.querySelectorAll('[data-hero-slides] .hero__slide');
  const heroDots = doc.querySelectorAll('[data-hero-dots] span');
  if (heroSlides.length > 1) {
    let current = 0;
    const kenBurns = (slide) => {
      if (!hasGSAP || reduceMotion) return;
      gsap.fromTo(slide, { scale: 1.08 }, { scale: 1, duration: 7, ease: 'none' });
    };
    kenBurns(heroSlides[0]);
    setInterval(() => {
      const next = (current + 1) % heroSlides.length;
      if (hasGSAP && !reduceMotion) {
        gsap.to(heroSlides[current], { opacity: 0, duration: 1.2, ease: 'power2.inOut' });
        gsap.set(heroSlides[next], { scale: 1.08 });
        gsap.to(heroSlides[next], { opacity: 1, duration: 1.2, ease: 'power2.inOut' });
        kenBurns(heroSlides[next]);
      } else {
        heroSlides[current].classList.remove('is-active');
        heroSlides[next].classList.add('is-active');
      }
      heroDots.forEach((d, i) => d.classList.toggle('is-active', i === next));
      current = next;
    }, 6000);
  }

  /* --------------------------------------------------------------------
   * Scroll reveals
   * ------------------------------------------------------------------ */
  if (hasGSAP && window.ScrollTrigger && !reduceMotion) {
    doc.querySelectorAll('[data-reveal]').forEach((el) => {
      gsap.from(el, {
        opacity: 0, y: 24, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
      });
    });

    gsap.utils.toArray('.apt-card').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0, y: 30, duration: 0.6, ease: 'power2.out', delay: (i % 4) * 0.08,
        scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none reverse' },
      });
    });

    gsap.utils.toArray('.amenity-card').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0, scale: 0.94, duration: 0.5, ease: 'power2.out', delay: (i % 3) * 0.08,
        scrollTrigger: { trigger: card, start: 'top 92%', toggleActions: 'play none none reverse' },
      });
    });
  }

  /* --------------------------------------------------------------------
   * Marquee (GSAP-driven, seamless loop)
   * ------------------------------------------------------------------ */
  const marqueeTrack = doc.querySelector('.marquee__track');
  if (marqueeTrack && hasGSAP && !reduceMotion) {
    const width = marqueeTrack.scrollWidth / 2;
    gsap.to(marqueeTrack, { x: -width, duration: width / 55, ease: 'none', repeat: -1 });
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
