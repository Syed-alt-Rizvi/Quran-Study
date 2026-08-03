import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';

export interface TafseerContent {
  ur: string;
  en: string;
}

// In-memory cache
const memoryCache: Record<string, TafseerContent> = {};

export async function fetchTafseer(surahNumber: number, ayahNumber: number): Promise<TafseerContent> {
  const cacheKey = `tafseer_${surahNumber}_${ayahNumber}_v3`;
  
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
      const response = await fetch(`/api/tafseer/proxy/${surahNumber}`);
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

  let encodedFullPayload: Uint8Array | null = null;

  const resolveRef = (ref: string) => {
    const id = ref.substring(1);
    const prefix = `\n${id}:T`;
    const startIdx = fullPayload.indexOf(prefix);
    if (startIdx !== -1) {
      const commaIdx = fullPayload.indexOf(',', startIdx);
      if (commaIdx !== -1) {
        const hexLen = fullPayload.substring(startIdx + prefix.length, commaIdx);
        const len = parseInt(hexLen, 16);
        if (!isNaN(len)) {
          // Next.js text lengths are in UTF-8 bytes. 
          if (!encodedFullPayload) {
            encodedFullPayload = new TextEncoder().encode(fullPayload);
          }
          const byteStartOffset = new TextEncoder().encode(fullPayload.substring(0, commaIdx + 1)).length;
          const slicedBytes = encodedFullPayload.slice(byteStartOffset, byteStartOffset + len);
          return new TextDecoder('utf-8').decode(slicedBytes);
        }
      }
    }
    return null;
  };

  const ayahRegex = /"ayat_number":(\d+)[\s\S]*?"tafseer_topics":\[([\s\S]*?)\]/g;
  let ayahMatch;
  let foundTafseer: TafseerContent | null = null;
  
  // We can parse and cache ALL ayahs for this surah to save network calls
  while ((ayahMatch = ayahRegex.exec(fullPayload)) !== null) {
    const currentAyah = parseInt(ayahMatch[1], 10);
    const topicsStr = "[" + ayahMatch[2] + "]";
    try {
      const topics = JSON.parse(topicsStr);
      let combinedUrdu = "";
      let combinedEnglish = "";

      for (const topic of topics) {
        // URDU
        let detailsUr = topic.details || topic.details_ur;
        if (detailsUr && detailsUr.startsWith('$')) {
          detailsUr = resolveRef(detailsUr) || detailsUr;
        }
        let titleUr = topic.title || topic.title_ur;
        if (titleUr && titleUr.startsWith('$')) {
          titleUr = resolveRef(titleUr) || titleUr;
        }
        
        if (detailsUr && detailsUr.trim().length > 0) {
          combinedUrdu += `**${titleUr}**\n\n${detailsUr}\n\n`;
        }

        // ENGLISH
        let detailsEn = topic.details_en;
        if (detailsEn && detailsEn.startsWith('$')) {
          detailsEn = resolveRef(detailsEn) || detailsEn;
        }
        let titleEn = topic.title_en;
        if (titleEn && titleEn.startsWith('$')) {
          titleEn = resolveRef(titleEn) || titleEn;
        }
        
        if (detailsEn && detailsEn.trim().length > 0) {
          combinedEnglish += `**${titleEn}**\n\n${detailsEn}\n\n`;
        }
      }
      
      const cleanUrdu = combinedUrdu.trim();
      const cleanEnglish = combinedEnglish.trim();
      
      if (cleanUrdu || cleanEnglish) {
        const aKey = `tafseer_${surahNumber}_${currentAyah}_v3`;
        const content: TafseerContent = { ur: cleanUrdu, en: cleanEnglish };
        
        memoryCache[aKey] = content;
        localStorage.setItem(aKey, JSON.stringify(content));
        
        if (currentAyah === ayahNumber) {
          foundTafseer = content;
        }
      }
    } catch (e) {
      console.error("Error parsing topics for ayah", currentAyah, e);
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
