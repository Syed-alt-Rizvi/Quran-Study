const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://unsplash.com/photos/opened-book-_KPuV9qSSlU', { waitUntil: 'networkidle2' });
  const imgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => img.src).filter(src => src.includes('images.unsplash.com/photo-'));
  });
  console.log(imgs.join('\n'));
  await browser.close();
})();
