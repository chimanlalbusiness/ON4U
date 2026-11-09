#!/usr/bin/env node
/* Builds the public catalogue data from the raw Databox files.
 *
 *   in   .databox/  (gitignored; written by fetch.sh)
 *   out  catalogo/data/index.json     listing + search data, one product per line
 *        catalogo/data/d/NN.json      specs etc., sharded by hash(EAN)
 *        catalogo.html                static category links (between markers)
 *        .databox/photos-map.json     photo key -> FTP filename (for photos.mjs)
 *
 * No prices are read or written: the catalogue is quote-only.
 * Exits non-zero without touching the outputs when the input looks broken,
 * so a bad download never replaces yesterday's good data.
 *
 * Usage: node scripts/catalogo/build.mjs [--in .databox] [--out catalogo/data]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) args[a.slice(2)] = process.argv[i + 1]?.startsWith('--') === false ? process.argv[++i] : true;
}
const IN = path.resolve(ROOT, args.in || '.databox');
const OUT = path.resolve(ROOT, args.out || 'catalogo/data');
const PAGE = path.join(ROOT, 'catalogo.html');
const cfg = JSON.parse(fs.readFileSync(path.join(HERE, 'config.json'), 'utf8'));

const collator = new Intl.Collator('pt', { sensitivity: 'base', numeric: true });
const fail = msg => { console.error(`✖ ${msg}`); process.exit(1); };

// ── Parsing ────────────────────────────────────────────────────────────────
const decoder = new TextDecoder('windows-1252');
function readTable(file, required) {
  const p = path.join(IN, file);
  if (!fs.existsSync(p)) fail(`Missing ${p}. Run fetch.sh first.`);
  const lines = decoder.decode(fs.readFileSync(p)).split(/\r?\n/).filter(l => l.trim());
  const head = lines.shift().split(';').map(h => h.trim());
  const missing = required.filter(c => !head.includes(c));
  if (missing.length) fail(`${file}: columns ${missing.join(', ')} not found (format changed?)`);
  const rows = lines.map(line => {
    const cells = line.split(';');
    // Defensive: a stray ';' inside the last (free-text) column.
    if (cells.length > head.length) cells.splice(head.length - 1, Infinity, cells.slice(head.length - 1).join(';'));
    const row = {};
    head.forEach((h, i) => { row[h] = (cells[i] ?? '').trim(); });
    return row;
  });
  return { rows, mtime: fs.statSync(p).mtime };
}

const squash = s => s.replace(/\s+/g, ' ').trim();
// Databox appends commercial tags meant for resellers ("#PROMO NOV",
// "#NEW #PROMOPLAN ATE 30-11", "#BLACKFRIDAY"…). Always trailing.
const stripTags = s => squash(s.replace(/#.*$/, ''));
const simple = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decodeEntities = s => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
  if (e[0] === '#') {
    const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
    return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
  }
  return ENT[e.toLowerCase()] ?? m;
});

function specsText(raw, ...names) {
  let t = decodeEntities(raw.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, ' '));
  t = t.split('\n').map(l => l.replace(/[ \t ]+/g, ' ').trim()).filter(Boolean).join('\n');
  // Many products just repeat the name as their "characteristics".
  return names.some(n => simple(n) === simple(t)) ? '' : t;
}

const num = s => { const n = parseFloat(String(s).replace(',', '.')); return Number.isFinite(n) && n > 0 ? n : 0; };
const isoDate = s => { const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(s); return m ? `${m[3]}-${m[2]}-${m[1]}` : ''; };
const safeUrl = s => (/^https?:\/\/[^\s"'<>]+$/i.test(s) ? s : '');

// FNV-1a + murmur3 finaliser (FNV's low bits barely move across digit
// strings, which skews `% n`). Same function lives in catalogo.js — keep
// them identical.
function bucketOf(ean, n) {
  let h = 0x811c9dc5;
  for (let i = 0; i < ean.length; i++) { h ^= ean.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
  return (h >>> 0) % n;
}

// ── Load ───────────────────────────────────────────────────────────────────
const cat = readTable('CatArtDatabox.txt', ['EAN', 'PNFAB', 'DESCRICAO', 'MARCA', 'TIPO', 'PESOB', 'ALT', 'LARG', 'COMP', 'FOTO', 'SITE', 'CARACTERISTICAS']);
const stk = readTable('StockSDatabox.txt', ['EAN', 'STATSTK', 'PROXENT']);
const grp = readTable('AgrupTipos_Join.csv', ['DESCAGRUP', 'DESCCLAART']);
const fotosPath = path.join(IN, 'fotos-list.txt');
const fotoFiles = fs.existsSync(fotosPath)
  ? fs.readFileSync(fotosPath, 'latin1').split(/\r?\n/).filter(f => /\.(jpe?g|png|webp)$/i.test(f.trim()))
  : [];
if (!fotoFiles.length) console.warn('! No photo list (fotos-list.txt): products will show icons only.');

const stock = new Map(stk.rows.map(r => [r.EAN, { code: parseInt(r.STATSTK, 10), next: isoDate(r.PROXENT) }]));
const coverage = cat.rows.filter(r => stock.has(r.EAN)).length / Math.max(1, cat.rows.length);
if (coverage < 0.9) fail(`Only ${(coverage * 100).toFixed(0)}% of products have a stock line (files out of sync?)`);

const excludeTypes = new Set(cfg.excludeTypes.map(simple));
const excludeGroups = new Set(cfg.excludeGroups.map(simple));
const excludeBrands = new Set(cfg.excludeBrands.map(simple));

// type -> its groups (a type can sit in several groups)
const typeGroups = new Map();
for (const r of grp.rows) {
  const t = squash(r.DESCCLAART), g = squash(r.DESCAGRUP);
  if (!t || !g || excludeGroups.has(simple(g))) continue;
  if (!typeGroups.has(t)) typeGroups.set(t, new Set());
  typeGroups.get(t).add(g);
}
const mappedTypes = new Set(grp.rows.map(r => squash(r.DESCCLAART)));

// photo base name (upper) -> exact FTP filename; prefer .jpg over .png
const remotePhoto = new Map();
for (const raw of fotoFiles) {
  const f = raw.replace(/\r$/, '');
  const k = f.replace(/\.[^.]+$/, '').trim().toUpperCase();
  if (!remotePhoto.has(k) || /\.jpe?g$/i.test(f)) remotePhoto.set(k, f);
}

// ── Select & normalise ─────────────────────────────────────────────────────
const skipped = { stock: 0, type: 0, brand: 0, group: 0, name: 0 };
const products = [];
for (const r of cat.rows) {
  const st = stock.get(r.EAN);
  if (!st || !cfg.showStock.includes(st.code)) { skipped.stock++; continue; }
  const type = squash(r.TIPO);
  if (excludeTypes.has(simple(type))) { skipped.type++; continue; }
  const brand = squash(r.MARCA);
  if (excludeBrands.has(simple(brand))) { skipped.brand++; continue; }
  const groups = typeGroups.has(type) ? [...typeGroups.get(type)]
    : mappedTypes.has(type) ? [] /* every group it belongs to is excluded */ : [cfg.otherGroup];
  if (!groups.length) { skipped.group++; continue; }
  const name = stripTags(r.DESCRICAO);
  if (!name) { skipped.name++; continue; }
  const pn = squash(r.PNFAB);
  const dims = [r.ALT, r.LARG, r.COMP].map(num);
  products.push({
    ean: r.EAN, name, brand, type, groups, stock: st.code, next: st.next,
    pn: pn && pn !== r.EAN ? pn : '',
    foto: squash(r.FOTO).toUpperCase(),
    specs: specsText(r.CARACTERISTICAS, name, r.DESCRICAO),
    weight: num(r.PESOB),
    dims: dims.every(Boolean) ? dims : null,
    site: safeUrl(squash(r.SITE)),
  });
}
if (products.length < cfg.minProducts) {
  fail(`Only ${products.length} products to publish (minimum ${cfg.minProducts}). Keeping the previous data.`);
}
products.sort((a, b) => collator.compare(a.name, b.name) || (a.ean < b.ean ? -1 : 1));

