import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

const ROOT_URL = 'https://www.ya-mahdi.net/';
const CACHE_DIR = path.resolve('scripts/cache');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Main categories to crawl (excluding quran and shialm as requested)
const ROOT_CATEGORIES = [
  { code: 'maf_every', name: 'Everyday Recitations', icon: 'Sun' },
  { code: 'maf_taqee', name: 'Taqibaat e Namaz', icon: 'Clock' },
  { code: 'maf_namaz', name: 'Namaz & Special Prayers', icon: 'Heart' },
  { code: 'maf_dua', name: 'Duas & Supplications', icon: 'BookOpen' },
  { code: 'maf_ziy', name: 'Ziyaraat of Ahlulbayt (a.s)', icon: 'Compass' },
  { code: 'maf_aamal', name: 'Aamaal & Monthly Rituals', icon: 'Flame' },
  { code: 'maf_munaj', name: '15 Whispered Prayers (Munajaat)', icon: 'Headphones' },
  { code: 'maf_baqe', name: 'Baqiyaat us Saalehaat', icon: 'Bookmark' },
  { code: 'maf_ziy_MF', name: 'Ziyaraat of Holy Places', icon: 'Compass' },
  { code: 'maf_journey', name: 'Journey to Paradise', icon: 'ArrowRight' },
  { code: 'sahifa_fatema', name: 'Sahifa e Fatemiyyah', icon: 'Heart' },
  { code: 'sahifa', name: 'Sahifa e Sajjadiyyah', icon: 'BookOpen' },
  { code: 'sahifa_mahdi', name: 'Sahifa e Mahdiyyah', icon: 'Flame' },
];

function getCachePath(key) {
  const safe = key.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(CACHE_DIR, `${safe}.html`);
}

async function fetchCached(url, cacheKey, retries = 3) {
  const cacheFile = getCachePath(cacheKey);
  if (fs.existsSync(cacheFile)) {
    return fs.readFileSync(cacheFile, 'utf8');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      fs.writeFileSync(cacheFile, text, 'utf8');
      return text;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 600 * attempt));
    }
  }
}

