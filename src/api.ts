import staticSurahs from './surahList.json';
import { fastStorage } from './utils/fastStorage';

async function safeJson(res: Response) {
  const text = await res.text();
  try { return JSON.parse(text); } 
  catch(e) { console.error("Invalid JSON from " + res.url, text.substring(0, 100)); throw new Error("Invalid JSON"); }
}

export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  numberInSurah: number;
  surahNumber?: number;
  surahName?: string;
  text: string; // Arabic text
  translationEn: string;
  translationUr: string;
  audio?: string;
}

export interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

export interface JuzDetail {
  number: number;
  ayahs: Ayah[];
}

// In-memory L1 cache for 0ms access
const surahMetaCache: SurahMeta[] = Array.isArray(staticSurahs) && staticSurahs.length === 114 ? [...(staticSurahs as SurahMeta[])] : [];
const surahDetailCache = new Map<number, SurahDetail>();
const juzDetailCache = new Map<number, JuzDetail>();

// In-flight promise deduplication to prevent redundant network fetches
const pendingSurahRequests = new Map<number, Promise<SurahDetail>>();
const pendingJuzRequests = new Map<number, Promise<JuzDetail>>();

export const fetchSurahs = async (): Promise<SurahMeta[]> => {
  if (surahMetaCache.length === 114) return surahMetaCache;

  // Check fast storage (L1 memory + IndexedDB)
  try {
    const cached = await fastStorage.get<SurahMeta[]>('shia-quran-surahs-cache');
    if (cached && Array.isArray(cached) && cached.length === 114) {
      surahMetaCache.length = 0;
      surahMetaCache.push(...cached);
      return surahMetaCache;
    }
  } catch {}

  try {
    const response = await fetch('https://api.alquran.cloud/v1/surah');
    if (response.ok) {
      const data = await safeJson(response);
      if (data?.data && Array.isArray(data.data)) {
        surahMetaCache.length = 0;
        surahMetaCache.push(...data.data);
        fastStorage.set('shia-quran-surahs-cache', data.data);
      }
    }
  } catch (e) {
    console.warn("Could not fetch remote surahs list, using static:", e);
  }

  return surahMetaCache;
};

