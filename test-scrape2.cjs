const cheerio = require('cheerio');
(async () => {
    const res = await fetch("https://www.tafseerenamoona.net");
    const html = await res.text();
    console.log(html.substring(0, 1000));
    console.log("===============================");
    const $ = cheerio.load(html);
    console.log($('script#__NEXT_DATA__').html()?.substring(0, 500));
})();
