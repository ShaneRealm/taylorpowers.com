# Taylorpowers.com

Site for Taylor Powers, brand and creative production executive: VP of Brand, brand management, managing director, account director, production and visual effects. It's a static site served by GitHub Pages at https://taylorpowers.com, and pushing to `main` deploys it.

- `index.html`: the whole page: full-screen reel, selected work tiles, partners, about, contact.
- `assets/site.css`: the cinematic, reel-first design. It's near-black, set in Archivo (display lines in its 62% condensed width) with one volt accent (#d7ff3a). After editing CSS or JS, bump `?v=` in `index.html`.
- `assets/site.js`: reel sound toggle and progress line, hover-to-play work clips (on phones they play when centered on screen), fade-ins, Chicago clock and the video lightbox. Videos pause whenever they're off screen.
- `assets/video/reel.mp4`: the showreel (fast-start). `assets/clips/`: short silent 720p loops cut from the reel (about 1 MB each, loaded only when needed), each with a poster `.jpg`.
- `assets/img/`: press and work stills.

Performance rule: no scroll-driven animation, no scroll-jacking libraries, and no scaling of SVG masks or large text. Earlier versions with those stuttered.

Contact address: taylor@taylorpowers.com. Cloudflare Email Routing forwards it to Taylor's Gmail.

DNS is on Cloudflare (nameservers braelyn/kip, registrar GoDaddy). Four A records on @ point at GitHub Pages (185.199.108-111.153), and www is a CNAME to shanerealm.github.io. All of them are DNS only (gray cloud).

