const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(2000);
  
  // Click Surah 112
  await page.click('button:has-text("Al-Ikhlaas")');
  await page.waitForTimeout(2000);
  
  // Try to find if Tafseer shows up
  const tafseerButtons = await page.$$('button:has-text("Read Detailed Tafseer-e-Namoona")');
  console.log('Read Tafseer buttons found:', tafseerButtons.length);

  // Click the first one
  if (tafseerButtons.length > 0) {
    await tafseerButtons[0].click();
    await page.waitForTimeout(1000);
    const text = await page.textContent('body');
    if (text.includes('Loading exact tafseer or none found')) {
      console.log('TAFSEER_NOT_FOUND');
    } else {
      console.log('TAFSEER_FOUND');
    }
  }

  await browser.close();
})();
