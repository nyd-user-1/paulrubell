#!/usr/bin/env node
/**
 * Renders the seven static pages in /public from the shared header/footer
 * partials below. This is a convenience for keeping the chrome in sync — the
 * committed HTML in /public is the deployable artifact and Vercel runs no
 * build step. Run with:  node tools/render.mjs
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public');

const SITE = 'https://www.paulrubell.com';
const TITLE = 'Paul Rubell, Attorney At Law, P.C.';
const DESC = 'A boutique law firm that practices at the intersection of business and technology.';

/* Per-page title and description. The old site shipped one identical pair on
   every page, which gave search and answer engines nothing to tell them apart. */
const META = {
  '/': {
    title: 'Paul Rubell, Attorney At Law, P.C. | Business & Technology Law, Melville NY',
    desc: 'A boutique Long Island law firm practising at the intersection of business and technology. Mergers and acquisitions, venture capital, securities, real estate and privacy counsel.',
  },
  '/about': {
    title: 'About Paul Rubell, Esq. | Business & Technology Attorney, Long Island',
    desc: 'Paul Rubell is a national leader in technology and privacy law, advising companies, entrepreneurs and investors on M&A, private equity, venture capital, securities and governance.',
  },
  '/practiceareas': {
    title: 'Practice Areas | Paul Rubell, Attorney At Law, P.C.',
    desc: 'Business, corporate and real estate law for established and emerging companies, entrepreneurs and investors across New York and beyond.',
  },
  '/business-law': {
    title: 'Business Law Attorney | Paul Rubell, Attorney At Law, P.C.',
    desc: 'General corporate counsel, conventional and venture capital financing, M&A transactions and business formation for companies of every size, foreign and domestic.',
  },
  '/real-estate': {
    title: 'Real Estate Law Attorney, Melville NY | Paul Rubell, Attorney At Law, P.C.',
    desc: 'Commercial real estate counsel covering acquisition and disposition, financing, leasing, land use and 1031 exchanges across Long Island and the New York metropolitan area.',
  },
  '/corporate': {
    title: 'Corporate Law Attorney | Paul Rubell, Attorney At Law, P.C.',
    desc: 'Entity formation, governance, shareholder and operating agreements, and cross-border counsel for multinational companies and small businesses alike.',
  },
  '/contact': {
    title: 'Contact | Paul Rubell, Attorney At Law, P.C. — Melville, New York',
    desc: 'Reach Paul Rubell, Attorney At Law, P.C. at 48 South Service Road, Suite 300, Melville, NY 11747. Call 516-946-1706 or email paul@paulrubell.com.',
  },
};
const KEYWORDS =
  'paul rubell, privacy law, business law, corporate law, long island law, attorney at law, ' +
  'tech law, meltzer lippe, abrams fensterman, employment law, boutique law firm, attorney, legal, ' +
  'business, real estate, real estate law, 1031, technology, tech, shareholder, dispute, ' +
  'stockholder, stock, securities, agreement';
const TEL_HREF = 'tel:516-946-1706';           // corrected from the live site's 515 typo
const MAIL_HREF = 'mailto:paul@paulrubell.com'; // every CTA lands here; the site has no form
const OG_IMAGE = `${SITE}/images/og-image-200.png`;

/* Content-hashed asset URLs. Without these the stylesheet and the markup are
   cached independently, so a deploy that changes both hands a returning
   visitor new HTML against whatever CSS their browser still holds — which is
   exactly how the header collapsed after the mega-menu change. The hash makes
   the URL change whenever the bytes change, which is also what lets the cache
   header be immutable. Run this AFTER editing css/site.css or js/site.js;
   tools/qa/functional.js fails if the two ever drift apart. */
const assetHash = (rel) =>
  createHash('sha1').update(readFileSync(join(OUT, rel))).digest('hex').slice(0, 10);
const CSS_HREF = `/css/site.css?v=${assetHash('css/site.css')}`;
const JS_SRC = `/js/site.js?v=${assetHash('js/site.js')}`;

/* ----------------------------------------------------------- reveal fx -- */
/* RevealFx "Mask Wipe" — the page entrance used on the other projects: a
   left-to-right mask wipe with a blur settle and a small rise. Inlined in the
   head so the armed (hidden) state is in place before the first paint and the
   effect never depends on the deferred bundle. Every effect style is dropped
   once it finishes — a lingering filter would make <main> a containing block
   for fixed positioning. No-JS, no-mask and reduced-motion all fall through to
   a plain page. */
const REVEAL_BOOT = `  <script>(function(){var d=document.documentElement,s=d.style;
if(!('maskImage' in s)&&!('webkitMaskImage' in s))return;
try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;}catch(e){return;}
d.classList.add('reveal-arm');
function go(){requestAnimationFrame(function(){requestAnimationFrame(function(){
d.classList.remove('reveal-arm');d.classList.add('reveal-play');
setTimeout(function(){d.classList.remove('reveal-play');},700);});});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();}());<\/script>`;

/* ---------------------------------------------------------------- icons -- */
const ICON_MAIL = (cls = 'icon-mail') => `<svg class="${cls}" viewBox="0 0 512 512" role="img" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="32" d="M48 112h416v288H48z"/><path fill="none" stroke="currentColor" stroke-width="32" stroke-linecap="square" d="m64 128 192 144L448 128"/></svg>`;

const ICON_LINKEDIN = `<svg viewBox="0 0 448 512" role="img" aria-hidden="true" focusable="false"><path fill="currentColor" d="M100.3 480H7.4V180.9h92.9V480zM53.8 140.1C24.1 140.1 0 115.5 0 85.8 0 56.1 24.1 32 53.8 32s53.8 24.1 53.8 53.8c0 29.7-24.1 54.3-53.8 54.3zM447.9 480h-92.7V334.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V480h-92.8V180.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V480z"/></svg>`;

