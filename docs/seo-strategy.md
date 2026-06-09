# SEO/GEO Strategy — ON4U

> Documento de arquitetura. Lido em sequência por: `copywriter` (escreve para esta estrutura) → `website-builder` (implementa meta/schema/linking).
> Mercado: Portugal (PT-pt) primário, internacional (EN) secundário.
> Regra absoluta deste documento: **nada de números, anos, nº de projetos, percentagens, prémios ou clientes inventados.** Só existe o que está no briefing + logos/trabalhos reais já no site.
> Última atualização: 08/06/2026.

---

## 0. Sumário executivo — o que decidi

1. **A homepage e a `importacao-e-exportacao.html` estão a canibalizar-se.** Ambas atacam "importação/distribuição internacional". Resolvido com divisão de papéis: a home é o **hub institucional** (marca + modelo + 4 divisões), a flagship é a **página de serviço** que ranqueia para a query transacional internacional. Ver Secção 2.
2. **Nomenclatura inconsistente, escolhi um único nome.** A divisão é **"Operação Internacional"** em todo o lado (nav, footer, breadcrumbs, schema). O ficheiro `importacao-e-exportacao.html` **mantém-se** (não partir o mapa D3, e o slug com keywords é um ativo SEO). Resolução completa na Secção 2.3.
3. **Páginas internas são thin content.** `informatica.html` e `health-care.html` têm 1-3 parágrafos. Não ranqueiam e não são citáveis por LLMs. Plano de profundidade por página na Secção 3.
4. **Zero infraestrutura técnica SEO/GEO:** sem schema, sem OG, sem canonical, sem sitemap, sem robots. Tudo isto é trabalho de implementação direto, alto impacto, baixo esforço. Secções 5 e 6.
5. **GEO é a maior oportunidade aqui.** "Importação B2B por pedido", "distribuidor Infarmed certificado", "sourcing China/Índia para empresas portuguesas" são queries que LLMs respondem mal hoje. Conteúdo factual + FAQ schema = citabilidade. Secção 4.

---

## 1. Avatar e Intenção

### Avatar primário
Responsável de **Compras / Procurement / Operações** numa PME ou empresa portuguesa que precisa de fornecer, importar, produzir ou distribuir algo **fora do catálogo dos fornecedores habituais** — e não tem estrutura interna para tratar sourcing internacional, documentação aduaneira e coordenação multi-país.

A dor real não é "quero importar". É: *"tenho um requisito específico, não sei a quem pedir, tenho medo do risco (qualidade, alfândega, prazo) e não quero gerir cinco intermediários."*

### Avatares secundários
- **Gestor de saúde / farmácia / clínica / distribuidor** que precisa de produtos de saúde de fonte certificada (entra por Health & Care, query regulatória).
- **Marketing / Eventos corporativos** que precisa de stands, fardamentos, brinde, sinalética (entra por Produção & Criatividade).
- **IT / Compras de equipamento informático** (entra por Informática).

### Queries reais em PT-pt (qualitativo — sem volumes inventados)
Estas são as frases que o avatar escreve, não as que soam bem:

| Intenção | Query (PT-pt) | Página-destino |
|---|---|---|
| Transacional | `empresa de importação e exportação portugal` | importacao-e-exportacao |
| Transacional | `serviço de sourcing china para empresas` | importacao-e-exportacao |
| Transacional | `importar produtos da china para empresa` | importacao-e-exportacao |
| Comercial | `distribuição internacional b2b portugal` | importacao-e-exportacao |
| Comercial | `fornecimento por pedido empresas` | home |
| Regulatória | `distribuidor dispositivos médicos infarmed` | health-care |
| Regulatória | `fornecedor produtos de saúde certificado` | health-care |
| Comercial | `produção de stands e eventos corporativos` | producao |
| Comercial | `fardamentos e merchandising corporativo` | producao |
| Navegacional | `on4u` / `on4u sintra` | home |

### Momento da jornada
Maioritariamente **descoberta tardia → comparação**. O avatar já decidiu que precisa de ajuda externa; está a avaliar a quem confiar. Por isso o site tem de vender **processo e redução de risco**, não preço. O "Norte Verdadeiro" para cada página: o avatar tem de reconhecer o seu requisito específico nos primeiros 10 segundos.

---

## 2. Arquitetura do Site

### 2.1 Mapa de páginas (estado-alvo)

```
/ (index.html) ........................ HUB institucional — marca, modelo, 4 divisões  [Rank 1]
│
├── /importacao-e-exportacao.html ..... DIVISÃO: Operação Internacional (flagship)     [Rank 2]
├── /health-care.html ................. DIVISÃO: Health & Care                          [Rank 2]
├── /producao.html .................... DIVISÃO: Produção & Criatividade                [Rank 2]
├── /informatica.html ................. DIVISÃO: Informática                            [Rank 3]
│
├── /portfolio.html ................... Prova social — trabalhos reais                  [Rank 3]
├── /sobre.html ....................... Quem somos, modelo, presença geográfica         [Rank 3]
└── /contactos.html ................... Conversão — pedido de orçamento + NAP           [Rank 3]
```

