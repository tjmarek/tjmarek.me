/**
 * Portfolio Home Page — scripts.js
 * Handles: mobile menu, counter animation, cursor, card tilt, keyboard nav
 */

'use strict';

/* ============================================================
   UTILITY
============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. MOBILE MENU
============================================================ */
(function initMobileMenu() {
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobile-menu');
  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.hidden = false;
    document.body.style.overflow = 'hidden';
    // Focus first link
    const firstLink = mobileMenu.querySelector('.mobile-nav-link');
    if (firstLink) setTimeout(() => firstLink.focus(), 50);
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.hidden = true;
    document.body.style.overflow = '';
    hamburger.focus();
  }

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburger.classList.contains('open')) {
      closeMenu();
    }
  });

  // Close when a mobile link is clicked
  $$('.mobile-nav-link', mobileMenu).forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Trap focus within mobile menu
  mobileMenu.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = $$('a, button', mobileMenu).filter(el => !el.disabled);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();

/* ============================================================
   2. ANIMATED STAT COUNTERS
============================================================ */
(function initCounters() {
  const counters = $$('.stat-num');
  if (!counters.length) return;

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(step);
  }

  // Use IntersectionObserver to trigger when visible
  // Since it's a single-screen page, just wait for initial load
  function startCounters() {
    counters.forEach((counter, i) => {
      setTimeout(() => animateCounter(counter), 1400 + i * 150);
    });
  }

  if (document.readyState === 'complete') {
    startCounters();
  } else {
    window.addEventListener('load', startCounters);
  }
})();

/* ============================================================
   3. SKILL CARD 3D TILT (mouse proximity)
============================================================ */
(function initCardTilt() {
  const cards = $$('.skill-card');
  if (!cards.length) return;

  // Skip on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rotX = dy * -8;
      const rotY = dx * 8;
      card.style.transform = `perspective(400px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.06)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ============================================================
   4. CUSTOM CURSOR (desktop only)
============================================================ */
(function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  cursor.setAttribute('aria-hidden', 'true');

  const cursorDot = document.createElement('div');
  cursorDot.className = 'custom-cursor-dot';
  cursorDot.setAttribute('aria-hidden', 'true');

  document.body.appendChild(cursor);
  document.body.appendChild(cursorDot);

  // Inject cursor styles
  const style = document.createElement('style');
  style.textContent = `
    body { cursor: none; }
    a, button { cursor: none; }
    .custom-cursor {
      position: fixed;
      width: 32px;
      height: 32px;
      border: 2px solid rgba(242, 169, 5, 0.6);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      transition: width 0.3s ease, height 0.3s ease, border-color 0.3s ease, background 0.3s ease, opacity 0.3s ease;
      will-change: transform;
    }
    .custom-cursor-dot {
      position: fixed;
      width: 6px;
      height: 6px;
      background: #F2A905;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      will-change: transform;
    }
    .custom-cursor.hover {
      width: 50px;
      height: 50px;
      border-color: #F2A905;
      background: rgba(242, 169, 5, 0.08);
    }
    .custom-cursor.clicking {
      width: 22px;
      height: 22px;
      background: rgba(242, 169, 5, 0.25);
    }
  `;
  document.head.appendChild(style);

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Dot follows instantly
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  });

  // Ring follows with lerp
  function lerp(a, b, t) { return a + (b - a) * t; }

  function animateCursor() {
    cursorX = lerp(cursorX, mouseX, 0.14);
    cursorY = lerp(cursorY, mouseY, 0.14);
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    requestAnimationFrame(animateCursor);
  }
  requestAnimationFrame(animateCursor);

  // Hover states
  const hoverTargets = $$('a, button, .skill-card, .btn');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });

  document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
  document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; cursorDot.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; cursorDot.style.opacity = '1'; });
})();

/* ============================================================
   5. NAV LINK ACTIVE STATE (current page highlight)
============================================================ */
(function setActiveNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  $$('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
})();

/* ============================================================
   6. REDUCED MOTION — DISABLE ANIMATIONS VIA JS
============================================================ */
(function checkReducedMotion() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $$('.headline-line, .hero-subtext, .hero-ctas, .stat-row, .hero-right, .hero-footer').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.animation = 'none';
    });
  }
})();

/* ============================================================
   7. KEYBOARD NAV IMPROVEMENT — Skip to content
============================================================ */
(function initSkipLink() {
  const skip = document.createElement('a');
  skip.href = '#main-content';
  skip.textContent = 'Skip to main content';
  skip.setAttribute('class', 'skip-link');

  const skipStyle = document.createElement('style');
  skipStyle.textContent = `
    .skip-link {
      position: fixed;
      top: -100px;
      left: 20px;
      z-index: 9999;
      background: #F2A905;
      color: #36454f;
      padding: 10px 20px;
      border-radius: 4px;
      font-weight: 700;
      font-family: sans-serif;
      text-decoration: none;
      transition: top 0.2s ease;
    }
    .skip-link:focus {
      top: 20px;
    }
  `;
  document.head.appendChild(skipStyle);
  document.body.prepend(skip);
})();
