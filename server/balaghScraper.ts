import * as cheerio from "cheerio";
import { execFile } from "child_process";
import util from "util";
import fs from "fs";
import path from "path";

const execFilePromise = util.promisify(execFile);

export interface KautharTafseerItem {
  surah: number;
  ayah: number;
  ur: string;
  tafseer_text: string;
  en: string;
  tafseer_title: string;
  ayah_range?: string;
  fetchedAt?: string;
}

export interface AyahOptionInfo {
  ano: string;
  range: [number, number];
  label: string;
}

const CACHE_DIR = path.join(process.cwd(), "public", "tafseer_kauthar");
const DIST_CACHE_DIR = path.join(process.cwd(), "dist", "tafseer_kauthar");
const MAPS_DIR = path.join(CACHE_DIR, "maps");
const DIST_MAPS_DIR = path.join(DIST_CACHE_DIR, "maps");

// Ensure cache directories exist
[CACHE_DIR, DIST_CACHE_DIR, MAPS_DIR, DIST_MAPS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (e) {
      console.error("Failed to create cache dir:", e);
    }
  }
});

// In-memory cache for surah ayah option maps
const surahAyahMaps: Record<number, Record<number, AyahOptionInfo>> = {};

/**
 * Multi-tier resilient fetch with direct curl, node fetch, and proxy fallback
 */
async function fetchRawHtmlWithFallback(url: string, timeoutMs = 12000): Promise<string> {
  // 1. Direct curl (without -4, with dual-stack HTTP/2 and modern browser headers)
  try {
    const { stdout } = await execFilePromise(
      "curl",
      [
        "-L",
        "-s",
        "-m",
        String(Math.round(timeoutMs / 1000)),
        "-A",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "-H",
        "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "-H",
        "Accept-Language: en-US,en;q=0.9,ur;q=0.8,ar;q=0.7",
        url
      ],
      { maxBuffer: 20 * 1024 * 1024 }
    );
    if (stdout && stdout.length > 500) {
      return stdout;
    }
  } catch (err: any) {
    // curl failed, try node fetch
  }

  // 2. Direct fetch with AbortSignal
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      }
    });
    if (res.ok) {
      const text = await res.text();
      if (text && text.length > 500) return text;
    }
  } catch (e) {}

  // 3. Fallback via allorigins proxy
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, {
      signal: AbortSignal.timeout(timeoutMs + 4000),
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });
    if (res.ok) {
      const text = await res.text();
      if (text && text.length > 500) return text;
    }
  } catch (e) {}

  throw new Error(`Failed to retrieve HTML from ${url}`);
}

/**
 * Clean and normalize extracted Tafseer HTML from Balagh ul Quran
 * Retains 100% of the authentic commentary, lexical notes, hadith, and lessons.
 */
function sanitizeBalaghHtml(htmlSnippet: string): string {
  if (!htmlSnippet) return "";
  const $ = cheerio.load(htmlSnippet);

  // Remove scripts, styles, forms, buttons, header/footer chrome
  $("script, style, iframe, form, button, a.btn, a.sp, .btn-with-arrow, header, footer, nav, .breadcrumb").remove();
  $("#msg2, #suraname, #frmAyaat, #header, #headerSearch").remove();

  // Remove links pointing back to other tafseer sections
  $("a[href*='tafseer.php']").remove();

  // Remove navigation rows with both 'پیچھے' and 'آگے'
  $("div.row").each((_, el) => {
    const $el = $(el);
    const text = $el.text().trim();
    if (text.includes("پیچھے") && text.includes("آگے")) {
      $el.remove();
    } else if (text.startsWith("تفسیر قرآن سورہ") && !text.includes("تشریح کلمات") && !text.includes("تفسیر آیات") && !text.includes("تفسیرآیات") && text.length > 400) {
      $el.remove();
    }
  });

  // Remove empty tags
  $("p, div, span").each((_, el) => {
    const $el = $(el);
    const txt = $el.text().trim();
    if (!txt && !$el.find("img").length) {
      $el.remove();
    }
  });

  return $.html();
}

