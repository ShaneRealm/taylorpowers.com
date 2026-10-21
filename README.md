# Taylorpowers.com

Site for Taylor Powers, brand and creative production executive: VP of Brand, brand management, managing director, account director, production and visual effects. It's a static site served by GitHub Pages at https://taylorpowers.com, and pushing to `main` deploys it.

- `index.html`: the whole page (intro, selected work, clients, about, experience, film & VFX, contact). Work is plain HTML `<figure>` blocks. A `.media` button with `data-yt` or `data-vimeo` plays the video in the lightbox; a `.media` link opens the source.
- `assets/site.css`: all styles. The design is deliberately editorial: one typeface (Inter Tight), black on white, a 12-column grid, captions under the images, and no gradients or decorative effects. After editing CSS or JS, bump `?v=` in `index.html`.
- `assets/site.js`: the video lightbox and a quiet fade-in on scroll.
- `assets/img/`: work stills and press images.

Contact address: taylor@taylorpowers.com. Cloudflare Email Routing forwards it to Taylor's Gmail.

DNS is on Cloudflare (nameservers braelyn/kip, registrar GoDaddy). Four A records on @ point at GitHub Pages (185.199.108-111.153), and www is a CNAME to shanerealm.github.io. All of them are DNS only (gray cloud).
