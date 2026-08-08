const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const iconSvg = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#059669"/>
  <!-- Lucide book-open icon, scaled up -->
  <g transform="translate(256, 256) scale(21.33)">
    <path fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </g>
  <text x="50%" y="82%" fill="white" font-size="96" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle" dominant-baseline="middle">Quran</text>
</svg>
`;

const splashSvg = `
<svg width="2732" height="2732" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#059669"/>
  <!-- Centered icon -->
  <g transform="translate(1110, 1110) scale(21.33)">
    <path fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </g>
  <text x="50%" y="65%" fill="white" font-size="96" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle" dominant-baseline="middle">Quran</text>
</svg>
`;

// Simple text icon to match the exact same one used in the web app, but as proper SVG
const iconTextSvg = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#059669"/>
  <text x="50%" y="50%" fill="white" font-size="128" font-family="Arial" text-anchor="middle" dominant-baseline="middle">Quran</text>
</svg>
`;

const splashTextSvg = `
<svg width="2732" height="2732" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#059669"/>
  <text x="50%" y="50%" fill="white" font-size="300" font-family="Arial" text-anchor="middle" dominant-baseline="middle">Quran</text>
</svg>
`;

(async () => {
  if (!fs.existsSync('assets')) {
    fs.mkdirSync('assets');
  }

  // Choose the one that has an icon for beauty
  const finalIconSvg = iconSvg;
  const finalSplashSvg = splashSvg;

  fs.writeFileSync('assets/icon.svg', finalIconSvg);
  fs.writeFileSync('assets/splash.svg', finalSplashSvg);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setContent(finalIconSvg);
  const iconElement = await page.$('svg');
  await iconElement.screenshot({ path: 'assets/icon.png', omitBackground: true });
  
  await page.setContent(finalSplashSvg);
  const splashElement = await page.$('svg');
  await splashElement.screenshot({ path: 'assets/splash.png', omitBackground: true });
  
  // also update the web app icons
  const pwa192Svg = finalIconSvg.replace('width="1024"', 'width="192"').replace('height="1024"', 'height="192"').replace('transform="translate(256, 256) scale(21.33)"', 'transform="translate(48, 48) scale(4)"').replace('font-size="96"', 'font-size="24"').replace('y="82%"', 'y="82%"');
  const pwa512Svg = finalIconSvg.replace('width="1024"', 'width="512"').replace('height="1024"', 'height="512"').replace('transform="translate(256, 256) scale(21.33)"', 'transform="translate(128, 128) scale(10.66)"').replace('font-size="96"', 'font-size="48"').replace('y="82%"', 'y="82%"');

  fs.writeFileSync('public/pwa-192x192.svg', pwa192Svg);
  fs.writeFileSync('public/pwa-512x512.svg', pwa512Svg);

  await page.setContent(pwa192Svg);
  const pwa192Element = await page.$('svg');
  await pwa192Element.screenshot({ path: 'public/pwa-192x192.png', omitBackground: true });
  
  await page.setContent(pwa512Svg);
  const pwa512Element = await page.$('svg');
  await pwa512Element.screenshot({ path: 'public/pwa-512x512.png', omitBackground: true });

  await browser.close();
  console.log('Successfully generated assets/icon.png and assets/splash.png and public web app icons');
})();
