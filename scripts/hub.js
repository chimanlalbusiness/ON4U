/* hub.js — lightweight interactions for the homepage HUB v3
   Process steps: hover → activate (no JS-based scroll-locking)
   Location items: click/hover → activate
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
    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!btn.closest('.nav-dropdown').contains(e.target)) {
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

})();
