// Taylor Powers site: work wall, film posters, video player, role ticker, count-ups and scroll reveals.
(() => {
  const IMG = 'assets/img/';
  const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4l15 8-15 8z"/></svg>';

  // Each tile: yt / vimeo (plays in the lightbox) or href (opens the source).
  const WORK = [
    { size: 'wide', c: '#d7ff3a', c2: '#6366f1', meta: 'SuperFile × Trackhouse Racing · NASCAR', title: 'Daytona 500 debut',
      text: "SuperFile's black-and-neon #97 for Shane van Gisbergen on NASCAR's biggest stage, the start of a multi-year Trackhouse program and race-weekend activations.",
      img: 'daytona-97.jpg', href: 'https://speedcafe.com/nascar-news-2026-cup-series-shane-van-gisbergen-daytona-500-livery-svg-trackhouse-superfile/', chips: ['Sponsorship', 'Livery', 'Race weekend'] },
    { size: '', c: '#ff3b3b', c2: '#ffc65a', meta: 'SuperFile × UFC & WWE', title: 'Fight night, global',
      text: 'The first Official Secure File Sharing Partner of both UFC and WWE, activated across fight nights and live events.',
      img: 'ufc-wwe.jpg', href: 'https://www.ufc.com/news/tko-and-superfile-announce-global-partnership-across-ufc-and-wwe', chips: ['TKO partnership', 'Live events'] },
    { size: 'half', c: '#3cc7e6', c2: '#a35ce6', meta: 'SuperFile Trackhouse MotoGP Team', title: 'Title partner in MotoGP',
      text: 'SuperFile took the name on the grid as title sponsor of the Trackhouse MotoGP team. Paddock content, VIP hospitality and partner deliverables, every round.',
      img: 'yt-JF26n2-jgBI.jpg', yt: 'JF26n2-jgBI', chips: ['Title sponsorship', 'Content', 'VIP'] },
    { size: 'half', c: '#ffc65a', c2: '#ff6b1a', meta: 'SuperFile · Broadcast', title: 'Change the Outcome',
      text: "SuperFile's national broadcast work, part of a slate that included Super Bowl advertising, American media's biggest stage.",
      img: 'superfile-spot.jpg', href: 'https://www.ispot.tv/ad/g2Rv/superfile-change-the-outcome', chips: ['Super Bowl advertising', 'Production'] },
    { size: '', c: '#ff6b1a', c2: '#e0607e', meta: 'SuperFile · Brand launch', title: 'Launching SuperFile',
      text: 'Took a new brand to market: identity, voice, film, content and the sports program behind it.',
      img: 'vm-1014838410.jpg', vimeo: '1014838410', chips: ['Brand', 'Film'] },
    { size: 'wide', c: '#c8a24a', c2: '#111111', meta: 'FLEX × LAFC · MLS', title: 'Front of the jersey',
      text: "Activated FLEX's front-of-jersey sponsorship with LAFC, from the partnership reveal to kit launches, content and matchday.",
      img: 'yt-7D4P9MUh0uU.jpg', yt: '7D4P9MUh0uU', chips: ['MLS', 'Jersey sponsorship', 'Activation'] },
    { size: 'half', c: '#ffc65a', c2: '#e0607e', meta: 'LAFC · Kit launch', title: 'Heart of Gold',
      text: 'Introducing the LAFC "Heart of Gold" jersey with FLEX on the front.',
      img: 'yt-b8bO5EV7JGc.jpg', yt: 'b8bO5EV7JGc', chips: ['Kit reveal', 'Content'] },
    { size: 'half', c: '#ff6b1a', c2: '#6366f1', meta: 'FLEX · Realm Agency', title: 'Billions of impressions',
      text: 'FLEX campaigns and partnership content that drove 40B+ impressions, and the 2022 LAFC × FLEX jersey.',
      img: 'flex-lafc-20b.jpg', vimeo: '781544305', chips: ['40B+ impressions', 'Campaigns'] },
    { size: '', c: '#7ac143', c2: '#3cc7e6', meta: 'EGO · Product launches', title: 'EGO Power+',
      text: 'Launch creative for EGO outdoor power equipment, from mowers to the 765 blower.',
      img: 'ego-z6.jpg', href: 'https://www.realmempire.com/portfolio/', chips: ['Launch', 'Product film'] },
    { size: '', c: '#e4002b', c2: '#ffc65a', meta: 'SKIL · Campaign', title: "Don't be a Gas Zombie",
      text: 'A cordless-power campaign for SKIL, with horror-comedy talent and VFX.',
      img: 'yt-8U5-WrfmTlE.jpg', yt: '8U5-WrfmTlE', chips: ['Talent', 'VFX'] },
    { size: '', c: '#ff6b1a', c2: '#a35ce6', meta: 'FLEX × LAFC', title: 'Power to empower',
      text: 'Partnership storytelling that put FLEX inside the club, the city and the community.',
      img: 'vm-781610331.jpg', vimeo: '781610331', chips: ['Partnership film'] },
  ];

  const FILMS = [
    { feature: true, title: 'Dune', note: 'Feature · VFX', img: 'yt-8g18jFHCLXk.jpg', yt: '8g18jFHCLXk' },
    { feature: true, title: 'Doctor Strange in the Multiverse of Madness', note: 'Marvel Studios · VFX', img: 'yt-aWzlQ2N6qqg.jpg', yt: 'aWzlQ2N6qqg' },
    { title: 'Beastie Boys Story', note: 'Apple TV+ · VFX', img: 'yt-ZCyqR2RXoQU.jpg', yt: 'ZCyqR2RXoQU' },
    { title: 'Grand Theft Auto', note: 'Video game · VFX', pc: '#2f9e5b', word: 'GTA' },
    { title: 'Thanos', note: 'Digital Domain · Digital Human Group', pc: '#7b4bd6', word: 'Thanos' },
  ];

  const REEL = [WORK[0], WORK[1], WORK[5], FILMS[0]];
  const ROLES = ['VP of Brand', 'Brand Management', 'Managing Director', 'Account Director', 'Production', 'Visual Effects Producer'];

  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const playable = w => w.yt || w.vimeo;

  // Work wall
  const grid = document.getElementById('workGrid');
  grid.innerHTML = WORK.map((w, i) => {
    const tag = playable(w) ? 'button type="button"' : `a href="${esc(w.href)}" target="_blank" rel="noopener"`;
    const end = playable(w) ? 'button' : 'a';
    const bg = w.img ? `<div class="bg"><img src="${IMG + w.img}" alt="" loading="lazy" decoding="async"></div>`
                     : `<div class="bg art"><span class="big">${esc(w.title)}</span></div>`;
    return `<${tag} class="tile reveal ${w.size}" data-i="${i}" style="--c:${w.c};--c2:${w.c2}">
      ${bg}
      <span class="play">${playable(w) ? PLAY : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" stroke="#fff" stroke-width="2.4" fill="none"/></svg>'}</span>
      <span class="meta">${esc(w.meta)}</span>
      <h3>${esc(w.title)}</h3>
      <p>${esc(w.text)}</p>
      <span class="chip">${w.chips.map(c => `<i>${esc(c)}</i>`).join('')}</span>
    </${end}>`;
  }).join('');

  // Posters
  const posters = document.getElementById('posters');
  posters.innerHTML = FILMS.map((f, i) => {
    const inner = `${f.img ? `<img src="${IMG + f.img}" alt="" loading="lazy" decoding="async">` : `<span class="pbg" style="--pc:${f.pc}" data-word="${esc(f.word)}"></span>`}
      ${f.yt ? `<span class="play">${PLAY}</span>` : ''}
      <span class="ptitle"><b>${esc(f.title)}</b><small>${esc(f.note)}</small></span>`;
    return f.yt ? `<button type="button" class="poster reveal${f.feature ? ' feature' : ''}" data-f="${i}" aria-label="Play ${esc(f.title)} trailer">${inner}</button>`
                : `<div class="poster reveal${f.feature ? ' feature' : ''}">${inner}</div>`;
  }).join('');

  // Hero reel
  document.getElementById('heroReel').innerHTML = REEL.map(r =>
    `<button type="button" class="still" data-reel="${esc(r.title)}"><img src="${IMG + r.img}" alt="" decoding="async"><span>${esc(r.title)}</span></button>`
  ).join('');

  // Video player
  const dlg = document.getElementById('player');
  const frame = document.getElementById('playerFrame');
  const cap = document.getElementById('playerCap');
  function play(item, label) {
    if (!playable(item)) { if (item.href) window.open(item.href, '_blank', 'noopener'); return; }
    const src = item.yt
      ? `https://www.youtube-nocookie.com/embed/${item.yt}?autoplay=1&rel=0&modestbranding=1`
      : `https://player.vimeo.com/video/${item.vimeo}?autoplay=1&title=0&byline=0&portrait=0`;
    frame.innerHTML = `<iframe src="${src}" title="${esc(label)}" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe>`;
    cap.textContent = label;
    if (typeof dlg.showModal === 'function') dlg.showModal(); else window.open(src, '_blank', 'noopener');
  }
  function closePlayer() { frame.innerHTML = ''; if (dlg.open) dlg.close(); }
  dlg.addEventListener('close', () => { frame.innerHTML = ''; });
  dlg.addEventListener('click', e => { if (e.target === dlg) closePlayer(); });
  document.getElementById('playerClose').addEventListener('click', closePlayer);

  grid.addEventListener('click', e => {
    const t = e.target.closest('button.tile'); if (!t) return;
    const w = WORK[+t.dataset.i]; play(w, `${w.meta} · ${w.title}`);
  });
  posters.addEventListener('click', e => {
    const p = e.target.closest('button.poster'); if (!p) return;
    const f = FILMS[+p.dataset.f]; play(f, `${f.title} · Official trailer`);
  });
  document.getElementById('heroReel').addEventListener('click', e => {
    const s = e.target.closest('.still'); if (!s) return;
    const item = REEL.find(r => r.title === s.dataset.reel);
    play(item, item.meta ? `${item.meta} · ${item.title}` : `${item.title} · Official trailer`);
  });

  // Role ticker
  const swap = document.getElementById('roleSwap');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ri = 0;
  if (!still) setInterval(() => {
    swap.classList.remove('in'); swap.classList.add('out');
    setTimeout(() => { ri = (ri + 1) % ROLES.length; swap.textContent = ROLES[ri]; swap.classList.remove('out'); swap.classList.add('in'); }, 340);
  }, 2400);

  // Reveal + count-ups
  const fmt = n => n >= 1000 ? n.toLocaleString('en-US') : String(n);
  function countUp(b) {
    const to = +b.dataset.count, pre = b.dataset.prefix || '', suf = b.dataset.suffix || '';
    if (still) return;
    const t0 = performance.now(), dur = 1400;
    const step = t => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      b.textContent = pre + fmt(Math.round(to * e)) + suf; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      en.target.querySelectorAll?.('[data-count]').forEach(countUp);
      io.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }) : null;
  document.querySelectorAll('.reveal').forEach((el, i) => {
    if (io) { el.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(el); } else el.classList.add('in');
  });

  // Nav background + cursor glow
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const glow = document.querySelector('.cursor-glow');
  addEventListener('pointermove', e => { glow.style.setProperty('--x', e.clientX + 'px'); glow.style.setProperty('--y', e.clientY + 'px'); }, { passive: true });
})();
