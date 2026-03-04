const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

// Looking for map related css. Let's see what is inside style.css first by printing where 'map' appears.
const lines = css.split('\n');
lines.forEach((line, idx) => {
    if (line.toLowerCase().includes('map')) {
        console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
});
