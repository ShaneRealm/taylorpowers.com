# Security

> Last verified against the code: 2026-10-22 (commit 605a391)

taylorpowers.com is a static site with no server code, no forms, no accounts, no cookies and no stored data, so the attack surface is small.

## In place

- HTTPS only: GitHub Pages enforces HTTPS, with a certificate for taylorpowers.com and www.
- No secrets in the repository. The Cloudflare and GitHub credentials live in the owner's accounts and this Mac's `gh` keyring, never in the repo.
- Third-party players load from youtube-nocookie.com and Vimeo with `dnt=1` on background heroes.
- External links open with `rel="noopener"`.
- Email Routing forwards only one address (taylor@) to one verified destination; the catch-all is off.

## Gaps (to do)

| Gap | Fix |
|---|---|
| No response security headers (CSP, HSTS, X-Frame-Options, …) | GitHub Pages can't set headers; move hosting to Cloudflare Pages or Workers if needed |
| No DMARC record | Add TXT `_dmarc` `v=DMARC1; p=quarantine; pct=100` in the Cloudflare zone |
| No CAA record | Add CAA `0 issue "letsencrypt.org"` (GitHub Pages' certificate authority) |
| DNSSEC off | Enable it in Cloudflare, then add the DS record at GoDaddy |
| Unused `_domainconnect` CNAME imported from GoDaddy | Delete it in Cloudflare |

## Reporting

Report issues to taylor@taylorpowers.com or the repository owner (github.com/ShaneRealm).
