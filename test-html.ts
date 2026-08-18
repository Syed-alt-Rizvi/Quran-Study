import * as cheerio from 'cheerio';
import * as fs from 'fs';
const html = fs.readFileSync('/tmp/test-page.html', 'utf8');
const $ = cheerio.load(html);

const articleBody = $('.spnc-post-content, .wp-block-post-content, .entry-content, article .content, main .content');
if (articleBody.length > 0) {
    const paragraphs: string[] = [];
    articleBody.find('p').each((i, el) => {
        const pText = $(el).text().trim();
        if (pText.length > 20) paragraphs.push(pText);
    });
    console.log("Found paragraphs:", paragraphs.length);
    console.log(paragraphs.slice(0, 3));
} else {
    console.log("No article body found");
}