**Não criar mais páginas na v1.** O site tem 8 páginas — é a dimensão certa para este negócio. Não inventar páginas de "áreas que servimos" nem doorway pages por país: ON4U opera por projeto, não por geografia de proximidade. Isto **não é local SEO** (não há tráfego de proximidade a captar) — é SEO B2B nacional + GEO. Local SEO aplica-se apenas ao mínimo: GBP de Sintra + LocalBusiness schema para a query navegacional "on4u sintra".

### 2.2 Hierarquia de ranking interno

- **Rank 1 — Homepage:** compete por marca + a query genérica de modelo (`fornecimento por pedido para empresas`, `empresa b2b importação produção portugal`). É o nó central de internal linking. **Não deve tentar ranquear para "importação internacional"** — isso é o trabalho da flagship.
- **Rank 2 — Páginas de divisão com procura real:** Operação Internacional (a mais forte, query transacional + tem o conteúdo D3), Health & Care (query regulatória de nicho, baixa concorrência, ranqueia rápido), Produção & Criatividade (query comercial).
- **Rank 3 — Suporte:** Informática (depende de parceiro, conteúdo limitado por natureza), Portfolio, Sobre, Contactos.

### 2.3 Resolução da nomenclatura (DECISÃO — implementar)

Problema atual: o mesmo conceito tem três nomes no site.
- Nav desktop/mobile: "Operação Internacional"
- Footer (todas as páginas): "Importação & Exportação"
- Ficheiro/slug: `importacao-e-exportacao.html`

**Decisão:**
- **Nome de marca da divisão (UI visível):** `Operação Internacional` — em nav, footer, breadcrumbs, títulos de secção. Consistente em todo o lado. **Corrigir o footer** de todas as 8 páginas: trocar "Importação & Exportação" → "Operação Internacional".
- **Slug do ficheiro:** **manter `importacao-e-exportacao.html`.** Razões: (1) partir o ficheiro arrisca o mapa D3 + scrollytelling; (2) o slug contém as keywords transacionais reais ("importacao", "exportacao") que valem mais para SEO do que "operacao-internacional"; (3) não há links externos a preservar (site novo) mas evita-se redirect desnecessário.
- **Síntese para copy:** o H1 e o título usam os dois conceitos — o nome da divisão *e* as keywords. Ver Secção 3.

> Regra para o `copywriter`: "Operação Internacional" é o **nome**; "importação, exportação, sourcing e distribuição internacional" é o que **a divisão faz**. Usar o nome nos rótulos de navegação; usar os verbos de ação nos títulos e corpo de texto onde a keyword importa.

### 2.4 Relação entre a flagship e as outras divisões

A Operação Internacional é o **motor** que serve as outras divisões: Health & Care, Produção e Informática usam a mesma máquina de sourcing/importação/logística por baixo. Isto deve ficar explícito no conteúdo e no internal linking (Secção 7): cada divisão de nicho linka para a Operação Internacional como "o como" por trás do "o quê".

---

## 3. Por página — intenção, keywords, meta, headings, secções

> Convenção: **title ≤ 60 char** (regra normal — este é SEO B2B nacional, não local; ignorar a fórmula longa do playbook local). **Meta description ≤ 155 char.** Um H1 por página. Headings refletem perguntas/intenções reais.
> Os textos abaixo são **exemplos/diretrizes** para o `copywriter`, não copy final.

---

### 3.1 Homepage — `index.html`

- **Intenção:** navegacional + comercial de topo de funil (descoberta da marca e do modelo).
- **Keyword primária:** `empresa b2b importação produção portugal`
- **Secundárias:** `fornecimento por pedido para empresas`, `operação internacional b2b`, `sourcing e distribuição portugal`, `interlocutor único importação`
- **Title (atual está bom, refinar):**
  `ON4U | Importação, Produção e Distribuição B2B por Pedido` (56 char)
- **Meta description (≤155):**
  `Empresa B2B portuguesa: importação, produção, sourcing e distribuição internacional por pedido. Um único ponto de contacto do requisito à entrega.` (149 char)
- **H1 (atual `Fornecimento e operação internacional por pedido, com controlo.` — manter, é forte e passa o teste dos 10 segundos).**
- **Estrutura de H2/H3 recomendada** (a home já tem boa base — confirmar/ajustar):
  - H1 — proposta de valor + modelo "por pedido com controlo"
  - H2 — As quatro divisões *(cards: Produção & Criatividade / Operação Internacional / Health & Care / Informática — cada um H3, com 1 frase de mecanismo, não slogan)*
  - H2 — Como funciona: requisito → validação → proposta → execução *(o modelo de 1 interlocutor — bloco factual citável)*
  - H2 — Trabalhos / referências *(grid de portfolio real → link para /portfolio.html)*
  - H2 — Presença operacional *(Portugal · São Tomé e Príncipe · Guiné-Bissau · China · Índia)*
  - H2 — Parceiros que confiam em nós *(logo cloud real — manter)*
  - H2 — CTA final: "Envie o pedido. Receba proposta operacional."
