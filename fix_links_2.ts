import { db } from './src/db';
import { scienceArticles } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const articles = await db.select().from(scienceArticles).execute();
  let updatedCount = 0;
  
  for (const article of articles) {
    if (!article.content) continue;
    
    let newContent = article.content;
    
    // Remove old broken nested links if any
    const removeLinkRegex = /\[+([^\]]+)\]+\(surah:[^\)]+\)/gi;
    newContent = newContent.replace(removeLinkRegex, "$1");
    
    // Improved regex: no quotes inside the quotes
    const regex = /(\(*[“"”][^“"”]*?[“"”]\)*\s*\(\s*(?:Quran|Surah)?\s*(\d+)\s*[:.]\s*(\d+(?:\s*,\s*\d+|\s*-\s*\d+)?)\s*\))/gi;
    
    newContent = newContent.replace(regex, (match, fullMatch, surahStr, ayahStr) => {
       if (match.startsWith('[')) return match;
       return `[${fullMatch}](surah:${surahStr}:${parseInt(ayahStr)})`;
    });
    
    // Also try to find patterns without quotes, just a paragraph ending in citation:
    // "Blah blah blah (Quran 23:14)" if they are not already linked.
    // Match start of paragraph, any text (no brackets), ending in citation
    // Actually, maybe too risky as it could link whole sections. The prompt says "such paragraphs where an exact quranic paragraph is quoted". Often they have quotes. 
    // Let's also catch simple citation blocks like "(16: 68, 69)" if we missed quotes. But the user said "where an exact quranic paragraph is quoted". The quoted text usually has quotes.

    if (newContent !== article.content) {
      await db.update(scienceArticles).set({ content: newContent }).where(eq(scienceArticles.id, article.id)).execute();
      updatedCount++;
    }
  }
  
  console.log(`Updated ${updatedCount} articles with better links.`);
}

main().catch(console.error);
