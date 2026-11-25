import { getApiUrl } from './utils/apiBase';
import { fastStorage } from './utils/fastStorage';
import { isValidMafatihDetail, notifyIntegrityRecovery } from './utils/dataIntegrity';
import { normalizeArabicForSearch, normalizeLatinForSearch } from './utils/arabicSearch';

export interface MafatihSummary {
  id: string;
  code: string;
  title: string;
  mainCategory: string;
  mainCategoryCode: string;
  categoryChain: string[];
  hasAudio: boolean;
  audioUrl?: string | null;
  versesCount: number;
  snippet: string;
}

export interface MafatihVerse {
  index: number;
  arabic: string;
  translation: string;
}

export interface MafatihDetail {
  id: string;
  code: string;
  title: string;
  mainCategory: string;
  mainCategoryCode: string;
  categoryChain: string[];
  audioUrl?: string | null;
  introduction: string;
  versesCount: number;
  verses: MafatihVerse[];
  sourceUrl: string;
}

export interface MafatihCategory {
  name: string;
  code: string;
  count: number;
  audioCount: number;
}

export const MAFATIH_ALIASES: Record<string, string> = {
  kumayl: "maf_dua40",
  kumail: "maf_dua40",
  "dua-kumayl": "maf_dua40",
  "dua-kumail": "maf_dua40",
  tawassul: "maf_dua51",
  "dua-tawassul": "maf_dua51",
  ashura: "maf_ziy86",
  "ziyarat-ashura": "maf_ziy86",
  nudba: "maf_ziy126a",
  nudbah: "maf_ziy126a",
  "dua-nudba": "maf_ziy126a",
  "dua-nudbah": "maf_ziy126a",
  faraj: "maf_dua46b",
  "dua-faraj": "maf_dua46b",
  kisa: "h_kisa",
  "hadith-kisa": "h_kisa",
  "hadith-e-kisa": "h_kisa",
  ahad: "maf_ziy128",
  "dua-ahad": "maf_ziy128",
  "dua-ahd": "maf_ziy128",
  "dua-al-ahd": "maf_ziy128",
  waritha: "maf_ziy73a",
  wareeth: "maf_ziy73a",
  "ziyarat-waritha": "maf_ziy73a",
  mashlool: "maf_dua43",
  "dua-mashlool": "maf_dua43",
  sabah: "maf_dua39",
  "dua-sabah": "maf_dua39",
  jawshan: "maf_dua47",
  joshan: "maf_dua47",
  "dua-jawshan": "maf_dua47",
  "dua-jawshan-kabir": "maf_dua47",
  "dua-jawshan-kabeer": "maf_dua47",
  mujir: "maf_dua45",
  mujeer: "maf_dua45",
  "dua-mujir": "maf_dua45",
  "dua-mujeer": "maf_dua45",
  iftitah: "maf_aamal30",
  "dua-iftitah": "maf_aamal30",
  yastasheer: "maf_dua44",
  "dua-yastasheer": "maf_dua44",
  adilah: "maf_dua46",
  "dua-adilah": "maf_dua46",
  samata: "maf_dua41",
  simaat: "maf_dua41",
  "dua-simaat": "maf_dua41",
  yasin: "surah_yasin",
};

export function getCanonicalMafatihId(id: string): string {
  if (!id) return '';
  const clean = id.trim().toLowerCase();
  return MAFATIH_ALIASES[clean] || clean;
}

const itemCache = new Map<string, MafatihDetail>();
const pendingFetches = new Map<string, Promise<MafatihDetail | null>>();
let categoriesCache: MafatihCategory[] | null = null;
let indexCache: MafatihSummary[] | null = null;
let indexPromise: Promise<MafatihSummary[]> | null = null;

// Helper to safely load index from memory, static asset, or live API with promise deduplication
export async function getFullIndex(): Promise<MafatihSummary[]> {
  if (indexCache && indexCache.length > 0) return indexCache;
  if (indexPromise) return indexPromise;

  indexPromise = (async (): Promise<MafatihSummary[]> => {
    // 1. Try static JSON first (0ms, pre-bundled, offline ready)
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(getApiUrl('/mafatih_index.json'), { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          indexCache = data;
          return data;
        }
      }
    } catch {}

    // 2. Try live API fallback with timeout
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(getApiUrl('/api/mafatih/items?limit=1500'), { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          indexCache = data.items;
          return data.items;
        }
      }
    } catch {}

    return indexCache || [];
  })();

  try {
    return await indexPromise;
  } finally {
    indexPromise = null;
  }
}

