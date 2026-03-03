import fs from 'fs';

const file = new URL('../maps-data/world-map.svg', import.meta.url);
let content = fs.readFileSync(file, 'utf8');

// The d3 map generator creates strokes that are 1.2px bright orange.
// Let's soften them slightly (opacity 0.65, stroke 1.0) so the animation routes pop out more
content = content.replace(/stroke="#f97316" stroke-width="1.2"/g, 'stroke="#f97316" stroke-width="1.0" opacity="0.65"');

// The grid background shouldn't be touched by the replace above because it was explicitly 0.3 opacity etc.

fs.writeFileSync(file, content);
console.log('Modified Map styles!');
