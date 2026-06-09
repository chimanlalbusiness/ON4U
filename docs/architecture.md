# Architecture & Build Decisions — ON4U

> Documento do `website-builder`. Implementa o que `seo-strategy.md` + `docs/copy/*.md` decidiram.
> Não reabre decisões de SEO/copy — executa-as com craft de design.
> Última atualização: 08/06/2026.

---

## Design Decision — Eixo

**Híbrido controlado: Eixo A (conservador-com-personalidade) com âncora editorial na home.**

Justificação (3 perguntas):
1. **Cabeça ou coração?** Cabeça. O avatar é Compras/Operações a comparar a quem confiar; decide por redução de risco, processo e prova (certificação, presença real). → A.
2. **Serviço comparável ou identidade?** Comparável (features, processo, fiabilidade). → A.
3. **Mecanismo ou narrativa?** Mecanismo (processo de 4 etapas, validação item a item, Cert. Infarmed, presença STP/Guiné). → A.

3/3 para A. O dark-first com um único acento (#f97316), tipografia Inter em escala restrita e whitespace generoso é coerente com a referência tipo-Stripe/Linear. A **home** mantém os dois momentos editoriais que já existiam e funcionam (globo D3 + cycling text) como assinatura de marca; a **flagship** mantém o scrollytelling + mapa D3. Tudo o resto desce para Eixo A puro, consistente nas páginas internas.

Decisão-chave: **não somar truques**. As interações fortes (globo, mapa, logo spotlight, toggle de tema) já existiam e são o ponto alto — foram preservadas intactas. O trabalho de design foi elevar **o resto** ao mesmo nível com hierarquia tipográfica, ritmo de espaçamento e profundidade, não adicionar mais animação.

---

## Stack

- **HTML estático + CSS (Tailwind-free, vanilla)** — é o que o projeto já era e o que o requisito pede. Sem framework: 8 páginas estáveis, cliente mantém sozinho, deploy trivial. Subir para Astro/Next não se justifica (regra: ferramenta mais simples que entrega o requisito).
- **Vanilla JS** — globo (D3 v7 via CDN, `defer`), scrollytelling, mapa D3, logo spotlight, toggle de tema, filtros do portfólio, FAQ (`<details>` nativo), reveal on scroll (IntersectionObserver, CSS-only). Sem libraries de animação.
- **Sem D3 na maioria das páginas** — D3 só na home (globo) e flagship (mapa). As 6 internas não carregam D3.
- **Ferramentas avançadas (skills/MCPs/libraries)**: nenhuma ativada. Aplicado o teste de 3 perguntas — o briefing é Eixo A racional, a estratégia upstream não pediu eixo B, e o cliente mantém o site. Framer/GSAP/Lenis prejudicariam (peso, fragilidade) sem servir nenhum passo do WWP. Playwright MCP usado **apenas para QA visual** da implementação (screenshots desktop/mobile, consola), não para gerar conteúdo.

---

## Tipografia

- **1 família: Inter** (já carregada, self-served via Google Fonts CDN com `&display=swap` + `preconnect`). Restrição = qualidade.
- **Escala (5 passos deliberados)** em tokens `--pg-t-*`:
  - H1 `clamp(2.1rem, 5.2vw, 3.5rem)` peso 800, tracking −0.035em
  - H2 `clamp(1.55rem, 3vw, 2.3rem)` peso 800, tracking −0.03em
  - Lead `clamp(1.05rem, 1.7vw, 1.3rem)` peso 400
  - H3 1.0625rem peso 700
  - Body 0.975rem, line-height 1.8
  - Eyebrow 0.7rem, tracking 0.16em, uppercase
- Tabular-nums nos números de processo (`01 02 03 04`).

---

## Paleta (não alterada — sistema de marca dark-first)

| Token | Cor | Uso |
|---|---|---|
| `--pg-bg-0` | `#09090b` | fundo base / hero / CTA |
| `--pg-bg-1` | `#0d0d0f` | secção alternada |
| `--pg-bg-2` | `#111113` | secção alternada (3.º tom) |
| `--pg-panel` | `#161618` | cards, steps, nodes, FAQ |
| `--pg-accent` | `#f97316` | acento único (CTAs, eyebrows, dots) |
| `--pg-accent-hv` | `#ea580c` | hover do acento |
| `--pg-ink` | `#f5f5f7` | texto primário |
| `--pg-ink-2` | `rgba(255,255,255,0.74)` | texto corpo (subido de 0.42→0.74 para WCAG AA) |
| `--pg-ink-3` | `rgba(255,255,255,0.52)` | texto terciário/labels |
| `--pg-line` | `rgba(255,255,255,0.07)` | bordas |

**Acessibilidade**: o `rgba(255,255,255,0.42)` do kit antigo falhava AA em texto pequeno. O kit novo usa 0.74 para corpo e 0.52 para terciário. Toggle de tema (filter invert) preservado tal e qual.

---

## Componentes reutilizáveis (kit `.pg2-*` em style.css)

Substitui o kit `.pg-*` inline fino que existia em cada página interna. Tudo dark-first, mobile-first, com hover states + reduced-motion.

- `.pg2-hero` — hero com radial glow, breadcrumb, eyebrow, H1, lead, CTAs.
- `.pg2-crumbs` — breadcrumb visível (casa com BreadcrumbList schema).
- `.pg2-btn` (`--primary` / `--ghost`) e `.pg2-link` (link com seta animada).
- `.pg2-card` / `.pg2-divcard` — cards com ícone, hover lift, division variant.
- `.pg2-steps` (`--row`) — processo numerado `01–04`, `<ol>` semântico.
- `.pg2-flist` / `.pg2-minilist` — listas extraíveis (GEO).
- `.pg2-table` — tabela de dados (modos de transporte, GEO).
- `.pg2-faq` — acordeão com `<details>`/`<summary>` nativo (GEO + acessível).
- `.pg2-cert` — bloco de certificação Infarmed.
- `.pg2-nodes` / `.pg2-node` — presença/NAP.
- `.pg2-define` — frase declarativa GEO (callout com barra de acento).
- `.pg2-cta` — banda de conversão final.
- `.pg2-pf` / `.pg2-pf-grid` — grid de portfólio com placeholder de erro limpo.
- `.pg2-chips` — filtros (portfólio).
- `.pg2-contact` / `.pg2-form` / `.pg2-info-card` / `.pg2-map` — contactos + Maps embed.
- `.skip-link` — salto para conteúdo (acessibilidade).
- `.pg2-reveal` — reveal on scroll, CSS-only, `prefers-reduced-motion` respeitado.

---

## SEO/GEO implementado por página

| Página | Title/Meta | Canonical | OG/Twitter | JSON-LD | Breadcrumb visível |
|---|:--:|:--:|:--:|---|:--:|
| index | ✅ | `/` | ✅ | Organization · LocalBusiness · WebSite · FAQPage | — (é o topo) |
| importacao-e-exportacao | ✅ | ✅ | ✅ | Organization · Service · BreadcrumbList · FAQPage | ✅ |
| health-care | ✅ | ✅ | ✅ | Organization · Service · BreadcrumbList · FAQPage | ✅ |
| producao | ✅ | ✅ | ✅ | Organization · Service · BreadcrumbList | ✅ |
| informatica | ✅ | ✅ | ✅ | Organization · Service · BreadcrumbList | ✅ |
| portfolio | ✅ | ✅ | ✅ | Organization · BreadcrumbList · ItemList | ✅ |
| sobre | ✅ | ✅ | ✅ | Organization · BreadcrumbList | ✅ |
| contactos | ✅ | ✅ | ✅ | ContactPage(→LocalBusiness) · BreadcrumbList | ✅ |

- **Domínio canónico**: `https://www.on4u.pt` (confirmado pelo Marco). Find-replace global se mudar.
- **FAQPage = FAQ visível 1:1** na home, flagship e health-care. Sem schema fantasma.
- **GEO (extração por LLMs)**: o que vivia só em animações foi espelhado em HTML estático —
  - Home: "Como funciona" (`<ol>`), "Presença operacional" (`<ul>` de nós), FAQ (`<details>`).
  - Flagship: "Processo" (`<ol>`), "O que coordenamos" (`<ul>`), modos de transporte (`<table>`), FAQ (`<details>`) — inseridos **entre** o scrolly/mapa e a light-zone, sem partir nada.
  - Frases declarativas (`.pg2-define`) nos pontos citáveis: certificação Infarmed, presença STP/Guiné, modelo por pedido.
- **sitemap.xml** + **robots.txt** na raiz (8 páginas públicas; bloqueia /components, /maps-*, /scripts, /template.html).
- `sameAs` omitido (sem perfis sociais confirmados).

---

## Interações preservadas (REGRA Nº1 — não partir)

Construído à volta de, sem alterar a lógica:
- Globo D3 no hero (index) + cycling text rotator.
- Logo cloud com spotlight ao cursor (#referencias).
- Toggle de tema dark/light (script no `<head>` + handler inline + regra global `html.light-mode{filter:invert(1) hue-rotate(180deg)}`). Mecanismo idêntico em todas as 8 páginas.
- Hero mobile (2 estados) + scroll spring (index).
- Mapa mundo D3 (flagship, `window.initWorldMap` em scroll para #map-hub). Blocos estáticos novos entraram fora do scrolly.

---

## Itens a preencher pelo Marco (TODO)

1. **Imagens em falta** (referência mantida com `onerror` para degradar limpo): `images/merchandising/hbd.jpeg`, `images/pagamento-pontual-2026.png`.
2. **Informática**: `href="#"` do botão "Aceder ao catálogo" — substituir pelo URL do parceiro (2 sítios: hero + CTA final, marcados com `<!-- TODO -->`).
3. **Imagens OG** 1200×630 por página em `/og/*.png` (referenciadas no head; criar a partir da marca).
4. **Health & Care**: secção "O que fornecemos" mantida genérica por instrução do briefing (sem listar categorias).
5. **Lat/long da sede e horário** — não incluídos no LocalBusiness schema (só com confirmação). Maps embed usa pesquisa por nome do núcleo empresarial.
