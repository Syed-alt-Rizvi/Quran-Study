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

const surahMetaCache: SurahMeta[] = [];
const surahDetailCache = new Map<number, SurahDetail>();
const juzDetailCache = new Map<number, JuzDetail>();

export const fetchSurahs = async (): Promise<SurahMeta[]> => {
  if (surahMetaCache.length > 0) return surahMetaCache;
  const response = await fetch('https://api.alquran.cloud/v1/surah');
  if (!response.ok) throw new Error('Failed to fetch surahs');
  const data = await response.json();
  if (surahMetaCache.length === 0) { surahMetaCache.push(...data.data); }
  return data.data;
};

export const fetchSurahDetail = async (id: number): Promise<SurahDetail> => {
  if (surahDetailCache.has(id)) return surahDetailCache.get(id)!;
  
  // Fetch Arabic (quran-uthmani), English (en.asad), and Urdu (ur.jalandhry)
  // We use standard translations as a placeholder for Tafseer-e-Namoona.
  const response = await fetch(`https://api.alquran.cloud/v1/surah/${id}/editions/quran-uthmani,en.asad,ur.jalandhry`);
  
  if (!response.ok) throw new Error('Failed to fetch surah details');
  
  const json = await response.json();
  const data = json.data;
  
  const arabicData = data[0];
  const englishData = data[1];
  const urduData = data[2];

  const ayahs: Ayah[] = arabicData.ayahs.map((ayah: any, index: number) => ({
    numberInSurah: ayah.numberInSurah,
    surahNumber: arabicData.number,
    surahName: arabicData.englishName,
    text: ayah.text,
    translationEn: englishData.ayahs[index].text,
    translationUr: urduData.ayahs[index].text,
  }));

  const result = {
    number: arabicData.number,
    name: arabicData.name,
    englishName: arabicData.englishName,
    englishNameTranslation: arabicData.englishNameTranslation,
    revelationType: arabicData.revelationType,
    numberOfAyahs: arabicData.numberOfAyahs,
    ayahs,
  };
  
  surahDetailCache.set(id, result);
  return result;
};

export interface JuzDetail {
  number: number;
  ayahs: Ayah[];
}

export const fetchJuzDetail = async (id: number): Promise<JuzDetail> => {
  if (juzDetailCache.has(id)) return juzDetailCache.get(id)!;
  
  const [arabicResponse, englishResponse, urduResponse] = await Promise.all([
    fetch(`https://api.alquran.cloud/v1/juz/${id}/quran-uthmani`),
    fetch(`https://api.alquran.cloud/v1/juz/${id}/en.asad`),
    fetch(`https://api.alquran.cloud/v1/juz/${id}/ur.jalandhry`)
  ]);
  
  if (!arabicResponse.ok || !englishResponse.ok || !urduResponse.ok) {
    throw new Error('Failed to fetch juz details');
  }
  
  const [arabicJson, englishJson, urduJson] = await Promise.all([
    arabicResponse.json(),
    englishResponse.json(),
    urduResponse.json()
  ]);
  
  const arabicData = arabicJson.data;
  const englishData = englishJson.data;
  const urduData = urduJson.data;

  const ayahs: Ayah[] = arabicData.ayahs.map((ayah: any, index: number) => ({
    numberInSurah: ayah.numberInSurah,
    surahNumber: ayah.surah?.number || arabicData.number,
    surahName: ayah.surah?.englishName || 'Unknown',
    text: ayah.text,
    translationEn: englishData.ayahs[index].text,
    translationUr: urduData.ayahs[index].text,
  }));

  const result = {
    number: arabicData.number,
    ayahs,
  };
  
  juzDetailCache.set(id, result);
  return result;
};
