import { db } from './src/db';
import { scienceArticles } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const articles = await db.select().from(scienceArticles).execute();
  let updatedCount = 0;
  
  for (const article of articles) {
    if (!article.content) continue;
    
    // We want to match: [open quote] [anything] [close quote] [optional spaces] (Quran 16:68)
    // But since JS regex doesn't easily do nested quotes without complexity, let's use a non-greedy match.
    // Match a quotation mark, then anything (lazily), then a quotation mark, then the citation.
    const regex = /([“"”](?:(?![“"”]).)*?[“"”]\s*\(\s*(?:Quran|Surah)?\s*(\d+)\s*:\s*(\d+(?:\s*,\s*\d+|\s*-\s*\d+)?)\s*\))/gi;
    
    let newContent = article.content.replace(regex, (match, fullMatch, surahStr, ayahStr) => {
      // Don't replace if it's already a markdown link
      if (article.content.includes(`[${fullMatch}](surah:`)) return match;
      
      return `[${fullMatch}](surah:${surahStr}:${ayahStr})`;
    });

    // Also let's try to match quotes that might span multiple sentences and have a citation at the end.
    // If the above regex doesn't catch it because of internal quotes, we can use a broader one:
    // Match an open quote, then anything non-greedy up to a citation.
    const regexBroader = /([“"”][\s\S]*?[“"”]\s*\(\s*(?:Quran|Surah)?\s*(\d+)\s*:\s*(\d+(?:\s*,\s*\d+|\s*-\s*\d+)?)\s*\))/gi;
    
    newContent = newContent.replace(regexBroader, (match, fullMatch, surahStr, ayahStr) => {
       // Only apply if not already linked
       if (match.startsWith('[')) return match;
       // Also avoid matching across huge chunks (e.g., more than 1000 characters)
       if (fullMatch.length > 1000) return match;
       
       return `[${fullMatch}](surah:${surahStr}:${ayahStr})`;
    });

    if (newContent !== article.content) {
      await db.update(scienceArticles).set({ content: newContent }).where(eq(scienceArticles.id, article.id)).execute();
      updatedCount++;
    }
  }
  
  console.log(`Updated ${updatedCount} articles.`);
}

main().catch(console.error);
