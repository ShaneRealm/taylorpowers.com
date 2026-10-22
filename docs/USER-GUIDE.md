# User guide

> Last verified against the code: 2026-10-22 (commit 605a391)

For Taylor and Shane: what the site does and how to change it.

## What visitors see

**Home (taylorpowers.com)**

1. On a first visit, a one-second intro: "TAYLOR POWERS" on black.
2. The showreel, full screen. **Sound on** turns the audio on, and **Watch full reel** opens it with controls.
3. **Selected work**: nine projects. On a computer, hovering over FLEX × LAFC, EGO or SKIL plays a short clip; on a phone, the clip plays as it reaches the middle of the screen. Clicking any project opens its own page.
4. **Partners & properties**: client and studio logos.
5. **About**: the portrait, the bio, six headline numbers, four areas of work, roles held, experience, and film credits (click a title for its trailer).
6. **Contact**: taylor@taylorpowers.com, LinkedIn and the time in Chicago.

**Project pages (work/…)**

Each project page has:

- a big header (HD film where there is one)
- client, year, role and disciplines
- the story and results
- **Watch the film** and/or a link to press coverage
- **Next project** at the bottom

## Email

Mail to **taylor@taylorpowers.com** arrives in Taylor's Gmail (taylorrpowers5@gmail.com). It can receive but not send as taylor@. To send as taylor@, add a mailbox (Google Workspace, iCloud+ custom domain and so on).

When testing, send from a different account. Gmail hides a message that forwards back to the address that sent it.

## Changing things

Ask Claude in the `~/Strange/taylorpowers.com` folder, or edit by hand:

| To change | Edit |
|---|---|
| Home text, numbers, roles, experience, film credits | `index.html` |
| A project page | `PROJECTS` in `scripts/build_work.py`, then run `python3 scripts/build_work.py` |
| Colors and type | `assets/site.css` (the accent is `--accent`) |
| The showreel | Replace `assets/video/reel.mp4` (re-save with "fast start" so it streams) and `assets/video/reel-poster.jpg` |
| The portrait | Replace `assets/img/taylor-portrait.jpg` |
| Add HD footage to a project | Add `hero_vimeo="<Vimeo ID>"` to it in `PROJECTS` and rebuild |

Then deploy as in [OPERATIONS.md](OPERATIONS.md#deploying).

## FAQ

**I don't see my change.** Hard refresh (Cmd+Shift+R). If it's still old, the `?v=` stamp wasn't bumped (see OPERATIONS).

**A project's HD header doesn't play.** The Vimeo video's privacy must allow embedding on taylorpowers.com. The short clip or photo shows until it does.

**Can the phone number go on the site?** Yes, but it was left off on purpose because the page is public.
