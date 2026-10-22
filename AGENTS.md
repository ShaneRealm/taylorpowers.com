# AGENTS.md

> Last verified against the code: 2026-10-22 (commit 605a391)

The contract for coding agents working on taylorpowers.com.

## Map

- `index.html`: the home page (hand-edited).
- `work/<slug>/index.html`: case pages, **generated**. Change `PROJECTS` or the template in `scripts/build_work.py`, then run `python3 scripts/build_work.py`. Never hand-edit the generated HTML.
- `assets/site.css` and `assets/site.js`: shared by every page. Every part of `site.js` must guard for missing elements.
- Docs: [README.md](README.md) and [docs/README.md](docs/README.md); start with [docs/STATUS.md](docs/STATUS.md).

## Commands

| Command | What |
|---|---|
| `python3 -m http.server 5277` | Preview (or the `taylorpowers` config in `~/Strange/.claude/launch.json`) |
| `python3 scripts/build_work.py` | Regenerate the case pages |
| `node scripts/docs-check.mjs` | Docs harness; it's in `enforce` mode, so fix the docs, never the checker copy |
| `GH_TOKEN=$(gh auth token --user ShaneRealm) git push origin main` | Deploy (GitHub Pages) |

## Invariants

1. **Facts only from [docs/CONTENT.md](docs/CONTENT.md)** sources: Taylor's resume (v9), the owner's own statements and the public coverage listed there. Never invent numbers, credits or roles.
2. **No scroll-driven animation and no scroll-jacking libraries.** Animate `transform` and `opacity` only. Pause off-screen video. See [docs/DECISIONS.md](docs/DECISIONS.md).
3. **No "AI-made" decoration:** gradient text, glow blobs, grain, mono numbered eyebrows, italic-serif accent words, count-ups, pill chips, marquees.
4. **Ask the owner before any redesign.** They have rejected several guessed directions.
5. **Content-Security-Policy:** every page has a CSP `<meta>` (in `index.html` and the template in `scripts/build_work.py`; keep the two identical). Scripts and styles only from the site, no inline `<script>` or `style=`; fonts from Google Fonts; frames only from player.vimeo.com and www.youtube-nocookie.com. A new outside origin has to be added to both, or the browser blocks it.
6. **Cache stamp:** after a CSS or JS change, bump `?v=` in `index.html` and `V` in `scripts/build_work.py` together.
7. **Keep the phone number off the site.**
8. **Pass the visual check before pushing:** preview at desktop and phone (375 px) widths, no horizontal overflow, no console errors.

## Conventions

- Commit as the repo-local identity `ShaneRealm <346018520+ShaneRealm@users.noreply.github.com>` (already in `.git/config`), with no AI or tool attribution lines.
- Push with the ShaneRealm token, as in the table above. The active `gh` account on this Mac is often Acific, and pushing as Acific fails with a 403.
- Update the docs in the same commit as the change, and refresh each doc's `Last verified` line.
- Media: re-save video with the index at the front (fast start). Clips are silent 720p at about 2 Mbps. Don't upscale images.

## Sharing a checkout

Run `git status` first; commit only your own files. Don't switch the active `gh` account globally.
