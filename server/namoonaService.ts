import fs from 'fs';
import path from 'path';

export interface NamoonaAyahContent {
  ur: string;
  en: string;
  surah: number;
  ayah: number;
  tafseer_title?: string;
}

const memorySurahCache = new Map<number, Record<number, NamoonaAyahContent>>();
const pendingFetches = new Map<number, Promise<Record<number, NamoonaAyahContent>>>();
const memoryHtmlCache = new Map<number, string>();

const STORAGE_DIR = path.join(process.cwd(), 'public', 'tafseer_namoona');
const DIST_DIR = path.join(process.cwd(), 'dist', 'tafseer_namoona');

if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}
if (fs.existsSync(path.join(process.cwd(), 'dist')) && !fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

function saveSurahToDisk(surahNumber: number, data: Record<number, NamoonaAyahContent>) {
  const jsonStr = JSON.stringify(data);
  const fileName = `surah_${surahNumber}.json`;
  
  try {
    if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });
    fs.writeFileSync(path.join(STORAGE_DIR, fileName), jsonStr, 'utf8');
  } catch (e) {
    console.warn(`[NamoonaService] Failed to write to public storage:`, e);
  }

  try {
    const distParent = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distParent)) {
      if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });
      fs.writeFileSync(path.join(DIST_DIR, fileName), jsonStr, 'utf8');
    }
  } catch (e) {
    console.warn(`[NamoonaService] Failed to write to dist storage:`, e);
  }
}

function loadSurahFromDisk(surahNumber: number): Record<number, NamoonaAyahContent> | null {
  const fileName = `surah_${surahNumber}.json`;
  const candidatePaths = [
    path.join(DIST_DIR, fileName),
    path.join(STORAGE_DIR, fileName),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf8');
        const data = JSON.parse(raw);
        if (data && Object.keys(data).length > 0) {
          return data;
        }
      } catch (e) {}
    }
  }
  return null;
}

