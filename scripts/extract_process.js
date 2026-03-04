const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const processStart = html.indexOf('<div class="processo-diagram"');
if (processStart === -1) {
    console.log("Could not find process diagram");
} else {
    const endMatch = html.indexOf('</div>', processStart + 30);
    // actually, let's just use exact string search or get the block
    let depth = 0, i = processStart, end = -1;
    while (i < html.length) {
        if (html.slice(i, i + 4) === '<div') depth++;
        else if (html.slice(i, i + 5) === '</div') {
            depth--;
            if (depth === 0) { end = html.indexOf('>', i) + 1; break; }
        }
        i++;
    }
    const svgBlock = html.slice(processStart, end);
    fs.writeFileSync('components/process-svg.html', svgBlock);
    console.log('Saved process flow SVG.');
}
