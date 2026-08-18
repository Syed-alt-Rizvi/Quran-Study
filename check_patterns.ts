import { db } from './src/db';
import { scienceArticles } from './src/db/schema';

async function main() {
  const articles = await db.select().from(scienceArticles).execute();
  let matches = 0;
  
  for (const article of articles) {
    if (!article.content) continue;
    
    // Pattern to catch quote (anything in quotes) followed by citation (Quran 16:68 or 16: 68)
    // Or just a citation (Quran 16:68)
    const regex = /([“"”][^“"”]+[“"”])\s*\(\s*(?:Quran|Surah)?\s*(\d+)\s*:\s*(\d+(?:\s*,\s*\d+|\s*-\s*\d+)?)\s*\)/ig;
    
    let match;
    while ((match = regex.exec(article.content)) !== null) {
      console.log(`Matched in Article ID ${article.id.slice(0,5)}:`);
      console.log(`Full match: ${match[0].slice(0, 100)}...`);
      console.log(`Surah: ${match[2]}, Ayah: ${match[3]}`);
      console.log("---");
      matches++;
    }
  }
  
  console.log(`Total matches: ${matches}`);
}

main().catch(console.error);
