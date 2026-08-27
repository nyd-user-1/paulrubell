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
  business-law.html     /business-law      ← renamed from /Litigation (308 redirect kept)
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

`cleanUrls` maps `about.html` → `/about`. `/Litigation`, `/litigation` and
`/business` all 308 to `/business-law`, so the old URL keeps its search equity.

## Working on it

```bash
npx serve public          # or any static server
node tools/render.mjs     # after editing tools/render.mjs, css/site.css OR js/site.js
```

`tools/render.mjs` exists so the shared chrome (head, header, nav, footer, JSON-LD)
lives in one place. It is a convenience, not a build step: the committed HTML in
`public/` is what deploys, and Vercel never runs it.

**Re-run it after editing `css/site.css` or `js/site.js` too.** Those two are
served `Cache-Control: immutable` and are cache-busted by a `?v=<sha1>` query
that `render.mjs` computes from the file contents. If you change the stylesheet
without re-rendering, the pages keep pointing at the old hash and every
returning visitor draws new markup against the stylesheet their browser already
has — which silently breaks the layout. `tools/qa/functional.js` fails loudly
if the hash in the HTML and the file on disk ever drift apart.

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

Lighthouse accessibility is **100 on all seven pages**. Heading hierarchy, alt
text, visible focus states, `aria` on the drawer and dropdown, a skip link, and
tap targets at or above 24px throughout.

The old palette failed WCAG AA in four places; those colours were changed:

| Element | Was | Now | Ratio |
|---|---|---|---|
| Body copy on white | `#888a8c` @ 300 | `#6e7072` @ 400 | 3.46 → 4.97 |
| Footer + utility-bar links | `#0075bb` on `#272725` | `#3f9fe0` | 3.04 → 5.16 |
| Footer copyright | `#888a8c` on `#272725` | `#9a9c9e` | 4.32 → 5.43 |
| "Learn More" label | `#828383` | `#6e7072` | 3.80 → 4.97 |

## Lighthouse (mobile, compressed as Vercel serves)

| Page | Perf | A11y | Best practices | SEO |
|---|---|---|---|---|
| `/` | 97 | 100 | 100 | 100 |
| `/about` | 99 | 100 | 100 | 100 |
| `/practiceareas` | 98 | 100 | 100 | 100 |
| `/business-law` | 97 | 100 | 100 | 100 |
| `/real-estate` | 99 | 100 | 100 | 100 |
| `/corporate` | 99 | 100 | 100 | 100 |
| `/contact` | 99 | 100 | 100 | 100 |

## Revisions (branch `revisions`)

Changes made after the faithful rebuild was signed off. The homepage and interior
pages intentionally diverge from the old Duda site from here on.

**Navigation and identity**
- One white header on every page, carrying the badge and wordmark. The old site
  showed branding on the homepage only and left the other six with an empty blue band.
- Consistent naming: "Business Law" / "Real Estate Law" / "Corporate Law" in the
  nav, cards, list and headings.
- `/Litigation` renamed to `/business-law`; the old URL 308s to it.
- Phone rendered one way sitewide (`516-946-1706`); the old site used three formats.
- Email normalised to lowercase `paul@paulrubell.com`.

**Layout**
- Homepage sections now sit in the same 960px column as the interior pages
  instead of running full-bleed.
- Practice-area card labels are visible at every width. Above 1025px the old site
  hid them until hover, so desktop visitors saw three unlabelled photos.
- The Highlighted Transactions intro column is sticky, instead of stranding
  roughly 1,000px of empty white beside the list.
- The footer street address is visible on phones.

**Content**
- Real Estate (51 → 362 words) and Corporate (45 → 352 words) written up in the
  Business Law pattern. **Draft copy, pending Paul's review.**
- Business Law added to the Practice Areas index, which previously listed two of three.
- Closing call to action on every interior page; the hero button now also shows on
  desktop, where the old site had no CTA at all.
- "Get directions" link on the contact page.

**SEO / AI SEO**
- Unique title and meta description per page (was one identical pair across all seven).
- `llms.txt` referenced from `robots.txt` and linked from every `<head>`.

### Still needs input
- **Business hours** — not published anywhere, and absent from `LegalService`
  schema. Needed for local search and "is it open" answers.
- **Contact form** — still none. Requires a decision on where submissions go.
- **Reviews / ratings** — no `aggregateRating` in schema.
