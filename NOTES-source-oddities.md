# Source oddities found in the Duda site

Compiled while rebuilding the site. Everything here was verified against the
scraped HTML and the live rendered DOM on 2026-08-26.

Nothing in **Part 2** was changed — it is reproduced as-is. **Part 1** lists the
four things that *were* changed, and **Part 3** lists the platform artifacts that
were dropped because they cannot exist off Duda.

---

## Part 1 — Changed

| # | What | Where | Change |
|---|---|---|---|
| 1 | `tel:515-946-1706` — wrong area code | Footer on all 7 pages, homepage "LET'S TALK", mobile header phone icon (9 links total) | Now `tel:516-946-1706` everywhere. Display text untouched. |
| 2 | "A boutique businesslaw firm" | Homepage welcome section | Renders with the space. **Note:** the live site already renders `A boutique business law firm` correctly — the run-together form only exists in the CMS field, not in output. No visible change. |
| 3 | `paul@paulrubell .com` — stray space | Utility bar, 6 interior pages | Space removed. *(Confirmed as a typo mid-build.)* |
| 4 | `<a href="mailto:">` — **empty** mailto, a dead link | Envelope icon in the utility bar, all 7 pages | Now `mailto:paul@paulrubell.com`. **This one was my call, not in the brief** — flagging it so you can revert if you want the dead link preserved. |

---

## Part 2 — Reproduced as-is (suspected errors, left alone)

### Content

1. **Trailing space before the period** — "…at the intersection of business and
   technology ." Appears in the homepage hero *and* in `meta description`,
   `og:description` and `twitter:description` on all 7 pages (21 instances).
   This is the text search engines show.
2. **Duplicated / contradictory attribution — Indaba entry** (homepage). The body
   ends "…Paul Rubell, Attorney at Law P.C. represented the investors." and is
   then immediately followed by "Paul Rubell, Attorney at Law P.C. represented
   the Lead Investor." Two different claims, back to back. Worth a look — one is
   probably wrong.
3. **Stray bold mid-sentence — Naboso entry** (homepage). "Naboso, a
   **manufacturer of proprietary** footwear products based on…" — the bold starts
   and stops arbitrarily inside a sentence.
4. **Hidden "List Item  3" / "List Item  4"** (note the *double* space) sit inside
   the Learn More links on `/practiceareas`. Left over from the Duda list widget
   template. Invisible on screen but present in the DOM, so scrapers and AI
   crawlers can read them.
5. **Zero-width spaces (U+200B)** before the period in "investors​." and three
   instances of "Lead Investor​." on the homepage. 4 total.
6. **U+FEFF (byte-order mark)** in a leftover `<span class="ql-cursor">` after the
   word "Phone" on `/contact` — an editor artifact.
7. **Double spaces** in two Business Law paragraphs: "…in nearly all
   jurisdictions.  For many companies…" and "…continued global growth.  We counsel
   clients…"
8. **"M & A Transactions"** (spaced ampersand) as the heading, but "M&A"
   (unspaced) in the paragraph directly beneath it.
9. **Business Law is missing from the Practice Areas page.** `/practiceareas`
   lists only Real Estate and Corporate, even though Business Law is in the nav
   dropdown, on the homepage cards, and has its own page. Likely the biggest
   real-world issue on this list.
10. **Empty paragraph pair** (`<p><br></p><p><br></p>`) trailing the address block
    on `/contact`.

### Formatting inconsistencies

11. **Phone formatted three ways**: `516.946.1706` (interior utility bars,
    contact page), `516-946-1706` (homepage utility bar, footers, mobile drawer).
12. **Email capitalised inconsistently**: the utility-bar link is
    `mailto:Paul@paulrubell.com` (capital P) while every other reference —
    footer, contact page, drawer — is `paul@paulrubell.com`.
13. **Empty logo block in the header on all six interior pages.** The blue nav
    band has a brand column reserved on the left, but it is empty — the Super
    Lawyers badge and "Paul Rubell / Attorney At Law, P.C." appear in the header
    only on the homepage. Reproduced exactly, but it looks unintentional.
14. **Footer address is hidden on mobile** (`hide-for-small`). Phones see the
    phone number and email but never the street address.
15. **Blue Orb's separator rule** is nested inside its text column while the other
    four transaction separators run the full column width, so it is visibly
    shorter and indented.

### Head / SEO

16. **`og:image` is 200×200.** Social cards want ~1200×630; at this size most
    platforms fall back to a small square or no image. Also the URL contains a
    double slash (`cdn-website.com//61cee47d/…`).
17. **Duplicate `<meta name="apple-mobile-web-app-capable">`** on every page.
18. **`<title>` contains stray newlines** and leading/trailing whitespace.
19. **Every `<img>` has `alt=""`** — including the Super Lawyers badge and the
    "PAUL RUBELL" mobile wordmark, which carry meaning. *(Real alt text was added
    in the rebuild; the brief required it.)*
20. **All seven pages share one identical title, description and keyword list.**
    Nothing distinguishes `/contact` from `/about` to a search engine. The
    keyword list also includes two former-employer names, `meltzer lippe` and
    `abrams fensterman` — deliberate or not, that is public.

---

## Part 3 — Dropped (Duda platform artifacts)

These exist only because the site ran on Duda and could not be reproduced
meaningfully:

- **"Share by:" popup** — a hidden Duda share dialog (`opacity: 0`,
  `position: fixed`) present in the DOM of every page.
- **RSS and Atom `<link rel="alternate">`** pointing at `/feed/rss2` and
  `/feed/atom`. Those endpoints do not exist on the new site, so keeping the
  links would advertise two 404s to every crawler.
- **`<link rel="prefetch">`** to `app.multiscreenstore.com/script.js` — Duda's
  storefront bundle, unused by this site.
- **Full-page background image** (`law_hero_2-1950x1301.jpg`, 172 KB) set on the
  outer container. Every section above it is opaque, so it is never visible at
  any breakpoint. Omitted; it was pure download cost.
- **Google Analytics (UA-126104687-1)** — a Universal Analytics property, which
  Google shut down in 2023 and which no longer collects data. Not carried over;
  add GA4 or Vercel Analytics if you want measurement.