- **Nota de anti-canibalização:** a secção "Como funciona" da home deve ser **resumida** (4 passos, 1 frase cada) e fazer link para a flagship/sobre para o detalhe. O detalhe do processo internacional vive na flagship, não na home.

---

### 3.2 Operação Internacional (flagship) — `importacao-e-exportacao.html`

- **Intenção:** transacional/comercial — a página que tem de converter procura de "importação e exportação".
- **Keyword primária:** `importação e exportação portugal` (empresa de serviços, não definição)
- **Secundárias:** `sourcing china índia para empresas`, `distribuição internacional b2b`, `importar produtos para empresa portugal`, `gestão de importação por pedido`, `desembaraço aduaneiro fornecimento`
- **Title (≤60):**
  `Importação e Exportação B2B por Pedido | ON4U` (45 char)
- **Meta description (≤155):**
  `Importação, exportação e distribuição internacional por pedido: validação, documentação e coordenação por etapas, com um único ponto de contacto.` (147 char)
- **H1 (atual está bom):** `Importação, fornecimento e distribuição internacional por pedido, com controlo` — manter. Contém o nome funcional + a keyword.
- **Estrutura de H2/H3 recomendada** (a página já tem ossatura forte com o scrollytelling — **não partir o mapa D3**; aprofundar o conteúdo *à volta* das secções existentes):
  - H1 — importação/exportação/distribuição por pedido, com controlo
  - H2 — *(scrolly)* Base e presença em pontos-chave *(Portugal · STP · Guiné-Bissau · China · Índia)*
  - H2 — *(scrolly)* Coordenação internacional do fornecimento à entrega
  - H2 — *(scrolly)* Um ponto de controlo para validar antes de avançar
  - H2 — Processo curto, claro e auditável *(H3: Requisitos / Validação / Proposta & Planeamento / Execução & Acompanhamento — manter)*
  - **H2 — O que coordenamos** *(NOVO bloco factual: importação, exportação, sourcing, consolidação, documentação/aduaneiro, distribuição. Lista extraível — alimenta GEO + schema Service)*
  - **H2 — Perguntas frequentes** *(NOVO — FAQPage schema. Ver Secção 4.3)*
  - H2 — CTA: pedir orçamento
- **Profundidade:** esta página deve ser a mais completa do site. O scrollytelling é ótimo para UX mas pouco extraível por crawlers/LLMs — por isso os blocos "O que coordenamos" e "FAQ" em HTML semântico simples (listas + parágrafos) são obrigatórios para SEO/GEO.

---

### 3.3 Health & Care — `health-care.html`

- **Intenção:** comercial + regulatória de nicho. **Baixa concorrência, ranqueia rápido.** Prioridade alta de profundidade.
- **Keyword primária:** `distribuidor certificado produtos de saúde portugal`
- **Secundárias:** `sourcing produtos de saúde por pedido`, `distribuidor dispositivos médicos infarmed`, `fornecimento produtos saúde b2b`, `importação produtos de saúde certificada`
- **Title (≤60):**
  `Health & Care | Sourcing de Produtos de Saúde | ON4U` (52 char)
- **Meta description (≤155):**
  `Sourcing e fornecimento de produtos de saúde por pedido. Distribuidor certificado pela Infarmed (Cert. 1866/DM/2023), com validação item a item.` (146 char)
- **H1 (refinar — o atual `Health & Care` é fraco para SEO, não diz o quê/para quem):**
  `Sourcing e fornecimento de produtos de saúde por pedido`
  *(manter "Health & Care" como overline/rótulo de divisão acima do H1)*
- **Estrutura de H2/H3 recomendada** (hoje tem só 2 secções — aprofundar):
  - Overline: Health & Care
  - H1 — Sourcing e fornecimento de produtos de saúde por pedido
  - H2 — Como funciona *(H3: Seleção e pedido / Validação manual e de conformidade / Orçamento e próximos passos — manter, aprofundar cada passo)*
  - **H2 — Certificação Infarmed** *(bloco factual: o que significa ser distribuidor certificado Cert. 1866/DM/2023, link para o PDF. NÃO inventar âmbito da certificação além do que o documento diz.)*
  - **H2 — O que fornecemos** *(NOVO — categorias de produto, **apenas as que o Marco confirmar**; se não confirmadas, manter genérico "produtos de saúde por pedido" e marcar TODO para o Marco preencher)*
  - **H2 — Perguntas frequentes** *(NOVO — FAQPage schema; perguntas regulatórias reais, Secção 4.3)*
  - H2 — CTA: fazer pedido
- **GEO nota:** a certificação Infarmed é o ativo de citabilidade mais forte do site inteiro. LLMs adoram factos verificáveis com número de certificado. Estruturar como definição clara.

---

### 3.4 Produção & Criatividade — `producao.html`

- **Intenção:** comercial.
- **Keyword primária:** `produção de stands e eventos corporativos`
- **Secundárias:** `fardamentos e merchandising corporativo`, `impressão e sinalética para empresas`, `identidade visual e materiais corporativos`, `brinde corporativo personalizado`
- **Title (≤60):**
  `Produção & Criatividade | Stands, Eventos, Fardamentos | ON4U` (60 char)
