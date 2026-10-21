# Taylorpowers.com

Marketing site for Taylor Powers, brand and creative production executive: VP of Brand, brand management, managing director, account director, production and visual effects. It's a static site served by GitHub Pages at https://taylorpowers.com, and pushing to `main` deploys it.

- `index.html`: the page (hero, selected work, roles, run of show, film & VFX, contact).
- `assets/site.css`: all styles. After editing it, bump `?v=` in `index.html`.
- `assets/site.js`: the work wall, film cards, video lightbox, role ticker and scroll effects. Add a project by adding to `WORK`: `yt` (YouTube ID) or `vimeo` (Vimeo ID) plays in the lightbox, and `href` opens a link.
- `assets/img/`: work stills, press images and trailer thumbnails.

Contact address: taylor@taylorpowers.com. Cloudflare Email Routing forwards it to Taylor's Gmail.

DNS is on Cloudflare (nameservers braelyn/kip, registrar GoDaddy). Four A records on @ point at GitHub Pages (185.199.108-111.153), and www is a CNAME to shanerealm.github.io. All of them are DNS only (gray cloud).
