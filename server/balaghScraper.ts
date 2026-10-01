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
 * Clean and normalize extracted Tafseer HTML from Balagh ul Quran
 */
function sanitizeBalaghHtml(htmlSnippet: string): string {
  if (!htmlSnippet) return "";
  const $ = cheerio.load(htmlSnippet);

  // Remove navigation elements, search elements, or script tags
  $("script, style, iframe, form, button, a.btn, a.sp, .btn-with-arrow, header, footer, nav, .breadcrumb").remove();
  $("#msg2, #suraname, #frmAyaat, #header, #headerSearch").remove();

  // Remove footer navigation rows or links pointing back to other tafseer sections
  $("a[href*='tafseer.php']").remove();

  // Remove empty tags
  $("p, div, span").each((_, el) => {
    const $el = $(el);
    const txt = $el.text().trim();
    if (!txt && !$el.find("img").length) {
      $el.remove();
    }
  });

  // Remove rows that only contain other surah navigation links
  $("div.row").each((_, el) => {
    const $el = $(el);
    const text = $el.text().trim();
    if (text.includes("پیچھے") && text.includes("آگے")) {
      $el.remove();
    } else if (text.startsWith("تفسیر قرآن سورہ") && !text.includes("تشریح کلمات") && !text.includes("تفسیرآیات")) {
      $el.remove();
    }
  });

  return $.html();
}

/**
 * Retrieve or dynamically scrape the exact ayah-to-ano mapping for any surah
 * Balagh ul Quran groups certain ayahs together (e.g. 1-2, 11-12, 16-18) in #idAyaat
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
    const { stdout } = await execFilePromise(
      "curl",
      [
        "-4",
        "-L",
        "-s",
        "-m",
        "15",
        "-A",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        targetUrl
      ],
      { maxBuffer: 10 * 1024 * 1024 }
    );
    html = stdout;
  } catch (err: any) {
    console.warn(`[getSurahAyahMap] Failed to curl surah ${surah} map:`, err?.message);
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
          if (cached && cached.ur && cached.ur.length > 50 && cached.tafseer_text && cached.tafseer_text.length > 100) {
            return cached;
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
    const { stdout } = await execFilePromise(
      "curl",
      [
        "-4",
        "-L",
        "-s",
        "-m",
        "15",
        "-A",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "-H",
        "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "-H",
        "Accept-Language: en-US,en;q=0.9,ur;q=0.8",
        targetUrl
      ],
      { maxBuffer: 15 * 1024 * 1024 }
    );
    html = stdout;
  } catch (err: any) {
    try {
      const res = await fetch(targetUrl, {
        headers: { 
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      });
      html = await res.text();
    } catch (fetchErr: any) {
      throw new Error(`Failed to fetch Tafseer from Balagh ul Quran: ${err.message || fetchErr.message}`);
    }
  }

  if (!html || html.length < 500) {
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
    throw new Error(`Empty or invalid response from balaghulquran.com for Surah ${surah}, Ayah ${ayah}`);
  }

  // 3. Parse HTML with Cheerio
  const $ = cheerio.load(html);

  // Remove navigation rows and unneeded controls
  $("section.section .container > .row").each((_, el) => {
    const $el = $(el);
    const text = $el.text();
    if (
      $el.find("#msg2").length > 0 ||
      $el.find("#suraname").length > 0 ||
      (text.includes("پیچھے") && text.includes("آگے")) ||
      (text.startsWith("تفسیر قرآن سورہ") && !text.includes("تشریح کلمات") && !text.includes("تفسیرآیات"))
    ) {
      $el.remove();
    }
  });

  // Extract clean structured Urdu text
  let urduText = "";
  $("section.section .container > .row").each((_, el) => {
    const $el = $(el);
    const rowText = $el.text().trim().replace(/[ \t]+/g, " ");
    if (rowText && !rowText.startsWith("تفسیر قرآن سورہ") && !rowText.includes("پیچھے") && !rowText.includes("آگے")) {
      urduText += rowText + "\n\n";
    }
  });

  // Extract clean HTML
  const rawHtmlContainer = $("section.section .container").html() || "";
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
    ayah_range: targetLabel,
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
 * Background crawler for full surahs
 */
export async function crawlSurahKauthar(
  surah: number,
  totalAyahs: number,
  onProgress?: (current: number, total: number) => void
): Promise<KautharTafseerItem[]> {
  const items: KautharTafseerItem[] = [];

  for (let a = 1; a <= totalAyahs; a++) {
    try {
      const item = await fetchTafseerAlKauthar(surah, a);
      items.push(item);
      if (onProgress) onProgress(a, totalAyahs);
      await new Promise(r => setTimeout(r, 120));
    } catch (e: any) {
      console.warn(`Error crawling Surah ${surah} Ayah ${a}:`, e.message);
    }
  }

  // Save complete surah JSON bundle for instant batch loading
  const surahBundlePath = path.join(CACHE_DIR, `surah_${surah}.json`);
  const distBundlePath = path.join(DIST_CACHE_DIR, `surah_${surah}.json`);
  try {
    const bundlePayload = JSON.stringify(items, null, 2);
    fs.writeFileSync(surahBundlePath, bundlePayload, "utf-8");
    if (fs.existsSync(DIST_CACHE_DIR)) {
      fs.writeFileSync(distBundlePath, bundlePayload, "utf-8");
    }
  } catch (e) {
    console.error(`Could not write surah bundle for Surah ${surah}:`, e);
  }

  return items;
}
