import { db } from "../src/db";
import { scienceArticles, ayahScienceRelationships } from "../src/db/schema";
import { v4 as uuidv4 } from "uuid";
import { eq, and } from "drizzle-orm";
import * as cheerio from 'cheerio';

async function ingest() {
  console.log("Starting full ingestion from WordPress REST API...");
  
  let page = 1;
  let hasMore = true;
  let totalImported = 0;
  let totalRelationships = 0;

  while (hasMore) {
    console.log(`Fetching page ${page}...`);
    try {
      const res = await fetch(`https://quranandscience.com/wp-json/wp/v2/posts?per_page=50&page=${page}`);
      
      if (!res.ok) {
         if (res.status === 400) {
            console.log("Reached end of posts.");
         } else {
            console.error(`HTTP Error: ${res.status}`);
         }
         hasMore = false;
         break;
      }

      const posts = await res.json();
      if (!posts || posts.length === 0) {
        hasMore = false;
        break;
      }

      for (const post of posts) {
        const $title = cheerio.load(post.title.rendered);
        const title = $title('body').text().trim() || post.title.rendered.replace(/<[^>]*>?/gm, '');
        const link = post.link;
        let htmlContent = post.content.rendered;
        
        // Strip out some HTML tags, keep paragraphs
        const $ = cheerio.load(htmlContent);
        const paragraphs: string[] = [];
        $('p, h2, h3, h4').each((i, el) => {
           const pText = $(el).text().trim();
           if (pText.length > 10) paragraphs.push(pText);
        });
        
        let plainContent = paragraphs.join('\n\n');
        if (!plainContent) {
           plainContent = $('body').text().trim() || htmlContent.replace(/<[^>]*>?/gm, '');
        }

        const existing = await db.select().from(scienceArticles).where(eq(scienceArticles.originalUrl, link)).execute();
        let articleId = "";
        
        if (existing.length > 0) {
          articleId = existing[0].id;
          await db.update(scienceArticles).set({
            content: plainContent,
            title: title
          }).where(eq(scienceArticles.id, articleId)).execute();
        } else {
          articleId = uuidv4();
          await db.insert(scienceArticles).values({
            id: articleId,
            title: title,
            author: "Quran & Science",
            content: plainContent,
            source: "Quran and Science",
            originalUrl: link,
            license: "Fair Use / Permitted Metadata",
            publicationDate: post.date
          }).execute();
        }
        
        totalImported++;

        // Better Regex for Ayah relationships
        const textToAnalyze = `${title} ${plainContent}`.toLowerCase();
        
        // Match standard patterns:
        // Surah 36, Ayah 38
        // (36:38)
        // Chapter 36 Verse 38
        const regexes = [
          /(?:surah|quran|chapter)\s+(\d+)\s*[:\s,-]\s*(?:verse|ayah)?\s*(\d+)/g,
          /(?:surah|quran)\s+(\d+)\s*[:]\s*(\d+)/g,
          /\[(\d+)\s*:\s*(\d+)\]/g,
          /\((\d+)\s*:\s*(\d+)\)/g,
          /\b(\d{1,3})\s*:\s*(\d{1,3})\b/g, // Catches raw 36:38
        ];
        
        const foundAyahs = new Set<string>();

        for (const regex of regexes) {
          let match;
          while ((match = regex.exec(textToAnalyze)) !== null) {
            const surah = parseInt(match[1]);
            const ayah = parseInt(match[2]);
            
            if (surah > 0 && surah <= 114 && ayah > 0 && ayah <= 286) {
              const key = `${surah}:${ayah}`;
              if (!foundAyahs.has(key)) {
                foundAyahs.add(key);
                
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
                    explanation: `Related to topic: ${title}`
                  }).execute();
                  totalRelationships++;
                }
              }
            }
          }
        }
      }
      
      page++;
    } catch (e) {
      console.error("Error fetching page:", e);
      hasMore = false;
    }
  }
  
  console.log(`Ingestion complete. Total articles processed: ${totalImported}`);
  console.log(`Total insights (relationships) added: ${totalRelationships}`);
}

ingest().catch(console.error);