export async function fetchMafatihCategories(): Promise<MafatihCategory[]> {
  if (categoriesCache && categoriesCache.length > 0) return categoriesCache;

  // Compute from full index for immediate 0ms response
  const index = await getFullIndex();
  if (index.length > 0) {
    const catMap = new Map<string, { name: string; code: string; count: number; audioCount: number }>();
    for (const item of index) {
      const catName = item.mainCategory || 'General';
      const catCode = item.mainCategoryCode || 'general';
      const cur = catMap.get(catName) || { name: catName, code: catCode, count: 0, audioCount: 0 };
      cur.count++;
      if (item.hasAudio) cur.audioCount++;
      catMap.set(catName, cur);
    }
    categoriesCache = Array.from(catMap.values());
    return categoriesCache;
  }

  try {
    const res = await fetch(getApiUrl('/api/mafatih/categories'));
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        categoriesCache = data;
        return data;
      }
    }
  } catch {}

  return [];
}

export function normalizeSearchText(str: string): string {
  if (!str) return "";
  // If string contains Arabic characters, perform full diacritic and letter normalization
  if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(str)) {
    return normalizeArabicForSearch(str);
  }

  // Latin transliteration normalization with Islamic keyword mappings
  const latin = normalizeLatinForSearch(str);
  return latin
    .replace(/hadith|hadees|hadis|hadeeth/g, "hadis")
    .replace(/kisaa?|kisa/g, "kisa")
    .replace(/ziyara[th]|ziyarat/g, "ziyarat")
    .replace(/kumayl|kumail/g, "kumail")
    .replace(/ahd|ahad/g, "ahad")
    .replace(/jawshan|joshan/g, "jawshan")
    .replace(/mujir|mujeer/g, "mujir")
    .replace(/iftitah|iftitaah/g, "iftitah")
    .replace(/mashlool|mashlul/g, "mashlool");
}

export async function fetchMafatihItems(params: {
  category?: string;
  search?: string;
  hasAudio?: boolean;
  limit?: number;
  offset?: number;
} = {}): Promise<{ total: number; items: MafatihSummary[] }> {
  // Ultra-fast in-memory filtering from pre-loaded index (0ms response)
  const index = await getFullIndex();
  if (index.length > 0) {
    let filtered = index;
    if (params.category && params.category !== 'all') {
      const catLower = params.category.toLowerCase().trim();
      if (catLower === "ziyaraat" || catLower === "ziyarat") {
        filtered = filtered.filter(
          (i) =>
            i.mainCategory?.toLowerCase().includes("ziyaraat") ||
            i.mainCategory?.toLowerCase().includes("ziyarat") ||
            i.categoryChain?.some((c) => c.toLowerCase().includes("ziyara"))
        );
      } else if (catLower === "duas" || catLower === "dua") {
        filtered = filtered.filter(
          (i) =>
            i.mainCategory?.toLowerCase().includes("dua") ||
            i.mainCategory?.toLowerCase().includes("supplication") ||
            i.categoryChain?.some((c) => c.toLowerCase().includes("dua"))
        );
      } else if (catLower === "namaz" || catLower === "prayers") {
        filtered = filtered.filter(
          (i) =>
            i.mainCategory?.toLowerCase().includes("namaz") ||
            i.mainCategory?.toLowerCase().includes("prayer")
        );
      } else {
        filtered = filtered.filter(i => 
          i.mainCategory?.toLowerCase() === catLower || 
          i.mainCategoryCode?.toLowerCase() === catLower ||
          i.categoryChain?.some(c => c.toLowerCase() === catLower)
        );
      }
    }

    if (params.search && params.search.trim().length > 0) {
      const rawQ = params.search.toLowerCase().trim();
      const normQ = normalizeSearchText(rawQ);
      const tokens = normQ.split(/\s+/).filter(Boolean);

      filtered = filtered.filter(i => {
        const rawTitle = (i.title || "").toLowerCase();
        const rawSnippet = (i.snippet || "").toLowerCase();
        const rawChain = (i.categoryChain || []).join(" ").toLowerCase();
        const normTitle = normalizeSearchText(i.title || "");
        const normSnippet = normalizeSearchText(i.snippet || "");
        const normChain = normalizeSearchText((i.categoryChain || []).join(" "));

        if (
          rawTitle.includes(rawQ) ||
          rawSnippet.includes(rawQ) ||
          rawChain.includes(rawQ) ||
          normTitle.includes(normQ) ||
          normSnippet.includes(normQ) ||
          normChain.includes(normQ)
        ) {
          return true;
        }

        if (tokens.length > 1) {
          return tokens.every(
            t =>
              normTitle.includes(t) ||
              normSnippet.includes(t) ||
              normChain.includes(t)
          );
        }

        return false;
      });
    }

    if (params.hasAudio) {
      filtered = filtered.filter(i => i.hasAudio);
    }

    const parsedLimit = Math.min(Math.max(params.limit || 50, 1), 500);
    const parsedOffset = Math.max(params.offset || 0, 0);
    const items = filtered.slice(parsedOffset, parsedOffset + parsedLimit);
    return {
      total: filtered.length,
      items
    };
  }

  // Live API Fallback if local index was not found
  const searchParams = new URLSearchParams();
  if (params.category && params.category !== 'all') searchParams.set('category', params.category);
  if (params.search) searchParams.set('search', params.search);
  if (params.hasAudio) searchParams.set('hasAudio', 'true');
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.offset) searchParams.set('offset', params.offset.toString());

  try {
    const res = await fetch(getApiUrl(`/api/mafatih/items?${searchParams.toString()}`));
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.items)) {
        return data;
      }
    }
  } catch {}

  return { total: 0, items: [] };
}

