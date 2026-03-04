const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

// 1. Remove `.anim-entrance`
css = css.replace(/\.anim-entrance\s*\{[^}]+\}/g, '');
css = css.replace(/\.delay-1\s*\{[^}]+\}/g, '');
css = css.replace(/\.delay-2\s*\{[^}]+\}/g, '');
css = css.replace(/\.anim-entrance\s*\{\s*opacity:[^!]+!important;\s*transform:[^!]+!important;\s*\}/g, ''); // reduced motion rule

// Append the new styles
const newStyles = `
/* ===== NEW SCROLLY STYLES ===== */

/* Header & Nav */
.logo-text-stroke { stroke: #000; transition: stroke 0.3s ease; }
.header.is-dark .logo-text-stroke { stroke: #fff; }

.header-nav { position: relative; }
.header-nav a { position: relative; padding-bottom: 4px; transition: color 0.3s ease; }
.header.is-dark .header-nav a { color: rgba(255, 255, 255, 0.7); }
.header.is-dark .header-nav a:hover { color: #fff; }
.header-nav a.is-active { font-weight: 600; }
.header.is-dark .header-nav a.is-active { color: #fff; }

/* Underline indicator */
.header-nav a::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0%;
    height: 2px;
    background: var(--c-accent);
    transition: width 0.3s ease;
}
.header-nav a.is-active::after {
    width: 100%;
}

/* Animations */
.anim-text {
  opacity: calc(var(--text-in) * var(--opacity-out));
  transform: translateY(calc((1 - var(--text-in)) * 40px)) scale(calc(var(--scale-out)));
}

.anim-visual {
  opacity: calc(var(--vis-in) * var(--opacity-out));
  transform: translateY(calc((1 - var(--vis-in)) * 40px)) scale(calc(var(--scale-out)));
}

@media (prefers-reduced-motion: reduce) {
  .anim-text, .anim-visual { opacity: 1 !important; transform: none !important; }
}

/* Process Layout Fixed Size */
@media (min-width: 900px) {
  .processo-layout { grid-template-columns: 1fr 2fr !important; gap: 4rem; align-items: flex-start; }
  .processo-diagram { min-height: 500px !important; transform: scale(1.1); transform-origin: left center; }
  .modern-flow-svg { width: 100%; height: 100%; }
}

@media (max-width: 899px) {
  .processo-layout { display: flex; flex-direction: column; }
  .processo-diagram { min-height: 380px !important; width: 100%; overflow: visible; padding-top: 1rem; }
  .modern-flow-svg { width: 100%; height: auto; transform: scale(0.9); }
}

/* Enforce white text on dark sections (Readability) */
.scrolly-section[data-theme="dark"] .scrolly-sub,
.scrolly-section[data-theme="dark"] p {
    color: rgba(255, 255, 255, 0.7);
}
.scrolly-section[data-theme="dark"] .card-micro-line {
    color: rgba(255, 255, 255, 0.7);
}
.scrolly-section[data-theme="dark"] h1,
.scrolly-section[data-theme="dark"] h2,
.scrolly-section[data-theme="dark"] h3,
.scrolly-section[data-theme="dark"] h4 {
    color: #fff;
}
.scrolly-section[data-theme="dark"] .proof-line {
    color: rgba(255, 255, 255, 0.8) !important;
}
.scrolly-section[data-theme="dark"] .proof-line strong,
.scrolly-section[data-theme="dark"] .card-micro-line strong {
    color: #fff !important;
}
.scrolly-section[data-theme="dark"] .route-node:not(.active) {
    color: rgba(255, 255, 255, 0.4);
}
.scrolly-section[data-theme="dark"] .phase-body p {
    color: rgba(255, 255, 255, 0.6);
}

/* Clean up CTA styling */
#final-cta .hero-actions {
  margin-top: 2rem;
}
`;

fs.writeFileSync('style.css', css + newStyles);
console.log('style.css updated.');
