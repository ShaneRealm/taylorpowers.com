# Taylorpowers.com

Site for Taylor Powers, brand and creative production executive: VP of Brand, brand management, managing director, account director, production and visual effects. It's a static site served by GitHub Pages at https://taylorpowers.com, and pushing to `main` deploys it.

- `index.html`: the whole page (intro, selected work, clients, about, experience, film & VFX, contact). Work is plain HTML `.case` articles. A `.media` button with `data-yt` or `data-vimeo` plays the video in the lightbox; a `.media` link opens the source.
- `assets/site.css`: all styles. The design is deliberately editorial: a full-bleed hero showreel (`assets/video/reel.mp4`, muted loop; "Play showreel with sound" opens it in the lightbox), then one typeface (Inter Tight), black on white, an asymmetric 12-column grid, and photography that unveils on scroll. No gradients or decorative effects. After editing CSS or JS, bump `?v=` in `index.html`.
- `assets/site.js`: hero video, header state, scroll reveals, cursor label and the video lightbox.
- `assets/img/`: work stills and press images. `assets/video/`: the showreel and its poster frame. Re-save any new reel with the index at the front ("fast start") so it streams.

Contact address: taylor@taylorpowers.com. Cloudflare Email Routing forwards it to Taylor's Gmail.

DNS is on Cloudflare (nameservers braelyn/kip, registrar GoDaddy). Four A records on @ point at GitHub Pages (185.199.108-111.153), and www is a CNAME to shanerealm.github.io. All of them are DNS only (gray cloud).