- **Meta description (≤155):**
  `Produção de stands, eventos, fardamentos, sinalética e identidade visual para empresas. Projetos corporativos coordenados por pedido, do briefing à entrega.` → cortar para ≤155:
  `Stands, eventos, fardamentos, sinalética e identidade visual para empresas. Produção corporativa por pedido, do briefing à entrega.` (130 char)
- **H1 (refinar):** `Produção e comunicação visual para projetos corporativos`
  *(manter "Produção & Criatividade" como overline)*
- **Estrutura de H2/H3 recomendada:**
  - Overline: Produção & Criatividade
  - H1 — Produção e comunicação visual para projetos corporativos
  - H2 — O que fazemos *(H3 reais por linha de serviço: Stands e ativações / Impressão, sinalética e materiais / Fardamentos e identidade visual / Eventos e brinde corporativo — manter)*
  - **H2 — Como trabalhamos** *(NOVO — o mesmo modelo requisito→validação→proposta→execução aplicado a produção; reforça consistência da marca)*
  - H2 — Alguns trabalhos *(grid real → link para /portfolio.html)*
  - H2 — CTA: pedir orçamento
- **Profundidade:** atualmente são só 2 secções + grid. Adicionar parágrafos de mecanismo por linha de serviço (1-2 frases cada, concretas).

---

### 3.5 Informática — `informatica.html`

- **Intenção:** comercial/navegacional. **Conteúdo limitado por natureza** (depende de parceiro). Não forçar profundidade artificial.
- **Keyword primária:** `equipamento informático para empresas`
- **Secundárias:** `catálogo informático b2b`, `fornecimento de equipamento informático`
- **Title (≤60):**
  `Informática | Equipamento e Catálogo B2B | ON4U` (47 char)
- **Meta description (≤155):**
  `Catálogo de equipamento informático para empresas, suportado por parceiro especializado, com acesso direto e encaminhamento simplificado de pedidos.` (147 char)
- **H1 (refinar):** `Equipamento informático para empresas`
  *(manter "Informática" como overline)*
- **Estrutura de H2/H3 recomendada:**
  - Overline: Informática
  - H1 — Equipamento informático para empresas
  - H2 — Catálogo suportado por parceiro especializado *(o atual conteúdo + lista — manter)*
  - **H2 — Como aceder** *(NOVO — 2-3 frases: acesso ao catálogo, encaminhamento, quem trata. Substituir o `href="#"` TODO pelo URL do parceiro — sinalizado ao Marco.)*
  - H2 — CTA: aceder ao catálogo / pedir orçamento
- **Aviso honesto:** esta página **não vai ranquear forte** — é fina por desenho. Está OK ser Rank 3. Não inventar conteúdo para a engordar. Indexável, sim; prioritária, não.

---

### 3.6 Portfolio / Trabalhos — `portfolio.html`

- **Intenção:** prova social / comercial (suporta a decisão, não capta procura fria).
- **Keyword primária:** `trabalhos on4u` (navegacional/marca)
- **Secundárias:** herdadas das divisões (`stands corporativos`, `identidade visual empresas`) via os títulos dos cases.
- **Title (≤60):**
  `Trabalhos | Projetos e Referências | ON4U` (42 char)
- **Meta description (≤155):**
  `Trabalhos da ON4U: stands e eventos, identidade visual, fardamentos, equipamentos e operação internacional para clientes corporativos.` (134 char)
- **H1:** `Trabalhos` → refinar para `Trabalhos e referências` (mais descritivo).
- **Estrutura:**
  - H1 — Trabalhos e referências
  - H2 — *(opcional)* filtros/categorias *(os chips já existem na home)*
  - Grid de cases — cada case com H3 = título real do trabalho *(manter os reais: Stand Repsol, Santa Casa da Misericórdia, Banco Central STP, HBD, Guiné-Bissau, etc.)*
  - H2 — CTA: tem um projeto? pedir orçamento
- **Schema:** cada case = `CreativeWork` ou item dentro de `ItemList` (opcional, baixa prioridade). **Não inventar resultados/métricas dos cases.** Só descrever o que foi feito.

---

### 3.7 Sobre — `sobre.html`

- **Intenção:** confiança / institucional (suporta E-E-A-T e a query de marca).
- **Keyword primária:** `sobre a on4u` (marca)
- **Secundárias:** `empresa b2b sintra`, `modelo de fornecimento por pedido`
- **Title (≤60):**
  `Sobre a ON4U | Empresa B2B por Pedido em Portugal` (49 char)
- **Meta description (≤155):**
  `ON4U é uma empresa B2B sediada em Sintra: importação, produção e operação internacional por pedido, com um único interlocutor do requisito à entrega.` (148 char)
