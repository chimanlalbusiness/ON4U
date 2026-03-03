/* ============================================================
   ON4U — Homepage v3 · Visual System v2 · Motion + Interactions
   Tasks: Quiet sticky header · Global reveal · Diferencial active rail
          · Processo scroll-sync · Internacional map entrance · Drawers
   No layout shift. No libraries. prefers-reduced-motion respected.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // ─────────────────────────────────────────────────────────
  // CONFIG
  // ─────────────────────────────────────────────────────────
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ─────────────────────────────────────────────────────────
  // TASK 0 — MOBILE MENU
  // ─────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────
  // TASK 0b — HEADER: Quiet Sticky (no shrink, gentle settle)
  // Adds .is-scrolled after first scroll for shadow.
  // Active nav links via IntersectionObserver on sections.
  // ─────────────────────────────────────────────────────────
  const header = document.querySelector(".header");
  if (header) {
    window.addEventListener("scroll", () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }, { passive: true });
  }

  // Active nav link highlighting — state-driven, no scroll drama
  const navLinks = document.querySelectorAll(".header-nav a[href^='#'], .mobile-nav a[href^='#']");

  if (navLinks.length && !REDUCED) {
    const sectionsToWatch = document.querySelectorAll("[data-section]");
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id || entry.target.dataset.section;
          navLinks.forEach((link) => {
            const href = link.getAttribute("href").replace("#", "");
            link.classList.toggle("is-active", href === id);
          });
        }
      });
    }, { rootMargin: "-40% 0px -40% 0px", threshold: 0 });

    sectionsToWatch.forEach((s) => {
      if (s.id) navObserver.observe(s);
    });
  }

  // ─────────────────────────────────────────────────────────
  // TASK 1 — GLOBAL REVEAL SYSTEM (.reveal → .is-visible)
  // ─────────────────────────────────────────────────────────
  const revealEls = document.querySelectorAll(".reveal");

  if (REDUCED) {
    // Immediately show all — no animation
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // Once only
          }
        });
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0.1 },
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  // ─────────────────────────────────────────────────────────
  // TASK 1b — HERO ENTRANCE (special class-based stagger)
  // ─────────────────────────────────────────────────────────
  const hero = document.querySelector('[data-section="hero"]');
  if (hero) {
    const fire = () => hero.classList.add("is-visible");
    REDUCED ? fire() : requestAnimationFrame(() => setTimeout(fire, 60));
  }

  // ─────────────────────────────────────────────────────────
  // TASK 2 — DIFERENCIAL: scroll-spy active card
  // Each card gets data-diff-card="1..4"
  // Closest to viewport center becomes .is-active — no height change
  // ─────────────────────────────────────────────────────────
  const difCards = document.querySelectorAll('[data-card="diferencial"]');

  function setDifActive(idx) {
    difCards.forEach((c, i) => c.classList.toggle("is-active", i === idx));
  }

  if (difCards.length) {
    setDifActive(0); // Default first card active

    if (REDUCED) {
      // Static: keep first card highlighted, allow hover on all
    } else {
      const difObserver = new IntersectionObserver(
        (entries) => {
          // Pick the entry closest to viewport center
          let bestEntry = null;
          let bestScore = Infinity;
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const rect = entry.target.getBoundingClientRect();
              const center = window.innerHeight / 2;
              const score = Math.abs((rect.top + rect.bottom) / 2 - center);
              if (score < bestScore) {
                bestScore = score;
                bestEntry = entry;
              }
            }
          });
          if (bestEntry) {
            const idx = [...difCards].indexOf(bestEntry.target);
            if (idx > -1) setDifActive(idx);
          }
        },
        { rootMargin: "-25% 0px -25% 0px", threshold: 0.5 },
      );
      difCards.forEach((c) => {
        difObserver.observe(c);
        // Click also sets active (no layout shift)
        c.addEventListener("click", () => {
          const idx = [...difCards].indexOf(c);
          setDifActive(idx);
        });
      });
    }
  }

  // ─────────────────────────────────────────────────────────
  // TASK 3 — INTERNACIONAL MAP: one-time entrance
  // ─────────────────────────────────────────────────────────
  const mapSection = document.querySelector('[data-section="internacional"]');

  if (mapSection) {
    if (REDUCED) {
      // Final static state immediately
      mapSection.classList.add("is-visible");
    } else {
      const mapObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              mapSection.classList.add("is-visible");
              observer.unobserve(mapSection); // Fires exactly once
            }
          });
        },
        { rootMargin: "0px 0px -5% 0px", threshold: 0.05 },
      );
      mapObserver.observe(mapSection);
    }
  }

  // ─────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────
  // TASK 4 — PROCESSO UX: Sticky Steps + Live Diagram
  // ─────────────────────────────────────────────────────────
  const phases = document.querySelectorAll("[data-phase]");
  const diagNodes = document.querySelectorAll(".flow-node");
  const pathOverlays = document.querySelectorAll(".flow-link.active-overlay");
  const svgBall = document.querySelector(".flow-ball");

  // Keep node mapping simple
  const nodeMap = {
    1: ["start", "pedido"],
    2: ["start", "pedido", "validacao"],
    3: ["start", "pedido", "validacao", "orcamento", "logistica"],
    4: ["start", "pedido", "validacao", "orcamento", "logistica", "entrega"],
  };

  // Ball positions based on phase
  const ballTargetMap = {
    1: { cx: 110, cy: 120 },
    2: { cx: 190, cy: 120 },
    3: { cx: 220, cy: 120 },
    4: { cx: 430, cy: 120 },
  };

  let currentPhase = 1;
  let isLocked = false;
  let lastScrollTime = 0;
  let interactedWithLock = false;

  const processoSection = document.getElementById("processo");
  const lockHint = document.querySelector(".lock-hint");
  const btnUnlock = document.querySelector(".btn-unlock");

  function activatePhase(n) {
    if (n < 1 || n > 4) return;
    currentPhase = n;

    // 1. Highlight standard phases list
    phases.forEach((p) =>
      p.classList.toggle("is-active", parseInt(p.dataset.phase) === n),
    );

    // 2. Highlight exact nodes requested
    const targetNodes = nodeMap[n] || [];
    diagNodes.forEach((node) => {
      const nodeN = node.getAttribute("data-node");
      node.classList.toggle("is-active", targetNodes.includes(nodeN));
    });

    // 3. Highlight Paths using data-phase-target
    pathOverlays.forEach((path) => {
      const target = parseInt(path.getAttribute("data-phase-target"));
      path.classList.toggle("is-active", target <= n);
    });

    // 4. Move Ball
    if (svgBall && ballTargetMap[n]) {
      const t = ballTargetMap[n];
      svgBall.style.transform = `translate(${t.cx - 30}px, ${t.cy - 120}px)`; // Offset from starting 30,120
    }
  }

  if (phases.length) {
    activatePhase(1); // Boot state

    phases.forEach((phase) => {
      phase.addEventListener("click", () => {
        const n = parseInt(phase.dataset.phase);
        activatePhase(n);

        // Hide hint on click interaction
        interactedWithLock = true;
        if (lockHint) lockHint.classList.add("is-hidden");
      });
    });

    if (
      !document.documentElement.classList.contains("reduced-motion-prefered") &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const processoSection = document.getElementById("processo");

      window.addEventListener("scroll", () => {
        if (!processoSection) return;

        const rect = processoSection.getBoundingClientRect();
        const startOffset = rect.top;
        const totalHeight = rect.height - window.innerHeight;

        if (totalHeight <= 0) return; // Prevent division by zero if layout is messed up

        let progress = 0;
        if (startOffset <= 0) {
          progress = Math.abs(startOffset) / totalHeight;
        }

        // Clamp progress
        if (progress < 0) progress = 0;
        if (progress > 1) progress = 1;

        // Map progress to phase 1-4
        let phase = 1;
        if (progress > 0.25) phase = 2;
        if (progress > 0.50) phase = 3;
        if (progress > 0.75) phase = 4;

        if (phase !== currentPhase) {
          activatePhase(phase);
        }
      }, { passive: true });
    }
  }

  // ─────────────────────────────────────────────────────────
  // TASK 5 — DIVISÕES DRAWERS (native <dialog>)
  // ─────────────────────────────────────────────────────────
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
    // Click outside (backdrop) closes it
    dialog.addEventListener("click", (e) => {
      const rect = dialog.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      )
        closeDialog(dialog);
    });
  });

  // ─────────────────────────────────────────────────────────
  // BONUS — TRUST METRICS highlight on scroll
  // ─────────────────────────────────────────────────────────
  const metrics = document.querySelectorAll("[data-metric]");
  if (metrics.length && !REDUCED) {
    const mObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) =>
          e.target.classList.toggle("is-active", e.isIntersecting),
        ),
      { rootMargin: "-20% 0px -20% 0px" },
    );
    metrics.forEach((m) => mObserver.observe(m));
  }
});
