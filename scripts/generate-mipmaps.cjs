const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SVG = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#059669"/>
  <g transform="translate(256, 256) scale(21.33)">
    <path fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </g>
</svg>
`;

const SVG_ROUND = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <circle cx="512" cy="512" r="512" fill="#059669"/>
  <g transform="translate(256, 256) scale(21.33)">
    <path fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </g>
</svg>
`;

const SIZES = {
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192
};

async function generate() {
    for (const [density, size] of Object.entries(SIZES)) {
        const dir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', `mipmap-${density}`);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});

        await sharp(Buffer.from(SVG))
            .resize(size, size)
            .png()
            .toFile(path.join(dir, 'ic_launcher.png'));

        await sharp(Buffer.from(SVG_ROUND))
            .resize(size, size)
            .png()
            .toFile(path.join(dir, 'ic_launcher_round.png'));
        
        console.log(`Generated for ${density} (${size}x${size})`);
    }
}

generate().catch(console.error);
