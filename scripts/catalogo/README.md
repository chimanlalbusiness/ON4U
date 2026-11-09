# Catálogo Databox → `catalogo.html`

Importa o feed **DATA STREAM** da Databox (FTP) para o catálogo estático do site.
Catálogo por orçamento: só artigos e disponibilidade, **sem preços**. O ficheiro de
preços da ON4U (`PrecoDatabox_*.txt`) nunca é descarregado, para não poder acabar
neste repositório, que é **público**.

## Fluxo

```
fetch.sh ──► .databox/ (ignorado pelo git) ──► build.mjs ──► catalogo/data/   (publicado com o site)
                                                   │          catalogo.html     (links das categorias)
                                                   └──► photos.mjs ──► WebP 600px
                                                         local: catalogo/fotos/ (ignorado)
                                                         produção: Vercel Blob (próximo passo)
```

O site (`catalogo.html` + `catalogo.js`) lê `catalogo/data/index.json`, pesquisa e filtra no
browser, e guarda a lista do pedido em `localStorage`. O `pedido.html` preenche o passo 1
com essa lista (quantidade, nome, ref. do fabricante e EAN).

## Correr localmente

As credenciais estão no email da Databox. **Nunca** as ponha no repositório nem em ficheiros do site.

```bash
export DATABOX_FTP_HOST=…  DATABOX_FTP_USER=…  DATABOX_FTP_PASS=…
cd scripts/catalogo && npm install
npm run fetch                                   # ~1–2 min, para .databox/
npm run build                                   # catalogo/data/ + links em catalogo.html
npm run photos -- --group monitores --limit 200 # opcional: fotos para pré-visualização local
```

## O que é gerado

| Ficheiro | Conteúdo |
|---|---|
| `catalogo/data/index.json` | Listagem e pesquisa, um artigo por linha: `[EAN, nome, ref. fabricante, marca, tipo, disponibilidade, foto]` + categorias, tipos, marcas |
| `catalogo/data/d/NN.json` | Características, embalagem (mm), peso bruto (kg), página do fabricante, data prevista. 64 ficheiros, por hash do EAN (`bucketOf`, igual em `build.mjs` e `catalogo.js`) |
| `.databox/photos-map.json` | Chave da foto → nome do ficheiro no FTP (privado, usado por `photos.mjs`) |

## Regras (`config.json`)

- `showStock`: 1 Disponível · 2 Em reposição (Databox: "Entrega prevista") · 3 Por encomenda ("Só por encomenda"). O 4 "Não disponível" fica de fora.
- `excludeTypes` / `excludeGroups` / `excludeBrands`: retirar artigos do site.
- `minProducts`: abaixo deste número o build falha e **mantém os dados anteriores** (proteção contra downloads partidos). O build também falha se as colunas mudarem.
- `photoBase`: de onde o site carrega as fotos (local: `/catalogo/fotos/`).

## Notas sobre os dados da Databox

- Ficheiros em Windows-1252, separados por `;`, regenerados cerca de **de hora a hora**.
- Os nomes trazem etiquetas comerciais para revendedores (`#PROMO NOV`, `#NEW`, `#BLACKFRIDAY`…). São removidas.
- O tipo "Acessórios NAOSITE" é a marca da Databox para "não publicar em site", por isso fica excluído.
- Um tipo pode estar em vários grupos (`Geral/AgrupTipos_Join.csv`): o artigo aparece em todos.
- A listagem detalhada (`LIST`) da pasta `Geral/FOTOS` (~28 mil ficheiros) esgota o tempo no servidor deles. Usa-se `NLST` (só nomes).
- As cópias de 2024 em `Geral/` (CatArt/StockS) estão desatualizadas. Os ficheiros certos estão na raiz.
