import { getApiUrl } from '../utils/apiBase';
import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';
import { fastStorage } from '../utils/fastStorage';

export interface TafseerContent {
  ur: string;
  en: string;
  tafseer_text?: string;
  tafseer_title?: string;
  surah?: number;
  ayah?: number;
  ayah_range?: string;
}

// In-memory cache
const memoryCache: Record<string, TafseerContent> = {};

/**
 * Clean and parse raw HTML from Balagh ul Quran (Tafseer Al-Kauthar)
 * Works in both browser DOM and native WebView environments
 */
export function parseKautharHtml(html: string, surah: number, ayah: number): TafseerContent | null {
  if (!html || typeof html !== 'string' || html.length < 100) return null;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract ayah range label from #msg2 before removing it
    let extractedRange = '';
    const msg2El = doc.querySelector('#msg2');
    if (msg2El) {
      extractedRange = msg2El.textContent?.trim() || '';
    }

    // Remove unwanted scripts, styles, buttons, forms, nav, and message headers
    doc.querySelectorAll('script, style, iframe, form, button, a.btn, a.sp, .btn-with-arrow, #msg2, #suraname, header, footer, nav, .breadcrumb').forEach(el => el.remove());
    doc.querySelectorAll('a[href*="tafseer.php"]').forEach(el => el.remove());

    // Remove navigation rows with آگے / پیچھے / اگلی آیت
    doc.querySelectorAll('section.section .container > .row, section.section .container .row').forEach(el => {
      const text = el.textContent || '';
      if ((text.includes('پیچھے') && text.includes('آگے')) || (text.startsWith('تفسیر قرآن سورہ') && !text.includes('تشریح کلمات') && !text.includes('تفسیرآیات'))) {
        el.remove();
      }
    });

    const container = doc.querySelector('section.section .container') || doc.body;

    // Clean empty containers
    container.querySelectorAll('p, div, span').forEach(el => {
      if (!el.textContent?.trim() && !el.querySelector('img')) {
        el.remove();
      }
    });

    // Extract Urdu text from rows
    let urduText = '';
    const rows = container.querySelectorAll('.row');
    if (rows.length > 0) {
      rows.forEach(r => {
        const t = (r.textContent || '').trim().replace(/[ \t]+/g, ' ');
        if (t && !t.startsWith('تفسیر قرآن سورہ') && !t.includes('پیچھے') && !t.includes('آگے')) {
          urduText += t + '\n\n';
        }
      });
    }

    if (!urduText.trim()) {
      urduText = (container.textContent || '').trim().replace(/[ \t]+/g, ' ');
    }

    const cleanHtml = container.innerHTML || '';

    if (!urduText.trim() && !cleanHtml.trim()) {
      return null;
    }

    return {
      surah,
      ayah,
      ur: urduText.trim(),
      tafseer_text: cleanHtml.trim(),
      en: "Tafseer Al-Kauthar by Allama Sheikh Mohsin Ali Najafi",
      tafseer_title: "تفسیر الکوثر — علامہ شیخ محسن علی نجفی",
      ayah_range: extractedRange || undefined
    };
  } catch (err) {
    console.warn('[parseKautharHtml] Error parsing Tafseer HTML:', err);
    return null;
  }
}