const ICON_PHONE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70" role="img" aria-hidden="true" focusable="false"><path d="M25.3,44.8C35.7,55.3,44.2,56,46.6,56c3.9,0,9.4-5,9.4-6.3v-2.5c0-0.6-0.4-1.1-1-1.3l-10-3.2c-0.5-0.2-1,0-1.4,0.3L40,46.8 c-0.4,0.4-1.1,0.5-1.6,0.2c-1.5-0.9-4.8-2.9-8.6-6.8c-3.8-3.8-5.9-7.1-6.8-8.6c-0.3-0.5-0.2-1.2,0.2-1.6l3.7-3.7 c0.4-0.4,0.5-0.9,0.3-1.4l-3.2-10c-0.2-0.6-0.7-1-1.3-1h-2.5C19,14.1,14,19.7,14,23.5C14,25.8,14.8,34.3,25.3,44.8L25.3,44.8z"/></svg>`;

const ICON_CHEVRON = `<span class="nav-chevron" aria-hidden="true"><svg viewBox="0 0 320 512" focusable="false"><path fill="currentColor" d="M143 352.3 7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z"/></svg></span>`;

/* ------------------------------------------------------------ structured -- */
const LEGAL_SERVICE = {
  '@context': 'https://schema.org',
  '@type': 'LegalService',
  '@id': `${SITE}/#organization`,
  name: 'Paul Rubell, Attorney At Law, P.C.',
  alternateName: 'Paul Rubell',
  description: DESC.trim(),
  url: SITE,
  telephone: '+1-516-946-1706',
  email: 'paul@paulrubell.com',
  image: OG_IMAGE,
  logo: OG_IMAGE,
  priceRange: '$$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '48 South Service Road, Suite 300',
    addressLocality: 'Melville',
    addressRegion: 'NY',
    postalCode: '11747',
    addressCountry: 'US',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 40.771, longitude: -73.412 },
  areaServed: [
    { '@type': 'State', name: 'New York' },
    { '@type': 'Country', name: 'United States' },
  ],
  sameAs: ['https://www.linkedin.com/in/paulrubell/'],
  founder: { '@type': 'Person', name: 'Paul Rubell', jobTitle: 'Attorney' },
  knowsAbout: [
    'Business law', 'Corporate law', 'Real estate law', 'Technology law',
    'Privacy law', 'Mergers and acquisitions', 'Venture capital', 'Securities offerings',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Practice Areas',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Business Law', url: `${SITE}/business-law` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Corporate Law', url: `${SITE}/corporate` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Real Estate Law', url: `${SITE}/real-estate` } },
    ],
  },
};

const PERSON = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE}/about#paul-rubell`,
  name: 'Paul Rubell',
  jobTitle: 'Attorney',
  honorificSuffix: 'Esq.',
  url: `${SITE}/about`,
  image: OG_IMAGE,
  email: 'paul@paulrubell.com',
  telephone: '+1-516-946-1706',
  worksFor: { '@id': `${SITE}/#organization` },
  sameAs: ['https://www.linkedin.com/in/paulrubell/'],
  knowsAbout: [
    'Technology law', 'Privacy law', 'Business law', 'Corporate law',
    'Real estate law', 'Cybersecurity', 'Blockchain',
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: '48 South Service Road, Suite 300',
    addressLocality: 'Melville',
    addressRegion: 'NY',
    postalCode: '11747',
    addressCountry: 'US',
  },
};

const breadcrumb = (name, path) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
    { '@type': 'ListItem', position: 2, name, item: `${SITE}${path}` },
  ],
});

