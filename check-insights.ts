import { db } from './src/db';
import { scienceArticles, ayahScienceRelationships } from './src/db/schema';
import { sql } from 'drizzle-orm';

async function main() {
  const allArticles = await db.select().from(scienceArticles).execute();
  const rels = await db.select().from(ayahScienceRelationships).execute();
  
  const linkedArticleIds = new Set(rels.map(r => r.articleId));
  console.log(`Total articles: ${allArticles.length}`);
  console.log(`Articles with insights: ${linkedArticleIds.size}`);
  
  // Show a few articles without insights to see their content format
  const unlinked = allArticles.filter(a => !linkedArticleIds.has(a.id));
  if (unlinked.length > 0) {
    console.log("\nSample unlinked article 1:");
    console.log("Title:", unlinked[0].title);
    console.log("Content preview:", unlinked[0].content.substring(0, 500));
    
    if (unlinked.length > 1) {
      console.log("\nSample unlinked article 2:");
      console.log("Title:", unlinked[1].title);
      console.log("Content preview:", unlinked[1].content.substring(0, 500));
    }
  }
}
main().catch(console.error);
