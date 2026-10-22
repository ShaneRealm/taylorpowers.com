# Operations

> Last verified against the code: 2026-10-22 (commit 605a391)

## Resources

| Resource | Where | Notes |
|---|---|---|
| Repository | github.com/ShaneRealm/taylorpowers.com (public) | Default branch `main` |
| Hosting | GitHub Pages: legacy build from `main` /, custom domain from `CNAME`, HTTPS enforced | The certificate covers taylorpowers.com and www |
| Domain registrar | The owner's GoDaddy account (Wild West Domains), registered until 2031-01-13 | GoDaddy DNS editing is off while Cloudflare is the nameserver |
| DNS | Cloudflare zone `dc61b51522b6984b10dfe63b4a5b6dbd` in the shared account | Nameservers braelyn and kip.ns.cloudflare.com |
| Email | Cloudflare Email Routing on that zone | taylor@taylorpowers.com → taylorrpowers5@gmail.com (destination verified) |

### DNS records

| Type | Name | Value | Proxy |
|---|---|---|---|
| A | @ | 185.199.108.153, .109.153, .110.153, .111.153 | DNS only |
| CNAME | www | shanerealm.github.io | DNS only |
| MX | @ | route1/2/3.mx.cloudflare.net (14/36/52) | — |
| TXT | @ | `v=spf1 include:_spf.mx.cloudflare.net ~all` | — |
| TXT | cf2024-1._domainkey | Email Routing DKIM | — |
| CNAME | _domainconnect | Imported from GoDaddy, unused | Proxied (as imported) |

Keep the web records **DNS only**; turning on the orange cloud breaks GitHub's certificate renewal.

## Deploying

Pushing to `main` deploys. GitHub Pages builds in about 30–60 seconds.

```bash
cd ~/Strange/taylorpowers.com
python3 scripts/build_work.py          # only if PROJECTS or the template changed
export GH_TOKEN=$(gh auth token --user ShaneRealm)
git add -A && git commit -m "…" && git push origin main
gh api repos/ShaneRealm/taylorpowers.com/pages/builds/latest --jq .status   # "built"
```

- **Push as ShaneRealm.** This Mac's `gh` has both Acific and ShaneRealm signed in, and other sessions switch the active account back to Acific. `GH_TOKEN=$(gh auth token --user ShaneRealm)` uses ShaneRealm for that one command without changing the active account.
- Commits use the repo-local identity `ShaneRealm <346018520+ShaneRealm@users.noreply.github.com>` (set in `.git/config`), with no AI attribution lines.
- **Cache busting.** After changing `assets/site.css` or `assets/site.js`, bump `?v=` in `index.html` and `V` in `scripts/build_work.py` (keep them equal; both are 14), then rebuild.
- **Checking it's live:** `curl -s "https://taylorpowers.com/?nc=$RANDOM" | grep -o 'site.css?v=[0-9]*'`.

## Previewing locally

The preview config `taylorpowers` in `~/Strange/.claude/launch.json` runs `python3 -m http.server 5277` from the repo root, so root-absolute paths work. Open http://localhost:5277/ and http://localhost:5277/work/flex-lafc/.

## Docs checks

`node scripts/docs-check.mjs` checks the docs against the code (the handbook's docs harness, rules in `docs/harness.json`). It also runs on every push (`.github/workflows/docs.yml`).

## Monitoring and troubleshooting

| Symptom | Check |
|---|---|
| Site shows an old version | Hard refresh (Cmd+Shift+R); confirm the `?v=` stamp live; Pages build status |
| Certificate error | Web records must be DNS only; `gh api repos/ShaneRealm/taylorpowers.com/pages --jq .https_certificate` |
| Mail to taylor@ bounces | `dig MX taylorpowers.com @8.8.8.8` shows route1–3; the Email Routing rule is active; the destination is still verified |
| Test mail "never arrives" | Gmail hides messages that forward back to the sender's own address; test from another account |
| HD hero never appears | The Vimeo video's embed privacy must allow taylorpowers.com; the local clip or poster stays as the fallback |
| Push rejected (403, "denied to acific") | Use the `GH_TOKEN` line above |

## Security gaps

GitHub Pages can't set response headers, so the Content-Security-Policy and referrer policy are `<meta>` tags in every page (`index.html` and the template in `scripts/build_work.py`). HSTS, `X-Frame-Options`/`frame-ancestors`, `nosniff` and the permissions policy can only be response headers: they need the site behind Cloudflare's proxy (with a response-header rule) or another host. The domain has no DMARC or CAA record and no DNSSEC. See [../SECURITY.md](../SECURITY.md).
