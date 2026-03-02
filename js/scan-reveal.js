/**
 * Architectural Reveal: scan-line clip-path on h1/h2 via GSAP ScrollTrigger
 * clip-path: inset(0 100% 0 0) -> inset(0 0 0 0), 1.5s power2.inOut, trigger top 85%
 */
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  var headers = document.querySelectorAll('h1, h2');
  headers.forEach(function (el) {
    gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)' }, {
      clipPath: 'inset(0 0 0 0)',
      duration: 1.5,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true
      },
      onStart: function () { el.style.willChange = 'clip-path'; },
      onComplete: function () { el.style.willChange = 'auto'; }
    });
  });
})();
