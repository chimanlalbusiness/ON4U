const fs = require('fs');

const origCss = fs.readFileSync('style.css', 'utf8');
const newCss = fs.readFileSync('scrolly_styles.css', 'utf8');
// remove the very old html max-width and stuff if there are conflicts, but append is fine.
fs.writeFileSync('style.css', origCss + '\n' + newCss);

const newJs = fs.readFileSync('scripts/scrolly_script.js', 'utf8');
fs.writeFileSync('script.js', newJs);

console.log('Changes applied.');
