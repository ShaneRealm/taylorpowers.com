// Taylor Powers: reel sound and progress, hover-to-play work clips, tile fade-ins, Chicago clock and the video lightbox.
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reel = document.getElementById('reel');
  const soundBtn = document.getElementById('soundBtn');

  // Reel: sound toggle, progress line, pause when off screen
  if (still) reel.pause();
  soundBtn.addEventListener('click', () => {
    reel.muted = !reel.muted;
    if (!reel.muted) reel.play().catch(() => {});
    soundBtn.setAttribute('aria-pressed', String(!reel.muted));
    soundBtn.querySelector('.t').textContent = reel.muted ? 'Sound on' : 'Sound off';
  });
  const bar = document.getElementById('reelProgress');
  reel.addEventListener('timeupdate', () => { if (reel.duration) bar.style.transform = `scaleX(${reel.currentTime / reel.duration})`; });

  // Videos only run while visible
  const seen = new IntersectionObserver(entries => entries.forEach(en => {
    const v = en.target;
    if (v === reel) { if (en.isIntersecting && !still && !dlg.open) v.play().catch(() => {}); else v.pause(); return; }
    if (!en.isIntersecting) stopClip(v.closest('.media'));
  }), { threshold: 0.15 });
  seen.observe(reel);
  // Header gets a solid backing once the reel has scrolled away
  const barEl = document.getElementById('bar');
  new IntersectionObserver(([en]) => barEl.classList.toggle('solid', !en.isIntersecting), { rootMargin: '-70px 0px 0px 0px' }).observe(document.querySelector('.reel'));

  // Work clips: preview on hover (desktop); load the file only when first needed
  function startClip(m) {
    const v = m.querySelector('video'); if (!v || still) return;
    if (!v.src) { v.src = v.dataset.src; }
    v.play().then(() => m.classList.add('playing')).catch(() => {});
  }
  function stopClip(m) {
    const v = m && m.querySelector('video'); if (!v) return;
    m.classList.remove('playing'); v.pause();
  }
  document.querySelectorAll('.media').forEach(m => {
    const v = m.querySelector('video'); if (!v) return;
    seen.observe(v);
    if (hover) {
      m.addEventListener('pointerenter', () => startClip(m));
      m.addEventListener('pointerleave', () => stopClip(m));
    }
  });
  // On touch screens, play the clip that is most in view
  if (!hover && !still && 'IntersectionObserver' in window) {
    const mid = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) startClip(en.target); else stopClip(en.target);
    }), { rootMargin: '-35% 0px -35% 0px' });
    document.querySelectorAll('.media').forEach(m => { if (m.querySelector('video')) mid.observe(m); });
  }

  // Tile fade-ins
  if ('IntersectionObserver' in window && !still) {
    document.documentElement.classList.add('js');
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.tile').forEach(t => io.observe(t));
  }

  // Chicago clock
  const clock = document.getElementById('clock');
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit' });
  const tick = () => { clock.textContent = fmt.format(new Date()); };
  tick(); setInterval(tick, 15000);

  // Lightbox
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
      node = document.createElement('iframe');
      node.src = src; node.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media'; node.allowFullscreen = true;
    }
    if (typeof dlg.showModal !== 'function') { window.open(node.src, '_blank', 'noopener'); return; }
    node.title = el.dataset.title || 'Video';
    frame.replaceChildren(node);
    title.textContent = el.dataset.title || '';
    reel.pause();
    document.querySelectorAll('.media.playing').forEach(stopClip);
    dlg.showModal();
  }
  const close = () => { if (dlg.open) dlg.close(); };
  dlg.addEventListener('close', () => {
    frame.replaceChildren();
    if (!still && reel.getBoundingClientRect().bottom > 0) reel.play().catch(() => {});
  });
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
  document.getElementById('playerClose').addEventListener('click', close);
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-yt], [data-vimeo], [data-video]');
    if (el) { e.preventDefault(); open(el); }
  });
})();
