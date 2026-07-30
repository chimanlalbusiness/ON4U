/* ══════════════════════════════════════════════════════════════
   FAN CAROUSEL — vanilla, no dependencies.

   Lays `.fan-card` children of a `[data-fan]` container on an arc:
   the centre card is upright and full-size, its neighbours rotate,
   shrink and drop away symmetrically. Hovering a card lifts it and
   pushes its neighbours aside; the arrows/dots rotate which card
   sits at centre.

   Markup:
     <div class="fan" data-fan data-fan-variant="photo" data-fan-spread="30">
       <a class="fan-card">…</a> …
     </div>

   data-fan-spread — half-width of the arc in rem at desktop.
   Motion is written to inline transforms; the easing lives in CSS,
   so `prefers-reduced-motion` collapses the whole thing to a grid.
   ══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MAX_VISIBLE = 7;

  /* Slot geometry for a full 7-card arc. x is normalised to -1..1 so
     `data-fan-spread` can widen or tighten the arc per variant. */
  var FAN = [
    { rot: -21, scale: 0.776, x: -1.000, y: 7.3, z: 1 },
    { rot: -14, scale: 0.850, x: -0.733, y: 4.0, z: 2 },
    { rot: -7,  scale: 0.935, x: -0.367, y: 1.3, z: 3 },
    { rot: 0,   scale: 1.000, x:  0.000, y: 0.0, z: 10 },
    { rot: 7,   scale: 0.935, x:  0.367, y: 1.3, z: 3 },
    { rot: 14,  scale: 0.850, x:  0.733, y: 4.0, z: 2 },
    { rot: 21,  scale: 0.776, x:  1.000, y: 7.3, z: 1 }
  ];

  /* Fewer than 7 cards: derive the same curve from the slot's distance
     to centre, spanning a symmetric -1..1 (an even count still fans
     evenly — no lopsided arc). */
  function slotConfig(count, slot) {
    if (count >= MAX_VISIBLE) return FAN[slot];
    var half = (count - 1) / 2;
    var d = half > 0 ? (slot - half) / half : 0;
    var ad = Math.abs(d);
    return {
      rot: d * 21,
      scale: 1 - 0.2244 * ad * ad,
      x: d,
      y: ad * ad * 7.3,
      z: 10 - Math.round(ad * 4)
    };
  }

  function build(root) {
    var cards = [].slice.call(root.querySelectorAll(".fan-card"));
    var total = cards.length;
    if (!total) return;

    var spread = parseFloat(root.getAttribute("data-fan-spread")) || 30;
    var tilt = parseFloat(root.getAttribute("data-fan-tilt"));
    var drop = parseFloat(root.getAttribute("data-fan-drop"));
    if (isNaN(tilt)) tilt = 1;   // rotation scale — wide cards want less
    if (isNaN(drop)) drop = 1;   // vertical spread scale

    /* A 7-card arc needs width to read as an arc — on a phone it just
       stacks into a pile. Show fewer cards instead of squashing them;
       the arrows still reach every card. */
    function visibleCount() {
      var w = window.innerWidth;
      return Math.min(total, w < 640 ? 3 : (w < 1024 ? 5 : MAX_VISIBLE));
    }
    var count = visibleCount();

    /* Fit the arc to the container rather than to viewport breakpoints:
       measure how far the outermost card can sit before its rotated,
       scaled bounding box leaves the frame. Keeps the fan intact at
       every width without a table of magic numbers. */
    function metrics() {
      var remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      var w = cards[0].offsetWidth, h = cards[0].offsetHeight;   // layout size, transform-independent
      var outer = slotConfig(count, count - 1);
      var rad = Math.abs(outer.rot * tilt) * Math.PI / 180;
      var sin = Math.sin(rad), cos = Math.cos(rad);
      var halfW = (w * cos + h * sin) * outer.scale / 2;
      var halfH = (w * sin + h * cos) * outer.scale / 2;

      var mx = 1, my = 1;
      if (spread > 0) mx = (root.clientWidth / 2 - halfW) * 0.98 / (spread * remPx);
      var maxY = 7.3 * drop * remPx;
      if (maxY > 0) my = (root.clientHeight / 2 - halfH) / maxY;

      return {
        x: Math.max(0, Math.min(1, mx)),
        y: Math.max(0, Math.min(1, my))
      };
    }
    var centerIndex = count >> 1;
    var hovered = null;
    var entered = false;
    var busy = false;
    var leaveTimer = null;
    var map = {};

    /* cardIndex → slot, windowed around the current centre. When every
       card fits, this still runs: cycling just rotates the assignment. */
    function remap() {
      map = {};
      var half = count >> 1;
      for (var s = 0; s < count; s++) {
        map[((centerIndex + s - half) % total + total) % total] = s;
      }
    }

    function write(card, st, instant, delay) {
      if (instant) card.style.transition = "none";
      else card.style.transitionDelay = (delay || 0) + "ms";

      card.style.transform =
        "translate(-50%,-50%) translate(" + st.x.toFixed(2) + "rem," + st.y.toFixed(2) + "rem)" +
        " rotate(" + st.rot.toFixed(2) + "deg) scale(" + st.scale.toFixed(3) + ")";
      card.style.opacity = st.op;
      card.style.zIndex = st.z;

      if (instant) {
        void card.offsetWidth;      // flush, so the next write animates
        card.style.transition = "";
      }
    }

    /* Resting arc position for a slot, plus the hover displacement. */
    function state(slot, hov) {
      var m = metrics();
      var base = slotConfig(count, slot);
      var st = {
        x: base.x * spread * m.x,
        y: base.y * drop * m.y,
        rot: base.rot * tilt,
        scale: base.scale,
        z: base.z,
        op: 1
      };
      if (hov === null) return st;

      var centerSlot = (count - 1) / 2;
      var dist = Math.abs(slot - hov);

      if (slot === hov) {
        st.y -= 2.5 * Math.max(m.y, 0.45);   // lift the hovered card clear
        st.scale *= 1.08;
        st.z = 20;
        return st;
      }
      // neighbours fan outward — hardest next to the cursor, and the
      // arc's ends barely move (they have nowhere to go).
      var norm = centerSlot > 0 ? (slot - centerSlot) / centerSlot : 0;
      var push = 8 * (1 - Math.abs(norm)) * (1 + 0.2 * Math.max(0, 3 - dist)) * (spread / 30) * m.x * 0.34;
      if (slot < hov) { st.x -= push; st.rot -= 3 / (dist + 1); }
      else            { st.x += push; st.rot += 3 / (dist + 1); }
      return st;
    }

    function layout(instant) {
      cards.forEach(function (card, i) {
        var slot = map[i];
        if (slot === undefined) {
          // parked off-arc: keep it invisible and out of the way
          write(card, { x: 0, y: 0, rot: 0, scale: 0.5, z: 0, op: 0 }, instant, 0);
          card.setAttribute("aria-hidden", "true");
          card.tabIndex = -1;
          return;
        }
        card.removeAttribute("aria-hidden");
        card.removeAttribute("tabindex");
        var delay = hovered === null
          ? Math.abs(slot - (count - 1) / 2) * 20
          : Math.abs(slot - hovered) * 20;
        write(card, state(slot, hovered), instant, delay);
      });
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === centerIndex); });
    }

    /* ── controls ─────────────────────────────────────────────── */
    var dots = [];
    var nav = null;

    if (total > 1) {
      nav = document.createElement("div");
      nav.className = "fan-nav";

      var prev = arrow("left", "Anterior");
      var dotWrap = document.createElement("div");
      dotWrap.className = "fan-dots";
      var next = arrow("right", "Seguinte");

      cards.forEach(function (_, i) {
        var d = document.createElement("button");
        d.type = "button";
        d.className = "fan-dot";
        d.setAttribute("aria-label", "Ir para o item " + (i + 1));
        d.addEventListener("click", function () { go(i); });
        dotWrap.appendChild(d);
        dots.push(d);
      });

      prev.addEventListener("click", function () { step(-1); });
      next.addEventListener("click", function () { step(1); });
      nav.appendChild(prev);
      nav.appendChild(dotWrap);
      nav.appendChild(next);
      root.parentNode.insertBefore(nav, root.nextSibling);
    }

    function arrow(dir, label) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "fan-arrow";
      b.setAttribute("aria-label", label);
      b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" ' +
        'stroke-linecap="round" stroke-linejoin="round"><polyline points="' +
        (dir === "left" ? "15 18 9 12 15 6" : "9 18 15 12 9 6") + '"/></svg>';
      return b;
    }

    function step(dir) {
      go(((centerIndex + dir) % total + total) % total);
    }

    function go(i) {
      if (busy || i === centerIndex) return;
      busy = true;
      centerIndex = i;
      hovered = null;
      remap();
      layout(false);
      setTimeout(function () { busy = false; }, 260);
    }

    /* ── hover ────────────────────────────────────────────────── */
    cards.forEach(function (card, i) {
      card.addEventListener("mouseenter", function () {
        if (busy || REDUCE) return;
        if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
        var slot = map[i];
        if (slot === undefined || slot === hovered) return;
        hovered = slot;
        layout(false);
      });
    });

    root.addEventListener("mouseleave", function () {
      if (busy || REDUCE || hovered === null) return;
      if (leaveTimer) clearTimeout(leaveTimer);
      leaveTimer = setTimeout(function () { hovered = null; layout(false); }, 60);
    });

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (busy) return;
        var next = visibleCount();
        if (next !== count) { count = next; remap(); }   // crossed a breakpoint
        layout(true);
      }, 120);
    }, { passive: true });

    /* ── entry ────────────────────────────────────────────────── */
    remap();

    if (REDUCE) {                       // CSS already flattened it to a grid
      cards.forEach(function (c) { c.style.opacity = 1; });
      return;
    }

    // seed every card low, small and invisible, then deal them onto
    // the arc when the fan scrolls into view
    cards.forEach(function (card, i) {
      var slot = map[i];
      write(card, { x: 0, y: 9, rot: 0, scale: 0.5, z: slot === undefined ? 0 : 1, op: 0 }, true, 0);
    });

    function deal() {
      if (entered) return;
      entered = true;
      cards.forEach(function (card, i) {
        var slot = map[i];
        if (slot === undefined) return;
        card.style.transitionDuration = "1s";
        write(card, state(slot, null), false, 120 + slot * 70);
        setTimeout(function () { card.style.transitionDuration = ""; }, 1400);
      });
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === centerIndex); });
    }

    if (!("IntersectionObserver" in window)) { deal(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { deal(); io.disconnect(); }
      });
    }, { threshold: 0.2 });
    io.observe(root);
  }

  function init() {
    [].forEach.call(document.querySelectorAll("[data-fan]"), build);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