export function cleanVirtuesDisplay(intro: string): string {
  if (!intro || typeof intro !== 'string') return '';
  const lines = intro.split(/\r?\n/);
  const filteredLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (filteredLines.length > 0 && filteredLines[filteredLines.length - 1] !== '') {
        filteredLines.push('');
      }
      continue;
    }

    if (
      /^\s*METHOD:?\s*$/i.test(trimmed) ||
      /^\s*The form of (?:ziyarah|ziyarat|supplication|prayer).*is as follow:?\s*$/i.test(trimmed) ||
      /^(?:you may then|then|you should then|you should also)\s+repeat/i.test(trimmed) ||
      /^(?:you may then|then|you should then)\s+say the following/i.test(trimmed) ||
      /^(?:you may then|then|you should then)\s+prostrate/i.test(trimmed) ||
      /^(?:you may now|now)\s+(?:say|recite|prostrate)/i.test(trimmed) ||
      /one hundred times|100 times|70 times|seventy times/i.test(trimmed) ||
      /prostrate yourself and say/i.test(trimmed) ||
      /pat your (?:right )?thigh/i.test(trimmed) ||
      /^‘?Alqamah added: Imam al-Baqir/i.test(trimmed) ||
      /^Then go back to your place where you are standing/i.test(trimmed) ||
      /^\d+\.\s+(?:Recite|Say|Take|Remember|It is recommended to invoke Almighty Allah to lay curse)/i.test(trimmed)
    ) {
      continue;
    }

    filteredLines.push(trimmed);
  }

  return filteredLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function isInstructionText(str: string): boolean {
  if (!str) return false;
  const t = str.trim();
  if (/^\s*METHOD:?\s*$/i.test(t)) return true;
  if (/^\s*The form of (?:ziyarah|ziyarat|supplication|prayer).*is as follow:?\s*$/i.test(t)) return true;
  if (/^\s*Method of (?:reciting|offering|the)\b/i.test(t)) return true;
  if (/^\s*Method:?\s+/i.test(t)) return true;
  if (/^\s*Islamic Law No\.\s*\d+/i.test(t)) return true;
  if (/^(?:you may then|then|you should then|you should also)\s+repeat/i.test(t)) return true;
  if (/^(?:you may then|then|you should then)\s+say the following/i.test(t)) return true;
  if (/^(?:you may then|then|you should then)\s+prostrate/i.test(t)) return true;
  if (/^(?:you may now|now)\s+(?:say|recite|prostrate)/i.test(t)) return true;
  if (/prostrate yourself/i.test(t)) return true;
  if (/pat your (?:right )?thigh/i.test(t)) return true;
  if (/moving forward and backward/i.test(t)) return true;
  if (/take a few steps forward/i.test(t)) return true;
  if (/one hundred times|100 times|70 times|seventy times|1000 times|one thousand times/i.test(t) && /(?:repeat|say|recite|invoke|curse)/i.test(t)) return true;
  if (/^‘?Alqamah added: Imam al-Baqir/i.test(t)) return true;
  if (/^Then go back to your place where you are standing/i.test(t)) return true;
  if (/^(?:in the (?:first|second|third|fourth) unit|in each unit),?\s+after Surah/i.test(t)) return true;
  if (/^upon accomplishment,? (?:you may|one may) say/i.test(t)) return true;
  if (/^when you finish saying the tashahhud and taslim/i.test(t)) return true;
  if (/^after accomplishment of tasbih al-zahra/i.test(t)) return true;
  if (/^this prayer consists of (?:two|four) units/i.test(t)) return true;
  if (/^offer a (?:two|four)[-\s]unit prayer/i.test(t)) return true;
  if (/^when you wake up at night, it is recommended to prostrate/i.test(t)) return true;
  if (/^\d+\.\s+(?:Recite|Say|Take|Remember|It is recommended|A great reward)/i.test(t)) return true;
  return false;
}

