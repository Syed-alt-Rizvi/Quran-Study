import { db } from './src/db';
import { scienceArticles } from './src/db/schema';
import { eq } from 'drizzle-orm';
import * as cheerio from 'cheerio';

async function main() {
  console.log("Fetching articles...");
  const articles = await db.select().from(scienceArticles).execute();
  
  for (const article of articles) {
    let oldContent = article.content || '';
    
    // Attempt to extract text from HTML if it's stored as HTML
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
    
    // 1. TL;DR
    const tldr = `> **TL;DR (Editorial Briefing)**\n> * ${sentences[0]}\n> * ${sentences[sentences.length - 1]}\n\n`;
    
    // 2. THE HOOK
    const hook = `**${sentences[0]}** No, it goes deeper than that. ${sentences[1]} ${sentences.length > 2 ? sentences[2] : ''}\n\n`;
    
    // 3. Body with ASYMMETRIC HIERARCHY and HIGH-PERSONA INSERTS
    let newContent = tldr + hook + `## The Core Reality\n\n`;
    
    let currentParagraph = '';
    let paragraphSentences = 0;
    
    for (let i = 3; i < sentences.length; i++) {
      currentParagraph += sentences[i] + ' ';
      paragraphSentences++;
      
      // Keep paragraphs short (3-4 sentences max)
      if (paragraphSentences >= Math.floor(Math.random() * 2) + 2) { // 2-3 sentences
        newContent += currentParagraph.trim() + '\n\n';
        currentParagraph = '';
        paragraphSentences = 0;
        
        // Add random formatting and embedded UX triggers
        if (i === 6) {
          newContent += `> "${sentences[i - 1]}"\n\n`;
          newContent += `[IMAGE DESCRIPTOR: Insert elegant, minimalist photo or graphic here]\n\n`;
          newContent += `### Deeper Implications\n\n`;
        } else if (i === 12) {
          newContent += `> "${sentences[i - 1]}"\n\n`;
          newContent += `### Paradigm Shift\n\n`;
        }
      }
    }
    
    if (currentParagraph) {
      newContent += currentParagraph.trim() + '\n\n';
    }
    
    await db.update(scienceArticles)
      .set({ content: newContent.trim() })
      .where(eq(scienceArticles.id, article.id))
      .execute();
  }
  console.log("Finished updating articles.");
}

main().catch(console.error);
