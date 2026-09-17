/* Progressive enhancement only — the page is complete and readable without this file.
   Section reveal on scroll, honouring prefers-reduced-motion. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  var targets = document.querySelectorAll('.hero, .band__head, .split__head, .prose, .pillar, .proof, .step, .person, .cta__copy');
  if (!targets.length) return;

  targets.forEach(function (el) { el.classList.add('reveal'); });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, i) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      // stagger siblings slightly; never more than 3 steps
      el.style.transitionDelay = (Math.min(i, 3) * 60) + 'ms';
      el.classList.add('is-in');
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

  targets.forEach(function (el) { io.observe(el); });

  // schematic grid crawl-in on navy plates
  var grids = document.querySelectorAll('.band--grid');
  if (grids.length) {
    grids.forEach(function (el) { el.classList.add('grid-anim'); });
    var gio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('grid-in');
        gio.unobserve(entry.target);
      });
    }, { threshold: 0.05 });
    grids.forEach(function (el) { gio.observe(el); });
  }
})();
