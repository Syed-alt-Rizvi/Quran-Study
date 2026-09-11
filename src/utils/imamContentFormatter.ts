/**
 * Eloquent Content Formatter for Imam & Science Articles
 * Cleans scraped artifacts and structures raw text into pristine, semantic Markdown
 * with distinct styling for Quranic verses, Hadiths, headings, and reflections.
 */

export interface FormattedSection {
  id: string;
  title: string;
  level: number;
}

export interface FormattedArticleContent {
  cleanedMarkdown: string;
  tocHeadings: FormattedSection[];
  quranVerseCount: number;
  hadithCount: number;
}

export function formatImamArticleContent(rawContent: string, articleTitle: string): FormattedArticleContent {
  if (!rawContent) {
    return { cleanedMarkdown: '', tocHeadings: [], quranVerseCount: 0, hadithCount: 0 };
  }

  let text = rawContent;

  // 1. Remove scraping headers (categories, search inputs, social links)
  text = text.replace(/^[\s\S]*?(?:Search\s+Search for:|Support\/Contact Us|Learn More|Motivation\s+Follow Us)/i, '');
  
  // 2. Remove footer noise (Read Also, Leave a Reply, Author cards, etc.)
  text = text.replace(/Read Also:[\s\S]*$/i, '');
  text = text.replace(/Leave a Reply[\s\S]*$/i, '');
  text = text.replace(/Recent Posts[\s\S]*$/i, '');

  // 3. Remove repeated author / email stamps
  text = text.replace(/By\s+[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\s+[A-Za-z]+\s+\d{1,2},\s+\d{4}/gi, '');
  text = text.replace(/By\s+syed[a-zA-Z0-9._%+-]*/gi, '');

  // 4. Clean leading title repetition if present
  if (articleTitle) {
    const escapedTitle = articleTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const titleRegex = new RegExp(`^\\s*${escapedTitle}\\s*`, 'i');
    text = text.replace(titleRegex, '');
  }

  // 5. Structure numbered points as clean H3 headings:
  // e.g. "1. Closeness to Allah (SWT)" -> "\n\n### 1. Closeness to Allah (SWT)\n\n"
  text = text.replace(/(?:^|\n|\.\s+)(\d{1,2}\.\s+[A-Z][^\n.]{3,60}?)(?=(?:Reciting|The|Qur’an|Hadith|Whoever|In|When|Every|This|One|[A-Z][a-z]+))/g, '\n\n### $1\n\n');

  // 6. Format Quranic citations into dedicated blockquotes
  let quranCount = 0;
  text = text.replace(/(?:Qur[’']an|Quran):\s*([“"][^”"]+[”"]\s*(?:[—–-]\s*Surah[^\n.]+(?:\([^)]+\))?)?)/gi, (match, quote) => {
    quranCount++;
    return `\n\n> 📖 **Qur’an:** *${quote.trim()}*\n\n`;
  });

  // 7. Format Hadith citations into dedicated blockquotes
  let hadithCount = 0;
  text = text.replace(/Hadith\s*(\([^)]+\))?:\s*([“"][^”"]+[”"](?:\s*[—–-]\s*[^\n.]+)?)/gi, (match, source, quote) => {
    hadithCount++;
    const srcStr = source ? ` ${source}` : '';
    return `\n\n> 💫 **Hadith${srcStr}:** *${quote.trim()}*\n\n`;
  });

  // 8. Separate consecutive sentences into pleasant paragraphs if they are stuck together
  text = text.replace(/([.?!])\s*([A-Z][a-z]{2,})/g, '$1\n\n$2');

  // 9. Format common Islamic section headings
  const commonHeadings = [
    'In the Name of Allah',
    'Introduction',
    'The Benefits of Reciting',
    'Scientific Reflections',
    'Historical Context',
    'Reflections and Lessons',
    'Final Reflection',
    'Conclusion',
    'Think and Answer',
    'Intellectual Proof',
    'Tradition of',
    'The Inward Way',
    'The Outer Way'
  ];

  for (const h of commonHeadings) {
    const reg = new RegExp(`(?:\n|^)(${h}[^\n]*)(?:\n|$)`, 'gi');
    text = text.replace(reg, '\n\n## $1\n\n');
  }

  // 10. Clean up excessive consecutive newlines
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  // 11. Extract Table of Contents headings
  const tocHeadings: FormattedSection[] = [];
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  let match;
  while ((match = headingRegex.exec(text)) !== null) {
    const level = match[1].length;
    const rawHeading = match[2].trim();
    // Skip if too long or contains formatting symbols
    if (rawHeading.length > 2 && rawHeading.length < 80) {
      const cleanId = rawHeading.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      tocHeadings.push({
        id: cleanId,
        title: rawHeading,
        level
      });
    }
  }

  return {
    cleanedMarkdown: text,
    tocHeadings,
    quranVerseCount: quranCount,
    hadithCount
  };
}
