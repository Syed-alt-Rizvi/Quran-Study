import { db } from './src/db';
import { scienceArticles } from './src/db/schema';
import { like } from 'drizzle-orm';

async function main() {
  const articles = await db.select().from(scienceArticles).where(like(scienceArticles.content, "%surah:%")).limit(1).execute();
  if(articles.length > 0) {
    console.log(articles[0].content?.slice(0, 1500));
  } else {
    console.log("No links found.");
  }
}
main();
