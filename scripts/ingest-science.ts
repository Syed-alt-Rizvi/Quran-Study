import { db } from "../src/db";
import { scienceArticles, ayahScienceRelationships } from "../src/db/schema";
import { v4 as uuidv4 } from "uuid";
import { eq, and } from "drizzle-orm";
import Parser from 'rss-parser';

const parser = new Parser();

async function ingest() {
  console.log("Starting ingestion from RSS feed...");
  
  let feed;
  try {
    feed = await parser.parseURL('https://quranandscience.com/category/quran-a-science/feed/');
  } catch (err) {
    console.error("Failed to parse RSS feed:", err);
    return;
  }

  for (const item of feed.items) {
    if (!item.link || !item.title) continue;

    const existing = await db.select().from(scienceArticles).where(eq(scienceArticles.originalUrl, item.link)).execute();
    let articleId = "";
    
    if (existing.length > 0) {
      console.log(`Skipping duplicate: ${item.title}`);
      articleId = existing[0].id;
    } else {
      console.log(`Ingesting: ${item.title}`);
      articleId = uuidv4();
      
      // Basic text extraction from HTML content snippet
      const plainContent = (item.contentSnippet || item.content || "").replace(/<[^>]*>?/gm, '').substring(0, 1000);
      
      await db.insert(scienceArticles).values({
        id: articleId,
        title: item.title,
        author: item.creator || "Quran & Science",
        content: plainContent,
        source: "Quran and Science",
        originalUrl: item.link,
        license: "Fair Use / Permitted Metadata",
        publicationDate: item.pubDate || new Date().toISOString()
      }).execute();
    }

    // Try to guess Ayah relationships from title or content (very simple heuristic for this example)
    // We look for patterns like "Surah X Ayah Y" or "Quran X:Y"
    const textToAnalyze = `${item.title} ${item.content}`.toLowerCase();
    const regex = /(?:surah|quran)\s+(\d+)\s*[:\s]\s*(?:ayah\s+)?(\d+)/g;
    let match;
    let foundAyahs = false;
    
    while ((match = regex.exec(textToAnalyze)) !== null) {
      const surah = parseInt(match[1]);
      const ayah = parseInt(match[2]);
      
      if (surah > 0 && surah <= 114 && ayah > 0) {
        foundAyahs = true;
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