function parseNamoonaRscHtml(html: string, surahNumber: number): Record<number, NamoonaAyahContent> {
  const parts = html.split('self.__next_f.push(');
  let fullPayload = '';
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const startIdx = part.indexOf('[');
    if (startIdx === -1) continue;

    let bracketCount = 0;
    let inString = false;
    let escape = false;
    let endIdx = -1;

    for (let j = startIdx; j < part.length; j++) {
      const char = part[j];
      if (!inString) {
        if (char === '[') bracketCount++;
        else if (char === ']') {
          bracketCount--;
          if (bracketCount === 0) {
            endIdx = j;
            break;
          }
        } else if (char === '"') inString = true;
      } else {
        if (escape) escape = false;
        else if (char === '\\') escape = true;
        else if (char === '"') inString = false;
      }
    }

    if (endIdx !== -1) {
      try {
        const jsonStr = part.substring(startIdx, endIdx + 1);
        const parsed = JSON.parse(jsonStr);
        if (parsed && Array.isArray(parsed) && typeof parsed[1] === 'string') {
          fullPayload += parsed[1];
        }
      } catch (e) {}
    }
  }

  const textNodes: Record<string, string> = {};
  const encodedFullPayload = new TextEncoder().encode(fullPayload);
  const regex = /([0-9a-zA-Z]+):T([0-9a-fA-F]+),/g;
  let match;
  let currentByteOffset = 0;
  let lastStringIndex = 0;

  while ((match = regex.exec(fullPayload)) !== null) {
    const id = match[1];
    const len = parseInt(match[2], 16);
    const chunk = fullPayload.substring(lastStringIndex, regex.lastIndex);
    currentByteOffset += new TextEncoder().encode(chunk).length;
    lastStringIndex = regex.lastIndex;

    if (currentByteOffset + len <= encodedFullPayload.length) {
      textNodes[id] = new TextDecoder('utf-8').decode(
        encodedFullPayload.slice(currentByteOffset, currentByteOffset + len)
      );
    }
  }

  const resolveRef = (ref: string | undefined): string | null => {
    if (!ref) return null;
    if (typeof ref === 'string' && ref.startsWith('$')) {
      const id = ref.substring(1);
      return textNodes[id] || null;
    }
    return ref;
  };

  const results: Record<number, NamoonaAyahContent> = {};
  let searchIdx = 0;

  while (true) {
    const ayatNumIdx = fullPayload.indexOf('"ayat_number":', searchIdx);
    if (ayatNumIdx === -1) break;

    const numStart = ayatNumIdx + 14;
    let numEnd = numStart;
    while (numEnd < fullPayload.length && /[0-9]/.test(fullPayload[numEnd])) {
      numEnd++;
    }
    const currentAyah = parseInt(fullPayload.substring(numStart, numEnd), 10);

    const topicsKeyIdx = fullPayload.indexOf('"tafseer_topics":', numEnd);
    if (topicsKeyIdx === -1) break;

    const arrayStartIdx = fullPayload.indexOf('[', topicsKeyIdx);
    if (arrayStartIdx === -1) {
      searchIdx = topicsKeyIdx + 17;
      continue;
    }

    let bracketCount = 0;
    let inString = false;
    let escape = false;
    let arrayEndIdx = -1;

    for (let j = arrayStartIdx; j < fullPayload.length; j++) {
      const char = fullPayload[j];
      if (!inString) {
        if (char === '[') bracketCount++;
        else if (char === ']') {
          bracketCount--;
          if (bracketCount === 0) {
            arrayEndIdx = j;
            break;
          }
        } else if (char === '"') inString = true;
      } else {
        if (escape) escape = false;
        else if (char === '\\') escape = true;
        else if (char === '"') inString = false;
      }
    }

    searchIdx = arrayEndIdx !== -1 ? arrayEndIdx : arrayStartIdx + 1;

    if (arrayEndIdx !== -1) {
      try {
        const topicsStr = fullPayload.substring(arrayStartIdx, arrayEndIdx + 1);
        const topics = JSON.parse(topicsStr);
        let ur = '';
        let en = '';

        for (const topic of topics) {
          const detailsUr = resolveRef(topic.details || topic.details_ur);
          const titleUr = resolveRef(topic.title || topic.title_ur);
          if (detailsUr?.trim()) {
            ur += `**${titleUr || 'Tafseer'}**\n\n${detailsUr}\n\n`;
          }

          const detailsEn = resolveRef(topic.details_en);
          const titleEn = resolveRef(topic.title_en);
          if (detailsEn?.trim()) {
            en += `**${titleEn || 'Tafseer'}**\n\n${detailsEn}\n\n`;
          }
        }

        if (ur.trim() || en.trim()) {
          results[currentAyah] = {
            ur: ur.trim(),
            en: en.trim(),
            surah: surahNumber,
            ayah: currentAyah,
            tafseer_title: 'تفسیر نمونہ — آیت الله ناصر مکارم شیرازی',
          };
        }
      } catch (e) {}
    }
  }

  return results;
}

async function fetchWithFallbacks(surahNumber: number): Promise<string> {
  const directUrl = `https://www.tafseerenamoona.net/surahs/${surahNumber}`;
  
  // Try direct fetch with 35 second timeout first (best & most complete RSC payload)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 35000);

      const res = await fetch(directUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,ur;q=0.8,ar;q=0.7',
        },
      });

      clearTimeout(timeout);

      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 500) {
          return text;
        }
      }
    } catch (e) {
      if (attempt === 2) {
        console.warn(`[NamoonaService] Direct fetch attempt ${attempt} failed for Surah ${surahNumber}:`, (e as any)?.message);
      }
    }
  }

  // Fallback to CORS proxies
  const proxyUrls = [
    `https://corsproxy.io/?url=${encodeURIComponent(directUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`,
  ];

  let lastErr: any;
  for (const url of proxyUrls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        },
      });

      clearTimeout(timeout);

      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 500) {
          return text;
        }
      }
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error(`Failed to fetch tafseer HTML for Surah ${surahNumber}`);
}

