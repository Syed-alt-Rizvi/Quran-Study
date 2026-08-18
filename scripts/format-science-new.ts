import { db } from '../src/db';
import { scienceArticles } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import * as cheerio from 'cheerio';

async function main() {
  console.log("Formatting articles...");
  const articles = await db.select().from(scienceArticles).execute();
  
  for (const article of articles) {
    let oldContent = article.content || '';
    
    // Clean up text
    if (oldContent.includes('<')) {
      const $ = cheerio.load(oldContent);
      oldContent = $('body').text();
    }
    
    // Split into sentences
    const sentences = oldContent
      .split(/(?<=[.?!])\s+/)
      .filter(s => s.trim().length > 0)
      .map(s => s.trim().replace(/\s+/g, ' '));
      
    if (sentences.length < 3) continue;
    
    // Create short, precise, informative format
    // Just 2-3 clear paragraphs summarizing the point.
    let newContent = '';
    
    let currentParagraph = '';
    let paragraphSentences = 0;
    
    for (let i = 0; i < sentences.length; i++) {
      currentParagraph += sentences[i] + ' ';
      paragraphSentences++;
      
      // Keep paragraphs short (2-3 sentences)
      if (paragraphSentences >= 3) {
        newContent += currentParagraph.trim() + '\n\n';
        currentParagraph = '';
        paragraphSentences = 0;
      }
      
      // Stop after 3 paragraphs max to keep it short and precise
      if (newContent.split('\n\n').length >= 4) {
        break;
      }
    }
    
    if (currentParagraph && newContent.split('\n\n').length < 4) {
      newContent += currentParagraph.trim() + '\n\n';
    }
    
    // Remove all credits from the article metadata
    await db.update(scienceArticles)
      .set({ 
        content: newContent.trim(),
        author: '',
        source: '',
        originalUrl: '',
        license: ''
      })
      .where(eq(scienceArticles.id, article.id))
      .execute();
  }
  console.log("Finished updating articles.");
}

main().catch(console.error);