// ── Photos: stable, URL-safe keys ──────────────────────────────────────────
const photoKeyOf = new Map(); // FOTO (upper) -> key
const photosMap = {};         // key -> FTP filename
const usedKeys = new Set();
for (const foto of [...new Set(products.map(p => p.foto))].filter(f => remotePhoto.has(f)).sort()) {
  const base = foto.toLowerCase().replace(/[^a-z0-9-]+/g, '_').replace(/^_+|_+$/g, '') || 'foto';
  let key = base, n = 2;
  while (usedKeys.has(key)) key = `${base}_${n++}`;
  usedKeys.add(key);
  photoKeyOf.set(foto, key);
  photosMap[key] = remotePhoto.get(foto);
}

// ── Dictionaries ───────────────────────────────────────────────────────────
const brands = [...new Set(products.map(p => p.brand))].sort(collator.compare);
const types = [...new Set(products.map(p => p.type))].sort(collator.compare);
const brandIx = new Map(brands.map((b, i) => [b, i]));
const typeIx = new Map(types.map((t, i) => [t, i]));

const groupTypes = new Map();
for (const p of products) for (const g of p.groups) {
  if (!groupTypes.has(g)) groupTypes.set(g, new Set());
  groupTypes.get(g).add(typeIx.get(p.type));
}
const groups = [...groupTypes.keys()]
  .sort((a, b) => (a === cfg.otherGroup) - (b === cfg.otherGroup) || collator.compare(a, b))
  .map(g => ({ id: slug(g), name: g, types: [...groupTypes.get(g)].sort((a, b) => a - b) }));
