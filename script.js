/*
  Scrollytelling Engine for ON4U
  v3 — event-driven (no rAF loop), passive listeners, process state fixed
*/

document.addEventListener("DOMContentLoaded", () => {
    const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Header scroll state ──────────────────────────────────────────────
    const header = document.querySelector(".header");
    if (header) {
        window.addEventListener("scroll", () => {
            header.classList.toggle("is-scrolled", window.scrollY > 8);
        }, { passive: true });

        // Header theme = data-theme of the section whose top has passed the header height
        function updateHeaderTheme() {
            let activeTheme = 'dark'; // hero starts dark
            const sections = Array.from(document.querySelectorAll('[data-theme]'));
            for (let i = sections.length - 1; i >= 0; i--) {
                const s = sections[i];
                if (window.scrollY >= s.offsetTop - 80) {
                    activeTheme = s.getAttribute('data-theme') || 'light';
                    break;
                }
            }
            if (activeTheme === 'dark') {
                header.classList.add('is-dark');
            } else {
                header.classList.remove('is-dark');
            }
        }
        window.addEventListener("scroll", updateHeaderTheme, { passive: true });
        updateHeaderTheme();
    }

    // ── Mobile menu ──────────────────────────────────────────────────────
    const menuToggle = document.querySelector(".mobile-menu-toggle");
    const mobileNav = document.getElementById("mobile-nav");
    if (menuToggle && mobileNav) {
        menuToggle.addEventListener("click", () => {
            const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
            menuToggle.setAttribute("aria-expanded", String(!isOpen));
            mobileNav[isOpen ? "setAttribute" : "removeAttribute"]("hidden", "");
        });
        mobileNav.querySelectorAll("a").forEach((a) =>
            a.addEventListener("click", () => {
                menuToggle.setAttribute("aria-expanded", "false");
                mobileNav.setAttribute("hidden", "");
            }),
        );
    }

    // ── Divisões drawers ─────────────────────────────────────────────────
    const exploreButtons = document.querySelectorAll(".btn-explore");
    const divDrawers = document.querySelectorAll(".div-drawer");
    const closeButtons = document.querySelectorAll(".drawer-close");
    exploreButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-drawer-target");
            const dialog = document.querySelector(`.div-drawer[data-drawer="${id}"]`);
            if (dialog && typeof dialog.showModal === "function") {
                document.body.style.overflow = "hidden";
                dialog.showModal();
            }
        });
    });
    function closeDialog(d) {
        d.close();
        document.body.style.overflow = "";
    }
    closeButtons.forEach((btn) => {
        const dialog = btn.closest(".div-drawer");
        if (dialog) btn.addEventListener("click", () => closeDialog(dialog));
    });
    divDrawers.forEach((dialog) => {
        dialog.addEventListener("click", (e) => {
            const rect = dialog.getBoundingClientRect();
            if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom)
                closeDialog(dialog);
        });
    });

    // ── Reduced-motion bail-out ──────────────────────────────────────────
    if (REDUCED) {
        document.querySelectorAll('.scrolly-section').forEach(s => {
            s.style.setProperty('--opacity-in', 1);
            s.style.setProperty('--y-in', 0);
            s.style.setProperty('--opacity-out', 1);
            s.style.setProperty('--scale-out', 1);
            s.style.setProperty('--text-in', 1);
            s.style.setProperty('--vis-in', 1);
            s.style.setProperty('--p', 0.5);
        });
        // Show all process phases normally
        document.querySelectorAll('.processo-phase').forEach(p => p.classList.remove('is-active'));
        const firstPhase = document.querySelector('.processo-phase[data-phase="1"]');
        if (firstPhase) firstPhase.classList.add('is-active');
        const mapWrapper = document.querySelector('.map-component-wrapper');
        if (mapWrapper) mapWrapper.classList.add('is-visible');
        return;
    }

    // ── Scrollytelling Engine ────────────────────────────────────────────
    const sections = document.querySelectorAll('.scrolly-section');
    const processPhases = document.querySelectorAll('.processo-phase');
    const svgNodes = document.querySelectorAll('.flow-node');
    const svgLinks = document.querySelectorAll('.flow-link.active-overlay');
    const svgBall = document.querySelector('.flow-ball');

    const mapWrapper = document.querySelector('.map-component-wrapper');
    let mapTriggered = false;

    // Process section: reset to phase 1 when entering, advance via scroll within section
    const nodeMap = {
        1: ["start", "pedido"],
        2: ["start", "pedido", "validacao"],
        3: ["start", "pedido", "validacao", "orcamento", "logistica"],
        4: ["start", "pedido", "validacao", "orcamento", "logistica", "entrega"],
    };
    const ballTargetMap = {
        1: { cx: 110, cy: 120 },
        2: { cx: 190, cy: 120 },
        3: { cx: 220, cy: 120 },
        4: { cx: 430, cy: 120 },
    };

    // updateProcessLogic based on stuck progress (0 to 1)
    function updateProcessLogic(pStuck) {
        let phase = 1;
        if (pStuck > 0.25) phase = 2;
        if (pStuck > 0.50) phase = 3;
        if (pStuck > 0.75) phase = 4;

        processPhases.forEach(p => p.classList.toggle("is-active", parseInt(p.dataset.phase) === phase));
        const targetNodes = nodeMap[phase] || [];
        svgNodes.forEach(n => n.classList.toggle("is-active", targetNodes.includes(n.getAttribute("data-node"))));
        svgLinks.forEach(l => l.classList.toggle("is-active", parseInt(l.getAttribute("data-phase-target")) <= phase));
        if (svgBall && ballTargetMap[phase]) {
            const bTarget = ballTargetMap[phase];
            svgBall.style.transform = `translate(${bTarget.cx - 30}px, ${bTarget.cy - 120}px)`;
        }
    }

    // Reset process to phase 1
    function resetProcess() {
        processPhases.forEach(p => p.classList.toggle("is-active", parseInt(p.dataset.phase) === 1));
        const targetNodes = nodeMap[1] || [];
        svgNodes.forEach(n => n.classList.toggle("is-active", targetNodes.includes(n.getAttribute("data-node"))));
        svgLinks.forEach(l => l.classList.remove("is-active"));
        if (svgBall && ballTargetMap[1]) {
            const bTarget = ballTargetMap[1];
            svgBall.style.transform = `translate(${bTarget.cx - 30}px, ${bTarget.cy - 120}px)`;
        }
    }

    // ── Mobile Process Phase Handlers ────────────────────────────────────
    const mobileSteps = document.querySelectorAll('.mobile-step');
    let mobilePhase = 1;

    function isMobileView() {
        return window.innerWidth < 900;
    }

    function updateMobilePhase(phase) {
        // Update tab pills
        processPhases.forEach(p => p.classList.toggle("is-active", parseInt(p.dataset.phase) === phase));
        
        // Update mobile stepper
        mobileSteps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.toggle("is-complete", stepNum < phase);
            step.classList.toggle("is-active", stepNum === phase);
        });

        // Update SVG diagram (in case it's visible)
        const targetNodes = nodeMap[phase] || [];
        svgNodes.forEach(n => n.classList.toggle("is-active", targetNodes.includes(n.getAttribute("data-node"))));
        svgLinks.forEach(l => l.classList.toggle("is-active", parseInt(l.getAttribute("data-phase-target")) <= phase));
        if (svgBall && ballTargetMap[phase]) {
            const bTarget = ballTargetMap[phase];
            svgBall.style.transform = `translate(${bTarget.cx - 30}px, ${bTarget.cy - 120}px)`;
        }
    }

    // Attach click handlers to phase tabs (mobile only)
    processPhases.forEach(phaseEl => {
        phaseEl.addEventListener('click', (e) => {
            if (!isMobileView()) return;
            e.preventDefault();
            e.stopPropagation();
            mobilePhase = parseInt(phaseEl.dataset.phase);
            updateMobilePhase(mobilePhase);
            phaseEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
    });

    // Attach click handlers to mobile stepper steps
    mobileSteps.forEach(step => {
        step.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            mobilePhase = parseInt(step.dataset.step);
            updateMobilePhase(mobilePhase);
            const matchingPhase = document.querySelector(`.processo-phase[data-phase="${mobilePhase}"]`);
            if (matchingPhase) {
                matchingPhase.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        });
    });

    // Initialize mobile phase on load
    if (isMobileView()) {
        updateMobilePhase(mobilePhase);
    }

    // ── Compute + apply scroll variables for ONE section ─────────────────
    function updateSection(sec, idx, y, vh) {
        // Use getBoundingClientRect().top + scrollY for absolute position, as offsetTop 
        // can be relative to parent containers (like .light-zone)
        const rect = sec.getBoundingClientRect();
        const top = rect.top + y;
        const h = sec.offsetHeight;

        // Entrance progress (0 to 1 as section slides up to stick)
        let pEnter = (y - (top - vh)) / vh;
        pEnter = Math.min(1, Math.max(0, pEnter));

        // Stuck progress (0 to 1 while pinned)
        let stickTime = Math.max(1, h - vh);
        let pStuck = (y - top) / stickTime;
        pStuck = Math.min(1, Math.max(0, pStuck));

        if (idx === 0 && y < 0) {
            pEnter = 1;
            pStuck = 0; // mobile rubber-band guard
        }

        // Base background is opaque from the start to prevent overlapping gradient transparency
        let pBgIn = 1;

        let pTextIn = 0;
        let pVisIn = 0;
        let pOut = pStuck > 0.85 ? (pStuck - 0.85) / 0.15 : 0;

        let pGlow = 0; // The glow element opacity

        if (idx === 0) {
            pBgIn = 1;
            pTextIn = 1;
            pVisIn = 1;
            pGlow = 1; // Hero glow is visible initially
            // Hero exits earlier so it doesn't stay dead on screen
            pOut = pStuck > 0.60 ? (pStuck - 0.60) / 0.40 : 0;
        } else {
            // Make content visible even earlier for a smoother transition
            pTextIn = pEnter > 0.05 ? Math.min(1, (pEnter - 0.05) / 0.4) : 0;
            pVisIn = pEnter > 0.1 ? Math.min(1, (pEnter - 0.1) / 0.4) : 0;
            pGlow = pEnter > 0.1 ? Math.min(1, (pEnter - 0.1) / 0.5) : 0;

            if (pStuck > 0) {
                pTextIn = 1;
                pVisIn = 1;
                pGlow = 1;
            }
        }

        const easeText = 1 - Math.pow(1 - pTextIn, 3);
        const easeVis = 1 - Math.pow(1 - pVisIn, 3);
        const opacityOut = Math.max(0, 1 - pOut);
        const scaleOut = 1 - pOut * 0.05;

        if (isMobileView()) {
            sec.style.setProperty('--bg-in', '1');
            sec.style.setProperty('--opacity-out', '1');
            sec.style.setProperty('--scale-out', '1');
            sec.style.setProperty('--text-in', '1');
            sec.style.setProperty('--vis-in', '1');
            sec.style.setProperty('--glow-in', '0'); // Optional: hide glow on mobile
            sec.style.setProperty('--p', '0.5');
        } else {
            sec.style.setProperty('--bg-in', pBgIn.toFixed(3));
            sec.style.setProperty('--opacity-out', opacityOut.toFixed(3));
            sec.style.setProperty('--scale-out', scaleOut.toFixed(3));
            sec.style.setProperty('--text-in', easeText.toFixed(3));
            sec.style.setProperty('--vis-in', easeVis.toFixed(3));
            sec.style.setProperty('--glow-in', pGlow.toString());
            sec.style.setProperty('--p', pStuck.toFixed(3));
        }

        // Expose pStuck as generic p just in case
        sec.style.setProperty('--p', pStuck.toFixed(3));

        // Process section (skip on mobile - use click handlers instead)
        if (sec.id === 'process' && !isMobileView()) {
            if (pStuck > 0) {
                updateProcessLogic(pStuck);
            } else {
                resetProcess();
            }
        }

        // Map trigger
        if (sec.id === 'map-hub' && (pEnter > 0.5 || isMobileView()) && !mapTriggered) {
            mapTriggered = true;
            if (mapWrapper && window.initWorldMap) {
                window.initWorldMap();
                mapWrapper.classList.add('is-visible');
            }
        }
    }

    // ── EVENT-DRIVEN scroll handler (passive, no rAF loop) ───────────────
    function onScroll() {
        const y = window.scrollY;
        const vh = window.innerHeight;
        sections.forEach((sec, idx) => updateSection(sec, idx, y, vh));
    }

    // Kick-off once on load
    onScroll();

    // Listen to scroll events (passive = browser never waits for us)
    window.addEventListener('scroll', onScroll, { passive: true });

    // Also update on resize (layout might shift)
    window.addEventListener('resize', onScroll, { passive: true });

    // Enable CSS transitions after first paint
    setTimeout(() => {
        document.querySelectorAll('.anim-text, .anim-visual').forEach(el => {
            el.style.transition = 'opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
        });
    }, 100);
});

