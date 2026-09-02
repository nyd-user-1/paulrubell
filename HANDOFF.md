# Handoff — paulrubell.com

**Date:** 2026-08-27 · **Repo:** `github.com/nyd-user-1/paulrubell` · **Host:** AWS Amplify, account `2525 LLC` (638175140432), us-east-1

---

## 1. Status in one paragraph

The Duda-hosted paulrubell.com has been rebuilt as a static site (plain HTML, one
stylesheet, ~90 lines of vanilla JS) and deployed to AWS Amplify. `main` holds a
pixel-faithful reproduction of the old site plus client-requested content edits;
a `revisions` branch holds a first round of UI/UX, accessibility and SEO
improvements that deliberately diverge from the old design. **Nothing is live on
the real domain yet** — `www.paulrubell.com` still resolves to Duda. Cutover is a
DNS change at GoDaddy, whenever the client is ready.

## 2. Where everything is

| | |
|---|---|
| Repo | `github.com/nyd-user-1/paulrubell` |
| Amplify app | `paulrubell`, app id `d19scfayvy6e0b`, us-east-1, AWS account 638175140432 (`2525 LLC`) |
| Production (branch `main`) | https://main.d19scfayvy6e0b.amplifyapp.com |
| Real domain | `www.paulrubell.com` → still Duda. Registrar GoDaddy, NS `ns23/ns24.domaincontrol.com` |

Git integration is connected through a GitHub token: **any push to `main`
auto-deploys** to production. No other branch is connected to Amplify.

`paulrubell.com` and `www.paulrubell.com` are attached to the Amplify app as a
domain association (both → `main`). It sits in `PENDING_VERIFICATION` until the
records in §8 are added at GoDaddy — expected and harmless.

## 3. The two branches

```
main       faithful rebuild + client content edits   -> main.d19scfayvy6e0b.amplifyapp.com
revisions  UI/UX + a11y + SEO improvements           -> not deployed
```

`revisions` is one commit ahead of `main` and has **not** been merged. It is
awaiting review, principally of the new page copy (see §7).

**Do not merge `revisions` before Paul has read the Real Estate and Corporate
copy.** Everything else in that branch is mechanical and safe.

## 4. How the code is organised

```
public/            the deployable output — Amplify serves this directly, no build step
  *.html           four pages, generated (do not hand-edit; see below)
  css/site.css     the single stylesheet, ~1150 lines, sectioned and commented
  js/site.js       mobile drawer, dropdown, hero slideshow, hero parallax
  fonts/ images/   self-hosted; nothing loads from Duda's CDN
tools/render.mjs   generates the four pages from shared partials
tools/qa/          local server + functional + Lighthouse harnesses
tools/source-images/  untouched client artwork, outside the deployed dir
amplify.yml        build spec: no build step, baseDirectory public/
customHttp.yml     cache + security headers (Amplify reads headers from here, not amplify.yml)
```

**Edit `tools/render.mjs`, not the HTML.** Head tags, header, nav, footer, JSON-LD
and page bodies all live there. **Re-run the renderer after editing
`css/site.css` or `js/site.js` as well** — both are served `immutable` and
cache-busted by a `?v=<sha1>` the renderer derives from their contents, so
skipping it leaves returning visitors on a stale stylesheet. The functional
harness fails if the hash and the file drift apart. Then:

```bash
node tools/render.mjs        # regenerate public/*.html
node tools/qa/serve.js       # local server on :4321
node tools/qa/functional.js  # 33 checks (needs: npm i -D playwright)
node tools/qa/lighthouse.mjs # mobile Lighthouse (needs: npm i -D lighthouse playwright)
```

There is deliberately **no `package.json` at the repo root** — `amplify.yml`
declares no build step and nothing should need one. Install QA deps in a scratch directory and point
`NODE_PATH` at it, or accept the one-off install locally and leave it untracked.

`tools/qa/serve.js` mirrors the clean-URL and case-sensitivity behaviour but **does
not** implement the redirects — those are rewrite rules on the Amplify app (App
settings → Rewrites and redirects; `aws amplify get-app` lists them as
`customRules`), so `/Litigation` 404s locally while 301ing once deployed. Verify
redirects against the Amplify URL.

## 5. Current quality bar

Measured on the `revisions` branch, mobile, compressed:

| Page | Perf | A11y | Best practices | SEO |
|---|---|---|---|---|
| all four | 97–99 | **100** | 100 | 100 |

Plus: 33/33 functional checks, every page well-formed with exactly one `<h1>`, no
missing or unused assets, no external runtime dependencies.

On `main`, accessibility is 87–88 — the old palette fails WCAG AA in four places.
`revisions` fixes that (see README §Accessibility for the exact ratios).

## 6. Decisions worth knowing about

