'use strict';

/* --------------------------------------------------
   Helpers
-------------------------------------------------- */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

/* --------------------------------------------------
   1. MOBILE MENU
-------------------------------------------------- */
(function mobileMenu() {
  const burger   = $('#hamburger');
  const menu     = $('#mobile-menu');
  const closeBtn = $('#mobile-close');
  if (!burger || !menu) return;

  const open = () => {
    menu.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close navigation');
    burger.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn && closeBtn.focus();
  };

  const close = () => {
    menu.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open navigation');
    burger.classList.remove('open');
    document.body.style.overflow = '';
    burger.focus();
  };

  burger.addEventListener('click', () =>
    burger.classList.contains('open') ? close() : open()
  );
  closeBtn && closeBtn.addEventListener('click', close);

  $$('.mobile-nav-link', menu).forEach(l => l.addEventListener('click', close));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && burger.classList.contains('open')) close();
  });

  // Focus trap
  menu.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const els = $$('a, button', menu).filter(el => !el.hidden);
    if (!els.length) return;
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });
})();

/* --------------------------------------------------
   2. STAT COUNTERS
-------------------------------------------------- */
(function statCounters() {
  const counters = $$('.stat-num');
  if (!counters.length) return;

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function run(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1400;
    const start    = performance.now();
    const step = now => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(easeOut(p) * target);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  }

  // Start after entry animations settle
  window.addEventListener('load', () => {
    counters.forEach((c, i) => setTimeout(() => run(c), 900 + i * 180));
  });
})();

/* --------------------------------------------------
   3. ACTIVE NAV LINK
-------------------------------------------------- */
(function activeNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  $$('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
})();

/* --------------------------------------------------
   4. CUSTOM CURSOR (desktop pointer only)
-------------------------------------------------- */
(function customCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    *, a, button { cursor: none !important; }
    .c-ring {
      position: fixed;
      width: 34px;
      height: 34px;
      border: 2px solid rgba(242,164,59,0.55);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      transition: width .25s ease, height .25s ease,
                  border-color .25s ease, background .25s ease;
      will-change: left, top;
    }
    .c-dot {
      position: fixed;
      width: 5px;
      height: 5px;
      background: var(--gold, #F2A43B);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      will-change: left, top;
    }
    .c-ring.hovered {
      width: 52px;
      height: 52px;
      border-color: var(--gold, #F2A43B);
      background: rgba(242,164,59,0.07);
    }
    .c-ring.pressed {
      width: 24px;
      height: 24px;
      background: rgba(242,164,59,0.2);
    }
  `;
  document.head.appendChild(style);

  const ring = document.createElement('div');
  ring.className = 'c-ring';
  ring.setAttribute('aria-hidden', 'true');

  const dot = document.createElement('div');
  dot.className = 'c-dot';
  dot.setAttribute('aria-hidden', 'true');

  document.body.append(ring, dot);

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  const lerp = (a, b, t) => a + (b - a) * t;
  const tick = () => {
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  $$('a, button, .skill-chip, .name-letter').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });

  document.addEventListener('mousedown', () => ring.classList.add('pressed'));
  document.addEventListener('mouseup',   () => ring.classList.remove('pressed'));
  document.addEventListener('mouseleave', () => {
    ring.style.opacity = '0'; dot.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    ring.style.opacity = '1'; dot.style.opacity = '1';
  });
})();

/* --------------------------------------------------
   5. REDUCED MOTION — ensure elements visible
-------------------------------------------------- */
(function reducedMotion() {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $$('.hero-eyebrow, .hero-name, .hero-photo-wrap, .hero-right, .skills-row').forEach(el => {
    el.style.opacity  = '1';
    el.style.transform = 'none';
    el.style.animation = 'none';
  });
  $$('.stat-num').forEach(el => {
    el.textContent = el.dataset.target;
  });
})();