/* ----------------------------------------------------------------- head -- */
function head({ path, preload = [], jsonld = [] }) {
  const canonical = `${SITE}${path}`;
  const { title, desc } = META[path];
  const preloads = preload
    .map(([sm, md, lg]) => `  <link rel="preload" as="image" href="/images/${sm}" media="(max-width: 767px)" fetchpriority="high">
  <link rel="preload" as="image" href="/images/${md}" media="(min-width: 768px) and (max-width: 1024px)" fetchpriority="high">
  <link rel="preload" as="image" href="/images/${lg}" media="(min-width: 1025px)" fetchpriority="high">`)
    .join('\n');
  const blocks = jsonld
    .map((o) => `  <script type="application/ld+json">${JSON.stringify(o)}</script>`)
    .join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="initial-scale=1, minimum-scale=1, maximum-scale=5, viewport-fit=cover">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <meta name="keywords" content="${KEYWORDS}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="author" content="Paul Rubell, Attorney At Law, P.C.">
  <meta name="theme-color" content="#0075bb">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="Paul Rubell">
  <meta name="format-detection" content="telephone=no">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${TITLE}">
  <meta property="og:locale" content="en_US">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${OG_IMAGE}">
  <meta property="og:image:width" content="200">
  <meta property="og:image:height" content="200">
  <meta property="og:image:alt" content="Paul Rubell, Attorney At Law, P.C.">

  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${OG_IMAGE}">

  <link rel="manifest" href="/manifest.json">
  <link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="/images/apple-touch-icon-57.png">

  <link rel="preload" as="font" type="font/woff2" href="/fonts/montserrat-latin.woff2" crossorigin>
  <link rel="preload" as="font" type="font/woff2" href="/fonts/opensans-latin.woff2" crossorigin>
${preloads}
  <link rel="stylesheet" href="${CSS_HREF}">
${REVEAL_BOOT}
${blocks}
</head>`;
}

/* --------------------------------------------------------------- header -- */
const NAV_ITEMS = [
  { label: 'About', href: '/about', key: 'about' },
  {
    label: 'Practice Areas', href: '/practiceareas', key: 'practiceareas',
    mega: true,
    sub: [
      {
        label: 'Business Law', href: '/business-law', key: 'business-law',
        desc: 'General corporate counsel, financing, M&amp;A and business formation.',
      },
      {
        label: 'Real Estate Law', href: '/real-estate', key: 'real-estate',
        desc: 'Acquisition and disposition, leasing, land use and 1031 exchanges.',
      },
      {
        label: 'Corporate Law', href: '/corporate', key: 'corporate',
        desc: 'Entity formation, governance and shareholder agreements.',
      },
    ],
  },
  { label: 'Contact', href: '/contact', key: 'contact' },
];

const PA_CHILDREN = ['business-law', 'real-estate', 'corporate'];

function navList(current, { id, cls, noToggle }) {
  const items = NAV_ITEMS.map((it) => {
    const isCurrent = it.key === current || (it.key === 'practiceareas' && PA_CHILDREN.includes(current));
    const liCls = [it.sub ? 'has-sub' : '', it.mega ? 'has-mega' : '', isCurrent ? 'is-current' : ''].filter(Boolean).join(' ');
    if (!it.sub) {
      return `        <li${liCls ? ` class="${liCls}"` : ''}><a href="${it.href}"${isCurrent ? ' aria-current="page"' : ''}><span class="nav-item-text">${it.label}</span></a></li>`;
    }
    const subs = it.sub
      .map((s) => `            <li${s.key === current ? ' class="is-current"' : ''}><a href="${s.href}"${s.key === current ? ' aria-current="page"' : ''}><span class="nav-item-text">${s.label}</span>${s.desc ? `<span class="sub-desc">${s.desc}</span>` : ''}</a></li>`)
      .join('\n');
    /* The panel carries a trailing "all areas" link that only the desktop mega
       menu shows; the drawer already reaches /practiceareas via its parent. */
    const megaAll = it.mega
      ? `\n            <li class="subnav-all"><a href="${it.href}"><span class="nav-item-text">All practice areas</span></a></li>`
      : '';
    return `        <li class="${liCls}">
          <a href="${it.href}"${noToggle ? '' : ' aria-expanded="false" aria-controls="' + id + '-sub"'}${isCurrent ? ' aria-current="page"' : ''}><span class="nav-item-text">${it.label}${ICON_CHEVRON}</span></a>
          <ul class="subnav" id="${id}-sub">
${subs}${megaAll}
          </ul>
        </li>`;
  }).join('\n');
  return `      <ul>
${items}
      </ul>`;
}

function mobileHeader() {
  return `  <div class="m-header">
    <div class="bar">
      <div class="slot-left"></div>
      <div class="slot-mid">
        <a class="wordmark" href="/">
          <img src="/images/paul-rubell-logo.png" width="1516" height="292" alt="Paul Rubell &mdash; Attorney At Law, P.C.">
        </a>
      </div>
      <div class="slot-right">
        <a class="phone" href="${TEL_HREF}" aria-label="Call 516-946-1706">${ICON_PHONE}</a>
      </div>
    </div>
  </div>
  <button class="hamburger" type="button" aria-label="Menu" aria-controls="mobile-drawer" aria-expanded="false">
    <span class="slice"></span><span class="slice"></span><span class="slice"></span>
  </button>`;
}

function drawer(current) {
  return `<div class="drawer" id="mobile-drawer">
  <nav aria-label="Mobile">
${navList(current, { id: 'drawer', cls: '', noToggle: true })}
  </nav>
  <div class="drawer-foot">
    <div class="foot-line"><p class="label">Get in touch</p></div>
    <div class="foot-line">
      <p>516-946-1706</p>
      <p>Paul@paulrubell.com</p>
    </div>
    <p class="icons">
      <a href="mailto:paul@paulrubell.com" aria-label="Email Paul Rubell">${ICON_MAIL('')}</a>
      <a href="https://www.linkedin.com/in/paulrubell/" aria-label="Paul Rubell on LinkedIn" target="_blank" rel="noopener">${ICON_LINKEDIN}</a>
    </p>
  </div>
</div>
<div class="drawer-overlay" hidden-aria></div>`;
}

/** One header for every page: dark utility strip, then a white band carrying
    the badge, wordmark and navigation. The old site used this on the homepage
    only and left the other six with an empty blue band. */
function siteHeader(current) {
  return `<header class="site-header">
${mobileHeader()}
  <div class="row topbar">
    <div class="wrap">
      <div class="col c6 social">
        <a href="mailto:paul@paulrubell.com" aria-label="Email Paul Rubell">${ICON_MAIL()}</a>
      </div>
      <div class="col c6 contact-col">
        <p class="contact-line"><a href="mailto:paul@paulrubell.com">paul@paulrubell.com</a><span> <span>/ 516-946-1706</span></span></p>
      </div>
    </div>
  </div>
  <div class="row navrow">
    <div class="wrap">
      <div class="col c6">
        <div class="row brandbar">
          <div class="wrap">
            <div class="col name-col">
              <a class="brand-link" href="/">
                <span class="brand-name">Paul Rubell</span>
                <span class="brand-sub">Attorney At Law, P.C.</span>
              </a>
            </div>
            <div class="col badge-col">
              <a class="badge-link" href="/" aria-label="Paul Rubell, Attorney At Law, P.C. — home">
                <img class="badge-img" src="/images/superlawyers-badge.png" width="344" height="286" alt="Rated by Super Lawyers &mdash; Paul Rubell, SuperLawyers.com">
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="col c6 nav-col">
        <nav class="mainnav" aria-label="Primary">
${navList(current, { id: 'main', cls: '' })}
        </nav>
      </div>
    </div>
  </div>
</header>
${drawer(current)}`;
}

/* --------------------------------------------------------------- footer -- */
function footer() {
  return `<footer class="site-footer">
  <div class="row footer-main">
    <div class="wrap">
      <div class="col c6 footer-brand">
        <div class="brand-block">
          <h2>Paul Rubell</h2>
          <p>Attorney At Law, P.C.</p>
        </div>
        <p class="footer-badge">
          <img src="/images/superlawyers-badge.png" width="344" height="286" alt="Rated by Super Lawyers &mdash; Paul Rubell, SuperLawyers.com" loading="lazy">
        </p>
      </div>
      <div class="col c6 footer-contact">
        <div class="contact-head"><h2>Contact</h2></div>
        <div class="footer-address">
          <p>48 South Service Road</p>
          <p>Suite 300</p>
          <p>Melville, NY 11747</p>
        </div>
        <div class="footer-links">
          <p><a href="${TEL_HREF}">516-946-1706</a></p>
          <p><a class="mail" href="mailto:paul@paulrubell.com">paul@paulrubell.com</a></p>
        </div>
      </div>
    </div>
  </div>
  <div class="row footer-legal">
    <div class="wrap">
      <div class="col c12">
        <div class="copyright">
          <div>&copy; 2026 Paul Rubell, Attorney At Law, P.C.</div>
        </div>
      </div>
    </div>
  </div>
</footer>`;
}

const TAIL = `<script src="${JS_SRC}" defer></script>
</body>
</html>
`;

/* ------------------------------------------------------------- page: / -- */
const CARDS = [
  {
    href: '/business-law', title: 'Business Law',
    text: 'Business disputes are part of every business. We help you protect your best interests.',
    img: 'card-business', widths: [440, 640, 1000, 1440],
  },
  {
    href: '/corporate', title: 'Corporate Law',
    text: 'We help create business entities, such as corporations, partnerships and joint ventures.',
    img: 'card-corporate', widths: [440, 640, 1000],
  },
  {
    href: '/real-estate', title: 'Real Estate Law',
    text: 'Draw upon our full complement of services to safeguard and manage your assets.',
    img: 'card-realestate', widths: [440, 640, 1000],
  },
];

const TXNS = [
  {
    logo: 'logo-southstar', ext: 'jpg', logoWidths: [640, 1222], alt: 'South Street condominium building',
    photo: true,   // a photograph, not a mark: fills the media tile instead of sitting inside it
    title: 'Condominium Offering', titleInk: 'black',
    body: `<p class="attrib"><strong>Paul Rubell, Attorney at Law P.C. represented the Sponsor.</strong></p>`,
  },
  {
    logo: 'logo-sunation', ext: 'png', logoWidths: [640, 1024], alt: 'SUNation Energy',
    title: 'Equity Raise', titleInk: 'black',
    body: `<p><span>SUNation Energy, a public company and leading provider of solar and battery storage, raised $32,000,000 in a PIPE transaction.</span></p>
              <p class="attrib"><strong>Paul Rubell, Attorney at Law P.C. represented the Issuer.</strong></p>`,
  },
  {
    logo: 'logo-naboso', ext: 'png', logoWidths: [640, 925], alt: 'Naboso',
    title: 'Venture Capital Investment', titleInk: 'black',
    body: `<p><span>Naboso, a&nbsp;</span><strong>manufacturer of proprietary&nbsp;</strong><span>footwear products based on the first-ever small nerve proprioceptive material commercially available and designed for the purpose of improving posture and enhancing movement, received a $3,000,000 Venture Capital Investment from Protea Japan.</span></p>
              <p class="attrib"><strong>Paul Rubell, Attorney at Law P.C. represented Naboso.</strong></p>`,
  },
  {
    logo: 'logo-indaba', ext: 'png', logoWidths: [640, 1026], alt: 'Indaba Renewable Fuels',
    title: 'Venture Capital Investment', titleInk: 'black',
    body: `<p><span>Indaba Renewable Fuels, developers of a new refinery for the production of high-grade, ultra-low sulfur drop-in renewable jet fuel, received a Pre-Development Capital Investment&nbsp;</span><strong>of $750,000.&nbsp;</strong><span>Paul Rubell, Attorney at Law P.C. represented the&nbsp;</span><strong>investors&#8203;.</strong></p>
              <p class="attrib"><strong>Paul Rubell, Attorney at Law P.C. represented the Lead Investor&#8203;.</strong></p>`,
  },
  {
    logo: 'logo-cyberus', ext: 'png', logoWidths: [594], alt: 'Cyberus Labs',
    title: 'Seed Investment Round', titleInk: '333',
    body: `<p><span>Cyberus Labs, proprietor of Cyberus Key, a one-touch audio user-authentication system that eliminates the use of passwords and provides the highest level of protection, received a $2,000,000 Capital Infusion.</span></p>
              <p class="attrib"><strong>Paul Rubell, Attorney at Law P.C. represented the Lead Investor&#8203;.</strong></p>`,
  },
  {
    logo: 'logo-blueorb', ext: 'jpeg', logoWidths: [200], alt: 'Blue Orb',
    title: 'Venture Capital Investment', titleInk: 'black', innerRule: true,
    body: `<p><span>Blue Orb, a renewables development platform, received a Capital Investment of $1,000,000.</span></p>
              <p class="attrib"><strong>Paul Rubell, Attorney at Law P.C. represented the Lead Investor&#8203;.</strong></p>`,
  },
  {
    logo: 'logo-morganstanley', ext: 'jpg', logoWidths: [640, 854], alt: 'Morgan Stanley',
    photo: true,
    title: 'Line of Credit', titleInk: 'black',
    body: `<p><span>International Art Trading, LLC received a</span> <strong>$25,000,000 line of credit from Morgan Stanley.</strong></p>
              <p class="attrib"><strong>Paul Rubell, Attorney at Law P.C.&nbsp;represented the Borrower.</strong></p>`,
  },
];

