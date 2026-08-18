import { db } from './src/db';
import { scienceArticles } from './src/db/schema';
async function main() {
  const articles = await db.select().from(scienceArticles).execute();
  console.log("Count:", articles.length);
}
main();
