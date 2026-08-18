const cheerio = require('cheerio');
fetch('https://quranandscience.com/category/quran-a-science/')
  .then(res => res.text())
  .then(html => {
    const $ = cheerio.load(html);
    const links = [];
    $('a').each((i, el) => {
      links.push($(el).attr('href'));
    });
    console.log("Total links:", links.length);
    const postLinks = [...new Set(links.filter(l => l && l.includes('quranandscience.com') && !l.includes('category') && !l.includes('author') && !l.includes('tag')))];
    console.log("Possible post links:", postLinks.slice(0, 5));
  });
