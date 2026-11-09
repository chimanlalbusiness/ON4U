/**
 * ON4U website on Cloudflare Workers.
 *
 * Static files (../dist, copied by build-site.mjs) are served by the assets
 * layer before this code runs, so this Worker only sees requests that matched
 * no file:
 *
 *   /catalogo/fotos/<key>.webp → product photo from R2 (bucket on4u-catalogo, object fotos/<key>.webp)
 *   /  and  /folder/           → that folder's index.html
 *   /page                      → /page.html if it exists (served, not redirected)
 *   anything else              → 404
 *
 * html_handling is "none" (wrangler.jsonc), so URLs ending in .html are served
 * exactly as written, matching the canonical URLs and links in the pages.
 */
const PHOTO = /^\/catalogo\/fotos\/([a-z0-9_-]{1,120}\.webp)$/;
const PHOTO_CACHE = 'public, max-age=2592000, stale-while-revalidate=86400'; // 30 days

export default {
  async fetch(request, env) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
    }
    const url = new URL(request.url);

    const photo = PHOTO.exec(url.pathname);
    if (photo) return servePhoto(request, env, photo[1]);

    if (url.pathname.endsWith('/')) {
      const res = await fromAssets(request, env, url.pathname + 'index.html');
      if (res.status !== 404) return res;
    } else if (!/\.[a-z0-9]+$/i.test(url.pathname)) {
      const res = await fromAssets(request, env, url.pathname + '.html');
      if (res.status !== 404) return res;
    }
    return notFound();
  },
};

function fromAssets(request, env, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  return env.ASSETS.fetch(new Request(url, request));
}

async function servePhoto(request, env, name) {
  // onlyIf honours If-None-Match / If-Modified-Since, so browsers revalidate cheaply.
  const object = await env.FOTOS.get(`fotos/${name}`, { onlyIf: request.headers });
  if (object === null) {
    return new Response('Not found', { status: 404, headers: { 'cache-control': 'public, max-age=300' } });
  }
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  if (!headers.has('content-type')) headers.set('content-type', 'image/webp');
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', PHOTO_CACHE);
  headers.set('x-content-type-options', 'nosniff');
  // A failed precondition returns the object without a body → 304 Not Modified.
  if (!('body' in object)) return new Response(null, { status: 304, headers });
  return new Response(request.method === 'HEAD' ? null : object.body, { headers });
}

function notFound() {
  const html = '<!doctype html><html lang="pt-PT"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">' +
    '<title>Página não encontrada | ON4U</title><style>' +
    'body{margin:0;min-height:100vh;display:grid;place-items:center;background:#09090b;color:#f5f5f7;' +
    'font:16px/1.6 Inter,system-ui,-apple-system,sans-serif;text-align:center;padding:1rem}' +
    'h1{font-size:3rem;margin:0;letter-spacing:-.03em}a{color:#f97316;font-weight:600}</style></head>' +
    '<body><main><h1>404</h1><p>Esta página não existe ou foi movida.</p><p><a href="/">Voltar ao início</a></p></main></body></html>';
  return new Response(html, { status: 404, headers: { 'content-type': 'text/html; charset=utf-8' } });
}