function srcset(base, widths, ext) {
  return widths.map((w) => `/images/${base}-${w}.${ext} ${w}w`).join(', ');
}

function homePage() {
  const cards = CARDS.map((c) => `            <div class="gallery-col">
              <div class="gallery-thumb">
                <a class="gallery-card" href="${c.href}">
                  <span class="card-img card-img--${c.img.replace('card-', '')}" role="img" aria-label="${c.title}"></span>
                  <span class="caption">
                    <span class="caption-title">${c.title}</span>
                    <span class="caption-text"><br><span class="caption-copy">${c.text}</span></span>
                  </span>
                </a>
              </div>
            </div>`).join('\n');

  const txns = TXNS.map((t, i) => {
    // The live page puts separators 1-3 at full width but tucks the fourth
    // one inside the Blue Orb text column. Reproduced as-is.
    const rule = i === 0 || TXNS[i - 1].innerRule ? '' : `          <div class="txn-rule"><hr></div>\n`;
    const inner = t.innerRule ? `\n                <div class="txn-rule"><hr></div>` : '';
    return `${rule}          <div class="txn${t.innerRule ? ' txn--flush' : ''}">
            <div class="txn-logo txn-logo--${t.logo.replace('logo-', '')}${t.photo ? ' txn-logo--photo' : ''}" role="img" aria-label="${t.alt}"></div>
            <div class="txn-body">
              <h3${t.titleInk === '333' ? ' class="ink-333"' : ''}>${t.title}</h3>
              <div class="txn-copy">
              ${t.body}
              </div>${inner}
            </div>
          </div>`;
  }).join('\n');

  return `${head({
    path: '/',
    preload: [['hero-home-640.jpg', 'hero-home-1024.jpg', 'hero-home-1920.jpg']],
    jsonld: [LEGAL_SERVICE, { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE}/#website`, url: SITE, name: TITLE, publisher: { '@id': `${SITE}/#organization` }, inLanguage: 'en-US' }],
  })}
