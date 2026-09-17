/* Progressive enhancement only — the page is complete and readable without this file.
   Hero entrance, section reveal, hairline draw, numeral count-up, scroll progress,
   schematic grid drift and header compaction, honouring prefers-reduced-motion. */
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

  /* hero entrance — stagger the hero children in on first paint */
  var root = document.documentElement;
  root.classList.add('js-motion');
  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(function () { root.classList.add('hero-in'); });
  });

  /* numeral count-up — "01" ticks up from "00" as its block reveals */
  var animateNumeral = function (el) {
    var target = el.textContent.trim();
    if (!/^\d+$/.test(target)) return;
    var n = parseInt(target, 10), digits = target.length, start = null;
    var tick = function (ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / 600, 1);
      var v = String(Math.round((1 - Math.pow(1 - p, 3)) * n));
      while (v.length < digits) v = '0' + v;
      el.textContent = v;
      if (p < 1) window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  };

  var targets = document.querySelectorAll(
    '.band__head, .pillar, .split, .proof, .step, .person, .cta__copy, .scope li, .enquiry-form .field, .enquiry-form button'
  );
  if (targets.length) {
    targets.forEach(function (el) { el.classList.add('reveal'); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // stagger siblings slightly; never more than 3 steps
        el.style.transitionDelay = (Math.min(i, 3) * 60) + 'ms';
        el.classList.add('is-in');
        el.querySelectorAll('.numeral').forEach(animateNumeral);
        // clear the stagger delay once revealed so hover states respond instantly
        el.addEventListener('transitionend', function onEnd() {
          el.style.transitionDelay = '';
          el.removeEventListener('transitionend', onEnd);
        });
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

    targets.forEach(function (el) { io.observe(el); });
  }

  /* scroll progress — 1px accent hairline along the header's bottom rule */
  var progress = null;
  if (header) {
    progress = document.createElement('div');
    progress.className = 'scroll-progress';
    progress.setAttribute('aria-hidden', 'true');
    header.appendChild(progress);
  }

  /* schematic grid drift — the grid ground moves a fraction slower than the page */
  var plates = document.querySelectorAll('.band--grid, .band--grid-sky');
  var ticking = false;
  var onScrollFrame = function () {
    ticking = false;
    plates.forEach(function (el) {
      var top = el.getBoundingClientRect().top;
      el.style.backgroundPosition = '0px ' + (top * -0.08).toFixed(1) + 'px';
    });
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      progress.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }
  };
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScrollFrame); }
  }, { passive: true });
  onScrollFrame();
})();
