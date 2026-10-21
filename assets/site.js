// Taylor Powers: framed reel that grows on scroll, parallax, reveals, index preview, cursor label, clock and the video lightbox.
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const top = document.getElementById('top');

  // ---- Hero: the framed reel grows to full screen as you scroll (transform and opacity only) ----
  const reel = document.getElementById('reel');
  const stage = document.getElementById('reelStage');
  const name = document.getElementById('reelName');
  const heroVideo = document.getElementById('heroVideo');
  const foot = document.getElementById('reelFoot');
  let k = .5, gap = 90, H = innerHeight, span = 1;

  function layoutReel() {
    H = stage.clientHeight;
    span = Math.max(1, reel.offsetHeight - H);
    gap = Math.max(72, H * 0.1);
    const nameBottom = name.offsetTop + name.offsetHeight;
    k = clamp((H - gap - nameBottom - 28) / H, .28, .62);
  }
  const ease = t => 1 - Math.pow(1 - t, 3);
  function updateReel() {
    const y = -reel.getBoundingClientRect().top;
    const p = clamp(y / span);
    const z = ease(clamp(p / .8));
    const st = stage.style;
    st.setProperty('--fs', (k + (1 - k) * z).toFixed(4));
    st.setProperty('--fy', (-gap * (1 - z)).toFixed(1) + 'px');
    st.setProperty('--ny', (-z * H * .22).toFixed(1) + 'px');
    st.setProperty('--no', clamp(1 - z * 1.6).toFixed(3));
    st.setProperty('--io', clamp(1 - p * 5).toFixed(3));
    st.setProperty('--shade', clamp((z - .7) / .3).toFixed(3));
    const fo = clamp((p - .8) / .15);
    st.setProperty('--fo', fo.toFixed(3));
    foot.classList.toggle('live', fo > .5);
    const r = reel.getBoundingClientRect();
    const inReel = r.bottom > 80;
    const frameTop = H * (1 - (k + (1 - k) * z)) - gap * (1 - z);
    top.classList.toggle('on-video', inReel && frameTop < 64);
    top.classList.toggle('on-page', !inReel);
  }

  if (still) {
    reel.classList.add('static');
    heroVideo.pause();
    top.classList.add('on-video');
    addEventListener('scroll', () => {
      const past = reel.getBoundingClientRect().bottom < 80;
      top.classList.toggle('on-page', past); top.classList.toggle('on-video', !past);
    }, { passive: true });
  } else {
    const ready = () => { layoutReel(); updateReel(); };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(ready);
    ready();
    addEventListener('resize', ready);
  }

  // ---- Parallax on work images ----
  const paras = [...document.querySelectorAll('.case .media:not(.studio)')];
  paras.forEach(m => m.classList.add('para'));
  function updateParallax() {
    const vh = innerHeight;
    for (const m of paras) {
      const r = m.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      const d = (r.top + r.height / 2 - vh / 2) / vh;
      m.firstElementChild.style.setProperty('--py', (d * -7).toFixed(2) + '%');
    }
  }

  // ---- One scroll handler, batched to animation frames ----
  let queued = false;
  const onFrame = () => { queued = false; if (!still) { updateReel(); updateParallax(); } };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(onFrame); } }, { passive: true });
  onFrame();

  // In-page links: smooth native scroll, offset for the fixed header
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id === '#' || id === '#reel' ? null : document.querySelector(id);
    e.preventDefault();
    const y = target ? target.getBoundingClientRect().top + scrollY - 72 : 0;
    window.scrollTo({ top: y, behavior: still ? 'auto' : 'smooth' });
  });

  // ---- Reveals ----
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js');
    document.querySelectorAll('.case-text, .statement, .figures div, .about-body, .capabilities, .clients ul, .rows li, .contact-body, .index-list li')
      .forEach(el => el.classList.add('fade'));
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('.reveal-img, .fade').forEach(el => io.observe(el));
    document.querySelectorAll('.figures div, .rows li, .index-list li').forEach((el, i) => { el.style.transitionDelay = `${(i % 8) * 55}ms`; });
  }

  // ---- Cursor label and index preview (fine pointers only) ----
  const cursor = document.getElementById('cursor');
  const label = cursor.querySelector('span');
  const preview = document.getElementById('preview');
  const pimg = preview.querySelector('img');
  if (fine) {
    let x = -200, y = -200, cx = x, cy = y, px = x, py = y, running = false;
    const loop = () => {
      cx += (x - cx) * .2; cy += (y - cy) * .2;
      px += (x - px) * .12; py += (y - py) * .12;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      const tilt = clamp((x - px) * .04, -6, 6);
      preview.style.transform = `translate3d(${px + 28}px, ${py - 120}px, 0) rotate(${tilt}deg) scale(${preview.classList.contains('show') ? 1 : .85})`;
      if (Math.abs(x - px) + Math.abs(y - py) > .3) requestAnimationFrame(loop); else running = false;
    };
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; if (!running) { running = true; requestAnimationFrame(loop); } }, { passive: true });
    document.querySelectorAll('[data-cursor]').forEach(el => {
      el.addEventListener('pointerenter', () => { label.textContent = el.dataset.cursor; cursor.classList.add('show'); });
      el.addEventListener('pointerleave', () => cursor.classList.remove('show'));
    });
    document.querySelectorAll('.index-list a').forEach(a => {
      const im = new Image(); im.src = a.dataset.img;
      a.addEventListener('pointerenter', () => { pimg.src = a.dataset.img; preview.classList.add('show'); });
      a.addEventListener('pointerleave', () => preview.classList.remove('show'));
    });
  }

  // ---- Chicago clock ----
  const clock = document.getElementById('clock');
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit' });
  const tick = () => { clock.textContent = fmt.format(new Date()); };
  tick(); setInterval(tick, 15000);

  // ---- Video lightbox ----
  const dlg = document.getElementById('player');
  const frame = document.getElementById('playerFrame');
  const title = document.getElementById('playerTitle');
  function open(el) {
    let node;
    if (el.dataset.video) {
      node = document.createElement('video');
      node.src = el.dataset.video; node.controls = true; node.autoplay = true; node.playsInline = true;
    } else {
      const src = el.dataset.yt
        ? `https://www.youtube-nocookie.com/embed/${el.dataset.yt}?autoplay=1&rel=0&modestbranding=1`
        : `https://player.vimeo.com/video/${el.dataset.vimeo}?autoplay=1&title=0&byline=0&portrait=0`;
      if (typeof dlg.showModal !== 'function') { window.open(src, '_blank', 'noopener'); return; }
      node = document.createElement('iframe');
      node.src = src; node.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media'; node.allowFullscreen = true;
    }
    if (typeof dlg.showModal !== 'function') { window.open(el.dataset.video, '_blank', 'noopener'); return; }
    node.title = el.dataset.title || 'Video';
    frame.replaceChildren(node);
    title.textContent = el.dataset.title || '';
    cursor.classList.remove('show');
    heroVideo.pause();
    dlg.showModal();
  }
  const close = () => { if (dlg.open) dlg.close(); };
  dlg.addEventListener('close', () => { frame.replaceChildren(); if (!still) heroVideo.play().catch(() => {}); });
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
  document.getElementById('playerClose').addEventListener('click', close);
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-yt], [data-vimeo], [data-video]');
    if (el) { e.preventDefault(); open(el); }
  });
})();
