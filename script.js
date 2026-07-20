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
    "Termos": "Terms",
    "Deslize para explorar": "Scroll to explore",
    "(opcional)": "(optional)",
    "2635-634 Rio de Mouro, Portugal": "2635-634 Rio de Mouro, Portugal",
    "A ON4U é distribuidor certificado?": "Is ON4U a certified distributor?",
    "A ON4U é distribuidora certificada pela Infarmed — Autoridade Nacional do Medicamento e Produtos de Saúde, ao abrigo do certificado n.º 1866/DM/2023.": "ON4U is a distributor certified by Infarmed — the National Authority of Medicines and Health Products, under certificate no. 1866/DM/2023.",
    "A Operação Internacional da ON4U coordena importação, exportação, sourcing e distribuição por pedido — incluindo documentação, processos alfandegários e transporte aéreo, terrestre e marítimo.": "ON4U's International Operations coordinates import, export, sourcing, and distribution on demand — including documentation, customs procedures, and air, road, and sea transportation.",
    "A certificação está disponível para consulta. É a base sobre a qual fazemos o sourcing e o fornecimento de produtos de saúde por pedido.": "The certification is available for review. It is the foundation on which we source and supply health products on demand.",
    "A divisão de Informática assenta num catálogo dedicado, mantido com um parceiro especializado em equipamento informático. O acesso é direto e o pedido é encaminhado de forma simplificada — com a identidade ON4U a garantir consistência.": "The IT division is built on a dedicated catalog, maintained with a partner specialized in IT equipment. Access is direct and requests are routed in a simplified way — with the ON4U identity ensuring consistency.",
    "A validação é manual e feita item a item, antes da proposta. Revemos requisitos e documentação de cada item — só avança o que está em conformidade.": "Validation is manual and done item by item, before the proposal. We review each item's requirements and documentation — only what is compliant moves forward.",
    "Abrir menu": "Open menu",
    "Aceda ao catálogo do parceiro ou envie o requisito diretamente — tratamos do encaminhamento.": "Access the partner's catalog or send your requirement directly — we handle the routing.",
    "Acede ao catálogo do parceiro a partir desta página. Escolhe o que precisa e o pedido é encaminhado para a ON4U, que acompanha até à resposta. Se preferir, pode enviar o requisito diretamente e nós tratamos do encaminhamento.": "Access the partner's catalog from this page. Choose what you need and the request is routed to ON4U, which follows it through to a response. If you prefer, you can send your requirement directly and we handle the routing.",
    "Aceder ao catálogo": "Access the catalog",
    "Aceder à área": "Access the area",
    "Acompanhamos a entrega e a montagem no local, até estar pronto.": "We oversee delivery and on-site assembly, until everything is ready.",
    "Alguns projetos.": "Selected projects.",
    "Alternar tema": "Toggle theme",
    "Alternar tema claro/escuro": "Toggle light/dark theme",
    "América do Norte": "North America",
    "América do Sul": "South America",
    "Antes de enviar o pedido.": "Before you send your request.",
    "Antes de qualquer compromisso, confirmamos viabilidade, condições e documentação. É o filtro que evita surpresas na alfândega, no prazo ou na qualidade.": "Before any commitment, we confirm feasibility, terms, and documentation. It's the filter that prevents surprises at customs, on the deadline, or in quality.",
    "Apoio a projetos corporativos (ex.: eventos/stands) quando aplicável": "Support for corporate projects (e.g., events/booths) when applicable",
    "Articulação entre recolha, expedição, processos aduaneiros e entrega (quando necessário)": "Coordination across pickup, shipping, customs procedures, and delivery (when needed)",
    "Aéreo": "Air",
    "Banco Central de São Tomé e Príncipe": "Central Bank of São Tomé e Príncipe",
    "Banco Central de São Tomé e Príncipe — identidade visual": "Central Bank of São Tomé e Príncipe — visual identity",
    "Banco Central, São Tomé e Príncipe — Identidade visual": "Central Bank, São Tomé e Príncipe — Visual identity",
    "Base e presença em pontos-chave para a operação internacional.": "A base and presence at key points for international operations.",
    "Base em Portugal": "Based in Portugal",
    "Base em Portugal. Operação internacional ajustada a cada destino.": "Based in Portugal. International operations tailored to each destination.",
    "Bento mosaico": "Bento mosaic",
    "Briefing": "Briefing",
    "Caminho de navegação": "Breadcrumb",
    "Característica": "Feature",
    "Catálogo dedicado suportado por parceiro especializado": "Dedicated catalog supported by a specialized partner",
    "Catálogo dedicado, suportado por parceiro especializado — com acesso direto e encaminhamento simplificado dos pedidos.": "A dedicated catalog, backed by a specialized partner — with direct access and simplified request routing.",
    "Catálogo suportado por parceiro especializado.": "A catalog backed by a specialized partner.",
    "Catálogo via parceiro especializado.": "Catalog via a specialized partner.",
    "Centro operacional": "Operations hub",
    "Cert. 1866/DM/2023": "Cert. 1866/DM/2023",
    "China": "China",
    "China e Índia": "China and India",
    "Cidade ou país": "City or country",
    "Cobertura": "Coverage",
    "Como a Operação Internacional está por trás do sourcing, conseguimos chegar a fornecedores fora do circuito habitual — mantendo a documentação e a conformidade como base.": "Because International Operations is behind the sourcing, we can reach suppliers outside the usual circuit — keeping documentation and compliance as the foundation.",
    "Como acede e quem trata.": "How you access it and who handles it.",
    "Como aceder": "How to access",
    "Como começa um pedido?": "How does a request start?",
    "Como funciona o acesso ao catálogo de Informática.": "How access to the IT catalog works.",
    "Como funciona.": "How it works.",
    "Como trabalhamos": "How we work",
    "Como trabalhamos.": "How we work.",
    "Como é validada a conformidade dos produtos?": "How is product compliance validated?",
    "Conceção, produção e montagem de stands e espaços de marca para feiras e eventos, coordenados para estar prontos no dia.": "Design, production, and assembly of stands and brand spaces for trade shows and events, coordinated to be ready on the day.",
    "Confirmamos viabilidade e prazo, e devolvemos proposta com etapas.": "We confirm feasibility and deadline, and return a proposal with stages.",
    "Confirmamos viabilidade, condições e documentação necessária.": "We confirm feasibility, terms, and required documentation.",
    "Conformidade": "Compliance",
    "Conformidade e pedidos.": "Compliance and requests.",
    "Consolidação — agregação de encomendas para otimizar transporte e custo.": "Consolidation — combining orders to optimize transportation and cost.",
    "Consulta o equipamento disponível sem intermediários.": "Browse the available equipment with no intermediaries.",
    "Contacto | Pedir Orçamento | ON4U": "Contact | Request a Quote | ON4U",
    "Continuar →": "Continue →",
    "Controlo": "Control",
    "Coordenam transporte aéreo, terrestre e marítimo?": "Do you coordinate air, road, and sea transportation?",
    "Coordenamos a operação por marcos até à entrega e fecho.": "We coordinate the operation by milestones through delivery and close-out.",
    "Coordenamos a produção das peças com o prazo do evento como referência.": "We coordinate production of the pieces with the event deadline as the reference.",
    "Coordenação central, validação e próximos passos.": "Central coordination, validation, and next steps.",
    "Coordenação contínua até à entrega e fecho.": "Continuous coordination through delivery and closeout.",
    "Coordenação de produção com foco em prazos e execução": "Production coordination focused on deadlines and execution",
    "Coordenação internacional do fornecimento à entrega.": "International coordination from supply to delivery.",
    "Coordenação operacional por marcos até à entrega, com um único ponto de contacto do início ao fecho.": "Operational coordination by milestones through delivery, with a single point of contact from start to closeout.",
    "De que mercados fazem sourcing?": "Which markets do you source from?",
    "Definida pelo destino, pelo tipo de fornecimento e pelas exigências do projeto.": "Defined by the destination, the type of supply, and the project's requirements.",
    "Descreva o pedido": "Describe the request",
    "Descreva o pedido — produto, serviço ou projeto.": "Describe the request — product, service, or project.",
    "Descreva o requisito — produto, serviço ou projeto.": "Describe the requirement — product, service, or project.",
    "Destino": "Destination",
    "Destino e prazo": "Destination and deadline",
    "Devolvemos orçamento e os próximos passos claros, sem compromisso até confirmar.": "We return a quote and clear next steps, with no commitment until you confirm.",
    "Devolvemos um orçamento e os próximos passos. Não há compromisso até confirmar.": "We return a quote and the next steps. There is no commitment until you confirm.",
    "Diferenciais": "Differentiators",
    "Diga-nos o objetivo, as peças e a data. Validamos o prazo e devolvemos proposta com etapas — para chegar pronto ao dia.": "Tell us the objective, the pieces, and the date. We validate the deadline and return a proposal with stages — so everything arrives ready on the day.",
    "Diga-nos o que precisa, o destino e o prazo. Validamos a viabilidade e devolvemos proposta com etapas claras.": "Tell us what you need, the destination, and the deadline. We validate feasibility and return a proposal with clear stages.",
    "Diga-nos o que precisa, o destino e o prazo. Validamos a viabilidade e devolvemos uma proposta com os próximos passos. Sem compromisso.": "Tell us what you need, the destination, and the deadline. We validate feasibility and return a proposal with the next steps. No commitment.",
    "Diga-nos o que precisa.": "Tell us what you need.",
    "Distribuidor Certificado · Infarmed 1866/DM/2023": "Certified Distributor · Infarmed 1866/DM/2023",
    "Distribuidor certificado pela Infarmed.": "Infarmed-certified distributor.",
    "Distribuidor certificado pela Infarmed. Indica o que precisa — validamos cada item antes de qualquer proposta.": "Infarmed-certified distributor. Tell us what you need — we validate each item before any proposal.",
    "Distribuição — entrega no destino final, dentro ou fora de Portugal.": "Distribution — delivery to the final destination, inside or outside Portugal.",
    "Do briefing à entrega, com uma cara só.": "From briefing to delivery, with a single point of contact.",
    "Documentação e processos alfandegários — preparação e acompanhamento da documentação necessária ao desembaraço.": "Documentation and customs procedures — preparing and tracking the documentation required for customs clearance.",
    "Documentação integrada desde o início": "Documentation integrated from the start",
    "Em produção aplicamos o mesmo processo do resto da ON4U: validamos antes de avançar e coordenamos a execução até ao dia. Em vez de gerir gráfica, montador e fornecedor de têxtil em separado, fala com um único interlocutor.": "In production we apply the same process as the rest of ON4U: we validate before moving forward and coordinate execution right up to the day. Instead of managing the print shop, installer, and textile supplier separately, you talk to a single point of contact.",
    "Email": "Email",
    "Empresa operacional B2B sediada em Portugal, com presença internacional. Coordenamos fornecimento, produção e operação internacional por pedido.": "An operational B2B company headquartered in Portugal, with an international presence. We coordinate supply, production, and international operations on demand.",
    "Enquadramento, prazos e etapas de execução — devolvidos como proposta clara, sem promessas vagas.": "Scope, deadlines, and execution stages — returned as a clear proposal, with no vague promises.",
    "Entrega & montagem": "Delivery & assembly",
    "Enviar pedido": "Send request",
    "Envie o requisito com especificações, quantidades, destino e prazo. Validamos a viabilidade e devolvemos uma proposta com etapas claras. O processo é: requisito → validação → proposta → execução.": "Send the requirement with specifications, quantities, destination, and deadline. We validate feasibility and return a proposal with clear stages. The process is: requirement → validation → proposal → execution.",
    "Equipamento & Fornecimento": "Equipment & Supply",
    "Equipamento e fornecimento — operação internacional": "Equipment and supply — international operations",
    "Equipamento especializado — Operação internacional": "Specialized equipment — International operations",
    "Equipamento especializado — operação internacional": "Specialized equipment — international operations",
    "Equipamento industrial": "Industrial equipment",
    "Equipamento informático para empresas, com parceiro especializado.": "IT equipment for businesses, with a specialized partner.",
    "Equipamento informático para empresas.": "IT equipment for businesses.",
    "Escritórios": "Offices",
    "Escritórios de apoio à origem e sourcing.": "Support offices for origin and sourcing.",
    "Especificações, quantidades, destino, prazo e restrições. Tudo o que define o pedido fica registado antes de qualquer compromisso.": "Specifications, quantities, destination, deadline, and constraints. Everything that defines the request is recorded before any commitment.",
    "Estruturas diferentes conforme a necessidade, mantendo validação, documentação e acompanhamento como base.": "Different structures depending on the need, with validation, documentation, and follow-up as the foundation.",
    "Etapas definidas conforme origem, destino, prazo e restrições do pedido": "Stages defined according to the request's origin, destination, deadline, and constraints",
    "Europa": "Europe",
    "Eventos & stands · Coordenação total": "Events & booths · Full coordination",
    "Eventos e brinde corporativo": "Events and corporate gifts",
    "Ex.: 500 unidades": "E.g., 500 units",
    "Ex.: 500 unidades de fardamento corporativo, entrega em Lisboa": "E.g., 500 units of corporate uniforms, delivery in Lisbon",
    "Ex.: até 30/07/2026, ou \"3 semanas\"": "E.g., by 07/30/2026, or \"3 weeks\"",
    "Ex.: número de unidades, volume estimado.": "E.g., number of units, estimated volume.",
    "Execução & Acompanhamento": "Execution & Follow-Up",
    "Execução local": "Local execution",
    "Exportação — colocação de mercadoria de origem portuguesa em mercados internacionais.": "Export — placing goods of Portuguese origin in international markets.",
    "Falar com Operações": "Talk to Operations",
    "Falar connosco": "Talk to us",
    "Falar sobre um projeto": "Talk about a project",
    "Fardamentos e Merchandising HBD": "HBD Uniforms and Merchandising",
    "Fardamentos e aplicação da identidade visual em têxtil e materiais, para a marca aparecer igual em toda a equipa e em todos os pontos.": "Uniforms and application of the visual identity to textiles and materials, so the brand looks the same across the whole team and at every touchpoint.",
    "Fardamentos e merchandising corporativo, HBD": "Uniforms and corporate merchandising, HBD",
    "Feitos de forma direta, com a identidade ON4U.": "Placed directly, under the ON4U identity.",
    "Filtrar trabalhos por categoria": "Filter work by category",
    "Fluxo simples para consulta e pedido": "A simple flow for browsing and ordering",
    "Fornecemos produtos de saúde por pedido. Em vez de um catálogo fixo, partimos do requisito: indica o que precisa e fazemos o sourcing da fonte adequada, com validação de conformidade antes da proposta.": "We supply health products on demand. Instead of a fixed catalog, we start from the requirement: tell us what you need and we source it from the appropriate supplier, with compliance validation before the proposal.",
    "Frase": "Statement",
    "Guiné-Bissau": "Guiné-Bissau",
    "Guiné-Bissau — Presença local & operação": "Guiné-Bissau — Local presence & operations",
    "Guiné-Bissau — presença local e operação": "Guiné-Bissau — local presence and operations",
    "Hardware, periféricos e soluções tecnológicas": "Hardware, peripherals, and technology solutions",
    "Health & Care | Sourcing de Produtos de Saúde | ON4U": "Health & Care | Health Product Sourcing | ON4U",
    "Identidade ON4U para consistência e confiança": "ON4U identity for consistency and trust",
    "Identidade Visual": "Visual Identity",
    "Identidade visual & materiais corporativos": "Visual identity & corporate materials",
    "Identidade visual e materiais corporativos — mockups": "Visual identity and corporate materials — mockups",
    "Importação — entrada de mercadoria de fornecedores internacionais para Portugal e outros destinos.": "Import — bringing goods from international suppliers into Portugal and other destinations.",
    "Importação • Exportação • Distribuição internacional por pedido": "Import • Export • International distribution on demand",
    "Importação, exportação, sourcing e distribuição por pedido.": "Import, export, sourcing, and distribution on demand.",
    "Importação, fornecimento e distribuição internacional por pedido, com controlo.": "International import, supply, and distribution on demand, with control.",
    "Indica os itens pretendidos, com quantidades e destino, e envia o pedido. Não precisa de partir de um catálogo: o pedido define o que procuramos.": "List the items you want, with quantities and destination, and send your request. You don't need to start from a catalog: the request defines what we look for.",
    "Indique os itens, as quantidades e o destino. Validamos cada item e devolvemos orçamento com os próximos passos.": "List the items, quantities, and destination. We validate each item and return a quote with the next steps.",
    "Infarmed — Autoridade Nacional do Medicamento e Produtos de Saúde": "Infarmed — National Authority of Medicines and Health Products",
    "Informática | Equipamento e Catálogo B2B | ON4U": "IT | Equipment and B2B Catalog | ON4U",
    "Integração com a operação internacional quando necessário": "Integration with international operations when needed",
    "Início": "Home",
    "Legal": "Legal",
    "Linha": "Line",
    "Linhas com foco dedicado": "Lines with dedicated focus",
    "Mapa de operação internacional": "International operations map",
    "Mapa — ON4U, Núcleo Empresarial da Abrunheira, Rio de Mouro": "Map — ON4U, Núcleo Empresarial da Abrunheira, Rio de Mouro",
    "Marítimo": "Sea",
    "Materiais impressos, sinalética e suportes de comunicação — da arte final à produção, com consistência entre todas as peças.": "Printed materials, signage, and communication media — from final artwork to production, with consistency across every piece.",
    "Mesmo uma estimativa ajuda. Pode deixar em branco se ainda não souber.": "Even an estimate helps. You can leave it blank if you don't know yet.",
    "Mobile": "Mobile",
    "Mockups de identidade visual": "Visual identity mockups",
    "Modo": "Mode",
    "Modos de transporte": "Modes of transportation",
    "Morada": "Address",
    "Nome": "Name",
    "Não trabalhamos com catálogo fixo: cada necessidade é tratada individualmente, validada antes de avançar e executada com um único ponto de contacto até à entrega.": "We don't work from a fixed catalog: each need is handled individually, validated before moving forward, and executed with a single point of contact through to delivery.",
    "Núcleo Empresarial da Abrunheira (Zona Poente), Armazém 14": "Núcleo Empresarial da Abrunheira (Zona Poente), Warehouse 14",
    "Núcleo Empresarial da Abrunheira (Zona Poente), Armazém 14 2635-634 Rio de Mouro, Portugal": "Núcleo Empresarial da Abrunheira (Zona Poente), Armazém 14 2635-634 Rio de Mouro, Portugal",
    "Núcleo Empresarial da Abrunheira (Zona Poente), Armazém 14, 2635-634 Rio de Mouro, Portugal.": "Núcleo Empresarial da Abrunheira (Zona Poente), Armazém 14, 2635-634 Rio de Mouro, Portugal.",
    "O ON4U Group tem presença em Portugal, São Tomé e Príncipe e Guiné-Bissau, e escritórios na China e na Índia.": "The ON4U Group has a presence in Portugal, São Tomé e Príncipe, and Guiné-Bissau, and offices in China and India.",
    "O ON4U Group é uma empresa B2B sediada em Rio de Mouro, Portugal, que coordena importação, produção, sourcing e distribuição internacional por pedido.": "ON4U Group is a B2B company headquartered in Rio de Mouro, Portugal, coordinating import, production, sourcing, and international distribution on demand.",
    "O modo é decidido na fase de validação, em função de prazo, volume e custo do pedido.": "The mode is decided during the validation phase, based on the request's deadline, volume, and cost.",
    "O pedido segue direto para quem o trata.": "Your request goes straight to the person who handles it.",
    "O que coordenamos": "What we coordinate",
    "O que fazemos.": "What we do.",
    "O que fornecemos.": "What we supply.",
    "O que precisa?": "What do you need?",
    "O que recebo depois de enviar o pedido?": "What do I receive after sending my request?",
    "O que significa": "What it means",
    "O que tratamos num pedido internacional.": "What we handle in an international request.",
    "O serviço": "The service",
    "O sourcing assenta na nossa operação internacional — a mesma máquina de validação, documentação e logística.": "Sourcing is built on our international operations — the same validation, documentation, and logistics machine.",
    "ON4U Group — Importação, fornecimento e distribuição nacional e internacional por pedido.": "ON4U Group — On-demand national and international import, supply, and distribution.",
    "ON4U Homepage": "ON4U Homepage",
    "ON4U por pedido": "ON4U on demand",
    "ON4U | Importação, Produção e Distribuição B2B por Pedido": "ON4U | On-Demand B2B Import, Production, and Distribution",
    "ON4U — Soluções Operacionais": "ON4U — Operational Solutions",
    "ON4U — empresa B2B de fornecimento por pedido.": "ON4U — a B2B on-demand supply company.",
    "Obrigado.": "Thank you.",
    "Onde estamos": "Where we are",
    "Onde operamos.": "Where we operate.",
    "Onde tem de chegar e até quando.": "Where it needs to arrive and by when.",
    "Operamos em quatro divisões — Produção & Criatividade, Operação Internacional, Health & Care e Informática — sobre o mesmo processo. A mesma máquina de sourcing, validação e logística serve as quatro: muda o que se entrega, não a forma como se trabalha.": "We operate four divisions — Production & Creative, International Operations, Health & Care, and IT — on the same process. The same sourcing, validation, and logistics machine serves all four: what changes is what we deliver, not how we work.",
    "Operação internacional por pedido": "International operations on demand",
    "Opção A": "Option A",
    "Opção B": "Option B",
    "Opção C": "Option C",
    "Organização e produção de eventos e brinde corporativo personalizado, do conceito à logística no terreno.": "Organization and production of events and personalized corporate gifts, from concept to on-the-ground logistics.",
    "Origens e destinos por rota rodoviária, dentro de prazos intermédios.": "Origins and destinations along road routes, within intermediate deadlines.",
    "Origens e destinos por rota rodoviária, em prazos intermédios.": "Origins and destinations along road routes, on intermediate deadlines.",
    "Orçamento e próximos passos": "Quote and next steps",
    "PT": "PT",
    "Palco interativo": "Interactive stage",
    "Para fornecimento fora do catálogo, esta divisão liga à nossa operação internacional.": "For supply outside the catalog, this division connects to our international operations.",
    "Para o nosso modelo completo, veja como trabalhamos.": "For our full model, see how we work.",
    "Para onde operamos": "Where we operate",
    "Para onde respondemos?": "Where should we send our reply?",
    "Para produtos de saúde de fonte certificada, veja produtos de saúde por pedido.": "For health products from a certified source, see health products on demand.",
    "Para projetos internacionais, veja como": "For international projects, see how",
    "Parceiro certificado · Catálogo ativo": "Certified partner · Active catalog",
    "Partilhe o que precisa, destino e prazo. Validamos a viabilidade e devolvemos uma proposta com etapas claras, sem promessas vagas.": "Share what you need, the destination, and the deadline. We validate feasibility and return a proposal with clear stages, no vague promises.",
    "Partilhe o que precisa, o destino e o prazo. Validamos a viabilidade e devolvemos uma proposta com etapas claras.": "Share what you need, the destination, and the deadline. We validate feasibility and return a proposal with clear stages.",
    "Passo 1 de 4": "Step 1 of 4",
    "Passo 2 de 4": "Step 2 of 4",
    "Passo 3 de 4": "Step 3 of 4",
    "Passo 4 de 4": "Step 4 of 4",
    "Pedido": "Request",
    "Pedido de orçamento": "Quote request",
    "Pedido → confirmação → validação → proposta + próximos passos.": "Request → confirmation → validation → proposal + next steps.",
    "Pedidos num ambiente dedicado": "Requests in a dedicated environment",
    "Pedir orçamento | ON4U": "Request a quote | ON4U",
    "Peça orçamento.": "Request a quote.",
    "Por pedido. Não temos catálogo fixo — cada requisito é tratado individualmente, validado antes de avançar e acompanhado até à entrega.": "On demand. We have no fixed catalog — each requirement is handled individually, validated before moving forward, and tracked through delivery.",
    "Portugal": "Portugal",
    "Posso pedir produtos que não estão num catálogo?": "Can I request products that aren't in a catalog?",
    "Prazo": "Deadline",
    "Prazo desejado": "Desired deadline",
    "Prazos curtos, volumes mais pequenos ou alto valor.": "Short deadlines, smaller volumes, or high value.",
    "Principal": "Main",
    "Processo": "Process",
    "Processo curto, claro e auditável.": "A short, clear, auditable process.",
    "Produtos e equipamentos para saúde e bem-estar": "Products and equipment for health and well-being",
    "Produção & Criatividade | Stands, Eventos, Fardamentos | ON4U": "Production & Creative | Stands, Events, Uniforms | ON4U",
    "Produção e comunicação visual para projetos corporativos.": "Production and visual communication for corporate projects.",
    "Progresso do pedido": "Request progress",
    "Projetos": "Projects",
    "Projetos corporativos e eventos com execução estruturada": "Corporate projects and events with structured execution",
    "Projetos onde o que importou foi coordenar requisitos, prazos e operação. Mostramos só o que pode ser partilhado.": "Projects where what mattered was coordinating requirements, deadlines, and operations. We only show what can be shared.",
    "Proposta & Planeamento": "Proposal & Planning",
    "Quando faz sentido": "When it makes sense",
    "Quando precisa?": "When do you need it?",
    "Quando um projeto precisa de fornecimento ou logística internacional, ligamos à nossa operação internacional.": "When a project needs international supply or logistics, we bring in our international operations.",
    "Quantidade / volumes": "Quantity / volumes",
    "Quantidade e destino": "Quantity and destination",
    "Quantidade e destino.": "Quantity and destination.",
    "Quatro divisões, o mesmo processo.": "Four divisions, the same process.",
    "Quatro passos rápidos. Validamos a viabilidade e respondemos com os próximos passos — sem compromisso.": "Four quick steps. We validate feasibility and respond with the next steps — no commitment.",
    "Quem somos": "Who we are",
    "Recebemos": "We receive",
    "Recebemos o que precisa: objetivo, peças, quantidades, local e data.": "We receive what you need: objective, pieces, quantities, location, and date.",
    "Recebemos o requisito → validamos a viabilidade → devolvemos a proposta → coordenamos a execução até à entrega.": "We receive the requirement → validate feasibility → return the proposal → coordinate execution through delivery.",
    "Recebemos o requisito, validamos viabilidade e documentação, e coordenamos sourcing, transporte e desembaraço aduaneiro até à entrega — com um único interlocutor.": "We receive the requirement, validate feasibility and documentation, and coordinate sourcing, transportation, and customs clearance through delivery — with a single point of contact.",
    "Rede de execução": "Execution network",
    "Rede de parceiros": "Partner network",
    "Requisitos": "Requirements",
    "Requisitos confirmados antes de avançar": "Requirements confirmed before moving forward",
    "Requisitos e próximos passos sempre claros.": "Requirements and next steps always clear.",
    "Revemos cada item manualmente — requisitos e documentação — antes de seguir. É aqui que confirmamos que o que vai avançar está em conformidade.": "We review each item manually — requirements and documentation — before proceeding. This is where we confirm that what moves forward is compliant.",
    "Rodoviário": "Road",
    "Rota": "Route",
    "STP • Bissau": "STP • Bissau",
    "Saltar para o conteúdo": "Skip to content",
    "Santa Casa da Misericórdia — Presença institucional": "Santa Casa da Misericórdia — Institutional presence",
    "Santa Casa da Misericórdia — presença institucional": "Santa Casa da Misericórdia — institutional presence",
    "Sede em Portugal, presença operacional em São Tomé e Príncipe e na Guiné-Bissau, e escritórios na China e na Índia — perto da origem e do destino da maioria dos pedidos.": "Headquartered in Portugal, with an operational presence in São Tomé e Príncipe and Guiné-Bissau, and offices in China and India — close to the origin and destination of most requests.",
    "Seguimento por marcos operacionais até ao fecho": "Tracking by operational milestones through closeout",
    "Seleção e pedido": "Selection and request",
    "Seleção por itens e envio de pedido para orçamento": "Item-by-item selection and request submission for a quote",
    "Sem atalhos. Cada fase reduz risco antes de avançar para a seguinte.": "No shortcuts. Each phase reduces risk before moving on to the next.",
    "Sem compromisso. Respondemos com a viabilidade e os próximos passos.": "No commitment. We respond with feasibility and the next steps.",
    "Serviços": "Services",
    "Sim. A ON4U é distribuidora certificada pela Infarmed — Autoridade Nacional do Medicamento e Produtos de Saúde, ao abrigo do certificado n.º 1866/DM/2023. O certificado está disponível para consulta.": "Yes. ON4U is a distributor certified by Infarmed — the National Authority of Medicines and Health Products, under certificate no. 1866/DM/2023. The certificate is available for review.",
    "Sim. A documentação e os processos alfandegários são tratados desde a fase de validação — antes de avançar, confirmamos o que é necessário para o desembaraço no destino.": "Yes. Documentation and customs procedures are handled from the validation phase onward — before moving forward, we confirm what is required for customs clearance at the destination.",
    "Sim. O modo de transporte é decidido na validação, em função do prazo, do volume e do custo de cada pedido.": "Yes. The mode of transportation is decided during validation, based on each request's deadline, volume, and cost.",
    "Sim. Trabalhamos por pedido, sem catálogo fixo. Indica o que precisa e fazemos o sourcing da fonte adequada.": "Yes. We work on demand, with no fixed catalog. Tell us what you need and we source it from the appropriate supplier.",
    "Sobre": "About",
    "Sobre a ON4U | Empresa B2B por Pedido em Portugal": "About ON4U | On-Demand B2B Company in Portugal",
    "Sourcing": "Sourcing",
    "Sourcing de produtos de saúde por pedido. Distribuidor certificado pela Infarmed (Cert. 1866/DM/2023).": "Sourcing of health products on demand. Distributor certified by Infarmed (Cert. 1866/DM/2023).",
    "Sourcing e fornecimento de produtos de saúde por pedido.": "Sourcing and supply of health products on demand.",
    "Sourcing — identificação e validação de fornecedores, com origem na China e na Índia, entre outros.": "Sourcing — identifying and validating suppliers, with origins in China and India, among others.",
    "Stand Repsol": "Repsol Stand",
    "Stand Repsol — Ativação corporativa": "Repsol Stand — Corporate activation",
    "Stand Repsol — ativação corporativa": "Repsol stand — corporate activation",
    "Stand Santa Casa da Misericórdia": "Santa Casa da Misericórdia Stand",
    "Stands e ativações corporativas": "Stands and corporate activations",
    "Stands, eventos, fardamentos, sinalética e identidade visual — coordenados do briefing à entrega, com um único interlocutor e o prazo do evento como referência.": "Stands, events, uniforms, signage, and visual identity — coordinated from briefing to delivery, with a single point of contact and the event deadline as the reference.",
    "Stands, eventos, fardamentos, sinalética e identidade visual.": "Stands, events, uniforms, signage, and visual identity.",
    "Suporte local para alinhamentos e execução.": "Local support for alignment and execution.",
    "São Tomé & Príncipe": "São Tomé & Príncipe",
    "São Tomé e Príncipe": "São Tomé e Príncipe",
    "Telefone": "Phone",
    "Tem um projeto com data marcada?": "Have a project with a set date?",
    "Tem um projeto?": "Have a project?",
    "Tem um requisito? Falamos a partir daí.": "Have a requirement? Let's start there.",
    "Temos escritórios na China e na Índia e presença operacional em São Tomé e Príncipe e na Guiné-Bissau. O sourcing parte daí, sem ficar limitado a uma origem: avaliamos a fonte que melhor responde ao requisito.": "We have offices in China and India and an operational presence in São Tomé e Príncipe and Guiné-Bissau. Sourcing starts there, without being limited to a single origin: we evaluate the source that best meets the requirement.",
    "Tenho um único interlocutor ou vários?": "Do I have a single point of contact or several?",
    "Terrestre": "Road",
    "Todos": "All",
    "Trabalham com catálogo fixo ou por pedido?": "Do you work from a fixed catalog or on demand?",
    "Trabalhos e referências.": "Work and references.",
    "Trabalhos | Projetos e Referências | ON4U": "Work | Projects and References | ON4U",
    "Transporte, manuseamento e processos locais — execução por destino.": "Transportation, handling, and local procedures — execution by destination.",
    "Tratam da documentação e do processo aduaneiro?": "Do you handle documentation and the customs process?",
    "Três frentes, um único padrão: processo e execução.": "Three fronts, one standard: process and execution.",
    "Um interlocutor único, do requisito à entrega.": "A single point of contact, from requirement to delivery.",
    "Um ponto de contacto até ao fecho": "One point of contact through closeout",
    "Um ponto de controlo para validar, coordenar e executar.": "One control point to validate, coordinate, and execute.",
    "Um único ponto de contacto, do requisito à entrega. Não passamos o pedido entre intermediários.": "A single point of contact, from requirement to delivery. We don't pass the request between intermediaries.",
    "Uma data ou um prazo aproximado.": "A date or an approximate timeframe.",
    "Uma só equipa liga fornecedor, transporte e destino. Não passamos o pedido de mão em mão entre intermediários: coordenamos cada etapa e respondemos por todas.": "One team connects supplier, transportation, and destination. We don't pass the request from hand to hand between intermediaries: we coordinate every stage and answer for all of them.",
    "Validamos a viabilidade e respondemos com os próximos passos.": "We validate feasibility and respond with the next steps.",
    "Validação & proposta": "Validation & proposal",
    "Validação manual antes da proposta (requisitos e documentação)": "Manual validation before the proposal (requirements and documentation)",
    "Validação manual e de conformidade": "Manual and compliance validation",
    "Vamos validar a viabilidade e responder em 24–48h úteis. Se o seu cliente de email não abriu, escreva-nos para info@on4u.pt.": "We will validate feasibility and reply within 24–48 business hours. If your email client didn't open, write to us at info@on4u.pt.",
    "Veja o catálogo ou diga-nos o que precisa.": "See the catalog or tell us what you need.",
    "Ver certificado (PDF)": "View certificate (PDF)",
    "Ver certificação": "View certification",
    "Ver como funciona": "See how it works",
    "Ver informática →": "View IT →",
    "Ver o processo completo": "See the full process",
    "Ver operação internacional →": "View international operations →",
    "Ver projetos": "View projects",
    "Ver todos os projetos": "View all projects",
    "Viabilidade confirmada antes de avançar.": "Feasibility confirmed before moving forward.",
    "Viabilidade, condições e documentação necessária. É aqui que se decide o modo de transporte e o que o desembaraço exige.": "Feasibility, terms, and required documentation. This is where the mode of transportation is decided, along with what customs clearance requires.",
    "Voltar ao início": "Back to home",
    "Volumes maiores em que o custo pesa mais do que o prazo.": "Larger volumes where cost outweighs the deadline.",
    "a execução até à entrega.": "execution through delivery.",
    "a proposta": "the proposal",
    "a viabilidade": "feasibility",
    "coordenamos": "coordinate",
    "coordenamos a operação de ponta a ponta": "we coordinate the operation end to end",
    "devolvemos": "return",
    "marcos alternados": "staggered milestones",
    "o processo como um percurso": "the process as a journey",
    "o requisito": "the requirement",
    "passa o rato sobre uma linha": "hover over a row",
    "passa/clica à esquerda →": "hover/click on the left →",
    "tamanhos assimétricos": "asymmetric sizes",
    "tipografia, sem caixas": "typography, no boxes",
    "validamos": "validate",
    "África": "Africa",
    "Ásia Central": "Central Asia",
    "Âmbito": "Scope",
    "Âmbito coordenado": "Coordinated scope",
    "Índice tipográfico": "Typographic index",
    "← Voltar": "← Back",
    "Consolidação": "Consolidation",
    "O sourcing assenta na nossa": "Sourcing is built on our",
    "Para fornecimento fora do catálogo, esta divisão liga à nossa": "For supply beyond the catalog, this division connects to our",
    "Para o nosso modelo completo, veja": "For our full model, see",
    "Para produtos de saúde de fonte certificada, veja": "For health products from a certified source, see",
    "Quando um projeto precisa de fornecimento ou logística internacional, ligamos à nossa": "When a project needs international supply or logistics, we connect it to our",
    "Vamos validar a viabilidade e responder em 24–48h úteis. Se o seu cliente de email não abriu, escreva-nos para": "We will validate feasibility and reply within 24–48 business hours. If your email client did not open, write to us at",
    "Ver Health & Care": "View Health & Care",
    "Ver informática": "View IT",
    "Ver operação internacional": "View international operations",
    "Ver produção": "View production",
    "como trabalhamos": "how we work",
    "operação internacional": "international operations",
    "por pedido": "on demand",
    "produtos de saúde por pedido": "health products on demand",
    "— a mesma máquina de validação, documentação e logística.": "— the same validation, documentation and logistics machine.",
    "— agregação de encomendas para otimizar transporte e custo.": "— grouping orders to optimize transport and cost.",
    "— colocação de mercadoria de origem portuguesa em mercados internacionais.": "— placing goods of Portuguese origin in international markets.",
    "— entrada de mercadoria de fornecedores internacionais para Portugal e outros destinos.": "— bringing in goods from international suppliers to Portugal and other destinations.",
    "— entrega no destino final, dentro ou fora de Portugal.": "— delivery to the final destination, inside or outside Portugal.",
    "— identificação e validação de fornecedores, com origem na China e na Índia, entre outros.": "— identifying and validating suppliers, sourcing from China and India, among others.",
    "— preparação e acompanhamento da documentação necessária ao desembaraço.": "— preparing and tracking the documentation required for customs clearance."
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

  // Translate a dynamically-generated string (used by page scripts that
  // write text at runtime, e.g. the pedido step counter).
  window.on4uTranslate = function (s) {
    if (current() !== 'en') return s;
    return DICT[norm(String(s))] || s;
  };

  function init() { buildSwitcher(); if (current() === 'en') apply('en'); }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
  else { init(); }
})();