if (new Set(groups.map(g => g.id)).size !== groups.length) fail('Two groups share the same slug.');

// ── Write ──────────────────────────────────────────────────────────────────
const updated = new Date(Math.max(cat.mtime, stk.mtime)).toISOString();
const items = products.map(p => [p.ean, p.name, p.pn, brandIx.get(p.brand), typeIx.get(p.type), p.stock, photoKeyOf.get(p.foto) || '']);
const J = v => JSON.stringify(v);
const indexJson =
  '{\n' +
  `"v":1,\n"updated":${J(updated)},\n"photoBase":${J(cfg.photoBase)},\n"buckets":${cfg.detailBuckets},\n` +
  `"groups":[\n${groups.map(J).join(',\n')}\n],\n` +
  `"types":${J(types)},\n"brands":${J(brands)},\n` +
  `"items":[\n${items.map(J).join(',\n')}\n]\n}\n`;

const buckets = Array.from({ length: cfg.detailBuckets }, () => []);
for (const p of products) {
  buckets[bucketOf(p.ean, cfg.detailBuckets)].push([p.ean, [p.specs, p.weight, p.dims, p.site, p.next]]);
}

fs.mkdirSync(path.join(OUT, 'd'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'index.json'), indexJson);
const written = new Set();
buckets.forEach((rows, i) => {
  const name = `${String(i).padStart(2, '0')}.json`;
  rows.sort((a, b) => (a[0] < b[0] ? -1 : 1));
  fs.writeFileSync(path.join(OUT, 'd', name), `{\n${rows.map(([e, d]) => `${J(e)}:${J(d)}`).join(',\n')}\n}\n`);
  written.add(name);
});
for (const f of fs.readdirSync(path.join(OUT, 'd'))) if (!written.has(f)) fs.unlinkSync(path.join(OUT, 'd', f));
fs.writeFileSync(path.join(IN, 'photos-map.json'), JSON.stringify(photosMap));

// Static category links in catalogo.html, so the page has crawlable
// structure without JavaScript. Only rewritten when the groups change.
if (fs.existsSync(PAGE)) {
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const html = fs.readFileSync(PAGE, 'utf8');
  const re = /(<!-- CATALOGO:GRUPOS -->)[\s\S]*?(\s*<!-- \/CATALOGO:GRUPOS -->)/;
  if (re.test(html)) {
    const links = groups.map(g => `\n              <li><a href="/catalogo.html?g=${g.id}" data-g="${g.id}">${esc(g.name)}</a></li>`).join('');
    const next = html.replace(re, `$1${links}$2`);
    if (next !== html) fs.writeFileSync(PAGE, next);
  } else console.warn('! catalogo.html has no CATALOGO:GRUPOS markers; static links not updated.');
}

const kb = f => `${(fs.statSync(f).size / 1024).toFixed(0)} KB`;
console.log(`✔ ${products.length} products · ${brands.length} brands · ${types.length} types · ${groups.length} groups`);
console.log(`  photos: ${Object.keys(photosMap).length} keys for ${products.filter(p => photoKeyOf.has(p.foto)).length} products`);
console.log(`  skipped: ${Object.entries(skipped).map(([k, v]) => `${k} ${v}`).join(', ')}`);
console.log(`  index.json ${kb(path.join(OUT, 'index.json'))} · data updated ${updated}`);
