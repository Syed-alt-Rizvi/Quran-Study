import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';

// In-memory cache
const memoryCache: Record<string, string> = {};

export interface TafseerTopic {
  title: string;
  details: string;
}

export interface AyahTafseer {
  topics: TafseerTopic[];
}

export async function fetchTafseer(surahNumber: number, ayahNumber: number): Promise<string> {
  const cacheKey = `tafseer_${surahNumber}_${ayahNumber}`;
  
  // 1. Check in-memory cache
  if (memoryCache[cacheKey]) {
    return memoryCache[cacheKey];
  }
  
  // 2. Check localStorage
  const localData = localStorage.getItem(cacheKey);
  if (localData) {
    memoryCache[cacheKey] = localData;
    return localData;
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
    const endIdx = part.indexOf('])');
    if (endIdx > 0) {
      const jsonStr = part.substring(0, endIdx + 1);
      try {
        const arr = JSON.parse(jsonStr);
        if (Array.isArray(arr) && arr.length > 1 && typeof arr[1] === 'string') {
          fullPayload += arr[1];
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
  let foundTafseer = "";
  
  // We can parse and cache ALL ayahs for this surah to save network calls
  while ((ayahMatch = ayahRegex.exec(fullPayload)) !== null) {
    const currentAyah = parseInt(ayahMatch[1], 10);
    const topicsStr = "[" + ayahMatch[2] + "]";
    try {
      const topics = JSON.parse(topicsStr);
      let combinedText = "";
      for (const topic of topics) {
        let details = topic.details;
        if (details && details.startsWith('$')) {
          details = resolveRef(details) || details;
        }
        if (details && details.trim().length > 0) {
          // Combine title and details
          combinedText += `**${topic.title}**\n\n${details}\n\n`;
        }
      }
      
      const cleanText = combinedText.trim();
      if (cleanText) {
        const aKey = `tafseer_${surahNumber}_${currentAyah}`;
        memoryCache[aKey] = cleanText;
        localStorage.setItem(aKey, cleanText);
        
        if (currentAyah === ayahNumber) {
          foundTafseer = cleanText;
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
