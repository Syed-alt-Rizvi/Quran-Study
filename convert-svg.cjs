const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const svg192 = fs.readFileSync('public/pwa-192x192.svg', 'utf8');
  await page.setContent(svg192);
  const svgElement = await page.$('svg');
  await svgElement.screenshot({ path: 'public/pwa-192x192.png' });

  const svg512 = fs.readFileSync('public/pwa-512x512.svg', 'utf8');
  await page.setContent(svg512);
  const svgElement2 = await page.$('svg');
  await svgElement2.screenshot({ path: 'public/pwa-512x512.png' });

  await browser.close();
  console.log('Done!');
})();
