# Handoff — paulrubell.com

**Date:** 2026-08-27 · **Repo:** `github.com/nyd-user-1/paulrubell` · **Host:** Vercel, team `nys-gpt`

---

## 1. Status in one paragraph

The Duda-hosted paulrubell.com has been rebuilt as a static site (plain HTML, one
stylesheet, ~90 lines of vanilla JS) and deployed to Vercel. `main` holds a
pixel-faithful reproduction of the old site plus client-requested content edits;
a `revisions` branch holds a first round of UI/UX, accessibility and SEO
improvements that deliberately diverge from the old design. **Nothing is live on
the real domain yet** — `www.paulrubell.com` still resolves to Duda. Cutover is a
DNS change at GoDaddy, whenever the client is ready.

## 2. Where everything is

| | |
|---|---|
| Repo | `github.com/nyd-user-1/paulrubell` |
| Vercel project | `paulrubell` under team **`nys-gpt`** (NOT the legacy `nyd-user-1` account, which is fair-use blocked) |
| Production (branch `main`) | https://paulrubell.vercel.app |
| Preview (branch `revisions`) | https://paulrubell-git-revisions-nys-gpt.vercel.app |
| Real domain | `www.paulrubell.com` → still Duda. Registrar GoDaddy, NS `ns23/ns24.domaincontrol.com` |

Git integration is connected: **any push to any branch auto-deploys**, `main` to
production and every other branch to its own stable preview alias.

Both `paulrubell.com` and `www.paulrubell.com` are already attached to the Vercel
project. They show "Invalid Configuration" until DNS moves — that is expected and
harmless.

## 3. The two branches

```
main       9bae88d   faithful rebuild + client content edits   -> paulrubell.vercel.app
revisions  1f01411   UI/UX + a11y + SEO improvements           -> ...git-revisions-nys-gpt.vercel.app
```

`revisions` is one commit ahead of `main` and has **not** been merged. It is
awaiting review, principally of the new page copy (see §7).

**Do not merge `revisions` before Paul has read the Real Estate and Corporate
copy.** Everything else in that branch is mechanical and safe.

## 4. How the code is organised

```
public/            the deployable output — Vercel serves this directly, no build step
  *.html           seven pages, generated (do not hand-edit; see below)
  css/site.css     the single stylesheet, ~1150 lines, sectioned and commented
  js/site.js       mobile drawer, dropdown, hero slideshow, hero parallax
  fonts/ images/   self-hosted; nothing loads from Duda's CDN
tools/render.mjs   generates the seven pages from shared partials
tools/qa/          local server + functional + Lighthouse harnesses
tools/source-images/  untouched client artwork, outside the deployed dir
vercel.json        outputDirectory, cleanUrls, redirects, cache + security headers
```

**Edit `tools/render.mjs`, not the HTML.** Head tags, header, nav, footer, JSON-LD
and page bodies all live there. Then:

```bash
node tools/render.mjs        # regenerate public/*.html
node tools/qa/serve.js       # local server on :4321
node tools/qa/functional.js  # 24 checks (needs: npm i -D playwright)
node tools/qa/lighthouse.mjs # mobile Lighthouse (needs: npm i -D lighthouse playwright)
```

There is deliberately **no `package.json` at the repo root** — adding one risks
Vercel trying to run a build. Install QA deps in a scratch directory and point
`NODE_PATH` at it, or accept the one-off install locally and leave it untracked.

`tools/qa/serve.js` mirrors Vercel's `cleanUrls` and case-sensitivity but **does
not** implement `vercel.json` redirects — `/Litigation` 404s locally while 308ing
correctly once deployed. Verify redirects against a preview URL.

## 5. Current quality bar

Measured on the `revisions` branch, mobile, with compression as Vercel serves:

| Page | Perf | A11y | Best practices | SEO |
|---|---|---|---|---|
| all seven | 97–99 | **100** | 100 | 100 |

Plus: 24/24 functional checks, every page well-formed with exactly one `<h1>`, no
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
- **`/Litigation` was renamed to `/business-law`** on `revisions`. `/Litigation`,
  `/litigation` and `/business` all 308 to it, so search equity transfers. This is
  the one change touching a URL with existing equity — easy to revert if wanted.
- **The Super Lawyers badge is the logo**, not a headshot, and the old site showed
  it on the homepage only. `revisions` puts the white branded header on all seven.
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

6. Set **`paulrubell.com` → redirect to `www.paulrubell.com`** in Vercel
   (Settings → Domains). Every canonical, the sitemap and both llms files point at
   `www`; the apex should redirect rather than serve a duplicate. CLI can't do
   this — dashboard only.
7. Analytics — nothing is measuring traffic since UA stopped collecting in 2023.
   Vercel Analytics is one toggle.

## 8. Go-live checklist

1. Merge `revisions` into `main` (after §7.1) — auto-deploys to production.
2. Set the apex → www redirect in the Vercel dashboard.
3. At GoDaddy: `A @ 76.76.21.21` and `A www 76.76.21.21`.
4. Wait for Vercel to issue certificates (automatic, usually minutes).
5. Confirm `x-robots-tag: noindex` is **absent** on the custom domain — Vercel adds
   it to `*.vercel.app` URLs only, but verify before assuming indexing works.
6. Submit `https://www.paulrubell.com/sitemap.xml` in Google Search Console.
7. Keep the Duda subscription alive briefly in case of rollback.

## 9. Gotchas

- **Two Vercel accounts exist.** `nyd-user-1` is legacy and fair-use blocked; all
  work is under `nys-gpt`. The Vercel MCP integration is scoped to the *blocked*
  account, so use the CLI (`--scope nys-gpt`) for anything project-related.
- **Deployment Protection is `all_except_custom_domains`.** The `.vercel.app` URLs
  require a Vercel login; the custom domain will be public. Anonymous `curl`
  against a preview returns a 302 to SSO — use `vercel curl` instead.
- **`git commit` must not override `user.email`.** The repo is configured with the
  GitHub noreply address; using `brendan@nysgpt.com` gets the push rejected by
  GitHub's email-privacy protection.
- **Screenshot diffing needs `animations: 'disabled'`** and the hero slideshow
  pinned, or comparisons are non-deterministic.
