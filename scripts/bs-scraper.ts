import * as cheerio from 'cheerio';
import { db } from '../src/db';
import { scienceArticles, ayahScienceRelationships } from '../src/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq, and } from 'drizzle-orm';

async function scrapeCompletely() {
  console.log("Starting full beautifulsoup-style HTML scrape of quranandscience.com...");
  
  let page = 1;
  let hasMore = true;
  let scrapedLinks: string[] = [];
  
  // 1. Scrape all article URLs from category pagination
  while (hasMore) {
    console.log(`Scraping category page ${page}...`);
    try {
      const url = `https://quranandscience.com/category/quran-a-science/page/${page}/`;
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) {
          console.log("Reached end of pagination.");
        } else {
          console.error(`HTTP Error: ${res.status}`);
        }
        hasMore = false;
        break;
      }
      
      const html = await res.text();
      const $ = cheerio.load(html); // "BeautifulSoup" equivalent
      
      const links = $('h2.entry-title a, h3.entry-title a, article .entry-title a');
      if (links.length === 0) {
        console.log("No more articles found on this page.");
        hasMore = false;
        break;
      }
      
      links.each((i, el) => {
        const href = $(el).attr('href');
        if (href && !scrapedLinks.includes(href)) {
          scrapedLinks.push(href);
        }
      });
      
      page++;
    } catch (e) {
      console.error(`Failed on category page ${page}:`, e);
      hasMore = false;
    }
  }
  
  console.log(`Discovered ${scrapedLinks.length} unique articles. Proceeding to deep scrape...`);
  
  // 2. Scrape each article
  let processedCount = 0;
  for (const link of scrapedLinks) {
    try {
      console.log(`Scraping [${processedCount + 1}/${scrapedLinks.length}]: ${link}`);
      const res = await fetch(link);
      if (!res.ok) continue;
      const html = await res.text();
      const $ = cheerio.load(html);
      
      const title = $('h1.entry-title').first().text().trim() || $('title').text().replace('- Quran and Science', '').trim();
      
      // Extract paragraphs
      const articleBody = $('.entry-content, .post-content, article').first();
      const paragraphs: string[] = [];
      articleBody.find('p, h2, h3, h4').each((i, el) => {
         const text = $(el).text().trim();
         if (text.length > 10) paragraphs.push(text);
      });
      
      let content = paragraphs.join('\n\n');
      if (!content) {
         content = articleBody.text().trim().replace(/\n{3,}/g, '\n\n');
      }
      
      // Link formatting matching exactly the previous script logic
      const removeLinkRegex = /\[+([^\]]+)\]+\(surah:[^\)]+\)/gi;
      content = content.replace(removeLinkRegex, "$1");
      
      const regex = /(\(*[“"”][^“"”]*?[“"”]\)*\s*\(\s*(?:Quran|Surah)?\s*(\d+)\s*[:.]\s*(\d+(?:\s*,\s*\d+|\s*-\s*\d+)?)\s*\))/gi;
      content = content.replace(regex, (match, fullMatch, surahStr, ayahStr) => {
         if (match.startsWith('[')) return match;
         return `[${fullMatch}](surah:${surahStr}:${parseInt(ayahStr)})`;
      });
      
      const existing = await db.select().from(scienceArticles).where(eq(scienceArticles.originalUrl, link)).execute();
      let articleId = "";
      
      if (existing.length > 0) {
        articleId = existing[0].id;
        await db.update(scienceArticles).set({
          content: content,
          title: title
        }).where(eq(scienceArticles.id, articleId)).execute();
      } else {
        articleId = uuidv4();
        await db.insert(scienceArticles).values({
          id: articleId,
          title: title,
          author: "Quran & Science",
          content: content,
          source: "Quran and Science",
          originalUrl: link,
          license: "Fair Use / Permitted Metadata",
          publicationDate: new Date().toISOString()
        }).execute();
      }
      
      processedCount++;
    } catch (e) {
      console.error(`Failed to scrape ${link}:`, e);
    }
  }
  
  console.log(`Scraping complete. Processed ${processedCount} articles.`);
}

scrapeCompletely().catch(console.error);
