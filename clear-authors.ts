import { db } from './src/db';
import { scienceArticles } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  await db.update(scienceArticles)
    .set({ 
      author: '',
      source: '',
      originalUrl: '',
      license: ''
    })
    .execute();
  console.log("All credits removed.");
}
main().catch(console.error);