/**
 * Retrieve or dynamically scrape the exact ayah-to-ano mapping for any surah
 * Balagh ul Quran groups certain ayahs together (e.g. 1-2, 2-5, 11-12, 16-18) in #idAyaat
 */
export async function getSurahAyahMap(surah: number): Promise<Record<number, AyahOptionInfo>> {
  if (surahAyahMaps[surah] && Object.keys(surahAyahMaps[surah]).length > 0) {
    return surahAyahMaps[surah];
  }

  const mapFile = path.join(MAPS_DIR, `map_s${surah}.json`);
  const distMapFile = path.join(DIST_MAPS_DIR, `map_s${surah}.json`);

  for (const p of [mapFile, distMapFile]) {
    if (fs.existsSync(p)) {
      try {
        const data = JSON.parse(fs.readFileSync(p, "utf-8"));
        if (data && typeof data === "object" && Object.keys(data).length > 0) {
          surahAyahMaps[surah] = data;
          return data;
        }
      } catch (e) {}
    }
  }

  // Fetch surah page from balaghulquran to extract #idAyaat options
  const targetUrl = `https://balaghulquran.com/tafseer.php?sno=${surah}`;
  let html = "";
  try {
    html = await fetchRawHtmlWithFallback(targetUrl, 10000);
  } catch (err: any) {
    console.warn(`[getSurahAyahMap] Failed to fetch surah ${surah} map:`, err?.message);
  }

  const map: Record<number, AyahOptionInfo> = {};

  if (html && html.includes("idAyaat")) {
    const $ = cheerio.load(html);
    const options = $("#idAyaat option");
    options.each((_, el) => {
      const val = $(el).attr("value") || "";
      const txt = $(el).text().trim();
      if (!val) return;

      if (txt.includes("-")) {
        const parts = txt.split("-").map(p => parseInt(p.trim(), 10));
        const start = parts[0];
        const end = parts[1];
        if (!isNaN(start) && !isNaN(end)) {
          for (let a = start; a <= end; a++) {
            map[a] = { ano: val, range: [start, end], label: txt };
          }
        }
      } else {
        const a = parseInt(txt, 10);
        if (!isNaN(a)) {
          map[a] = { ano: val, range: [a, a], label: txt };
        }
      }
    });
  }

  if (Object.keys(map).length > 0) {
    surahAyahMaps[surah] = map;
    try {
      const payload = JSON.stringify(map, null, 2);
      fs.writeFileSync(mapFile, payload, "utf-8");
      if (fs.existsSync(DIST_MAPS_DIR)) {
        fs.writeFileSync(distMapFile, payload, "utf-8");
      }
    } catch (e) {}
  }

  return map;
}

/**
 * Fetch and parse an Ayah from Balagh ul Quran (Tafseer Al-Kauthar)
 * Accurately handles grouped ayahs, caching all ayahs in the group simultaneously
 */
