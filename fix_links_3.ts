import { db } from './src/db';
import { scienceArticles } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const articles = await db.select().from(scienceArticles).execute();
  let updatedCount = 0;
  
  for (const article of articles) {
    if (!article.content) continue;
    
    const paragraphs = article.content.split('\n\n');
    let changed = false;
    
    for (let i = 0; i < paragraphs.length; i++) {
      let p = paragraphs[i];
      if (p.trim().length === 0) continue;
      
      // regex to see if it ends with citation, ignoring trailing spaces or punctuation
      const citationRegex = /\(\s*(?:Quran|Surah)?\s*(\d+)\s*[:.]\s*(\d+(?:\s*,\s*\d+|\s*-\s*\d+)?)\s*\)[.\s]*$/i;
      
      const match = citationRegex.exec(p);
      if (match && !p.includes('](surah:')) {
        // Strip trailing punctuation if needed or just wrap the whole thing
        const surahStr = match[1];
        const ayahStr = parseInt(match[2]);
        
        // Let's replace the whole paragraph content with a link
        // We will just wrap it directly.
        paragraphs[i] = `[${p}](surah:${surahStr}:${ayahStr})`;
        changed = true;
      }
    }
    
    if (changed) {
      await db.update(scienceArticles).set({ content: paragraphs.join('\n\n') }).where(eq(scienceArticles.id, article.id)).execute();
      updatedCount++;
    }
  }
  
  console.log(`Updated ${updatedCount} articles with paragraph links.`);
}

main().catch(console.error);
