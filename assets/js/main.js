/* Progressive enhancement only — the page is complete and readable without this file.
   Section reveal, hairline draw, schematic grid drift and header compaction,
   honouring prefers-reduced-motion. */
(function () {
  var header = document.querySelector('.site-header');
  if (header) {
    var onHeaderScroll = function () {
      header.classList.toggle('site-header--compact', window.scrollY > 8);
    };
    window.addEventListener('scroll', onHeaderScroll, { passive: true });
    onHeaderScroll();
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  var targets = document.querySelectorAll('.band__head, .pillar, .split, .proof, .step, .person, .cta__copy, .scope li');
  if (targets.length) {
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
  }

  /* schematic grid drift — the grid ground moves a fraction slower than the page */
  var plates = document.querySelectorAll('.band--grid, .band--grid-sky');
  if (plates.length) {
    var ticking = false;
    var drift = function () {
      ticking = false;
      plates.forEach(function (el) {
        var top = el.getBoundingClientRect().top;
        el.style.backgroundPosition = '0px ' + (top * -0.08).toFixed(1) + 'px';
      });
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(drift); }
    }, { passive: true });
    drift();
  }
})();
