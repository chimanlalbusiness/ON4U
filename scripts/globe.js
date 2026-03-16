/* ═══════════════════════════════════════════════════════════════
   globe.js — 3D auto-rotating canvas globe for ON4U hero section
   Aesthetic: dark sphere (#0c0c10) + orange accents — matches
   the world-map on the Importação & Exportação page.
   No external dependencies. Pure Canvas 2D + vanilla JS.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Colours (match world-map palette) ───────────────────── */
  var C = {
    sphere:    '#0c0c10',
    sphereEdge:'rgba(249,115,22,0.18)',
    land:      '#161620',
    landEdge:  'rgba(249,115,22,0.35)',
    graticule: 'rgba(249,115,22,0.07)',
    arc:       'rgba(249,115,22,0.55)',
    arcGlow:   'rgba(249,115,22,0.15)',
    dot:       '#f97316',
    dotGlow:   'rgba(249,115,22,0.28)',
    dotHub:    '#ff9a4a',
    label:     'rgba(255,255,255,0.72)',
    atmos:     'rgba(249,115,22,0.08)',
  };

  /* ── Configuration ───────────────────────────────────────── */
  var CFG = {
    rotSpeed: 0.10,      // degrees per 16ms frame
    tilt:     20,        // globe tilt forward (degrees) — shows N.hemisphere more
    startRot: 18,        // initial rotY so Portugal is front-centre
  };

  /* ── Key locations  [lon, lat] ───────────────────────────── */
  var LOCS = [
    { id:'PT',  label:'PT',  lon: -8.5,  lat: 39.5,  hub: true,  r: 5 },
    { id:'STP', label:'STP', lon:  6.7,  lat:  0.3,  hub: false, r: 4 },
    { id:'GW',  label:'GW',  lon:-15.2,  lat: 11.9,  hub: false, r: 4 },
    { id:'CN',  label:'CN',  lon:121.5,  lat: 31.2,  hub: false, r: 4 },
    { id:'IN',  label:'IN',  lon: 72.9,  lat: 19.1,  hub: false, r: 4 },
  ];

  /* ── Simplified continent outlines [lon, lat] ─────────────
     Good enough for a decorative globe at this scale.         */
  var LAND = [
    /* North America */
    [[-168,72],[-140,72],[-100,72],[-80,73],[-65,60],[-55,47],
     [-70,43],[-75,34],[-80,25],[-90,18],[-100,19],[-110,23],
     [-120,30],[-125,40],[-130,55],[-140,58],[-148,62],[-155,60],
     [-165,64],[-168,72]],
    /* Greenland */
    [[-50,83],[-18,78],[-18,72],[-25,68],[-42,65],[-55,68],[-60,75],[-50,83]],
    /* South America */
    [[-80,12],[-60,15],[-55,10],[-50,0],[-35,-5],[-35,-12],[-40,-22],
     [-45,-30],[-55,-38],[-68,-56],[-72,-50],[-75,-35],[-80,-5],[-80,12]],
    /* Europe */
    [[-9,37],[-2,36],[3,37],[7,38],[15,38],[28,42],[30,46],[28,56],
     [22,56],[14,56],[9,54],[2,51],[-2,54],[-5,48],[-8,44],[-9,37]],
    /* Scandinavia */
    [[5,58],[15,56],[20,58],[28,65],[30,70],[24,70],[15,68],[8,63],[5,58]],
    /* Africa */
    [[-5,37],[10,37],[20,34],[30,30],[37,27],[43,12],[45,10],[42,2],
     [41,-3],[40,-11],[35,-24],[27,-34],[18,-35],[13,-29],[12,-18],
     [10,-8],[5,2],[-5,2],[-17,14],[-17,20],[-13,28],[-5,37]],
    /* Madagascar */
    [[43,-13],[50,-16],[50,-25],[44,-25],[43,-22],[43,-13]],
    /* Asia main */
    [[28,42],[40,42],[50,30],[55,25],[65,24],[75,20],[80,8],[90,22],
     [95,22],[102,22],[108,18],[115,22],[120,30],[125,35],[130,42],
     [140,42],[150,46],[150,52],[142,60],[130,68],[100,72],[80,70],
     [64,68],[40,68],[28,60],[28,42]],
    /* Indian subcontinent */
    [[65,24],[78,8],[80,8],[88,22],[80,28],[72,22],[65,24]],
    /* SE Asia peninsula */
    [[100,22],[102,6],[104,2],[108,2],[110,2],[116,4],[120,10],
     [116,22],[110,18],[102,22],[100,22]],
    /* Japan (simplified) */
    [[130,31],[136,36],[140,42],[142,44],[140,46],[132,44],[130,31]],
    /* Australia */
    [[114,-22],[119,-14],[128,-14],[136,-12],[140,-18],[148,-20],
     [152,-25],[153,-28],[150,-38],[140,-38],[130,-35],[118,-30],
     [114,-22]],
    /* UK (simplified) */
    [[-5,50],[2,51],[2,53],[-2,58],[-6,58],[-5,55],[-3,53],[-5,50]],
    /* Iceland */
    [[-25,65],[-13,66],[-13,63],[-18,63],[-22,63],[-25,65]],
  ];

  /* ── Math helpers ────────────────────────────────────────── */
  function rad(d) { return d * Math.PI / 180; }

  /* Project lon/lat to screen (x,y) with rotY + tilt applied */
  function project(lon, lat, rotY) {
    var lonR = rad(lon), latR = rad(lat), rotYR = rad(rotY), tiltR = rad(CFG.tilt);
    /* Cartesian */
    var x0 = Math.cos(latR) * Math.cos(lonR);
    var y0 = Math.sin(latR);
    var z0 = Math.cos(latR) * Math.sin(lonR);
    /* Y-rotation (globe spin) */
    var x1 = x0 * Math.cos(rotYR) + z0 * Math.sin(rotYR);
    var y1 = y0;
    var z1 = -x0 * Math.sin(rotYR) + z0 * Math.cos(rotYR);
    /* X-tilt */
    var y2 = y1 * Math.cos(tiltR) - z1 * Math.sin(tiltR);
    var z2 = y1 * Math.sin(tiltR) + z1 * Math.cos(tiltR);
    /* Orthographic project */
    return { sx: CX + x1 * R, sy: CY - y2 * R, vis: z2 > -0.05 };
  }

  /* Lon/lat → unit 3D vector (un-rotated) */
  function toXYZ(lon, lat) {
    var lonR = rad(lon), latR = rad(lat);
    return { x: Math.cos(latR)*Math.cos(lonR), y: Math.sin(latR), z: Math.cos(latR)*Math.sin(lonR) };
  }

  /* Great-circle intermediate lon/lat points between two locations */
  function gcPoints(lon1, lat1, lon2, lat2, n) {
    var p1 = toXYZ(lon1, lat1), p2 = toXYZ(lon2, lat2);
    var pts = [];
    for (var i = 0; i <= n; i++) {
      var t  = i / n;
      var x  = p1.x + (p2.x - p1.x) * t;
      var y  = p1.y + (p2.y - p1.y) * t;
      var z  = p1.z + (p2.z - p1.z) * t;
      var l  = Math.sqrt(x*x + y*y + z*z);
      pts.push([Math.atan2(z/l, x/l) * 180/Math.PI, Math.asin(y/l) * 180/Math.PI]);
    }
    return pts;
  }

  /* ── Canvas state ────────────────────────────────────────── */
  var canvas, ctx, W, H, CX, CY, R, rotY = CFG.startRot, animId, lastT = 0;

  /* ── Draw functions ──────────────────────────────────────── */
  function drawSphere() {
    /* Base fill (radial gradient for depth) */
    var g = ctx.createRadialGradient(CX - R*0.28, CY - R*0.28, R*0.04, CX, CY, R*1.02);
    g.addColorStop(0, '#1a1a26');
    g.addColorStop(0.65, '#0e0e16');
    g.addColorStop(1, '#08080d');
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI*2);
    ctx.fillStyle = g;
    ctx.fill();
    /* Rim specular highlight */
    var rim = ctx.createRadialGradient(CX, CY, R*0.9, CX, CY, R*1.01);
    rim.addColorStop(0, 'transparent');
    rim.addColorStop(1, C.sphereEdge);
    ctx.beginPath();
    ctx.arc(CX, CY, R*1.01, 0, Math.PI*2);
    ctx.strokeStyle = C.sphereEdge;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawAtmosphere() {
    var g = ctx.createRadialGradient(CX, CY, R*0.96, CX, CY, R*1.14);
    g.addColorStop(0, C.atmos);
    g.addColorStop(0.5, 'rgba(249,115,22,0.03)');
    g.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(CX, CY, R*1.14, 0, Math.PI*2);
    ctx.fillStyle = g;
    ctx.fill();
  }

  function drawGraticule() {
    ctx.strokeStyle = C.graticule;
    ctx.lineWidth = 0.6;
    var lon, lat, p, first;
    /* Longitude lines every 30° */
    for (lon = -180; lon < 180; lon += 30) {
      ctx.beginPath(); first = true;
      for (lat = -90; lat <= 90; lat += 3) {
        p = project(lon, lat, rotY);
        if (!p.vis) { first = true; continue; }
        if (first) { ctx.moveTo(p.sx, p.sy); first = false; } else ctx.lineTo(p.sx, p.sy);
      }
      ctx.stroke();
    }
    /* Latitude lines every 30° */
    for (lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath(); first = true;
      for (lon = -180; lon <= 180; lon += 3) {
        p = project(lon, lat, rotY);
        if (!p.vis) { first = true; continue; }
        if (first) { ctx.moveTo(p.sx, p.sy); first = false; } else ctx.lineTo(p.sx, p.sy);
      }
      ctx.stroke();
    }
  }

  function drawLand() {
    LAND.forEach(function(poly) {
      var pts = poly.map(function(pt) { return project(pt[0], pt[1], rotY); });
      if (!pts.some(function(p) { return p.vis; })) return;
      ctx.beginPath();
      var first = true;
      pts.forEach(function(p) {
        if (!p.vis) { first = true; return; }
        if (first) { ctx.moveTo(p.sx, p.sy); first = false; } else ctx.lineTo(p.sx, p.sy);
      });
      ctx.closePath();
      ctx.fillStyle = C.land;
      ctx.fill();
      ctx.strokeStyle = C.landEdge;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });
  }

  function drawArcs() {
    var hub = LOCS[0];
    LOCS.slice(1).forEach(function(loc) {
      var pts = gcPoints(hub.lon, hub.lat, loc.lon, loc.lat, 64);
      var projected = pts.map(function(pt) { return project(pt[0], pt[1], rotY); });

      /* Glow pass (wider, transparent) */
      ctx.lineWidth = 3;
      ctx.strokeStyle = C.arcGlow;
      ctx.setLineDash([]);
      ctx.beginPath();
      var first = true;
      projected.forEach(function(p) {
        if (!p.vis) { first = true; return; }
        if (first) { ctx.moveTo(p.sx, p.sy); first = false; } else ctx.lineTo(p.sx, p.sy);
      });
      ctx.stroke();

      /* Main arc (dashed) */
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = C.arc;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      first = true;
      projected.forEach(function(p) {
        if (!p.vis) { first = true; return; }
        if (first) { ctx.moveTo(p.sx, p.sy); first = false; } else ctx.lineTo(p.sx, p.sy);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  function drawLocations(t) {
    LOCS.forEach(function(loc) {
      var p = project(loc.lon, loc.lat, rotY);
      if (!p.vis) return;

      /* Glow ring */
      var glowR = loc.r + 6 + (loc.hub ? 4 * Math.sin(t * 0.0025) : 0);
      var g = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, glowR + 4);
      g.addColorStop(0, 'rgba(249,115,22,0.45)');
      g.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, glowR + 4, 0, Math.PI*2);
      ctx.fillStyle = g;
      ctx.fill();

      /* Dot */
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, loc.r, 0, Math.PI*2);
      ctx.fillStyle = loc.hub ? C.dotHub : C.dot;
      ctx.fill();

      /* Hub pulse ring */
      if (loc.hub) {
        var pr = loc.r + 4 + 3 * Math.sin(t * 0.003);
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, pr, 0, Math.PI*2);
        ctx.strokeStyle = 'rgba(249,115,22,0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      /* Label */
      ctx.font = 'bold 9px Inter,sans-serif';
      ctx.fillStyle = C.label;
      ctx.fillText(loc.label, p.sx + loc.r + 4, p.sy + 3.5);
    });
  }

  /* ── Master render ───────────────────────────────────────── */
  function render(t) {
    ctx.clearRect(0, 0, W, H);

    /* Clip to sphere + small atmosphere margin */
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, R * 1.12, 0, Math.PI*2);
    ctx.clip();

    drawSphere();
    drawGraticule();
    drawLand();
    drawArcs();
    drawLocations(t);

    ctx.restore();

    /* Atmosphere drawn outside clip */
    drawAtmosphere();
  }

  /* ── Animation loop ──────────────────────────────────────── */
  function loop(t) {
    animId = requestAnimationFrame(loop);
    var dt = lastT ? Math.min(t - lastT, 50) : 16.67;
    lastT = t;
    rotY += CFG.rotSpeed * (dt / 16.67);
    render(t);
  }

  /* ── Sizing ──────────────────────────────────────────────── */
  function resize() {
    if (!canvas) return;
    var dpr  = window.devicePixelRatio || 1;
    var rect = canvas.parentElement.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    if (W < 1 || H < 1) return; /* not laid out yet */
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
    CX = W / 2;
    CY = H / 2;
    /* Radius is 88% of the smaller dimension, centred */
    R  = Math.min(W, H) * 0.44;
  }

  /* ── Init ────────────────────────────────────────────────── */
  function init() {
    canvas = document.getElementById('heroGlobe');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    resize();
    /* Retry if parent has no size yet (e.g. display:none until reveal) */
    if (!R) {
      setTimeout(init, 120);
      return;
    }

    window.addEventListener('resize', function () {
      resize();
    });

    /* Pause when tab hidden to save resources */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(animId);
        lastT = 0;
      } else {
        animId = requestAnimationFrame(loop);
      }
    });

    animId = requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
