import fs from "fs";
import path from "path";
import os from "os";
import * as cheerio from "cheerio";

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

const ROOT_URL = "https://www.ya-mahdi.net/";
const CACHE_DIR = path.join(os.tmpdir(), "shia_markaz_cache", "mafatih_items");
const PUBLIC_ITEMS_DIR = path.join(process.cwd(), "public", "mafatih_items");
const DB_DIR = path.join(process.cwd(), "src", "db");

if (!fs.existsSync(CACHE_DIR)) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  } catch (e) {
    console.error("Failed to create CACHE_DIR:", e);
  }
}

// Memory caches
let mafatihIndexCache: MafatihSummary[] | null = null;
const mafatihItemCache = new Map<string, MafatihDetail>();

const ALIASES: Record<string, string> = {
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
  mashlool: "maf_dua43",
  sabah: "maf_dua39",
  jawshan: "maf_dua47",
  joshan: "maf_dua47",
  mujir: "maf_dua44",
  mujeer: "maf_dua44",
  iftitah: "maf_dua45",
  samata: "maf_dua41",
  simaat: "maf_dua41",
  yasin: "surah_yasin",
};

/**
 * Load the index dataset of all 1,307 supplications
 */
export function loadMafatihIndex(): MafatihSummary[] {
  if (mafatihIndexCache && mafatihIndexCache.length > 0) {
    return mafatihIndexCache;
  }

  const candidatePaths = [
    path.join(process.cwd(), "public", "mafatih_index.json"),
    path.join(process.cwd(), "src", "db", "mafatih_index.json"),
    path.join(process.cwd(), "dist", "mafatih_index.json"),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, "utf8");
        mafatihIndexCache = JSON.parse(raw);
        if (mafatihIndexCache && mafatihIndexCache.length > 0) {
          return mafatihIndexCache;
        }
      } catch (e) {
        console.error(`Error parsing mafatih index from ${p}:`, e);
      }
    }
  }

  mafatihIndexCache = [];
  return mafatihIndexCache;
}

/**
 * Categories with counts
 */
export function getMafatihCategories() {
  const index = loadMafatihIndex();
  const catMap = new Map<string, { name: string; code: string; count: number; audioCount: number }>();

  for (const item of index) {
    const catName = item.mainCategory || "General";
    const catCode = item.mainCategoryCode || "general";
    const cur = catMap.get(catName) || { name: catName, code: catCode, count: 0, audioCount: 0 };
    cur.count++;
    if (item.hasAudio) cur.audioCount++;
    catMap.set(catName, cur);
  }

  return Array.from(catMap.values());
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

/**
 * Filtered & paginated items
 */
export function getMafatihItemsList(params: {
  category?: string;
  search?: string;
  hasAudio?: boolean;
  limit?: number;
  offset?: number;
}) {
  const index = loadMafatihIndex();
  let filtered = index;

  if (params.category && params.category !== "all") {
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
      filtered = filtered.filter(
        (i) =>
          i.mainCategory?.toLowerCase() === catLower ||
          i.mainCategoryCode?.toLowerCase() === catLower ||
          i.categoryChain?.some((c) => c.toLowerCase() === catLower)
      );
    }
  }

  if (params.search && params.search.trim().length > 0) {
    const rawQ = params.search.toLowerCase().trim();
    const normQ = normalizeSearchText(rawQ);
    const tokens = normQ.split(/\s+/).filter(Boolean);

    filtered = filtered.filter((i) => {
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
          (t) =>
            normTitle.includes(t) ||
            normSnippet.includes(t) ||
            normChain.includes(t)
        );
      }

      return false;
    });
  }

  if (params.hasAudio) {
    filtered = filtered.filter((i) => i.hasAudio);
  }

  const parsedLimit = Math.min(Math.max(params.limit || 50, 1), 500);
  const parsedOffset = Math.max(params.offset || 0, 0);

  const items = filtered.slice(parsedOffset, parsedOffset + parsedLimit);
  return {
    total: filtered.length,
    offset: parsedOffset,
    limit: parsedLimit,
    items,
  };
}

/**
 * Parse ya-mahdi.net view HTML into a structured MafatihDetail object
 */
