# Reunião 09/06/2026 — Ajustes ao site — 09/06/2026

## Resumo
Lista de ajustes decididos na reunião com a ON4U. Sete itens implementados de imediato; três marcados como TODO (dependem de assets ou decisão interna da ON4U).

## Contexto detalhado (instruções do Marco)
Decisões da reunião de 09/06/2026. Aplicar o que é implementável agora; marcar como TODO o que depende de assets/decisões externas. Regras que não mudam: tom direto/operacional sem hype; não inventar números/clientes/certificações; copy pt-PT; mobile-first em CSS novo; não quebrar globo D3, mapa scrollytelling, logo cloud nem toggle de tema.

## Mudanças aplicadas (implementadas)

1. **Hero — sem "B2B" visível** (index): `aria-label` da secção "ON4U — Soluções B2B Internacionais" → "ON4U — Soluções Operacionais"; label do globo "Operações B2B Internacionais" → "Operações Internacionais". Meta/JSON-LD/páginas internas mantêm "B2B" (instrução).

2. **Globo — waypoints + labels** (index, script inline): raio primário 3.5→7px, secundário 2.5→5px (ponto interno 1→2px), pulse ring proporcional (×2). Labels permanentes por waypoint (11px, branco/cinza, 12px à direita do ponto, com sombra para legibilidade) e deteção de colisão simples (offset vertical se sobrepõem; flip para a esquerda junto à borda direita).

3. **Entrega nacional e internacional**: "distribuição internacional por pedido" → "distribuição nacional e internacional por pedido" no index (footer, FAQ visível + JSON-LD a par, meta) e no footer-brand-desc de todas as páginas. Slugs/URLs/titles intactos.

4. **Carrossel de logos** (index + importacao): headline "Já trabalharam connosco." → "Parceiros."; logos passam a mostrar **cores originais** (removido `filter: brightness(0) invert(1)` e `opacity:0.5`); `opacity:0.75` por defeito, `1` no hover; removido o JS de spotlight/glow laranja por cursor. Ajustado `html.light-mode .logo-cloud-track img` em style.css para re-inverter normalmente em tema claro.

5. **Ordem das divisões sincronizada** (fonte de verdade = homepage): Produção & Criatividade → Operação Internacional → Health & Care → Informática. Aplicado ao dropdown do header e ao mobile nav nas 8 páginas (script `scripts/_reorder-nav.cjs`, depois removido); footer já estava nesta ordem.

6. **Selo Pagamento Pontual** (footer, todas as páginas): `onerror` deixou de só esconder — agora revela um fallback de **texto** ("Compromisso Pagamento Pontual 2026") se a imagem não carregar. (A imagem continua em falta — ver pendentes.)

7. **Flow multi-step `/pedido.html`** (nova página): 5 ecrãs — (1) O que precisa, (2) Quantidade + destino, (3) Prazo, (4) Contacto (Nome/Email/Empresa), (5) Confirmação. Barra de progresso "Passo X de 4", transição slide horizontal, dark-first, mobile-first, validação dos campos obrigatórios, submissão por `mailto:info@on4u.pt` com os campos formatados. Todos os CTAs "Pedir orçamento" e "Contacto" passaram a apontar para `/pedido.html`; o link institucional "Contactos" do footer mantém `/contactos.html` (página institucional preservada).

8. **Globo no herói mobile** (follow-up do CEO — gostou do herói no desktop): o globo estava escondido em mobile (`#hero-globe-col: display:none` <900px). Passa a aparecer em versão **compacta no topo** do herói mobile (230px) com o label "Operações Internacionais" + texto a alternar; cartões das divisões mantêm-se por baixo. Os labels de texto dos waypoints só aparecem no globo grande (≥360px) — no mobile ficam só os pontos, para não sobrecarregar. Desktop inalterado.

## Implicações para o trabalho
- Verificação em código feita (greps): B2B fora do hero, código dos labels do globo presente, "Parceiros." + logos a cores, nav reordenada (8 páginas), selo-fallback em 9 páginas, 1 só `/contactos.html` por página (o footer), CTAs → /pedido.
- Verificação visual no browser recomendada antes de publicar (globo com labels sem colisão, flow do /pedido em mobile).

## Pendentes / TODO
- [x] **Imagem selo** — resolvido: a ON4U carregou `images/compromissoPagamentoPontual.jpeg`; o footer das 9 páginas foi reapontado para esse ficheiro (com fallback de texto a manter-se como rede de segurança).
- [x] **TODO-1 (Morada)** — resolvido (13/07/2026): morada nova confirmada pela ON4U. Aplicada em todas as 9 páginas (blocos visíveis, `streetAddress`/`postalCode`/`addressLocality` no JSON-LD, embed do Google Maps, e metas "Sede em Rio de Mouro"): **Núcleo Empresarial da Abrunheira (Zona Poente), Armazém 14, 2635-634 Rio de Mouro**. (Antes: Lote 14 · 2710-679 Sintra.)
- [x] **TODO-2 (Presença geográfica)** — resolvido (13/07/2026): confirmado como **ON4U Group**. Presença em Portugal, São Tomé e Príncipe e Guiné-Bissau; escritórios na China e na Índia. Texto de presença (index + /sobre) e footer-brand-desc das 9 páginas atualizados para "ON4U Group"; `legalName: "ON4U Group"` adicionado ao schema Organization (8 páginas).
- [ ] **TODO-3 (Tracking de pedidos)**: número de referência por pedido, consultável pelo cliente, estado atualizado manualmente pela ON4U. Aguarda decisão de processo interno.
- [ ] URL do catálogo do parceiro de Informática (CTA ainda `href="#"`); imagens OG `/og/*.png`; favicon; /privacidade.html + /termos.html (pendentes anteriores).
