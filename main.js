/**
 * main.js — TJ Marek Portfolio
 */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = () =>
    window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const clamp = (v, mn, mx) => Math.min(Math.max(v, mn), mx);
  const lerp  = (a, b, t) => a + (b - a) * t;

  /* ── 1. THEME ── */
  const initTheme = () => {
    const html   = document.documentElement;
    const btn    = $('#theme-toggle');
    const stored = localStorage.getItem('tj-theme');
    const pref   = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    html.setAttribute('data-theme', stored || pref);
    btn?.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('tj-theme', next);
    });
    window.addEventListener('storage', e => {
      if (e.key === 'tj-theme' && e.newValue)
        html.setAttribute('data-theme', e.newValue);
    });
  };

  /* ── 2. SCROLL PROGRESS ── */
  const initScrollProgress = () => {
    const bar = $('#scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      bar.style.width = clamp(pct * 100, 0, 100) + '%';
    }, { passive: true });
  };

  /* ── 3. HEADER ── */
  const initHeader = () => {
    const header = $('#site-header');
    if (!header) return;
    let lastY = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      header.classList.toggle('scrolled', y > 60);
      if (y > 120) {
        if (y > lastY + 8)       header.classList.add('header--hidden');
        else if (y < lastY - 4)  header.classList.remove('header--hidden');
      } else {
        header.classList.remove('header--hidden');
      }
      lastY = y;
    }, { passive: true });
  };

  /* ── 4. MOBILE MENU ── */
  const initMobileMenu = () => {
    const btn = $('#menu-toggle');
    const nav = $('#mobile-nav');
    if (!btn || !nav) return;
    const open  = () => { nav.classList.add('open'); btn.classList.add('open'); btn.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; };
    const close = () => { nav.classList.remove('open'); btn.classList.remove('open'); btn.setAttribute('aria-expanded','false'); document.body.style.overflow=''; };
    btn.addEventListener('click', () => nav.classList.contains('open') ? close() : open());
    $$('.nav-link', nav).forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    document.addEventListener('click', e => {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !btn.contains(e.target)) close();
    });
  };

  /* ── 5. PAGE TRANSITION ── */
  const initPageTransition = () => {
    const curtain = $('#page-transition');
    if (!curtain) return;
    curtain.style.transform       = 'scaleY(1)';
    curtain.style.transformOrigin = 'top';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      curtain.style.transition = 'transform 0.55s cubic-bezier(0.22,1,0.36,1)';
      curtain.style.transform  = 'scaleY(0)';
    }));
    $$('a[href]').filter(a => {
      const h = a.getAttribute('href');
      return h && !h.startsWith('http') && !h.startsWith('mailto')
          && !h.startsWith('tel') && !h.startsWith('#')
          && !a.hasAttribute('download');
    }).forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (!href || href === window.location.pathname.split('/').pop()) return;
        e.preventDefault();
        curtain.style.transition     = 'transform 0.42s cubic-bezier(0.65,0,0.35,1)';
        curtain.style.transformOrigin = 'bottom';
        curtain.style.transform      = 'scaleY(1)';
        setTimeout(() => { window.location.href = href; }, 440);
      });
    });
  };

  /* ── 6. SCROLL REVEAL ── */
  const initScrollReveal = () => {
    if (prefersReducedMotion()) {
      $$('.reveal').forEach(el => el.classList.add('in-view'));
      return;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(el => obs.observe(el));
  };

  /* ── 7. HERO HEADLINE ── */
  const initHeroHeadline = () => {
    $$('.hero__headline-inner').forEach((el, i) => {
      el.style.animationDelay = `${i * 0.12}s`;
    });
  };

  /* ── 8. TYPEWRITER ── */
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
    let pi = 0, ci = 0, del = false, paused = false;
    const tick = () => {
      if (paused) return;
      const cur = phrases[pi];
      if (!del) {
        el.textContent = cur.slice(0, ci + 1);
        ci++;
        if (ci === cur.length) {
          paused = true;
          setTimeout(() => { paused = false; del = true; tick(); }, 2400);
          return;
        }
        setTimeout(tick, 42 + Math.random() * 18);
      } else {
        el.textContent = cur.slice(0, ci - 1);
        ci--;
        if (ci === 0) {
          paused = true;
          pi = (pi + 1) % phrases.length;
          setTimeout(() => { paused = false; del = false; tick(); }, 300);
          return;
        }
        setTimeout(tick, 22);
      }
    };
    setTimeout(tick, 1000);
  };

  /* ── 9. MAGNETIC NAV ── */
  const initMagneticNav = () => {
    if (isTouch() || prefersReducedMotion()) return;
    $$('.mag-wrap').forEach(wrap => {
      const link = wrap.querySelector('.nav-link');
      if (!link) return;
      wrap.addEventListener('mousemove', e => {
        const r = wrap.getBoundingClientRect();
        link.style.transition = 'transform 0.1s linear';
        link.style.transform  =
          `translate(${(e.clientX-r.left-r.width/2)*.30}px,${(e.clientY-r.top-r.height/2)*.30}px)`;
      });
      wrap.addEventListener('mouseleave', () => {
        link.style.transition = 'transform 0.45s cubic-bezier(0.22,1,0.36,1)';
        link.style.transform  = '';
        setTimeout(() => link.style.transition = '', 450);
      });
    });
  };

  /* ── 10. COUNTER ANIMATION ── */
  const initCounters = () => {
    const els = $$('.stat-number[data-target]');
    if (!els.length) return;
    if (prefersReducedMotion()) {
      els.forEach(el => {
        const d = parseInt(el.dataset.decimals||'0');
        el.textContent = `${el.dataset.prefix||''}${parseFloat(el.dataset.target).toFixed(d)}${el.dataset.suffix||''}`;
      });
      return;
    }
    const ease = t => 1 - Math.pow(1-t, 3);
    const animate = el => {
      const target = parseFloat(el.dataset.target);
      const dec    = parseInt(el.dataset.decimals||'0');
      const pre    = el.dataset.prefix||'';
      const suf    = el.dataset.suffix||'';
      const start  = performance.now();
      const step   = now => {
        const p = clamp((now - start) / 1800, 0, 1);
        el.textContent = `${pre}${(target * ease(p)).toFixed(dec)}${suf}`;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = `${pre}${target.toFixed(dec)}${suf}`;
      };
      requestAnimationFrame(step);
    };
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.5 });
    els.forEach(el => obs.observe(el));
  };

  /* ── 11. TICKER ── */
  const initTicker = () => {
    const track = $('#ticker-track');
    if (!track || prefersReducedMotion()) return;
    $$('.ticker-item', track).forEach(item => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
    const wrap = track.closest('.ticker-wrap');
    wrap?.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
    wrap?.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
  };

  /* ── 12. CUSTOM CURSOR ── */
  const initCursor = () => {
    if (isTouch() || prefersReducedMotion()) return;
    const cursor = document.createElement('div');
    cursor.id = 'cursor-follower';
    cursor.setAttribute('aria-hidden','true');
    cursor.innerHTML = '<div class="cursor-dot"></div><div class="cursor-ring"></div>';
    document.body.appendChild(cursor);
    const dot  = cursor.querySelector('.cursor-dot');
    const ring = cursor.querySelector('.cursor-ring');
    let mx=-100,my=-100,rx=-100,ry=-100;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px)`;
    });
    const loop = () => {
      rx = lerp(rx,mx,0.12); ry = lerp(ry,my,0.12);
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(loop);
    };
    loop();
    const hov = 'a,button,.work-card,.filter-btn,.path-btn,.skill-chip,.cred-card';
    document.addEventListener('mouseover', e => { if (e.target.closest(hov)) cursor.classList.add('cursor--hover'); });
    document.addEventListener('mouseout',  e => { if (e.target.closest(hov)) cursor.classList.remove('cursor--hover'); });
    document.addEventListener('mousedown', () => cursor.classList.add('cursor--click'));
    document.addEventListener('mouseup',   () => cursor.classList.remove('cursor--click'));
    document.addEventListener('mouseleave',() => cursor.classList.add('cursor--hidden'));
    document.addEventListener('mouseenter',() => cursor.classList.remove('cursor--hidden'));
  };

  /* ── 13. TIMELINE REVEAL ── */
  const initTimeline = () => {
    const items = $$('.timeline-item');
    if (!items.length) return;
    if (prefersReducedMotion()) { items.forEach(el => el.classList.add('in-view')); return; }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('in-view'),
            parseInt(e.target.dataset.delay||'0'));
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(el => obs.observe(el));
  };

  /* ── 14. GSAP SCROLLTRIGGER ── */
  const initGSAP = () => {
    if (prefersReducedMotion()) return;
    const wait = () => {
      if (!window.gsap || !window.ScrollTrigger) { setTimeout(wait, 80); return; }
      gsap.registerPlugin(ScrollTrigger);

      // Dust particle parallax
      $$('.dust').forEach((el, i) => {
        gsap.to(el, {
          y: () => -window.innerHeight * (0.08 + (i%5)*0.04) * 1.8,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
        });
      });

      // Stagger work cards
      const grid = $('#work-grid');
      if (grid) {
        gsap.fromTo($$('.work-card', grid),
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.10, ease: 'power3.out',
            scrollTrigger: { trigger: grid, start: 'top 85%', once: true } });
      }
    };
    wait();
  };

  /* ── 15. CARD TILT ── */
  const initCardTilt = () => {
    if (isTouch() || prefersReducedMotion()) return;
    $$('.work-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX-r.left)/r.width  - 0.5;
        const y = (e.clientY-r.top) /r.height - 0.5;
        card.style.transform =
          `perspective(800px) rotateY(${x*6}deg) rotateX(${-y*5}deg) translateZ(6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1)';
        card.style.transform  = '';
        setTimeout(() => card.style.transition = '', 500);
      });
    });
  };

  /* ── 16. WORK FILTER ── */
  const initWorkFilter = () => {
    const btns  = $$('.filter-btn');
    const cards = $$('.work-card[data-category]');
    const count = $('#visible-count');
    const empty = $('#empty-state');
    if (!btns.length || !cards.length) return;
    const params = new URLSearchParams(window.location.search);
    let active   = params.get('filter') || 'all';
    btns.forEach(b => {
      b.classList.toggle('active', b.dataset.filter === active);
      b.setAttribute('aria-pressed', String(b.dataset.filter === active));
    });
    const apply = filter => {
      let vis = 0;
      cards.forEach(c => {
        const match = filter === 'all' || c.dataset.category === filter;
        if (match) {
          c.classList.remove('hidden','filtering-out');
          c.classList.add('filtering-in');
          c.addEventListener('animationend', () => c.classList.remove('filtering-in'), {once:true});
          vis++;
        } else {
          c.classList.add('filtering-out');
          c.addEventListener('animationend', () => { c.classList.remove('filtering-out'); c.classList.add('hidden'); }, {once:true});
        }
      });
      if (count) count.textContent = String(vis);
      if (empty) empty.classList.toggle('show', vis===0);
    };
    if (active !== 'all') apply(active);
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.filter === active) return;
        active = btn.dataset.filter;
        btns.forEach(b => { b.classList.toggle('active',b===btn); b.setAttribute('aria-pressed',String(b===btn)); });
        apply(active);
      });
    });
  };

  /* ── 17. CASE STUDY OVERLAY ── */
  const initOverlay = () => {
    const overlay  = $('#case-study-overlay');
    const closeBtn = $('#overlay-close');
    const cards    = $$('.work-card[data-title]');
    if (!overlay || !cards.length) return;
    const set = (id, val) => { const el = $(id); if (el) el.textContent = val||''; };
    const open = card => {
      set('#overlay-tag',      card.dataset.tag);
      set('#overlay-title',    card.dataset.title);
      set('#overlay-summary',  card.dataset.summary);
      set('#overlay-challenge',card.dataset.challenge);
      set('#overlay-strategy', card.dataset.strategy);
      set('#overlay-r1', card.dataset.result1); set('#overlay-l1', card.dataset.label1);
      set('#overlay-r2', card.dataset.result2); set('#overlay-l2', card.dataset.label2);
      set('#overlay-r3', card.dataset.result3); set('#overlay-l3', card.dataset.label3);
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
      setTimeout(() => closeBtn?.focus(), 80);
    };
    const close = () => {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden','true');
      document.body.style.overflow = '';
    };
    cards.forEach(c => {
      c.addEventListener('click', () => open(c));
      c.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); open(c); } });
    });
    closeBtn?.addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target===overlay) close(); });
    document.addEventListener('keydown', e => { if (e.key==='Escape') close(); });
  };

  /* ── 18. HEADSHOT TILT ── */
  const initHeadshotTilt = () => {
    const card  = $('#headshot-card');
    const stage = card?.closest('.headshot-stage');
    if (!card || !stage || isTouch() || prefersReducedMotion()) return;
    stage.addEventListener('mousemove', e => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX-r.left)/r.width  - 0.5;
      const y = (e.clientY-r.top) /r.height - 0.5;
      card.style.transition = 'transform 0.08s linear';
      card.style.transform  = `perspective(900px) rotateY(${x*14}deg) rotateX(${-y*10}deg) scale(1.02)`;
    });
    stage.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.6s cubic-bezier(0.22,1,0.36,1)';
      card.style.transform  = '';
      setTimeout(() => card.style.transition = '', 600);
    });
  };

  /* ── 19. CONTACT FORM ── */
  const initContactForm = () => {
    const form    = $('#contact-form');
    const submitBtn = $('#submit-btn');
    const errEl   = $('#form-error');
    const succEl  = $('#form-success');
    if (!form) return;
    form.setAttribute('data-netlify','true');
    form.setAttribute('name','contact');
    const hidden = document.createElement('input');
    hidden.type='hidden'; hidden.name='form-name'; hidden.value='contact';
    form.prepend(hidden);
    // Path selector
    $$('.path-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.path-btn').forEach(b => { b.classList.toggle('active',b===btn); b.setAttribute('aria-pressed',String(b===btn)); });
        const isFreelance = btn.dataset.path === 'freelance';
        const lbl = $('#context-label'); const inp = $('#field-context'); const bgt = $('#budget-group');
        if (lbl) lbl.childNodes[0].textContent = (isFreelance ? 'Project Overview' : 'Company / Role') + ' ';
        if (inp) inp.placeholder = isFreelance ? 'Briefly describe your project' : 'Company name & role you\'re hiring for';
        if (bgt) bgt.style.display = isFreelance ? 'flex' : 'none';
      });
    });
    // Char counter
    const ta = $('#field-message');
    const cc = $('#char-counter');
    ta?.addEventListener('input', () => {
      if (!cc) return;
      const l = ta.value.length;
      cc.textContent = `${l} / 1000`;
      cc.classList.toggle('warn', l > 850);
    });
    // Validate + submit
    const showErr = msg => { if (!errEl) return; errEl.textContent=msg; errEl.style.display='block'; setTimeout(()=>errEl.style.display='none',6000); };
    const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const name    = $('#field-name')?.value.trim()    || '';
      const email   = $('#field-email')?.value.trim()   || '';
      const context = $('#field-context')?.value.trim() || '';
      const message = $('#field-message')?.value.trim() || '';
      if (!name)              return showErr('Please enter your name.');
      if (!validEmail(email)) return showErr('Please enter a valid email address.');
      if (!context)           return showErr('Please fill in the company / project field.');
      if (message.length < 10) return showErr('Please write a message.');
      submitBtn.classList.add('loading');
      try {
        const res = await fetch('/', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body: new URLSearchParams(new FormData(form)).toString() });
        if (!res.ok) throw new Error();
        form.style.display='none';
        succEl?.classList.add('show');
        succEl?.scrollIntoView({behavior:'smooth',block:'center'});
      } catch {
        showErr('Something went wrong. Please email me directly at tj@tjmarek.me');
        submitBtn.classList.remove('loading');
      }
    });
  };

  /* ── 20. LAST.FM WIDGET ── */
  const initMusicWidget = () => {
    const widget   = $('#music-widget');
    if (!widget) return;
    const LASTFM_USER = 'YOUR_LASTFM_USERNAME';
    const LASTFM_KEY  = 'YOUR_LASTFM_API_KEY';
    if (LASTFM_USER === 'YOUR_LASTFM_USERNAME') {
      const t = $('#music-track'); const a = $('#music-artist'); const s = $('#music-status-text');
      if (t) t.textContent = 'Set up Last.fm to enable';
      if (a) a.textContent = 'See main.js for instructions';
      if (s) s.textContent = 'Not connected';
      return;
    }
    const fetch_ = async () => {
      try {
        const res  = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_KEY}&format=json&limit=1`);
        const data = await res.json();
        const track = data?.recenttracks?.track?.[0];
        if (!track) throw new Error();
        const isNow = track['@attr']?.nowplaying === 'true';
        const t = $('#music-track'); const a = $('#music-artist'); const s = $('#music-status-text');
        const art = track.image?.find(i=>i.size==='medium')?.['#text']||'';
        if (t) t.textContent = track.name;
        if (a) a.textContent = track.artist?.['#text'];
        if (s) s.textContent = isNow ? 'Now Playing' : 'Last Played';
        widget.classList.toggle('playing', isNow);
        const artEl = $('#album-art');
        if (artEl && art) artEl.innerHTML = `<img src="${art}" alt="album art" loading="lazy" />`;
      } catch { widget.classList.add('hidden'); }
    };
    fetch_();
    setInterval(fetch_, 60000);
  };

  /* ── 21. A11Y ── */
  const initA11y = () => {
    document.addEventListener('keydown', e => { if (e.key==='Tab') document.body.classList.add('keyboard-nav'); });
    document.addEventListener('mousedown', () => document.body.classList.remove('keyboard-nav'));
    const main = $('main');
    if (main && !main.id) main.id = 'main-content';
  };

  /* ── BOOT ── */
  const boot = () => {
    initTheme();
    initScrollProgress();
    initHeader();
    initMobileMenu();
    initPageTransition();
    initScrollReveal();
    initHeroHeadline();
    initTypewriter();
    initMagneticNav();
    initCounters();
    initTicker();
    initCursor();
    initTimeline();
    initGSAP();
    initCardTilt();
    initWorkFilter();
    initOverlay();
    initHeadshotTilt();
    initContactForm();
    initMusicWidget();
    initA11y();
  };

  if (document.readyState !== 'loading') boot();
  else document.addEventListener('DOMContentLoaded', boot);

})();
