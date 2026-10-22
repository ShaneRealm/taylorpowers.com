# Changelog

> Last verified against the code: 2026-10-22 (commit 605a391)

There are no version numbers; each entry is a date and the commits it covers. The `?v=` cache stamp is noted where it changed. There's no migration: it's a static site with no stored data or clients.

## 2026-10-22

- **Security:** every page has a Content-Security-Policy and a referrer policy as `<meta>` tags (GitHub Pages can't send headers): scripts and styles only from the site, Google Fonts, frames only from Vimeo and youtube-nocookie, `object-src 'none'`, `upgrade-insecure-requests`. The case pages get them from `scripts/build_work.py`. SECURITY.md updated.

- **Docs:** the full documentation set, the docs harness and the "where we left off" status page ([docs/STATUS.md](docs/STATUS.md)).

## 2026-10-21

- **605a391:** HD Vimeo background heroes on the FLEX × LAFC and SuperFile launch pages; FLEX "Welcome to the Club" key art in the gallery. Stamp 14.
- **2066bc7:** eight generated case-study pages (`scripts/build_work.py`); every work tile links to its page. Also a logo wall (13 logos), the portrait in About, a once-per-visit intro, a 1200×630 share card and an SVG favicon. Stamp 13.
- **790662b:** the accent changed from volt yellow to neon blue `#00a6ff`, with a glow on the headline. Stamp 12.
- **019dd20:** Head of Production, Head of Post-Production and Visual Effects Producer added at SuperFile and Realm. Stamp 11.
- **2ba1710:** content updated from resume v9:
  - figures of 60B+, 20,000+, 200+, 150K+, $20M+ and 25+
  - four capability pillars
  - studios and credits (*Dune: Part One*, *Terminator: Dark Fate*)
  - full titles in experience

  Stamp 10.
- **ff6ab7a:** the **cinematic, reel-first redesign**, now the current look. A full-screen reel with a sound toggle and progress line, work tiles with hover-to-play clips cut from the reel, condensed Archivo type, and no scroll effects.
- **7d19490:** replaced the masked-letter zoom with a GPU-only growing frame and dropped smooth scrolling (it stuttered).
- **0d022ae:** the reel inside the name with a scroll zoom, smooth scroll, parallax and a project index (reverted for stutter).
- **bc1d30a:** the showreel as the hero background; real race photography; the Mr. Brainwash art car.
- **344e3a5:** a cinematic hero slideshow and an asymmetric case layout.
- **5a1127e:** a restrained white editorial portfolio.
- **7fb275b:** a bright white theme.
- **349556a:** rebuilt as a full marketing site; contact changed to taylor@taylorpowers.com.
- **34d5320, 32958cf:** the CNAME re-saved to issue the HTTPS certificate.
- **DNS and email (outside the repo):**
  - DNS moved from GoDaddy parking to GitHub Pages, then to Cloudflare.
  - Cloudflare Email Routing set up for taylor@taylorpowers.com.

## Before 2026-10-21

- **d01179e:** the original one-page site.