export async function fetchTafseerAlKauthar(
  surah: number,
  ayah: number,
  forceRefresh = false
): Promise<KautharTafseerItem> {
  const cacheFile = path.join(CACHE_DIR, `s${surah}_a${ayah}.json`);
  const distCacheFile = path.join(DIST_CACHE_DIR, `s${surah}_a${ayah}.json`);

  // 1. Check local file cache first (ensure valid content with length check)
  if (!forceRefresh) {
    const candidatePaths = [cacheFile, distCacheFile];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        try {
          const cached = JSON.parse(fs.readFileSync(p, "utf-8"));
          if (cached && cached.ur && cached.ur.length > 50 && (cached.tafseer_text || cached.ur.length > 100)) {
            return cached;
          }
        } catch (e) {}
      }
    }

    // Also check if whole surah bundle is already on disk
    const surahBundlePath = path.join(CACHE_DIR, `surah_${surah}.json`);
    const distBundlePath = path.join(DIST_CACHE_DIR, `surah_${surah}.json`);
    for (const p of [surahBundlePath, distBundlePath]) {
      if (fs.existsSync(p)) {
        try {
          const bundle = JSON.parse(fs.readFileSync(p, "utf-8"));
          const item = bundle[ayah] || bundle[String(ayah)];
          if (item && item.ur && item.ur.length > 50) {
            return item;
          }
        } catch (e) {}
      }
    }
  }

  // 2. Resolve the correct `ano` parameter from the Surah Ayah Map
  const map = await getSurahAyahMap(surah).catch(() => ({}));
  const ayahInfo = map[ayah];
  const targetAno = ayahInfo?.ano || (String(surah).padStart(3, "0") + String(ayah).padStart(3, "0"));
  const targetRange = ayahInfo?.range || [ayah, ayah];
  const targetLabel = ayahInfo?.label || `آیت ${ayah}`;

  const sno = String(surah);
  const targetUrl = `https://balaghulquran.com/tafseer.php?sno=${sno}&ano=${targetAno}`;

  let html = "";
  try {
    html = await fetchRawHtmlWithFallback(targetUrl, 12000);
  } catch (err: any) {
    // If ano failed and ayah > 1, check if the previous ayah already contains this ayah's tafseer
    if (ayah > 1) {
      const prevFile = path.join(CACHE_DIR, `s${surah}_a${ayah - 1}.json`);
      if (fs.existsSync(prevFile)) {
        try {
          const prevCached = JSON.parse(fs.readFileSync(prevFile, "utf-8"));
          if (prevCached && prevCached.ur && prevCached.ur.length > 50) {
            return {
              ...prevCached,
              ayah,
              ayah_range: prevCached.ayah_range || targetLabel
            };
          }
        } catch (e) {}
      }
    }
    throw new Error(`Failed to fetch Tafseer from Balagh ul Quran for Surah ${surah} Ayah ${ayah}: ${err.message}`);
  }

  if (!html || html.length < 500) {
    throw new Error(`Empty or invalid response from balaghulquran.com for Surah ${surah}, Ayah ${ayah}`);
  }

  // 3. Parse HTML with Cheerio
  const $ = cheerio.load(html);

  // Extract range from #msg2 before sanitizing
  const msg2Text = $("#msg2").text().trim();

  // Extract clean structured Urdu text by traversing all content rows
  let urduText = "";
  const allRows = $("section.section .container .row, section.section .row");

  allRows.each((_, el) => {
    const $el = $(el);
    const rowText = $el.text().trim().replace(/[ \t]+/g, " ");
    
    // Filter out previous/next buttons and footer directory
    if (!rowText) return;
    if (rowText.includes("پیچھے") && rowText.includes("آگے")) return;
    if (rowText.startsWith("تفسیر قرآن سورہ") && !rowText.includes("تشریح کلمات") && !rowText.includes("تفسیر آیات") && !rowText.includes("تفسیرآیات") && rowText.length > 400) {
      return;
    }

    // Clean video button labels
    $el.find("a, button, .btn").filter((_, a) => $(a).text().includes("ویڈیو") || $(a).text().includes("درس")).remove();

    const cleaned = $el.text().trim().replace(/[ \t]+/g, " ");
    if (cleaned && !cleaned.includes("پیچھے") && !cleaned.includes("آگے")) {
      urduText += cleaned + "\n\n";
    }
  });

  // Extract clean HTML container
  const rawHtmlContainer = $("section.section .container").html() || $("section.section").html() || "";
  const cleanHtml = sanitizeBalaghHtml(rawHtmlContainer);

  if (!urduText.trim() && (!cleanHtml || cleanHtml.length < 100)) {
    throw new Error(`No tafseer text found for Surah ${surah} Ayah ${ayah} on Balagh ul Quran`);
  }

  const result: KautharTafseerItem = {
    surah,
    ayah,
    ur: urduText.trim(),
    tafseer_text: cleanHtml.trim(),
    en: "Tafseer Al-Kauthar by Allama Sheikh Mohsin Ali Najafi",
    tafseer_title: "تفسیر الکوثر — علامہ شیخ محسن علی نجفی",
    ayah_range: targetLabel || (msg2Text.includes("آیات") ? msg2Text : undefined),
    fetchedAt: new Date().toISOString()
  };

  // 4. Save to persistent disk cache FOR ALL AYAHS IN THIS GROUP
  const startAyah = targetRange[0];
  const endAyah = targetRange[1];

  for (let a = startAyah; a <= endAyah; a++) {
    const itemForAyah: KautharTafseerItem = {
      ...result,
      ayah: a
    };
    const payloadStr = JSON.stringify(itemForAyah, null, 2);
    const destPublic = path.join(CACHE_DIR, `s${surah}_a${a}.json`);
    const destDist = path.join(DIST_CACHE_DIR, `s${surah}_a${a}.json`);

    try {
      fs.writeFileSync(destPublic, payloadStr, "utf-8");
      if (fs.existsSync(DIST_CACHE_DIR)) {
        fs.writeFileSync(destDist, payloadStr, "utf-8");
      }
    } catch (e) {
      console.warn(`Could not write cache file for s${surah}_a${a}:`, e);
    }
  }

  return result;
}

