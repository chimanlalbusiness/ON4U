const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Logo Contrast - update header-logo SVG
html = html.replace(/<circle cx="20"[^>]+stroke="#fff"[^>]+>/g, '<circle cx="20" cy="30" r="13" class="logo-text-stroke" stroke-width="14" />');
html = html.replace(/<path d="M 55 43 L 55 30 A 13 13 0 0 1 81 30 L 81 43" stroke="#fff"/g, '<path d="M 55 43 L 55 30 A 13 13 0 0 1 81 30 L 81 43" class="logo-text-stroke"');
html = html.replace(/<path d="M 151 17 L 151 30 A 13 13 0 0 0 177 30 L 177 17" stroke="#fff"/g, '<path d="M 151 17 L 151 30 A 13 13 0 0 0 177 30 L 177 17" class="logo-text-stroke"');

// 2. Sections Theme Data Attributes
html = html.replace(/<section class="scrolly-section" id="hero">/g, '<section class="scrolly-section" id="hero" data-theme="dark">');
html = html.replace(/<section class="scrolly-section" id="presence">/g, '<section class="scrolly-section" id="presence" data-theme="dark">');
html = html.replace(/<section class="scrolly-section" id="network">/g, '<section class="scrolly-section" id="network" data-theme="dark">');
html = html.replace(/<section class="scrolly-section" id="hub">/g, '<section class="scrolly-section" id="hub" data-theme="dark">');
html = html.replace(/<section class="scrolly-section" id="process">/g, '<section class="scrolly-section" id="process" data-theme="dark">');
html = html.replace(/<section class="scrolly-section" id="map-hub">/g, '<section class="scrolly-section" id="map-hub" data-theme="dark">');

html = html.replace(/<section class="divisoes normal-section" id="divisoes">/g, '<section class="divisoes normal-section" id="divisoes" data-theme="light">');
html = html.replace(/<footer class="footer normal-section">/g, '<footer class="footer normal-section" data-theme="light">');

// 3. Update Map Labels and Hero Text (International Positioning)
html = html.replace(/Operação internacional B2B • Europa ↔ África/g, 'Operação internacional por destino/projeto');
html = html.replace(/Europa ↔ África \(operações por destino e projeto\)/g, 'Operações por destino e projeto');
html = html.replace(/Base em Portugal\. Europa e África como foco operacional/g, 'Base em Portugal. Operação internacional estruturada'); // fallback just in case
html = html.replace(/Portugal como hub\. Europa e África como foco operacional/g, 'Base em Portugal. Operação internacional ajustada a cada destino');
html = html.replace(/Portugal \(Hub\)/g, 'Base em Portugal');

// 4. Update Presence Cards
const presenceCardsOld = `<div class="fact-card hover-lift">
                <h4>Base em Portugal</h4>
                <p>Coordenação central da operação e do acompanhamento por etapas.</p>
              </div>
              <div class="fact-card hover-lift">
                <h4>São Tomé e Príncipe e Bissau</h4>
                <p>Suporte local para execução e alinhamentos conforme o destino.</p>
              </div>
              <div class="fact-card hover-lift">
                <h4>Escritórios na China e Índia</h4>
                <p>Apoio ao fornecimento e à coordenação na origem, quando aplicável.</p>
              </div>
              <div class="fact-card hover-lift">
                <h4>Rede de parceiros</h4>
                <p>Transporte, manuseamento e processos locais coordenados conforme necessidade.</p>
              </div>`;

const presenceCardsNew = `<div class="fact-card hover-lift">
                <h4>Base em Portugal</h4>
                <p>Coordenação central da operação e do acompanhamento por etapas.</p>
              </div>
              <div class="fact-card hover-lift">
                <h4>São Tomé e Príncipe & Guiné-Bissau</h4>
                <p>Presença local para suporte à execução e alinhamentos.</p>
              </div>
              <div class="fact-card hover-lift">
                <h4>China e Índia</h4>
                <p>Escritórios de apoio ao fornecimento e coordenação na origem.</p>
              </div>
              <div class="fact-card hover-lift">
                <h4>Rede de parceiros</h4>
                <p>Cobertura operacional para outros destinos internacionais.</p>
              </div>`;
