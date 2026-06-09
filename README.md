# ON4U — Site institucional B2B

Site estático (HTML + CSS + JS vanilla) da ON4U: importação, produção e operação internacional por pedido. 8 páginas, dark-first, mobile-first, sem framework.

## Estrutura

```
/
├── index.html ...................... Hub institucional (globo D3, divisões, como funciona, presença, FAQ)
├── importacao-e-exportacao.html .... Operação Internacional (flagship: scrolly + mapa D3 + blocos GEO estáticos)
├── health-care.html ................ Health & Care (certificação Infarmed, processo, FAQ)
├── producao.html ................... Produção & Criatividade (serviços, processo, trabalhos)
├── informatica.html ................ Informática (catálogo via parceiro)
├── portfolio.html .................. Trabalhos (grid filtrável)
├── sobre.html ...................... Sobre (modelo, divisões, presença, NAP)
├── contactos.html .................. Contacto (formulário, NAP, Maps embed)
├── style.css ....................... Sistema de design partilhado (header/footer + kit .pg2-*)
├── scrolly_styles.css .............. Estilos do scrollytelling (flagship)
├── script.js ....................... Header, mobile nav, scrolly engine
├── components/world-map.{js,css} ... Mapa mundo D3 (flagship)
├── sitemap.xml · robots.txt ........ SEO técnico
├── images/ · documents/ ............ Assets
└── docs/ ........................... seo-strategy.md · architecture.md · copy/*.md
```

## Desenvolvimento local

Não há build step. Servir a pasta com qualquer servidor estático:

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve -l 8080
```

Abrir `http://localhost:8080`. Para testar em telemóvel real, servir com `--bind 0.0.0.0` e abrir o IP local da rede.

> Os links internos usam caminhos absolutos (`/health-care.html`). Servir a partir da raiz do projeto.

## Build

Nenhum. Os ficheiros são servidos tal como estão. As fontes vêm do Google Fonts CDN; D3 e Font Awesome via CDN.

## Deploy

Qualquer host estático (Vercel, Netlify, Cloudflare Pages, S3). Apontar para a raiz.

- **Domínio canónico**: `https://www.on4u.pt` — configurar redirect de não-www → www e http → https no host.
- Confirmar que `/` serve `index.html` (canonical da home é `/`, não `/index.html`).

## Convenções

- Dark-first; tema claro via toggle (`#theme-toggle` → `html.light-mode` + `localStorage 'on4u-theme'`).
- Acento único `#f97316`. Tipografia Inter. Cache-bust do CSS via `?v=N`.
- Acessibilidade baseline: HTML semântico, skip-link, `alt`, contraste AA, foco visível, `prefers-reduced-motion`.

Ver `docs/architecture.md` para decisões de design e SEO/GEO, e `docs/seo-strategy.md` para a estratégia.