export async function fetchTafseer(
  surahNumber: number, 
  ayahNumber: number, 
  provider: 'namoona' | 'kauthar' = 'namoona'
): Promise<TafseerContent> {

  if (provider === 'kauthar') {
    const kKey = `tafseer_kauthar_${surahNumber}_${ayahNumber}`;
    if (memoryCache[kKey]) return memoryCache[kKey];

    // 1a. Check fastStorage (IndexedDB - instant 0ms, unlimited storage)
    try {
      const fastCached = await fastStorage.get<TafseerContent>(kKey);
      if (fastCached && (fastCached.ur || fastCached.tafseer_text)) {
        memoryCache[kKey] = fastCached;
        return fastCached;
      }
    } catch (e) {}

    // 1b. Check localStorage
    const localData = localStorage.getItem(kKey);
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (parsed && (parsed.ur || parsed.tafseer_text)) {
          memoryCache[kKey] = parsed;
          fastStorage.set(kKey, parsed).catch(() => {});
          return parsed;
        }
      } catch (e) {}
    }

    // 1c. Check if preceding adjacent ayah is already cached and covers this ayah
    if (ayahNumber > 1) {
      for (let prevA = ayahNumber - 1; prevA >= Math.max(1, ayahNumber - 4); prevA--) {
        const prevKey = `tafseer_kauthar_${surahNumber}_${prevA}`;
        const prevCached = memoryCache[prevKey] || (await fastStorage.get<TafseerContent>(prevKey).catch(() => null));
        if (prevCached && prevCached.ur && prevCached.ur.length > 50 && prevCached.ayah_range) {
          const match = prevCached.ayah_range.match(/(\d+)\s*[-–]\s*(\d+)/);
          if (match) {
            const startA = parseInt(match[1], 10);
            const endA = parseInt(match[2], 10);
            if (ayahNumber >= startA && ayahNumber <= endA) {
              const item = { ...prevCached, ayah: ayahNumber };
              memoryCache[kKey] = item;
              fastStorage.set(kKey, item).catch(() => {});
              return item;
            }
          }
        }
      }
    }

    // Helper to store an item across memory, fastStorage, and localStorage
    const cacheKautharItem = (item: TafseerContent, targetAyah = ayahNumber) => {
      const key = `tafseer_kauthar_${surahNumber}_${targetAyah}`;
      memoryCache[key] = item;
      fastStorage.set(key, item).catch(() => {});
      try {
        localStorage.setItem(key, JSON.stringify(item));
      } catch (e) {}
    };

    // 2. Try static pre-bundled or server on-demand JSON route
    try {
      const staticRes = await fetch(getApiUrl(`/tafseer_kauthar/s${surahNumber}_a${ayahNumber}.json`));
      if (staticRes.ok) {
        const data = await staticRes.json();
        if (data && (data.ur || data.tafseer_text) && (data.ur?.length > 30 || data.tafseer_text?.length > 50)) {
          cacheKautharItem(data, ayahNumber);
          return data;
        }
      }
    } catch (e) {}

    // 3. Try backend API proxy route with smart range mapping
    const endpoint = getApiUrl(`/api/tafseer/kauthar/${surahNumber}/${ayahNumber}`);
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        let item: TafseerContent | null = null;

        if (Capacitor.isNativePlatform()) {
          const nativeRes = await CapacitorHttp.get({ url: endpoint, connectTimeout: 15000, readTimeout: 20000 });
          if (nativeRes.status >= 200 && nativeRes.status < 300 && nativeRes.data) {
            item = typeof nativeRes.data === 'string' ? JSON.parse(nativeRes.data) : nativeRes.data;
          }
        } else {
          const apiRes = await fetch(endpoint);
          if (apiRes.ok) {
            item = await apiRes.json();
          }
        }

        if (item && (item.ur || item.tafseer_text) && ((item.ur?.length || 0) > 30 || (item.tafseer_text?.length || 0) > 50)) {
          cacheKautharItem(item, ayahNumber);

          // If the item covers a range (e.g. 1 - 2, 16 - 18), cache it for all ayahs in that range
          if (item.ayah_range) {
            const match = item.ayah_range.match(/(\d+)\s*[-–]\s*(\d+)/);
            if (match) {
              const startA = parseInt(match[1], 10);
              const endA = parseInt(match[2], 10);
              if (!isNaN(startA) && !isNaN(endA)) {
                for (let a = startA; a <= endA; a++) {
                  cacheKautharItem({ ...item, ayah: a }, a);
                }
              }
            }
          }
          return item;
        }
      } catch (e) {
        if (attempt === 0) {
          await new Promise(r => setTimeout(r, 400));
        }
      }
    }

    const sno = String(surahNumber);
    const ano = String(surahNumber).padStart(3, '0') + String(ayahNumber).padStart(3, '0');
    const balaghDirectUrl = `https://balaghulquran.com/tafseer.php?sno=${sno}&ano=${ano}`;

    // 4. On Native Mobile (Capacitor), fetch directly from balaghulquran.com without CORS constraints
    if (Capacitor.isNativePlatform()) {
      try {
        const nativeRes = await CapacitorHttp.get({
          url: balaghDirectUrl,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
          },
          connectTimeout: 15000,
          readTimeout: 20000
        });

        if (nativeRes.status >= 200 && nativeRes.status < 300 && nativeRes.data) {
          const rawData = typeof nativeRes.data === 'string' ? nativeRes.data : JSON.stringify(nativeRes.data);
          const parsed = parseKautharHtml(rawData, surahNumber, ayahNumber);
          if (parsed && (parsed.ur || parsed.tafseer_text)) {
            cacheKautharItem(parsed, ayahNumber);
            return parsed;
          }
        }
      } catch (nativeErr) {
        console.warn(`[TafseerScraper] Native direct fetch from balaghulquran failed:`, nativeErr);
      }
    }

    // 5. Fallback for Web Browser: fetch via reliable web CORS proxies
    if (!Capacitor.isNativePlatform()) {
      const corsProxies = [
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(balaghDirectUrl)}`,
        `https://corsproxy.io/?url=${encodeURIComponent(balaghDirectUrl)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(balaghDirectUrl)}`
      ];

      for (const proxyUrl of corsProxies) {
        try {
          const res = await fetch(proxyUrl);
          if (res.ok) {
            const html = await res.text();
            const parsed = parseKautharHtml(html, surahNumber, ayahNumber);
            if (parsed && (parsed.ur || parsed.tafseer_text)) {
              cacheKautharItem(parsed, ayahNumber);
              return parsed;
            }
          }
        } catch (proxyErr) {}
      }
    }

    throw new Error(`تفسیر الکوثر: سورہ ${surahNumber} آیت ${ayahNumber} کا مواد لوڈ نہیں ہو سکا۔ انٹرنیٹ کنکشن چیک کریں اور دوبارہ کوشش کریں۔`);
  }


  const cacheKey = `tafseer_${surahNumber}_${ayahNumber}_v6`;
  
  // Tier 1: In-memory cache
  if (memoryCache[cacheKey]) {
    return memoryCache[cacheKey];
  }
  
  // Tier 2: fastStorage (IndexedDB) + localStorage
  try {
    const fastCached = await fastStorage.get<TafseerContent>(cacheKey);
    if (fastCached && (fastCached.ur || fastCached.en)) {
      memoryCache[cacheKey] = fastCached;
      return fastCached;
    }
  } catch (e) {}

  const localData = localStorage.getItem(cacheKey);
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      if (parsed && (parsed.ur || parsed.en)) {
        memoryCache[cacheKey] = parsed;
        fastStorage.set(cacheKey, parsed).catch(() => {});
        return parsed;
      }
    } catch (e) {}
  }

  // Helper to store an entire surah's ayahs into caches simultaneously
  const cacheSurahAyahs = (surahData: Record<number, TafseerContent>) => {
    for (const [aStr, content] of Object.entries(surahData)) {
      const aNum = Number(aStr);
      if (!isNaN(aNum) && content) {
        const aKey = `tafseer_${surahNumber}_${aNum}_v6`;
        memoryCache[aKey] = content;
        fastStorage.set(aKey, content).catch(() => {});
        try {
          localStorage.setItem(aKey, JSON.stringify(content));
        } catch (e) {}
      }
    }
  };

  // Helper to purge poisoned or legacy Workbox/browser caches
  const purgePoisonedCaches = async () => {
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const keys = await window.caches.keys();
        for (const k of keys) {
          if (k.toLowerCase().includes('tafseer') || k.toLowerCase().includes('namoona')) {
            await window.caches.delete(k);
          }
        }
      } catch (e) {}
    }
  };

  // Tier 3: Pre-bundled or disk-cached static JSON file (Instant, offline-ready, 0 network dependencies)
  try {
    let text = '';
    const staticRes = await fetch(getApiUrl(`/tafseer_namoona/surah_${surahNumber}.json`));
    if (staticRes.ok) {
      text = await staticRes.text();
    }

    // Safeguard: If service worker or server returned HTML index.html, purge caches and re-fetch fresh
    if (!text || text.trim().startsWith('<') || text.includes('<!DOCTYPE')) {
      await purgePoisonedCaches();
      // Bypass any service worker cache or HTTP stale cache with reload directive and cache-buster
      const freshRes = await fetch(getApiUrl(`/tafseer_namoona/surah_${surahNumber}.json?v=v5&t=${Date.now()}`), {
        cache: 'reload'
      }).catch(() => null);
      if (freshRes && freshRes.ok) {
        text = await freshRes.text();
      }
    }

    if (text && !text.trim().startsWith('<') && !text.includes('<!DOCTYPE')) {
      const surahBundle = JSON.parse(text);
      if (surahBundle && typeof surahBundle === 'object' && Object.keys(surahBundle).length > 0) {
        cacheSurahAyahs(surahBundle);
        const item = surahBundle[ayahNumber] || surahBundle[String(ayahNumber)];
        if (item && (item.ur || item.en)) {
          return item;
        }
      }
    }
  } catch (e) {}

  // Tier 4: Server Pre-parsed JSON API (10x faster, clean JSON, disk-cached on server)
  try {
    // 4a. Attempt to fetch the whole surah first (caches all ayahs of this surah in one trip)
    const surahEndpoint = getApiUrl(`/api/tafseer/namoona/${surahNumber}?v=v5`);
    let surahBundle: Record<number, TafseerContent> | null = null;

    if (Capacitor.isNativePlatform()) {
      const nativeRes = await CapacitorHttp.get({
        url: surahEndpoint,
        connectTimeout: 20000,
        readTimeout: 35000,
      });
      if (nativeRes.status >= 200 && nativeRes.status < 300 && nativeRes.data) {
        surahBundle = typeof nativeRes.data === 'string' ? JSON.parse(nativeRes.data) : nativeRes.data;
      }
    } else {
      const res = await fetch(surahEndpoint);
      if (res.ok) {
        const text = await res.text();
        if (text && !text.trim().startsWith('<') && !text.includes('<!DOCTYPE')) {
          surahBundle = JSON.parse(text);
        }
      }
    }

    if (surahBundle && typeof surahBundle === 'object' && Object.keys(surahBundle).length > 0) {
      cacheSurahAyahs(surahBundle);
      const item = (surahBundle as any)[ayahNumber] || (surahBundle as any)[String(ayahNumber)];
      if (item && (item.ur || item.en)) {
        return item;
      }
    }

    // 4b. Fallback: fetch individual ayah endpoint
    const ayahEndpoint = getApiUrl(`/api/tafseer/namoona/${surahNumber}/${ayahNumber}?v=v5`);
    let serverAyah: TafseerContent | null = null;

    if (Capacitor.isNativePlatform()) {
      const nativeRes = await CapacitorHttp.get({
        url: ayahEndpoint,
        connectTimeout: 15000,
        readTimeout: 25000,
      });
      if (nativeRes.status >= 200 && nativeRes.status < 300 && nativeRes.data) {
        serverAyah = typeof nativeRes.data === 'string' ? JSON.parse(nativeRes.data) : nativeRes.data;
      }
    } else {
      const res = await fetch(ayahEndpoint);
      if (res.ok) {
        const text = await res.text();
        if (text && !text.trim().startsWith('<') && !text.includes('<!DOCTYPE')) {
          serverAyah = JSON.parse(text);
        }
      }
    }

    if (serverAyah && (serverAyah.ur || serverAyah.en)) {
      memoryCache[cacheKey] = serverAyah;
      fastStorage.set(cacheKey, serverAyah).catch(() => {});
      try {
        localStorage.setItem(cacheKey, JSON.stringify(serverAyah));
      } catch (e) {}
      return serverAyah;
    }
  } catch (e) {}

  // Tier 5: Fetch HTML from server proxy, native direct, or CORS proxies with deduplication
  const fetchHtmlPayload = async (): Promise<string> => {
    // 5a. Try server HTML proxy
    try {
      const proxyUrl = getApiUrl(`/api/tafseer/proxy/${surahNumber}`);
      const response = await fetch(proxyUrl);
      if (response.ok) {
        const text = await response.text();
        if (text && text.length > 500) return text;
      }
    } catch (e) {}

    // 5b. Native direct fetch via CapacitorHttp with browser headers
    if (Capacitor.isNativePlatform()) {
      try {
        const directUrl = `https://www.tafseerenamoona.net/surahs/${surahNumber}`;
        const response = await CapacitorHttp.get({
          url: directUrl,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          },
          connectTimeout: 12000,
          readTimeout: 15000,
        });
        if (response.status >= 200 && response.status < 300 && response.data) {
          const raw = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
          if (raw.length > 500) return raw;
        }
      } catch (e) {}
    }

    // 5c. Web CORS proxies as fallback for web and PWA
    const corsProxies = [
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(`https://www.tafseerenamoona.net/surahs/${surahNumber}`)}`,
      `https://corsproxy.io/?url=${encodeURIComponent(`https://www.tafseerenamoona.net/surahs/${surahNumber}`)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.tafseerenamoona.net/surahs/${surahNumber}`)}`
    ];

    for (const pUrl of corsProxies) {
      try {
        const pRes = await fetch(pUrl);
        if (pRes.ok) {
          const pText = await pRes.text();
          if (pText && pText.length > 500) return pText;
        }
      } catch (e) {}
    }

    throw new Error(`Unable to reach Tafseer Namoona source.`);
  };

  let html = "";
  try {
    html = await fetchHtmlPayload();
  } catch (e) {
    console.error("Failed to fetch tafseer HTML:", e);
    throw new Error(`تفسیرِ نمونہ: سورہ ${surahNumber} آیت ${ayahNumber} کا مواد لوڈ نہیں ہو سکا۔ انٹرنیٹ کنکشن چیک کریں اور دوبارہ کوشش کریں۔`);
  }

  // Tier 6: Parse RSC payload from HTML
  const parts = html.split('self.__next_f.push(');
  let fullPayload = "";
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const startIdx = part.indexOf('[');
    if (startIdx === -1) continue;
    
    let parsed = null;
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
        parsed = JSON.parse(jsonStr);
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
      textNodes[id] = new TextDecoder('utf-8').decode(encodedFullPayload.slice(currentByteOffset, currentByteOffset + len));
    }
  }

  const resolveRef = (ref: string) => {
    if (!ref) return null;
    if (ref.startsWith('$')) {
      const id = ref.substring(1);
      return textNodes[id] || null;
    }
    return ref;
  };

  let foundTafseer: TafseerContent | null = null;
  const parsedSurahMap: Record<number, TafseerContent> = {};
  
  // Custom parser to properly extract tafseer_topics array without breaking on inner brackets
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
      const topicsStr = fullPayload.substring(arrayStartIdx, arrayEndIdx + 1);
      try {
        const topics = JSON.parse(topicsStr);
        let combinedUrdu = "";
        let combinedEnglish = "";
        
        for (const topic of topics) {
          // URDU
          let detailsUr = topic.details || topic.details_ur;
          detailsUr = resolveRef(detailsUr);
          let titleUr = topic.title || topic.title_ur;
          titleUr = resolveRef(titleUr);
          
          if (detailsUr && detailsUr.trim().length > 0) {
            combinedUrdu += `**${titleUr || 'Tafseer'}**\n\n${detailsUr}\n\n`;
          }
          
          // ENGLISH
          let detailsEn = topic.details_en;
          detailsEn = resolveRef(detailsEn);
          let titleEn = topic.title_en;
          titleEn = resolveRef(titleEn);
          
          if (detailsEn && detailsEn.trim().length > 0) {
            combinedEnglish += `**${titleEn || 'Tafseer'}**\n\n${detailsEn}\n\n`;
          }
        }
        
        const cleanUrdu = combinedUrdu.trim();
        const cleanEnglish = combinedEnglish.trim();
        
        if (cleanUrdu || cleanEnglish) {
          const content: TafseerContent = {
            ur: cleanUrdu,
            en: cleanEnglish,
            surah: surahNumber,
            ayah: currentAyah,
            tafseer_title: 'تفسیرِ نمونہ — آیت اللہ ناصر مکارم شیرازی',
          };
          
          parsedSurahMap[currentAyah] = content;
          
          if (currentAyah === ayahNumber) {
            foundTafseer = content;
          }
        }
      } catch (e) {
        console.error("Error parsing topics for ayah", currentAyah, e);
      }
    }
  }

  // Store all parsed ayahs for instant access for the rest of the surah
  if (Object.keys(parsedSurahMap).length > 0) {
    cacheSurahAyahs(parsedSurahMap);
  }

  if (foundTafseer) {
    return foundTafseer;
  }
  
  throw new Error(`تفسیرِ نمونہ: سورہ ${surahNumber} آیت ${ayahNumber} کی تفسیر دستیاب نہیں ہو سکی۔`);
}

export function clearTafseerCache() {
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (key.startsWith('tafseer_')) {
      localStorage.removeItem(key);
    }
  }
  for (const key of Object.keys(memoryCache)) {
    delete memoryCache[key];
  }
}

export async function clearAyahTafseerCache(surahNumber: number, ayahNumber: number) {
  const cacheKey = `tafseer_${surahNumber}_${ayahNumber}_v6`;
  const kKey = `tafseer_kauthar_${surahNumber}_${ayahNumber}`;
  
  delete memoryCache[cacheKey];
  delete memoryCache[kKey];

  try {
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(kKey);
  } catch (e) {}

  await fastStorage.del(cacheKey).catch(() => {});
  await fastStorage.del(kKey).catch(() => {});

  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const keys = await window.caches.keys();
      for (const k of keys) {
        if (k.toLowerCase().includes('tafseer') || k.toLowerCase().includes('namoona')) {
          await window.caches.delete(k);
        }
      }
    } catch (e) {}
  }
}


declare global {
  interface Window {
    __kautharCache?: any[];
  }
}