- **H1:** `Sobre a ON4U` — OK, ou refinar para `ON4U — empresa B2B de fornecimento por pedido`.
- **Estrutura (a base atual é boa, aprofundar):**
  - H1 — Sobre a ON4U
  - H2 — Um interlocutor único, do requisito à entrega *(quem somos — manter, aprofundar)*
  - H2 — Como trabalhamos *(os 4 passos — manter)*
  - H2 — As quatro divisões *(NOVO — breve, 1 frase cada + link para cada divisão; reforça internal linking)*
  - H2 — Onde operamos *(presença geográfica — manter; é o bloco factual mais citável da página)*
  - H2 — CTA
- **GEO/E-E-A-T:** esta página deve conter os factos institucionais que dão autoridade — sede, presença, certificação, modelo. É a página que um LLM lê para "saber quem é a ON4U".

---

### 3.8 Contactos — `contactos.html`

- **Intenção:** transacional (conversão final) + navegacional (NAP).
- **Keyword primária:** `contacto on4u` / `pedir orçamento on4u`
- **Title (≤60):**
  `Contacto | Pedir Orçamento | ON4U` (33 char)
- **Meta description (≤155):**
  `Peça orçamento à ON4U: info@on4u.pt · +351 214 326 102. Sede em Sintra. Envie o requisito e receba proposta operacional e próximos passos.` (137 char)
- **H1:** `Contacto` → refinar para `Fale connosco / Peça orçamento`.
- **Estrutura (manter):**
  - H1 — Pedir orçamento
  - Formulário *(campos atuais: requisito, destino, prazo — bons)*
  - Blocos de contacto: Email / Telefone / Morada *(NAP — manter idêntico, é a fonte de verdade do NAP)*
  - **NOVO:** Google Maps embed da morada de Sintra *(reforça LocalBusiness para "on4u sintra")*
- **Schema:** ponto-chave para `ContactPage` + `LocalBusiness` com NAP. Ver Secção 5.

---

## 4. Estratégia GEO (Generative Engine Optimization)

GEO empilha em cima do SEO, não o substitui. LLMs (ChatGPT, Claude, Perplexity, Google AI Overviews) citam fontes que respondem a perguntas específicas com clareza, têm estrutura semântica limpa e factos verificáveis. O site da ON4U é **estruturalmente fraco para GEO hoje** porque o conteúdo decisivo está dentro de animações (scrolly, globo) e os blocos factuais são curtos.

### 4.1 As perguntas que a ON4U pode responder melhor que ninguém
Estas são oportunidades GEO reais — queries onde a concorrência PT é fraca e a ON4U tem facto verificável:

1. *"Quem faz sourcing/importação por pedido para empresas em Portugal?"* → flagship + home
2. *"Que distribuidores de produtos de saúde são certificados pela Infarmed?"* → health-care (facto: Cert. 1866/DM/2023)
3. *"Como funciona a importação B2B por pedido (sem catálogo fixo)?"* → flagship (modelo requisito→validação→proposta→execução)
4. *"Empresa portuguesa com presença em São Tomé e Príncipe e Guiné-Bissau para operação/fornecimento"* → sobre + flagship (nicho geográfico real, quase sem concorrência)

O ponto 4 é o **diferenciador GEO mais subvalorizado**: a presença em STP e Guiné-Bissau é um facto raro e específico. Deve aparecer como bloco factual claro (não só pontos no mapa).

### 4.2 Estruturas a implementar (formatos extraíveis)
Para cada bloco que importa para GEO, o `copywriter` + `website-builder` devem usar:
- **Definição clara em prosa** logo após o H2 (frase do tipo "X é Y que faz Z"), não só bullets soltos. LLMs extraem frases declarativas.
- **Listas HTML reais** (`<ul>`/`<ol>`) para "o que coordenamos", "o que fornecemos", passos do processo.
- **Tabela** onde houver comparação natural (ex.: modos de operação importação/exportação/distribuição).
- **Blocos factuais espelhados fora das animações.** Tudo o que está no scrolly/globo deve ter equivalente em HTML estático e indexável na mesma página.
- **Autoria/contexto:** Organization schema + data de atualização visível no footer ou nas páginas-chave reforça verificabilidade.

### 4.3 FAQ schema — onde faz sentido (e perguntas reais)
FAQPage schema só nas páginas onde há perguntas genuínas que o avatar faz. **Não inventar respostas — usar só factos do briefing.** Perguntas sugeridas (o `copywriter` escreve respostas):

**Flagship (importacao-e-exportacao):**
- "Trabalham com catálogo fixo ou por pedido?" *(resposta: por pedido)*
- "De que mercados fazem sourcing?" *(China, Índia, e os destinos do projeto)*
- "Tratam da documentação e do processo aduaneiro?" *(sim — validação e documentação desde o início)*
- "Tenho um único interlocutor ou vários?" *(um ponto de contacto até à entrega)*
- "Como começa um pedido?" *(requisito → validação → proposta → execução)*

**Health & Care:**
- "A ON4U é distribuidor certificado?" *(sim — Infarmed, Cert. 1866/DM/2023)*
- "Como é validada a conformidade dos produtos?" *(validação manual, item a item, antes da proposta)*
- "Posso pedir produtos que não estão num catálogo?" *(sim — sourcing por pedido)*

