# Architecture

> Last verified against the code: 2026-10-22 (commit 605a391)

A static site. There's no server code: GitHub Pages serves the files in the repository as they are.

```
Visitor ──► Cloudflare DNS (taylorpowers.com, DNS only)
              │  A @ → 185.199.108–111.153     CNAME www → shanerealm.github.io
              ▼
        GitHub Pages (repo ShaneRealm/taylorpowers.com, branch main, folder /)
              │  index.html, work/*/index.html, assets/*
              ├──► Google Fonts (Archivo)
              ├──► Vimeo player (HD background heroes, films in the lightbox)
              └──► YouTube (nocookie) player (films in the lightbox)

Mail ──► MX route1-3.mx.cloudflare.net ──► Cloudflare Email Routing
              taylor@taylorpowers.com ──► taylorrpowers5@gmail.com
```

## Components

| Component | Where | What it does |
|---|---|---|
| Home page | `index.html` | Intro, full-screen showreel, work tiles, logo wall, About (portrait, figures, roles, experience, film credits), contact |
| Case-study pages | `work/<slug>/index.html` | One per project. **Generated** by `scripts/build_work.py`; never edit by hand |
| Generator | `scripts/build_work.py` | Holds the `PROJECTS` data and the page template; writes the eight case pages |
| Styles | `assets/site.css` | All styles for every page |
| Behavior | `assets/site.js` | Shared by every page; each part checks that its elements exist |
| Media | `assets/video/`, `assets/clips/`, `assets/img/`, `assets/logos/` | Showreel, hover clips, stills, partner logos |
| Share card and icon | `assets/og.jpg`, `assets/favicon.svg` | Link previews (1200×630) and the browser-tab icon |
| Domain | `CNAME` | Tells GitHub Pages to serve taylorpowers.com |

## Hosting and domain

- **GitHub Pages:** legacy build from `main` /, custom domain taylorpowers.com, HTTPS enforced. The certificate covers taylorpowers.com and www. Pushing to `main` deploys.
- **DNS:** Cloudflare zone `dc61b51522b6984b10dfe63b4a5b6dbd` in the shared Cloudflare account. The registrar is GoDaddy (Wild West Domains), with nameservers braelyn and kip.ns.cloudflare.com. Every web record is **DNS only** (gray cloud) so GitHub can issue and renew the certificate.
- **Email:** Cloudflare Email Routing. One rule forwards taylor@taylorpowers.com to taylorrpowers5@gmail.com, with MX, SPF and DKIM records added by Email Routing. Receive only; there's no mailbox to send from.

## External services the pages load

| Service | Used for |
|---|---|
| fonts.googleapis.com / fonts.gstatic.com | Archivo variable font (weights 100–900, widths 62–125) |
| player.vimeo.com | HD background heroes (`hero_vimeo`) and lightbox films |
| youtube-nocookie.com | Lightbox films |

Links in case pages also point to coverage on speedcafe.com, ufc.com and jayski.com.
