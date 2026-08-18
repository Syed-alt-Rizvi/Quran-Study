import { db } from './src/db';
import { scienceArticles } from './src/db/schema';
import { sql } from 'drizzle-orm';

async function main() {
  const result = await db.select({ count: sql<number>`count(*)` }).from(scienceArticles).execute();
  console.log("Total articles in DB:", result[0].count);
  
  const sample = await db.select().from(scienceArticles).limit(1).execute();
  console.log("\nSample article title:", sample[0].title);
  console.log("Content length:", sample[0].content.length);
  console.log("Author:", sample[0].author);
}
main().catch(console.error);
