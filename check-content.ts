import { db } from './src/db';
import { scienceArticles } from './src/db/schema';
async function test() {
   const articles = await db.select().from(scienceArticles).limit(5).execute();
   for (const article of articles) {
      console.log(`Title: ${article.title}, Content Length: ${article.content.length}`);
      console.log(`Content excerpt: ${article.content.substring(0, 50)}...`);
   }
}
test();
