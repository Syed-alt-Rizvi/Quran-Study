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
  fetchedAt?: string;
}

const CACHE_DIR = path.join(process.cwd(), "public", "tafseer_kauthar");

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  } catch (e) {
    console.error("Failed to create CACHE_DIR:", e);
  }
}

/**
 * Clean and normalize extracted Tafseer HTML from Balagh ul Quran
 */
function sanitizeBalaghHtml(htmlSnippet: string): string {
  if (!htmlSnippet) return "";
  const $ = cheerio.load(htmlSnippet);

  // Remove navigation elements, search elements, or script tags
  $("script, style, iframe, form, button, a.btn").remove();
  $("#msg2, #suraname").remove();

  // Remove empty tags
  $("p, div, span").each((_, el) => {
    const $el = $(el);
    if (!$el.text().trim() && !$el.find("img").length) {
      $el.remove();
    }
  });

  return $.html();
}

/**
 * Fetch and parse an Ayah from Balagh ul Quran (Tafseer Al-Kauthar)
 */
export async function fetchTafseerAlKauthar(
  surah: number,
  ayah: number,
  forceRefresh = false
): Promise<KautharTafseerItem> {
  const cacheFile = path.join(CACHE_DIR, `s${surah}_a${ayah}.json`);

  // 1. Check local file cache first
  if (!forceRefresh && fs.existsSync(cacheFile)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
      if (cached && (cached.ur || cached.tafseer_text)) {
        return cached;
      }
    } catch (e) {
      // file may be corrupted, re-scrape
    }
  }

  // 2. Fetch from balaghulquran.com
  const sno = String(surah);
  const ano = String(surah).padStart(3, "0") + String(ayah).padStart(3, "0");
  const targetUrl = `https://balaghulquran.com/tafseer.php?sno=${sno}&ano=${ano}`;

  let html = "";
  try {
    const { stdout } = await execFilePromise("curl", ["-4", "-s", "-m", "15", targetUrl], {
      maxBuffer: 15 * 1024 * 1024
    });
    html = stdout;
  } catch (err: any) {
    // Fallback using global fetch if curl encounters an issue
    try {
      const res = await fetch(targetUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
      });
      html = await res.text();
    } catch (fetchErr: any) {
      throw new Error(`Failed to fetch Tafseer from Balagh ul Quran: ${err.message || fetchErr.message}`);
    }
  }

  if (!html || html.length < 500) {
    throw new Error(`Empty or invalid response from balaghulquran.com for Surah ${surah}, Ayah ${ayah}`);
  }

  // 3. Parse HTML with Cheerio
  const $ = cheerio.load(html);

  // Remove navigation rows
  $("section.section .container > .row").each((_, el) => {
    const $el = $(el);
    const text = $el.text();
    if (
      $el.find("#msg2").length > 0 ||
      $el.find("#suraname").length > 0 ||
      (text.includes("پیچھے") && text.includes("آگے"))
    ) {
      $el.remove();
    }
  });

  // Extract clean structured Urdu text
  let urduText = "";
  $("section.section .container > .row").each((_, el) => {
    const rowText = $(el).text().trim().replace(/[ \t]+/g, " ");
    if (rowText) {
      urduText += rowText + "\n\n";
    }
  });

  // Extract clean HTML
  const rawHtmlContainer = $("section.section .container").html() || "";
  const cleanHtml = sanitizeBalaghHtml(rawHtmlContainer);

  const result: KautharTafseerItem = {
    surah,
    ayah,
    ur: urduText.trim(),
    tafseer_text: cleanHtml.trim(),
    en: "Tafseer Al-Kauthar by Allama Sheikh Mohsin Ali Najafi",
    tafseer_title: "تفسیر الکوثر — علامہ شیخ محسن علی نجفی",
    fetchedAt: new Date().toISOString()
  };

  // 4. Save to persistent disk cache
  try {
    fs.writeFileSync(cacheFile, JSON.stringify(result, null, 2), "utf-8");
  } catch (e) {
    console.warn(`Could not write cache file for s${surah}_a${ayah}:`, e);
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
      // Small 150ms throttle to prevent overwhelming the remote server
      await new Promise(r => setTimeout(r, 150));
    } catch (e: any) {
      console.warn(`Error crawling Surah ${surah} Ayah ${a}:`, e.message);
    }
  }

  // Save complete surah JSON bundle for instant batch loading
  const surahBundlePath = path.join(CACHE_DIR, `surah_${surah}.json`);
  try {
    fs.writeFileSync(surahBundlePath, JSON.stringify(items, null, 2), "utf-8");
  } catch (e) {
    console.error(`Could not write surah bundle for Surah ${surah}:`, e);
  }

  return items;
}
