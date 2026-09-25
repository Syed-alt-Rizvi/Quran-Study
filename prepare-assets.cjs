const fs = require('fs');
const path = require('path');

const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

function isValidPng(filePath) {
  try {
    if (!fs.existsSync(filePath)) return false;
    const stat = fs.statSync(filePath);
    if (stat.size < 100) return false;
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(8);
    fs.readSync(fd, buf, 0, 8, 0);
    fs.closeSync(fd);
    return buf.equals(PNG_HEADER);
  } catch (e) {
    return false;
  }
}

async function prepare() {
  const iconPng = path.join(__dirname, 'assets', 'icon.png');
  const splashPng = path.join(__dirname, 'assets', 'splash.png');
  const iconSvg = path.join(__dirname, 'assets', 'icon.svg');
  const splashSvg = path.join(__dirname, 'assets', 'splash.svg');

  const iconOk = isValidPng(iconPng);
  const splashOk = isValidPng(splashPng);
  const iconNeedsUpdate = !iconOk || !fs.existsSync(iconPng) || (fs.existsSync(iconSvg) && fs.statSync(iconSvg).mtimeMs > fs.statSync(iconPng).mtimeMs);
  const splashNeedsUpdate = !splashOk || !fs.existsSync(splashPng) || (fs.existsSync(splashSvg) && fs.statSync(splashSvg).mtimeMs > fs.statSync(splashPng).mtimeMs);

  if (!iconNeedsUpdate && !splashNeedsUpdate) {
    console.log('✓ Assets are up-to-date and have valid PNG headers.');
    return;
  }

  console.log('Regenerating PNG assets from SVG...');
  let sharp;
  try {
    sharp = require('sharp');
  } catch (err) {
    console.warn('Warning: sharp is not available, skipping SVG-to-PNG rasterization:', err.message);
  }

  if (sharp) {
    if (iconNeedsUpdate && fs.existsSync(iconSvg)) {
      await sharp(iconSvg).resize(1024, 1024).png().toFile(iconPng);
      console.log('✓ Generated icon.png from SVG');
    }
    if (splashNeedsUpdate && fs.existsSync(splashSvg)) {
      await sharp(splashSvg).resize(2732, 2732).png().toFile(splashPng);
      console.log('✓ Generated splash.png from SVG');
    }
  }

  // Final sanity check
  if (!isValidPng(iconPng) && sharp) {
    console.warn('Creating emergency fallback for icon.png...');
    await sharp({
      create: { width: 1024, height: 1024, channels: 4, background: { r: 5, g: 150, b: 105, alpha: 1 } }
    }).png().toFile(iconPng);
  }
  if (!isValidPng(splashPng) && sharp) {
    console.warn('Creating emergency fallback for splash.png...');
    await sharp({
      create: { width: 2732, height: 2732, channels: 4, background: { r: 5, g: 150, b: 105, alpha: 1 } }
    }).png().toFile(splashPng);
  }
  console.log('✓ Asset preparation complete.');
}

prepare().catch(err => {
  console.error('Asset preparation error:', err);
});
