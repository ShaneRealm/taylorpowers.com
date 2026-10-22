# Decisions

> Last verified against the code: 2026-10-22 (commit 605a391)

Why the site looks and works the way it does. The site was redesigned many times on 2026-10-21; this records what the owner rejected and why, so it isn't repeated.

## Design history

| Commit | Direction | Owner's verdict |
|---|---|---|
| d01179e | The original one-page site | Starting point |
| 349556a | Colorful marketing site: gradient type, stage-light blobs, film grain, cursor glow, count-ups, chips | "Stay in white and positive" |
| 7fb275b | The same, on a white theme | "Make it not feel like it's made with Claude and AI" |
| 5a1127e | Restrained white editorial portfolio | "Make it more premium" |
| 344e3a5 | Cinematic hero slideshow, asymmetric case layout, scroll reveals | "More premium"; sent the showreel |
| bc1d30a | Showreel as the hero background | "Way better, premium" |
| 0d022ae | Reel playing inside the letters of the name, zooming open on scroll; Lenis smooth scroll; parallax | "Super glitchy"; "the P does this when scrolling back" |
| 7d19490 | GPU-only framed reel that grows on scroll | "This website sucks" |
| ff6ab7a | **Cinematic reel-first** (chosen by the owner from three directions) | Kept |
| 790662b | Accent changed from volt yellow to neon blue | Kept |

When asked what was wrong (just before ff6ab7a), the owner said it was **generic/template, too plain and broken/janky**. They chose **cinematic reel-first** over bold sports-agency and luxury editorial.

## Rules that came out of it

1. **No scroll-driven animation and no scroll-jacking** (Lenis or similar). The SVG-mask zoom and the scroll-linked frame both read as glitchy.
2. **Animate only `transform` and `opacity`.** Never scale SVG masks or large text.
3. **Pause every video that's off screen**, and load clips only on first use.
4. **Avoid the "AI-made" look:** gradient text, glow blobs, grain, cursor glows, mono "01 ·" eyebrows, italic-serif accent words, count-up numbers, pill chips, marquees and cute copy. The single neon glow on the headline is a deliberate exception the owner asked for ("neon blue").
5. **Ask for direction before another redesign** rather than guessing.
6. **Footage over stills** wherever there's real footage.

## Other decisions

- **Static site on GitHub Pages**, not Cloudflare Workers: it was already there and needs no server.
- **DNS on Cloudflare** (moved from GoDaddy on 2026-10-21) so Email Routing could forward taylor@ for free. The owner first chose GoDaddy forwarding, then said "just use Cloudflare".
- **Case pages are generated** from one Python list, so eight pages can't drift from each other.
- **HD heroes stream from Vimeo** in background mode (as realmempire.com does) instead of downloading and re-hosting the films.
- **No phone number** on the public site.
- **The repo belongs to the ShaneRealm GitHub account**, not Acific, because it's Taylor's site under the owner's personal account.