/* ══════════════════════════════════════════════════════════════
   Living glass — proximity-aware 3D tilt + cursor spotlight.
   One pointer listener feeds one rAF loop. Every card reacts when
   the cursor enters a detection ZONE around it (not only on hover):
   it eases (lerps) toward a tilt / lift / glow that leans toward the
   pointer, so it feels alive and never teleports into position.
   ══════════════════════════════════════════════════════════════ */
(function () {
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var GLOW_SEL = '.dvc-tile, .pvc-box, .pg2-node, .pg2-card, .pg2-step, .pg2-faq details, #final-cta .reveal-up, .pg2-cta .pg2-reveal, .im-bento-tile, .im-stack-card, .im-rail, .im-pipe, .im-manifest';
  var TILT_SEL = '.dvc-tile, .pvc-box, .pg2-node, .pg2-card, .pg2-step, .pg2-pf, .pf-card, .im-bento-tile';
  var ZONE = 120;      // px of detection margin around each card
  var MAXTILT = 6;     // deg
  var MAXLIFT = 8;     // px
  var EASE = 0.14;     // lerp factor toward target (higher = snappier)
  var px = -99999, py = -99999;
  var cards = [];
  var running = false;

  function collect() {
    Array.prototype.forEach.call(document.querySelectorAll(GLOW_SEL + ', ' + TILT_SEL), function (el) {
      if (el.dataset.living) return;
      el.dataset.living = '1';
      var spot = el.matches(GLOW_SEL);
      var tilt = !REDUCED && el.matches(TILT_SEL); // inner cards keep hover-tilt; route3d animates the wrapper
      if (spot) el.classList.add('glass-spot');
      if (tilt) el.classList.add('glass-tilt');
      cards.push({ el: el, spot: spot, tilt: tilt, rx: 0, ry: 0, lift: 0, glow: 0, mx: 50, my: 50 });
    });
  }

  function kick() { if (!running) { running = true; requestAnimationFrame(loop); } }
  function onMove(e) { px = e.clientX; py = e.clientY; kick(); }
  function onLeave() { px = -99999; py = -99999; kick(); }

  function loop() {
    var keep = false;
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i], el = c.el, r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      // shortest distance from cursor to the card's edges (0 when inside)
      var ddx = Math.max(r.left - px, 0, px - r.right);
      var ddy = Math.max(r.top - py, 0, py - r.bottom);
      var dist = Math.sqrt(ddx * ddx + ddy * ddy);
      var prox = dist <= 0 ? 1 : Math.max(0, 1 - dist / ZONE);   // 1 inside → 0 at ZONE edge
      // offset of cursor from card centre, normalised (leans out beyond the card)
      var ox = Math.max(-1.5, Math.min(1.5, (px - cx) / (r.width / 2)));
      var oy = Math.max(-1.5, Math.min(1.5, (py - cy) / (r.height / 2)));
      var tRX = -oy * MAXTILT * prox, tRY = ox * MAXTILT * prox;
      var tLift = -MAXLIFT * prox, tGlow = prox;
      var tmx = ((px - r.left) / r.width) * 100, tmy = ((py - r.top) / r.height) * 100;
      // ease current → target
      c.rx += (tRX - c.rx) * EASE;
      c.ry += (tRY - c.ry) * EASE;
      c.lift += (tLift - c.lift) * EASE;
      c.glow += (tGlow - c.glow) * EASE;
      if (prox > 0.001) { c.mx += (tmx - c.mx) * EASE; c.my += (tmy - c.my) * EASE; }
      if (c.tilt) {
        el.style.setProperty('--rx', c.rx.toFixed(2) + 'deg');
        el.style.setProperty('--ry', c.ry.toFixed(2) + 'deg');
        el.style.setProperty('--lift', c.lift.toFixed(2) + 'px');
      }
      if (c.spot) {
        el.style.setProperty('--glow', c.glow.toFixed(3));
        el.style.setProperty('--mx', c.mx.toFixed(1) + '%');
        el.style.setProperty('--my', c.my.toFixed(1) + '%');
      }
      if (prox > 0.001 || Math.abs(c.rx) > 0.02 || Math.abs(c.ry) > 0.02 || c.glow > 0.01 || Math.abs(c.lift) > 0.05) keep = true;
    }
    if (keep) requestAnimationFrame(loop); else running = false;
  }

  function start() {
    collect();
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onMove, { passive: true });
    window.addEventListener('blur', onLeave);
    document.documentElement.addEventListener('mouseleave', onLeave);
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', start); }
  else { start(); }
})();