**Home (opcional, 1 FAQ de modelo):**
- "O que faz a ON4U?" *(empresa B2B: importação, produção, sourcing e distribuição por pedido, em 4 divisões)*

> Regra: FAQ schema **tem de corresponder** a perguntas/respostas visíveis na página (não schema fantasma). Marcação JSON-LD `FAQPage`.

---

## 5. Schema.org / JSON-LD

Estado atual: **zero schema em todas as páginas.** Esta é a maior win técnica de baixo esforço. Esqueletos abaixo — **campos a preencher só com dados reais; nunca inventar.**

### 5.1 Organization + LocalBusiness (em TODAS as páginas, no `<head>`)
A ON4U tem sede física → usar `Organization` com sub-tipo de morada, e `LocalBusiness` na home + contactos. Esqueleto:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ON4U",
  "url": "https://www.on4u.pt/",
  "logo": "https://www.on4u.pt/[caminho-do-logo].svg",
  "email": "info@on4u.pt",
  "telephone": "+351214326102",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Lote 14, Núcleo Empresarial da Abrunheira (Zona Poente)",
    "postalCode": "2710-679",
    "addressLocality": "Sintra",
    "addressCountry": "PT"
  },
  "areaServed": ["PT", "ST", "GW", "CN", "IN"],
  "contactPoint": [{
    "@type": "ContactPoint",
    "telephone": "+351214326102",
    "contactType": "sales",
    "email": "info@on4u.pt",
    "availableLanguage": ["pt", "en"]
  }],
  "sameAs": []   // preencher com URLs de redes sociais REAIS quando existirem; senão omitir
}
```

> Notas: `areaServed` usa códigos ISO (ST = São Tomé e Príncipe, GW = Guiné-Bissau, CN = China, IN = Índia). **Não preencher `foundingDate`, `numberOfEmployees`, `aggregateRating` — não há dados.** `sameAs` só com perfis reais.

### 5.2 LocalBusiness (home + contactos)
Mesmo bloco que Organization, com `@type": "LocalBusiness"`, adicionando `geo` (lat/long da morada — obter do Google Maps, é facto verificável) e `openingHours` **só se o Marco confirmar horário**.

### 5.3 Service (uma por página de divisão)
Cada divisão = um `Service` ligado ao `provider` ON4U. Esqueleto (exemplo Operação Internacional):

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Importação, exportação e distribuição internacional por pedido",
  "provider": { "@type": "Organization", "name": "ON4U", "url": "https://www.on4u.pt/" },
  "areaServed": ["PT", "ST", "GW", "CN", "IN"],
  "description": "Coordenação de importação, exportação, sourcing e distribuição internacional por pedido, com validação, documentação e um único ponto de contacto do requisito à entrega.",
  "url": "https://www.on4u.pt/importacao-e-exportacao.html"
}
```
- **Health & Care:** `serviceType: "Sourcing e fornecimento de produtos de saúde"` + adicionar `hasCredential`/menção à certificação Infarmed na `description` (Cert. 1866/DM/2023).
- **Produção:** `serviceType: "Produção, comunicação visual e eventos corporativos"`.
- **Informática:** `serviceType: "Fornecimento de equipamento informático"`.

### 5.4 BreadcrumbList (todas as páginas internas)
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://www.on4u.pt/" },
    { "@type": "ListItem", "position": 2, "name": "Operação Internacional", "item": "https://www.on4u.pt/importacao-e-exportacao.html" }
  ]
}
```
> Implementar breadcrumb **visível** no topo das páginas internas (UX + schema). Hoje não existe.

### 5.5 FAQPage (flagship + health-care + home opcional)
Marcar as FAQ da Secção 4.3. Estrutura `FAQPage` → `mainEntity` → `Question`/`acceptedAnswer`. Só perguntas que estão visíveis na página.

### 5.6 ContactPage (contactos.html)
`@type: "ContactPage"` + reuso do bloco LocalBusiness com NAP.

### 5.7 Resumo: que schema por página
| Página | Organization | LocalBusiness | Service | Breadcrumb | FAQPage | Outros |
|---|:--:|:--:|:--:|:--:|:--:|---|
| index | sim | sim | — | — | opcional | WebSite (SearchAction opcional) |
| importacao-e-exportacao | sim | — | sim | sim | **sim** | — |
| health-care | sim | — | sim | sim | **sim** | — |
| producao | sim | — | sim | sim | — | — |
| informatica | sim | — | sim | sim | — | — |
| portfolio | sim | — | — | sim | — | ItemList (opcional) |
| sobre | sim | — | — | sim | — | — |
| contactos | sim | sim | — | sim | — | ContactPage |

---

## 6. Técnico

### 6.1 Em falta — criar (ordem de prioridade)
1. **`robots.txt`** (raiz):
   ```
   User-agent: *
   Allow: /
   Sitemap: https://www.on4u.pt/sitemap.xml
   ```
   Não bloquear nada exceto, se aplicável, `/components/`, `/maps-generated/`, `/template.html` (ficheiros de trabalho, não páginas públicas).
