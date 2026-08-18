import { db } from './src/db';
import { scienceArticles } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const articles = await db.select().from(scienceArticles).execute();
  let updatedCount = 0;
  
  for (const article of articles) {
    if (!article.content) continue;
    
    let newContent = article.content;
    
    // 1. Remove all existing custom links to reset the state
    // Pattern to match [[...](surah:...)] or [...](surah:...)
    const removeLinkRegex = /\[+([^\]]+)\]+\(surah:[^\)]+\)/gi;
    newContent = newContent.replace(removeLinkRegex, "$1");
    
    // 2. Apply new links
    // Match optional open paren, quote, anything, quote, optional close paren, then citation (Surah: Ayah)
    // Example: (“And thy Lord taught the Bee ...”) (16: 68, 69)
    // Or: "..." (Quran 16:68)
    const regex = /(\(*[“"”][\s\S]*?[“"”]\)*\s*\(\s*(?:Quran|Surah)?\s*(\d+)\s*[:.]\s*(\d+(?:\s*,\s*\d+|\s*-\s*\d+)?)\s*\))/gi;
    
    newContent = newContent.replace(regex, (match, fullMatch, surahStr, ayahStr) => {
       // Only apply if not already linked (we just removed them, but just in case)
       if (match.startsWith('[')) return match;
       // Also avoid matching across huge chunks (e.g., more than 1000 characters)
       if (fullMatch.length > 1500) return match;
       
       return `[${fullMatch}](surah:${surahStr}:${parseInt(ayahStr)})`;
    });

    if (newContent !== article.content) {
      await db.update(scienceArticles).set({ content: newContent }).where(eq(scienceArticles.id, article.id)).execute();
      updatedCount++;
    }
  }
  
  console.log(`Updated ${updatedCount} articles with clean links.`);
}

main().catch(console.error);
