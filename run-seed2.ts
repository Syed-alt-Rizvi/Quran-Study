import { db } from './src/db/index';
import { scienceArticles } from './src/db/schema';
import dataRaw from './src/db/data.json';

const data = dataRaw as any;
async function test() {
  for (const a of data.articles) {
    try {
      await db.insert(scienceArticles).values({
        id: a.id,
        title: a.title,
        author: a.author,
        content: a.content,
        source: a.source,
        originalUrl: a.original_url,
        license: a.license,
        publicationDate: a.publication_date,
        createdAt: a.created_at
      }).execute();
    } catch (e) {
      console.error('Failed on article:', a.id, e.message);
    }
  }
}
test().catch(console.error);