export const fetchSurahDetail = async (id: number): Promise<SurahDetail> => {
  // 1. Check in-memory L1 cache (0ms instant)
  if (surahDetailCache.has(id)) {
    return surahDetailCache.get(id)!;
  }

  // 2. Return in-flight request if already loading
  if (pendingSurahRequests.has(id)) {
    return pendingSurahRequests.get(id)!;
  }

  const fetchPromise = (async () => {
    const cacheKey = `quran-surah-detail-${id}`;
    
    // Check IndexedDB
    try {
      const cached = await fastStorage.get<SurahDetail>(cacheKey);
      if (cached && cached.ayahs && cached.ayahs.length > 0) {
        cached.ayahs.forEach((a: any) => {
          if (!a.surahNumber && cached.number) a.surahNumber = cached.number;
          if (!a.surahName && cached.englishName) a.surahName = cached.englishName;
        });
        surahDetailCache.set(id, cached);
        return cached;
      }
    } catch {}

    // Fetch Arabic (quran-uthmani), English (en.asad), Urdu (ur.jalandhry), and Audio (ar.alafasy)
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${id}/editions/quran-uthmani,en.asad,ur.jalandhry,ar.alafasy`);
    
    if (!response.ok) throw new Error('Failed to fetch surah details');
    
    const json = await safeJson(response);
    const data = json.data;
    
    const arabicData = data[0];
    const englishData = data[1];
    const urduData = data[2];
    const audioData = data[3];

    const ayahs: Ayah[] = arabicData.ayahs.map((ayah: any, index: number) => {
      let text = ayah.text;
      // Strip Bismillah from the first ayah of every surah except Surah 1 and Surah 9
      if (arabicData.number !== 1 && arabicData.number !== 9 && ayah.numberInSurah === 1) {
        text = text.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, '');
        text = text.replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/, '');
      }

      return {
        numberInSurah: ayah.numberInSurah,
        surahNumber: arabicData.number,
        surahName: arabicData.englishName,
        text: text,
        translationEn: englishData.ayahs[index]?.text || '',
        translationUr: urduData.ayahs[index]?.text || '',
        audio: audioData.ayahs[index]?.audio,
      };
    });

    const result: SurahDetail = {
      number: arabicData.number,
      name: arabicData.name,
      englishName: arabicData.englishName,
      englishNameTranslation: arabicData.englishNameTranslation,
      revelationType: arabicData.revelationType,
      numberOfAyahs: arabicData.numberOfAyahs,
      ayahs,
    };
    
    surahDetailCache.set(id, result);
    fastStorage.set(cacheKey, result);

    // Opportunistically prefetch adjacent surah in background idle time
    if (id < 114) {
      prefetchSurah(id + 1);
    }

    return result;
  })();

  pendingSurahRequests.set(id, fetchPromise);
  try {
    return await fetchPromise;
  } finally {
    pendingSurahRequests.delete(id);
  }
};

export const fetchJuzDetail = async (id: number): Promise<JuzDetail> => {
  if (juzDetailCache.has(id)) return juzDetailCache.get(id)!;
  if (pendingJuzRequests.has(id)) return pendingJuzRequests.get(id)!;

  const fetchPromise = (async () => {
    const cacheKey = `quran-juz-detail-${id}`;
    try {
      const cached = await fastStorage.get<JuzDetail>(cacheKey);
      if (cached && cached.ayahs && cached.ayahs.length > 0) {
        cached.ayahs.forEach((a: any) => {
          if (!a.surahNumber && a.surah?.number) a.surahNumber = a.surah.number;
          if (!a.surahName && a.surah?.englishName) a.surahName = a.surah.englishName;
        });
        juzDetailCache.set(id, cached);
        return cached;
      }
    } catch {}

    const [arabicResponse, englishResponse, urduResponse, audioResponse] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/juz/${id}/quran-uthmani`),
      fetch(`https://api.alquran.cloud/v1/juz/${id}/en.asad`),
      fetch(`https://api.alquran.cloud/v1/juz/${id}/ur.jalandhry`),
      fetch(`https://api.alquran.cloud/v1/juz/${id}/ar.alafasy`)
    ]);
    
    if (!arabicResponse.ok || !englishResponse.ok || !urduResponse.ok || !audioResponse.ok) {
      throw new Error('Failed to fetch juz details');
    }
    
    const [arabicJson, englishJson, urduJson, audioJson] = await Promise.all([
      safeJson(arabicResponse),
      safeJson(englishResponse),
      safeJson(urduResponse),
      safeJson(audioResponse)
    ]);
    
    const arabicData = arabicJson.data;
    const englishData = englishJson.data;
    const urduData = urduJson.data;
    const audioData = audioJson.data;

    let ayahs: Ayah[] = arabicData.ayahs.map((ayah: any, index: number) => {
      let text = ayah.text;
      const sNum = ayah.surah?.number || arabicData.number;
      
      // Strip Bismillah from the first ayah of every surah except Surah 1 and Surah 9
      if (sNum !== 1 && sNum !== 9 && ayah.numberInSurah === 1) {
        text = text.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, '');
        text = text.replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/, '');
      }

      return {
        numberInSurah: ayah.numberInSurah,
        surahNumber: sNum,
        surahName: ayah.surah?.englishName || 'Unknown',
        text: text,
        translationEn: englishData.ayahs[index]?.text || '',
        translationUr: urduData.ayahs[index]?.text || '',
        audio: audioData.ayahs[index]?.audio,
      };
    });

    // Handle Juz 20 and 21 boundary override
    if (id === 20) {
      ayahs.pop();
    } else if (id === 21) {
      try {
        const singleAyahRes = await fetch(`https://api.alquran.cloud/v1/ayah/29:45/editions/quran-uthmani,en.asad,ur.jalandhry,ar.alafasy`);
        const singleAyahJson = await safeJson(singleAyahRes);
        if (singleAyahJson.data) {
          const d = singleAyahJson.data;
          const missingAyah: Ayah = {
            numberInSurah: d[0].numberInSurah,
            surahNumber: d[0].surah.number,
            surahName: d[0].surah.englishName,
            text: d[0].text,
            translationEn: d[1].text,
            translationUr: d[2].text,
            audio: d[3].audio
          };
          ayahs.unshift(missingAyah);
        }
      } catch (e) {
        console.error("Failed to fetch ayah 29:45 for Juz 21", e);
      }
    }

    const result: JuzDetail = {
      number: arabicData.number,
      ayahs,
    };
    
    juzDetailCache.set(id, result);
    fastStorage.set(cacheKey, result);

    if (id < 30) {
      prefetchJuz(id + 1);
    }

    return result;
  })();

  pendingJuzRequests.set(id, fetchPromise);
  try {
    return await fetchPromise;
  } finally {
    pendingJuzRequests.delete(id);
  }
};

// Background idle-time prefetch helpers
export function prefetchSurah(id: number) {
  if (surahDetailCache.has(id) || pendingSurahRequests.has(id)) return;
  const runner = () => {
    fetchSurahDetail(id).catch(() => {});
  };
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(runner, { timeout: 3000 });
  } else {
    setTimeout(runner, 1000);
  }
}

export function prefetchJuz(id: number) {
  if (juzDetailCache.has(id) || pendingJuzRequests.has(id)) return;
  const runner = () => {
    fetchJuzDetail(id).catch(() => {});
  };
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(runner, { timeout: 3000 });
  } else {
    setTimeout(runner, 1500);
  }
}