export function normalizeMafatihDetail(detail: MafatihDetail): MafatihDetail {
  if (!detail) return detail;
  if (!Array.isArray(detail.verses)) {
    detail.verses = [];
  }

  // Always sanitize introduction to strip out liturgical instructions
  if (typeof detail.introduction === 'string' && detail.introduction.length > 0) {
    const rawIntro = detail.introduction;
    const paras = rawIntro.split(/\n\n+/);
    const cleanParas: string[] = [];
    const extractedRubrics: string[] = [];

    for (const p of paras) {
      const trimmed = p.trim();
      if (!trimmed) continue;
      if (isInstructionText(trimmed)) {
        extractedRubrics.push(trimmed);
      } else {
        cleanParas.push(trimmed);
      }
    }

    detail.introduction = cleanVirtuesDisplay(cleanParas.join('\n\n'));

    // If recitation had no verses (e.g. nam_ayat, nam_nawafil, maf_baqe109), populate with extracted rubrics
    if (detail.verses.length === 0 && extractedRubrics.length > 0) {
      detail.verses = extractedRubrics.map((rubric, idx) => ({
        index: idx + 1,
        arabic: '',
        translation: rubric
      }));
      detail.versesCount = detail.verses.length;
      return detail;
    }

    // Special handling for Ziyarat Ashura (maf_ziy86, ashura, ziyarat-ashura)
    const isAshura =
      detail.id === 'maf_ziy86' ||
      detail.id === 'ashura' ||
      detail.id === 'ziyarat-ashura' ||
      (detail.title && detail.title.toLowerCase().includes('ashura') && !detail.title.toLowerCase().includes('aamal'));

    if (isAshura && detail.verses.length > 4) {
      const hasMethod = detail.verses.some((v, idx) => idx < 10 && v.translation && /METHOD|The form of ziyarah of/i.test(v.translation));
      if (!hasMethod) {
        detail.verses.splice(4, 0, {
          index: 0,
          arabic: '',
          translation: "METHOD\n\nThe form of ziyarah of 'Ashura' is as follows:"
        });
      }
    }

    if (extractedRubrics.length > 0 && detail.verses.length > 0) {
      const verses = [...detail.verses];

      for (const rubric of extractedRubrics) {
        const snippet = rubric.substring(0, 30).toLowerCase();
        const alreadyInVerses = verses.some((v) => (v.translation || '').toLowerCase().includes(snippet));
        if (alreadyInVerses) continue;

        let inserted = false;
        if (/pat your (?:right )?thigh/i.test(rubric)) {
          const idx = verses.findIndex((v) => (v.arabic || '').includes('اَلْعَجَلَ') || (v.arabic || '').includes('العجل'));
          if (idx !== -1) {
            verses.splice(idx, 0, { index: 0, arabic: '', translation: rubric });
            inserted = true;
          }
        } else if (/prostrate yourself/i.test(rubric)) {
          const idx = verses.findIndex(
            (v) =>
              (v.arabic || '').includes('اَللّٰهُمَّ لَكَ الْحَمْدُ') ||
              (v.arabic || '').includes('اللهم لك الحمد') ||
              (v.arabic || '').includes('سُبْحَانَ رَبِّيَ') ||
              (v.arabic || '').includes('سجدت')
          );
          if (idx !== -1) {
            verses.splice(idx, 0, { index: 0, arabic: '', translation: rubric });
            inserted = true;
          }
        } else if (/moving forward and backward/i.test(rubric)) {
          const idx = verses.findIndex((v) => (v.arabic || '').includes('اِنَّا لِلّٰهِ وَ اِنَّا اِلَيْهِ رَاجِعُوْنَ'));
          if (idx !== -1) {
            verses.splice(idx, 0, { index: 0, arabic: '', translation: rubric });
            inserted = true;
          }
        } else if (/curse on the slayers.*one thousand times/i.test(rubric)) {
          const idx = verses.findIndex((v) => (v.arabic || '').includes('اَللّٰهُمَّ الْعَنْ قَتَلَةَ الْحُسَيْنِ'));
          if (idx !== -1) {
            verses.splice(idx, 0, { index: 0, arabic: '', translation: rubric });
            inserted = true;
          }
        } else if (/‘?Alqamah added/i.test(rubric)) {
          verses.push({ index: 0, arabic: '', translation: rubric });
          inserted = true;
        } else if (/consists of|two-unit|in each unit|when you wake up at night|offer a/i.test(rubric)) {
          verses.unshift({ index: 0, arabic: '', translation: rubric });
          inserted = true;
        }

        if (!inserted) {
          verses.unshift({ index: 0, arabic: '', translation: rubric });
        }
      }

      verses.forEach((v, idx) => {
        v.index = idx + 1;
      });
      detail.verses = verses;
      detail.versesCount = verses.length;
    }
  }

  return detail;
}