/* ══════════════════════════════════════════════════════════════
   Cinematic service-hero engine.
   A [data-cine] section is a tall scroll runway with a sticky stage.
   Scroll progress p (0→1, eased) interpolates every [data-obj] from
   its data-from pose to its data-to pose (x/y px, s scale, rx/ry/rz
   deg, o opacity), reveals .cine-fade copy at data-at thresholds, and
   draws [data-draw] strokes via dashoffset. Pointer adds a small
   per-depth parallax. Reduced motion → everything settled (p=1).
   ══════════════════════════════════════════════════════════════ */
(function () {
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DEF = { x: 0, y: 0, s: 1, rx: 0, ry: 0, rz: 0, o: 1 };
  var sections = [], pmx = 0, pmy = 0, ticking = false;

  function parse(str) {
    var out = {};
    (str || '').split(',').forEach(function (kv) {
      var p = kv.split(':');
      if (p.length === 2) { var v = parseFloat(p[1]); if (isFinite(v)) out[p[0].trim()] = v; }
    });
    return out;
  }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  function collect() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-cine]'), function (sec) {
      var s = { el: sec, objs: [], fades: [], draws: [] };
      Array.prototype.forEach.call(sec.querySelectorAll('.cine-obj'), function (el) {
        s.objs.push({
          el: el,
          from: Object.assign({}, DEF, parse(el.getAttribute('data-from'))),
          to: Object.assign({}, DEF, parse(el.getAttribute('data-to'))),
          depth: parseFloat(el.getAttribute('data-depth') || '0.6')
        });
      });
      Array.prototype.forEach.call(sec.querySelectorAll('.cine-fade'), function (el) {
        s.fades.push({ el: el, at: parseFloat(el.getAttribute('data-at') || '0.1') });
      });
      Array.prototype.forEach.call(sec.querySelectorAll('[data-draw]'), function (el) {
        try {
          var len = el.getTotalLength();
          el.style.strokeDasharray = len;
          el.style.strokeDashoffset = len;
          s.draws.push({ el: el, len: len });
        } catch (e) { /* non-geometry element: skip */ }
      });
      sections.push(s);
    });
  }

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    sections.forEach(function (s) {
      var r = s.el.getBoundingClientRect();
      var runway = r.height - vh;
      var p = (REDUCED || runway <= 0) ? 1 : Math.max(0, Math.min(1, -r.top / runway));
      var e = ease(p);
      s.el.style.setProperty('--p', p.toFixed(4));
      if (r.bottom < -80 || r.top > vh + 80) return; // section offscreen
      s.objs.forEach(function (o) {
        var v = {}, k;
        for (k in DEF) v[k] = o.from[k] + (o.to[k] - o.from[k]) * e;
        var x = v.x + pmx * o.depth * 30, y = v.y + pmy * o.depth * 19;
        o.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)' +
          ' rotateX(' + v.rx.toFixed(1) + 'deg) rotateY(' + v.ry.toFixed(1) + 'deg) rotateZ(' + v.rz.toFixed(1) + 'deg)' +
          ' scale(' + Math.max(0.01, v.s).toFixed(3) + ')';
        o.el.style.opacity = Math.max(0, Math.min(1, v.o)).toFixed(3);
      });
      s.fades.forEach(function (f) { if (e >= f.at) f.el.classList.add('is-in'); });
      s.draws.forEach(function (d) { d.el.style.strokeDashoffset = (d.len * (1 - e)).toFixed(1); });
    });
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

  function start() {
    collect();
    if (!sections.length) return;
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req, { passive: true });
    if (!REDUCED) {
      window.addEventListener('pointermove', function (ev) {
        pmx = (ev.clientX / window.innerWidth - 0.5) * 2;
        pmy = (ev.clientY / window.innerHeight - 0.5) * 2;
        req();
      }, { passive: true });
    }
    // If the visitor lingers without scrolling, stage the copy in anyway.
    setTimeout(function () {
      sections.forEach(function (s) { s.fades.forEach(function (f) { f.el.classList.add('is-in'); }); });
    }, 1900);
    update();
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', start); }
  else { start(); }
})();

