import { getApiUrl } from './utils/apiBase';
import { fastStorage } from './utils/fastStorage';

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
  tawassul: "maf_dua51",
  ashura: "maf_ziy86",
  nudba: "maf_ziy126a",
  nudbah: "maf_ziy126a",
  faraj: "maf_dua46b",
  kisa: "h_kisa",
  ahad: "maf_ziy128",
  waritha: "maf_ziy73a",
  wareeth: "maf_ziy73a",
  mashlool: "maf_dua43",
  sabah: "maf_dua39",
  jawshan: "maf_dua47",
  joshan: "maf_dua47",
  mujir: "maf_dua45",
  mujeer: "maf_dua45",
  iftitah: "maf_aamal30",
  yastasheer: "maf_dua44",
  adilah: "maf_dua46",
  samata: "maf_dua41",
  simaat: "maf_dua41",
  yasin: "surah_yasin",
};

const itemCache = new Map<string, MafatihDetail>();
const pendingFetches = new Map<string, Promise<MafatihDetail | null>>();
let categoriesCache: MafatihCategory[] | null = null;
let indexCache: MafatihSummary[] | null = null;
let indexPromise: Promise<MafatihSummary[]> | null = null;

// Helper to safely load index from memory, static asset, or live API with promise deduplication
export async function getFullIndex(): Promise<MafatihSummary[]> {
  if (indexCache && indexCache.length > 0) return indexCache;
  if (indexPromise) return indexPromise;

  indexPromise = (async () => {
    // 1. Try static JSON first (0ms, pre-bundled, offline ready)
    try {
      const res = await fetch(getApiUrl('/mafatih_index.json'));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          indexCache = data;
          return indexCache;
        }
      }
    } catch {}

    // 2. Try live API fallback
    try {
      const res = await fetch(getApiUrl('/api/mafatih/items?limit=1500'));
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          indexCache = data.items;
          return indexCache;
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
  return str
    .toLowerCase()
    .replace(/[’'`\-_]/g, "")
    .replace(/hadith|hadees|hadis|hadeeth/g, "hadis")
    .replace(/kisaa?|kisa/g, "kisa")
    .replace(/ziyara[th]|ziyarat/g, "ziyarat")
    .replace(/kumayl|kumail/g, "kumail")
    .replace(/ay/g, "ai")
    .replace(/ee/g, "i")
    .replace(/oo/g, "u")
    .replace(/ou/g, "u")
    .replace(/th/g, "s")
    .replace(/dh/g, "z")
    .replace(/ah\b/g, "at")
    .replace(/aa/g, "a");
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

  return {
    id: String(raw.id || fallbackId),
    code: String(raw.code || raw.id || fallbackId),
    title: String(raw.title || metaFallback?.title || fallbackId),
    mainCategory: String(raw.mainCategory || metaFallback?.mainCategory || 'General Recitations'),
    mainCategoryCode: String(raw.mainCategoryCode || metaFallback?.mainCategoryCode || 'general'),
    categoryChain,
    audioUrl: raw.audioUrl || metaFallback?.audioUrl || null,
    introduction: typeof raw.introduction === 'string' ? raw.introduction : (metaFallback?.snippet || ''),
    versesCount: verses.length,
    verses,
    sourceUrl: raw.sourceUrl || `https://www.ya-mahdi.net/view.php?cat=${encodeURIComponent(raw.id || fallbackId)}&lang=en`
  };
}

export async function fetchMafatihItem(id: string, callerSignal?: AbortSignal): Promise<MafatihDetail | null> {
  const cleanId = (id || '').trim();
  if (!cleanId) return null;

  if (callerSignal?.aborted) return null;

  const targetId = MAFATIH_ALIASES[cleanId.toLowerCase()] || cleanId;

  // 1. Check in-memory L1 cache (0ms instant)
  if (itemCache.has(targetId)) return itemCache.get(targetId)!;
  if (itemCache.has(cleanId)) return itemCache.get(cleanId)!;
  if (itemCache.has(targetId.toLowerCase())) return itemCache.get(targetId.toLowerCase())!;

  // 1b. Check IndexedDB persistent storage (0ms offline-first)
  try {
    const cachedItem = await fastStorage.get<MafatihDetail>(`mafatih_detail_${targetId.toLowerCase()}`);
    if (cachedItem && ((cachedItem.verses && cachedItem.verses.length > 0) || cachedItem.introduction)) {
      itemCache.set(targetId, cachedItem);
      itemCache.set(cleanId, cachedItem);
      itemCache.set(targetId.toLowerCase(), cachedItem);
      if (cachedItem.code) itemCache.set(cachedItem.code, cachedItem);
      return cachedItem;
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

      // Attempt 1: Instant static bundled asset read (0-5ms in both Web & APK)
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
          const res = await fetch(url, { signal: callerSignal });
          if (res.ok) {
            const raw = await res.json();
            if (raw && ((raw.verses && raw.verses.length > 0) || raw.introduction || raw.title)) {
              const detail = sanitizeMafatihDetail(raw, targetId, meta);
              itemCache.set(targetId, detail);
              itemCache.set(cleanId, detail);
              itemCache.set(targetId.toLowerCase(), detail);
              if (detail.code) itemCache.set(detail.code, detail);
              fastStorage.set(`mafatih_detail_${targetId.toLowerCase()}`, detail).catch(() => {});
              return detail;
            }
          }
        } catch {}
      }

      // Attempt 2: Backend API fallback (quick 3.5s timeout if running with backend)
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
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
            fastStorage.set(`mafatih_detail_${targetId.toLowerCase()}`, detail).catch(() => {});
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
        itemCache.set(targetId, fallbackDetail);
        itemCache.set(cleanId, fallbackDetail);
        itemCache.set(targetId.toLowerCase(), fallbackDetail);
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