function sanitizeMafatihDetail(raw: any, fallbackId: string, metaFallback?: MafatihSummary | null): MafatihDetail {
  const verses: MafatihVerse[] = [];
  if (Array.isArray(raw.verses)) {
    raw.verses.forEach((v: any, idx: number) => {
      if (v) {
        verses.push({
          index: typeof v.index === 'number' ? v.index : idx + 1,
          arabic: typeof v.arabic === 'string' ? v.arabic : (v.text || ''),
          translation: typeof v.translation === 'string' ? v.translation : (v.en || '')
        });
      }
    });
  }

  const categoryChain = Array.isArray(raw.categoryChain) && raw.categoryChain.length > 0
    ? raw.categoryChain.filter((c: any) => typeof c === 'string')
    : (metaFallback?.categoryChain || [raw.mainCategory || 'Supplications']);

  let audioUrl = raw.audioUrl || metaFallback?.audioUrl || null;
  if (audioUrl) {
    audioUrl = String(audioUrl).trim();
    if (audioUrl.startsWith("http://www.ya-mahdi.net")) {
      audioUrl = audioUrl.replace("http://", "https://");
    } else if (audioUrl.startsWith("http://ya-mahdi.net")) {
      audioUrl = audioUrl.replace("http://", "https://");
    } else if (audioUrl.startsWith("http://www.sibtayn.com")) {
      audioUrl = audioUrl.replace("http://", "https://");
    } else if (audioUrl.startsWith("http://sibtayn.com")) {
      audioUrl = audioUrl.replace("http://", "https://");
    }
  }

  const baseDetail: MafatihDetail = {
    id: String(raw.id || fallbackId),
    code: String(raw.code || raw.id || fallbackId),
    title: String(raw.title || metaFallback?.title || fallbackId),
    mainCategory: String(raw.mainCategory || metaFallback?.mainCategory || 'General Recitations'),
    mainCategoryCode: String(raw.mainCategoryCode || metaFallback?.mainCategoryCode || 'general'),
    categoryChain,
    audioUrl,
    introduction: typeof raw.introduction === 'string' ? raw.introduction : (metaFallback?.snippet || ''),
    versesCount: verses.length,
    verses,
    sourceUrl: raw.sourceUrl || `https://www.ya-mahdi.net/view.php?cat=${encodeURIComponent(raw.id || fallbackId)}&lang=en`
  };

  return normalizeMafatihDetail(baseDetail);
}

