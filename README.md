# taylorpowers.com

> Last verified against the code: 2026-10-22 (commit 605a391)

The professional site for **Taylor Powers**, brand and creative production executive (Chicago). It's cinematic and reel-first: a full-screen showreel, work that plays on hover, eight case-study pages, partner logos, and the bio with her portrait.

**Live:** https://taylorpowers.com · **Contact:** taylor@taylorpowers.com, which forwards to Taylor's Gmail · **Where we left off:** [docs/STATUS.md](docs/STATUS.md)

## Run and deploy

It's a static site on GitHub Pages; pushing to `main` deploys it.

```bash
cd ~/Strange/taylorpowers.com
python3 -m http.server 5277          # preview at http://localhost:5277 (or the "taylorpowers" preview config)
python3 scripts/build_work.py        # regenerate the case pages after editing PROJECTS
node scripts/docs-check.mjs          # check the docs against the code
GH_TOKEN=$(gh auth token --user ShaneRealm) git push origin main
```

After changing `assets/site.css` or `assets/site.js`, bump `?v=` in `index.html` and `V` in `scripts/build_work.py`. See [docs/OPERATIONS.md](docs/OPERATIONS.md).

## Map

| Path | What |
|---|---|
| `index.html` | Home: intro, reel, work tiles, logo wall, About, contact |
| `work/<slug>/index.html` | Case pages, **generated** by `scripts/build_work.py`; edit `PROJECTS`, not the HTML |
| `assets/site.css`, `assets/site.js` | All styles; shared behavior for every page |
| `assets/video/`, `assets/clips/` | The showreel, and silent loops cut from it |
| `assets/img/`, `assets/logos/` | Stills, the portrait, partner logos |
| `assets/og.jpg`, `assets/favicon.svg` | The share card and the tab icon |
| `CNAME` | Custom domain for GitHub Pages |

## Docs

| Doc | |
|---|---|
| [docs/STATUS.md](docs/STATUS.md) | Where we left off and what's waiting on the owner |
| [docs/GOALS.md](docs/GOALS.md) | Purpose, audience, goals |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Hosting, DNS, email |
| [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) | Every file and feature |
| [docs/USER-GUIDE.md](docs/USER-GUIDE.md) | What visitors see; how to change things |
| [docs/OPERATIONS.md](docs/OPERATIONS.md) | Deploying, DNS records, troubleshooting |
| [docs/CONTENT.md](docs/CONTENT.md) | Where every fact and asset comes from |
| [docs/DECISIONS.md](docs/DECISIONS.md) | The design history and its rules |
| [AGENTS.md](AGENTS.md) | Rules for coding agents |
| [CHANGELOG.md](CHANGELOG.md) · [SECURITY.md](SECURITY.md) | History · security notes |
