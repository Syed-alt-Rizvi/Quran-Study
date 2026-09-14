
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

import staticSurahs from './surahList.json';

const surahMetaCache: SurahMeta[] = Array.isArray(staticSurahs) && staticSurahs.length === 114 ? [...(staticSurahs as SurahMeta[])] : [];
const surahDetailCache = new Map<number, SurahDetail>();
const juzDetailCache = new Map<number, JuzDetail>();

export const fetchSurahs = async (): Promise<SurahMeta[]> => {
  if (surahMetaCache.length > 0) return surahMetaCache;

  // Check offline localStorage cache first
  try {
    const cached = localStorage.getItem('shia-quran-surahs-cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length === 114) {
        surahMetaCache.push(...parsed);
        return surahMetaCache;
      }
    }
  } catch (e) {}

  try {
    const response = await fetch('https://api.alquran.cloud/v1/surah');
    if (response.ok) {
      const data = await safeJson(response);
      if (data?.data && Array.isArray(data.data)) {
        surahMetaCache.length = 0;
        surahMetaCache.push(...data.data);
        localStorage.setItem('shia-quran-surahs-cache', JSON.stringify(data.data));
      }
    }
  } catch (e) {
    console.warn("Could not fetch remote surahs list, using static:", e);
  }

  return surahMetaCache;
};

export const fetchSurahDetail = async (id: number): Promise<SurahDetail> => {
  if (surahDetailCache.has(id)) return surahDetailCache.get(id)!;
  
  const cacheKey = `quran-surah-detail-${id}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.ayahs && parsed.ayahs.length > 0) {
        // Guarantee surahNumber and surahName are populated on all ayahs
        parsed.ayahs.forEach((a: any) => {
          if (!a.surahNumber && parsed.number) a.surahNumber = parsed.number;
          if (!a.surahName && parsed.englishName) a.surahName = parsed.englishName;
        });
        surahDetailCache.set(id, parsed);
        return parsed;
      }
    }
  } catch (e) {}

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
      text = text.replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/, ''); // Fallback for standard spelling
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
  try {
    localStorage.setItem(cacheKey, JSON.stringify(result));
  } catch (e) {}

  return result;
};

export interface JuzDetail {
  number: number;
  ayahs: Ayah[];
}

export const fetchJuzDetail = async (id: number): Promise<JuzDetail> => {
  if (juzDetailCache.has(id)) return juzDetailCache.get(id)!;
  
  const cacheKey = `quran-juz-detail-${id}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.ayahs && parsed.ayahs.length > 0) {
        parsed.ayahs.forEach((a: any) => {
          if (!a.surahNumber && a.surah?.number) a.surahNumber = a.surah.number;
          if (!a.surahName && a.surah?.englishName) a.surahName = a.surah.englishName;
        });
        juzDetailCache.set(id, parsed);
        return parsed;
      }
    }
  } catch (e) {}

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
  try {
    localStorage.setItem(cacheKey, JSON.stringify(result));
  } catch (e) {}

  return result;
};
