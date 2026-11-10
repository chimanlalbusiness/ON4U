/* ══════════════════════════════════════════════════════════════
   Catálogo ON4U (catalogo.html)
   Loads /catalogo/data/index.json — built from the Databox feed by
   scripts/catalogo/build.mjs — and searches/filters it in the browser.
   The request list lives in localStorage; pedido.html turns it into the
   quote request. Quote-only: there are no prices in the data.
   Supplier text is always inserted with textContent, never as HTML.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var DATA = '/catalogo/data/';
  var PER_PAGE = 36;
  var CART_KEY = 'on4u-catalogo-pedido';
  var STOCK = { 1: 'Disponível', 2: 'Em reposição', 3: 'Por encomenda' };
  var STOCK_RANK = { 1: 0, 2: 1, 3: 2 };

  /* line icons for products without a photo, chosen by category */
  var ICONS = {
    laptop: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
    monitor: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M9 20h6M12 16v4"/>',
    tv: '<rect x="2" y="4" width="20" height="13" rx="1.5"/><path d="M8 21h8"/>',
    projector: '<rect x="2" y="8" width="20" height="9" rx="2"/><circle cx="16" cy="12.5" r="2.5"/><path d="M6 12.5h4"/>',
    phone: '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M11 18h2"/>',
    keyboard: '<rect x="2" y="7" width="20" height="10" rx="1.5"/><path d="M6 10.5h.01M9.5 10.5h.01M13 10.5h.01M16.5 10.5h.01M7 13.8h10"/>',
    headphones: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
    printer: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="1.5"/><path d="M7 14h10v7H7z"/>',
    router: '<rect x="3" y="13" width="18" height="6" rx="1.5"/><path d="M7 16h.01M11 16h.01M16 9.5a5 5 0 0 0-8 0M18.8 6.8a9 9 0 0 0-13.6 0"/>',
    server: '<rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><path d="M7 7.5h.01M7 16.5h.01M11 7.5h6M11 16.5h6"/>',
    disk: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3.5"/><path d="M17.5 16.5h.01"/>',
    chip: '<rect x="6" y="6" width="12" height="12" rx="1.5"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
    camera: '<circle cx="12" cy="10" r="6"/><circle cx="12" cy="10" r="2"/><path d="M8 20h8M12 16v4"/>',
    shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3z"/><path d="m9 12 2 2 4-4"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
    plug: '<path d="M8 3v4M16 3v4M6 7h12v4a6 6 0 0 1-12 0V7zM12 17v4"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
    bag: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>',
    gamepad: '<path d="M6 9h12a4 4 0 0 1 0 8c-1.5 0-2.3-1-3-2H9c-.7 1-1.5 2-3 2a4 4 0 0 1 0-8z"/><path d="M8 11v3M6.5 12.5h3M15.5 12h.01M17.5 14h.01"/>',
    pin: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    home: '<path d="M3 11 12 4l9 7v9H3z"/><path d="M9 20v-6h6v6"/>',
    code: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m9 10-2 2 2 2M15 10l2 2-2 2"/>',
    appliance: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M5 9h14M8 6h.01"/>',
    doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/>',
    card: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 14h.01M11 14h6"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5V8z"/><path d="m3 8 9 5 9-5M12 13v8"/>'
  };
  var GROUP_ICON = {
    'computadores': 'laptop', 'acessorios-portateis': 'laptop', 'monitores': 'monitor', 'suportes': 'monitor',
    'tvs': 'tv', 'home-cinema': 'tv', 'digital-signage': 'tv', 'quadros-interativos': 'tv', 'av-pro-division': 'tv',
    'videoprojetores': 'projector', 'telemoveis': 'phone', 'tablets': 'phone', 'acessorios-mobile': 'phone', 'mobilidade': 'phone',
    'ratos-teclados': 'keyboard', 'audio-e-multimedia': 'headphones', 'impressoras': 'printer', 'multifuncoes': 'printer',
    'consumiveis': 'printer', 'scanners': 'printer', 'networking': 'router', 'comunicacoes': 'phone',
    'integracao': 'chip' /* Databox: PC components (cases, coolers, drives…) */, 'gadgets': 'gamepad', 'mobilidade': 'pin',
    'servidores': 'server', 'discos-rigidos': 'disk', 'backups': 'disk', 'memorias': 'chip', 'processadores': 'chip',
    'cameras': 'camera', 'vigilancia': 'camera', 'seguranca': 'shield', 'extensoes-garantia': 'shield',
    'ups': 'bolt', 'energia': 'bolt', 'material-electrico': 'plug', 'cabos': 'plug', 'iluminacao': 'bulb',
    'malas-de-transporte': 'bag', 'gaming': 'gamepad', 'gps': 'pin', 'smart-home': 'home', 'software': 'code',
    'eletrodomesticos': 'appliance', 'material-escritorio': 'doc', 'pos-ponto-de-venda': 'card'
  };

  var $ = function (id) { return document.getElementById(id); };
  var grid = $('cat-grid');
  if (!grid) return;

  var D = null;                                    // catalogue data
  var S = { q: '', g: -1, t: -1, b: -1, st: [1, 2, 3], sort: 'stock', limit: PER_PAGE };
  var tokens = [];
  var results = [];
  var openEan = '';
  var cart = loadCart();

  /* ── helpers ─────────────────────────────────────────────── */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function txt(s) { return document.createTextNode(s); }
  function fold(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function slugify(s) { return fold(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function fmt(n) { return Number(n).toLocaleString('pt-PT'); }
  function fmtDate(iso) {
    var d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
    return isNaN(d) ? '' : d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  function tr(s) { return (window.on4uTranslate || String)(s); }

  // Must match bucketOf() in scripts/catalogo/build.mjs.
  function bucketOf(ean, n) {
    var h = 0x811c9dc5;
    for (var i = 0; i < ean.length; i++) { h ^= ean.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
    return (h >>> 0) % n;
  }

  var iconCache = {};
  function icon(key) {
    if (!iconCache[key]) {
      var tpl = document.createElement('template');
      tpl.innerHTML = '<svg class="cat-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[key] || ICONS.box) + '</svg>';
      iconCache[key] = tpl.content.firstChild;
    }
    return iconCache[key].cloneNode(true);
  }
  // A type can sit in several groups; the smallest group is the most
  // specific one (e.g. "Switch" → Networking rather than Acessórios).
  var typeIcon = [];
  function iconKeyOf(t) {
    if (typeIcon[t]) return typeIcon[t];
    var gs = (D.typeGroups[t] || []).slice().sort(function (a, b) { return D.groups[a].types.length - D.groups[b].types.length; });
    var key = 'box';
    for (var i = 0; i < gs.length; i++) { var k = GROUP_ICON[D.groups[gs[i]].id]; if (k) { key = k; break; } }
    return (typeIcon[t] = key);
  }
  function fillPlate(plate, photo, iconKey, alt) {
    plate.replaceChildren();
    if (!photo) { plate.appendChild(icon(iconKey)); return; }
    var img = new Image();
    img.decoding = 'async';
    img.loading = 'lazy';
    img.alt = alt;
    img.addEventListener('error', function () { plate.replaceChildren(icon(iconKey)); }, { once: true });
    img.src = D.photoBase + photo + '.webp';
    plate.appendChild(img);
  }
  function stockBadge(s) {
    var b = el('span', 'cat-stock');
    b.appendChild(el('i', 'cat-dot cat-dot--' + s));
    b.appendChild(el('span', null, STOCK[s]));
    return b;
  }

  /* ── load ────────────────────────────────────────────────── */
  renderSkeleton();
  fetch(DATA + 'index.json')
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(init)
    .catch(function (e) {
      console.error('Catálogo:', e);
      grid.replaceChildren();
      $('cat-count').replaceChildren();
      $('cat-error').hidden = false;
    });

  function init(raw) {
    D = {
      photoBase: raw.photoBase,
      buckets: raw.buckets,
      updated: raw.updated,
      groups: raw.groups.map(function (g, i) { return { i: i, id: g.id, name: g.name, types: g.types, typeSet: new Set(g.types) }; }),
      types: raw.types.map(function (n) { return { name: n, slug: slugify(n) }; }),
      brands: raw.brands.map(function (n) { return { name: n, slug: slugify(n) }; }),
      items: raw.items.map(function (r, i) { return { idx: i, ean: r[0], name: r[1], pn: r[2], b: r[3], t: r[4], s: r[5], photo: r[6] }; })
    };
    D.typeGroups = D.types.map(function () { return []; });
    D.groups.forEach(function (g) { g.types.forEach(function (t) { D.typeGroups[t].push(g.i); }); });
    D.byEan = new Map(D.items.map(function (it) { return [it.ean, it]; }));
    D.groupById = new Map(D.groups.map(function (g) { return [g.id, g.i]; }));
    D.typeBySlug = new Map(); D.types.forEach(function (t, i) { if (!D.typeBySlug.has(t.slug)) D.typeBySlug.set(t.slug, i); });
    D.brandBySlug = new Map(); D.brands.forEach(function (b, i) { if (!D.brandBySlug.has(b.slug)) D.brandBySlug.set(b.slug, i); });

    var facts = $('cat-facts');
    facts.replaceChildren(
      fact(fmt(D.items.length), 'artigos'),
      fact(fmt(D.brands.length), 'marcas'),
      factRev('Atualizado a', fmtDate(D.updated))
    );

    readUrl();
    bindUi();
    update();
    renderCart();
    if (openEan) openDetail(openEan, null);
  }
  function fact(b, label) { var li = el('li'); li.appendChild(el('b', null, b)); li.appendChild(txt(' ')); li.appendChild(el('span', null, label)); return li; }
  function factRev(label, b) { var li = el('li'); li.appendChild(el('span', null, label)); li.appendChild(txt(' ')); li.appendChild(el('b', null, b)); return li; }

  /* ── URL state: q, g (categoria), t (tipo), b (marca), d (disponibilidade), o (ordem), p (produto) ── */
  function readUrl() {
    var p = new URLSearchParams(location.search);
    S.q = (p.get('q') || '').slice(0, 120);
    S.g = D.groupById.has(p.get('g')) ? D.groupById.get(p.get('g')) : -1;
    S.t = D.typeBySlug.has(p.get('t')) ? D.typeBySlug.get(p.get('t')) : -1;
    S.b = D.brandBySlug.has(p.get('b')) ? D.brandBySlug.get(p.get('b')) : -1;
    var d = (p.get('d') || '').split('').map(Number).filter(function (n) { return STOCK[n]; });
    S.st = d.length ? d : [1, 2, 3];
    S.sort = /^(stock|name|brand)$/.test(p.get('o') || '') ? p.get('o') : 'stock';
    openEan = D.byEan.has(p.get('p')) ? p.get('p') : '';
  }
  function writeUrl() {
    var p = new URLSearchParams();
    if (S.q) p.set('q', S.q);
    if (S.g >= 0) p.set('g', D.groups[S.g].id);
    if (S.t >= 0) p.set('t', D.types[S.t].slug);
    if (S.b >= 0) p.set('b', D.brands[S.b].slug);
    if (S.st.length < 3) p.set('d', S.st.slice().sort().join(''));
    if (S.sort !== 'stock') p.set('o', S.sort);
    if (openEan) p.set('p', openEan);
    var qs = p.toString();
    try { history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '')); } catch (e) { /* file:// */ }
  }

  /* ── filter + count ──────────────────────────────────────── */
  function hay(it) {
    return it.h || (it.h = fold(it.name + ' ' + it.pn + ' ' + it.ean + ' ' + D.brands[it.b].name + ' ' + D.types[it.t].name));
  }
  function update(keepLimit) {
    if (!keepLimit) S.limit = PER_PAGE;
    tokens = fold(S.q).split(/\s+/).filter(Boolean);
    var gTypes = S.g >= 0 ? D.groups[S.g].typeSet : null;
    var groupN = new Array(D.groups.length).fill(0), allN = 0;
    var typeN = new Map();
    var brandN = new Array(D.brands.length).fill(0);
    var stockN = { 1: 0, 2: 0, 3: 0 };
    var st = { 1: S.st.indexOf(1) >= 0, 2: S.st.indexOf(2) >= 0, 3: S.st.indexOf(3) >= 0 };
    results = [];

    for (var i = 0; i < D.items.length; i++) {
      var it = D.items[i];
      if (tokens.length) {
        var h = hay(it), ok = true;
        for (var k = 0; k < tokens.length; k++) { if (h.indexOf(tokens[k]) < 0) { ok = false; break; } }
        if (!ok) continue;
      }
      var inG = !gTypes || gTypes.has(it.t);
      var inT = S.t < 0 || it.t === S.t;
      var inB = S.b < 0 || it.b === S.b;
      var inS = st[it.s];
      if (inB && inS) { allN++; var gs = D.typeGroups[it.t]; for (var j = 0; j < gs.length; j++) groupN[gs[j]]++; }
      if (inG && inB && inS) typeN.set(it.t, (typeN.get(it.t) || 0) + 1);
      if (inG && inT && inS) brandN[it.b]++;
      if (inG && inT && inB) stockN[it.s]++;
      if (inG && inT && inB && inS) results.push(it);
    }
    sortResults();
    renderGroups(groupN, allN);
    renderTypes(typeN);
    renderBrands(brandN);
    renderStock(stockN);
    renderCount();
    renderGrid();
    $('cat-reset').hidden = !(S.q || S.g >= 0 || S.t >= 0 || S.b >= 0 || S.st.length < 3);
    writeUrl();
  }

  function sortResults() {
    var exact = tokens.length === 1 ? tokens[0] : '';
    var top = function (it) { return exact && (it.ean === exact || fold(it.pn) === exact) ? 0 : 1; };
    var key;
    if (S.sort === 'name') key = function (a, b) { return a.idx - b.idx; };
    else if (S.sort === 'brand') key = function (a, b) { return a.b - b.b || a.idx - b.idx; };
    // default "Relevância": products with a photo first (≈1/3 have none from
    // Databox), then by availability, then name
    else key = function (a, b) { return (!a.photo - !b.photo) || STOCK_RANK[a.s] - STOCK_RANK[b.s] || a.idx - b.idx; };
    results.sort(function (a, b) { return (exact ? top(a) - top(b) : 0) || key(a, b); });
  }

  /* ── render: sidebar ─────────────────────────────────────── */
  function renderGroups(groupN, allN) {
    var frag = document.createDocumentFragment();
    frag.appendChild(groupLink(-1, 'Todas as categorias', allN));
    D.groups.forEach(function (g) { frag.appendChild(groupLink(g.i, g.name, groupN[g.i])); });
    $('cat-groups').replaceChildren(frag);
  }
  function groupLink(i, name, n) {
    var li = el('li');
    var a = el('a', (S.g === i ? 'is-active' : '') + (n ? '' : ' is-empty'));
    a.href = '/catalogo.html' + (i >= 0 ? '?g=' + D.groups[i].id : '');
    a.setAttribute('data-gi', i);
    if (S.g === i) a.setAttribute('aria-current', 'true');
    a.appendChild(el('span', null, name));
    a.appendChild(el('small', null, fmt(n)));
    li.appendChild(a);
    return li;
  }
  // Big categories (Acessórios has ~50 types) would bury the products under
  // chips: show the most common few and let the rest open on demand.
  var TYPES_SHOWN = 8;
  var typesOpen = false;
  var lastTypeN = new Map();
  function typeLabel(t) {
    var name = D.types[t].name;
    // inside "Acessórios…" categories, "Acessórios Audio" reads better as "Audio"
    if (S.g >= 0 && /^Acessórios/.test(D.groups[S.g].name) && /^Acessórios ./.test(name)) {
      name = name.slice('Acessórios '.length);
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return name;
  }
  function renderTypes(typeN) {
    lastTypeN = typeN;
    var box = $('cat-types');
    var types = S.g >= 0 ? D.groups[S.g].types.filter(function (t) { return typeN.get(t) || t === S.t; }) : [];
    if (types.length < 2) { box.hidden = true; box.replaceChildren(); return; }
    types.sort(function (a, b) { return (typeN.get(b) || 0) - (typeN.get(a) || 0) || a - b; }); // most common first
    var collapsible = types.length > TYPES_SHOWN + 2;
    var shown = collapsible && !typesOpen ? types.slice(0, TYPES_SHOWN) : types;
    if (S.t >= 0 && shown.indexOf(S.t) < 0) shown = shown.concat([S.t]); // keep the selected type visible
    var frag = document.createDocumentFragment();
    var all = 0; typeN.forEach(function (n) { all += n; });
    frag.appendChild(chip(-1, 'Tudo', all));
    shown.forEach(function (t) { frag.appendChild(chip(t, typeLabel(t), typeN.get(t) || 0, D.types[t].name)); });
    if (collapsible) {
      var more = el('button', 'pg2-chip cat-chip-more');
      more.type = 'button';
      more.setAttribute('data-more', '');
      more.setAttribute('aria-expanded', typesOpen ? 'true' : 'false');
      if (typesOpen) more.appendChild(el('span', null, 'Mostrar menos'));
      else { more.appendChild(el('span', null, 'Mais tipos')); more.appendChild(el('small', null, '+' + fmt(types.length - TYPES_SHOWN))); }
      frag.appendChild(more);
    }
    box.replaceChildren(frag);
    box.hidden = false;
  }
  function chip(t, label, n, fullName) {
    var b = el('button', 'pg2-chip' + (S.t === t ? ' is-active' : ''));
    b.type = 'button';
    b.setAttribute('data-ti', t);
    b.setAttribute('aria-pressed', S.t === t ? 'true' : 'false');
    if (fullName && fullName !== label) b.title = fullName;
    b.appendChild(el('span', null, label));
    b.appendChild(el('small', null, fmt(n)));
    return b;
  }
  function renderBrands(brandN) {
    var sel = $('cat-brand');
    var opts = [new Option('Todas as marcas', '')];
    D.brands.forEach(function (b, i) {
      if (brandN[i] || i === S.b) opts.push(new Option(b.name + ' (' + fmt(brandN[i]) + ')', b.slug));
    });
    sel.replaceChildren.apply(sel, opts);
    sel.value = S.b >= 0 ? D.brands[S.b].slug : '';
  }
  function renderStock(stockN) {
    Array.prototype.forEach.call($('cat-stockf').querySelectorAll('input'), function (cb) {
      var s = Number(cb.value);
      cb.checked = S.st.indexOf(s) >= 0;
      cb.closest('label').querySelector('small').textContent = fmt(stockN[s]);
    });
  }
  function renderCount() {
    var c = $('cat-count');
    c.replaceChildren(el('b', null, fmt(results.length)), txt(' '), el('span', null, results.length === 1 ? 'artigo' : 'artigos'));
  }

  /* ── render: grid ────────────────────────────────────────── */
  function renderSkeleton() {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 8; i++) {
      var li = el('li', 'cat-card is-skel');
      li.setAttribute('aria-hidden', 'true');
      li.appendChild(el('div', 'cat-plate'));
      var body = el('div', 'cat-card-body');
      body.appendChild(el('i')); body.appendChild(el('i'));
      li.appendChild(body);
      frag.appendChild(li);
    }
    grid.replaceChildren(frag);
  }
  function renderGrid() {
    var frag = document.createDocumentFragment();
    results.slice(0, S.limit).forEach(function (it) { frag.appendChild(card(it)); });
    grid.replaceChildren(frag);
    $('cat-more').hidden = results.length <= S.limit;
    $('cat-empty').hidden = results.length > 0;
  }
  function showMore() {
    var from = S.limit;
    S.limit += PER_PAGE;
    var frag = document.createDocumentFragment();
    results.slice(from, S.limit).forEach(function (it) { frag.appendChild(card(it)); });
    grid.appendChild(frag);
    $('cat-more').hidden = results.length <= S.limit;
  }
  function card(it) {
    var li = el('li', 'cat-card');
    var plate = el('div', 'cat-plate');
    fillPlate(plate, it.photo, iconKeyOf(it.t), '');
    li.appendChild(plate);
    var body = el('div', 'cat-card-body');
    body.appendChild(el('p', 'cat-card-brand', D.brands[it.b].name));
    var h = el('h3', 'cat-card-name');
    var open = el('button', 'cat-open', it.name);
    open.type = 'button';
    open.setAttribute('data-open', it.ean);
    h.appendChild(open);
    body.appendChild(h);
    if (it.pn) body.appendChild(el('p', 'cat-card-ref', 'Ref. ' + it.pn));
    var foot = el('div', 'cat-card-foot');
    foot.appendChild(stockBadge(it.s));
    var add = el('button', 'cat-add');
    add.type = 'button';
    add.setAttribute('data-add', it.ean);
    setAddState(add, it);
    foot.appendChild(add);
    body.appendChild(foot);
    li.appendChild(body);
    return li;
  }
  function setAddState(btn, it) {
    var inCart = cartIndex(it.ean) >= 0;
    btn.classList.toggle('is-added', inCart);
    btn.replaceChildren(el('span', null, inCart ? '✓' : '+'), el('span', null, inCart ? 'No pedido' : 'Adicionar'), el('span', 'sr-only', ' · ' + it.name));
  }
  function refreshAddButtons() {
    Array.prototype.forEach.call(grid.querySelectorAll('[data-add]'), function (b) {
      var it = D.byEan.get(b.getAttribute('data-add'));
      if (it) setAddState(b, it);
    });
  }

  /* ── product detail ──────────────────────────────────────── */
  var buckets = new Map();
  function loadDetail(ean) {
    var n = bucketOf(ean, D.buckets);
    if (!buckets.has(n)) {
      buckets.set(n, fetch(DATA + 'd/' + String(n).padStart(2, '0') + '.json')
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .catch(function () { buckets.delete(n); return {}; }));
    }
    return buckets.get(n).then(function (m) { return m[ean] || null; });
  }
  function dlRow(dl, label, value) {
    if (!value) return;
    dl.appendChild(el('dt', null, label));
    dl.appendChild(el('dd', null, value));
  }
  function openDetail(ean, opener) {
    var it = D.byEan.get(ean);
    if (!it) return;
    openEan = ean;
    fillPlate($('cat-d-plate'), it.photo, iconKeyOf(it.t), it.name);
    $('cat-d-brand').textContent = D.brands[it.b].name;
    $('cat-d-name').textContent = it.name;
    var stock = $('cat-d-stock');
    stock.replaceChildren(stockBadge(it.s));
    var meta = $('cat-d-meta');
    meta.replaceChildren();
    dlRow(meta, 'Ref.', it.pn);
    dlRow(meta, 'EAN', it.ean);
    dlRow(meta, 'Categoria', D.types[it.t].name);
    $('cat-d-qty').value = 1;
    var specs = $('cat-d-specs');
    specs.textContent = '…';
    specs.parentNode.hidden = false;
    $('cat-d-ship').replaceChildren();
    $('cat-d-site').hidden = true;
    showOverlay($('cat-detail'), opener);
    writeUrl();

    loadDetail(ean).then(function (d) {
      if (openEan !== ean) return;
      d = d || ['', 0, null, '', ''];
      if (d[0]) specs.textContent = d[0]; else specs.parentNode.hidden = true;
      if (d[4] && it.s !== 1) {
        var next = el('span', 'cat-d-next');
        next.appendChild(el('span', null, 'Previsão'));
        next.appendChild(txt(' ' + fmtDate(d[4])));
        stock.appendChild(txt('·'));
        stock.appendChild(next);
      }
      var ship = $('cat-d-ship');
      if (d[2]) dlRow(ship, 'Embalagem', d[2].join(' × ') + ' mm');
      if (d[1]) dlRow(ship, 'Peso bruto', d[1].toLocaleString('pt-PT', { maximumFractionDigits: 2 }) + ' kg');
      var site = $('cat-d-site');
      if (d[3]) { site.href = d[3]; site.hidden = false; }
    });
  }

  /* ── overlays: focus trap, Esc, backdrop click ───────────── */
  var stack = [];
  var background = function () { return [document.querySelector('header.header'), $('main'), $('footer'), $('cat-fab')]; };
  function showOverlay(ov, opener) {
    if (stack.indexOf(ov) < 0) {
      ov._opener = opener || document.activeElement;
      ov.hidden = false;
      stack.push(ov);
      document.documentElement.classList.add('cat-lock');
      background().forEach(function (n) { if (n) n.inert = true; });
    }
    var focusTarget = ov.querySelector('[data-close]');
    if (focusTarget) focusTarget.focus();
  }
  function hideOverlay(ov) {
    var i = stack.indexOf(ov);
    if (i < 0) return;
    stack.splice(i, 1);
    ov.hidden = true;
    if (!stack.length) {
      document.documentElement.classList.remove('cat-lock');
      background().forEach(function (n) { if (n) n.inert = false; });
    }
    if (ov.id === 'cat-detail') { openEan = ''; writeUrl(); }
    var back = ov._opener;
    if (back && document.contains(back) && typeof back.focus === 'function') back.focus();
  }
  function trapFocus(e, ov) {
    var f = Array.prototype.filter.call(
      ov.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'),
      function (n) { return !n.hidden && n.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ── request list (localStorage) ─────────────────────────── */
  function loadCart() {
    try {
      var v = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(v) ? v.filter(function (x) { return x && x.e && x.q > 0; }) : [];
    } catch (e) { return []; }
  }
  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* private mode */ }
    renderCart();
  }
  function cartIndex(ean) { for (var i = 0; i < cart.length; i++) if (cart[i].e === ean) return i; return -1; }
  function clampQty(v) { v = parseInt(v, 10); return isFinite(v) ? Math.min(9999, Math.max(1, v)) : 1; }
  function addToCart(it, q) {
    var i = cartIndex(it.ean);
    if (i >= 0) cart[i].q = clampQty(cart[i].q + q);
    else cart.push({ e: it.ean, n: it.name, r: it.pn, b: D.brands[it.b].name, q: clampQty(q), p: it.photo, i: iconKeyOf(it.t) });
    saveCart();
    toast('Adicionado ao pedido');
    var fab = $('cat-fab');
    fab.classList.remove('is-bump'); void fab.offsetWidth; fab.classList.add('is-bump');
  }
  function renderCart(fillList) {
    var lines = cart.length;
    $('cat-fab').hidden = !lines;
    $('cat-fab-n').textContent = lines;
    $('cat-cart-go').classList.toggle('is-disabled', !lines);
    $('cat-cart-go').setAttribute('aria-disabled', lines ? 'false' : 'true');
    $('cat-cart-empty').hidden = !!lines;
    if (D) refreshAddButtons();
    if (!fillList && $('cat-cart').hidden) return;
    var list = $('cat-cart-list');
    var frag = document.createDocumentFragment();
    cart.forEach(function (row) {
      var li = el('li', 'cat-cart-item');
      var plate = el('div', 'cat-plate');
      if (D) fillPlate(plate, row.p, row.i || 'box', '');
      li.appendChild(plate);
      var name = el('p', 'cat-cart-name', row.n);
      if (row.r) name.appendChild(el('span', 'cat-cart-ref', 'Ref. ' + row.r));
      li.appendChild(name);
      var r = el('div', 'cat-cart-row');
      var qty = el('div', 'cat-qty cat-qty--sm');
      var minus = el('button', null, '−'); minus.type = 'button'; minus.setAttribute('data-q', '-1'); minus.setAttribute('aria-label', 'Diminuir quantidade');
      var input = el('input'); input.type = 'number'; input.min = 1; input.max = 9999; input.value = row.q; input.inputMode = 'numeric';
      input.setAttribute('aria-label', 'Quantidade'); input.setAttribute('data-qi', row.e);
      var plus = el('button', null, '+'); plus.type = 'button'; plus.setAttribute('data-q', '1'); plus.setAttribute('aria-label', 'Aumentar quantidade');
      qty.appendChild(minus); qty.appendChild(input); qty.appendChild(plus);
      qty.setAttribute('data-row', row.e);
      r.appendChild(qty);
      var rm = el('button', 'cat-cart-rm', 'Remover'); rm.type = 'button'; rm.setAttribute('data-rm', row.e);
      r.appendChild(rm);
      li.appendChild(r);
      frag.appendChild(li);
    });
    list.replaceChildren(frag);
  }
  function setRowQty(ean, q) {
    var i = cartIndex(ean);
    if (i < 0) return;
    cart[i].q = clampQty(q);
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* ignore */ }
  }

  var toastTimer;
  function toast(msg) {
    var t = $('cat-toast');
    t.replaceChildren(el('span', null, msg));
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 2200);
  }

  /* ── events ──────────────────────────────────────────────── */
  function scrollToResults() {
    var bar = document.querySelector('.cat-bar');
    if (!bar) return;
    var y = bar.getBoundingClientRect().top + window.pageYOffset - 100;
    if (window.pageYOffset > y) window.scrollTo({ top: y, behavior: 'smooth' });
  }
  function closeMobileFilters() {
    var f = $('cat-filters');
    if (!f.classList.contains('is-open')) return;
    f.classList.remove('is-open');
    $('cat-filters-btn').setAttribute('aria-expanded', 'false');
  }

  function bindUi() {
    var q = $('cat-q');
    q.value = S.q;
    var t;
    q.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () { S.q = q.value.trim(); update(); }, 160);
    });
    q.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); clearTimeout(t); S.q = q.value.trim(); update(); q.blur(); closeMobileFilters(); scrollToResults(); }
    });

    $('cat-groups').addEventListener('click', function (e) {
      var a = e.target.closest('a[data-gi]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      S.g = Number(a.getAttribute('data-gi'));
      S.t = -1;
      typesOpen = false;
      update();
      closeMobileFilters();
      scrollToResults();
    });
    $('cat-types').addEventListener('click', function (e) {
      if (e.target.closest('[data-more]')) {
        typesOpen = !typesOpen;
        renderTypes(lastTypeN);
        var toggle = $('cat-types').querySelector('[data-more]');
        if (toggle) toggle.focus();
        return;
      }
      var b = e.target.closest('[data-ti]');
      if (!b) return;
      S.t = Number(b.getAttribute('data-ti'));
      update();
    });
    $('cat-brand').addEventListener('change', function (e) {
      S.b = e.target.value && D.brandBySlug.has(e.target.value) ? D.brandBySlug.get(e.target.value) : -1;
      update();
    });
    $('cat-stockf').addEventListener('change', function () {
      S.st = Array.prototype.filter.call($('cat-stockf').querySelectorAll('input'), function (c) { return c.checked; })
        .map(function (c) { return Number(c.value); });
      update();
    });
    $('cat-sort').value = S.sort;
    $('cat-sort').addEventListener('change', function (e) { S.sort = e.target.value; update(); });
    $('cat-reset').addEventListener('click', function () {
      S.q = ''; S.g = -1; S.t = -1; S.b = -1; S.st = [1, 2, 3];
      q.value = '';
      update();
    });
    $('cat-more').addEventListener('click', showMore);
    $('cat-filters-btn').addEventListener('click', function () {
      var open = !$('cat-filters').classList.contains('is-open');
      $('cat-filters').classList.toggle('is-open', open);
      this.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    grid.addEventListener('click', function (e) {
      var add = e.target.closest('[data-add]');
      if (add) {
        var it = D.byEan.get(add.getAttribute('data-add'));
        if (!it) return;
        if (cartIndex(it.ean) >= 0) openCart(add); else addToCart(it, 1);
        return;
      }
      var open = e.target.closest('[data-open]');
      if (open) openDetail(open.getAttribute('data-open'), open);
    });

    // detail panel
    $('cat-d-add').addEventListener('submit', function (e) {
      e.preventDefault();
      var it = D.byEan.get(openEan);
      if (!it) return;
      addToCart(it, clampQty($('cat-d-qty').value));
      hideOverlay($('cat-detail'));
    });
    $('cat-d-add').addEventListener('click', function (e) {
      var s = e.target.closest('[data-step]');
      if (!s) return;
      var input = $('cat-d-qty');
      input.value = clampQty(Number(input.value) + Number(s.getAttribute('data-step')));
    });

    // request list panel
    $('cat-fab').addEventListener('click', function () { openCart(this); });
    $('cat-cart-list').addEventListener('click', function (e) {
      var rm = e.target.closest('[data-rm]');
      if (rm) {
        var i = cartIndex(rm.getAttribute('data-rm'));
        if (i >= 0) { cart.splice(i, 1); saveCart(); }
        // keep keyboard focus in the list: next row's "Remover", else close
        var rms = $('cat-cart-list').querySelectorAll('[data-rm]');
        (rms[Math.min(i, rms.length - 1)] || $('cat-cart').querySelector('[data-close]')).focus();
        return;
      }
      var step = e.target.closest('[data-q]');
      if (step) {
        var row = step.parentNode.getAttribute('data-row');
        var input = step.parentNode.querySelector('input');
        input.value = clampQty(Number(input.value) + Number(step.getAttribute('data-q')));
        setRowQty(row, input.value);
      }
    });
    $('cat-cart-list').addEventListener('change', function (e) {
      if (!e.target.matches('input[data-qi]')) return;
      e.target.value = clampQty(e.target.value);
      setRowQty(e.target.getAttribute('data-qi'), e.target.value);
    });
    $('cat-cart-clear').addEventListener('click', function () {
      if (!cart.length || !window.confirm(tr('Limpar todos os artigos do pedido?'))) return;
      cart = [];
      saveCart();
    });
    $('cat-cart-go').addEventListener('click', function (e) { if (!cart.length) e.preventDefault(); });

    [$('cat-detail'), $('cat-cart')].forEach(function (ov) {
      ov.addEventListener('click', function (e) {
        if (e.target === ov || e.target.closest('[data-close]')) hideOverlay(ov);
      });
    });
    document.addEventListener('keydown', function (e) {
      var top = stack[stack.length - 1];
      if (!top) return;
      if (e.key === 'Escape') { e.preventDefault(); hideOverlay(top); }
      else if (e.key === 'Tab') trapFocus(e, top);
    });
    window.addEventListener('storage', function (e) {
      if (e.key !== CART_KEY) return;
      cart = loadCart();
      renderCart();
    });
  }
  function openCart(opener) {
    renderCart(true);
    showOverlay($('cat-cart'), opener);
  }
})();
