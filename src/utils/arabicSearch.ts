/**
 * Comprehensive Arabic & Urdu text normalization and search engine
 * Zero dependencies, sub-millisecond execution, complete Unicode harakat stripping,
 * Alif/Yaa/Taa normalization, and Eastern/Arabic-Indic numeral conversion.
 */

// Comprehensive Unicode Harakat & Quranic Annotation Diacritics Range
// \u0610-\u061A (honorifics), \u064B-\u065F (tanween, fatha, damma, kasra, shadda, sukun),
// \u0670 (dagger alif), \u06D6-\u06DC (quranic stop signs), \u06DF-\u06E8, \u06EA-\u06ED
const ARABIC_DIACRITICS_REGEX = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u08F0-\u08FF]/g;

// Tatweel / Kashida
const TATWEEL_REGEX = /\u0640/g;

/**
 * Converts Eastern Arabic (Urdu/Persian: ۰-۹) and Arabic-Indic (٠-٩) digits to standard ASCII (0-9)
 */
export function convertEasternToArabicNumerals(input: string): string {
  if (!input) return '';
  return input
    .replace(/[٠۰]/g, '0')
    .replace(/[١۱]/g, '1')
    .replace(/[٢۲]/g, '2')
    .replace(/[٣۳]/g, '3')
    .replace(/[٤۴]/g, '4')
    .replace(/[٥۵]/g, '5')
    .replace(/[٦۶]/g, '6')
    .replace(/[٧۷]/g, '7')
    .replace(/[٨۸]/g, '8')
    .replace(/[٩۹]/g, '9');
}

/**
 * Strips all Arabic diacritics (tashkeel, harakat, sukun, tanween, dagger alif, and quranic symbols)
 */
export function stripArabicDiacritics(text: string): string {
  if (!text) return '';
  return text
    .replace(ARABIC_DIACRITICS_REGEX, '')
    .replace(TATWEEL_REGEX, '')
    .trim();
}

/**
 * Normalizes Arabic text for diacritics-insensitive, letter-variant-insensitive search:
 * - Strips all harakat / tashkeel / dagger alifs
 * - Normalizes Alif variants (أ, إ, آ, ٱ -> ا)
 * - Normalizes Taa Marbuta (ة -> ه)
 * - Normalizes Yaa / Alef Maksura (ى, ئ -> ي)
 * - Normalizes Waw with Hamza (ؤ -> و)
 * - Normalizes Persian/Urdu Kaf & Gaf (ك / ک -> ك)
 * - Normalizes Persian/Urdu Yaa (ی / ے -> ي)
 * - Removes zero-width spaces and control characters
 */
export function normalizeArabicForSearch(text: string): string {
  if (!text) return '';
  let str = stripArabicDiacritics(text);

  return str
    // Normalize Alif with Hamza, Wasla, Madda to bare Alif
    .replace(/[إأآٱ]/g, 'ا')
    // Normalize Hamza variants
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    // Normalize Taa Marbuta to Heh
    .replace(/ة/g, 'ه')
    // Normalize Alef Maksura to standard Yaa
    .replace(/ى/g, 'ي')
    // Normalize Urdu/Persian Yeh to Arabic Yaa
    .replace(/[یے]/g, 'ي')
    // Normalize Urdu/Persian Kaf to Arabic Kaf
    .replace(/ک/g, 'ك')
    // Remove zero-width non-joiners & joiners
    .replace(/[\u200B-\u200F\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes Latin / transliteration queries for fuzzy Islamic term matching:
 * e.g., 'fatiha' == 'faatiha', 'yasin' == 'yaseen', 'kumayl' == 'kumail', 'baqara' == 'baqarah'
 */
export function normalizeLatinForSearch(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[’'`\-_\.]/g, '')
    .replace(/aa/g, 'a')
    .replace(/ay/g, 'ai')
    .replace(/ey/g, 'i')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/ou/g, 'u')
    .replace(/dh/g, 'z')
    .replace(/th/g, 's')
    .replace(/kh/g, 'k')
    .replace(/gh/g, 'g')
    .replace(/sh/g, 's')
    .replace(/ah\b/g, 'a')
    .replace(/at\b/g, 'a')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Universal search query normalizer:
 * Handles digits, Arabic, Urdu, and Latin transliteration in a single unified pipeline
 */
export function normalizeSearchQuery(query: string): {
  raw: string;
  asciiDigits: string;
  normalizedArabic: string;
  normalizedLatin: string;
} {
  const raw = (query || '').trim();
  const asciiDigits = convertEasternToArabicNumerals(raw).replace(/\D/g, '');
  const normalizedArabic = normalizeArabicForSearch(raw);
  const normalizedLatin = normalizeLatinForSearch(raw);

  return {
    raw,
    asciiDigits,
    normalizedArabic,
    normalizedLatin
  };
}

/**
 * Tests whether a target text matches a user query with high tolerance for diacritics,
 * phonetic spelling, and script variants.
 */
export function matchesSearch(target: string | undefined | null, queryNormal: ReturnType<typeof normalizeSearchQuery>): boolean {
  if (!target) return false;
  if (!queryNormal.raw) return true;

  // Direct raw substring match
  if (target.toLowerCase().includes(queryNormal.raw.toLowerCase())) return true;

  // Normalized Arabic match (ignores tashkeel, alif variations, taa marbuta)
  const targetNormArabic = normalizeArabicForSearch(target);
  if (queryNormal.normalizedArabic.length > 0 && targetNormArabic.includes(queryNormal.normalizedArabic)) {
    return true;
  }

  // Normalized Latin match
  const targetNormLatin = normalizeLatinForSearch(target);
  if (queryNormal.normalizedLatin.length > 1 && targetNormLatin.includes(queryNormal.normalizedLatin)) {
    return true;
  }

  return false;
}
