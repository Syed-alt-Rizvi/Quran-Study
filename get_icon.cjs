const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://unsplash.com/photos/opened-book-_KPuV9qSSlU', { waitUntil: 'networkidle2' });
  const ogImage = await page.evaluate(() => {
    const meta = document.querySelector('meta[property="og:image"]');
    return meta ? meta.content : null;
  });
  console.log(ogImage);
  await browser.close();
})();
