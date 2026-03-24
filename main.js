/**
 * main.js — TJ Marek Portfolio
 * Global JS that runs on every page.
 * No frameworks. No build step. Just fast, clean vanilla JS.
 *
 * Table of Contents
 * ─────────────────────────────────────────────
 *  1.  Utilities
 *  2.  Theme (dark / light)
 *  3.  Scroll progress bar
 *  4.  Sticky header + scroll direction hide/show
 *  5.  Mobile menu
 *  6.  Page transition (curtain)
 *  7.  Scroll reveal (IntersectionObserver)
 *  8.  Hero headline — shutter reveal
 *  9.  Hero typewriter subtitle
 * 10.  Split-text hover (letter shimmer)
 * 11.  Magnetic nav links
 * 12.  Counter animation (stats bar)
 * 13.  Ticker / marquee (hero skill strip)
 * 14.  Cursor (custom follower)
 * 15.  Timeline reveal
 * 16.  GSAP ScrollTrigger parallax
 * 17.  Work card hover tilt
 * 18.  Work card filter (work.html only)
 * 19.  Case study overlay (work.html only)
 * 20.  Headshot 3D tilt (about.html only)
 * 21.  Contact form + path selector (contact.html only)
 * 22.  Last.fm music widget (about.html only)
 * 23.  Keyboard & accessibility helpers
 * ─────────────────────────────────────────────
 */

