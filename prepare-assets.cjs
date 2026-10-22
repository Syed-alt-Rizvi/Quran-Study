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
  const amiriTtf = path.join(__dirname, 'assets', 'fonts', 'Amiri-Bold.ttf');

  // Ensure fontconfig has access to Amiri font
  try {
    const os = require('os');
    const userFontDir = path.join(os.homedir(), '.fonts');
    if (!fs.existsSync(userFontDir)) fs.mkdirSync(userFontDir, { recursive: true });
    const targetFont = path.join(userFontDir, 'Amiri-Bold.ttf');
    if (fs.existsSync(amiriTtf) && !fs.existsSync(targetFont)) {
      fs.copyFileSync(amiriTtf, targetFont);
      const cp = require('child_process');
      cp.spawnSync('fc-cache', ['-f', userFontDir]);
    }
  } catch (fontErr) {
    console.warn('Font setup notice:', fontErr.message);
  }

  console.log('Regenerating PNG assets from SVG with sharp...');
  let sharp;
  try {
    sharp = require('sharp');
  } catch (err) {
    console.warn('Warning: sharp is not available:', err.message);
  }

  if (sharp) {
    if (fs.existsSync(iconSvg)) {
      await sharp(iconSvg).resize(1024, 1024).png().toFile(iconPng);
      await sharp(iconSvg).resize(192, 192).png().toFile(path.join(__dirname, 'public', 'pwa-192x192.png'));
      await sharp(iconSvg).resize(512, 512).png().toFile(path.join(__dirname, 'public', 'pwa-512x512.png'));
      await sharp(iconSvg).resize(512, 512).png().toFile(path.join(__dirname, 'public', 'pwa-maskable-512x512.png'));
      await sharp(iconSvg).resize(180, 180).png().toFile(path.join(__dirname, 'public', 'apple-touch-icon.png'));
      console.log('✓ Generated master icon.png and PWA icons from SVG');

      // Update Android mipmap launcher icons across all densities
      const mipmapDensities = [
        { folder: 'mipmap-mdpi', iconSize: 48, fgSize: 108 },
        { folder: 'mipmap-hdpi', iconSize: 72, fgSize: 162 },
        { folder: 'mipmap-xhdpi', iconSize: 96, fgSize: 216 },
        { folder: 'mipmap-xxhdpi', iconSize: 144, fgSize: 324 },
        { folder: 'mipmap-xxxhdpi', iconSize: 192, fgSize: 432 },
      ];

      const resDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
      for (const d of mipmapDensities) {
        const dirPath = path.join(resDir, d.folder);
        if (fs.existsSync(dirPath)) {
          await sharp(iconSvg).resize(d.iconSize, d.iconSize).png().toFile(path.join(dirPath, 'ic_launcher.png'));
          await sharp(iconSvg).resize(d.iconSize, d.iconSize).png().toFile(path.join(dirPath, 'ic_launcher_round.png'));
          await sharp(iconSvg).resize(d.fgSize, d.fgSize).png().toFile(path.join(dirPath, 'ic_launcher_foreground.png'));
        }
      }
      console.log('✓ Generated Android mipmap icons (ic_launcher, ic_launcher_round, ic_launcher_foreground)');

      // Generate dedicated splash_icon for Android 12+ SplashScreen API
      const drawableDir = path.join(resDir, 'drawable');
      if (fs.existsSync(drawableDir)) {
        await sharp(iconSvg).resize(384, 384).png().toFile(path.join(drawableDir, 'splash_icon.png'));
      }
    }

    if (fs.existsSync(splashSvg)) {
      await sharp(splashSvg).resize(2732, 2732).png().toFile(splashPng);
      console.log('✓ Generated master splash.png from SVG');

      // Update all Android splash drawables
      const resDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
      if (fs.existsSync(resDir)) {
        const subdirs = fs.readdirSync(resDir);
        for (const sub of subdirs) {
          if (sub.startsWith('drawable')) {
            const target = path.join(resDir, sub, 'splash.png');
            if (fs.existsSync(path.dirname(target))) {
              try {
                if (sub.includes('port') || sub === 'drawable' || sub === 'drawable-night') {
                  await sharp(splashSvg).resize(1080, 1920, { fit: 'cover' }).png().toFile(target);
                } else if (sub.includes('land')) {
                  await sharp(splashSvg).resize(1920, 1080, { fit: 'cover' }).png().toFile(target);
                } else {
                  await sharp(splashSvg).resize(1080, 1920, { fit: 'cover' }).png().toFile(target);
                }
              } catch (e) {
                fs.copyFileSync(splashPng, target);
              }
            }
          }
        }
        console.log('✓ Successfully synchronized Android drawable splash screens');
      }
    }
  }

  // Final sanity checks
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