export function parseClientMafatihHtml(html: string, id: string, metaFallback?: MafatihSummary | null): MafatihDetail | null {
  try {
    if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return null;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const titleEl = doc.querySelector('h2.section-title') || doc.querySelector('title');
    const title = titleEl ? (titleEl.textContent || '').replace('- Divine Pearls', '').trim() : (metaFallback?.title || id);

    let audioUrl = doc.querySelector('#audioPlayer')?.getAttribute('src') ||
      doc.querySelector('#audioPlayer source')?.getAttribute('src') ||
      doc.querySelector('audio source')?.getAttribute('src') ||
      doc.querySelector('audio')?.getAttribute('src') ||
      doc.querySelector('a[href*=".mp3"]')?.getAttribute('href') ||
      doc.querySelector('a[href*=".m4a"]')?.getAttribute('href') ||
      metaFallback?.audioUrl ||
      null;

    if (audioUrl && !audioUrl.startsWith('http')) {
      audioUrl = `https://www.ya-mahdi.net/${audioUrl.replace(/^\/+/, '')}`;
    }

    const duaCard = doc.querySelector('.dua-card');
    const verses: MafatihVerse[] = [];
    const contentLines: string[] = [];
    let pendingArabic = '';
    let pendingTranslation = '';
    let pendingRubric: string[] = [];
    let state: 'BEFORE_FIRST_ARABIC' | 'IN_VERSES' = 'BEFORE_FIRST_ARABIC';

    const flushRubric = () => {
      if (pendingRubric.length > 0) {
        const text = pendingRubric.join('\n\n').trim();
        if (text) {
          verses.push({
            index: verses.length + 1,
            arabic: '',
            translation: text,
          });
        }
        pendingRubric = [];
      }
    };

    const flushVerse = () => {
      if (pendingArabic) {
        verses.push({
          index: verses.length + 1,
          arabic: pendingArabic,
          translation: pendingTranslation,
        });
        pendingArabic = '';
        pendingTranslation = '';
      }
    };

    if (duaCard) {
      Array.from(duaCard.children).forEach((el) => {
        const cls = el.className || '';
        const text = (el.textContent || '').trim();
        if (!text) return;

        if (cls.includes('arabic-line')) {
          state = 'IN_VERSES';
          flushRubric();
          flushVerse();
          pendingArabic = text;
        } else if (cls.includes('translation-line')) {
          pendingTranslation = text;
          flushRubric();
          flushVerse();
        } else if (cls.includes('content-line')) {
          if (state === 'BEFORE_FIRST_ARABIC') {
            if (isInstructionText(text)) {
              flushVerse();
              pendingRubric.push(text);
            } else {
              contentLines.push(text);
            }
          } else {
            flushVerse();
            pendingRubric.push(text);
          }
        }
      });

      flushRubric();
      flushVerse();
    } else {
      Array.from(doc.querySelectorAll('p, div.line')).forEach((el) => {
        const text = (el.textContent || '').trim();
        if (text) contentLines.push(text);
      });
    }

    const detail: MafatihDetail = {
      id,
      code: metaFallback?.code || id,
      title,
      mainCategory: metaFallback?.mainCategory || 'General Recitations',
      mainCategoryCode: metaFallback?.mainCategoryCode || 'general',
      categoryChain: metaFallback?.categoryChain || [title],
      audioUrl,
      introduction: contentLines.join('\n\n'),
      versesCount: verses.length,
      verses,
      sourceUrl: `https://www.ya-mahdi.net/view.php?cat=${encodeURIComponent(id)}&lang=en`
    };

    return normalizeMafatihDetail(detail);
  } catch {
    return null;
  }
}