(() => {
  'use strict';

  /* ════════════════════════════════════════════
     1. UTILITIES
  ════════════════════════════════════════════ */
  const $  = (selector, ctx = document) => ctx.querySelector(selector);
  const $$ = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];

  const on = (el, event, handler, options = {}) => {
    if (!el) return;
    el.addEventListener(event, handler, options);
  };

  const onAll = (els, event, handler) => {
    els.forEach(el => on(el, event, handler));
  };

  /** Run fn after DOM is ready */
  const ready = (fn) => {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  };

  /** Clamp a number between min and max */
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  /** Linear interpolation */
  const lerp = (a, b, t) => a + (b - a) * t;

  /** Detect reduced-motion preference */
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Detect touch device */
  const isTouch = () =>
    window.matchMedia('(hover: none) and (pointer: coarse)').matches;


  /* ════════════════════════════════════════════
     2. THEME — DARK / LIGHT
  ════════════════════════════════════════════ */
  const initTheme = () => {
    const html      = document.documentElement;
    const toggleBtn = $('#theme-toggle');
    const stored    = localStorage.getItem('tj-theme');
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark' : 'light';
    const theme = stored || preferred;

    html.setAttribute('data-theme', theme);

    on(toggleBtn, 'click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('tj-theme', next);

      // Announce to screen readers
      toggleBtn?.setAttribute('aria-label',
        `Switch to ${next === 'dark' ? 'light' : 'dark'} mode`);
    });

    // Sync across tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'tj-theme' && e.newValue) {
        html.setAttribute('data-theme', e.newValue);
      }
    });
  };


  /* ════════════════════════════════════════════
     3. SCROLL PROGRESS BAR
  ════════════════════════════════════════════ */
  const initScrollProgress = () => {
    const bar = $('#scroll-progress');
    if (!bar) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (ticking) return;
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        const total    = document.body.scrollHeight - window.innerHeight;
        bar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
        ticking = false;
      });
      ticking = true;
    }, { passive: true });
  };


  /* ════════════════════════════════════════════
     4. STICKY HEADER + SCROLL DIRECTION
  ════════════════════════════════════════════ */
  const initHeader = () => {
    const header = $('#site-header');
    if (!header) return;

    let lastY   = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (ticking) return;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        header.classList.toggle('scrolled', currentY > 60);

        // Hide header when scrolling down fast, show on scroll up
        if (currentY > 120) {
          if (currentY > lastY + 8) {
            header.classList.add('header--hidden');
          } else if (currentY < lastY - 4) {
            header.classList.remove('header--hidden');
          }
        } else {
          header.classList.remove('header--hidden');
        }

        lastY   = currentY;
        ticking = false;
      });
      ticking = true;
    }, { passive: true });
  };


  /* ════════════════════════════════════════════
     5. MOBILE MENU
  ════════════════════════════════════════════ */
  const initMobileMenu = () => {
    const menuBtn   = $('#menu-toggle');
    const mobileNav = $('#mobile-nav');
    if (!menuBtn || !mobileNav) return;

    const open  = () => {
      mobileNav.classList.add('open');
      menuBtn.classList.add('open');
      menuBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      // Focus first link for accessibility
      setTimeout(() => mobileNav.querySelector('.nav-link')?.focus(), 100);
    };

    const close = () => {
      mobileNav.classList.remove('open');
      menuBtn.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      menuBtn.focus();
    };

    on(menuBtn, 'click', () =>
      mobileNav.classList.contains('open') ? close() : open());

    // Close on nav link click
    onAll($$('.nav-link', mobileNav), 'click', close);

    // Close on Escape
    on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) close();
    });

    // Close on outside click
    on(document, 'click', (e) => {
      if (mobileNav.classList.contains('open')
          && !mobileNav.contains(e.target)
          && !menuBtn.contains(e.target)) close();
    });
  };


  /* ════════════════════════════════════════════
     6. PAGE TRANSITION — AMBER CURTAIN
  ════════════════════════════════════════════ */
  const initPageTransition = () => {
    const curtain = $('#page-transition');
    if (!curtain) return;

    // Curtain slides up on page load
    curtain.style.transform       = 'scaleY(1)';
    curtain.style.transformOrigin = 'top';

    requestAnimationFrame(() => requestAnimationFrame(() => {
      curtain.style.transition = 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)';
      curtain.style.transform  = 'scaleY(0)';
    }));

    // Curtain slides down on internal nav
    const internalLinks = $$('a[href]').filter(a => {
      const href = a.getAttribute('href');
      return (
        href &&
        !href.startsWith('http') &&
        !href.startsWith('mailto') &&
        !href.startsWith('tel') &&
        !href.startsWith('#') &&
        !a.hasAttribute('download') &&
        href !== window.location.pathname.split('/').pop()
      );
    });

    onAll(internalLinks, 'click', (e) => {
      const href = e.currentTarget.getAttribute('href');
      if (!href) return;
      e.preventDefault();

      curtain.style.transition     = 'transform 0.42s cubic-bezier(0.65, 0, 0.35, 1)';
      curtain.style.transformOrigin = 'bottom';
      curtain.style.transform      = 'scaleY(1)';

      setTimeout(() => { window.location.href = href; }, 440);
    });
  };


  /* ════════════════════════════════════════════
     7. SCROLL REVEAL — INTERSECTION OBSERVER
  ════════════════════════════════════════════ */
  const initScrollReveal = () => {
    if (prefersReducedMotion()) {
      $$('.reveal').forEach(el => el.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.10,
      rootMargin: '0px 0px -40px 0px',
    });

    $$('.reveal').forEach(el => observer.observe(el));
  };


  /* ════════════════════════════════════════════
     8. HERO HEADLINE — SHUTTER REVEAL
  ════════════════════════════════════════════ */
  const initHeroHeadline = () => {
    const lines = $$('.hero__headline-inner');
    if (!lines.length || prefersReducedMotion()) return;

    lines.forEach((line, i) => {
      line.style.animationDelay = `${i * 0.12}s`;
    });
  };


  /* ════════════════════════════════════════════
     9. HERO TYPEWRITER SUBTITLE
  ════════════════════════════════════════════ */
  const initTypewriter = () => {
    const el = $('#hero-subtitle');
    if (!el) return;

    if (prefersReducedMotion()) {
      el.textContent = 'Full-Funnel Digital Marketer & Web Designer — Austin, TX.';
      return;
    }

    const phrases = [
      'Full-Funnel Digital Marketer & Web Designer.',
      'I run the ads. I build the page. I track everything.',
      'Google Ads → Landing Page → Conversion. Done right.',
      'Based in Austin, TX. Open to full-time roles.',
    ];

    let phraseIdx = 0;
    let charIdx   = 0;
    let isDeleting = false;
    let isPaused   = false;

    const TYPE_SPEED   = 42;
    const DELETE_SPEED = 22;
    const PAUSE_AFTER  = 2400;
    const PAUSE_BEFORE = 300;

    const tick = () => {
      const current = phrases[phraseIdx];

      if (isPaused) return;

      if (!isDeleting) {
        el.textContent = current.slice(0, charIdx + 1);
        charIdx++;
        if (charIdx === current.length) {
          isPaused = true;
          setTimeout(() => { isPaused = false; isDeleting = true; tick(); }, PAUSE_AFTER);
          return;
        }
        setTimeout(tick, TYPE_SPEED + Math.random() * 18);
      } else {
        el.textContent = current.slice(0, charIdx - 1);
        charIdx--;
        if (charIdx === 0) {
          isPaused = true;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          setTimeout(() => { isPaused = false; isDeleting = false; tick(); }, PAUSE_BEFORE);
          return;
        }
        setTimeout(tick, DELETE_SPEED);
      }
    };

    // Start after headline reveal
    setTimeout(tick, 900);
  };


  /* ════════════════════════════════════════════
     10. SPLIT-TEXT HOVER — LETTER SHIMMER
  ════════════════════════════════════════════ */
  const initSplitHover = () => {
    if (isTouch() || prefersReducedMotion()) return;

    $$('.split-hover').forEach(el => {
      setTimeout(() => {
        const processNode = (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            if (!text.trim()) return;
            const frag = document.createDocumentFragment();
            [...text].forEach(ch => {
              const span = document.createElement('span');
              span.className = 'char';
              span.textContent = ch === ' ' ? '\u00A0' : ch;
              if (ch === ' ') span.style.width = '0.28em';
              frag.appendChild(span);
            });
            node.replaceWith(frag);
          }
        };

        // Only process direct text children — don't touch spans already in place
        [...el.childNodes].forEach(child => {
          if (child.nodeType === Node.TEXT_NODE) processNode(child);
        });
      }, 600);
    });
  };


  /* ════════════════════════════════════════════
     11. MAGNETIC NAV LINKS
  ════════════════════════════════════════════ */
  const initMagneticNav = () => {
    if (isTouch() || prefersReducedMotion()) return;

    $$('.mag-wrap').forEach(wrap => {
      const link = wrap.querySelector('.nav-link');
      if (!link) return;

      on(wrap, 'mousemove', (e) => {
        const rect = wrap.getBoundingClientRect();
        const x = (e.clientX - rect.left  - rect.width  / 2) * 0.30;
        const y = (e.clientY - rect.top   - rect.height / 2) * 0.30;
        link.style.transition = 'transform 0.1s linear';
        link.style.transform  = `translate(${x}px, ${y}px)`;
      });

      on(wrap, 'mouseleave', () => {
        link.style.transition = 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
        link.style.transform  = '';
        setTimeout(() => { link.style.transition = ''; }, 450);
      });
    });
  };


  /* ════════════════════════════════════════════
     12. COUNTER ANIMATION — STATS BAR
  ════════════════════════════════════════════ */
  const initCounters = () => {
    const statEls = $$('.stat-number[data-target]');
    if (!statEls.length) return;

    if (prefersReducedMotion()) {
      statEls.forEach(el => {
        const decimals = parseInt(el.dataset.decimals || '0');
        const target   = parseFloat(el.dataset.target);
        const prefix   = el.dataset.prefix || '';
        const suffix   = el.dataset.suffix || '';
        el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
      });
      return;
    }

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const DURATION = 1800;

    const animateCounter = (el) => {
      const target   = parseFloat(el.dataset.target);
      const decimals = parseInt(el.dataset.decimals  || '0');
      const prefix   = el.dataset.prefix || '';
      const suffix   = el.dataset.suffix || '';
      const start    = performance.now();

      const step = (now) => {
        const elapsed  = now - start;
        const progress = clamp(elapsed / DURATION, 0, 1);
        const value    = target * easeOut(progress);
        el.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
      };

      requestAnimationFrame(step);
    };

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statEls.forEach(el => obs.observe(el));
  };


  /* ════════════════════════════════════════════
     13. TICKER / MARQUEE
  ════════════════════════════════════════════ */
  const initTicker = () => {
    const track = $('#ticker-track');
    if (!track || prefersReducedMotion()) return;

    // Clone items for seamless loop
    const items = $$('.ticker-item', track);
    if (!items.length) return;

    items.forEach(item => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });

    // Pause on hover
    const wrap = track.closest('.ticker-wrap');
    on(wrap, 'mouseenter', () => track.style.animationPlayState = 'paused');
    on(wrap, 'mouseleave', () => track.style.animationPlayState = 'running');
  };


  /* ════════════════════════════════════════════
     14. CUSTOM CURSOR — FOLLOWER
  ════════════════════════════════════════════ */
  const initCursor = () => {
    if (isTouch() || prefersReducedMotion()) return;

    const cursor = document.createElement('div');
    cursor.id    = 'cursor-follower';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = '<div class="cursor-dot"></div><div class="cursor-ring"></div>';
    document.body.appendChild(cursor);

    const dot  = cursor.querySelector('.cursor-dot');
    const ring = cursor.querySelector('.cursor-ring');

    let mouseX = -100, mouseY = -100;
    let ringX  = -100, ringY  = -100;

    on(document, 'mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform  = `translate(${mouseX}px, ${mouseY}px)`;
    });

    // Lagged ring follow
    const animateRing = () => {
      ringX = lerp(ringX, mouseX, 0.12);
      ringY = lerp(ringY, mouseY, 0.12);
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(animateRing);
    };
    animateRing();

    // States — grow on hoverable, shrink on click
    const hoverEls = 'a, button, .work-card, .filter-btn, .path-btn, .skill-chip, .cred-card';
    on(document, 'mouseover', (e) => {
      if (e.target.closest(hoverEls)) cursor.classList.add('cursor--hover');
    });
    on(document, 'mouseout', (e) => {
      if (e.target.closest(hoverEls)) cursor.classList.remove('cursor--hover');
    });
    on(document, 'mousedown', () => cursor.classList.add('cursor--click'));
    on(document, 'mouseup',   () => cursor.classList.remove('cursor--click'));

    // Hide when leaving window
    on(document, 'mouseleave', () => cursor.classList.add('cursor--hidden'));
    on(document, 'mouseenter', () => cursor.classList.remove('cursor--hidden'));
  };


  /* ════════════════════════════════════════════
     15. TIMELINE REVEAL
  ════════════════════════════════════════════ */
  const initTimeline = () => {
    const items = $$('.timeline-item');
    if (!items.length) return;

    if (prefersReducedMotion()) {
      items.forEach(el => el.classList.add('in-view'));
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || '0');
          setTimeout(() => entry.target.classList.add('in-view'), delay);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    items.forEach(el => obs.observe(el));
  };


  /* ════════════════════════════════════════════
     16. GSAP SCROLLTRIGGER PARALLAX
  ════════════════════════════════════════════ */
  const initGSAP = () => {
    if (prefersReducedMotion()) return;

    const waitForGSAP = () => {
      if (!window.gsap || !window.ScrollTrigger) {
        setTimeout(waitForGSAP, 80);
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      // Parallax — hero dust particles
      $$('.dust').forEach((el, i) => {
        const speed = 0.08 + (i % 5) * 0.04;
        gsap.to(el, {
          y: () => -window.innerHeight * speed * 1.8,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      // Parallax — section headings drift slightly on scroll
      $$('.display-xl, .display-lg').forEach(el => {
        gsap.fromTo(el,
          { y: 0 },
          {
            y: -28,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          }
        );
      });

      // Stagger work cards on enter
      const workGrid = $('#work-grid');
      if (workGrid) {
        gsap.fromTo(
          $$('.work-card', workGrid),
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.10,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: workGrid,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }

      // Stagger cred cards
      const credsGrid = $('.creds-grid');
      if (credsGrid) {
        gsap.fromTo(
          $$('.cred-card', credsGrid),
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: credsGrid,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }
    };

    waitForGSAP();
  };


  /* ════════════════════════════════════════════
     17. WORK CARD HOVER TILT
  ════════════════════════════════════════════ */
  const initCardTilt = () => {
    if (isTouch() || prefersReducedMotion()) return;

    $$('.work-card').forEach(card => {
      on(card, 'mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform =
          `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 5}deg) translateZ(6px)`;
      });

      on(card, 'mouseleave', () => {
        card.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
        card.style.transform  = 'perspective(800px) rotateY(0) rotateX(0) translateZ(0)';
        setTimeout(() => { card.style.transition = ''; }, 500);
      });
    });
  };


  /* ════════════════════════════════════════════
     18. WORK CARD FILTER  (work.html only)
  ════════════════════════════════════════════ */
  const initWorkFilter = () => {
    const filterBtns = $$('.filter-btn');
    const cards      = $$('.work-card[data-category]');
    const countEl    = $('#visible-count');
    const emptyState = $('#empty-state');
    if (!filterBtns.length || !cards.length) return;

    // Read URL param on load
    const urlParams = new URLSearchParams(window.location.search);
    let   active    = urlParams.get('filter') || 'all';

    // Apply initial active state to buttons
    filterBtns.forEach(b => {
      const isActive = b.dataset.filter === active;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-pressed', String(isActive));
    });

    const applyFilter = (filter) => {
      let visible = 0;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        if (match) {
          card.classList.remove('hidden', 'filtering-out');
          card.classList.add('filtering-in');
          on(card, 'animationend', () =>
            card.classList.remove('filtering-in'), { once: true });
          visible++;
        } else {
          card.classList.add('filtering-out');
          on(card, 'animationend', () => {
            card.classList.remove('filtering-out');
            card.classList.add('hidden');
          }, { once: true });
        }
      });
      if (countEl)    countEl.textContent = String(visible);
      if (emptyState) emptyState.classList.toggle('show', visible === 0);
    };

    if (active !== 'all') applyFilter(active);

    filterBtns.forEach(btn => {
      on(btn, 'click', () => {
        const filter = btn.dataset.filter;
        if (filter === active) return;
        active = filter;
        filterBtns.forEach(b => {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-pressed', String(b === btn));
        });
        applyFilter(filter);
      });
    });
  };


  /* ════════════════════════════════════════════
     19. CASE STUDY OVERLAY  (work.html only)
  ════════════════════════════════════════════ */
  const initCaseStudyOverlay = () => {
    const overlay = $('#case-study-overlay');
    const closeBtn = $('#overlay-close');
    const cards    = $$('.work-card[data-title]');
    if (!overlay || !cards.length) return;

    const fields = {
      tag:       '#overlay-tag',
      title:     '#overlay-title',
      summary:   '#overlay-summary',
      challenge: '#overlay-challenge',
      strategy:  '#overlay-strategy',
      r1: '#overlay-r1', l1: '#overlay-l1',
      r2: '#overlay-r2', l2: '#overlay-l2',
      r3: '#overlay-r3', l3: '#overlay-l3',
    };

    const open = (card) => {
      $(fields.tag).textContent       = card.dataset.tag       || 'Case Study';
      $(fields.title).textContent     = card.dataset.title     || '';
      $(fields.summary).textContent   = card.dataset.summary   || '';
      $(fields.challenge).textContent = card.dataset.challenge || '';
      $(fields.strategy).textContent  = card.dataset.strategy  || '';
      $(fields.r1).textContent        = card.dataset.result1   || '';
      $(fields.l1).textContent        = card.dataset.label1    || '';
      $(fields.r2).textContent        = card.dataset.result2   || '';
      $(fields.l2).textContent        = card.dataset.label2    || '';
      $(fields.r3).textContent        = card.dataset.result3   || '';
      $(fields.l3).textContent        = card.dataset.label3    || '';

      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(() => closeBtn?.focus(), 80);
    };

    const close = () => {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    cards.forEach(card => {
      on(card, 'click', () => open(card));
      on(card, 'keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open(card);
        }
      });
    });

    on(closeBtn, 'click', close);
    on(overlay, 'click', (e) => { if (e.target === overlay) close(); });
    on(document, 'keydown', (e) => { if (e.key === 'Escape') close(); });
  };


  /* ════════════════════════════════════════════
     20. HEADSHOT 3D TILT  (about.html only)
  ════════════════════════════════════════════ */
  const initHeadshotTilt = () => {
    const card  = $('#headshot-card');
    const stage = card?.closest('.headshot-stage');
    if (!card || !stage || isTouch() || prefersReducedMotion()) return;

    on(stage, 'mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const x    = (e.clientX - rect.left)  / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)   / rect.height - 0.5;
      card.style.transition = 'transform 0.08s linear';
      card.style.transform  =
        `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 10}deg) scale(1.02)`;
    });

    on(stage, 'mouseleave', () => {
      card.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
      card.style.transform  = 'perspective(900px) rotateY(0) rotateX(0) scale(1)';
      setTimeout(() => { card.style.transition = ''; }, 600);
    });
  };


  /* ════════════════════════════════════════════
     21. CONTACT FORM  (contact.html only)
  ════════════════════════════════════════════ */
  const initContactForm = () => {
    const form        = $('#contact-form');
    const submitBtn   = $('#submit-btn');
    const formError   = $('#form-error');
    const formSuccess = $('#form-success');
    const pathBtns    = $$('.path-btn');
    const textarea    = $('#field-message');
    const charCounter = $('#char-counter');
    if (!form) return;

    // ── Netlify Forms attribute injection ──
    form.setAttribute('data-netlify', 'true');
    form.setAttribute('name', 'contact');
    const hiddenInput   = document.createElement('input');
    hiddenInput.type    = 'hidden';
    hiddenInput.name    = 'form-name';
    hiddenInput.value   = 'contact';
    form.prepend(hiddenInput);

    // ── Path selector ──
    const pathConfig = {
      hiring: {
        label:       'Company / Role',
        placeholder: 'Company name & role you\'re hiring for',
        showBudget:  false,
      },
      freelance: {
        label:       'Project Overview',
        placeholder: 'Briefly describe your project',
        showBudget:  true,
      },
    };

    pathBtns.forEach(btn => {
      on(btn, 'click', () => {
        const path = btn.dataset.path;
        pathBtns.forEach(b => {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-pressed', String(b === btn));
        });
        const cfg        = pathConfig[path] || pathConfig.hiring;
        const labelEl    = $('#context-label');
        const inputEl    = $('#field-context');
        const budgetGrp  = $('#budget-group');
        if (labelEl) labelEl.childNodes[0].textContent = cfg.label + ' ';
        if (inputEl) inputEl.placeholder = cfg.placeholder;
        if (budgetGrp) budgetGrp.style.display = cfg.showBudget ? 'flex' : 'none';
      });
    });

    // ── Character counter ──
    on(textarea, 'input', () => {
      if (!charCounter || !textarea) return;
      const len = textarea.value.length;
      charCounter.textContent = `${len} / 1000`;
      charCounter.classList.toggle('warn', len > 850);
    });

    // ── Validation helpers ──
    const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    const showError = (msg) => {
      if (!formError) return;
      formError.textContent   = msg;
      formError.style.display = 'block';
      formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => { formError.style.display = 'none'; }, 6000);
    };

    // ── Submission ──
    on(form, 'submit', async (e) => {
      e.preventDefault();

      const name    = $('#field-name')?.value.trim()    || '';
      const email   = $('#field-email')?.value.trim()   || '';
      const context = $('#field-context')?.value.trim() || '';
      const message = $('#field-message')?.value.trim() || '';

      if (!name)                   return showError('Please enter your name.');
      if (!isValidEmail(email))    return showError('Please enter a valid email address.');
      if (!context)                return showError('Please fill in the company / project field.');
      if (message.length < 10)     return showError('Please write a message — even a short one.');

      submitBtn.classList.add('loading');
      submitBtn.querySelector('svg')?.remove();
      submitBtn.childNodes[0].textContent = 'Sending…';

      try {
        const res = await fetch('/', {
          method:  'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body:    new URLSearchParams(new FormData(form)).toString(),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        form.style.display = 'none';
        formSuccess?.classList.add('show');
        formSuccess?.scrollIntoView({ behavior: 'smooth', block: 'center' });

      } catch (err) {
        console.error('[Contact form]', err);
        showError('Something went wrong. Please email me directly at tj@tjmarek.me');
        submitBtn.classList.remove('loading');
        submitBtn.childNodes[0].textContent = 'Send Message';
      }
    });
  };


  /* ════════════════════════════════════════════
     22. LAST.FM MUSIC WIDGET  (about.html only)
  ════════════════════════════════════════════ */
  const initMusicWidget = () => {
    const widget    = $('#music-widget');
    const trackEl   = $('#music-track');
    const artistEl  = $('#music-artist');
    const statusEl  = $('#music-status-text');
    const albumArt  = $('#album-art');
    if (!widget) return;

    /*
     * ── SETUP ──────────────────────────────────────────────
     * 1. Create a free Last.fm account at https://last.fm
     * 2. Connect it to Apple Music / Spotify via the Last.fm app
     * 3. Get a free API key at https://last.fm/api (takes 2 min)
     * 4. Replace the two values below with your real credentials
     * ──────────────────────────────────────────────────────
     */
    const LASTFM_USER = 'YOUR_LASTFM_USERNAME';
    const LASTFM_KEY  = 'YOUR_LASTFM_API_KEY';

    if (LASTFM_USER === 'YOUR_LASTFM_USERNAME') {
      if (trackEl)  trackEl.textContent  = 'Set up Last.fm to enable';
      if (artistEl) artistEl.textContent = 'See main.js for instructions';
      if (statusEl) statusEl.textContent = 'Not connected';
      return;
    }

    const fetchNowPlaying = async () => {
      try {
        const url  = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks`
          + `&user=${encodeURIComponent(LASTFM_USER)}`
          + `&api_key=${LASTFM_KEY}&format=json&limit=1`;
        const res  = await fetch(url);
        if (!res.ok) throw new Error(`Last.fm ${res.status}`);
        const data = await res.json();

        const track  = data?.recenttracks?.track?.[0];
        if (!track) throw new Error('No track data');

        const isNow  = track['@attr']?.nowplaying === 'true';
        const name   = track.name   || 'Unknown track';
        const artist = track.artist?.['#text'] || 'Unknown artist';
        const art    = track.image?.find(i => i.size === 'medium')?.['#text'] || '';

        if (trackEl)  trackEl.textContent  = name;
        if (artistEl) artistEl.textContent = artist;
        if (statusEl) statusEl.textContent = isNow ? 'Now Playing' : 'Last Played';

        widget.classList.toggle('playing', isNow);

        if (albumArt && art) {
          albumArt.innerHTML = `<img src="${art}"
            alt="${name} by ${artist} — album art"
            loading="lazy" />`;
        }

      } catch (err) {
        console.warn('[Last.fm widget]', err.message);
        widget.classList.add('hidden');
      }
    };

    fetchNowPlaying();
    setInterval(fetchNowPlaying, 60_000); // Refresh every 60s
  };


  /* ════════════════════════════════════════════
     23. KEYBOARD & ACCESSIBILITY HELPERS
  ════════════════════════════════════════════ */
  const initA11y = () => {
    // Focus-visible polyfill behavior — add class on keyboard nav
    on(document, 'keydown', (e) => {
      if (e.key === 'Tab') document.body.classList.add('keyboard-nav');
    });
    on(document, 'mousedown', () => {
      document.body.classList.remove('keyboard-nav');
    });

    // Skip-to-content link
    const skipLink = document.createElement('a');
    skipLink.href      = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.prepend(skipLink);

    // Ensure main has an id for the skip link
    const mainEl = $('main');
    if (mainEl && !mainEl.id) mainEl.id = 'main-content';

    // Trap focus inside overlay when open
    on(document, 'keydown', (e) => {
      const overlay = $('#case-study-overlay');
      if (!overlay?.classList.contains('open') || e.key !== 'Tab') return;

      const focusable = $$('button, a, input, textarea, select, [tabindex]', overlay)
        .filter(el => el.tabIndex >= 0 && !el.disabled);
      if (!focusable.length) return;

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  };


  /* ════════════════════════════════════════════
     BOOT — run everything
  ════════════════════════════════════════════ */
  ready(() => {
    initTheme();
    initScrollProgress();
    initHeader();
    initMobileMenu();
    initPageTransition();
    initScrollReveal();
    initHeroHeadline();
    initTypewriter();
    initSplitHover();
    initMagneticNav();
    initCounters();
    initTicker();
    initCursor();
    initTimeline();
    initGSAP();
    initCardTilt();
    initWorkFilter();
    initCaseStudyOverlay();
    initHeadshotTilt();
    initContactForm();
    initMusicWidget();
    initA11y();
  });

})();
