// Taylor Powers: intro, reel sound and progress, hover-to-play work clips, fade-ins, Chicago clock and the video lightbox.
// Shared by the home page and the case-study pages, so every part checks that its elements exist.
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = id => document.getElementById(id);
  const dlg = $('player');

  // Intro: once per visit, skipped for reduced motion
  const intro = $('intro');
  if (intro) {
    let seen = false;
    try { seen = sessionStorage.getItem('tp-intro') === '1'; sessionStorage.setItem('tp-intro', '1'); } catch (_) {}
    if (seen || still) intro.remove();
    else setTimeout(() => { intro.classList.add('done'); setTimeout(() => intro.remove(), 700); }, 1300);
  }

  // Videos only run while visible
  const vis = new IntersectionObserver(entries => entries.forEach(en => {
    const v = en.target;
    if (v.dataset.auto) { if (en.isIntersecting && !still && !(dlg && dlg.open)) v.play().catch(() => {}); else v.pause(); return; }
    if (!en.isIntersecting) stopClip(v.closest('.media'));
  }), { threshold: 0.15 });

  // Home reel: sound toggle and progress line
  const reel = $('reel');
  if (reel) {
    reel.dataset.auto = '1'; vis.observe(reel);
    if (still) reel.pause();
    const soundBtn = $('soundBtn');
    soundBtn?.addEventListener('click', () => {
      reel.muted = !reel.muted;
      if (!reel.muted) reel.play().catch(() => {});
      soundBtn.setAttribute('aria-pressed', String(!reel.muted));
      soundBtn.querySelector('.t').textContent = reel.muted ? 'Sound on' : 'Sound off';
    });
    const bar = $('reelProgress');
    reel.addEventListener('timeupdate', () => { if (reel.duration && bar) bar.style.transform = `scaleX(${reel.currentTime / reel.duration})`; });
    const barEl = $('bar');
    new IntersectionObserver(([en]) => barEl.classList.toggle('solid', !en.isIntersecting), { rootMargin: '-70px 0px 0px 0px' }).observe(document.querySelector('.reel'));
  }
  // Case-page hero video
  document.querySelectorAll('.case-hero video').forEach(v => { v.dataset.auto = '1'; vis.observe(v); if (still) v.pause(); });

  // Case-page HD heroes: Vimeo background players fade in once they report playing
  const hd = document.querySelector('.case-hero-vimeo');
  if (hd && !still) {
    addEventListener('message', ev => {
      if (!/vimeo\.com$/.test(new URL(ev.origin).hostname)) return;
      let d = ev.data; try { if (typeof d === 'string') d = JSON.parse(d); } catch (_) { return; }
      if (d && (d.event === 'play' || d.event === 'playProgress' || d.event === 'timeupdate')) {
        hd.classList.add('on');
        document.querySelector('.case-hero video')?.pause();
      }
    });
    hd.addEventListener('load', () => {
      ['play', 'playProgress', 'timeupdate'].forEach(n => hd.contentWindow.postMessage(JSON.stringify({ method: 'addEventListener', value: n }), '*'));
    });
  } else if (hd) hd.remove();

  // Work clips: preview on hover (desktop), or when centered (touch); the file loads on first use
  function startClip(m) {
    const v = m && m.querySelector('video'); if (!v || still) return;
    if (!v.src) v.src = v.dataset.src;
    v.play().then(() => m.classList.add('playing')).catch(() => {});
  }
  function stopClip(m) {
    const v = m && m.querySelector('video'); if (!v) return;
    m.classList.remove('playing'); v.pause();
  }
  const clipMedia = [...document.querySelectorAll('.media')].filter(m => m.querySelector('video'));
  clipMedia.forEach(m => {
    vis.observe(m.querySelector('video'));
    if (hover) { m.addEventListener('pointerenter', () => startClip(m)); m.addEventListener('pointerleave', () => stopClip(m)); }
  });
  if (!hover && !still) {
    const mid = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) startClip(en.target); else stopClip(en.target); }), { rootMargin: '-35% 0px -35% 0px' });
    clipMedia.forEach(m => mid.observe(m));
  }

  // Fade-ins
  if (!still) {
    document.documentElement.classList.add('js');
    const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.tile').forEach(t => io.observe(t));
  }

  // Chicago clock
  const clock = $('clock');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit' });
    const tick = () => { clock.textContent = fmt.format(new Date()); };
    tick(); setInterval(tick, 15000);
  }

  // Lightbox
  if (!dlg) return;
  const frame = $('playerFrame'), title = $('playerTitle');
  function open(el) {
    let node;
    if (el.dataset.video) {
      node = document.createElement('video');
      node.src = el.dataset.video; node.controls = true; node.autoplay = true; node.playsInline = true;
    } else {
      node = document.createElement('iframe');
      node.src = el.dataset.yt
        ? `https://www.youtube-nocookie.com/embed/${el.dataset.yt}?autoplay=1&rel=0&modestbranding=1`
        : `https://player.vimeo.com/video/${el.dataset.vimeo}?autoplay=1&title=0&byline=0&portrait=0`;
      node.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media'; node.allowFullscreen = true;
    }
    if (typeof dlg.showModal !== 'function') { window.open(node.src, '_blank', 'noopener'); return; }
    node.title = el.dataset.title || 'Video';
    frame.replaceChildren(node);
    title.textContent = el.dataset.title || '';
    document.querySelectorAll('video[data-auto]').forEach(v => v.pause());
    clipMedia.forEach(stopClip);
    dlg.showModal();
  }
  const close = () => { if (dlg.open) dlg.close(); };
  dlg.addEventListener('close', () => {
    frame.replaceChildren();
    if (!still) document.querySelectorAll('video[data-auto]').forEach(v => { if (v.getBoundingClientRect().bottom > 0 && v.getBoundingClientRect().top < innerHeight) v.play().catch(() => {}); });
  });
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
  $('playerClose').addEventListener('click', close);
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-yt], [data-vimeo], [data-video]');
    if (el) { e.preventDefault(); open(el); }
  });
})();
