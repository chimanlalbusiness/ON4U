const fs = require('fs');
const d3 = require('d3-geo');

const geojson = JSON.parse(fs.readFileSync('world.geojson', 'utf8'));

// D3 Mercator projection tailored to 960x520 box
// Translate adjusts the center ([x, y])
const projection = d3.geoMercator()
    .scale(150)
    .translate([480, 320]);

const path = d3.geoPath().projection(projection);

let svgPaths = '';
geojson.features.forEach(f => {
    if (f.geometry && f.properties.ADMIN !== 'Antarctica') {
        svgPaths += `  <path class="map-land" d="${path(f)}" stroke="#f97316" stroke-width="1.2" fill="none" stroke-linejoin="round" stroke-linecap="round" />\n`;
    }
});

const svgContent = `<svg viewBox="0 0 960 520" xmlns="http://www.w3.org/2000/svg">
${svgPaths}
</svg>`;

fs.writeFileSync('world-map.svg', svgContent);
console.log('Map built.');