<body class="page-home">
<a class="skip-link" href="#main">Skip to content</a>
<div class="site">
${siteHeader('home')}

  <main id="main" class="reveal-fx">

    <section class="row hero" aria-label="Introduction">
      <div class="hero-slides" aria-hidden="true">
        <div class="hero-slide hero-slide--1 is-active"></div>
        <div class="hero-slide hero-slide--2"></div>
      </div>
      <div class="wrap">
        <div class="col c12">
          <h1>Forward Looking</h1>
          <h2>Business Law</h2>
          <p class="tagline"><span>A boutique business law firm that practices at the intersection of business and technology&nbsp;</span>.&nbsp;</p>
          <a class="btn-call" href="${MAIL_HREF}"><span class="text">LET'S TALK</span></a>
        </div>
      </div>
    </section>

    <section class="row row--full welcome" aria-labelledby="welcome-heading">
      <div class="wrap">
        <div class="col c12">
          <div class="lede">
            <h2 id="welcome-heading"><a href="/about"><strong>Paul Rubell</strong></a> <strong>welcomes you to a</strong> <strong>law practice like no other.</strong></h2>
          </div>
          <div class="divider"><hr></div>
          <div class="kicker"><p><span>A boutique business</span> <span>law firm</span></p></div>
          <div class="body">
            <p>Paul provides legal counsel, business advice and strategic planning to established and emerging companies, entrepreneurs and investors. His practice areas include mergers and acquisitions; private equity; venture capital; private and public securities offerings; and governance.&nbsp;</p>
            <p>Paul&rsquo;s extensive experience includes partnership agreements, shareholder disputes and litigation strategy, commercial real estate acquisition and financing. In addition, he has extensive experience handling real estate acquisitions, divestitures and financing, and designing and structuring complex transactions.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="row row--full practice" aria-labelledby="practice-heading">
      <div class="wrap">
        <div class="col c12">
          <h2 id="practice-heading"><strong>Practice Areas</strong></h2>
          <div class="gallery">
            <div class="gallery-inner">
              <div class="gallery-row">
${cards}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="row row--full transactions" aria-labelledby="transactions-heading">
      <div class="wrap">
        <div class="col c5 intro-col">
          <h2 id="transactions-heading"><strong>Highlighted Transactions</strong></h2>
          <div class="divider divider--left"><hr></div>
          <div class="intro-body">
            <p>Attorney Paul Rubell has a distinguished track record of facilitating complex investment transactions across diverse industries.</p>
            <p>His expertise encompasses venture capital, renewable energy, cybersecurity, and technology sectors, providing clients with comprehensive legal counsel and strategic business advice.</p>
          </div>
        </div>
        <div class="col c7 list-col">
${txns}
        </div>
      </div>
    </section>

  </main>

${footer()}
</div>
${TAIL}`;
}

/* --------------------------------------------------------- interior page -- */
/* The hero band sits OUTSIDE .reveal-fx here: .page-hero--parallax uses
   background-attachment: fixed, which an ancestor filter/transform re-crops
   mid-animation and then snaps back when the wipe cleans up. The home hero has
   no fixed attachment, so there the whole <main> is the reveal target. */
function interiorPage({ path, current, preload, hero, jsonld, main }) {
  return `${head({ path, preload: preload || [], jsonld })}
<body class="page-inner">
<a class="skip-link" href="#main">Skip to content</a>
<div class="site">
${siteHeader(current)}

  <main id="main">
${hero || ''}
    <div class="reveal-fx">
${main}
    </div>
  </main>

