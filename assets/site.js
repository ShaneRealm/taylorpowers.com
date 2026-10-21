// Hero video, header state, scroll reveals, cursor label and the video lightbox.
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero video: respect reduced motion, and pause it while the full reel is open
  const heroVideo = document.getElementById('heroVideo');
  if (still && heroVideo) heroVideo.pause();

  // Header turns dark once past the hero
  const top = document.getElementById('top');
  const hero = document.querySelector('.hero');
  const onScroll = () => top.classList.toggle('on-page', scrollY > hero.offsetHeight - 80);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Reveals
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js');
    document.querySelectorAll('.case-text, .statement, .figures div, .about-body, .capabilities, .clients ul, .rows li, .contact-body')
      .forEach(el => el.classList.add('fade'));
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('.reveal-img, .fade').forEach(el => io.observe(el));
    document.querySelectorAll('.figures div, .rows li').forEach((el, i) => { el.style.transitionDelay = `${(i % 6) * 60}ms`; });
  }

  // Cursor label over work
  const cursor = document.getElementById('cursor');
  const label = cursor.querySelector('span');
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let x = -100, y = -100, cx = x, cy = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; }, { passive: true });
    const loop = () => { cx += (x - cx) * .2; cy += (y - cy) * .2; cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`; requestAnimationFrame(loop); };
    loop();
    document.querySelectorAll('[data-cursor]').forEach(el => {
      el.addEventListener('pointerenter', () => { label.textContent = el.dataset.cursor; cursor.classList.add('show'); });
      el.addEventListener('pointerleave', () => cursor.classList.remove('show'));
    });
  }

  // Video lightbox
  const dlg = document.getElementById('player');
  const frame = document.getElementById('playerFrame');
  const title = document.getElementById('playerTitle');
  function open(el) {
    if (el.dataset.video) {
      if (typeof dlg.showModal !== 'function') { window.open(el.dataset.video, '_blank', 'noopener'); return; }
      const v = document.createElement('video');
      v.src = el.dataset.video; v.controls = true; v.autoplay = true; v.playsInline = true;
      frame.replaceChildren(v);
      title.textContent = el.dataset.title || '';
      cursor.classList.remove('show');
      heroVideo?.pause();
      dlg.showModal();
      return;
    }
    const src = el.dataset.yt
      ? `https://www.youtube-nocookie.com/embed/${el.dataset.yt}?autoplay=1&rel=0&modestbranding=1`
      : `https://player.vimeo.com/video/${el.dataset.vimeo}?autoplay=1&title=0&byline=0&portrait=0`;
    if (typeof dlg.showModal !== 'function') { window.open(src, '_blank', 'noopener'); return; }
    const f = document.createElement('iframe');
    f.src = src; f.title = el.dataset.title || 'Video';
    f.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media'; f.allowFullscreen = true;
    frame.replaceChildren(f);
    title.textContent = el.dataset.title || '';
    cursor.classList.remove('show');
    dlg.showModal();
  }
  const close = () => { if (dlg.open) dlg.close(); };
  dlg.addEventListener('close', () => { frame.replaceChildren(); if (!still) heroVideo?.play().catch(() => {}); });
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
  document.getElementById('playerClose').addEventListener('click', close);
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-yt], [data-vimeo], [data-video]');
    if (el) { e.preventDefault(); open(el); }
  });
})();
