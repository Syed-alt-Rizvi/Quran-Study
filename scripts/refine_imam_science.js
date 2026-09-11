import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

const dataPath = path.resolve('src/db/imam_science_data.json');
const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

function cleanTextFallback(text) {
  if (!text) return '';
  // Strip common scraping noise
  let cleaned = text
    .replace(/^.*?Search\s+Search for:.*?Follow Us/si, '')
    .replace(/Read Also:.*$/si, '')
    .replace(/Leave a Reply.*$/si, '')
    .replace(/By\s+[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\s+[A-Za-z]+\s+\d{1,2},\s+\d{4}/gi, '')
    .trim();

  // Split into paragraphs by numbers or headings
  cleaned = cleaned.replace(/(\d+\.\s+[A-Z][^\n]+?)(Reciting|The|Qur’an|Hadith|Whoever|In)/g, '$1\n\n$2');
  cleaned = cleaned.replace(/(Qur’an:\s*“[^”]+?”\s*—\s*Surah[^\n]+)/g, '\n\n> 📖 **$1**\n\n');
  cleaned = cleaned.replace(/(Hadith\s*\([^)]+\):\s*“[^”]+?”)/g, '\n\n> 💫 **$1**\n\n');
  return cleaned;
}

function extractStructuredFromHtml(html, defaultTitle) {
  const $ = cheerio.load(html);
  
  // Clean unwanted elements
  $('script, style, form, nav, header, footer, .sharedaddy, .yarpp-related, .jp-relatedposts, .post-navigation, .comments-area, .author-box, .wp-block-buttons, .share-buttons, .widget, .sidebar').remove();

  const container = $('.entry-content').length ? $('.entry-content') : $('article');
  
  container.find('div, p').each((_, el) => {
    const txt = $(el).text().trim().toLowerCase();
    if (txt === 'read also:' || txt.startsWith('search for:') || txt === 'support/contact us' || txt === 'follow us') {
      $(el).remove();
    }
  });

  const blocks = [];
  const headings = [];

  container.children().each((_, el) => {
    const $el = $(el);
    const tag = el.tagName.toLowerCase();
    const text = $el.text().trim();

    if (tag === 'h1' || tag === 'h2') {
      if (text && text.toLowerCase() !== defaultTitle.toLowerCase()) {
        blocks.push(`\n\n## ${text}\n\n`);
        headings.push({ level: 'h2', text });
      }
    } else if (tag === 'h3') {
      if (text) {
        blocks.push(`\n\n### ${text}\n\n`);
        headings.push({ level: 'h3', text });
      }
    } else if (tag === 'h4' || tag === 'h5' || tag === 'h6') {
      if (text) {
        blocks.push(`\n\n#### ${text}\n\n`);
        headings.push({ level: 'h4', text });
      }
    } else if (tag === 'blockquote') {
      if (text) {
        blocks.push(`\n\n> ${text}\n\n`);
      }
    } else if (tag === 'ul') {
      const items = [];
      $el.find('> li').each((_, li) => {
        const liTxt = $(li).text().trim();
        if (liTxt) items.push(`* ${liTxt}`);
      });
      if (items.length) blocks.push(`\n\n${items.join('\n')}\n\n`);
    } else if (tag === 'ol') {
      const items = [];
      $el.find('> li').each((idx, li) => {
        const liTxt = $(li).text().trim();
        if (liTxt) items.push(`${idx + 1}. ${liTxt}`);
      });
      if (items.length) blocks.push(`\n\n${items.join('\n')}\n\n`);
    } else if (tag === 'p') {
      const img = $el.find('img');
      if (img.length) {
        const src = img.attr('data-src') || img.attr('src');
        const alt = img.attr('alt') || '';
        if (src && !src.includes('gravatar')) {
          blocks.push(`\n\n![${alt}](${src})\n\n`);
        }
      }
      if (text) {
        if (/^(Qur’an|Quran):/i.test(text)) {
          blocks.push(`\n\n> 📖 **${text}**\n\n`);
        } else if (/^Hadith/i.test(text)) {
          blocks.push(`\n\n> 💫 **${text}**\n\n`);
        } else {
          blocks.push(`\n\n${text}\n\n`);
        }
      }
    } else if (tag === 'div') {
      const subItems = $el.find('p, h2, h3, h4, blockquote, ul, ol');
      if (subItems.length > 0) {
        subItems.each((_, sub) => {
          const $sub = $(sub);
          const stag = sub.tagName.toLowerCase();
          const stext = $sub.text().trim();
          if (!stext) return;
          if (stag.startsWith('h')) {
            blocks.push(`\n\n### ${stext}\n\n`);
            headings.push({ level: stag, text: stext });
          } else if (stag === 'blockquote') {
            blocks.push(`\n\n> ${stext}\n\n`);
          } else {
            blocks.push(`\n\n${stext}\n\n`);
          }
        });
      } else if (text) {
        blocks.push(`\n\n${text}\n\n`);
      }
    }
  });

  return {
    content: blocks.join('').trim(),
    headings: headings.length > 0 ? headings : []
  };
}

async function processArticle(article) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(article.sourceUrl, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const { content, headings } = extractStructuredFromHtml(html, article.title);

    if (content && content.length > 200) {
      return {
        ...article,
        content,
        headings: headings.length > 0 ? headings : article.headings,
        wordCount: content.split(/\s+/).length,
        readingTime: `${Math.max(2, Math.round(content.split(/\s+/).length / 200))} min read`
      };
    }
  } catch (err) {
    console.warn(`Fallback for ${article.title}: ${err.message}`);
  }

  // Fallback cleanup if fetch failed
  const cleaned = cleanTextFallback(article.content);
  return {
    ...article,
    content: cleaned
  };
}

async function run() {
  console.log(`Starting refinement of ${rawData.articles.length} articles...`);
  const updatedArticles = [];
  const chunkSize = 5;

  for (let i = 0; i < rawData.articles.length; i += chunkSize) {
    const chunk = rawData.articles.slice(i, i + chunkSize);
    const results = await Promise.all(chunk.map(processArticle));
    updatedArticles.push(...results);
    console.log(`Processed ${updatedArticles.length}/${rawData.articles.length} articles`);
  }

  rawData.articles = updatedArticles;
  fs.writeFileSync(dataPath, JSON.stringify(rawData, null, 2), 'utf8');
  console.log('Successfully saved refined dataset to src/db/imam_science_data.json!');
}

run();
