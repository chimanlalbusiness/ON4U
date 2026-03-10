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
        const top = sec.offsetTop;
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

        if (idx === 0) {
            pBgIn = 1;
            pTextIn = 1;
            pVisIn = 1;
            // Hero exits earlier so it doesn't stay dead on screen
            pOut = pStuck > 0.60 ? (pStuck - 0.60) / 0.40 : 0;
        } else {
            // normal sections fade explicitly when entering so they are fully visible upon snap
            pTextIn = pEnter > 0.5 ? (pEnter - 0.5) / 0.5 : 0;
            pVisIn = pEnter > 0.6 ? (pEnter - 0.6) / 0.4 : 0;

            if (pStuck > 0) {
                pTextIn = 1;
                pVisIn = 1;
            }
        }

        const easeText = 1 - Math.pow(1 - pTextIn, 3);
        const easeVis = 1 - Math.pow(1 - pVisIn, 3);
        const opacityOut = Math.max(0, 1 - pOut);
        const scaleOut = 1 - pOut * 0.05;

        sec.style.setProperty('--bg-in', pBgIn.toFixed(3));
        sec.style.setProperty('--opacity-out', opacityOut.toFixed(3));
        sec.style.setProperty('--scale-out', scaleOut.toFixed(3));
        sec.style.setProperty('--text-in', easeText.toFixed(3));
        sec.style.setProperty('--vis-in', easeVis.toFixed(3));

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
        if (sec.id === 'map-hub' && pEnter > 0.5 && !mapTriggered) {
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
