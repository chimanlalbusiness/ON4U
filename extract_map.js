const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const mapStart = html.indexOf('<div class="map-container"');
const mapEndStr = '</div>\n        </div>\n    </section>';
// Actually let's find the closing tag of map-container.
let depth = 0;
let i = mapStart;
let mapEnd = -1;
let buffer = '';

while (i < html.length) {
    if (html.slice(i, i + 4) === '<div') {
        depth++;
    } else if (html.slice(i, i + 5) === '</div') {
        depth--;
        if (depth === 0) {
            mapEnd = html.indexOf('>', i) + 1;
            break;
        }
    }
    i++;
}

if (mapEnd !== -1) {
    const mapHtml = html.slice(mapStart, mapEnd);
    console.log('Found map HTML, length:', mapHtml.length);
    if (!fs.existsSync('components')) {
        fs.mkdirSync('components');
    }
    fs.writeFileSync('components/world-map.html', mapHtml);

    // remove the mapHtml from index.html and replace it with a placeholder for now
    const newHtml = html.slice(0, mapStart) + '<!-- WORLD_MAP_COMPONENT -->' + html.slice(mapEnd);
    fs.writeFileSync('index.html', newHtml);
    console.log('Successfully extracted map-container.');
} else {
    console.log('Could not find map-container end.');
}
