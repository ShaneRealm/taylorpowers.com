// Taylor Powers: name-mask reel, smooth scroll, parallax, reveals, index preview, cursor label, clock and the video lightbox.
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const top = document.getElementById('top');

  // ---- Hero: the reel plays inside "Taylor Powers"; scrolling zooms the letters open ----
  const reel = document.getElementById('reel');
  const stage = reel.querySelector('.reel-stage');
  const svg = document.getElementById('reelMask');
  const heroVideo = document.getElementById('heroVideo');
  const foot = document.getElementById('reelFoot');
  const texts = svg.querySelectorAll('.mask-text');
  const measure = svg.querySelector('.measure');
  let maxScale = 60;

  function layoutMask() {
    const W = stage.clientWidth, H = stage.clientHeight;
    const fs = Math.min(W * (W < 700 ? 0.29 : 0.255), H * 0.37);
    const b1 = H * 0.5 - fs * 0.12, b2 = b1 + fs * 0.84;
    texts.forEach(t => {
      t.style.fontSize = fs + 'px';
      const [l1, l2] = t.querySelectorAll('tspan');
      l1.setAttribute('x', W / 2); l1.setAttribute('y', b1);
      l2.setAttribute('x', W / 2); l2.setAttribute('y', b2);
    });
    // Zoom into the stem of the P in "Powers", so the screen fills with video
    let ox = W / 2, oy = b2 - fs * 0.36, half = fs * 0.05;
    try {
      const e = measure.getExtentOfChar(6);
      // Find the stem's exact horizontal extent by drawing the P and scanning one row
      const c = document.createElement('canvas'), w = Math.ceil(e.width) + 4, h = Math.ceil(fs);
      c.width = w; c.height = h;
      const g = c.getContext('2d');
      g.font = `600 ${fs}px ${getComputedStyle(measure).fontFamily}`;
      g.textBaseline = 'alphabetic'; g.fillText('P', 0, h * 0.8);
      const row = g.getImageData(0, Math.round(h * 0.8 - fs * 0.36), w, 1).data;
      let a = -1, b = -1;
      for (let i = 0; i < w; i++) { if (row[i * 4 + 3] > 128) { if (a < 0) a = i; b = i; } else if (a >= 0) break; }
      ox = e.x + (a >= 0 ? (a + b) / 2 : fs * 0.13);
      if (a >= 0) half = Math.max(2, (b - a) / 2);
    } catch (_) {}
    svg.style.setProperty('--ox', ox + 'px');
    svg.style.setProperty('--oy', oy + 'px');
    // Scale at which the stem alone covers the screen, reached about 90% of the way through the zoom
    const need = Math.max(ox, W - ox) / half;
    maxScale = Math.max(need, (Math.max(oy, H - oy) / (fs * 0.3))) / 0.7;
  }

  function updateReel() {
    const r = reel.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight));
    const z = clamp(p / 0.72), e = z * z * z;
    stage.style.setProperty('--ms', 1 + e * (maxScale - 1));
    svg.style.visibility = z >= 1 ? 'hidden' : 'visible';
    stage.style.setProperty('--vs', 1.12 - 0.12 * z);
    stage.style.setProperty('--io', clamp(1 - p * 6));
    stage.style.setProperty('--shade', clamp((p - 0.6) / 0.2));
    const fo = clamp((p - 0.74) / 0.16);
    stage.style.setProperty('--fo', fo);
    foot.classList.toggle('live', fo > 0.5);
    const inReel = r.bottom > 80;
    top.classList.toggle('on-video', inReel && z > 0.55);
    top.classList.toggle('on-page', !inReel);
  }

  if (still) {
    reel.classList.add('static');
    heroVideo.pause();
    const onScroll = () => top.classList.toggle('on-page', reel.getBoundingClientRect().bottom < 80);
    top.classList.add('on-video');
    addEventListener('scroll', () => { onScroll(); top.classList.toggle('on-video', !top.classList.contains('on-page')); }, { passive: true });
  } else {
    // svg mask children take the stage's custom properties through the svg element
    svg.style.transform = 'scale(var(--ms, 1))';
    const ready = () => { layoutMask(); updateReel(); };
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

  // ---- Scroll loop: Lenis smooth scroll when available ----
  function onFrame() { if (!still) { updateReel(); updateParallax(); } }
  let lenis = null;
  if (!still && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', onFrame);
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  } else {
    addEventListener('scroll', onFrame, { passive: true });
  }
  onFrame();

  // In-page links glide with Lenis
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id === '#' ? document.body : document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = id === '#reel' ? 0 : -72;
    if (lenis) lenis.scrollTo(target, { offset });
    else window.scrollTo({ top: target.getBoundingClientRect().top + scrollY + offset, behavior: still ? 'auto' : 'smooth' });
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
    let x = -200, y = -200, cx = x, cy = y, px = x, py = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; }, { passive: true });
    const loop = () => {
      cx += (x - cx) * .2; cy += (y - cy) * .2;
      px += (x - px) * .12; py += (y - py) * .12;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      const tilt = clamp((x - px) * .04, -6, 6);
      preview.style.transform = `translate3d(${px + 28}px, ${py - 120}px, 0) rotate(${tilt}deg) scale(${preview.classList.contains('show') ? 1 : .85})`;
      requestAnimationFrame(loop);
    };
    loop();
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
    lenis?.stop();
    dlg.showModal();
  }
  const close = () => { if (dlg.open) dlg.close(); };
  dlg.addEventListener('close', () => { frame.replaceChildren(); lenis?.start(); if (!still) heroVideo.play().catch(() => {}); });
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
  document.getElementById('playerClose').addEventListener('click', close);
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-yt], [data-vimeo], [data-video]');
    if (el) { e.preventDefault(); open(el); }
  });
})();
