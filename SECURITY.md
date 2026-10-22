# Security

> Last verified against the code: 2026-10-22

taylorpowers.com is a static site with no server code, no forms, no accounts, no cookies and no stored data, so the attack surface is small.

## In place

- HTTPS only: GitHub Pages enforces HTTPS, with a certificate for taylorpowers.com and www.
- Content-Security-Policy as a `<meta>` tag on every page (`index.html`, and the template in `scripts/build_work.py` for the case pages): scripts and styles only from the site (no inline scripts), fonts from Google Fonts, video frames only from player.vimeo.com and www.youtube-nocookie.com, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `upgrade-insecure-requests`.
- `Referrer-Policy` `strict-origin-when-cross-origin` as a `<meta>` tag on every page.
- No secrets in the repository. The Cloudflare and GitHub credentials live in the owner's accounts and this Mac's `gh` keyring, never in the repo.
- Third-party players load from youtube-nocookie.com and Vimeo with `dnt=1` on background heroes.
- External links open with `rel="noopener"`.
- Email Routing forwards only one address (taylor@) to one verified destination; the catch-all is off.

## Gaps (to do)

| Gap | Fix |
|---|---|
| No response security headers: HSTS, `X-Frame-Options` (and `frame-ancestors`, which a `<meta>` CSP can't carry), `nosniff`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` | GitHub Pages can't set headers. Proxy the site through Cloudflare (orange cloud, Full (strict) TLS) with a response-header Transform Rule, or move it to Cloudflare Pages or Workers. Owner decision |
| No DMARC record | Add TXT `_dmarc` `v=DMARC1; p=quarantine; pct=100` in the Cloudflare zone |
| No CAA record | Add CAA `0 issue "letsencrypt.org"` (GitHub Pages' certificate authority) |
| DNSSEC off | Enable it in Cloudflare, then add the DS record at GoDaddy |
| Unused `_domainconnect` CNAME imported from GoDaddy | Delete it in Cloudflare |

## Rules for changes

- No inline `<script>` blocks, `on…=` handlers or `style=` attributes: the CSP blocks them. Code goes in `assets/site.js`.
- A new outside origin (fonts, video, images) goes into the CSP in both `index.html` and `scripts/build_work.py`, then rerun `python3 scripts/build_work.py`.
- Never commit secrets.

## Reporting

Report issues to taylor@taylorpowers.com or the repository owner (github.com/ShaneRealm).
