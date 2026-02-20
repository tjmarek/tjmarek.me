'use strict';

const $  = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

/* Mobile menu */
(function mobileMenu() {
  const burger   = $('#hamburger');
  const menu     = $('#mobile-menu');
  const closeBtn = $('#mobile-close');
  if (!burger || !menu) return;

  const open = () => {
    menu.hidden = false;
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close navigation');
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeBtn && closeBtn.focus(), 40);
  };

  const close = () => {
    menu.hidden = true;
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open navigation');
    document.body.style.overflow = '';
    burger.focus();
  };

  burger.addEventListener('click', () =>
    burger.classList.contains('open') ? close() : open()
  );
  closeBtn && closeBtn.addEventListener('click', close);
  $$('.mobile-nav-link', menu).forEach(link =>
    link.addEventListener('click', close)
  );
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && burger.classList.contains('open')) close();
  });

  menu.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const focusables = $$('a, button', menu);
    if (!focusables.length) return;
    const first = focusables[0];
    const last  = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });
})();

/* Stat counters */
(function statCounters() {
  const counters = $$('.stat-num');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const animate = el => {
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
  };

  window.addEventListener('load', () => {
    counters.forEach((c, i) => setTimeout(() => animate(c), 600 + i * 150));
  });
})();

/* Active nav */
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

/* Reduced motion safeguard */
(function reducedMotion() {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $$('.stat-num').forEach(el => el.textContent = el.dataset.target);
})();
