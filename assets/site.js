// Video lightbox for [data-yt] / [data-vimeo] buttons, plus a quiet fade-in on scroll.
(() => {
  const dlg = document.getElementById('player');
  const frame = document.getElementById('playerFrame');
  const title = document.getElementById('playerTitle');

  function open(el) {
    const src = el.dataset.yt
      ? `https://www.youtube-nocookie.com/embed/${el.dataset.yt}?autoplay=1&rel=0&modestbranding=1`
      : `https://player.vimeo.com/video/${el.dataset.vimeo}?autoplay=1&title=0&byline=0&portrait=0`;
    if (typeof dlg.showModal !== 'function') { window.open(src, '_blank', 'noopener'); return; }
    const f = document.createElement('iframe');
    f.src = src; f.title = el.dataset.title || 'Video';
    f.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media'; f.allowFullscreen = true;
    frame.replaceChildren(f);
    title.textContent = el.dataset.title || '';
    dlg.showModal();
  }
  const close = () => { if (dlg.open) dlg.close(); };
  dlg.addEventListener('close', () => frame.replaceChildren());
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
  document.getElementById('playerClose').addEventListener('click', close);
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-yt], [data-vimeo]');
    if (el) { e.preventDefault(); open(el); }
  });

  if (!('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('js');
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.project, .clients, .about, .experience, .film, .contact').forEach(el => io.observe(el));
})();
