# Goals

> Last verified against the code: 2026-10-22 (commit 605a391)

## Purpose

taylorpowers.com is the professional site for **Taylor Powers** (she/her), a brand and creative production executive based in Chicago. It presents her work, roles and track record to people who might hire or partner with her, and gives them one way to reach her: taylor@taylorpowers.com.

## Audience

- Hiring managers, executives and recruiters at brands, agencies, sports properties and studios.
- Partners and collaborators who were sent the link (by text, email or LinkedIn) and need to see the work quickly, often on a phone.

## Goals and status

| Goal | Status |
|---|---|
| Live at https://taylorpowers.com with HTTPS | Done (GitHub Pages, 2026-10-21) |
| A working address at the domain | Done: taylor@taylorpowers.com forwards to Taylor's Gmail (Cloudflare Email Routing) |
| Look premium and cinematic, not generic, plain or AI-made | Done for now; the owner chose "cinematic, reel-first" (see [DECISIONS.md](DECISIONS.md)) |
| Show the work as moving footage | Partly. The showreel, four hover clips and two HD Vimeo heroes are live; EGO, SKIL, MotoGP, UFC & WWE and Daytona still use reel clips or press photos |
| A case-study page for every project | Done: 8 pages under `work/` |
| Every fact matches Taylor's resume (v9) | Done (2026-10-21); see [CONTENT.md](CONTENT.md) |
| Smooth on every device, never janky | Done: no scroll-driven effects, and videos pause off screen |
| A strong portrait | Done at 800×800; a larger original would be sharper |

## Non-goals

- No CMS, build system or framework. It's static HTML, CSS and JS, plus one small Python generator for the case pages.
- No forms, accounts, analytics or cookies.
- No phone number on the site (it's on the resume, but kept off a public page on purpose).

## Principles

- **Footage first.** The work is moving image; show it.
- **True claims only.** Every number and credit comes from the resume or public coverage.
- **Calm motion.** Animate `transform` and `opacity` only; no scroll-jacking and no scroll-driven animation.
- **Fast on a phone.** Clips load only when needed, and everything off screen is paused.

## What success looks like

Someone opens the link on their phone and in ten seconds sees footage of real, big-stage work (NASCAR, UFC, MLS), knows who Taylor is and what she does, and knows how to reach her.