2. **`sitemap.xml`** (raiz) — listar as 8 páginas públicas com `<loc>` absoluto e `<lastmod>`. **Não incluir** template.html, components/, maps-generated/.
3. **Canonical** em todas as páginas: `<link rel="canonical" href="https://www.on4u.pt/[pagina].html" />` (home: a versão `/`). Define a versão definitiva e mata duplicação `/` vs `/index.html`.
4. **Definir o domínio canónico** (www vs não-www, http→https) no servidor. Decisão a confirmar com o Marco; assumir `https://www.on4u.pt/` neste documento — **trocar globalmente se o domínio real for outro.**

### 6.2 Open Graph / Twitter cards — em falta em TODAS as páginas
Adicionar ao `<head>` de cada página (valores por página):
```html
<meta property="og:type" content="website" />
<meta property="og:site_name" content="ON4U" />
<meta property="og:locale" content="pt_PT" />
<meta property="og:title" content="[= title da página]" />
<meta property="og:description" content="[= meta description]" />
<meta property="og:url" content="https://www.on4u.pt/[pagina].html" />
<meta property="og:image" content="https://www.on4u.pt/og/[pagina].png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="[= title]" />
<meta name="twitter:description" content="[= meta description]" />
<meta name="twitter:image" content="https://www.on4u.pt/og/[pagina].png" />
```
> Imagens OG: criar pelo menos 1 imagem partilhável por página-chave (1200×630). Se não houver design, usar uma imagem de marca genérica com o logo — melhor que nada.

### 6.3 hreflang
- **v1: NÃO implementar hreflang.** O site é só PT-pt; não há versão EN separada. Implementar hreflang sem páginas EN é erro técnico.
- **v2 (se o Marco criar versão EN):** par `pt-PT` ⇄ `en` com `x-default`. Marcado como trabalho futuro, não agora.

### 6.4 Alt text — política
- **Logos de parceiros (logo cloud):** alt = nome real do parceiro (ex.: `alt="Repsol"`). Hoje verificar se estão preenchidos.
- **Imagens de portfolio:** alt descritivo do trabalho real (ex.: `alt="Stand Repsol — ativação corporativa"`). **Não keyword-stuffing.**
- **SVGs decorativos (ícones, globo, padrões):** `aria-hidden="true"` ou `alt=""`. O globo D3 e os ícones de UI são decorativos.
- **Logo ON4U:** já tem `aria-label="ON4U Homepage"` — bom.

### 6.5 Performance (já é estático — manter disciplina)
- **D3 v7 via CDN** na home e flagship: carregar com `defer`; idealmente só na flagship (onde o globo é central). Confirmar que a home precisa mesmo do globo D3 ou se pode ser imagem/CSS — é peso de JS para uma home institucional.
- **Font Awesome via CDN (all.min.css):** carrega a biblioteca inteira para usar poucos ícones. Considerar subset ou substituir por SVG inline (já há muito SVG inline no site). Win de performance.
- **Google Fonts (Inter):** OK; adicionar `&display=swap` (já presente) e `preconnect` para fonts.googleapis/gstatic.
- **Imagens:** servir em WebP, dimensionar, `loading="lazy"` abaixo da dobra (portfolio, logo cloud).
- **CSS inline gigante no `<head>`** (index tem ~1500 linhas de CSS inline): aceitável para evitar render-blocking, mas considerar mover o partilhado para `style.css` e deixar só o critical inline. Baixa prioridade.

### 6.6 Acessibilidade (baseline, não v2)
- Verificar contraste do texto cinza sobre fundo escuro (`rgba(255,255,255,0.42)` em `.pg-lede` pode falhar WCAG AA em texto pequeno — subir opacidade ou tamanho).
- `prefers-reduced-motion` já tratado no hero (bom) — confirmar que scrolly e globo também respeitam.
- Navegação por teclado no dropdown "Divisões" (já tem `aria-haspopup`/`aria-expanded` — confirmar funcionamento real).
- Um `<h1>` por página (confirmado OK em todas).
- Formulário de contacto: labels associados (já presentes), mensagens de erro acessíveis.

---

## 7. Internal Linking & Âncoras

Regra de ouro: só links que ajudam o leitor. Variar anchor text. Máx. ~8 links de conteúdo por página (excluindo nav/footer).

### 7.1 Mapa de links (conteúdo, não nav/footer)

