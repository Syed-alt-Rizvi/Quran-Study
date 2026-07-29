const normalizeArabic = (text) => {
    return text
      .replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '') // Remove diacritics
      .replace(/ٱ/g, 'ا') // Normalize Alef Wasla
      .replace(/أ/g, 'ا') // Normalize Alef Hamza
      .replace(/إ/g, 'ا') // Normalize Alef Hamza below
      .replace(/آ/g, 'ا') // Normalize Alef Madda
      .replace(/ة/g, 'ه') // Normalize Ta Marbuta
      .replace(/ی/g, 'ي') // Normalize Farsi/Urdu Yeh
      .replace(/ى/g, 'ي') // Normalize Alef Maksura
      .replace(/\s+/g, '') // Remove spaces for robust matching
      .trim();
  };

const ayahText = "قُلْ هُوَ اللَّهُ أَحَدٌ";
const vText = "قُلْ هُوَ اللَّهُ أَحَدٌ";

const normAyah = normalizeArabic(ayahText);
const normV = normalizeArabic(vText);
console.log(normAyah, normV);
console.log(normV.includes(normAyah.substring(0, 20)) || normAyah.includes(normV.substring(0, 20)));

const bismillahQuran = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
const bismillahTafseer = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
console.log(normalizeArabic(bismillahQuran), normalizeArabic(bismillahTafseer));
console.log(normalizeArabic(bismillahQuran) === normalizeArabic(bismillahTafseer));
