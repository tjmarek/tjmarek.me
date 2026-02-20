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
   4. REDUCED MOTION SAFEGUARD
-------------------------------------------------- */
(function reducedMotion() {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $$('.hero-eyebrow, .hero-name, .hero-photo-col, .hero-content-col, .skills-row').forEach(el => {
    el.style.opacity  = '1';
    el.style.transform = 'none';
    el.style.animation = 'none';
  });
  $$('.stat-num').forEach(el => { el.textContent = el.dataset.target; });
})();