async function runWorkerPool(tasks, concurrency, handler) {
  let index = 0;
  const results = [];
  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      try {
        results[i] = await handler(tasks[i], i);
      } catch (err) {
        console.error(`Task ${i} failed:`, err.message);
        results[i] = null;
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

async function discover() {
  console.log('--- Step 1: Discovering Category Tree ---');
  const leaves = new Map(); // viewCat -> { code, viewCat, title, mainCategory, categoryChain }
  const visitedCats = new Set();
  const catQueue = [];

  // Seed with root categories
  for (const root of ROOT_CATEGORIES) {
    catQueue.push({
      code: root.code,
      mainCategory: root.name,
      mainCategoryCode: root.code,
      chain: [root.name],
    });
  }

  let queueIdx = 0;
  const concurrency = 12;

  async function discoveryWorker() {
    while (queueIdx < catQueue.length) {
      const item = catQueue[queueIdx++];
      if (!item || visitedCats.has(item.code)) continue;
      visitedCats.add(item.code);

      try {
        const url = `${ROOT_URL}category.php?code=${encodeURIComponent(item.code)}&lang=en`;
        const html = await fetchCached(url, `cat_${item.code}`);
        const $ = cheerio.load(html);

        const pageTitle = $('h2.section-title').text().trim() || item.code;
        const currentChain = [...item.chain];
        if (pageTitle && !currentChain.includes(pageTitle)) {
          currentChain.push(pageTitle);
        }

        // Check for view.php redirect inside main
        const mainHtml = $('main.container').html() || '';
        const viewMatch = mainHtml.match(/view\.php\?cat=([^"&\x27]+)/);

        if (viewMatch) {
          const viewCat = viewMatch[1];
          leaves.set(viewCat, {
            code: item.code,
            viewCat,
            title: pageTitle,
            mainCategory: item.mainCategory,
            mainCategoryCode: item.mainCategoryCode,
            categoryChain: currentChain,
          });
        } else {
          // Look for sub-cards
          const cards = $('a.category-card');
          cards.each((_, el) => {
            const href = $(el).attr('href') || '';
            const m = href.match(/code=([^"&]+)/);
            if (m && m[1] && !visitedCats.has(m[1])) {
              catQueue.push({
                code: m[1],
                mainCategory: item.mainCategory,
                mainCategoryCode: item.mainCategoryCode,
                chain: currentChain,
              });
            }
          });
        }
      } catch (err) {
        // Continue
      }
    }
  }

  // Run discovery with parallel workers until queue is exhausted
  while (queueIdx < catQueue.length) {
    await Promise.all(Array.from({ length: concurrency }, () => discoveryWorker()));
  }

  console.log(`Discovered ${visitedCats.size} category pages, ${leaves.size} unique leaf supplications!`);
  return [...leaves.values()];
}

function parseViewHtml(html, item) {
  const $ = cheerio.load(html);

  // Audio URL
  let audioUrl = $('#audioPlayer').attr('src') || $('audio source').attr('src') || null;
  if (audioUrl && !audioUrl.startsWith('http')) {
    audioUrl = `${ROOT_URL}${audioUrl.replace(/^\/+/, '')}`;
  }

  const title = $('h2.section-title').text().trim() || item.title || $('title').text().replace('- Divine Pearls', '').trim();

  // Content extraction from dua-card
  const contentLines = [];
  const verses = [];
  let pendingArabic = '';

  $('.dua-card').children().each((_, el) => {
    const $el = $(el);
    const cls = $el.attr('class') || '';
    const text = $el.text().trim();
    if (!text) return;

    if (cls.includes('content-line')) {
      contentLines.push(text);
    } else if (cls.includes('arabic-line')) {
      if (pendingArabic) {
        verses.push({
          index: verses.length + 1,
          arabic: pendingArabic,
          translation: '',
        });
      }
      pendingArabic = text;
    } else if (cls.includes('translation-line')) {
      verses.push({
        index: verses.length + 1,
        arabic: pendingArabic,
        translation: text,
      });
      pendingArabic = '';
    }
  });

  if (pendingArabic) {
    verses.push({
      index: verses.length + 1,
      arabic: pendingArabic,
      translation: '',
    });
  }

  return {
    id: item.viewCat,
    code: item.code,
    title,
    mainCategory: item.mainCategory,
    mainCategoryCode: item.mainCategoryCode,
    categoryChain: item.categoryChain,
    audioUrl,
    introduction: contentLines.join('\n\n'),
    versesCount: verses.length,
    verses,
    sourceUrl: `${ROOT_URL}view.php?cat=${item.viewCat}&lang=en`,
  };
}

async function scrapeAll(leaves) {
  console.log(`--- Step 2: Scraping Content for ${leaves.length} Supplications ---`);
  let completed = 0;
  const concurrency = 12;

  const results = await runWorkerPool(leaves, concurrency, async (leaf) => {
    const url = `${ROOT_URL}view.php?cat=${encodeURIComponent(leaf.viewCat)}&lang=en`;
    const html = await fetchCached(url, `view_${leaf.viewCat}`);
    completed++;
    if (completed % 25 === 0 || completed === leaves.length) {
      console.log(`Scraped ${completed}/${leaves.length} (${((completed / leaves.length) * 100).toFixed(0)}%)...`);
    }
    return parseViewHtml(html, leaf);
  });

  return results.filter(Boolean);
}

async function main() {
  const t0 = Date.now();
  const leaves = await discover();
  const items = await scrapeAll(leaves);

  console.log(`Scraped ${items.length} total supplications with full content in ${((Date.now() - t0) / 1000).toFixed(1)}s!`);

  const outDir = path.resolve('src/db');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Full Dataset
  const fullPath = path.join(outDir, 'mafatih_full_data.json');
  fs.writeFileSync(fullPath, JSON.stringify(items, null, 2), 'utf8');
  console.log(`Saved full dataset: ${fullPath} (${(fs.statSync(fullPath).size / (1024 * 1024)).toFixed(2)} MB)`);

  // 2. Summary Index (for quick search & browsing)
  const summary = items.map(it => ({
    id: it.id,
    code: it.code,
    title: it.title,
    mainCategory: it.mainCategory,
    mainCategoryCode: it.mainCategoryCode,
    categoryChain: it.categoryChain,
    hasAudio: !!it.audioUrl,
    audioUrl: it.audioUrl,
    versesCount: it.versesCount,
    snippet: it.verses[0]?.translation || it.introduction.slice(0, 150) || '',
  }));

  const indexPath = path.join(outDir, 'mafatih_index.json');
  fs.writeFileSync(indexPath, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`Saved index dataset: ${indexPath} (${(fs.statSync(indexPath).size / 1024).toFixed(1)} KB)`);
}

main().catch(err => {
  console.error('Scraper failed:', err);
  process.exit(1);
});
