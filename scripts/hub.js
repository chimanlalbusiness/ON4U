/* hub.js — lightweight interactions for the homepage HUB v3
   Process steps: hover → activate (no JS-based scroll-locking)
   Location items: click/hover → activate
   Cinematic parallax: desktop-only, pure transform, no scroll hijack.
   No snap, no pinning, no heavy animations.
*/
(function () {
  'use strict';

  /* ── Process Steps ── */
  var processSteps = document.querySelectorAll('.hub-process-step');
  if (processSteps.length) {
    processSteps.forEach(function (step) {
      step.addEventListener('mouseenter', function () {
        processSteps.forEach(function (s) { s.classList.remove('is-active'); });
        step.classList.add('is-active');
      });
    });
  }

  /* ── Location Items ── */
  var locationItems = document.querySelectorAll('.hub-location-item');
  if (locationItems.length) {
    locationItems.forEach(function (item) {
      item.addEventListener('click', function () {
        locationItems.forEach(function (i) { i.classList.remove('is-active'); });
        item.classList.add('is-active');
      });
      item.addEventListener('mouseenter', function () {
        locationItems.forEach(function (i) { i.classList.remove('is-active'); });
        item.classList.add('is-active');
      });
    });
  }

  /* ── Nav dropdown: aria-expanded toggle for keyboard users ── */
  var triggers = document.querySelectorAll('.nav-dropdown-trigger');
  triggers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !expanded);
    });
    document.addEventListener('click', function (e) {
      if (!btn.closest('.nav-dropdown').contains(e.target)) {
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ── Cinematic parallax (DESKTOP ONLY, no scroll hijack) ── *
   * Shifts the ::after pseudo-glow layer using CSS custom props  *
   * via a small translateY on scroll — transform only, 60fps.   */
  var mq = window.matchMedia('(min-width: 900px) and (hover: hover)');
  if (mq.matches) {
    var cineSections = document.querySelectorAll('.hub-cine-section');
    if (cineSections.length) {
      var ticking = false;
      function updateParallax() {
        var sy = window.scrollY;
        cineSections.forEach(function (section) {
          var rect = section.getBoundingClientRect();
          var vH   = window.innerHeight;
          /* Only affect sections near viewport */
          if (rect.bottom < -vH || rect.top > vH * 2) return;
          /* Progress: -1 (above) → 0 (centred) → 1 (below) */
          var prog = (rect.top + rect.height / 2 - vH / 2) / vH;
          /* Subtle shift: max ±24px */
          var shift = prog * 24;
          section.style.setProperty('--cine-shift', shift.toFixed(2) + 'px');
        });
        ticking = false;
      }
      window.addEventListener('scroll', function () {
        if (!ticking) {
          requestAnimationFrame(updateParallax);
          ticking = true;
        }
      }, { passive: true });
      updateParallax(); /* initial */
    }
  }

})();