- **Duda served its mobile layout by User-Agent**, not viewport width, so a narrow
  desktop window got a squeezed desktop layout. The rebuild uses a
  `max-width: 767px` media query — what real phones actually saw.
- **The home hero is a two-slide slideshow** (3s cadence, 0.8s slide-up) and the
  About hero uses `background-attachment: fixed` plus a scroll parallax. Both
  reproduce the old behaviour and both honour `prefers-reduced-motion`.
- **The three practice areas are one page.** Business, Corporate and Real Estate
  live on `/practiceareas` as `#business-law`, `#corporate-law` and
  `#real-estate-law`. `/Litigation`, `/litigation`, `/business`, `/business-law`,
  `/corporate`, `/real-estate` and `/realestate` all 301 straight to the matching
  anchor — no redirect chains. This is the change that touches URLs with existing
  equity; the client asked for it explicitly.
- **The Super Lawyers badge is the logo**, not a headshot, and the old site showed
  it on the homepage only. `revisions` puts the white branded header on every page.
- Dropped as Duda platform artifacts: a hidden "Share by:" popup, RSS/Atom links
  to endpoints that would 404, a storefront prefetch, an invisible 172KB
  background image, and a dead UA-126104687-1 Google Analytics tag.
- `NOTES-source-oddities.md` catalogues 20 typos and oddities found in the source,
  which were reproduced verbatim on `main` and mostly cleaned up on `revisions`.

## 7. Open items

**Needs the client:**

1. **Read the new Real Estate and Corporate copy** (`revisions` branch, ~355 words
   each, six subheaded sections apiece). This is draft marketing copy written to
   fill two pages that were 45–51 word stubs. It is plausible and generic; it has
   not been reviewed by a lawyer.
2. **Business hours** — published nowhere and absent from `LegalService` schema.
   Needed for local search and "is it open" answers. Deliberately not invented.
3. **Contact form** — still none, matching the old site. Needs a decision on where
   submissions go before it can be built.
4. **Reviews / ratings** — no `aggregateRating` in schema.
5. **Business Law is still missing from the old live site's Practice Areas page.**
   Fixed on `revisions`; worth knowing it was a real content gap, not a port bug.

**Technical, unblocked:**

6. **Apex → www.** GoDaddy cannot hold an ALIAS at the apex, so `paulrubell.com` is
   handled by GoDaddy domain forwarding to `https://www.paulrubell.com` (§8). Every
   canonical, the sitemap and both llms files point at `www`; the apex should
   redirect rather than serve a duplicate.
7. Analytics — nothing is measuring traffic since UA stopped collecting in 2023.
   Add GA4 if measurement is wanted.

## 8. Go-live checklist

1. Merge `revisions` into `main` (after §7.1) — auto-deploys to production.
2. At GoDaddy, add the records from the Amplify domain association
   (`aws amplify get-domain-association --app-id d19scfayvy6e0b --domain-name paulrubell.com`):
   - `CNAME  _8da6e01f57254fee978f9a35672632ce  →  _ce4f4aa54118962528dc9e88a3f2945a.jkddzztszm.acm-validations.aws`
     (certificate validation)
   - `CNAME  www  →  d1a3abk2y1i7e4.cloudfront.net` (replaces the Duda `s.multiscreensite.com` CNAME)
   - Apex: delete the Duda `A @ 35.172.87.51` record and set **domain forwarding**
     `paulrubell.com → https://www.paulrubell.com`, permanent (301), forward-only.
3. Wait for the domain association to reach `AVAILABLE` (certificate is automatic,
   usually minutes after the validation CNAME resolves).
4. Confirm the custom domain serves the `customHttp.yml` headers and no
   `x-robots-tag: noindex`.
5. Submit `https://www.paulrubell.com/sitemap.xml` in Google Search Console.
6. Keep the Duda subscription alive briefly in case of rollback.

## 9. Gotchas

- **Amplify reads custom headers from `customHttp.yml`, not `amplify.yml`.** A
  `customHeaders:` block in `amplify.yml` is silently ignored — the first deploy
  shipped without headers for exactly this reason.
- **Rewrites/redirects are not in the repo.** They live on the Amplify app as
  `customRules`. Edit them in the console or with `aws amplify update-app
  --custom-rules`; a fresh app needs them re-applied.
- **The GitHub connection uses a personal token** (from `gh auth token`). If that
  token is revoked, pushes stop deploying. Migrating the app to the Amplify GitHub
  App in the console (the banner offers it) removes the dependency.
- **`git commit` must not override `user.email`.** The repo is configured with the
  GitHub noreply address; using `brendan@nysgpt.com` gets the push rejected by
  GitHub's email-privacy protection.
- **Screenshot diffing needs `animations: 'disabled'`** and the hero slideshow
  pinned, or comparisons are non-deterministic.
