'use strict';

const $  = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

/* ─── Mobile Menu ─────────────────────────────────── */
(function mobileMenu() {
  const burger   = $('#hamburger');
  const menu     = $('#mobile-menu');
  const closeBtn = $('#mobile-close');
  if (!burger || !menu) return;

  const open = () => {
    menu.hidden = false;
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeBtn?.focus(), 40);
  };
  const close = () => {
    menu.hidden = true;
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    burger.focus();
  };

  burger.addEventListener('click', () =>
    burger.classList.contains('open') ? close() : open()
  );
  closeBtn?.addEventListener('click', close);
  $$('.mobile-nav-link', menu).forEach(l => l.addEventListener('click', close));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && burger.classList.contains('open')) close();
  });

  // focus trap
  menu.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const els   = $$('a, button', menu);
    const first = els[0];
    const last  = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });
})();

/* ─── Stat Counters ───────────────────────────────── */
(function statCounters() {
  const counters = $$('.stat-num');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const run = el => {
    const target = parseInt(el.dataset.target, 10);
    const dur    = 1400;
    const start  = performance.now();
    const tick   = now => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.floor(easeOut(p) * target);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };
    requestAnimationFrame(tick);
  };

  window.addEventListener('load', () =>
    counters.forEach((c, i) => setTimeout(() => run(c), 700 + i * 150))
  );
})();

/* ─── Active Nav ──────────────────────────────────── */
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

/* ─── Reduced Motion Safeguard ────────────────────── */
(function reducedMotion() {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $$('.stat-num').forEach(el => { el.textContent = el.dataset.target; });
})();
