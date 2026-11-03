import fs from "fs";
import path from "path";
import { getOrFetchKautharSurah } from "./balaghScraper.ts";
import surahList from "../src/surahList.json";

const CACHE_DIR = path.join(process.cwd(), "public", "tafseer_kauthar");
const DIST_CACHE_DIR = path.join(process.cwd(), "dist", "tafseer_kauthar");

async function crawlAll() {
  console.log("=== Starting Complete Scraping of All 114 Surahs for Tafseer Al-Kauthar ===");
  const total = surahList.length;
  let completed = 0;
  let skipped = 0;

  for (let i = 0; i < total; i++) {
    const s = surahList[i];
    const sNum = s.number;
    const bundlePath = path.join(CACHE_DIR, `surah_${sNum}.json`);
    const distPath = path.join(DIST_CACHE_DIR, `surah_${sNum}.json`);

    // Check if valid bundle already exists
    if (fs.existsSync(bundlePath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(bundlePath, "utf-8"));
        if (existing && typeof existing === "object" && Object.keys(existing).length > 0) {
          skipped++;
          console.log(`[${i + 1}/${total}] Surah ${sNum} (${s.englishName}) already bundled with ${Object.keys(existing).length} ayahs.`);
          if (fs.existsSync(DIST_CACHE_DIR) && !fs.existsSync(distPath)) {
            try { fs.copyFileSync(bundlePath, distPath); } catch {}
          }
          continue;
        }
      } catch (e) {}
    }

    console.log(`[${i + 1}/${total}] Scraping Surah ${sNum} (${s.englishName}, ${s.numberOfAyahs} ayahs)...`);
    try {
      const data = await getOrFetchKautharSurah(sNum);
      const count = Object.keys(data).length;
      console.log(`✓ Surah ${sNum} completed: ${count} ayahs bundled.`);
      completed++;
    } catch (err: any) {
      console.error(`✗ Error scraping Surah ${sNum}:`, err.message);
    }

    // Small delay between surahs
    await new Promise(r => setTimeout(r, 120));
  }

  // Ensure all bundled files are also in dist
  if (fs.existsSync(DIST_CACHE_DIR) && fs.existsSync(CACHE_DIR)) {
    const files = fs.readdirSync(CACHE_DIR);
    for (const f of files) {
      if (f.endsWith(".json")) {
        try {
          fs.copyFileSync(path.join(CACHE_DIR, f), path.join(DIST_CACHE_DIR, f));
        } catch {}
      }
    }
  }

  console.log(`=== Complete! ${completed} newly scraped, ${skipped} already existed. Total: ${total}/114 Surahs ===`);
}

crawlAll().catch(console.error);
