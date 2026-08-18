import { db } from './src/db';
import { scienceArticles } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const articles = await db.select().from(scienceArticles).execute();
  const seen = new Set();
  const toDelete = [];
  
  for (const article of articles) {
    const key = article.title.trim().toLowerCase(); // check by title since URLs might have slight variations (http vs https, trailing slash)
    if (seen.has(key)) {
      toDelete.push(article.id);
    } else {
      seen.add(key);
    }
  }
  
  console.log(`Found ${toDelete.length} duplicates out of ${articles.length} total articles.`);
  
  for (const id of toDelete) {
    await db.delete(scienceArticles).where(eq(scienceArticles.id, id)).execute();
  }
  
  console.log("Deleted duplicates.");
}

main().catch(console.error);
