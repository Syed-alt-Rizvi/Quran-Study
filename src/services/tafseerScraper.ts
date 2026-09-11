import { getApiUrl } from '../utils/apiBase';
import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';

export interface TafseerContent {
  ur: string;
  en: string;
  tafseer_text?: string;
  tafseer_title?: string;
  surah?: number;
  ayah?: number;
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

    // Remove unwanted scripts, styles, buttons, forms, nav, and message headers
    doc.querySelectorAll('script, style, iframe, form, button, a.btn, #msg2, #suraname, header, footer, nav, .breadcrumb').forEach(el => el.remove());

    // Remove navigation rows with آگے / پیچھے / اگلی آیت
    doc.querySelectorAll('section.section .container > .row, section.section .container .row').forEach(el => {
      const text = el.textContent || '';
      if ((text.includes('پیچھے') && text.includes('آگے')) || el.querySelector('#msg2, #suraname')) {
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
        if (t) {
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

    // 1. Check localStorage first
    const localData = localStorage.getItem(kKey);
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (parsed && (parsed.ur || parsed.tafseer_text)) {
          memoryCache[kKey] = parsed;
          return parsed;
        }
      } catch (e) {
        // ignore JSON parse error
      }
    }

    const sno = String(surahNumber);
    const ano = String(surahNumber).padStart(3, '0') + String(ayahNumber).padStart(3, '0');
    const balaghDirectUrl = `https://balaghulquran.com/tafseer.php?sno=${sno}&ano=${ano}`;

    // 2. On Native Mobile (Capacitor), fetch directly from balaghulquran.com without CORS constraints
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
            memoryCache[kKey] = parsed;
            try {
              localStorage.setItem(kKey, JSON.stringify(parsed));
            } catch (e) {}
            return parsed;
          }
        }
      } catch (nativeErr) {
        console.warn(`[TafseerScraper] Native direct fetch from balaghulquran failed:`, nativeErr);
      }
    }

    // 3. Fallback: try static pre-bundled or pre-scraped json
    try {
      const staticRes = await fetch(`/tafseer_kauthar/s${surahNumber}_a${ayahNumber}.json`);
      if (staticRes.ok) {
        const data = await staticRes.json();
        if (data && (data.ur || data.tafseer_text)) {
          memoryCache[kKey] = data;
          try {
            localStorage.setItem(kKey, JSON.stringify(data));
          } catch (e) {}
          return data;
        }
      }
    } catch (e) {}

    // 4. Try backend API proxy route
    try {
      const endpoint = getApiUrl(`/api/tafseer/kauthar/${surahNumber}/${ayahNumber}`);
      let item: TafseerContent | null = null;

      if (Capacitor.isNativePlatform()) {
        const nativeRes = await CapacitorHttp.get({ url: endpoint, connectTimeout: 6000, readTimeout: 6000 });
        if (nativeRes.status >= 200 && nativeRes.status < 300 && nativeRes.data) {
          item = typeof nativeRes.data === 'string' ? JSON.parse(nativeRes.data) : nativeRes.data;
        }
      } else {
        const apiRes = await fetch(endpoint);
        if (apiRes.ok) {
          item = await apiRes.json();
        }
      }

      if (item && (item.ur || item.tafseer_text)) {
        memoryCache[kKey] = item;
        try {
          localStorage.setItem(kKey, JSON.stringify(item));
        } catch (e) {}
        return item;
      }
    } catch (e) {
      console.warn(`[TafseerScraper] Backend API route failed for Al-Kauthar:`, e);
    }

    // 5. Fallback for Web Browser: fetch via web CORS proxies
    if (!Capacitor.isNativePlatform()) {
      const corsProxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(balaghDirectUrl)}`,
        `https://corsproxy.io/?url=${encodeURIComponent(balaghDirectUrl)}`
      ];

      for (const proxyUrl of corsProxies) {
        try {
          const res = await fetch(proxyUrl);
          if (res.ok) {
            const html = await res.text();
            const parsed = parseKautharHtml(html, surahNumber, ayahNumber);
            if (parsed && (parsed.ur || parsed.tafseer_text)) {
              memoryCache[kKey] = parsed;
              try {
                localStorage.setItem(kKey, JSON.stringify(parsed));
              } catch (e) {}
              return parsed;
            }
          }
        } catch (proxyErr) {
          // continue to next proxy
        }
      }
    }

    throw new Error(`تفسیر الکوثر: سورہ ${surahNumber} آیت ${ayahNumber} کا مواد لوڈ نہیں ہو سکا۔ انٹرنیٹ کنکشن چیک کریں اور دوبارہ کوشش کریں۔`);
  }


  const cacheKey = `tafseer_${surahNumber}_${ayahNumber}_v6`;
  
  // 1. Check in-memory cache
  if (memoryCache[cacheKey]) {
    return memoryCache[cacheKey];
  }
  
  // 2. Check localStorage
  const localData = localStorage.getItem(cacheKey);
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      memoryCache[cacheKey] = parsed;
      return parsed;
    } catch (e) {
      // ignore
    }
  }
  
  // 3. Fetch HTML
  let html = "";
  try {
    if (Capacitor.isNativePlatform()) {
      const url = `https://www.tafseerenamoona.net/surahs/${surahNumber}`;
      const response = await CapacitorHttp.get({ url });
      html = response.data;
    } else {
      const response = await fetch(getApiUrl(`/api/tafseer/proxy/${surahNumber}`));
      if (!response.ok) throw new Error("Failed to fetch proxy");
      html = await response.text();
    }
  } catch (e) {
    console.error("Failed to fetch tafseer HTML:", e);
    throw new Error("Network error while fetching tafseer");
  }

  // 4. Parse RSC payload
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
      } catch (e) {
        // ignore
      }
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
            combinedUrdu += `**${titleUr || 'Tafseer'}**

${detailsUr}

`;
          }
          
          // ENGLISH
          let detailsEn = topic.details_en;
          detailsEn = resolveRef(detailsEn);
          let titleEn = topic.title_en;
          titleEn = resolveRef(titleEn);
          
          if (detailsEn && detailsEn.trim().length > 0) {
            combinedEnglish += `**${titleEn || 'Tafseer'}**

${detailsEn}

`;
          }
        }
        
        const cleanUrdu = combinedUrdu.trim();
        const cleanEnglish = combinedEnglish.trim();
        
        if (cleanUrdu || cleanEnglish) {
          const aKey = `tafseer_${surahNumber}_${currentAyah}_v6`;
          const content: TafseerContent = { ur: cleanUrdu, en: cleanEnglish };
          
          memoryCache[aKey] = content;
          
          try {
            localStorage.setItem(aKey, JSON.stringify(content));
          } catch (storageError: any) {
            if (storageError.name === 'QuotaExceededError' || storageError.message?.includes('quota')) {
              // Clear older localStorage cache to free up space
              const keys = Object.keys(localStorage);
              for (const key of keys) {
                if (key.startsWith('tafseer_')) {
                  localStorage.removeItem(key);
                }
              }
              // Try saving again
              try {
                localStorage.setItem(aKey, JSON.stringify(content));
              } catch (e) {
                console.warn('LocalStorage is full, utilizing memory cache only.');
              }
            } else {
              console.warn('Failed to save to localStorage', storageError);
            }
          }
          
          if (currentAyah === ayahNumber) {
            foundTafseer = content;
          }
        }
      } catch (e) {
        console.error("Error parsing topics for ayah", currentAyah, e);
      }
    }
  }

  if (foundTafseer) {
    return foundTafseer;
  }
  
  throw new Error("Tafseer not found for this Ayah.");
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


declare global {
  interface Window {
    __kautharCache?: any[];
  }
}