/**
 * Get or dynamically build complete Surah bundle for Tafseer Al-Kauthar
 */
export async function getOrFetchKautharSurah(surah: number): Promise<Record<number, KautharTafseerItem>> {
  const surahBundlePath = path.join(CACHE_DIR, `surah_${surah}.json`);
  const distBundlePath = path.join(DIST_CACHE_DIR, `surah_${surah}.json`);

  for (const p of [surahBundlePath, distBundlePath]) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
  }

  const map = await getSurahAyahMap(surah);
  const bundle: Record<number, KautharTafseerItem> = {};

  // Deduplicate unique ano options
  const uniqueAnos = new Map<string, number>();
  for (const [aStr, info] of Object.entries(map)) {
    const aNum = Number(aStr);
    if (!uniqueAnos.has(info.ano)) {
      uniqueAnos.set(info.ano, aNum);
    }
  }

  // Fetch groups in small concurrent batches of 3
  const entries = Array.from(uniqueAnos.entries());
  const BATCH_SIZE = 3;
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async ([ano, repAyah]) => {
        try {
          const item = await fetchTafseerAlKauthar(surah, repAyah);
          const range = map[repAyah]?.range || [repAyah, repAyah];
          for (let a = range[0]; a <= range[1]; a++) {
            bundle[a] = { ...item, ayah: a };
          }
        } catch (err: any) {
          console.warn(`[getOrFetchKautharSurah] Notice fetching surah ${surah} ano ${ano}:`, err?.message);
        }
      })
    );
    await new Promise(r => setTimeout(r, 60));
  }

  if (Object.keys(bundle).length > 0) {
    const payload = JSON.stringify(bundle, null, 2);
    try {
      fs.writeFileSync(surahBundlePath, payload, "utf-8");
      if (fs.existsSync(DIST_CACHE_DIR)) {
        fs.writeFileSync(distBundlePath, payload, "utf-8");
      }
    } catch (e) {}
  }

  return bundle;
}

/**
 * Background crawler for full surahs
 */
export async function crawlSurahKauthar(
  surah: number,
  totalAyahs: number,
  onProgress?: (current: number, total: number) => void
): Promise<KautharTafseerItem[]> {
  const bundle = await getOrFetchKautharSurah(surah);
  const items = Object.values(bundle);
  if (onProgress) onProgress(items.length, totalAyahs);
  return items;
}
