#!/usr/bin/env node
/* Copies the public website into ../dist for Cloudflare's static assets.
 *
 * Source of truth is git: every file git knows about (tracked, or new and not
 * ignored) is published, except tooling, docs and dev-only files below. This
 * keeps local-only files (original photos, .databox/, catalogo/fotos/) out of
 * the deploy, whether it runs here or in GitHub Actions.
 * Runs automatically before `wrangler deploy` (wrangler.jsonc → build.command).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const MAX_BYTES = 25 * 1024 * 1024; // Workers static assets: 25 MiB per file

const EXCLUDE = [
  /^\./,                         // .github/, .gitignore, .gitattributes, .databox/ …
  /^(cloudflare|scripts|docs|dist|maps-data|maps-generated)\//,
  /(^|\/)node_modules\//,
  /\.md$/i,
  /^package(-lock)?\.json$/,
  /^(template\.html|extract_map\.js)$/,
  /^catalogo\/fotos\//,          // photos are served from R2, not as assets
];

const listed = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: ROOT })
  .toString().split('\0').filter(Boolean);

fs.rmSync(DIST, { recursive: true, force: true });
let count = 0, bytes = 0;
for (const rel of listed) {
  if (EXCLUDE.some(re => re.test(rel))) continue;
  const src = path.join(ROOT, rel);
  if (!fs.existsSync(src)) continue; // deleted in the working tree but still in the index
  const size = fs.statSync(src).size;
  if (size > MAX_BYTES) throw new Error(`${rel} is ${(size / 1048576).toFixed(1)} MiB; Workers assets allow 25 MiB per file`);
  fs.mkdirSync(path.dirname(path.join(DIST, rel)), { recursive: true });
  fs.copyFileSync(src, path.join(DIST, rel));
  count++; bytes += size;
}
for (const required of ['index.html', 'catalogo.html', 'catalogo/data/index.json']) {
  if (!fs.existsSync(path.join(DIST, required))) throw new Error(`dist/ is missing ${required}`);
}
console.log(`✔ dist/: ${count} files, ${(bytes / 1048576).toFixed(1)} MB`);
