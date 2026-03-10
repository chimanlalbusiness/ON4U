/*
  New Scrollytelling Engine for ON4U
*/

document.addEventListener("DOMContentLoaded", () => {
    const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Header
    const header = document.querySelector(".header");
    if (header) {
        window.addEventListener("scroll", () => {
            header.classList.toggle("is-scrolled", window.scrollY > 8);
        }, { passive: true });
    }

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

    // Drawers
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

    if (REDUCED) {
        document.querySelectorAll('.scrolly-section').forEach(s => {
            s.style.setProperty('--opacity-in', 1);
            s.style.setProperty('--y-in', 0);
            s.style.setProperty('--opacity-out', 1);
            s.style.setProperty('--scale-out', 1);
            s.style.setProperty('--p', 0.5);
        });
        const mapSection = document.querySelector('.map-component-wrapper');
        if (mapSection) mapSection.classList.add('is-visible');
        return; // Stop here if reduced motion
    }

    // Scrollytelling Engine
    const sections = document.querySelectorAll('.scrolly-section');
    const processPhases = document.querySelectorAll('.processo-phase');
    const svgNodes = document.querySelectorAll('.flow-node');
    const svgLinks = document.querySelectorAll('.flow-link.active-overlay');
    const svgBall = document.querySelector('.flow-ball');

    const mapSection = document.querySelector('#map-hub');
    const mapWrapper = document.querySelector('.map-component-wrapper');
    let mapTriggered = false;

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

    // Mobile phase selector - always attach handlers, check width dynamically
    let mobilePhase = 1;
    const mobileSteps = document.querySelectorAll('.mobile-step');

    function isMobileView() {
        return window.innerWidth < 900;
    }

    function updatePhaseDisplay(phase) {
        // Update tab pills
        processPhases.forEach(p => p.classList.toggle("is-active", parseInt(p.dataset.phase) === phase));
        
        // Update SVG diagram (desktop)
        const targetNodes = nodeMap[phase] || [];
        svgNodes.forEach(n => n.classList.toggle("is-active", targetNodes.includes(n.getAttribute("data-node"))));
        svgLinks.forEach(l => l.classList.toggle("is-active", parseInt(l.getAttribute("data-phase-target")) <= phase));
        if (svgBall && ballTargetMap[phase]) {
            const bTarget = ballTargetMap[phase];
            svgBall.style.transform = `translate(${bTarget.cx - 30}px, ${bTarget.cy - 120}px)`;
        }
        
        // Update mobile stepper
        mobileSteps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.toggle("is-complete", stepNum < phase);
            step.classList.toggle("is-active", stepNum === phase);
        });
    }

    // Always attach click handlers (they check viewport at click time)
    processPhases.forEach(phaseEl => {
        phaseEl.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("[v0] Phase tab clicked:", phaseEl.dataset.phase, "isMobile:", isMobileView());
            if (!isMobileView()) return; // Only handle on mobile
            mobilePhase = parseInt(phaseEl.dataset.phase);
            console.log("[v0] Updating to phase:", mobilePhase);
            updatePhaseDisplay(mobilePhase);
            phaseEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
    });
    
    // Add click handlers to mobile stepper steps
    mobileSteps.forEach(step => {
        step.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("[v0] Step clicked:", step.dataset.step);
            mobilePhase = parseInt(step.dataset.step);
            updatePhaseDisplay(mobilePhase);
            // Also update the tab to match
            const matchingPhase = document.querySelector(`.processo-phase[data-phase="${mobilePhase}"]`);
            if (matchingPhase) {
                matchingPhase.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        });
    });
    
    // Set initial phase display on mobile
    if (isMobileView()) {
        updatePhaseDisplay(mobilePhase);
    }

    function updateProcessLogic(t) {
        // Process section is active during its own timeline
        // 0-1 over 400vh. Inside settle (0.25 - 0.75), we scroll 200vh.
        // Skip this on mobile - we use manual phase selection instead
        if (isMobileView()) return;

        let phase = 1;
        if (t > 0.35) phase = 2;
        if (t > 0.45) phase = 3;
        if (t > 0.60) phase = 4;

        updatePhaseDisplay(phase);
    }

    let raf;
    function onScroll() {
        const y = window.scrollY;
        const vh = window.innerHeight;

        sections.forEach((sec, idx) => {
            const top = sec.offsetTop;
            const h = sec.offsetHeight; // usually 400vh

            // Calculate t = 0 to 1 over the 400vh window
            // Window starts when viewport top reaches (top - vh) -> wrapper top enters viewport bottom
            let scrollInto = y - (top - vh);
            let t = scrollInto / h;

            if (idx === 0) {
                // Hero is unique because we can't scroll above 0.
                // It's essentially born into t=0.25 (settle). 
                // We override scrollInto to force an organic entrance based dynamically on load.
                // But CSS transitions handles initial drop gracefully.
                if (y < 0) t = 0.25; // mobile rubber banding
            }

            if (t < 0) t = 0;
            if (t > 1) t = 1;

            sec.style.setProperty('--p', t.toFixed(3));

            let pIn = 0, pOut = 0;
            // Entrance: 0 to 0.25
            if (t <= 0.25) pIn = t / 0.25;
            else pIn = 1;

            // Exit: 0.75 to 1.0
            if (t > 0.75) pOut = (t - 0.75) / 0.25;

            const easeIn = 1 - Math.pow(1 - pIn, 3); // ease-out cubic
            const yIn = (1 - easeIn) * 80; // pixels
            const opacityIn = easeIn;

            const opacityOut = 1 - pOut * 1.5; // slight early fade
            const scaleOut = 1 - pOut * 0.05; // slight shrink backward

            sec.style.setProperty('--opacity-in', opacityIn.toFixed(3));
            sec.style.setProperty('--y-in', yIn.toFixed(2));
            sec.style.setProperty('--opacity-out', Math.max(0, opacityOut).toFixed(3));
            sec.style.setProperty('--scale-out', scaleOut.toFixed(3));

            // Specific section logic
            if (sec.id === 'process' && t > 0.1 && t < 0.9) {
                updateProcessLogic(t);
            }

            if (sec.id === 'map-hub' && t > 0.15 && !mapTriggered) {
                mapTriggered = true;
                if (mapWrapper && window.initWorldMap) {
                    window.initWorldMap();
                    mapWrapper.classList.add('is-visible');
                    // add to wrapper manually or let Observer do it. The wrapper relies on the class to animate.
                }
            }
        });

        raf = requestAnimationFrame(onScroll);
    }

    // Set initial transitions for smooth entrance on load
    setTimeout(() => {
        document.querySelectorAll('.anim-entrance').forEach(el => {
            el.style.transition = 'opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
        });
    }, 100); // Give variables a moment to apply via scroll loop

    onScroll();
});

