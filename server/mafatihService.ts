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
  "dua-kumayl": "maf_dua40",
  "dua_kumayl": "maf_dua40",
  tawassul: "maf_dua51",
  "dua-tawassul": "maf_dua51",
  ashura: "maf_ziy86",
  "ziyarat-ashura": "maf_ziy86",
  nudba: "maf_ziy126a",
  nudbah: "maf_ziy126a",
  faraj: "maf_dua46b",
  "dua-faraj": "maf_dua46b",
  kisa: "h_kisa",
  "h-kisa": "h_kisa",
  "hadith-kisa": "h_kisa",
  ahad: "maf_ziy128",
  "dua-al-ahd": "maf_ziy128",
  "dua-ahd": "maf_ziy128",
  waritha: "maf_ziy73a",
  "ziyarat-waritha": "maf_ziy73a",
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

function cleanVirtuesDisplay(intro: string): string {
  if (!intro || typeof intro !== "string") return "";
  const lines = intro.split(/\r?\n/);
  const filteredLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (filteredLines.length > 0 && filteredLines[filteredLines.length - 1] !== "") {
        filteredLines.push("");
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

  return filteredLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function isInstructionText(str: string): boolean {
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

function normalizeServerMafatihDetail(detail: MafatihDetail): MafatihDetail {
  if (!detail) return detail;
  if (!Array.isArray(detail.verses)) {
    detail.verses = [];
  }

  if (typeof detail.introduction === "string" && detail.introduction.length > 0) {
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

    detail.introduction = cleanVirtuesDisplay(cleanParas.join("\n\n"));

    if (detail.verses.length === 0 && extractedRubrics.length > 0) {
      detail.verses = extractedRubrics.map((rubric, idx) => ({
        index: idx + 1,
        arabic: "",
        translation: rubric,
      }));
      detail.versesCount = detail.verses.length;
      return detail;
    }

    const isAshura =
      detail.id === "maf_ziy86" ||
      detail.id === "ashura" ||
      detail.id === "ziyarat-ashura" ||
      (detail.title && detail.title.toLowerCase().includes("ashura") && !detail.title.toLowerCase().includes("aamal"));

    if (isAshura && detail.verses.length > 4) {
      const hasMethod = detail.verses.some((v, idx) => idx < 10 && v.translation && /METHOD|The form of ziyarah of/i.test(v.translation));
      if (!hasMethod) {
        detail.verses.splice(4, 0, {
          index: 0,
          arabic: "",
          translation: "METHOD\n\nThe form of ziyarah of 'Ashura' is as follows:",
        });
      }
    }

    if (extractedRubrics.length > 0 && detail.verses.length > 0) {
      const verses = [...detail.verses];

      for (const rubric of extractedRubrics) {
        const snippet = rubric.substring(0, 30).toLowerCase();
        const alreadyInVerses = verses.some((v) => (v.translation || "").toLowerCase().includes(snippet));
        if (alreadyInVerses) continue;

        let inserted = false;
        if (/pat your (?:right )?thigh/i.test(rubric)) {
          const idx = verses.findIndex((v) => (v.arabic || "").includes("اَلْعَجَلَ") || (v.arabic || "").includes("العجل"));
          if (idx !== -1) {
            verses.splice(idx, 0, { index: 0, arabic: "", translation: rubric });
            inserted = true;
          }
        } else if (/prostrate yourself/i.test(rubric)) {
          const idx = verses.findIndex(
            (v) =>
              (v.arabic || "").includes("اَللّٰهُمَّ لَكَ الْحَمْدُ") ||
              (v.arabic || "").includes("اللهم لك الحمد") ||
              (v.arabic || "").includes("سُبْحَانَ رَبِّيَ") ||
              (v.arabic || "").includes("سجدت")
          );
          if (idx !== -1) {
            verses.splice(idx, 0, { index: 0, arabic: "", translation: rubric });
            inserted = true;
          }
        } else if (/moving forward and backward/i.test(rubric)) {
          const idx = verses.findIndex((v) => (v.arabic || "").includes("اِنَّا لِلّٰهِ وَ اِنَّا اِلَيْهِ رَاجِعُوْنَ"));
          if (idx !== -1) {
            verses.splice(idx, 0, { index: 0, arabic: "", translation: rubric });
            inserted = true;
          }
        } else if (/curse on the slayers.*one thousand times/i.test(rubric)) {
          const idx = verses.findIndex((v) => (v.arabic || "").includes("اَللّٰهُمَّ الْعَنْ قَتَلَةَ الْحُسَيْنِ"));
          if (idx !== -1) {
            verses.splice(idx, 0, { index: 0, arabic: "", translation: rubric });
            inserted = true;
          }
        } else if (/‘?Alqamah added/i.test(rubric)) {
          verses.push({ index: 0, arabic: "", translation: rubric });
          inserted = true;
        } else if (/consists of|two-unit|in each unit|when you wake up at night|offer a/i.test(rubric)) {
          verses.unshift({ index: 0, arabic: "", translation: rubric });
          inserted = true;
        }

        if (!inserted) {
          verses.unshift({ index: 0, arabic: "", translation: rubric });
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

/**
 * Parse ya-mahdi.net view HTML into a structured MafatihDetail object
 */
export function parseMafatihHtml(html: string, id: string, metaFallback?: MafatihSummary | null): MafatihDetail {
  const $ = cheerio.load(html);

  // 1. Audio URL extraction with comprehensive selectors, attributes, and regex fallbacks
  let audioUrl =
    $("#audioPlayer").attr("src") ||
    $("#audioPlayer source").attr("src") ||
    $("audio source").attr("src") ||
    $("audio").attr("src") ||
    $('a[href*=".mp3"]').attr("href") ||
    $('a[href*=".m4a"]').attr("href") ||
    $('source[src*=".mp3"]').attr("src") ||
    $('source[src*=".m4a"]').attr("src") ||
    metaFallback?.audioUrl ||
    null;

  // Regex fallback: find audio path embedded in inline JavaScript or script blocks
  if (!audioUrl) {
    const rawAudioMatch = html.match(/(?:https?:\/\/[^\s"'<>]+\.(?:m4a|mp3)|apps_audio\/[^\s"'<>]+\.(?:m4a|mp3)|\/apps_audio\/[^\s"'<>]+\.(?:m4a|mp3))/i);
    if (rawAudioMatch) {
      audioUrl = rawAudioMatch[0];
    }
  }

  if (audioUrl) {
    audioUrl = audioUrl.trim();
    if (!audioUrl.startsWith("http")) {
      audioUrl = `${ROOT_URL}${audioUrl.replace(/^\/+/, "")}`;
    }
    // Upgrade HTTP to HTTPS for known CDNs to eliminate mixed-content blocking
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
  let pendingTranslation = "";
  let pendingRubric: string[] = [];
  let state: "BEFORE_FIRST_ARABIC" | "IN_VERSES" = "BEFORE_FIRST_ARABIC";

  const flushRubric = () => {
    if (pendingRubric.length > 0) {
      const text = pendingRubric.join("\n\n").trim();
      if (text) {
        verses.push({
          index: verses.length + 1,
          arabic: "",
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
      pendingArabic = "";
      pendingTranslation = "";
    }
  };

  const duaCard = $(".dua-card");
  if (duaCard.length > 0) {
    duaCard.children().each((_, el) => {
      const $el = $(el);
      const cls = $el.attr("class") || "";
      const text = $el.text().trim();
      if (!text) return;

      if (cls.includes("arabic-line")) {
        state = "IN_VERSES";
        flushRubric();
        flushVerse();
        pendingArabic = text;
      } else if (cls.includes("translation-line")) {
        pendingTranslation = text;
        flushRubric();
        flushVerse();
      } else if (cls.includes("content-line")) {
        if (state === "BEFORE_FIRST_ARABIC") {
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
    // Fallback: extract from general paragraphs/lines
    $("p, div.line").each((_, el) => {
      const text = $(el).text().trim();
      if (text) {
        if (isInstructionText(text)) {
          verses.push({
            index: verses.length + 1,
            arabic: "",
            translation: text,
          });
        } else {
          contentLines.push(text);
        }
      }
    });
  }

  const baseDetail: MafatihDetail = {
    id,
    code: metaFallback?.code || id,
    title,
    mainCategory: metaFallback?.mainCategory || "General Recitations",
    mainCategoryCode: metaFallback?.mainCategoryCode || "general",
    categoryChain: metaFallback?.categoryChain || [title],
    audioUrl,
    introduction: cleanVirtuesDisplay(contentLines.join("\n\n")),
    versesCount: verses.length,
    verses,
    sourceUrl: `${ROOT_URL}view.php?cat=${encodeURIComponent(id)}&lang=en`,
  };

  return normalizeServerMafatihDetail(baseDetail);
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
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
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

      // Save to disk cache (.cache/mafatih_items and public/mafatih_items) only if valid content was retrieved
      const hasValidContent = (detail.verses && detail.verses.length > 0) || (detail.introduction && detail.introduction.length > 50);
      if (hasValidContent) {
        try {
          if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
          fs.writeFileSync(cachePath, JSON.stringify(detail, null, 2), "utf8");

          if (!fs.existsSync(PUBLIC_ITEMS_DIR)) fs.mkdirSync(PUBLIC_ITEMS_DIR, { recursive: true });
          fs.writeFileSync(publicPath, JSON.stringify(detail, null, 2), "utf8");
        } catch (err) {
          console.error(`Failed to write disk cache for ${resolvedId}:`, err);
        }
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