export async function getOrFetchNamoonaSurah(
  surahNumber: number
): Promise<Record<number, NamoonaAyahContent>> {
  // 1. Memory Cache
  if (memorySurahCache.has(surahNumber)) {
    return memorySurahCache.get(surahNumber)!;
  }

  // 2. Disk Cache (checks both dist and public)
  const diskData = loadSurahFromDisk(surahNumber);
  if (diskData) {
    memorySurahCache.set(surahNumber, diskData);
    return diskData;
  }

  // 3. Deduplicate in-flight fetch
  if (pendingFetches.has(surahNumber)) {
    return pendingFetches.get(surahNumber)!;
  }

  const fetchPromise = (async () => {
    try {
      const html = await fetchWithFallbacks(surahNumber);
      memoryHtmlCache.set(surahNumber, html);

      const parsed = parseNamoonaRscHtml(html, surahNumber);
      if (parsed && Object.keys(parsed).length > 0) {
        memorySurahCache.set(surahNumber, parsed);
        saveSurahToDisk(surahNumber, parsed);
        return parsed;
      }

      throw new Error(`No exegesis topics found in Surah ${surahNumber}`);
    } finally {
      pendingFetches.delete(surahNumber);
    }
  })();

  pendingFetches.set(surahNumber, fetchPromise);
  return fetchPromise;
}

export async function getNamoonaAyah(
  surahNumber: number,
  ayahNumber: number
): Promise<NamoonaAyahContent | null> {
  const surahData = await getOrFetchNamoonaSurah(surahNumber);
  return surahData[ayahNumber] || null;
}

export async function getNamoonaHtml(surahNumber: number): Promise<string> {
  if (memoryHtmlCache.has(surahNumber)) {
    return memoryHtmlCache.get(surahNumber)!;
  }

  const html = await fetchWithFallbacks(surahNumber);
  memoryHtmlCache.set(surahNumber, html);
  return html;
}

/**
 * Background crawler that smoothly pre-fetches and disk-caches all 114 Surahs of Tafseer Namoona
 */
let crawlerRunning = false;
export function startNamoonaBackgroundCrawler() {
  if (crawlerRunning) return;
  crawlerRunning = true;

  // Run in detached background loop
  setTimeout(async () => {
    console.log('[NamoonaCrawler] Starting background pre-caching for Tafseer Namoona...');
    // Prioritize popular surahs first: 1, 2, 3, 4, 5, 18, 36, 55, 56, 67, 76, 87, then 78-114, then rest
    const prioritySurahs = [
      1, 2, 3, 4, 5, 18, 36, 55, 56, 67, 76, 87,
      ...Array.from({ length: 37 }, (_, i) => 78 + i), // 78 to 114 (Juz 30)
      ...Array.from({ length: 114 }, (_, i) => i + 1), // 1 to 114 (all)
    ];

    const visited = new Set<number>();

    for (const surahNum of prioritySurahs) {
      if (visited.has(surahNum)) continue;
      visited.add(surahNum);

      const existing = loadSurahFromDisk(surahNum);
      if (existing && Object.keys(existing).length > 0) {
        continue;
      }

      try {
        console.log(`[NamoonaCrawler] Pre-fetching Surah ${surahNum}...`);
        await getOrFetchNamoonaSurah(surahNum);
        console.log(`[NamoonaCrawler] Successfully cached Surah ${surahNum}.`);
      } catch (err: any) {
        console.warn(`[NamoonaCrawler] Background fetch for Surah ${surahNum} deferred:`, err?.message);
      }

      // Gentle pause to respect upstream server
      await new Promise(r => setTimeout(r, 1200));
    }

    console.log('[NamoonaCrawler] Background pre-caching completed.');
    crawlerRunning = false;
  }, 5000);
}