html = html.replace(presenceCardsOld, presenceCardsNew);

// 5. Replace "anim-entrance" with "anim-text" and "anim-visual" based on class
html = html.replace(/class="scrolly-text-block anim-entrance"/g, 'class="scrolly-text-block anim-text"');
html = html.replace(/class="scrolly-visual-block anim-entrance delay-1"/g, 'class="scrolly-visual-block anim-visual"');
html = html.replace(/class="scrolly-visual-block grid-cards anim-entrance delay-1"/g, 'class="scrolly-visual-block grid-cards anim-visual"');
html = html.replace(/class="text-center anim-entrance" style="margin-bottom: 2rem;"/g, 'class="text-center anim-text" style="margin-bottom: 2rem;"');
html = html.replace(/class="processo-layout anim-entrance delay-1"/g, 'class="processo-layout anim-visual"');
html = html.replace(/class="proof-line text-center mt-4 anim-entrance delay-2"/g, 'class="proof-line text-center mt-4 anim-visual"');
html = html.replace(/class="text-center anim-entrance map-header"/g, 'class="text-center anim-text map-header"');
html = html.replace(/class="map-component-wrapper anim-entrance transition-slow"/g, 'class="map-component-wrapper anim-visual transition-slow"');

// 6. Replace final CTA section
const oldCta = `<!-- 8) FINAL CTA + FOOTER (Normal) -->
  <section class="final-cta normal-section">
    <div class="container text-center" style="max-width: 800px;">
      <h2>Envie o pedido. Receba proposta operacional e próximos passos.</h2>
      <p class="scrolly-sub mt-4" style="margin: 1.5rem auto 2.5rem auto;">Partilhe o que precisa, destino e prazo. Validamos a viabilidade e devolvemos uma proposta com etapas claras — sem promessas vagas.</p>
      <div class="hero-actions" style="justify-content: center;">
        <a href="#" class="btn btn-primary">Pedir orçamento</a>
        <a href="#" class="btn btn-outline dark-btn">Falar com Operações</a>
      </div>
    </div>
  </section>`;
const newCta = `<!-- 8) FINAL CTA (Pinned) -->
  <section class="scrolly-section" id="final-cta" data-theme="dark">
    <div class="scrolly-sticky">
      <div class="scrolly-bg"><div class="scrolly-glow"></div></div>
      <div class="scrolly-content container scrolly-flex-col text-center">
        <div class="anim-text" style="max-width: 800px;">
          <h2 class="scrolly-title">Envie o pedido. Receba proposta operacional e próximos passos.</h2>
          <p class="scrolly-sub mt-4" style="margin: 1.5rem auto 2.5rem auto;">Partilhe o que precisa, destino e prazo. Validamos a viabilidade e devolvemos uma proposta com etapas claras — sem promessas vagas.</p>
        </div>
        <div class="anim-visual hero-actions" style="justify-content: center; margin-top: 2rem;">
          <a href="#" class="btn btn-primary">Pedir orçamento</a>
          <a href="#" class="btn btn-outline">Falar com Operações</a>
        </div>
      </div>
    </div>
  </section>`;
html = html.replace(oldCta, newCta);

// Fix map labels
const mapLabelsOld = `<span class="route-label hub">Portugal (Hub)</span>
            <span class="route-label">Angola</span>
            <span class="route-label">Moçambique</span>
            <span class="route-label">Cabo Verde</span>
            <span class="route-label">São Tomé e Príncipe</span>
            <span class="route-label">Guiné-Bissau</span>
            <br/><span class="route-label muted">(Outros destinos mediante pedido)</span>`;
const mapLabelsNew = `<span class="route-label hub">Base em Portugal</span>
            <span class="route-label">São Tomé e Príncipe</span>
            <span class="route-label">Guiné-Bissau</span>
            <span class="route-label">China e Índia</span>
            <br/><span class="route-label muted">Rede de parceiros (outros destinos)</span>`;
html = html.replace(mapLabelsOld, mapLabelsNew);

fs.writeFileSync('index.html', html);
console.log('index.html updated successfully.');