${footer()}
</div>
${TAIL}`;
}

/** Shared closing call to action. The old site had no CTA on desktop at all. */
const CTA = (lead) => `
    <section class="row section--cta" aria-labelledby="cta-heading">
      <div class="wrap">
        <div class="col c12">
          <h2 class="cta-title" id="cta-heading">${lead}</h2>
          <p class="cta-copy">Write or call to discuss your matter directly with Paul Rubell &mdash; no intake queue, no gatekeeping.</p>
          <p class="cta-actions">
            <a class="btn btn--primary" href="${MAIL_HREF}">Email Paul@paulrubell.com</a>
            <a class="btn btn--ghost" href="${TEL_HREF}">Call 516-946-1706</a>
          </p>
        </div>
      </div>
    </section>`;

/* Vertical base offset per hero, in px, applied before the parallax drift.
   Tuned against each photograph: 0 keeps the top of the frame. */
const HERO_BASE = { about: 0, litigation: -60, realestate: -190, corporate: -90 };

const heroBand = (mod) => {
  const mods = mod.split(' ');
  const base = HERO_BASE[mods[0]] || 0;
  return `    <div class="page-hero ${mods.map((m) => 'page-hero--' + m).join(' ')}"${base ? ` data-parallax-base="${base}"` : ''} role="presentation"></div>`;
};

/* ------------------------------------------------------------ page bodies */
function aboutPage() {
  return interiorPage({
    path: '/about',
    current: 'about',
    preload: [['hero-about-640.jpg', 'hero-about-1024.jpg', 'hero-about-1920.jpg']],
    jsonld: [LEGAL_SERVICE, PERSON, breadcrumb('About', '/about')],
    hero: heroBand('about parallax'),
    main: `    <section class="row section" aria-labelledby="about-heading">
      <div class="wrap">
        <div class="col c12">
          <h1 class="page-title page-title--flush" id="about-heading">About Paul Rubell, Esq.</h1>
          <div class="divider divider--left"><hr></div>
          <div class="prose prose--gap23 prose--lines">
            <p>Paul provides legal counsel, business advice and strategic planning to established and emerging companies, entrepreneurs and investors. His practice areas include mergers and acquisitions; private equity; venture capital; private and public securities offerings; and governance. Paul&rsquo;s extensive experience includes partnership agreements, shareholder disputes and litigation strategy, commercial real estate acquisition and financing. In addition, he has extensive experience handling real estate acquisitions, divestitures and financing, and designing and structuring complex transactions.</p>
            <p class="blank"><br></p>
            <p>Paul is a national leader in the fields of technology and privacy law. He advises clients about domestic and international privacy laws involving healthcare, financial services, education and other verticals as well as disruptive technologies and innovation such as blockchain, augmented reality, cybersecurity, encryption, 3D printing, robotics and space exploration.&nbsp;</p>
            <p class="blank"><br></p>
            <p>Paul&rsquo;s writings have been published frequently in the New York Law Journal and other important periodicals. He has been interviewed about legal topics by CBS-TV, ABC-TV, National Public Radio, The New York Times, Associated Press, Long Island Business News, Newsday, Law360, and the national media. Paul lectures frequently to boards of directors, trade associations and not-for-profits.</p>
            <p class="blank"><br></p>
            <p class="blank"><br></p>
          </div>
        </div>
      </div>
    </section>

    <section class="row section--tail" aria-labelledby="mission-heading">
      <div class="wrap">
        <div class="col c12">
          <div class="divider divider--wide divider--dotted"><hr></div>
          <h2 class="mission-title" id="mission-heading">Mission</h2>
          <div class="prose prose--gap8 prose--lines">
            <p>Our mission is to provide each and every client with skilled legal advice in a timely and efficient manner. We handle every case with accountability and responsiveness and are dedicated to focusing on the legal aspects of your case, so that you can focus on your personal success.&nbsp;</p>
            <p class="blank"><br></p>
            <p>Our mission is based on the values we hold true: <i>integrity, service and excellence</i>.</p>
          </div>
        </div>
      </div>
    </section>
${CTA('Ready to talk it through?')}`,
  });
}

function practiceAreasPage() {
  const items = [
    {
      href: '/business-law', name: 'Business Law', img: 'card-business', widths: [440, 640, 1000],
      text: 'General corporate counsel, financing, M&A transactions and business formation for clients big and small, foreign and domestic.',
      stray: '',
    },
    {
      href: '/real-estate', name: 'Real Estate Law', img: 'card-realestate', widths: [440, 640, 1000],
      text: 'Draw upon our full complement of services and expertise to help you through land acquisition and disposition, ownership and transactions, and more.',
      stray: 'List Item  3',
    },
    {
      href: '/corporate', name: 'Corporate Law', img: 'card-corporate', widths: [440, 640, 1000],
      text: 'We represent both foreign and domestic companies to ensure the legal passage of goods, services, capital and more across borders.',
      stray: 'List Item  4',
    },
  ].map((it) => `            <li>
              <a class="biglink" href="${it.href}">
                <span class="list-image list-image--${it.img.replace('card-', '')}" role="img" aria-label="${it.name}"></span>
                <span class="list-text">
                  <span class="item-name">${it.name}</span>
                  <span class="item-text">${it.text}</span>
                </span>
                <span class="link">
                  <span class="button-text">Learn More</span>
                </span>
              </a>
            </li>`).join('\n');

  return interiorPage({
    path: '/practiceareas',
    current: 'practiceareas',
    jsonld: [LEGAL_SERVICE, breadcrumb('Practice Areas', '/practiceareas')],
    main: `    <section class="row section--pa-intro" aria-labelledby="pa-heading">
      <div class="wrap">
        <div class="col c12 gutter-30">
          <h1 class="page-title page-title--center" id="pa-heading">Practice Areas</h1>
          <div class="divider divider--thick"><hr></div>
          <div class="prose prose--15">
            <p>Rubell Law provides legal counsel, business advice and strategic planning to established and emerging companies, entrepreneurs and investors. His practice areas include mergers and acquisitions; private equity; venture capital; private and public securities offerings; and governance. Paul&rsquo;s extensive experience includes partnership agreements, shareholder disputes and litigation strategy, commercial real estate acquisition and financing. In addition, he has extensive experience handling real estate acquisitions, divestitures and financing, and designing and structuring complex transactions.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="row section--pa-list" aria-label="List of Services">
      <div class="wrap">
        <div class="col c12">
          <ul class="services">
${items}
          </ul>
        </div>
      </div>
    </section>