export function parseMafatihHtml(html: string, id: string, metaFallback?: MafatihSummary | null): MafatihDetail {
  const $ = cheerio.load(html);

  // 1. Audio URL
  let audioUrl =
    $("#audioPlayer").attr("src") ||
    $("audio source").attr("src") ||
    $('audio').attr('src') ||
    $('a[href$=".mp3"]').attr('href') ||
    $('a[href$=".m4a"]').attr('href') ||
    metaFallback?.audioUrl ||
    null;

  if (audioUrl && !audioUrl.startsWith("http")) {
    audioUrl = `${ROOT_URL}${audioUrl.replace(/^\/+/, "")}`;
  }

  // 2. Title
  let title =
    $("h2.section-title").text().trim() ||
    $("title").text().replace("- Divine Pearls", "").trim() ||
    metaFallback?.title ||
    id;

  // 3. Verses & Intro extraction from .dua-card or generic body
  const contentLines: string[] = [];
  const verses: MafatihVerse[] = [];
  let pendingArabic = "";

  const duaCard = $(".dua-card");
  if (duaCard.length > 0) {
    duaCard.children().each((_, el) => {
      const $el = $(el);
      const cls = $el.attr("class") || "";
      const text = $el.text().trim();
      if (!text) return;

      if (cls.includes("content-line")) {
        contentLines.push(text);
      } else if (cls.includes("arabic-line")) {
        if (pendingArabic) {
          verses.push({
            index: verses.length + 1,
            arabic: pendingArabic,
            translation: "",
          });
        }
        pendingArabic = text;
      } else if (cls.includes("translation-line")) {
        verses.push({
          index: verses.length + 1,
          arabic: pendingArabic,
          translation: text,
        });
        pendingArabic = "";
      }
    });

    if (pendingArabic) {
      verses.push({
        index: verses.length + 1,
        arabic: pendingArabic,
        translation: "",
      });
    }
  } else {
    // Fallback: extract from general paragraphs/lines
    $("p, div.line").each((_, el) => {
      const text = $(el).text().trim();
      if (text) {
        contentLines.push(text);
      }
    });
  }

  return {
    id,
    code: metaFallback?.code || id,
    title,
    mainCategory: metaFallback?.mainCategory || "General Recitations",
    mainCategoryCode: metaFallback?.mainCategoryCode || "general",
    categoryChain: metaFallback?.categoryChain || [title],
    audioUrl,
    introduction: contentLines.join("\n\n"),
    versesCount: verses.length,
    verses,
    sourceUrl: `${ROOT_URL}view.php?cat=${encodeURIComponent(id)}&lang=en`,
  };
}

/**
 * Get or fetch on demand a single full Mafatih item
 */
