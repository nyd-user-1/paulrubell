/* Paul Rubell, Attorney At Law, P.C.
   Minimal behaviour: mobile drawer + the Practice Areas dropdown.
   Desktop hover is handled in CSS; this adds tap/keyboard support. */
(function () {
  'use strict';

  var drawer = document.getElementById('mobile-drawer');
  var overlay = document.querySelector('.drawer-overlay');
  var burger = document.querySelector('.hamburger');

  function setDrawer(open) {
    if (!drawer || !burger) return;
    drawer.classList.toggle('is-open', open);
    if (overlay) overlay.classList.toggle('is-visible', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }

  if (burger) {
    burger.addEventListener('click', function () {
      setDrawer(burger.getAttribute('aria-expanded') !== 'true');
    });
  }
  if (overlay) overlay.addEventListener('click', function () { setDrawer(false); });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    setDrawer(false);
    Array.prototype.forEach.call(
      document.querySelectorAll('.has-sub.is-open'),
      function (li) { closeSub(li); }
    );
  });

  /* ---- Practice Areas submenu ------------------------------------------ */
  function closeSub(li) {
    li.classList.remove('is-open');
    var t = li.querySelector('[aria-expanded]');
    if (t) t.setAttribute('aria-expanded', 'false');
  }
  function openSub(li) {
    li.classList.add('is-open');
    var t = li.querySelector('[aria-expanded]');
    if (t) t.setAttribute('aria-expanded', 'true');
  }

  Array.prototype.forEach.call(document.querySelectorAll('.has-sub'), function (li) {
    var link = li.querySelector(':scope > a');

    /* Hover and keyboard focus are handled in CSS. On touch devices the first
       tap on the parent link opens the submenu; a second tap follows the link. */
    if (link) {
      link.addEventListener('click', function (e) {
        var coarse = window.matchMedia('(hover: none)').matches;
        if (coarse && !li.classList.contains('is-open')) {
          e.preventDefault();
          openSub(li);
        }
      });
    }
  });

  /* Close any open desktop submenu when focus or pointer leaves the nav. */
  document.addEventListener('click', function (e) {
    Array.prototype.forEach.call(document.querySelectorAll('.has-sub.is-open'), function (li) {
      if (!li.contains(e.target)) closeSub(li);
    });
  });
}());

/* Home hero: two-slide background rotation (3s cadence, 0.8s slide-up),
   matching the live site. Skipped when the visitor prefers reduced motion. */
(function () {
  'use strict';
  var wrap = document.querySelector('.hero-slides');
  if (!wrap) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var slides = wrap.querySelectorAll('.hero-slide');
  if (slides.length < 2) return;

  var i = 0;
  setTimeout(function tick() {
    var current = slides[i];
    var next = slides[(i + 1) % slides.length];
    next.classList.remove('is-leaving');
    next.style.transform = 'translateY(100%)';
    /* force a reflow so the starting position is committed before animating */
    void next.offsetWidth;
    wrap.classList.add('is-animating');
    next.style.transform = '';
    next.classList.add('is-active');
    current.classList.remove('is-active');
    current.classList.add('is-leaving');
    i = (i + 1) % slides.length;
    setTimeout(tick, 3000);
  }, 2100);
}());

/* Interior page hero parallax. The live site drifts the hero background by up
   to 100px as the band travels through the viewport; formula derived from its
   computed background-position at a range of scroll offsets. */
(function () {
  'use strict';
  var el = document.querySelector('.page-hero--parallax');
  if (!el) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  /* The mobile layout pins this background; only the desktop layout drifts. */
  var desktop = window.matchMedia('(min-width: 768px)');
  if (!desktop.matches) return;

  var ticking = false;
  function place() {
    ticking = false;
    var r = el.getBoundingClientRect();
    var k = 200 / (window.innerHeight + r.height);
    var y = Math.min(0, Math.max(-100, k * (r.top + r.height) - 100));
    el.style.backgroundPosition = '50% ' + y.toFixed(2) + 'px';
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(place);
  }
  place();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}());