${CTA('Not sure which area fits?')}`,
  });
}

function businessLawPage() {
  return interiorPage({
    path: '/business-law',
    current: 'business-law',
    preload: [['card-business-640.jpg', 'card-business-1000.jpg', 'card-business-1440.jpg']],
    jsonld: [
      LEGAL_SERVICE,
      breadcrumb('Business Law', '/business-law'),
      { '@context': 'https://schema.org', '@type': 'Service', name: 'Business Law', serviceType: 'Business Law', url: `${SITE}/business-law`, provider: { '@id': `${SITE}/#organization` }, areaServed: { '@type': 'State', name: 'New York' } },
    ],
    hero: heroBand('litigation parallax'),
    main: `    <section class="row section--practice" aria-labelledby="biz-heading">
      <div class="wrap">
        <div class="col c12 gutter-30">
          <h1 class="page-title" id="biz-heading">Business Law</h1>
          <div class="divider divider--left divider--thick"><hr></div>
          <div class="prose prose--16">
            <p>We apply forward-thinking ideas and solutions to the most challenging legal issues you face, and approach each case with passion and commitment. From the first steps of the litigation process and right through to the end, we&rsquo;ll handle everything you need to be in your best shape at trial. We know how complicated litigation can be. From pleadings, affidavits, examinations, motions, mediation, undertakings, refusals, pretrial, and finally, trial.</p>
            <p><b class="subhead">General Corporate Counsel</b><br>We structure, negotiate, draft and review corporate documents on behalf of clients big and small, foreign and domestic, growing or restructuring, and in nearly all jurisdictions.  For many companies and corporations we are an invaluable addition to the general counsel team contributing to precise, reliable corporate documents and offering ongoing business counsel to your in-house legal team.</p>
            <p><b class="subhead">Conventional Financing</b><br>We represent institutional lenders and borrowers in connection with short and long term financing for business enterprises; including mortgage financing.</p>
            <p><b class="subhead">Venture Capital Financing</b><br>We represent public and private companies as well as venture capital entities in connection with debt and equity offerings, warrants, and structuring joint ventures both domestically and abroad.</p>
            <p><b class="subhead">M &amp; A Transactions</b><br>The majority of our work is in complex transactions, disclosure, compliance, governance and M&amp;A, but in everything we do, we endeavor to support clients in a manner that allows them to focus on the growth of their business and know they are on sound legal footing, well-positioned for growth, and able to act swiftly to capitalize on the next opportunity.</p>
            <p><b class="subhead">Business Formation</b><br>We provide counsel on traditional business transactions, the formation of new entities, basic corporate management responsibilities and unforeseen legal needs resulting from continued global growth.  We counsel clients in complying with increasingly fragmented government and agency regulations, in understanding and managing new legal developments, and in forecasting legal trends to formulate sound corporate policy and stay ahead of the regulatory curve.</p>
          </div>
        </div>
      </div>
    </section>
${CTA('Have a transaction in front of you?')}`,
  });
}

function realEstatePage() {
  return interiorPage({
    path: '/real-estate',
    current: 'real-estate',
    preload: [['hero-realestate-640.jpg', 'hero-realestate-1024.jpg', 'hero-realestate-1920.jpg']],
    jsonld: [
      LEGAL_SERVICE,
      breadcrumb('Real Estate', '/real-estate'),
      { '@context': 'https://schema.org', '@type': 'Service', name: 'Real Estate Law', serviceType: 'Real Estate Law', url: `${SITE}/real-estate`, provider: { '@id': `${SITE}/#organization` }, areaServed: { '@type': 'State', name: 'New York' } },
    ],
    hero: heroBand('realestate parallax'),
    main: `    <section class="row section--practice" aria-labelledby="re-heading">
      <div class="wrap">
        <div class="col c12 gutter-30">
          <h1 class="page-title" id="re-heading">Real Estate Law</h1>
          <div class="divider divider--left divider--thick"><hr></div>
          <div class="prose prose--16">
            <p>Draw upon our full complement of services and expertise to help you through land acquisition and disposition, ownership and transactions, financing, land use planning and more. We take a proactive approach to developing and implementing solutions to your distinct challenges to help you manage your real estate assets.</p>
            <p><b class="subhead">Acquisition and Disposition</b><br>We represent purchasers and sellers of commercial property through every stage of a transaction &mdash; letters of intent, contract negotiation, due diligence, title and survey review, and closing. We structure deals to protect your position on price, contingencies and timing, and we identify the problems that surface in diligence before they become obstacles at the table.</p>
            <p><b class="subhead">Financing</b><br>We act for both borrowers and institutional lenders in mortgage financing, construction loans, mezzanine debt and refinancing. Our work covers loan commitments, security instruments, guaranties, intercreditor and subordination agreements, and the estoppels and consents a lender will require before it funds.</p>
            <p><b class="subhead">Leasing</b><br>We negotiate office, retail and industrial leases for landlords and tenants, including build-out and tenant improvement allowances, escalation and pass-through provisions, assignment and subletting, options to renew or expand, and the surrender and restoration obligations that decide how a tenancy ends.</p>
            <p><b class="subhead">Land Use and Development</b><br>We guide owners and developers through zoning analysis, variances and special permits, site plan approval, subdivision, and appearances before municipal boards. We work alongside your architects, engineers and planners so the legal path and the design track advance together rather than in sequence.</p>
            <p><b class="subhead">1031 Exchanges</b><br>We structure like-kind exchanges to defer capital gains on investment property, coordinating with qualified intermediaries and your tax advisors to keep identification and closing inside the statutory deadlines. We also handle reverse and improvement exchanges where the replacement property must be acquired first.</p>
            <p><b class="subhead">Entity Structuring and Joint Ventures</b><br>We form the holding companies, single-purpose entities and joint ventures through which real estate is owned, and draft the operating agreements that govern capital contributions, distributions, control, transfer restrictions and exit. Getting the structure right at acquisition is what makes a clean disposition possible years later.</p>
          </div>
        </div>
      </div>
    </section>
${CTA('Buying, selling or financing property?')}`,
  });
}

