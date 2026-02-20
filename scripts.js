'use strict';

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
    setTimeout(() => closeBtn && closeBtn.focus(), 50);
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
    const els = $$('a, button', menu);
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

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const run = el => {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1400;
    const start    = performance.now();
    const step = now => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(easeOut(p) * target);
      p < 1 ? requestAnimationFrame(step) : (el.textContent = target);
    };
    requestAnimationFrame(step);
  };

  window.addEventListener('load', () => {
    counters.forEach((c, i) => setTimeout(() => run(c), 800 + i * 200));
  });
})();

/* --------------------------------------------------
   3. ACTIVE NAV
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
   4. CUSTOM CURSOR
-------------------------------------------------- */
(function customCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const style = document.createElement('style');
  style.textContent = `
    *, a, button { cursor: none !important; }
    .c-ring {
      position: fixed; width: 32px; height: 32px;
      border: 2px solid rgba(242,164,59,0.5);
      border-radius: 50%; pointer-events: none;
      z-index: 9999; transform: translate(-50%,-50%);
      transition: width .22s ease, height .22s ease,
                  border-color .22s ease, background .22s ease;
      will-change: left, top;
    }
    .c-dot {
      position: fixed; width: 5px; height: 5px;
      background: #F2A43B; border-radius: 50%;
      pointer-events: none; z-index: 9999;
      transform: translate(-50%,-50%);
      will-change: left, top;
    }
    .c-ring.hovered {
      width: 50px; height: 50px;
      border-color: #F2A43B;
      background: rgba(242,164,59,0.07);
    }
    .c-ring.pressed {
      width: 22px; height: 22px;
      background: rgba(242,164,59,0.22);
    }
  `;
  document.head.appendChild(style);

  const ring = Object.assign(document.createElement('div'), { className: 'c-ring' });
  const dot  = Object.assign(document.createElement('div'), { className: 'c-dot' });
  ring.setAttribute('aria-hidden', 'true');
  dot.setAttribute('aria-hidden', 'true');
  document.body.append(ring, dot);

  let mx = 0, my = 0, rx = 0, ry = 0;
  const lerp = (a, b, t) => a + (b - a) * t;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function tick() {
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(tick);
  })();

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
   5. REDUCED MOTION SAFEGUARD
-------------------------------------------------- */
(function reducedMotion() {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $$('.hero-top, .hero-photo-col, .hero-content-col, .skills-row').forEach(el => {
    el.style.opacity  = '1';
    el.style.transform = 'none';
    el.style.animation = 'none';
  });
  $$('.stat-num').forEach(el => { el.textContent = el.dataset.target; });
})();
