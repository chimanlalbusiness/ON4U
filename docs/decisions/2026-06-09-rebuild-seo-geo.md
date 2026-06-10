# Rebuild completo + SEO/GEO + correções — 09/06/2026

## Resumo
Rebuild do site ON4U a partir do repositório clonado: correções à homepage, reconstrução das 6 páginas internas (estavam desatualizadas e com números inventados), patch à página flagship de Operação Internacional preservando o mapa D3, e depois passagem pelo pipeline de agentes (SEO/GEO → copywriting → website-builder) com infraestrutura técnica completa. Objetivo: site consistente e pronto para reunião com o cliente.

## Contexto detalhado
Pedido inicial: clonar o repo e aplicar um conjunto de correções (homepage) + garantir páginas internas funcionais + toggle de tema em todo o site. Estado encontrado: páginas internas não estavam vazias — estavam desatualizadas (header antigo "Serviços" sem toggle de tema, footer com morada errada "Lote 11... 2710-089", "Fax", e números inventados como "+15 anos", "120+ projetos", "100%", "4 continentes"). A flagship importacao-e-exportacao.html já estava construída (mapa D3 + scrollytelling) mas com o mesmo header/footer antigo e uma linha de stats inventados.

Após a primeira ronda, o cliente (Marco) pediu para seguir a doutrina de pipeline: invocar seo-geo-specialist → copywriter → website-builder por ordem, porque "nada estava SEO/GEO optimised", a copy era fraca e o design "super fraco". Pipeline executado. Seguiram-se correções pontuais pedidas pelo Marco.

## Mudanças aplicadas

### Homepage (index.html)
- Divisões reordenadas: Produção & Criatividade → Operação Internacional → Health & Care → Informática.
- Portfólio: card "Guiné-Bissau" substituído pelo card "Fardamentos e Merchandising Corporativo, HBD" (id=pf-hbd); label do card de equipamentos corrigido de "Fornecimento & Equipamentos" → "Fardamentos & Equipamentos".
- CTA final: bullet "O que é (categoria + especificação)" → "O que precisa".
- Logo cloud: referência Agualva corrigida (CD1647_AGUALVA.png → CD1947_AGUALVA.svg) nos 2 sets.

### Páginas internas (6) — reconstruídas
sobre, health-care, informatica, producao, portfolio, contactos: header/footer/toggle de tema canónicos (idênticos ao index), conteúdo segundo o brief, SEM números inventados. Formulário de contactos com 6 campos + mailto. Filtros funcionais no portfólio.

### Flagship (importacao-e-exportacao.html)
- Header/footer antigos → canónicos; toggle de tema ligado; links placeholder (wa.me/MESSAGE_LINK e href="#") corrigidos. Mapa D3 e scrollytelling preservados.
- Linha de stats inventados (+15/4/3) removida.
- Carrossel de logos em texto → secção real de logos da homepage ("Já trabalharam connosco" + logos reais + spotlight ao cursor).
- Removidos 2 blocos estáticos redundantes adicionados pelo builder ("Processo" duplicado e "O que coordenamos" + tabela de transporte). FAQ mantida.

### Pipeline de agentes
- docs/seo-strategy.md (seo-geo-specialist): homepage = hub institucional; importacao = página de serviço (resolve canibalização); esqueletos JSON-LD; correção de nomenclatura "Operação Internacional".
- docs/copy/*.md (copywriter): copy final das 8 páginas (Winner's Writing Process), prova por mecanismo, blocos extraíveis para GEO.
- website-builder: sistema de design novo (.pg2-*), 8 páginas reescritas, infraestrutura SEO/GEO (title/meta/canonical/OG/Twitter + JSON-LD por página, sitemap.xml, robots.txt), footer "Operação Internacional", contraste WCAG AA, skip-link, reveal-on-scroll.

### Infra / outros
- style.css: kit .pg2-*, footer partilhado .site-footer, fix mobile dos steps (!important), informatica feature-list → tabela.
- Criados: sitemap.xml, robots.txt, README.md, docs/architecture.md, docs/seo-strategy.md, docs/copy/*.

## Decisões
- Domínio canónico: **https://www.on4u.pt**.
- Health & Care: manter **genérico** — não listar/inventar categorias de produto.
- Informática: URL do catálogo do parceiro inexistente → CTA fica `href="#"` (TODO); `sameAs` (social) omitido do schema.
- Footer: rótulo da divisão é "Operação Internacional" (não "Importação & Exportação"); ficheiro/slug mantém-se importacao-e-exportacao.html.
- Tema: toggle inline por página + regra global `html.light-mode { filter: invert(1) hue-rotate(180deg) }` em style.css.
- NÃO inventar números/clientes/certificações — só Infarmed Cert. 1866/DM/2023, NAP real e presença PT/STP/GB/CN/IN.

## Implicações para o trabalho
- Verificação visual feita (Playwright, desktop + mobile): globo, mapa D3, cycling text, logo cloud, toggle de tema, filtros e formulário OK; 0 erros JS (exceto 404 de favicon + 2 imagens em falta, que degradam limpo via onerror).
- Reveal-on-scroll (.pg2-reveal) funciona em uso real; screenshots de página inteira mostram vazios (artefacto de captura, não bug).

## Pendentes (antes de publicar)
- [ ] URL do catálogo do parceiro de Informática (CTA "Aceder ao catálogo", agora href="#").
- [ ] Opcional: favicon.ico, páginas /privacidade.html e /termos.html.
- [ ] Opcional: categorias publicáveis de Health & Care (se quiser sair do genérico).
