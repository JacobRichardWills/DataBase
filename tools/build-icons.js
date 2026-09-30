// Builds the favicon and Android/iOS app icons from one of the logo options.
// Usage: node tools/build-icons.js a-roof-check
// Needs the `sharp` package (npm i -g sharp).
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const name = process.argv[2] || 'a-roof-check';
const root = path.join(__dirname, '..');
const src = path.join(root, 'logos', `${name}.svg`);
const out = path.join(root, 'icons');
const svg = fs.readFileSync(src, 'utf8');

(async () => {
  fs.mkdirSync(out, { recursive: true });
  // Favicon: same art with rounded corners.
  const rounded = svg.replace(/<svg([^>]*)>/, '<svg$1><clipPath id="r"><rect width="512" height="512" rx="112"/></clipPath><g clip-path="url(#r)">')
    .replace(/<\/svg>\s*$/, '</g></svg>');
  fs.writeFileSync(path.join(out, 'favicon.svg'), rounded);
  const render = (size, file, input = svg) => sharp(Buffer.from(input), { density: 300 }).resize(size, size).png().toFile(path.join(out, file));
  await render(192, 'icon-192.png');
  await render(512, 'icon-512.png');
  await render(512, 'maskable-512.png'); // art sits inside the maskable safe zone already
  await render(180, 'apple-touch-icon.png');
  await render(32, 'favicon-32.png', rounded);
  console.log(`Icons built from ${name}`);
})();
