#!/usr/bin/env node
/* Downloads product photos from the Databox FTP and converts them to WebP
 * (fit inside photoSize×photoSize, white background, no upscaling).
 *
 * Reads .databox/photos-map.json (written by build.mjs). Photos already
 * converted in --out are skipped, so re-runs only fetch what is new.
 *
 *   --out <dir>       destination (default catalogo/fotos, gitignored)
 *   --group <a,b>     only products in these category slugs
 *   --limit <n>       at most n photos this run
 *
 * Credentials: DATABOX_FTP_HOST / _USER / _PASS, passed to curl on stdin.
 * TODO (step 4): upload the WebP files to Vercel Blob for production.
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
const BATCH = 100;

for (const v of ['DATABOX_FTP_HOST', 'DATABOX_FTP_USER', 'DATABOX_FTP_PASS']) {
  if (!process.env[v]) { console.error(`✖ Set ${v}`); process.exit(1); }
}
const map = JSON.parse(fs.readFileSync(path.join(ROOT, '.databox/photos-map.json'), 'utf8'));
let keys = Object.keys(map);

if (args.group) {
  const index = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalogo/data/index.json'), 'utf8'));
  const wanted = new Set(String(args.group).split(','));
  const types = new Set(index.groups.filter(g => wanted.has(g.id)).flatMap(g => g.types));
  const inGroup = new Set(index.items.filter(it => types.has(it[4]) && it[6]).map(it => it[6]));
  keys = keys.filter(k => inGroup.has(k));
}
fs.mkdirSync(OUT, { recursive: true });
keys = keys.filter(k => !fs.existsSync(path.join(OUT, `${k}.webp`)));
if (args.limit) keys = keys.slice(0, Number(args.limit));
console.log(`${keys.length} photos to fetch → ${path.relative(ROOT, OUT)}`);

const quote = s => `"${s.replace(/[\\"]/g, '\\$&')}"`;
function curlBatch(batch, tmp) {
  const host = process.env.DATABOX_FTP_HOST;
  const dir = cfg.remote.photosDir.split('/').filter(Boolean).map(encodeURIComponent).join('/');
  const lines = [`user = ${quote(`${process.env.DATABOX_FTP_USER}:${process.env.DATABOX_FTP_PASS}`)}`];
  for (const k of batch) {
    lines.push(`url = ${quote(`ftp://${host}/${dir}/${encodeURIComponent(map[k])}`)}`);
    lines.push(`output = ${quote(path.join(tmp, k).replace(/\\/g, '/'))}`);
  }
  return new Promise(resolve => {
    const p = spawn('curl', ['-sS', '--retry', '2', '--connect-timeout', '30', '--max-time', '600', '-K', '-'], { stdio: ['pipe', 'inherit', 'inherit'] });
    p.on('close', resolve);
    p.stdin.end(lines.join('\n') + '\n');
  });
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'on4u-fotos-'));
let ok = 0, failed = 0, bytes = 0;
try {
  for (let i = 0; i < keys.length; i += BATCH) {
    const batch = keys.slice(i, i + BATCH);
    await curlBatch(batch, tmp);
    for (const k of batch) {
      const src = path.join(tmp, k);
      const dst = path.join(OUT, `${k}.webp`);
      try {
        if (!fs.existsSync(src)) throw new Error('not downloaded');
        const info = await sharp(src).rotate()
          .resize(cfg.photoSize, cfg.photoSize, { fit: 'inside', withoutEnlargement: true })
          .flatten({ background: '#ffffff' })
          .webp({ quality: 78, effort: 4 })
          .toFile(dst);
        bytes += info.size; ok++;
      } catch (e) {
        failed++; console.warn(`  ! ${k} (${map[k]}): ${e.message}`);
      } finally {
        fs.rmSync(src, { force: true });
      }
    }
    console.log(`  ${Math.min(i + BATCH, keys.length)}/${keys.length}`);
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(`✔ ${ok} converted (${(bytes / 1048576).toFixed(1)} MB, avg ${ok ? (bytes / ok / 1024).toFixed(0) : 0} KB)` + (failed ? `, ${failed} failed` : ''));
