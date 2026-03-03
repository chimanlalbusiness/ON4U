import fs from 'fs';

let html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
let newPaths = fs.readFileSync(new URL('../maps-generated/new-paths-land.html', import.meta.url), 'utf8');

// remove distances comment
newPaths = newPaths.replace(/<!-- COPY THESE DISTANCES -->[\s\S]*$/, '');

// Add mask logic for top fade out and general edge fade
const fadeMaskDef = `  <radialGradient id="edgeFade" cx="50%" cy="50%" r="50%">
                <stop offset="40%" stop-color="white" stop-opacity="1" />
                <stop offset="80%" stop-color="white" stop-opacity="0" />
              </radialGradient>
              <mask id="fadeMask" maskUnits="userSpaceOnUse" x="0" y="0" width="960" height="520">
                <rect width="960" height="520" fill="url(#edgeFade)" />
              </mask>
            </defs>`;

html = html.replace(/<radialGradient id="edgeFade"[\s\S]*?<\/mask>\s*<\/defs>/, '</defs>');
html = html.replace('</defs>', fadeMaskDef);

const chunkStart = html.indexOf('<g class="map-coastlines"');
const chunkEnd = html.indexOf('</svg>', chunkStart);

const newContent = `<g class="map-coastlines" mask="url(#fadeMask)">
<!-- Grid background for technical feel -->
<rect width="960" height="520" fill="url(#techGrid)" />
${newPaths}
</g>

<!-- Routes from PT (490, 180) -->
<!-- PT -> Africa -->
<path class="map-route map-route-1" pathLength="1000" stroke="#f97316" stroke-width="1.6" fill="none" stroke-linecap="round" d="M490 180 C 510 260, 560 320, 621 375" />
<!-- PT -> Europe -->
<path class="map-route map-route-2" pathLength="1000" stroke="#f97316" stroke-width="1.5" fill="none" stroke-linecap="round" d="M490 180 C 520 140, 570 110, 620 105" />
<!-- PT -> North America -->
<path class="map-route map-route-3" pathLength="1000" stroke="#f97316" stroke-width="1.4" fill="none" stroke-linecap="round" d="M490 180 C 350 160, 200 150, 90 178" />
<!-- PT -> South America -->
<path class="map-route map-route-4" pathLength="1000" stroke="#f97316" stroke-width="1.2" fill="none" stroke-linecap="round" d="M490 180 C 420 280, 380 340, 344 420" />
<!-- PT -> Central Asia -->
<path class="map-route map-route-5" pathLength="1000" stroke="#f97316" stroke-width="1.3" fill="none" stroke-linecap="round" d="M490 180 C 600 150, 720 140, 840 166" />

<!-- Destination Nodes -->
<circle cx="621" cy="375" r="4" fill="#f97316" opacity="0.85" />     <!-- Africa -->
<circle cx="620" cy="105" r="4" fill="#f97316" opacity="0.75" />     <!-- Europe -->
<circle cx="90" cy="178" r="3.5" fill="#f97316" opacity="0.65" />   <!-- North America -->
<circle cx="344" cy="420" r="3" fill="#f97316" opacity="0.55" />     <!-- South America -->
<circle cx="840" cy="166" r="3.5" fill="#f97316" opacity="0.60" />   <!-- Central Asia -->

<!-- Node Labels -->
<text x="621" y="392" fill="#d1d5db" font-size="10" font-weight="500" font-family="Inter,sans-serif" text-anchor="middle" opacity="0.85">África</text>
<text x="620" y="122" fill="#d1d5db" font-size="10" font-weight="500" font-family="Inter,sans-serif" text-anchor="middle" opacity="0.75">Europa</text>
<text x="90" y="195" fill="#d1d5db" font-size="10" font-weight="500" font-family="Inter,sans-serif" text-anchor="middle" opacity="0.65">América do Norte</text>
<text x="344" y="437" fill="#d1d5db" font-size="10" font-weight="500" font-family="Inter,sans-serif" text-anchor="middle" opacity="0.55">América do Sul</text>
<text x="840" y="183" fill="#d1d5db" font-size="10" font-weight="500" font-family="Inter,sans-serif" text-anchor="middle" opacity="0.60">Ásia Central</text>


<!-- Layer 3: PT Hub -->
<circle class="map-hub-glow" cx="490" cy="180" r="50" fill="url(#ptGlow)" />
<circle cx="490" cy="180" r="6" fill="#f97316" />
<circle class="map-hub-ring" cx="490" cy="180" r="14" fill="none" stroke="#f97316" stroke-width="1.5" opacity="0.9" />
<text x="500" y="176" fill="#f97316" font-size="11" font-weight="700" font-family="Inter,sans-serif">PT</text>
          `;

html = html.substring(0, chunkStart) + newContent + html.substring(chunkEnd);
fs.writeFileSync(new URL('../index.html', import.meta.url), html);
console.log('index.html updated successfully with Central Asia route and scaled mapping.');
