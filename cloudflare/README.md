# Alojamento na Cloudflare

O site corre num **Cloudflare Worker** chamado `on4u`, na conta Cloudflare da RankUp (plano Workers Paid).

- **Páginas e ficheiros**: o `build-site.mjs` copia para `../dist/` tudo o que o git conhece, exceto
  ferramentas, documentação e ficheiros locais (`scripts/`, `docs/`, `maps-*`, `.databox/`, fotos locais…).
  O Wrangler publica essa pasta como *static assets*.
- **Fotos do catálogo**: bucket R2 `on4u-catalogo` (`fotos/<chave>.webp`), servidas pelo próprio Worker em
  `/catalogo/fotos/<chave>.webp`, com cache de 30 dias. Carregadas por `scripts/catalogo/photos.mjs --upload`.
- **URLs**: `html_handling: "none"`, por isso `/pagina.html` é servido tal como está, sem redirecionar, igual aos
  links e aos *canonical*. `/` → `index.html`, `/pagina` → `pagina.html`, o resto → 404 (`worker.js`).
- **Endereço de teste**: https://on4u.rankupconsulting.workers.dev

## Publicar

Automático, pelo GitHub Actions:

- `.github/workflows/deploy.yml` corre em cada push para `main`.
- `.github/workflows/catalogo.yml` corre todos os dias, depois de atualizar o catálogo e as fotos.

*Secrets* do repositório: `CLOUDFLARE_API_TOKEN` (token da conta com **Workers Scripts: Edit** e
**Workers R2 Storage: Edit**) e `CLOUDFLARE_ACCOUNT_ID`.

À mão, depois de `npx wrangler login`:

```bash
cd cloudflare && npm ci
CLOUDFLARE_ACCOUNT_ID=<id da conta> npx wrangler deploy
```

## Domínio on4u.pt → Cloudflare (por fazer, no lançamento)

Hoje `on4u.pt` e `www.on4u.pt` ainda apontam para o site antigo (nginx, 62.193.192.152). O DNS está na
MyDNS.pt e o email passa pela CleanMX (`mx1/mx2.cleanmx.pt`). Para ligar o domínio ao Worker, a zona DNS tem
de estar na Cloudflare.

1. No painel atual (MyDNS.pt), exportar ou copiar **todos** os registos da zona: MX, TXT (SPF, DKIM, DMARC,
   verificações), CNAME/SRV do email (autodiscover…), etc.
2. Adicionar `on4u.pt` à conta Cloudflare (plano Free) e confirmar registo a registo que o email fica igual.
3. No registo do domínio `.pt`, mudar os *nameservers* para os que a Cloudflare indicar.
4. Ligar `www.on4u.pt` ao Worker (*Custom Domain*) e redirecionar `on4u.pt` → `https://www.on4u.pt` (domínio canónico).
5. Testar site e email. Só depois disso desligar o projeto na Vercel.
