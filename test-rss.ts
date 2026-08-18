import Parser from 'rss-parser';
const parser = new Parser();
async function test() {
  const feed = await parser.parseURL('https://quranandscience.com/category/quran-a-science/feed/');
  console.log("First item:", feed.items[0].link);
  console.log("First item contentSnippet length:", feed.items[0].contentSnippet?.length);
}
test();