/* ══════════════════════════════════════════════════════════════
   i18n — PT (source copy) ⇄ EN language switch.
   The HTML ships in Portuguese; this walks the DOM and swaps any
   string found in DICT for its English version. A minimal flag
   switcher is injected into the header on every page. The choice
   persists in localStorage ('on4u-lang'). Strings absent from the
   dictionary simply stay in Portuguese (graceful, incremental).
   ══════════════════════════════════════════════════════════════ */
(function () {
  var STORAGE = 'on4u-lang';
  var DICT = {
    "Divisões": "Divisions",
    "Produção & Criatividade": "Production & Creative",
    "Operação Internacional": "International Operations",
    "Health & Care": "Health & Care",
    "Informática": "IT",
    "Trabalhos": "Work",
    "Contacto": "Contact",
    "Pedir orçamento": "Request a quote",
    "Para equipas de Compras e Operações": "For Procurement and Operations teams",
    "Fornecimento e operação internacional por pedido, com controlo.": "On-demand international sourcing and operations, with control.",
    "Recebemos requisitos, validamos viabilidade e documentação, e coordenamos a execução até à entrega.": "We receive requirements, validate feasibility and documentation, and coordinate execution through to delivery.",
    "Sem catálogo fixo — cada pedido é tratado individualmente": "No fixed catalog — each request is handled individually",
    "Validação de viabilidade antes de avançar": "Feasibility validation before proceeding",
    "Documentação e coordenação integradas até entrega": "Integrated documentation and coordination through delivery",
    "Ver as divisões": "See the divisions",
    "Import · Export · Distribuição": "Import · Export · Distribution",
    "Sourcing · Fornecimento": "Sourcing · Supply",
    "Catálogo · Equipamento": "Catalog · Equipment",
    "Produção": "Production",
    "Design · Stands · Materiais": "Design · Stands · Materials",
    "sede": "headquarters",
    "STP · GB": "STP · GB",
    "presença": "presence",
    "CN · IN": "CN · IN",
    "escritórios": "offices",
    "Operações Internacionais": "International Operations",
    "Importação": "Import",
    "Exportação": "Export",
    "Distribuição": "Distribution",
    "Logística": "Logistics",
    "Quatro áreas. Um processo. Um ponto de contacto.": "Four areas. One process. One point of contact.",
    "Produção, comunicação visual e execução para projetos corporativos.": "Production, visual communication and execution for corporate projects.",
    "Stands, eventos e brinde corporativo": "Stands, events and corporate gifts",
    "Impressão, sinalética e materiais": "Printing, signage and materials",
    "Fardamentos e identidade visual": "Uniforms and visual identity",
    "Ver produção →": "View production →",
    "Importação, exportação e distribuição por pedido, com coordenação de ponta a ponta.": "On-demand import, export and distribution, with end-to-end coordination.",
    "Fornecimento & coordenação logística": "Supply & logistics coordination",
    "Documentação e processos alfandegários": "Documentation and customs procedures",
    "Aéreo · Terrestre · Marítimo": "Air · Land · Sea",
    "Ver operação →": "View operations →",
    "Seleção por itens e envio de pedido": "Item-by-item selection and request submission",
    "Validação manual antes da proposta": "Manual validation before the proposal",
    "Resposta com orçamento + próximos passos": "Response with a quote + next steps",
    "Distribuidor Certificado": "Certified Distributor",
    "Infarmed - Autoridade Nacional": "Infarmed - National Authority",
    "Ver Health & Care →": "View Health & Care →",
    "Catálogo suportado por parceiro especializado — acesso direto e encaminhamento simplificado.": "Catalog supported by a specialized partner — direct access and streamlined routing.",
    "Acesso direto ao catálogo": "Direct access to the catalog",
    "Pedidos no ambiente dedicado": "Orders in the dedicated environment",
    "Encaminhamento simplificado": "Streamlined routing",
    "Aceder →": "Access →",
    "Sem promessas vagas: pedido → validação → proposta → execução.": "No vague promises: request → validation → proposal → execution.",
    "Trabalhos selecionados": "Selected work",
    "Execução visível.": "Visible execution.",
    "Exemplos de projetos e entregas onde o importante foi coordenar requisitos, prazos e operação.": "Examples of projects and deliveries where the priority was coordinating requirements, deadlines and operations.",
    "O que foi pedido (requisitos)": "What was requested (requirements)",
    "O que foi validado (condições/documentação)": "What was validated (terms/documentation)",
    "O que foi entregue (resultado operacional)": "What was delivered (operational outcome)",
    "Stands & Eventos": "Stands & Events",
    "Stand Repsol, Ativação Corporativa": "Repsol Stand, Corporate Activation",
    "Ver detalhes": "View details",
    "Santa Casa da Misericórdia, Presença Institucional": "Santa Casa da Misericórdia, Institutional Presence",
    "Fardamentos e Merchandising Corporativo, HBD": "Corporate Uniforms and Merchandising, HBD",
    "Identidade Visual & Produção": "Visual Identity & Production",
    "Banco Central, São Tomé e Príncipe": "Central Bank, São Tomé e Príncipe",
    "Identidade Visual & Materiais Corporativos": "Visual Identity & Corporate Materials",
    "Fardamentos & Equipamentos": "Uniforms & Equipment",
    "Equipamento Especializado, Operação Internacional": "Specialized Equipment, International Operations",
    "Ver trabalhos": "View work",
    "Mostramos apenas o que pode ser partilhado.": "We show only what can be shared.",
    "Como funciona": "How it works",
    "Do requisito à entrega, com um único interlocutor.": "From requirement to delivery, with a single point of contact.",
    "A ON4U trabalha por pedido, sem catálogo fixo: cada requisito é validado antes de avançar e acompanhado por uma só pessoa até à entrega.": "ON4U works on demand, with no fixed catalog: each requirement is validated before proceeding and handled by a single person through to delivery.",
    "Requisito": "Requirement",
    "Recebemos o pedido com especificações, quantidades, destino e prazo.": "We receive the request with specifications, quantities, destination and deadline.",
    "Validação": "Validation",
    "Confirmamos viabilidade, condições e documentação necessária antes de avançar.": "We confirm feasibility, terms and required documentation before proceeding.",
    "Proposta": "Proposal",
    "Devolvemos enquadramento, prazos e etapas de execução.": "We return scope, deadlines and execution stages.",
    "Execução": "Execution",
    "Coordenamos a operação por marcos até à entrega.": "We coordinate the operation by milestones through to delivery.",
    "Para projetos internacionais, veja como coordenamos a operação de ponta a ponta.": "For international projects, see how we coordinate the operation end to end.",
    "Presença": "Presence",
    "Base em Portugal. Operação em pontos-chave.": "Based in Portugal. Operations at key points.",
    "A ON4U tem sede em Sintra (Portugal), presença operacional em São Tomé e Príncipe e na Guiné-Bissau, e escritórios na China e na Índia.": "ON4U is headquartered in Sintra (Portugal), with operational presence in São Tomé e Príncipe and Guiné-Bissau, and offices in China and India.",
    "Sede": "Headquarters",
    "Presença operacional": "Operational presence",
    "Índia": "India",
    "Escritório": "Office",
    "Parceiros.": "Partners.",
    "Perguntas frequentes": "Frequently asked questions",
    "O essencial, em poucas linhas.": "The essentials, in a few lines.",
    "O que faz a ON4U?": "What does ON4U do?",
    "A ON4U é uma empresa B2B portuguesa que coordena importação, produção, sourcing e distribuição nacional e internacional por pedido, organizada em quatro divisões: Produção & Criatividade, Operação Internacional, Health & Care e Informática. Não trabalha com catálogo fixo — cada requisito é validado antes de avançar e acompanhado por um único ponto de contacto até à entrega.": "ON4U is a Portuguese B2B company that coordinates on-demand import, production, sourcing and domestic and international distribution, organized into four divisions: Production & Creative, International Operations, Health & Care and IT. It does not work with a fixed catalog — each requirement is validated before proceeding and handled by a single point of contact through to delivery.",
    "Próximo passo": "Next step",
    "Envie o pedido. Receba proposta operacional e próximos passos.": "Send your request. Receive an operational proposal and next steps.",
    "Partilhe o que precisa, destino e prazo. Validamos viabilidade e devolvemos uma proposta com etapas claras.": "Share what you need, the destination and the deadline. We validate feasibility and return a proposal with clear stages.",
    "O que precisa": "What you need",
    "Quantidade / volumes (se souber)": "Quantity / volumes (if known)",
    "Destino e prazo desejado": "Destination and desired deadline",
    "Se faltar informação, começamos pelo essencial e alinhamos o restante.": "If information is missing, we start with the essentials and align the rest.",
    "ON4U, Importação, fornecimento e distribuição nacional e internacional por pedido.": "ON4U, on-demand domestic and international import, supply and distribution.",
    "Base em Portugal, presença em São Tomé e Príncipe e Guiné-Bissau, e escritórios na China e na Índia.": "Based in Portugal, with presence in São Tomé e Príncipe and Guiné-Bissau, and offices in China and India.",
    "Empresa": "Company",
    "Portefólio": "Portfolio",
    "Sobre a ON4U": "About ON4U",
    "Contactos": "Contacts",
    "Contactos Oficiais": "Official Contacts",
    "Certificação": "Certification",
    "Infarmed — Cert. 1866/DM/2023": "Infarmed — Cert. 1866/DM/2023",
    "Compromisso Pagamento Pontual 2026": "On-Time Payment Commitment 2026",
    "© 2026 ON4U. Todos os direitos reservados.": "© 2026 ON4U. All rights reserved.",
    "Privacidade": "Privacy",
    "Termos": "Terms"
  };

  var origText = new WeakMap();   // text node -> original PT value
  var origAttr = new WeakMap();   // element  -> { attr: original PT value }
  var ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }

  function textNodes() {
    if (!document.body) return [];
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !norm(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        var tag = n.parentNode && n.parentNode.nodeName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var out = [], node;
    while ((node = walker.nextNode())) out.push(node);
    return out;
  }

  function toEN() {
    textNodes().forEach(function (n) {
      var en = DICT[norm(n.nodeValue)];
      if (!en) return;
      if (!origText.has(n)) origText.set(n, n.nodeValue);
      var lead = (n.nodeValue.match(/^\s*/) || [''])[0];
      var trail = (n.nodeValue.match(/\s*$/) || [''])[0];
      n.nodeValue = lead + en + trail;
    });
    Array.prototype.forEach.call(document.body.querySelectorAll('*'), function (el) {
      ATTRS.forEach(function (a) {
        if (!el.hasAttribute(a)) return;
        var en = DICT[norm(el.getAttribute(a))];
        if (!en) return;
        if (!origAttr.has(el)) origAttr.set(el, {});
        var store = origAttr.get(el);
        if (!(a in store)) store[a] = el.getAttribute(a);
        el.setAttribute(a, en);
      });
    });
    document.documentElement.lang = 'en';
  }

  function toPT() {
    textNodes().forEach(function (n) { if (origText.has(n)) n.nodeValue = origText.get(n); });
    Array.prototype.forEach.call(document.body.querySelectorAll('*'), function (el) {
      if (!origAttr.has(el)) return;
      var store = origAttr.get(el);
      for (var a in store) { if (Object.prototype.hasOwnProperty.call(store, a)) el.setAttribute(a, store[a]); }
    });
    document.documentElement.lang = 'pt-PT';
  }

  function current() { return localStorage.getItem(STORAGE) === 'en' ? 'en' : 'pt'; }
  function apply(lang) { if (lang === 'en') toEN(); else toPT(); }

  var FLAGS = {
    pt: '<svg viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><rect width="20" height="14" fill="#da291c"/><rect width="8" height="14" fill="#046a38"/><circle cx="8" cy="7" r="2.5" fill="#ffcf00"/><circle cx="8" cy="7" r="1.15" fill="#fff"/><circle cx="8" cy="7" r="0.5" fill="#da291c"/></svg>',
    en: '<svg viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><rect width="20" height="14" fill="#fff"/><g fill="#b22234"><rect width="20" height="1.08"/><rect y="2.15" width="20" height="1.08"/><rect y="4.31" width="20" height="1.08"/><rect y="6.46" width="20" height="1.08"/><rect y="8.62" width="20" height="1.08"/><rect y="10.77" width="20" height="1.08"/><rect y="12.92" width="20" height="1.08"/></g><rect width="8.4" height="7.54" fill="#3c3b6e"/></svg>'
  };
  var CHECK = '<svg class="lang-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

  function refresh(lang) {
    var flag = document.getElementById('lang-btn-flag');
    var code = document.getElementById('lang-btn-code');
    if (flag) flag.innerHTML = FLAGS[lang];
    if (code) code.textContent = lang === 'en' ? 'EN' : 'PT';
    Array.prototype.forEach.call(document.querySelectorAll('.lang-opt'), function (o) {
      o.classList.toggle('is-current', o.getAttribute('data-lang') === lang);
    });
  }

  function buildSwitcher() {
    var actions = document.querySelector('.header-actions');
    if (!actions || document.getElementById('lang-switch')) return;
    var lang = current();
    var wrap = document.createElement('div');
    wrap.className = 'lang-switch';
    wrap.id = 'lang-switch';
    wrap.innerHTML =
      '<button class="lang-btn" id="lang-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Idioma / Language">' +
        '<span class="lang-flag" id="lang-btn-flag">' + FLAGS[lang] + '</span>' +
        '<span id="lang-btn-code">' + (lang === 'en' ? 'EN' : 'PT') + '</span>' +
        '<svg class="lang-chev" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="2 4 6 8 10 4"/></svg>' +
      '</button>' +
      '<div class="lang-menu" id="lang-menu" role="menu" hidden>' +
        '<button class="lang-opt" type="button" role="menuitem" data-lang="pt"><span class="lang-flag">' + FLAGS.pt + '</span>Português' + CHECK + '</button>' +
        '<button class="lang-opt" type="button" role="menuitem" data-lang="en"><span class="lang-flag">' + FLAGS.en + '</span>English' + CHECK + '</button>' +
      '</div>';
    var toggle = actions.querySelector('.theme-toggle');
    if (toggle) actions.insertBefore(wrap, toggle); else actions.appendChild(wrap);

    var btn = wrap.querySelector('#lang-btn');
    var menu = wrap.querySelector('#lang-menu');
    function setOpen(open) { menu.hidden = !open; btn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
    btn.addEventListener('click', function (e) { e.stopPropagation(); setOpen(menu.hidden); });
    Array.prototype.forEach.call(wrap.querySelectorAll('.lang-opt'), function (opt) {
      opt.addEventListener('click', function (e) {
        e.stopPropagation();
        var l = opt.getAttribute('data-lang');
        localStorage.setItem(STORAGE, l);
        apply(l);
        refresh(l);
        setOpen(false);
      });
    });
    document.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    refresh(lang);
  }

  function init() { buildSwitcher(); if (current() === 'en') apply('en'); }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
  else { init(); }
})();
