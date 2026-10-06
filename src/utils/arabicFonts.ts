/**
 * Arabic Font Family mapping and typography utilities for Quran and Mafatih
 * Guarantees proper fallback stacks and prevents browser font-metric overlap bugs
 */

export function getArabicFontFamily(fontId?: string): string {
  switch (fontId) {
    case 'Uthmani':
      // Standard Mushaf Hafs style: Amiri Quran with fallback to Amiri
      return '"Amiri Quran", "Amiri", "Scheherazade New", serif';
    case 'IndoPak':
      // Subcontinent Nastaliq / IndoPak Quran script
      return '"Noto Nastaliq Urdu", "Scheherazade New", "Amiri", serif';
    case 'Scheherazade New':
      // Modern elegant calligraphy
      return '"Scheherazade New", "Amiri", serif';
    case 'Lateef':
      // Fluid curving Arabic script
      return '"Lateef", "Amiri", serif';
    case 'Amiri':
    default:
      // Traditional classical Naskh
      return '"Amiri", "Amiri Quran", "Scheherazade New", serif';
  }
}
