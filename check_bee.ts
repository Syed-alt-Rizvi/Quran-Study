import { db } from './src/db';
import { scienceArticles } from './src/db/schema';
import { like } from 'drizzle-orm';

async function main() {
  const articles = await db.select().from(scienceArticles).where(like(scienceArticles.content, "%healing for men%")).limit(1).execute();
  if(articles.length > 0) {
    const content = articles[0].content || '';
    const idx = content.indexOf("healing for men");
    console.log(content.slice(Math.max(0, idx - 150), idx + 150));
  } else {
    console.log("Not found.");
  }
}
main();
