# paulrubell.com

Static rebuild of **www.paulrubell.com** (previously on Duda), deployed on Vercel.

Plain HTML + one stylesheet + ~90 lines of vanilla JS. No framework, no build step
at deploy time — Vercel serves `public/` as-is.

## Layout

```
public/                 deployable output (Vercel outputDirectory)
  index.html            /
  about.html            /about
  practiceareas.html    /practiceareas
  Litigation.html       /Litigation        ← capital L, matches the live URL
  real-estate.html      /real-estate
  corporate.html        /corporate
  contact.html          /contact
  css/site.css          the single stylesheet
  js/site.js            mobile drawer, Practice Areas dropdown, hero slideshow, hero parallax
  fonts/                self-hosted Montserrat + Open Sans (variable, woff2, latin + latin-ext)
  images/               self-hosted imagery at three widths per breakpoint
  robots.txt sitemap.xml llms.txt llms-full.txt manifest.json favicon.ico
tools/render.mjs        regenerates the seven pages from shared header/footer partials
vercel.json             clean URLs, redirects, cache + security headers
```

`cleanUrls` maps `about.html` → `/about`. Vercel's routing is case-sensitive, so
`Litigation.html` serves `/Litigation` directly and `/litigation` is redirected to it.

## Working on it

```bash
npx serve public          # or any static server
node tools/render.mjs     # after editing header/footer/page content in tools/render.mjs
```

`tools/render.mjs` exists so the shared chrome (head, header, nav, footer, JSON-LD)
lives in one place. It is a convenience, not a build step: the committed HTML in
`public/` is what deploys, and Vercel never runs it.

## Fidelity to the previous site

Markup, copy, colours, spacing, fonts and breakpoints were transcribed from the
live site's computed styles and verified by screenshot diffing every page at
375 / 768 / 1440 px. All 21 page/width combinations match the live page height
exactly; pixel differences are 0.0–2.5%, and what remains is JPEG re-encoding
noise plus two scroll-dependent effects noted below.

Three deliberate differences from the old site:

1. **Phone links.** Every `tel:` on the live site pointed at `515-946-1706`. All
   are `tel:516-946-1706` here. Display text is unchanged.
2. **"A boutique business law firm"** renders with the space (the live site
   already renders it correctly; the run-together form appears only in the CMS).
3. **`paul@paulrubell .com`** in the interior-page utility bar renders as
   `paul@paulrubell.com` — the stray space was confirmed as a typo.

### Content changes since launch

The Highlighted Transactions list has been edited away from the old site's copy
at the client's request:

- **Two new entries at the top of the list**, ahead of Naboso:
  1. *Condominium Offering* — South Street building photo, no body copy,
     "Paul Rubell, Attorney at Law P.C. represented the Sponsor."
  2. *Equity Raise* — SUNation Energy, $32,000,000 PIPE transaction,
     "Paul Rubell, Attorney at Law P.C. represented the Issuer."
- **Line of Credit** now reads "International Art Trading, LLC received a
  $25,000,000 line of credit from Morgan Stanley." (was "…received $25,000,000
  line of credit.")

`llms.txt` and `llms-full.txt` were updated to match. Everything outside the
Highlighted Transactions section is still a pixel match to the old site.

Behaviour carried over from the live site that is worth knowing about:

- The home hero is a **two-slide background slideshow** (3s cadence, 0.8s
  slide-up), not a static image.
- The About hero uses `background-attachment: fixed` plus a scroll-linked
  parallax of up to 100px. Both are disabled under `prefers-reduced-motion`.
- Duda switched to its mobile layout by **User-Agent**, so a narrow desktop
  window still got the squeezed desktop layout. This rebuild uses a
  `max-width: 767px` media query instead, which is what every real phone saw.

## Accessibility

Heading hierarchy, alt text, focus states, `aria` on the drawer and dropdown,
and a skip link are all in place. Lighthouse accessibility sits at 87–88 rather
than 95+, and every remaining failure is a colour inherited from the live design:

| Element | Colours | Ratio | Needs |
|---|---|---|---|
| Footer phone / email / "Craic.in" links | `#0075bb` on `#272725` | 3.03:1 | 4.5:1 |
| Footer copyright line | `#888a8c` on `#272725` | 4.31:1 | 4.5:1 |
| Footer links vs. surrounding text | `#0075bb` vs `#888a8c` | 1.42:1 | 3:1 |

Raising these means changing the brand colours, which the rebuild brief
explicitly ruled out. Lightening the footer link colour to `#3f9fe0` and the
copyright to `#9a9c9e` would clear all three if that trade is ever wanted.

## Lighthouse (mobile, compressed as Vercel serves)

| Page | Perf | A11y | Best practices | SEO |
|---|---|---|---|---|
| `/` | 97 | 88 | 100 | 100 |
| `/about` | 99 | 88 | 100 | 100 |
| `/practiceareas` | 99 | 88 | 100 | 100 |
| `/Litigation` | 97 | 88 | 100 | 100 |
| `/real-estate` | 99 | 88 | 100 | 100 |
| `/corporate` | 99 | 88 | 100 | 100 |
| `/contact` | 99 | 87 | 100 | 100 |
