# [basis-io] landing page — project handover

**Status: live and launch-clean as of 2026-09-23.** One-page static marketing site.

## The essentials

| | |
| --- | --- |
| Live site | https://basis-io.com.au (HTTPS enforced, cert auto-renews) |
| Repo | github.com/deanjmoon/basis-io-site (public — required for free GitHub Pages) |
| Local copy | `~/Projects/basis-io-site` |
| Hosting | Vercel (project `basis-io-site`, team `deanjmoon`, region `syd1`), deploys from `main` on every push. Moved off GitHub Pages 2026-10-13. No build step; `vercel.json` holds headers, `.vercelignore` keeps repo internals out |
| DNS | GoDaddy: `@` A → `76.76.21.21` (Vercel), `www` CNAME → `cname.vercel-dns.com` (308 redirect to apex, set in Vercel). **MX/TXT records are Microsoft 365 email — never touch** |
| Deploy | `git push` to `main` → live in ~30s. Every pull request gets its own preview URL |

## Stack

Static HTML/CSS + one progressive-enhancement JS file. No framework, no build, no
dependencies. `index.html` (all copy lives here), `assets/css/styles.css`,
`assets/js/main.js`, `404.html`, `robots.txt`, `sitemap.xml`.

## Integrations

- **Enquiry form** → Formspree endpoint `f/xoevqljl` (free tier, 50 submissions/mo,
  built-in captcha + honeypot) → delivers to support@basis-io.com.au with subject
  "New Enquiry". Over-quota submissions are rejected — upgrade (~US$10/mo) if the
  warning email ever arrives.
- **Book a meeting** buttons → Microsoft Bookings
  (`bookings.cloud.microsoft/book/NewEnquiries@basis-io.com.au`), 30-min slots
  against real calendar availability.
- **Cloudflare**: a dormant duplicate deployment exists (Workers, auto-deploys on
  push, `wrangler.jsonc` + `.assetsignore` in repo). Harmless; delete the Cloudflare
  project if unwanted. Hosting migration to Cloudflare was evaluated and declined
  (would require moving DNS nameservers, risking M365 email records).

## Design system (full rules in CLAUDE.md)

basis.IO: navy/blue palette, Arimo + Silkscreen + PT Serif (wordmark), 1120px column,
schematic grid on navy plates. Original radius-0 / no-shadow rules carry
client-approved exceptions (soft shadows + 4px radius on boxed elements, faint grid
on the team band). Animations: scroll reveals with pace hierarchy (headlines 1300ms,
body 1900ms, cards 2500ms), typewriter word-cascade on body copy, grid crawl-in on
navy plates, count-up on proof numbers. All honour `prefers-reduced-motion`.

## Copy voice

First-person plural, corporate but friendly, client-outcome focused, Australian
English ("advisers"). The wordmark renders as [*basis-*io] — upright brackets,
italic bold "basis-", bold "io" — including inline mentions (`.wm` spans).

## Outstanding / parked

- Gina Samia's card removed at client request (2026-09-23) — restore from git
  history; her portrait remains at `assets/img/gina-samia.jpg`
- Dean's bio not written; Damien's bio lives in the "Who built it" copy
- Privacy policy page at `/privacy/` — footer links to it; currently lands on the
  branded 404. Should be written for an AU financial services business
- OG image (`assets/img/og-image.png`, 1200×630) referenced in meta tags but never
  created — link previews on LinkedIn/iMessage show no image until it exists
- Page `<title>` + meta description marked TODO (client to finalise)
- Higher-res portraits wanted (Gina's was 425px); portraits are stylistically
  mismatched (Dean colour/navy-grid, others B&W studio)
- LinkedIn company page says "formally Rocket Services" — should read "formerly"

## History

Built 2026-09-17 → 2026-09-23 with Claude Code. Full decision history is in the git
log (~60 commits) and CLAUDE.md carries the working design rules.
