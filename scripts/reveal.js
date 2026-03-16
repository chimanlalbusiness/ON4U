/* reveal.js — lightweight entrance animation trigger
   Adds .is-visible to .reveal elements when they enter the viewport.
   Hero items trigger immediately (they're already in view on load).
*/
(function () {
  'use strict';

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  function init() {
    var els = document.querySelectorAll('.reveal');
    els.forEach(function (el) {
      observer.observe(el);
    });

    // Hero elements are always visible on load — trigger immediately
    var heroEls = document.querySelectorAll('.hero .reveal');
    heroEls.forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add('is-visible');
      }, i * 80);
    });

    // Also activate the hero class for hero animations
    var hero = document.querySelector('.hero');
    if (hero) {
      requestAnimationFrame(function () {
        hero.classList.add('is-visible');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
