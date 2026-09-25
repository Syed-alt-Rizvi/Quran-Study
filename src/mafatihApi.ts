import { getApiUrl } from './utils/apiBase';

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

const itemCache = new Map<string, MafatihDetail>();
let categoriesCache: MafatihCategory[] | null = null;
let indexCache: MafatihSummary[] | null = null;

// Helper to safely load index from memory, live API, or static asset
async function getFullIndex(): Promise<MafatihSummary[]> {
  if (indexCache && indexCache.length > 0) return indexCache;

  // Try live API first
  try {
    const res = await fetch(getApiUrl('/api/mafatih/items?limit=1500'));
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        indexCache = data.items;
        return indexCache;
      }
    }
  } catch {
    // Continue to static fallback
  }

  // Try static JSON backup
  try {
    const res = await fetch('/mafatih_index.json');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        indexCache = data;
        return indexCache;
      }
    }
  } catch {
    // In-memory fallback
  }

  return indexCache || [];
}

export async function fetchMafatihCategories(): Promise<MafatihCategory[]> {
  if (categoriesCache && categoriesCache.length > 0) return categoriesCache;

  try {
    const res = await fetch(getApiUrl('/api/mafatih/categories'));
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        categoriesCache = data;
        return data;
      }
    }
  } catch {
    // Will compute from index
  }

  // Fallback: dynamically compute from index
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

  return [];
}

function normalizeSearchText(str: string): string {
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
  const searchParams = new URLSearchParams();
  if (params.category && params.category !== 'all') searchParams.set('category', params.category);
  if (params.search) searchParams.set('search', params.search);
  if (params.hasAudio) searchParams.set('hasAudio', 'true');
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.offset) searchParams.set('offset', params.offset.toString());

  // Attempt 1: Try backend API with automatic retry
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(getApiUrl(`/api/mafatih/items?${searchParams.toString()}`));
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.items)) {
          return data;
        }
      }
    } catch {
      if (attempt === 0) {
        await new Promise(r => setTimeout(r, 350));
      }
    }
  }

  // Attempt 2: Fallback to local index filtering
  try {
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
  } catch (err) {
    console.warn('Local index fallback notice:', err);
  }

  return { total: 0, items: [] };
}

export async function fetchMafatihItem(id: string): Promise<MafatihDetail | null> {
  if (itemCache.has(id)) {
    return itemCache.get(id)!;
  }
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(getApiUrl(`/api/mafatih/items/${encodeURIComponent(id)}`));
      if (res.ok) {
        const data: MafatihDetail = await res.json();
        itemCache.set(id, data);
        if (data.code && !itemCache.has(data.code)) {
          itemCache.set(data.code, data);
        }
        return data;
      }
    } catch {
      if (attempt === 0) {
        await new Promise(r => setTimeout(r, 400));
      }
    }
  }

  // Fallback: direct static item JSON file if available
  try {
    const res = await fetch(`/mafatih_items/${encodeURIComponent(id)}.json`);
    if (res.ok) {
      const data: MafatihDetail = await res.json();
      itemCache.set(id, data);
      return data;
    }
  } catch {}

  return null;
}