/* ──────────────────────────────────────────────────────────────
   3D "route" reveal — cards sweep in from depth along a curved,
   staggered arc as their section scroll-scrubs into view, then
   release to the hover-tilt once settled. Applied to any element
   with class .route3d; its direct children are the items.
   Skipped for reduced-motion (items shown flat).
   ────────────────────────────────────────────────────────────── */
(function () {
  var mq = window.matchMedia;
  var REDUCE = mq && mq("(prefers-reduced-motion: reduce)").matches;
  var RAD = 57.29578;
  function smooth(t) { return t * t * (3 - 2 * t); } // soft start + soft landing, visible mid-motion
  // per-variant stagger between items in a row (rows also stagger by position)
  var STAG = { wings: 0.05, deck: 0.13, rise: 0.09, flip: 0.09 };

  // Each variant maps entry progress e (0 → 1) to a transform. Distinct motions
  // so different sections don't feel copy-pasted.
  function variantTransform(variant, e, side, tS, rS) {
    var q = 1 - e, phi, tx = 0, ty = 0, tz = 0, rx = 0, ry = 0, rz = 0;
    if (variant === "deck") {            // dealt in from one side along a single arc
      phi = q * 1.15;
      tx = Math.sin(phi) * 540; tz = -(1 - Math.cos(phi)) * 640; ty = -(1 - Math.cos(phi)) * 24;
      rx = q * 5; ry = -(phi * RAD) * 0.5; rz = q * -4;
    } else if (variant === "rise") {     // rise up from below with a forward tilt
      ty = q * 150; tz = -q * 240; rx = q * 26;
    } else if (variant === "flip") {     // flip up on the X axis out of depth
      ty = q * 26; tz = -q * 440; rx = q * -74;
    } else {                             // wings — columns swing in from their own side
      phi = q * 1.3;
      tx = side * Math.sin(phi) * 300; tz = -(1 - Math.cos(phi)) * 760; ty = -(1 - Math.cos(phi)) * 60;
      rx = q * 16; ry = -side * (phi * RAD) * 0.72; rz = side * q * -3;
    }
    // tS/rS scale the motion down on small screens (gentler on mobile)
    return "translate3d(" + (tx * tS).toFixed(1) + "px," + (ty * tS).toFixed(1) + "px," + (tz * tS).toFixed(1) + "px) rotateX(" +
      (rx * rS).toFixed(2) + "deg) rotateY(" + (ry * rS).toFixed(2) + "deg) rotateZ(" + (rz * rS).toFixed(2) + "deg)";
  }

  function init() {
    var groups = [].slice.call(document.querySelectorAll(".route3d"));
    if (!groups.length) return;

    groups.forEach(function (g) {
      g.__variant = g.getAttribute("data-r3d") || "wings";
      var isList = g.tagName === "OL" || g.tagName === "UL";
      g.__list = isList;
      var kids = [].slice.call(g.children);
      if (isList) {
        // <li> can't hold a <div> wrapper cleanly → animate the li directly and
        // hand it fully to route3d (drop the hover-tilt class so it can't clobber).
        kids.forEach(function (li) { li.classList.remove("glass-tilt"); li.style.willChange = "transform, opacity"; });
      } else {
        // wrap each child so the reveal animates the wrapper while the inner
        // card keeps its own hover-tilt (the two never fight over `transform`).
        kids.forEach(function (child) {
          if (!child.classList.contains("route3d-item")) {
            var w = document.createElement("div");
            w.className = "route3d-item";
            g.insertBefore(w, child);
            w.appendChild(child);
          }
        });
        [].slice.call(g.children).forEach(function (w) { w.style.willChange = "transform, opacity"; });
      }
    });

    if (REDUCE) {
      groups.forEach(function (g) {
        [].slice.call(g.children).forEach(function (c) { c.style.opacity = "1"; c.style.transform = "none"; });
      });
      return;
    }

    var ticking = false;
    function frame() {
      ticking = false;
      var vh = window.innerHeight;
      var mob = window.innerWidth < 640;          // gentler 3D on phones
      var tS = mob ? 0.5 : 1, rS = mob ? 0.62 : 1;
      for (var gi = 0; gi < groups.length; gi++) {
        var g = groups[gi];
        var items = g.children, N = items.length;
        var variant = g.__variant, stag = STAG[variant] || 0.06;
        var gRect = g.getBoundingClientRect();   // group is untransformed — stable
        var gMid = g.clientWidth / 2;
        for (var i = 0; i < N; i++) {
          var item = items[i];
          // progress from the item's OWN layout position (offsetTop is stable
          // under transforms) → settle by mid-viewport; index stagger sequences
          // items within a row (rows already stagger by their position).
          var cardTop = gRect.top + item.offsetTop;
          var pPos = (1.05 * vh - cardTop) / (0.43 * vh);
          pPos = pPos < 0 ? 0 : pPos > 1 ? 1 : pPos;
          var denom = 1 - i * stag; if (denom < 0.4) denom = 0.4;
          var p = (pPos - i * stag) / denom;
          p = p < 0 ? 0 : p > 1 ? 1 : p;
          if (p >= 0.999) {
            if (item.__r3d !== "set") { item.style.transform = ""; item.style.opacity = ""; item.__r3d = "set"; }
            continue;
          }
          item.__r3d = "anim";
          var e = smooth(p);
          var side = (item.offsetLeft + item.offsetWidth / 2) < gMid ? -1 : 1;
          item.style.transform = variantTransform(variant, e, side, tS, rS);
          var op = e * 1.7; if (op > 1) op = 1;
          item.style.opacity = op.toFixed(3);
        }
      }
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    frame();
  }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
