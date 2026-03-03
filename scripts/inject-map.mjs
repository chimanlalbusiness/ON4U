import fs from 'fs';

const htmlFile = new URL('../index.html', import.meta.url);
const mapFile = new URL('../maps-data/world-map.svg', import.meta.url);

let html = fs.readFileSync(htmlFile, 'utf8');
const mapSvg = fs.readFileSync(mapFile, 'utf8');

// The new map-coastline layer
const newCoastlines = `<!-- Coastline dynamic map built via d3/topojson -->
<g class="map-coastlines">
${mapSvg.replace(/<svg[^>]*>|<\/svg>|<defs>([\s\S]*?)<\/defs>|<rect[^>]*url\(#techGrid\)[^>]*>/g, '').trim()}
</g>`;

// Now find the layer to replace in html
// We'll replace from <g class="map-coastlines" ...> to </g> that corresponds to it
// using a targeted exact replace with start/end strings.

const startBoundary = '            <!-- Layer 1: Coastlines — stroke-only, simplified-accurate geometry -->';
const endBoundary = '            <!-- Region labels -->';

const startIndex = html.indexOf(startBoundary);
const endIndex = html.indexOf(endBoundary);

if (startIndex > -1 && endIndex > -1) {
    const front = html.substring(0, startIndex);
    const back = html.substring(endIndex);

    const finalHtml = front + startBoundary + '\n' + newCoastlines + '\n\n' + back;
    fs.writeFileSync(htmlFile, finalHtml);
    console.log('Injected new map paths heavily into index.html');
} else {
    console.log('Boundaries not found in index.html for replacement.');
}

