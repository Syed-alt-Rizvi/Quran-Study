/**
 * Arabic Font Family mapping and typography utilities for Quran and Mafatih
 * Guarantees proper fallback stacks, system font coverage, and prevents
 * browser font-metric overlap bugs or broken diacritics when web fonts fail to load.
 */

// Bulletproof system fallbacks across platforms:
// macOS/iOS: "Geeza Pro", "Damascus", "DecoType Naskh"
// Windows: "Traditional Arabic", "Simplified Arabic", "Arabic Typesetting"
// Android/Linux: "Noto Naskh Arabic", "Droid Arabic Naskh"
const SYSTEM_ARABIC_FALLBACK = '"Noto Naskh Arabic", "Geeza Pro", "Traditional Arabic", "Simplified Arabic", "Arabic Typesetting", "Arial", serif';
const SYSTEM_NASTALIQ_FALLBACK = '"Noto Nastaliq Urdu", "Urdu Typesetting", "Jameel Noori Nastaleeq", "Nafees Nastaleeq", "Noto Naskh Arabic", serif';

export function getArabicFontFamily(fontId?: string): string {
  switch (fontId) {
    case 'Uthmani':
      // Standard Mushaf Hafs style: Amiri Quran with fallback to Amiri & system Naskh
      return `"Amiri Quran", "Amiri", "Scheherazade New", ${SYSTEM_ARABIC_FALLBACK}`;
    case 'IndoPak':
      // Subcontinent Nastaliq / IndoPak Quran script with proper Urdu typography fallbacks
      return `"Noto Nastaliq Urdu", ${SYSTEM_NASTALIQ_FALLBACK}`;
    case 'Scheherazade New':
      // Modern elegant calligraphy
      return `"Scheherazade New", "Amiri", ${SYSTEM_ARABIC_FALLBACK}`;
    case 'Lateef':
      // Fluid curving Arabic script
      return `"Lateef", "Scheherazade New", "Amiri", ${SYSTEM_ARABIC_FALLBACK}`;
    case 'Amiri':
    default:
      // Traditional classical Naskh
      return `"Amiri", "Amiri Quran", "Scheherazade New", ${SYSTEM_ARABIC_FALLBACK}`;
  }
}

/**
 * Returns standard CSS style object for Quranic Arabic text blocks:
 * Enforces text direction, line-height appropriate for multi-level diacritics,
 * and font-feature-settings for ligatures and kerning.
 */
export function getArabicTypographyStyles(fontSize: number, fontId?: string): React.CSSProperties {
  return {
    fontSize: `${fontSize}px`,
    fontFamily: getArabicFontFamily(fontId),
    lineHeight: fontId === 'IndoPak' ? '2.8' : '2.4',
    direction: 'rtl',
    unicodeBidi: 'isolate',
    fontFeatureSettings: '"liga" 1, "calt" 1, "dlig" 1',
    textRendering: 'optimizeLegibility',
  };
}