export async function fetchMafatihItem(id: string, callerSignal?: AbortSignal): Promise<MafatihDetail | null> {
  const cleanId = (id || '').trim();
  if (!cleanId) return null;

  if (callerSignal?.aborted) return null;

  const targetId = MAFATIH_ALIASES[cleanId.toLowerCase()] || cleanId;

  // 1. Check in-memory L1 cache (0ms instant - accept if valid verses or rich prose intro exist)
  const l1 = itemCache.get(targetId) || itemCache.get(cleanId) || itemCache.get(targetId.toLowerCase());
  if (l1 && ((l1.verses && l1.verses.length > 0) || (l1.introduction && l1.introduction.length > 25))) {
    return l1;
  }

  // 1b. Check IndexedDB persistent storage (0ms offline-first - accept if valid verses or intro exist)
  try {
    let cachedItem = await fastStorage.get<MafatihDetail>(`mafatih_detail_v3_${targetId.toLowerCase()}`);
    if (!cachedItem) {
      const v2Item = await fastStorage.get<MafatihDetail>(`mafatih_detail_v2_${targetId.toLowerCase()}`);
      if (v2Item && isValidMafatihDetail(v2Item)) {
        cachedItem = normalizeMafatihDetail(v2Item);
        fastStorage.set(`mafatih_detail_v3_${targetId.toLowerCase()}`, cachedItem).catch(() => {});
        fastStorage.del(`mafatih_detail_v2_${targetId.toLowerCase()}`).catch(() => {});
      }
    }
    if (cachedItem && isValidMafatihDetail(cachedItem)) {
      const normalizedCached = normalizeMafatihDetail(cachedItem);
      itemCache.set(targetId, normalizedCached);
      itemCache.set(cleanId, normalizedCached);
      itemCache.set(targetId.toLowerCase(), normalizedCached);
      if (normalizedCached.code) itemCache.set(normalizedCached.code, normalizedCached);
      return normalizedCached;
    } else if (cachedItem) {
      await fastStorage.del(`mafatih_detail_v3_${targetId.toLowerCase()}`);
      await fastStorage.del(`mafatih_detail_v2_${targetId.toLowerCase()}`);
      notifyIntegrityRecovery({
        subsystem: 'mafatih',
        identifier: targetId,
        reason: 'Corrupted mafatih item cache evicted',
        recoveredFromBundle: true,
        timestamp: Date.now()
      });
    }
  } catch {}

  // 2. Return pending in-flight promise to prevent duplicate concurrent network calls
  const pendingKey = targetId.toLowerCase();
  let fetchPromise = pendingFetches.get(pendingKey);

  if (!fetchPromise) {
    fetchPromise = (async (): Promise<MafatihDetail | null> => {
      // Pre-retrieve summary metadata from index for safe synthesis and verification
      const index = await getFullIndex();
      const meta = index.find(i => 
        i.id.toLowerCase() === targetId.toLowerCase() || 
        (i.code && i.code.toLowerCase() === targetId.toLowerCase()) || 
        i.id.toLowerCase() === cleanId.toLowerCase() || 
        (i.code && i.code.toLowerCase() === cleanId.toLowerCase())
      ) || null;

      // Attempt 1: Instant static bundled asset read (0-5ms in both Web & APK) with timeout
      const targetLower = targetId.toLowerCase();
      const cleanLower = cleanId.toLowerCase();
      const metaCode = meta?.code?.toLowerCase() || '';

      const staticCandidateSet = new Set<string>();
      [targetLower, cleanLower, metaCode, targetId, cleanId].filter(Boolean).forEach((code) => {
        const enc = encodeURIComponent(code);
        staticCandidateSet.add(`/mafatih_items/${enc}.json`);
        staticCandidateSet.add(getApiUrl(`/mafatih_items/${enc}.json`));
        if (typeof window !== 'undefined') {
          try {
            staticCandidateSet.add(new URL(`mafatih_items/${enc}.json`, window.location.href).href);
          } catch {}
        }
      });

      for (const url of Array.from(staticCandidateSet)) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 6000);
          const res = await fetch(url, { signal: callerSignal || controller.signal });
          clearTimeout(timer);
          if (res.ok) {
            const raw = await res.json();
            if (raw && ((raw.verses && raw.verses.length > 0) || raw.introduction || raw.title)) {
              const detail = sanitizeMafatihDetail(raw, targetId, meta);
              if (isValidMafatihDetail(detail)) {
                itemCache.set(targetId, detail);
                itemCache.set(cleanId, detail);
                itemCache.set(targetId.toLowerCase(), detail);
                if (detail.code) itemCache.set(detail.code, detail);
                fastStorage.set(`mafatih_detail_v3_${targetId.toLowerCase()}`, detail).catch(() => {});
                return detail;
              }
            }
          }
        } catch {}
      }

      // Attempt 2: Backend API fallback (generous 15s timeout for dynamic live scraping)
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const res = await fetch(getApiUrl(`/api/mafatih/items/${encodeURIComponent(targetId)}`), {
          signal: callerSignal || controller.signal
        });
        clearTimeout(timeout);
        if (res.ok) {
          const raw = await res.json();
          if (raw && ((raw.verses && raw.verses.length > 0) || raw.introduction || raw.title)) {
            const detail = sanitizeMafatihDetail(raw, targetId, meta);
            itemCache.set(targetId, detail);
            itemCache.set(cleanId, detail);
            itemCache.set(targetId.toLowerCase(), detail);
            if (detail.code) itemCache.set(detail.code, detail);
            fastStorage.set(`mafatih_detail_v3_${targetId.toLowerCase()}`, detail).catch(() => {});
            return detail;
          }
        }
      } catch {}

      // Attempt 2b: Direct live external fetch with client-side DOM parsing (runs on mobile via CapacitorHttp or Web CORS)
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 9000);
        const yaMahdiUrl = `https://www.ya-mahdi.net/view.php?cat=${encodeURIComponent(targetId)}&lang=en`;
        const res = await fetch(yaMahdiUrl, { signal: callerSignal || controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
          const html = await res.text();
          const parsed = parseClientMafatihHtml(html, targetId, meta);
          if (parsed && ((parsed.verses && parsed.verses.length > 0) || (parsed.introduction && parsed.introduction.length > 30))) {
            const detail = sanitizeMafatihDetail(parsed, targetId, meta);
            itemCache.set(targetId, detail);
            itemCache.set(cleanId, detail);
            itemCache.set(targetId.toLowerCase(), detail);
            if (detail.code) itemCache.set(detail.code, detail);
            fastStorage.set(`mafatih_detail_v3_${targetId.toLowerCase()}`, detail).catch(() => {});
            return detail;
          }
        }
      } catch {}

      // Attempt 3: Graceful fallback synthesis from index metadata so user is NEVER stuck with an error screen
      if (meta) {
        const fallbackDetail: MafatihDetail = {
          id: meta.id,
          code: meta.code || targetId,
          title: meta.title,
          mainCategory: meta.mainCategory || 'General Recitations',
          mainCategoryCode: meta.mainCategoryCode || 'general',
          categoryChain: meta.categoryChain && meta.categoryChain.length > 0 ? meta.categoryChain : [meta.title],
          audioUrl: meta.audioUrl,
          introduction: meta.snippet || 'Supplication content from Mafatih Al Jinan.',
          versesCount: 0,
          verses: [],
          sourceUrl: `https://www.ya-mahdi.net/view.php?cat=${encodeURIComponent(meta.id)}&lang=en`
        };
        // Return without poisoning memory cache so future calls can retry
        return fallbackDetail;
      }

      // Attempt 4: Ultimate emergency fallback from cleanId
      const humanTitle = cleanId
        .replace(/^(maf_|sah_|h_)/, '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

      const emergencyDetail: MafatihDetail = {
        id: cleanId,
        code: targetId,
        title: humanTitle,
        mainCategory: 'General Recitations',
        mainCategoryCode: 'general',
        categoryChain: ['Mafatih Al Jinan', humanTitle],
        audioUrl: null,
        introduction: 'Supplication recitation from Mafatih Al Jinan.',
        versesCount: 0,
        verses: [],
        sourceUrl: `https://www.ya-mahdi.net/view.php?cat=${encodeURIComponent(targetId)}&lang=en`
      };
      itemCache.set(targetId, emergencyDetail);
      itemCache.set(cleanId, emergencyDetail);
      itemCache.set(targetId.toLowerCase(), emergencyDetail);
      return emergencyDetail;
    })();

    pendingFetches.set(pendingKey, fetchPromise);
  }

  try {
    const result = await fetchPromise;
    if (callerSignal?.aborted) return null;
    return result;
  } catch (err) {
    pendingFetches.delete(pendingKey);
    if (callerSignal?.aborted) return null;
    return null;
  } finally {
    pendingFetches.delete(pendingKey);
  }
}

// Idle background prefetch for popular or linked supplications
export function prefetchMafatihItem(id: string) {
  const cleanId = (id || '').trim();
  const targetId = MAFATIH_ALIASES[cleanId.toLowerCase()] || cleanId;
  if (itemCache.has(targetId) || pendingFetches.has(targetId)) return;

  const preloader = () => {
    fetchMafatihItem(targetId).catch(() => {});
  };

  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(preloader, { timeout: 3500 });
  } else {
    setTimeout(preloader, 1500);
  }
}
