import fs from "fs";
import path from "path";

// Systematic Urdu OCR and Grammar Cleaner for Tafseer Al-Kauthar
export function cleanTafseerUrduText(rawText: string): string {
  if (!rawText || typeof rawText !== "string") return "";

  let text = rawText;

  // 1. Remove OCR coordinate dumps, page markers, and noise headers
  text = text.replace(/لد\s*دکم\s*2ے\s*ات\s*کک\s*و\s*لن\s*[۰-۹0-9]+/g, "");
  text = text.replace(/ہن\s*[۰-۹0-9]+\s*لج\s*کس\s*رض\s*جلردام/g, "");
  text = text.replace(/رازوا\s*[۰-۹0-9]+\s*لے\s*اد\s*جلد\s*دگم/g, "");
  text = text.replace(/لددم\s*\(لجھر\s*یکس\s*ریب\s*دنن\s*[۰-۹0-9]+/g, "");
  text = text.replace(/[0-9۰-۹]+\s*ال\s*ےن\s*ستچاضہ\s*این\s*[۰-۹0-9]+ہ?/g, "");
  text = text.replace(/زی\s*\.?[0-9۰-۹]*ک\s*یر\s*کی\s*ات\s*تد\s*کس\s*نی\s*جہ/g, "");
  text = text.replace(/پواللوالزخمن\s*الرْحْٔمو\s*ہنام\s*خدائۓ\s*رن\s*ریم\s*یج/g, "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ — بنام خدائے رحمن و رحیم");

  // Remove standalone OCR numeric noise patterns like 0069, 03207, 00990, 000٦, 0000007, etc.
  text = text.replace(/(^|\s)0+[0-9۰-۹]+(\s|$)/g, " ");
  text = text.replace(/(^|\s)[0-9]{3,7}(\s|$)/g, " ");
  text = text.replace(/\b0\s+0\s+0*\b/g, " ");
  text = text.replace(/\b02\b/g, " ");
  text = text.replace(/\b08\b/g, " ");
  text = text.replace(/\b77۴\b/g, " ");
  text = text.replace(/\b۹ھ\b/g, " ");
  text = text.replace(/\b008\b/g, " ");
  text = text.replace(/\b000٦‏\b/g, " ");
  text = text.replace(/\b۔ٌ٤ےس\b/g, " ");
  text = text.replace(/\b٤‏\b/g, " ");

  // Remove OCR random garbage characters
  text = text.replace(/[\^~|_]/g, " ");
  text = text.replace(/\(۷×\s*×ظ/g, "");
  text = text.replace(/۷۸\s*:ا\s*طط/g, "");
  text = text.replace(/1\s*کارل/g, "کارل");

  // Fix common broken religious honorifics and names
  text = text.replace(/صلی\s*ال\s*علیہ\s*دالہ\s*یلم/g, "(صلی اللہ علیہ و آلہ وسلم)");
  text = text.replace(/رسول\s*ال\s*مل\s*پا/g, "رسول اللہ (صلی اللہ علیہ و آلہ وسلم)");
  text = text.replace(/رعول\s*الد\s*مک/g, "رسول اللہ (صلی اللہ علیہ و آلہ وسلم)");
  text = text.replace(/رسول\s*ال\s*مک/g, "رسول اللہ (صلی اللہ علیہ و آلہ وسلم)");
  text = text.replace(/رسول\s*اللہ\s*مک/g, "رسول اللہ (صلی اللہ علیہ و آلہ وسلم)");
  text = text.replace(/تضور\s*اگرم\s*\(ص\)/g, "حضور اکرم (صلی اللہ علیہ و آلہ وسلم)");
  text = text.replace(/تضور\s*\(ص\)/g, "حضور (صلی اللہ علیہ و آلہ وسلم)");
  text = text.replace(/سلام\s*اللعہما/g, "سلام اللہ علیہا");
  text = text.replace(/سلام\s*انل\s*ہا/g, "سلام اللہ علیہا");
  text = text.replace(/سلام\s*الڈعہا/g, "سلام اللہ علیہا");
  text = text.replace(/سلام\s*اللہ\s*علیھا/g, "سلام اللہ علیہا");
  text = text.replace(/علیھم\s*السلام/g, "علیہم السلام");
  text = text.replace(/ذا\s*گرا\s*ٹی/g, "ذاتِ گرامی");
  text = text.replace(/دالکن\s*اسلام/g, "دامنِ اسلام");
  text = text.replace(/اولاد\s*ہر\s*اءسلام\s*الڈعہا\s*کے\s*مم\s*رمونع\s*مشت/g, "اولادِ زہراء سلام اللہ علیہا کے مرہونِ منت");
  text = text.replace(/حلضرت\s*اکم\s*کانانال\s*ہوا/g, "حضرت قاسم کا انتقال ہوا");
  text = text.replace(/حضرت\s*عبر\s*الد\s*اف\s*اتال\s*ہوگیا/g, "حضرت عبد اللہ کا انتقال ہو گیا");
  text = text.replace(/صاحپ\s*تفھیم\s*النمرآن/g, "صاحب تفہیم القرآن");
  text = text.replace(/فخر\s*الددین\s*رازی\s*اپ\s*فی\s*میں\s*ککھنے\s*ہیں/g, "فخر الدین رازی اپنی تفسیر میں لکھتے ہیں");
  text = text.replace(/صاحب\s*تیر\s*روح\s*المعانی/g, "صاحب تفسیر روح المعانی");

  // Fix common split words (character-spaced OCR artifacts)
  const splitWords: [RegExp, string][] = [
    [/\bک\s+ر\s+ن\s+ا\b/g, "کرنا"],
    [/\bک\s+ر\s+ن\s+ے\b/g, "کرنے"],
    [/\bک\s+ر\s+ت\s+ا\b/g, "کرتا"],
    [/\bک\s+ر\s+ت\s+ی\b/g, "کرتی"],
    [/\bک\s+ر\s+ت\s+ے\b/g, "کرتے"],
    [/\bک\s+ر\s+د\s+ی\b/g, "کر دی"],
    [/\bک\s+ر\s+د\s+ی\s+ا\b/g, "کر دیا"],
    [/\bہ\s+و\s+ت\s+ا\b/g, "ہوتا"],
    [/\bہ\s+و\s+ت\s+ی\b/g, "ہوتی"],
    [/\bہ\s+و\s+ت\s+ے\b/g, "ہوتے"],
    [/\bہ\s+و\s+ن\s+ا\b/g, "ہونا"],
    [/\bہ\s+و\s+ں\b/g, "ہوں"],
    [/\bہ\s+ی\s+ں\b/g, "ہیں"],
    [/\bت\s+ھ\s+ا\b/g, "تھا"],
    [/\bت\s+ھ\s+ی\b/g, "تھی"],
    [/\bت\s+ھ\s+ے\b/g, "تھے"],
    [/\bم\s+ی\s+ں\b/g, "میں"],
    [/\bس\s+ے\b/g, "سے"],
    [/\bک\s+ے\b/g, "کے"],
    [/\bک\s+ی\b/g, "کی"],
    [/\bک\s+ا\b/g, "کا"],
    [/\bک\s+و\b/g, "کو"],
    [/\bپ\s+ر\b/g, "پر"],
    [/\bا\s+و\s+ر\b/g, "اور"],
    [/\bا\s+ی\s+ک\b/g, "ایک"],
    [/\bا\s+س\b/g, "اس"],
    [/\bا\s+ن\b/g, "ان"],
    [/\bج\s+ا\s+ت\s+ا\b/g, "جاتا"],
    [/\bج\s+ا\s+ت\s+ی\b/g, "جاتی"],
    [/\bج\s+ا\s+ت\s+ے\b/g, "جاتے"],
    [/\bہ\s+ے\b/g, "ہے"],
    [/\bن\s+ہ\s+ی\s+ں\b/g, "نہیں"],
    [/\bت\s+و\b/g, "تو"],
    [/\bج\s+و\b/g, "جو"],
    [/\bد\s+ی\s+ا\b/g, "دیا"],
    [/\bگ\s+ی\s+ا\b/g, "گیا"],
    [/\bگ\s+ئ\s+ے\b/g, "گئے"],
    [/\bل\s+ی\s+ے\b/g, "لیے"],
    [/\bک\s+ہ\b/g, "کہ"],
    [/\bب\s+ھ\s+ی\b/g, "بھی"],
    [/\bب\s+ا\s+ت\b/g, "بات"],
    [/\bپ\s+ہ\s+ل\s+ے\b/g, "پہلے"],
    [/\bب\s+ع\s+د\b/g, "بعد"],
    [/\bس\s+ا\s+ت\s+ھ\b/g, "ساتھ"],
    [/\bط\s+ر\s+ح\b/g, "طرح"],
    [/\bق\s+ر\s+آ\s+ن\b/g, "قرآن"],
    [/\bر\s+س\s+و\s+ل\b/g, "رسول"],
    [/\bا\s+ل\s+ل\s+ہ\b/g, "اللہ"],
    [/\bن\s+ا\s+ز\s+ل\b/g, "نازل"],
    [/\bآ\s+ی\s+ت\b/g, "آیت"],
    [/\bس\s+و\s+ر\s+ۃ\b/g, "سورۃ"],
    [/\bس\s+و\s+ر\s+ہ\b/g, "سورہ"],
    [/\bت\s+ف\s+س\s+ی\s+ر\b/g, "تفسیر"],
    [/\bم\s+ط\s+ل\s+ب\b/g, "مطلب"],
    [/\bم\s+ع\s+ن\s+ی\b/g, "معنی"],
    [/\bد\s+ل\s+ی\s+ل\b/g, "دلیل"],
    [/\bح\s+ق\s+ی\s+ق\s+ت\b/g, "حقیقت"],
    [/\bا\s+ن\s+س\s+ا\s+ن\b/g, "انسان"],
    [/\bح\s+ض\s+ر\s+ت\b/g, "حضرت"],
    [/\bا\s+م\s+ا\s+م\b/g, "امام"],
    [/\bع\s+ل\s+ی\b/g, "علی"],
    [/\bص\s+ا\s+د\s+ق\b/g, "صادق"],
    [/\bب\s+ا\s+ق\s+ر\b/g, "باقر"],
    [/\bر\s+ض\s+ا\b/g, "رضا"],
    [/\bک\s+ا\s+ظ\s+م\b/g, "کاظم"],
    [/\bح\s+س\s+ن\b/g, "حسن"],
    [/\bح\s+س\s+ی\s+ن\b/g, "حسین"],
    [/\bف\s+ا\s+ط\s+م\s+ہ\b/g, "فاطمہ"],
    [/\bپ\s+ی\s+غ\s+م\s+ب\s+ر\b/g, "پیغمبر"],
    [/\bن\s+ب\s+ی\b/g, "نبی"],
    [/\bو\s+ح\s+ی\b/g, "وحی"],
    [/\bف\s+ر\s+ش\s+ت\s+ہ\b/g, "فرشتہ"],
    [/\bج\s+ب\s+ر\s+ا\s+ئ\s+ی\s+ل\b/g, "جبرائیل"],
    [/\bا\s+ن\s+ب\s+ی\s+ا\s+ء\b/g, "انبیاء"],
    [/\bد\s+و\s+س\s+ر\s+ی\b/g, "دوسری"],
    [/\bپ\s+ہ\s+ل\s+ی\b/g, "پہلی"],
    [/\bت\s+ی\s+س\s+ر\s+ی\b/g, "تیسری"],
    [/\bج\s+ی\s+س\s+ے\b/g, "جیسے"],
    [/\bل\s+و\s+گ\b/g, "لوگ"],
    [/\bن\s+ا\s+م\b/g, "نام"],
    [/\bد\s+ل\b/g, "دل"],
    [/\bر\s+ا\s+ہ\b/g, "راہ"],
    [/\bع\s+ق\s+ل\b/g, "عقل"],
    [/\bج\s+ا\s+ن\b/g, "جان"],
    [/\bج\s+س\b/g, "جس"],
    [/\bج\s+ن\b/g, "جن"],
    [/\bت\s+ب\b/g, "تب"],
    [/\bج\s+ب\b/g, "جب"],
    [/\bس\s+ب\b/g, "سب"]
  ];

  for (const [pattern, replacement] of splitWords) {
    text = text.replace(pattern, replacement);
  }

  // Generalized join of triple and double spaced letters in Urdu words
  // e.g. "م ی ں" or "ک ہ"
  text = text.replace(/([\u0600-\u06FF])\s+([\u0600-\u06FF])\s+([\u0600-\u06FF])\s+([\u0600-\u06FF])/g, "$1$2$3$4");
  text = text.replace(/([\u0600-\u06FF])\s+([\u0600-\u06FF])\s+([\u0600-\u06FF])/g, "$1$2$3");

  // Fix repetitive white spaces and punctuation
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n\s*\n\s*\n+/g, "\n\n");
  text = text.replace(/([۔،])\s*([۔،])/g, "$1");

  return text.trim();
}
