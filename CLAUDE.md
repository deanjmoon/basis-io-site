# [basis-io] landing page — working instructions

Static one-page site for **[basis-io]**, an Australian advice-support business.
Three service pillars: Advice construction · Admin services · Practice consulting.

## Hard rules

1. **Static HTML only.** Every heading and paragraph must exist in the served source.
   No client-side rendering, no framework, no build step. This is a marketing page whose
   whole job is to be read by people, search crawlers and AI crawlers.
2. **No dependencies.** No npm, no bundler, no CSS framework. `index.html`, one stylesheet,
   one small progressive-enhancement script. If a change seems to need a build step, it doesn't.
3. **The design system is binding** (basis.IO): **corner radius 0 everywhere** (one
   client-requested exception, 2026-09-18: `.person` founder cards carry 4px), **no shadows**
   (two named exceptions, below), no gradients, no photography beyond the three team portraits,
   no icon library, no emoji. Depth comes from 1px hairline rules and the schematic grid.
4. **Australian English.** *licensee, organisation, programme, colour.*
5. **Voice:** third person, short declaratives, mechanism not benefit. Never "seamless",
   "revolutionary", "game-changing". Any number carries its source and date.

### Shadows (policy revised 2026-09-18 at the client's direction)
The original rule was no shadows bar `.btn-row`. The client has since asked for soft
shadows on all boxed elements. Current state: `.btn-row` keeps its pair-level
`drop-shadow`; standalone `.btn`, `.person` cards, `.person__photo` tiles, `.mark`
squares and the enquiry form fields carry soft `box-shadow`, scaled to element size.
Unboxed elements (pillars, steps, proof items, text) stay shadow-free.

## Layout contract

Every band uses the same centred column: `.wrap` = `max-width: 1120px; padding: 0 40px`.
That is why all left edges align from header to footer — **do not give a section its own
padding**. Earlier revisions of this design failed review for exactly that reason.

Section rhythm is `--band-y` (104px, 56px under 720px). Eyebrow → heading 20px,
heading → content 48px. No media queries beyond the one 720px block — grids are
`repeat(auto-fit, minmax(Npx, 1fr))` and reflow on their own.

## Colour

| Token | Hex | Use |
| --- | --- | --- |
| `--navy` | `#14304F` | Navy plate ground; default ink on light grounds |
| `--panel` | `#1C5189` | Hover state |
| `--accent` | `#2C6BB3` | Primary button, links, eyebrows |
| `--blue-300` | `#7FA3C9` | Quiet ink |
| `--blue-200` | `#AFC6DF` | All hairline rules; muted ink on navy |
| `--card` | `#F3F8FD` | Light blue section grounds |
| `--paper` | `#FFFFFF` | Page ground |
| `--slate` | `#3A4A5C` | Body copy on light grounds |
| `--ink-on-navy` | `#E7EDF4` | Body copy on navy |

**Ground order is deliberate:** navy (hero) → light blue → white → navy (services) →
white → light blue → white → light blue → white (team) → light blue (enquiry) →
navy (CTA) → navy (footer).
The schematic grid appears on navy plates **only** — with one client-requested
exception (2026-09-18): the Who we are band carries a faint accent-tinted grid
(`band--grid-light`, 7% opacity) with person cards on solid paper for legibility.
Navy plates also carry small accent registration marks (crosshairs) at the
corners of the content column.

## Type

Arimo (headline + body), Silkscreen (micro labels, 0.18em / 0.14em tracked, uppercase),
PT Serif (wordmark only). Currently loaded from Google Fonts — **self-hosting into
`assets/fonts/` with `font-display: swap` is a wanted task.**

The wordmark is typographic, not an image: `[basis-<span class="wordmark__io">io</span>]`.
Spelling is **`[basis-io]`** everywhere, square brackets included. Never "basis.IO".

## Heading hierarchy — do not change

- One `h1`: "The evidentiary layer between client and adviser." (hero)
- `h2` per band, each with an `id` referenced by its section's `aria-labelledby`
- `h3` for pillars, engagement steps, people
- The Silkscreen eyebrows are `<p class="eyebrow">`, **never headings**

## Before deploy — find and replace

| Token | Becomes | Status |
| --- | --- | --- |
| `REPLACE-WITH-DOMAIN` | the live domain (canonical, OG tags, JSON-LD, robots.txt, sitemap.xml) | ✅ Done — `deanjmoon.github.io/basis-io-site` for now; redo when custom domain lands |
| `REPLACE-BOOKING` | the booking URL — 3 instances | ✅ Done — Microsoft Bookings, `bookings.cloud.microsoft/book/NewEnquiries@basis-io.com.au` |
| `support@REPLACE-DOMAIN` | the real support address | ✅ Done — `support@basis-io.com.au` |
| `REPLACE-COMPANY-PAGE` | the LinkedIn company page slug | ✅ Done — `basis-io` |
| `REPLACE-FORM-ID` | the Formspree endpoint ID for the enquiry form | ✅ Done — `f/xoevqljl`, delivers to support@basis-io.com.au |

Damien's, Gina's and Dean's personal LinkedIn URLs are already live and correct.

## Outstanding content (search the source for `TODO(copy)` / `TODO(asset)`)

- Two proof points in the proof strip
- Fourth scope line for Admin services and for Practice consulting
- Three founder bios (keep them the same length — the cards sit side by side)
- Three team portraits, 4:5 crop, ~1200×1500, shot the same way
- ~~ABN in the footer~~ done 2026-09-18 (49 670 018 658, Rocket FP Solutions Pty Ltd)
- A privacy policy at `/privacy/` — the footer links to it and it does not exist yet
- `assets/img/og-image.png` at 1200×630 — a navy schematic plate with the wordmark
- Page `<title>` and meta description — the client is writing these

## Open positioning question

The page currently holds three positions at once: *evidentiary layer* (hero),
*three service pillars* (middle), *paraplanning* (About section and one engagement model).
The client is resolving this. **Do not unilaterally rewrite copy to fix it** — flag it.

## Deploy

GitHub Pages from the repository root of the default branch. No build step, so nothing to
configure. `CNAME` at the root holds the custom domain.
