# Taylorpowers.com

Site for Taylor Powers, brand and creative production executive: VP of Brand, brand management, managing director, account director, production and visual effects. It's a static site served by GitHub Pages at https://taylorpowers.com, and pushing to `main` deploys it.

- `index.html`: the home page: full-screen reel, work tiles (each links to its case page), logo wall, About with portrait, contact. A short intro plays once per visit.
- `work/<slug>/index.html`: case-study pages, **generated** by `python3 scripts/build_work.py`. Edit the `PROJECTS` list there, not the HTML. Facts come only from Taylor's resume and public coverage. Add `hero_vimeo="<id>"` to stream a project's Vimeo film as an HD silent background hero; it fades in once Vimeo reports playing, and the local clip or poster shows until then.
- `assets/site.css`: the cinematic, reel-first design. It's near-black, set in Archivo (display lines in its 62% condensed width) with one neon-blue accent (#00a6ff). After editing CSS or JS, bump `?v=` in `index.html` and `V` in the build script.
- `assets/site.js`: shared by every page. Intro, reel sound and progress, hover-to-play clips (on phones they play when centered), fade-ins, Chicago clock and the video lightbox. Videos pause whenever they're off screen.
- `assets/video/reel.mp4`: the showreel (fast-start). `assets/clips/`: short silent 720p loops cut from the reel, each with a poster `.jpg`.
- `assets/logos/`: partner logos (Wikimedia Commons, Simple Icons, brand sites), shown white via CSS filters. Use `mono` for one-color logos and `inv` for multi-color ones.
- `assets/img/`: press stills and `taylor-portrait.jpg` (800px; a larger original would be sharper). `assets/og.jpg`: the 1200×630 share card.

Performance rule: no scroll-driven animation, no scroll-jacking libraries, and no scaling of SVG masks or large text. Earlier versions with those stuttered.

Contact address: taylor@taylorpowers.com. Cloudflare Email Routing forwards it to Taylor's Gmail.

DNS is on Cloudflare (nameservers braelyn/kip, registrar GoDaddy). Four A records on @ point at GitHub Pages (185.199.108-111.153), and www is a CNAME to shanerealm.github.io. All of them are DNS only (gray cloud).

