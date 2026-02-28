/* ============================================================
   ON4U — Homepage v2 · Motion System + Interactions
   Tasks: Global reveal · Diferencial scroll-spy · Processo sync
          · Internacional map entrance · Hover polish (CSS only)
   No layout shift. No libraries. prefers-reduced-motion respected.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ─────────────────────────────────────────────────────────
  // CONFIG
  // ─────────────────────────────────────────────────────────
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─────────────────────────────────────────────────────────
  // TASK 0 — MOBILE MENU
  // ─────────────────────────────────────────────────────────
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      mobileNav[isOpen ? 'setAttribute' : 'removeAttribute']('hidden', '');
    });
    mobileNav.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('hidden', '');
      })
    );
  }

  // ─────────────────────────────────────────────────────────
  // TASK 1 — GLOBAL REVEAL SYSTEM (.reveal → .is-visible)
  // ─────────────────────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');

  if (REDUCED) {
    // Immediately show all — no animation
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // Once only
          }
        });
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
    );
    revealEls.forEach(el => revealObserver.observe(el));
  }

  // ─────────────────────────────────────────────────────────
  // TASK 1b — HERO ENTRANCE (special class-based stagger)
  // ─────────────────────────────────────────────────────────
  const hero = document.querySelector('[data-section="hero"]');
  if (hero) {
    const fire = () => hero.classList.add('is-visible');
    REDUCED ? fire() : requestAnimationFrame(() => setTimeout(fire, 60));
  }

  // ─────────────────────────────────────────────────────────
  // TASK 2 — DIFERENCIAL: scroll-spy active card
  // Each card gets data-diff-card="1..4"
  // Closest to viewport center becomes .is-active — no height change
  // ─────────────────────────────────────────────────────────
  const difCards = document.querySelectorAll('[data-card="diferencial"]');

  function setDifActive(idx) {
    difCards.forEach((c, i) =>
      c.classList.toggle('is-active', i === idx)
    );
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
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const rect = entry.target.getBoundingClientRect();
              const center = window.innerHeight / 2;
              const score = Math.abs((rect.top + rect.bottom) / 2 - center);
              if (score < bestScore) { bestScore = score; bestEntry = entry; }
            }
          });
          if (bestEntry) {
            const idx = [...difCards].indexOf(bestEntry.target);
            if (idx > -1) setDifActive(idx);
          }
        },
        { rootMargin: '-25% 0px -25% 0px', threshold: 0.5 }
      );
      difCards.forEach(c => {
        difObserver.observe(c);
        // Click also sets active (no layout shift)
        c.addEventListener('click', () => {
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
      mapSection.classList.add('is-visible');
    } else {
      const mapObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              mapSection.classList.add('is-visible');
              observer.unobserve(mapSection); // Fires exactly once
            }
          });
        },
        { rootMargin: '0px 0px -5% 0px', threshold: 0.05 }
      );
      mapObserver.observe(mapSection);
    }
  }

  // ─────────────────────────────────────────────────────────
  // TASK 4 — PROCESSO UX: Sticky Steps + Live Diagram
  // ─────────────────────────────────────────────────────────
  const stepsWrap = document.querySelector('.processo-steps-wrap');
  const steps = document.querySelectorAll('[data-step]');
  const diagBoxes = document.querySelectorAll('.diag-box');
  const diagLinks = document.querySelectorAll('.diag-link');
  const dot = document.querySelector('.progress-dot');

  // Exact mapping: Step N highlights ONLY these nodes (not progressive)
  const nodeMap = {
    1: [1],       // Pedido
    2: [1, 2],    // Pedido -> Validação
    3: [1, 2, 3], // Pedido -> Validação -> Orçamento & Logística
    4: [4]        // Final box (Entrega)
  };

  // Exact mapping: Step N highlights ONLY these links
  const linkMap = {
    1: [],
    2: [1],
    3: [1, 2, 3],
    4: [4]
  };

  function activateStep(n) {
    // 1. Highlight standard steps list
    steps.forEach(s => s.classList.toggle('is-active', parseInt(s.dataset.step) === n));

    // 2. Translate progress dot (0%, 33%, 66%, 100% relative to wrapper height minus dot)
    if (dot && stepsWrap) {
      const wrapperHeight = stepsWrap.getBoundingClientRect().height;
      const stepPct = (n - 1) / (steps.length - 1);
      // Math: total distance is wrapperHeight minus margin/padding offsets
      const distance = (wrapperHeight - 44) * stepPct;
      dot.style.transform = `translateY(${distance}px)`;
    }

    // 3. Highlight exact nodes requested
    const targetNodes = nodeMap[n] || [];
    diagBoxes.forEach(box => {
      const nodeN = parseInt(box.getAttribute('data-node'));
      box.classList.toggle('is-active', targetNodes.includes(nodeN));
    });

    // 4. Highlight exact links requested
    const targetLinks = linkMap[n] || [];
    diagLinks.forEach(link => {
      const lkN = parseInt(link.getAttribute('data-link'));
      link.classList.toggle('is-active', targetLinks.includes(lkN));
    });
  }

  if (steps.length) {
    activateStep(1); // Boot state

    steps.forEach(step => {
      step.addEventListener('click', () => activateStep(parseInt(step.dataset.step)));
    });

    if (!REDUCED) {
      // Scroll-spy: pick step closest to viewport center (handles vertical and horizontal)
      const stepObserver = new IntersectionObserver((entries) => {
        let bestEntry = null;
        let bestScore = Infinity;

        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const rect = entry.target.getBoundingClientRect();
            // Check if mobile horizontal layout (x-axis diff dominates)
            const isHorizontal = window.innerWidth < 900;

            let score;
            if (isHorizontal) {
              const centerX = window.innerWidth / 2;
              score = Math.abs((rect.left + rect.right) / 2 - centerX);
            } else {
              const centerY = window.innerHeight / 2;
              score = Math.abs((rect.top + rect.bottom) / 2 - centerY);
            }

            if (score < bestScore) {
              bestScore = score;
              bestEntry = entry;
            }
          }
        });

        if (bestEntry) {
          activateStep(parseInt(bestEntry.target.dataset.step));
        }
      }, { rootMargin: '-30% -30% -30% -30%', threshold: [0, 0.5, 1] });

      steps.forEach(s => stepObserver.observe(s));
    }
  }

  // ─────────────────────────────────────────────────────────
  // TASK 5 — DIVISÕES DRAWERS (native <dialog>)
  // ─────────────────────────────────────────────────────────
  const exploreButtons = document.querySelectorAll('.btn-explore');
  const divDrawers = document.querySelectorAll('.div-drawer');
  const closeButtons = document.querySelectorAll('.drawer-close');

  exploreButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-drawer-target');
      const dialog = document.querySelector(`.div-drawer[data-drawer="${id}"]`);
      if (dialog && typeof dialog.showModal === 'function') {
        document.body.style.overflow = 'hidden';
        dialog.showModal();
      }
    });
  });

  function closeDialog(d) {
    d.close();
    document.body.style.overflow = '';
  }

  closeButtons.forEach(btn => {
    const dialog = btn.closest('.div-drawer');
    if (dialog) btn.addEventListener('click', () => closeDialog(dialog));
  });

  divDrawers.forEach(dialog => {
    // Click outside (backdrop) closes it
    dialog.addEventListener('click', e => {
      const rect = dialog.getBoundingClientRect();
      if (
        e.clientX < rect.left || e.clientX > rect.right ||
        e.clientY < rect.top || e.clientY > rect.bottom
      ) closeDialog(dialog);
    });
  });

  // ─────────────────────────────────────────────────────────
  // BONUS — TRUST METRICS highlight on scroll
  // ─────────────────────────────────────────────────────────
  const metrics = document.querySelectorAll('[data-metric]');
  if (metrics.length && !REDUCED) {
    const mObserver = new IntersectionObserver(
      entries => entries.forEach(e =>
        e.target.classList.toggle('is-active', e.isIntersecting)
      ),
      { rootMargin: '-20% 0px -20% 0px' }
    );
    metrics.forEach(m => mObserver.observe(m));
  }

});
