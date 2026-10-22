# Implementation

> Last verified against the code: 2026-10-22 (commit 605a391)

How each part is built, file by file.

## `index.html` (home)

In page order:

1. **Intro** (`#intro`). "TAYLOR POWERS" rises on black and a blue line sweeps across, then it fades after 1.3 s. It plays once per browser session (`sessionStorage` key `tp-intro`) and is skipped for reduced motion.
2. **Header** (`#bar`). It's transparent over the reel and gets a solid, blurred backing (`.solid`) once the reel scrolls away.
3. **Reel** (`.reel`). `assets/video/reel.mp4` plays full screen, muted and looping, with the poster `assets/video/reel-poster.jpg`. The headline reads "Brand. Partnerships. Production.", with the third line in the accent and a glow. The **Sound on** button (`#soundBtn`) unmutes in place, **Watch full reel** opens it in the lightbox, and a blue progress line (`#reelProgress`) tracks playback.
4. **Selected work** (`#work`). Nine tiles in a 2-column grid (`.tile`, `.tile.wide` spans both). Each tile's `.media` links to its case page. Tiles with a `<video data-src>` play a clip on hover (desktop) or when centered on screen (touch). The clip file loads only on first use.
5. **Partners** (`.partners`). A 7-column logo wall (`.logos`). Each logo is white via a CSS filter: `mono` for one-color logos, `inv` for multi-color ones. Size classes (`tall`, `round`, `sq`) even them out. The last cell (`.more`) names SuperFile, Trackhouse Racing, MotoGP and MLS, which have no clean logo file.
6. **About** (`#about`). The portrait (`assets/img/taylor-portrait.jpg`) sits beside the lead and bio. Then six figures (`.figures`), four capability pillars (`.pillars`), **Roles held** and **Experience** (`.two`), and film credits (`.films`, whose buttons open trailers).
7. **Contact** (`#contact`). A large mailto link, LinkedIn, the live Chicago time (`#clock`) and the copyright.
8. **Lightbox** (`dialog#player`). It plays `data-yt` (YouTube, nocookie), `data-vimeo` or `data-video` (a local file).

The work tiles link to these case pages:

| Tile | Case page |
|---|---|
| Daytona 500 | `work/superfile-trackhouse-nascar/` |
| Front of the jersey (falcon clip) | `work/flex-lafc/` |
| Fight night, worldwide | `work/superfile-ufc-wwe/` |
| Out of the plane (EGO clip) | `work/ego/` |
| Name on the grid | `work/superfile-trackhouse-motogp/` |
| Power on the pitch (soccer clip) | `work/flex-lafc/` |
| Don't be a gas zombie (SKIL clip) | `work/skil/` |
| The art car | `work/superfile-art-car/` |
| Brand launch | `work/superfile-brand-launch/` |

## `scripts/build_work.py` (case pages)

`PROJECTS` is a list of dicts with these keys:

- `slug`, `client`, `title`, `year`, `role`, `disciplines`
- `hero_img`, and optionally `hero_clip` (a local loop), `hero_vimeo` (an HD Vimeo background) and `hero_light` (a white render, which gets a dark title band)
- `lead`, `body` (paragraphs) and `figures` (number, label)
- optionally `film` (`yt`, `vimeo` or `video`, plus `title`), `link` (label, URL) and `gallery` (shown only with two or more images)

`page()` renders the template. Each page has a hero, a meta list (client, year, role, disciplines), text, actions (**Watch the film**, a coverage link), figures, a gallery, and a **Next project** link that wraps from the last to the first. It also sets per-page `<title>`, description and Open Graph tags. Pages use root-absolute paths (`/assets/...`), so they work only from the site root, which is how Pages and the local preview serve them.

`V` sets the `?v=` cache stamp on the case pages' CSS and JS; keep it equal to the stamp in `index.html`.

## `assets/site.js`

The script is one IIFE, and every part guards for missing elements so it can run on both page types.

| Part | Details |
|---|---|
| Intro | Removes `#intro` after 1.3 s, or at once if seen this session or under reduced motion |
| Visibility | One IntersectionObserver pauses any video off screen. Videos marked `data-auto` (the reel, case heroes) resume when visible |
| Reel | Sound toggle, progress line, and the header's `.solid` state |
| HD heroes | Listens for Vimeo `play`, `playProgress` and `timeupdate` messages from `.case-hero-vimeo`. On the first one it fades the iframe in (`.on`) and pauses the local clip. Under reduced motion the iframe is removed |
| Clips | `startClip` and `stopClip` set `src` from `data-src` on first use and toggle `.playing`. Hover drives them on desktop; a centered-on-screen observer (`rootMargin -35%`) drives them on touch |
| Fade-ins | `.tile` elements fade up once (`html.js`, `.in`) |
| Clock | `Intl.DateTimeFormat` for America/Chicago, refreshed every 15 s |
| Lightbox | Builds a `<video>` or `<iframe>` and pauses every other video. On close it clears the frame and resumes visible `data-auto` videos |

## `assets/site.css`

- **Tokens:** `--bg #0a0a0a`, `--panel`, `--fg`, `--muted`, `--line`, `--accent #00a6ff` (neon blue), `--font` (Archivo).
- **Type:** `.display` is weight 800 and `font-stretch: 62%` (condensed), set in uppercase.
- **Sections:** `.bar`, `.reel*`, `.work`, `.grid`, `.tile`, `.media`, `.go`, `.meta`, `.logos`, `.about-main`, `.portrait`, `.figures`, `.pillars`, `.two`, `.list`, `.exp`, `.films`, `.contact`, `.player`, `.intro`, and the case-page classes (`.case-hero*`, `.case-body`, `.case-meta`, `.case-text`, `.case-actions`, `.case-figures`, `.case-gallery`, `.next`, `.case-foot`).
- **Reduced motion:** a `prefers-reduced-motion: reduce` block turns off all animation and transitions.

## Media

| Folder | Contents | How it was made |
|---|---|---|
| `assets/video/` | `reel.mp4` (1080p H.264, 45 s, about 5.6 MB) and `reel-poster.jpg` | The owner's showreel, re-saved with the index at the front (fast start) |
| `assets/clips/` | `ego`, `flex-falcon`, `flex-soccer`, `skil` (`.mp4` and `.jpg`) | Cut silent from the reel (EGO 4.4–7.9 s, falcon 19.4–22.6 s, soccer 30.0–34.6 s, SKIL 26.9–30.2 s), 1280×720 H.264 at about 2.2 Mbps, about 1 MB each |
| `assets/img/` | `daytona-race`, `ufc-wwe`, `motogp-superfile`, `art-car`, `vm-1014838410`, `flex-lafc-welcome`, `taylor-portrait` | See [CONTENT.md](CONTENT.md) for the source of each |
| `assets/logos/` | 13 SVGs | Wikimedia Commons, Simple Icons and the brands' own sites |

## Gaps

- No HD footage yet for EGO, SKIL, MotoGP, UFC & WWE or Daytona.
- The portrait is 800×800.
- GitHub Pages can't set response headers (CSP, HSTS and so on), and the domain has no DMARC or CAA records yet. See [OPERATIONS.md](OPERATIONS.md).
