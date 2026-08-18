import * as cheerio from 'cheerio';
import { db } from "../src/db";
import { scienceArticles, ayahScienceRelationships } from "../src/db/schema";
import { v4 as uuidv4 } from "uuid";
import { eq, and } from "drizzle-orm";
import Parser from 'rss-parser';

const parser = new Parser();

async function ingest() {
  console.log("Starting full ingestion from RSS feed and scraping full pages...");
  
  let feed;
  try {
    // RSS gives us the latest 10-20 articles. 
    feed = await parser.parseURL('https://quranandscience.com/category/quran-a-science/feed/');
  } catch (err) {
    console.error("Failed to parse RSS feed:", err);
    return;
  }

  for (const item of feed.items) {
    if (!item.link || !item.title) continue;

    console.log(`Processing: ${item.title}`);
    
    // Fetch full page
    let fullContent = item.contentSnippet || item.content || "";
    try {
      const res = await fetch(item.link);
      const html = await res.text();
      const $ = cheerio.load(html);
      
      // Look for typical WordPress content areas
      const articleBody = $('.spnc-post-content, .wp-block-post-content, .entry-content, article .content, main .content');
      if (articleBody.length > 0) {
        // extract paragraphs
        const paragraphs: string[] = [];
        articleBody.find('p').each((i, el) => {
           const pText = $(el).text().trim();
           if (pText.length > 20) paragraphs.push(pText);
        });
        if (paragraphs.length > 0) {
           fullContent = paragraphs.join('\n\n');
        }
      }
    } catch (e) {
      console.log(`Failed to fetch full page for ${item.link}, using snippet.`);
    }

    const existing = await db.select().from(scienceArticles).where(eq(scienceArticles.originalUrl, item.link)).execute();
    let articleId = "";
    
    if (existing.length > 0) {
      console.log(`Updating existing: ${item.title}`);
      articleId = existing[0].id;
      await db.update(scienceArticles).set({
        content: fullContent
      }).where(eq(scienceArticles.id, articleId)).execute();
    } else {
      console.log(`Inserting new: ${item.title}`);
      articleId = uuidv4();
      await db.insert(scienceArticles).values({
        id: articleId,
        title: item.title,
        author: item.creator || "Quran & Science",
        content: fullContent,
        source: "Quran and Science",
        originalUrl: item.link,
        license: "Fair Use / Permitted Metadata",
        publicationDate: item.pubDate || new Date().toISOString()
      }).execute();
    }

    // Guess Ayah relationships
    const textToAnalyze = `${item.title} ${fullContent}`.toLowerCase();
    const regex = /(?:surah|quran)\s+(\d+)\s*[:\s]\s*(?:ayah\s+)?(\d+)/g;
    let match;
    
    while ((match = regex.exec(textToAnalyze)) !== null) {
      const surah = parseInt(match[1]);
      const ayah = parseInt(match[2]);
      
      if (surah > 0 && surah <= 114 && ayah > 0) {
        const existingRel = await db.select().from(ayahScienceRelationships).where(and(
          eq(ayahScienceRelationships.articleId, articleId),
          eq(ayahScienceRelationships.surahNumber, surah),
          eq(ayahScienceRelationships.ayahNumber, ayah)
        )).execute();
        
        if (existingRel.length === 0) {
          await db.insert(ayahScienceRelationships).values({
            id: uuidv4(),
            articleId: articleId,
            surahNumber: surah,
            ayahNumber: ayah,
            explanation: `Related to topic: ${item.title}`
          }).execute();
          console.log(`  -> Linked to Surah ${surah} Ayah ${ayah}`);
        }
      }
    }
  }
  
  console.log("Ingestion complete.");
}

ingest().catch(console.error);
