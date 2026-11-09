#!/usr/bin/env node
/* Product photos: Databox FTP → 600px WebP → (optionally) Cloudflare R2.
 *
 * Reads .databox/photos-map.json (key → FTP filename, written by build.mjs).
 *
 *   node photos.mjs                    convert missing photos into catalogo/fotos/ (local preview)
 *   node photos.mjs --upload           also upload to R2 every photo not yet listed in r2-fotos.txt
 *     --group <a,b>                    only products in these category slugs
 *     --limit <n>                      at most n photos this run
 *     --out <dir>                      where WebP files are written (default catalogo/fotos, gitignored)
 *
 * r2-fotos.txt (committed) lists the keys already in the bucket, so the daily
 * job only downloads and uploads new photos. A photo already converted in
 * --out is uploaded without downloading it again.
 *
 * Environment:
 *   DATABOX_FTP_HOST / _USER / _PASS     only needed when something must be downloaded
 *   CLOUDFLARE_API_TOKEN / _ACCOUNT_ID   for --upload (token needs Workers R2 Storage: Edit)
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const cfg = JSON.parse(fs.readFileSync(path.join(HERE, 'config.json'), 'utf8'));
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) args[a.slice(2)] = process.argv[i + 1]?.startsWith('--') === false ? process.argv[++i] : true;
}
const OUT = path.resolve(ROOT, args.out || 'catalogo/fotos');
const MANIFEST = path.join(HERE, 'r2-fotos.txt');
const UPLOAD = !!args.upload;
const fail = msg => { console.error(`✖ ${msg}`); process.exit(1); };

// ── What to process ─────────────────────────────────────────────────────────
const map = JSON.parse(fs.readFileSync(path.join(ROOT, '.databox/photos-map.json'), 'utf8'));
let keys = Object.keys(map).sort();
if (args.group) {
  const index = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalogo/data/index.json'), 'utf8'));
  const wanted = new Set(String(args.group).split(','));
  const types = new Set(index.groups.filter(g => wanted.has(g.id)).flatMap(g => g.types));
  const inGroup = new Set(index.items.filter(it => types.has(it[4]) && it[6]).map(it => it[6]));
  keys = keys.filter(k => inGroup.has(k));
}
const uploaded = new Set(fs.existsSync(MANIFEST) ? fs.readFileSync(MANIFEST, 'utf8').split(/\r?\n/).filter(Boolean) : []);
const local = k => path.join(OUT, `${k}.webp`);
keys = UPLOAD ? keys.filter(k => !uploaded.has(k)) : keys.filter(k => !fs.existsSync(local(k)));
if (args.limit) keys = keys.slice(0, Number(args.limit));
const toFetch = keys.filter(k => !fs.existsSync(local(k)));
console.log(`${keys.length} photos this run` + (UPLOAD ? ` (${uploaded.size} already in R2, ${toFetch.length} to download)` : ''));

fs.mkdirSync(OUT, { recursive: true });
const quote = s => `"${s.replace(/[\\"]/g, '\\$&')}"`;

// ── Download + convert ──────────────────────────────────────────────────────
function curlBatch(batch, tmp) {
  const dir = cfg.remote.photosDir.split('/').filter(Boolean).map(encodeURIComponent).join('/');
  const lines = [`user = ${quote(`${process.env.DATABOX_FTP_USER}:${process.env.DATABOX_FTP_PASS}`)}`];
  for (const k of batch) {
    lines.push(`url = ${quote(`ftp://${process.env.DATABOX_FTP_HOST}/${dir}/${encodeURIComponent(map[k])}`)}`);
    lines.push(`output = ${quote(path.join(tmp, k).replace(/\\/g, '/'))}`);
  }
  return new Promise(resolve => {
    const p = spawn('curl', ['-sS', '--retry', '3', '--retry-all-errors', '--retry-delay', '5', '--connect-timeout', '30', '--max-time', '900', '-K', '-'],
      { stdio: ['pipe', 'inherit', 'inherit'] });
    p.on('close', resolve);
    p.stdin.end(lines.join('\n') + '\n');
  });
}

let converted = 0, failedConvert = 0, bytes = 0;
if (toFetch.length) {
  for (const v of ['DATABOX_FTP_HOST', 'DATABOX_FTP_USER', 'DATABOX_FTP_PASS']) if (!process.env[v]) fail(`Set ${v}`);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'on4u-fotos-'));
  try {
    for (let i = 0; i < toFetch.length; i += 100) {
      const batch = toFetch.slice(i, i + 100);
      await curlBatch(batch, tmp);
      for (const k of batch) {
        const src = path.join(tmp, k);
        try {
          if (!fs.existsSync(src)) throw new Error('not downloaded');
          const info = await sharp(src).rotate()
            .resize(cfg.photoSize, cfg.photoSize, { fit: 'inside', withoutEnlargement: true })
            .flatten({ background: '#ffffff' })
            .webp({ quality: 78, effort: 4 })
            .toFile(local(k));
          bytes += info.size; converted++;
        } catch (e) {
          failedConvert++; console.warn(`  ! ${k} (${map[k]}): ${e.message}`);
        } finally {
          fs.rmSync(src, { force: true });
        }
      }
      console.log(`  downloaded ${Math.min(i + 100, toFetch.length)}/${toFetch.length}`);
    }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  console.log(`✔ ${converted} converted (${(bytes / 1048576).toFixed(1)} MB)` + (failedConvert ? `, ${failedConvert} failed` : ''));
}

// ── Upload to R2 (Cloudflare REST API; ~1,200 requests / 5 min per token) ──
if (UPLOAD) {
  const { CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: account } = process.env;
  if (!token || !account) fail('Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID for --upload');
  const base = `https://api.cloudflare.com/client/v4/accounts/${account}/r2/buckets/${cfg.r2.bucket}/objects/`;
  const ready = keys.filter(k => fs.existsSync(local(k)));
  const saveManifest = () => fs.writeFileSync(MANIFEST, [...uploaded].sort().join('\n') + '\n');
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let next = 0, done = 0, failedUpload = 0, stop = '';

  async function put(k) {
    for (let attempt = 1; attempt <= 6; attempt++) {
      let res;
      try {
        res = await fetch(base + encodeURIComponent(cfg.r2.prefix + k + '.webp'), {
          method: 'PUT',
          headers: { authorization: `Bearer ${token}`, 'content-type': 'image/webp' },
          body: fs.readFileSync(local(k)),
        });
      } catch (e) { await sleep(2000 * attempt); continue; }      // network hiccup
      if (res.ok) return true;
      if (res.status === 401 || res.status === 403) { stop = `HTTP ${res.status}: token expired or lacks R2 permission`; return false; }
      if (res.status === 429 || res.status >= 500) {             // rate limited / transient
        const wait = Number(res.headers.get('retry-after')) * 1000 || 15000 * attempt;
        await sleep(wait); continue;
      }
      console.warn(`  ! ${k}: HTTP ${res.status} ${await res.text().catch(() => '')}`.slice(0, 200));
      return false;
    }
    return false;
  }
  async function worker() {
    while (!stop && next < ready.length) {
      const k = ready[next++];
      if (await put(k)) { uploaded.add(k); done++; } else if (!stop) failedUpload++;
      if (done % 200 === 0) { saveManifest(); console.log(`  uploaded ${done}/${ready.length}`); }
      await sleep(250 * 4); // 4 workers × 1 req/s ≈ 4 req/s, under the API limit
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()]);
  saveManifest();
  console.log(`✔ ${done} uploaded to R2 (${uploaded.size} total in r2-fotos.txt)` + (failedUpload ? `, ${failedUpload} failed` : ''));
  if (stop) fail(`Upload stopped: ${stop}. Progress is saved; run again to continue.`);
}
