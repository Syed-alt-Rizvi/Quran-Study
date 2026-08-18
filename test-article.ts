import * as cheerio from 'cheerio';
async function test() {
  const res = await fetch("https://quranandscience.com/quran-science/the-miracle-of-iron-in-the-quran/");
  const html = await res.text();
  const $ = cheerio.load(html);
  console.log($('article').attr('class'));
  console.log($('.entry-content').length);
  console.log($('.post-content').length);
  console.log($('main').attr('class'));
  const ps = $('p').map((i, el) => $(el).text()).get();
  console.log("P count:", ps.length);
  console.log("First 3 Ps:", ps.slice(0, 3));
}
test();