```
HOME
 ├─→ importacao-e-exportacao   âncora: "operação internacional" / "ver como coordenamos"
 ├─→ health-care               âncora: "sourcing de produtos de saúde"
 ├─→ producao                  âncora: "produção e eventos corporativos"
 ├─→ informatica               âncora: "equipamento informático"
 ├─→ portfolio                 âncora: "ver trabalhos"
 └─→ contactos                 âncora: "pedir orçamento"

OPERAÇÃO INTERNACIONAL (flagship) — hub das divisões de nicho
 ├─→ health-care               âncora: "produtos de saúde por pedido"
 ├─→ producao                  âncora: "produção corporativa"
 ├─→ sobre                     âncora: "como trabalhamos" / "o nosso modelo"
 └─→ contactos                 âncora: "pedir orçamento"

HEALTH & CARE
 ├─→ importacao-e-exportacao   âncora: "operação internacional" (o motor de sourcing por trás)
 ├─→ sobre                     âncora: "o nosso processo"
 └─→ contactos                 âncora: "fazer pedido"

PRODUÇÃO
 ├─→ portfolio                 âncora: "ver trabalhos de produção"
 ├─→ importacao-e-exportacao   âncora: "fornecimento e logística"
 └─→ contactos                 âncora: "pedir orçamento"

INFORMÁTICA
 ├─→ importacao-e-exportacao   âncora: "operação internacional"
 └─→ contactos                 âncora: "pedir orçamento"

PORTFOLIO
 ├─→ producao / importacao     âncora: divisão correspondente a cada case
 └─→ contactos                 âncora: "tem um projeto? falar connosco"

SOBRE
 ├─→ (4 divisões)              âncora: nome de cada divisão
 └─→ contactos                 âncora: "pedir orçamento"
```

### 7.2 Princípios
- **A flagship é o nó de distribuição internacional** — recebe links de todas as divisões de nicho (Health & Care, Produção, Informática) como "o motor por trás". Isto concentra autoridade na página transacional mais valiosa.
- **Toda a página termina em CTA para /contactos.html** (já acontece — manter consistente).
- **Footer já tem bom internal linking** das 4 divisões — corrigir apenas o rótulo "Importação & Exportação" → "Operação Internacional" (Secção 2.3).
- **Não concentrar todos os links no footer.** Os links de conteúdo acima são no corpo do texto, com âncoras naturais variadas.

---

## 8. Riscos e Trade-offs

- **O scrollytelling/globo é ótimo para UX, fraco para crawlers/LLMs.** Mitigação: espelhar todo o conteúdo decisivo em HTML estático na mesma página (Secção 4.2). Sem isto, a flagship "parece" rica mas é invisível para SEO/GEO.
- **Informática vai continuar fina.** Decisão consciente: é Rank 3, não se força. Risco zero se gerida como página de encaminhamento, não de captação.
- **Sem dados de volume de pesquisa** (sem ferramenta de keywords ligada): as prioridades de keyword são **qualitativas**, baseadas na SERP PT e na intenção do avatar. Recomendo validar com Search Console assim que o site tiver tráfego.
- **Quando aparecem rankings:** para queries de nicho/baixa concorrência (Health & Care + Infarmed, presença STP/Guiné) — semanas. Para queries competitivas ("importação e exportação portugal") — meses, e depende de sinais externos (backlinks, GBP, menções). Sem prometer prazos ao cliente sem baseline do Search Console.
- **Domínio canónico assumido `www.on4u.pt`.** Se for diferente, há um find-replace global a fazer em todos os canonical/OG/schema antes de publicar.

---

## 9. Handoff — decisões críticas

### Para o `copywriter`
1. **"Operação Internacional" é o nome da divisão; "importação/exportação/sourcing/distribuição" é o que ela faz.** Usa o nome nos rótulos, os verbos nos títulos com keyword.
2. **Aprofundar health-care, producao e informatica** — hoje são thin (1-3 parágrafos). Escrever para a estrutura de H2/H3 da Secção 3, com frases de mecanismo concretas (nada de "premium/líder/inovador").
3. **Escrever as FAQ** das Secções 4.3 (flagship + health-care) com respostas factuais — base para o FAQPage schema.
4. **Refinar os H1 fracos:** health-care, producao, informatica, contactos têm H1 que não passam o teste dos 10 segundos (dizem o nome, não o quê/para quem). Reescrever segundo Secção 3.
5. **Blocos factuais extraíveis** (GEO): certificação Infarmed, presença STP/Guiné-Bissau, modelo "por pedido sem catálogo" — escritos como definições claras, não como slogans.

### Para o `website-builder` (depois do copy)
- Implementar schema (Secção 5), OG/Twitter (6.2), canonical + sitemap + robots (6.1), breadcrumbs visíveis + schema (5.4), Maps embed em contactos.
- Corrigir o rótulo do footer em todas as 8 páginas.
- Não partir o mapa D3 da flagship — aprofundar conteúdo *à volta* das secções scrolly, em HTML estático.

### Preciso de input do Marco antes de finalizar
1. **Domínio canónico real** (é `www.on4u.pt`? https? www ou não-www?) — bloqueia canonical/OG/schema/sitemap.
2. **URL do catálogo do parceiro** de Informática (há um `href="#"` TODO em informatica.html).
3. **Health & Care:** que categorias de produto a ON4U pode listar publicamente? (para a secção "O que fornecemos" — sem isto fica genérico).
4. **Lat/long da sede** (obtenho do Google Maps) e **horário de funcionamento** (para LocalBusiness schema — só se quiseres expor).
5. **Perfis sociais reais** (LinkedIn, etc.) para `sameAs` no schema — ou confirmar que não há.
6. **Imagens OG** — existe design de marca para gerar as imagens 1200×630, ou uso o logo sobre fundo da marca?
