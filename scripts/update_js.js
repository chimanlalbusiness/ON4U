const fs = require('fs');
let js = fs.readFileSync('script.js', 'utf8');

const oldLogic = `            let pIn = 0, pOut = 0;
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
            sec.style.setProperty('--scale-out', scaleOut.toFixed(3));`;

const newLogic = `            let pBgIn = 0, pTextIn = 0, pVisIn = 0, pOut = 0;
            
            // Background settling (0 to 0.20)
            if (t <= 0.20) pBgIn = t / 0.20;
            else pBgIn = 1;

            // Text mounting (0.20 to 0.45)
            if (t <= 0.20) pTextIn = 0;
            else if (t <= 0.45) pTextIn = (t - 0.20) / 0.25;
            else pTextIn = 1;

            // Visual mounting (0.45 to 0.70)
            if (t <= 0.45) pVisIn = 0;
            else if (t <= 0.70) pVisIn = (t - 0.45) / 0.25;
            else pVisIn = 1;

            // Exit (0.70 to 1.0)
            if (t <= 0.70) pOut = 0;
            else pOut = (t - 0.70) / 0.30;

            const easeText = 1 - Math.pow(1 - pTextIn, 3);
            const easeVis = 1 - Math.pow(1 - pVisIn, 3);
            const opacityOut = 1 - pOut * 1.5;
            const scaleOut = 1 - pOut * 0.05;

            // Provide all custom properties
            sec.style.setProperty('--bg-in', pBgIn.toFixed(3));
            sec.style.setProperty('--opacity-out', Math.max(0, opacityOut).toFixed(3));
            sec.style.setProperty('--scale-out', scaleOut.toFixed(3));
            // These replace opacity-in and y-in
            sec.style.setProperty('--text-in', easeText.toFixed(3));
            sec.style.setProperty('--vis-in', easeVis.toFixed(3));`;

js = js.replace(oldLogic, newLogic);

const headerObserverAdd = `    // Header
    const header = document.querySelector(".header");
    if (header) {
        window.addEventListener("scroll", () => {
            header.classList.toggle("is-scrolled", window.scrollY > 8);
        }, { passive: true });
        
        // Auto Logo Swap based on pinned section theme
        function updateHeaderTheme() {
            let activeTheme = 'light';
            let passedSections = Array.from(document.querySelectorAll('[data-theme]'));
            for (let i = passedSections.length - 1; i >= 0; i--) {
                const s = passedSections[i];
                if (window.scrollY >= s.offsetTop - 100) {
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
        updateHeaderTheme(); // Init
    }`;

const oldHeaderConfig = `    // Header
    const header = document.querySelector(".header");
    if (header) {
        window.addEventListener("scroll", () => {
            header.classList.toggle("is-scrolled", window.scrollY > 8);
        }, { passive: true });
    }`;

js = js.replace(oldHeaderConfig, headerObserverAdd);

const oldAnimInit = `// Set initial transitions for smooth entrance on load
    setTimeout(() => {
        document.querySelectorAll('.anim-entrance').forEach(el => {
            el.style.transition = 'opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
        });
    }, 100);`;
const newAnimInit = `// Set initial transitions for smooth entrance on load
    setTimeout(() => {
        document.querySelectorAll('.anim-text, .anim-visual').forEach(el => {
            el.style.transition = 'opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
        });
    }, 100);`;

js = js.replace(oldAnimInit, newAnimInit);

fs.writeFileSync('script.js', js);
console.log('script.js updated.');
