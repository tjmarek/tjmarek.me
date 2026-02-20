'use strict';

// Helpers
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

/* Mobile menu */
(function () {
  const burger = $('#hamburger');
  const menu = $('#mobile-menu');
  if (!burger || !menu) return;

  const open = () => {
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
    menu.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => {
      menu.hidden = true;
    }, 250);
  };

  burger.addEventListener('click', () => {
    burger.classList.contains('open') ? close() : open();
  });

  $$('.mobile-nav-link', menu).forEach(link =>
    link.addEventListener('click', close)
  );

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && burger.classList.contains('open')) close();
  });
})();

/* Animated stats */
(function () {
  const counters = $$('.stat-num');
  if (!counters.length) return;

  function animate(el) {
    const target = parseInt(el.dataset.target || '0', 10);
    const duration = 1200;
    const start = performance.now();

    const step = now => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value.toString();
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  window.addEventListener('load', () => {
    counters.forEach((c, i) => setTimeout(() => animate(c), 300 * i));
  });
})();