export async function getOrFetchMafatihItem(id: string): Promise<MafatihDetail | null> {
  const resolvedId = ALIASES[id.toLowerCase()] || id;

  // 1. Check in-memory cache
  if (mafatihItemCache.has(resolvedId)) {
    return mafatihItemCache.get(resolvedId)!;
  }

  // 2. Check individual JSON disk cache: .cache first, then public fallback
  const cachePath = path.join(CACHE_DIR, `${resolvedId}.json`);
  const publicPath = path.join(PUBLIC_ITEMS_DIR, `${resolvedId}.json`);
  const itemDiskPath = fs.existsSync(cachePath) ? cachePath : (fs.existsSync(publicPath) ? publicPath : null);

  if (itemDiskPath) {
    try {
      const raw = fs.readFileSync(itemDiskPath, "utf8");
      const parsed: MafatihDetail = JSON.parse(raw);
      if (parsed && (parsed.verses?.length > 0 || parsed.introduction)) {
        mafatihItemCache.set(resolvedId, parsed);
        return parsed;
      }
    } catch (e) {
      console.warn(`Corrupted cache for ${resolvedId}, will re-fetch:`, e);
    }
  }

  // 3. Find metadata from index
  const index = loadMafatihIndex();
  const metaFallback = index.find((i) => i.id === resolvedId || i.code === resolvedId) || null;

  // 4. On-demand dynamic scrape from ya-mahdi.net
  const fetchUrl = `${ROOT_URL}view.php?cat=${encodeURIComponent(resolvedId)}&lang=en`;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(fetchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ShiaQuranApp/1.0",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const html = await res.text();
      const detail = parseMafatihHtml(html, resolvedId, metaFallback);

      // Save to disk cache (.cache/mafatih_items)
      try {
        if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
        fs.writeFileSync(cachePath, JSON.stringify(detail, null, 2), "utf8");
      } catch (err) {
        console.error(`Failed to write disk cache for ${resolvedId}:`, err);
      }

      // Save to in-memory cache
      mafatihItemCache.set(resolvedId, detail);
      if (detail.code && !mafatihItemCache.has(detail.code)) {
        mafatihItemCache.set(detail.code, detail);
      }

      return detail;
    } catch (err: any) {
      console.warn(`Attempt ${attempt} to fetch ${resolvedId} failed:`, err.message);
      if (attempt === 2) {
        break;
      }
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  // 5. If network fails but we have summary in index, return a graceful minimal detail
  if (metaFallback) {
    return {
      id: metaFallback.id,
      code: metaFallback.code,
      title: metaFallback.title,
      mainCategory: metaFallback.mainCategory,
      mainCategoryCode: metaFallback.mainCategoryCode,
      categoryChain: metaFallback.categoryChain,
      audioUrl: metaFallback.audioUrl,
      introduction: metaFallback.snippet,
      versesCount: 0,
      verses: [],
      sourceUrl: fetchUrl,
    };
  }

  return null;
}

// Background scraper status tracker
let isScrapingInProgress = false;
let scrapedCount = 0;
let totalScrapeTargets = 0;

export function getScrapeStatus() {
  const cacheCount = fs.existsSync(CACHE_DIR) ? fs.readdirSync(CACHE_DIR).filter((f) => f.endsWith(".json")).length : 0;
  const publicCount = fs.existsSync(PUBLIC_ITEMS_DIR) ? fs.readdirSync(PUBLIC_ITEMS_DIR).filter((f) => f.endsWith(".json")).length : 0;
  return {
    inProgress: isScrapingInProgress,
    scrapedCount,
    totalScrapeTargets,
    cachedOnDisk: Math.max(cacheCount, publicCount),
  };
}

/**
 * Non-blocking background batch scraper
 */
export async function startBackgroundScraper() {
  if (isScrapingInProgress) return;
  isScrapingInProgress = true;

  const index = loadMafatihIndex();
  totalScrapeTargets = index.length;

  // Run in background without blocking caller
  (async () => {
    try {
      console.log(`[MafatihService] Starting background cache population for ${index.length} items...`);

      // 1. Prioritize core popular supplications & ziyaraat first
      const PRIORITY_IDS = [
        "maf_dua40", // Dua Kumayl
        "maf_ziy86", // Ziyarat Ashura
        "maf_dua51", // Dua Tawassul
        "h_kisa",    // Hadees e Kisa
        "maf_ziy126a", // Dua Nudbah
        "maf_dua46b", // Dua Faraj
        "maf_ziy128", // Dua Ahad
        "maf_ziy73a", // Ziyarat Waritha
        "maf_dua39", // Dua Sabah
        "maf_dua43", // Dua Mashlool
        "maf_dua44", // Dua Mujeer
        "maf_dua45", // Dua Iftitah
        "maf_dua47", // Jawshan Kabeer
        "maf_dua4",  // Taqibat Maghrib
        "maf_dua1",  // General Taqibat
        "maf_dua5",  // Taqibat Isha
      ];

      // Sort index so priority IDs and small/popular categories come first
      const sortedItems = [...index].sort((a, b) => {
        const aPri = PRIORITY_IDS.includes(a.id) ? -100 : 0;
        const bPri = PRIORITY_IDS.includes(b.id) ? -100 : 0;
        return aPri - bPri;
      });

      const concurrency = 6;
      let currentIndex = 0;

      async function worker() {
        while (currentIndex < sortedItems.length) {
          const item = sortedItems[currentIndex++];
          if (!item) continue;

          const itemCachePath = path.join(CACHE_DIR, `${item.id}.json`);
          const itemPublicPath = path.join(PUBLIC_ITEMS_DIR, `${item.id}.json`);
          if (fs.existsSync(itemCachePath) || fs.existsSync(itemPublicPath)) {
            scrapedCount++;
            continue;
          }

          try {
            await getOrFetchMafatihItem(item.id);
            scrapedCount++;
            if (scrapedCount % 50 === 0 || scrapedCount === sortedItems.length) {
              console.log(`[MafatihService] Cached ${scrapedCount}/${sortedItems.length} items...`);
            }
          } catch (e: any) {
            // Keep going gracefully
          }

          // Polite throttle
          await new Promise((r) => setTimeout(r, 120));
        }
      }

      await Promise.all(Array.from({ length: concurrency }, () => worker()));
      console.log(`[MafatihService] Background scraping complete! Total items cached on disk: ${scrapedCount}`);

      console.log(`[MafatihService] Cached items verified.`);
    } catch (err: any) {
      console.error("[MafatihService] Background scrape error:", err);
    } finally {
      isScrapingInProgress = false;
    }
  })();
}
