import * as cheerio from 'cheerio';
async function test() {
  const res = await fetch('https://quranandscience.com/the-sea-set-on-fire/');
  const html = await res.text();
  const $ = cheerio.load(html);
  console.log("Title:", $('title').text());
  console.log("Body length:", $('body').text().length);
  console.log("Body snippet:", $('body').text().substring(0, 500).replace(/\s+/g, ' '));
}
test();