function corporatePage() {
  return interiorPage({
    path: '/corporate',
    current: 'corporate',
    preload: [['hero-corporate-640.jpg', 'hero-corporate-1024.jpg', 'hero-corporate-1920.jpg']],
    jsonld: [
      LEGAL_SERVICE,
      breadcrumb('Corporate', '/corporate'),
      { '@context': 'https://schema.org', '@type': 'Service', name: 'Corporate Law', serviceType: 'Corporate Law', url: `${SITE}/corporate`, provider: { '@id': `${SITE}/#organization` }, areaServed: { '@type': 'State', name: 'New York' } },
    ],
    hero: heroBand('corporate parallax'),
    main: `    <section class="row section--practice" aria-labelledby="corp-heading">
      <div class="wrap">
        <div class="col c12 gutter-30">
          <h1 class="page-title" id="corp-heading">Corporate Law</h1>
          <div class="divider divider--left divider--thick"><hr></div>
          <div class="prose prose--16">
            <p>We help create business entities, such as corporations, partnerships and joint ventures. We also represent both foreign and domestic companies to ensure the legal passage of goods, services, capital and more across borders. Our clients include multinational companies as well as small businesses.</p>
            <p><b class="subhead">Entity Formation</b><br>We select and form the right vehicle for the business you actually intend to run &mdash; C corporation, S corporation, limited liability company, limited partnership or joint venture &mdash; weighing tax treatment, investor expectations, liability protection and the cost of ongoing compliance. We handle incorporation, qualification in additional states, and the organisational records that lenders and investors will later ask to see.</p>
            <p><b class="subhead">Governance</b><br>We prepare and maintain bylaws, operating agreements, board and shareholder consents, committee charters and minute books, and we advise directors and officers on fiduciary duties, conflicts of interest, indemnification and the mechanics of acting properly as a board. Good governance is inexpensive to maintain and very expensive to reconstruct.</p>
            <p><b class="subhead">Shareholder and Operating Agreements</b><br>We draft the agreements that decide what happens when owners disagree: voting and control, transfer restrictions, rights of first refusal, tag-along and drag-along rights, buy-sell provisions, valuation mechanics, and departure on death, disability or dispute. These provisions are negotiated best while everyone is still on good terms.</p>
            <p><b class="subhead">Commercial Contracts</b><br>We negotiate the agreements a company runs on &mdash; supply and distribution, licensing, services and SaaS, manufacturing, non-disclosure and employment &mdash; with attention to indemnification, limitation of liability, intellectual property ownership, data protection and termination rights.</p>
            <p><b class="subhead">Cross-Border Counsel</b><br>We represent foreign companies establishing a United States presence and domestic companies expanding abroad, covering entity selection, distribution and agency arrangements, cross-border supply terms, and the movement of goods, services and capital between jurisdictions.</p>
            <p><b class="subhead">Corporate Transactions</b><br>We handle stock and asset purchases, mergers, reorganisations, recapitalisations and dissolutions, from letter of intent and diligence through definitive documents, closing and post-closing adjustments &mdash; including the consents and third-party approvals that most often determine whether a deal closes on schedule.</p>
          </div>
        </div>
      </div>
    </section>
${CTA('Forming or restructuring a company?')}`,
  });
}

function contactPage() {
  return interiorPage({
    path: '/contact',
    current: 'contact',
    jsonld: [
      LEGAL_SERVICE,
      breadcrumb('Contact', '/contact'),
      { '@context': 'https://schema.org', '@type': 'ContactPage', url: `${SITE}/contact`, name: 'Contact', about: { '@id': `${SITE}/#organization` } },
    ],
    hero: `    <div class="contact-spacer"></div>`,
    main: `    <section class="row section--contact-title" aria-labelledby="contact-heading">
      <div class="wrap">
        <div class="col c12">
          <h1 class="page-title page-title--center page-title--flush" id="contact-heading">Contact</h1>
          <div class="divider divider--thick"><hr></div>
        </div>
      </div>
    </section>

    <section class="row section--contact-blocks" aria-label="Contact details">
      <div class="wrap">
        <div class="col c4 contact-block contact-block--phone">
          <div class="cb-body">
            <p><strong>Phone</strong></p>
            <p><a href="${TEL_HREF}">516-946-1706</a></p>
          </div>
        </div>
        <div class="col c4 contact-block contact-block--address">
          <div class="cb-body">
            <p><strong>Address</strong></p>
            <p><span>48 South Service Road</span></p>
            <p><span>Suite 300</span></p>
            <p><span>Melville, New York 11747</span></p>
            <p class="directions"><a href="https://maps.google.com/?q=48+South+Service+Road+Suite+300+Melville+NY+11747" target="_blank" rel="noopener">Get directions</a></p>
          </div>
        </div>
        <div class="col c4 contact-block contact-block--email">
          <div class="cb-body">
            <p><strong>Email</strong></p>
            <p><span>paul@paulrubell.com</span></p>
            <p><span><br></span></p>
          </div>
          <p class="contact-social">
            <a href="mailto:paul@paulrubell.com" aria-label="Email Paul Rubell">${ICON_MAIL('')}</a>
            <a href="https://www.linkedin.com/in/paulrubell/" aria-label="Paul Rubell on LinkedIn" target="_blank" rel="noopener">${ICON_LINKEDIN}</a>
          </p>
        </div>
      </div>
    </section>`,
  });
}

/* ---------------------------------------------------------------- write -- */
const PAGES = [
  ['index.html', homePage()],
  ['about.html', aboutPage()],
  ['practiceareas.html', practiceAreasPage()],
  ['business-law.html', businessLawPage()],
  ['real-estate.html', realEstatePage()],
  ['corporate.html', corporatePage()],
  ['contact.html', contactPage()],
];

mkdirSync(OUT, { recursive: true });
for (const [name, html] of PAGES) {
  writeFileSync(join(OUT, name), html, 'utf8');
  console.log('wrote public/' + name);
}
