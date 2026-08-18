import { db } from './src/db';
import { scienceArticles } from './src/db/schema';
import { like } from 'drizzle-orm';

async function main() {
  const articles = await db.select().from(scienceArticles).where(like(scienceArticles.content, "%healing for men%")).limit(1).execute();
  if(articles.length > 0) {
    let content = articles[0].content || '';
    
    // First, remove existing bad links
    content = content.replace(/\[+([^\]]+)\]+\(surah:[^\)]+\)/gi, "$1");
    
    // Improved regex: do not allow quotes inside the quote
    const regex = /(\(*[“"”][^“"”]*?[“"”]\)*\s*\(\s*(?:Quran|Surah)?\s*(\d+)\s*[:.]\s*(\d+(?:\s*,\s*\d+|\s*-\s*\d+)?)\s*\))/gi;
    
    let newContent = content.replace(regex, (match, fullMatch, surahStr, ayahStr) => {
       console.log("Found match: ", fullMatch.slice(0, 50));
       return `[${fullMatch}](surah:${surahStr}:${parseInt(ayahStr)})`;
    });
    console.log(newContent !== content);
  } else {
    console.log("Not found.");
  }
}
main();
