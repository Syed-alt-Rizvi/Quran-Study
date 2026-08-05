const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://unsplash.com/s/photos/quran', { waitUntil: 'networkidle2' });
  
  const imgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => img.src).filter(src => src.includes('images.unsplash.com/photo-'));
  });
  
  console.log(imgs.slice(0, 5).join('\n'));
  await browser.close();
})();
