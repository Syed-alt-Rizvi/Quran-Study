import { db } from './src/db';
import { scienceArticles } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const articles = await db.select().from(scienceArticles).execute();
  let matches = 0;
  
  for (const article of articles) {
    if (!article.content) continue;
    
    // Find paragraphs ending in a citation.
    // Paragraph = anything between double newlines or string start/end, ending in (Quran X:Y) or (X:Y)
    const paragraphs = article.content.split('\n\n');
    
    for (const p of paragraphs) {
      if (p.trim().length === 0) continue;
      
      // regex to see if it ends with citation, ignoring trailing spaces or punctuation
      const citationRegex = /\(\s*(?:Quran|Surah)?\s*(\d+)\s*[:.]\s*(\d+(?:\s*,\s*\d+|\s*-\s*\d+)?)\s*\)[.\s]*$/i;
      
      const match = citationRegex.exec(p);
      if (match) {
        // If it doesn't already contain a surah: link
        if (!p.includes('](surah:')) {
           matches++;
           console.log(`Found unlinked paragraph citation in Article ID ${article.id.slice(0,5)}:`);
           console.log(p.slice(0, 100) + '...');
           console.log(`Surah: ${match[1]}, Ayah: ${match[2]}`);
           console.log('---');
        }
      }
    }
  }
  
  console.log(`Found ${matches} unlinked paragraph citations.`);
}

main().catch(console.error);
