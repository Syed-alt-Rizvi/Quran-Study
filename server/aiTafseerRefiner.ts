import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";

// Lazy initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } }
    });
  }
  return aiClient;
}

// Deep Urdu Linguistic Repair Dictionary & Morphological Rule Engine
export function cleanAndRepairUrduText(rawText: string): string {
  if (!rawText) return "";
  let t = rawText;

  // 1. Remove scan/header/watermark artifacts
  t = t.replace(/مصباح\s*القرآن\s*ٹرسٹ[^\n]*/g, "");
  t = t.replace(/جامع[ةہ]\s*الکوثر[^\n]*/g, "");
  t = t.replace(/www\.misbahulaqurantrust\.com[^\n]*/g, "");
  t = t.replace(/جلد\s*(اول|دوم|سوم|چہارم|پنجم|ششم|ہفتم|ہشتم|نہم|دہم)[^\n]*/g, "");
  t = t.replace(/الکوثر\s*فی\s*تفسیر\s*القرآن[^\n]*/g, "");
  t = t.replace(/علی\s*تن[^\n]*/g, "");
  t = t.replace(/امظای\s*امور:[^\n]*/g, "");
  t = t.replace(/[\u200B-\u200D\uFEFF]/g, "");

  // 2. Comprehensive Urdu & Arabic Phonetic & Word Approximation Map
  const regexDictionary: [RegExp, string][] = [
    // Honorifics & Holy Personalities
    [/اہول\s*خدا\s*\(س\)/g, "رسول خدا (صلی اللہ علیہ و آلہ وسلم)"],
    [/اہول\s*خدا/g, "رسول خدا (ص)"],
    [/رسول\s*خدا\s*[\(（][سص][\)）]/g, "رسول خدا (صلی اللہ علیہ و آلہ وسلم)"],
    [/رسول\s*اللہ\s*[\(（][سص][\)）]/g, "رسول اللہ (صلی اللہ علیہ و آلہ وسلم)"],
    [/آنحضرت\s*[\(（][سص][\)）]/g, "آنحضرت (صلی اللہ علیہ و آلہ وسلم)"],
    [/نبی\s*اکرم\s*[\(（][سص][\)）]/g, "نبی اکرم (صلی اللہ علیہ و آلہ وسلم)"],
    [/حضور\s*[\(（][سص][\)）]/g, "حضور اکرم (صلی اللہ علیہ و آلہ وسلم)"],
    [/امیر\s*الموسین/g, "امیر المؤمنین حضرت علی (ع)"],
    [/امیرالموسین/g, "امیر المؤمنین حضرت علی (ع)"],
    [/امیر\s*المؤمنین\s*علیہ\s*السلام/g, "امیر المؤمنین حضرت علی (ع)"],
    [/امیرالمؤمنین\s*علیہ\s*السلام/g, "امیر المؤمنین حضرت علی (ع)"],
    [/امام\s*صادی/g, "امام جعفر صادق (ع)"],
    [/امام\s*صادقیق/g, "امام جعفر صادق (ع)"],
    [/امام\s*نقر/g, "امام محمد باقر (ع)"],
    [/امام\s*باقر/g, "امام محمد باقر (ع)"],
    [/علیہ\s*الام/g, "علیہ السلام"],
    [/علیہم\s*الام/g, "علیہم السلام"],
    [/علیہ\s*العلام/g, "علیہ السلام"],
    [/علیہا\s*الام/g, "علیہا السلام"],
    [/مھم\s*السلام/g, "علیہم السلام"],
    [/خداونھالم/g, "خداوند عالم"],
    [/خداوندعالم/g, "خداوند عالم"],
    [/حطرت/g, "حضرت"],
    [/حظر\s*ت/g, "حضرت"],
    [/اللھ/g, "اللہ"],
    [/ال\s*تھا\s*ی/g, "اللہ تعالیٰ"],
    [/اللہ\s*تھا\s*لی/g, "اللہ تعالیٰ"],
    [/اللہ\s*تعا\s*لیٰ/g, "اللہ تعالیٰ"],
    [/الرَّحْمٰنِ\s*الرَّحِيْمِ/g, "الرَّحْمٰنِ الرَّحِيمِ"],
    [/بِسْمِ\s*اللّٰهِ/g, "بِسْمِ اللَّهِ"],
    [/ب\s*سم\s*اللہ/g, "بسم اللہ"],
    [/نھج\s*البلاغة/g, "نہج البلاغہ"],
    [/نهج\s*البلاغة/g, "نہج البلاغہ"],
    [/الاصلام/g, "الاسلام"],
    [/روابم/g, "روایت"],
    [/روابیت/g, "روایت"],
    [/اخیا\s*مہم\s*اللا\s*م/g, "انبیاء علیہم السلام"],

    // Common garbled phrases detected in the raw text
    [/کو\s*یفراتے\s*ناے:/g, "فرماتے ہیں:"],
    [/لد\s*گاللعزوجل\s*قَال\s*ز":\s*:ا\s*مُحمدا/g, "قال اللہ عزوجل: یا محمد!"],
    [/مھ\s*سے\s*فرمایا/g, "مجھ سے فرمایا"],
    [/اے\s*مھ\s*\(ص\)/g, "اے محمد (ص)"],
    [/بھم\s*نے\s*آ\s*پکوؿع\s*انی\s*اود\s*ق\s*رآ\s*ن\s*نیم\s*عطا\s*کیا/g, "ہم نے آپ کو سبع مثانی اور قرآن عظیم عطا کیا"],
    [/فَافْرَدَ\s*الإمقِنان\s*عَلَيٗ/g, "فَأَفْرَدَ الِامْتِنَانَ عَلَيَّ"],
    [/عثاییت\s*بفَاتِحَ/g, "عنایت فرمانے"],
    [/کےاضا\s*نکا\s*ہعدہ\s*ذکرفر\s*مایا/g, "کے احسان کا علیحدہ ذکر فرمایا"],
    [/مم\s*پل\s*ٹرار\s*دیا/g, "ہم پلہ قرار دیا"],
    [/ع\s*ٹل\s*شرَث\s*مَافِیٰ\s*كُتُورِالعَرش/g, "أَشْرَفُ مَا فِي كُنُوزِ الْعَرْشِ"],
    [/کے\s*نزانو\s*ںکی\s*سب\s*سے\s*اخمول\s*چیڑے/g, "کے خزانوں کی سب سے انمول چیز ہے"],
    [/آبت\s*:\s*آیت\s*ے\s*عرار”\s*کے\s*ےت/g, "آیت: آیت سے مراد \"نشانی\" ہے،"],
    [/میمونع\s*اور\s*الوب\s*کے\s*لیا\s*سے\s*لٹ\s*دی\s*نشانیوں\s*یس\s*سے\s*ایک\s*نثالی\s*ہے/g, "مضمون اور اسلوب کے لحاظ سے قدرت کی نشانیوں میں سے ایک نشانی ہے"],
    [/ای\s*لیے\s*اس\s*ےآ\s*بیت\s*کہا\s*گیا\s*ے/g, "اسی لیے اسے آیت کہا گیا ہے"],
    [/آ\s*ات\s*کض\s*تی\s*خی\s*ہے\s*شی\s*وی\s*خدا\s*زی\s*کے\s*فان\s*ری\s*بنا\s*ہ\s*ےک/g, "آیات کی تقسیم توقیفی ہے یعنی وحیِ خداوندی کے فرمان پر مبنی ہے کہ"],
    [/طرا\s*ی\s*کی\s*روایت\s*کے\s*ممطا\s*لی\s*رت\s*گھھمرسے\s*مروی\s*ے/g, "طبرانی کی روایت کے مطابق حضرت عمر سے مروی ہے"],
    [/قرآن\s*دں\s*لاکھ\s*\(٭٭٭٭٠۱۰\)\s*روف\s*پمشقل\s*ہے/g, "قرآن دس لاکھ (۱۰۰۰۰۰۰) حروف پر مشتمل ہے"],
    [/مروف\s*ضا\s*تب\s*ہیں/g, "حروف غائب ہیں"],
    [/خلا\s*ف\s*قش\s*ران\s*ار\s*دو\s*ےکر\s*ردکر\s*دیا\s*جاتا/g, "خلافِ قرآن قرار دے کر رد کر دیا جاتا"],
    [/رواب\s*تک\s*اس\s*بات\s*پرگھو\s*لکیا\s*گیا\s*ےکٴہ\s*یی\s*حصہ/g, "روایت کو اس بات پر محمول کیا گیا ہے کہ یہ حصہ"],
    [/قرآن\s*سے\s*مفسوخ\s*الیم\s*ہوگیا\s*سے\s*کیولکہ\s*موچجودہ\s*رن\s*بی\s*اس\s*مقار\s*کے\s*مروف\s*موجودکیں\s*ہیں/g, "قرآن سے منسوخ التلاوۃ ہو گیا ہے کیونکہ موجودہ قرآن میں اس مقدار کے حروف موجود نہیں ہیں"],
    [/کننا\s*غیرمعتول\s*مو\s*قف\s*ےک\s*ہق\s*رآ\s*ن\s*کا\s*دو\s*تپائی\s*مضسوغ\s*الیم\s*ہو\s*جائۓ\s*اورصرف\s*ایک\s*تھا\s*ی\s*بائی\s*رہ/g, "کتنا غیر معقول موقف ہے کہ قرآن کا دو تہائی منسوخ ہو جائے اور صرف ایک تہائی باقی رہے"],

    // General linguistic fixes
    [/\bت\s*ف\s*س\s*ی\s*ر\b/g, "تفسیر"],
    [/\bتفی\s*رق\s*رن\b/g, "تفسیر قرآن"],
    [/\bتفسیر\s*القر\s*آن\b/g, "تفسیر القرآن"],
    [/\bق\s*ر\s*آ\s*ن\b/g, "قرآن"],
    [/\bقرٴ\s*ن\b/g, "قرآن"],
    [/\bق\s*ر\s*ٴ\s*نی\b/g, "قرآنی"],
    [/\bس\s*و\s*ر\s*ہ\b/g, "سورہ"],
    [/\bس\s*و\s*ر\s*ۃ\b/g, "سورۃ"],
    [/\bالمبا\s*رک\s*[ةہ]\b/g, "المبارکہ"],
    [/\bآ\s*ی\s*ت\b/g, "آیت"],
    [/\bآ\s*یا\s*ت\b/g, "آیات"],
    [/\bم\s*ف\s*ر\s*دات\b/g, "مفردات"],
    [/\bمفرد\s*ات\b/g, "مفردات"],
    [/\bتش\s*ری\s*ح\b/g, "تشریح"],
    [/\bش\s*ان\s*ن\s*ز\s*ول\b/g, "شان نزول"],
    [/\bحوا\s*شی\b/g, "حواشی"],
    [/\bن\s*ک\s*ات\b/g, "نکات"],
    [/\bنک\s*ات\b/g, "نکات"],
    [/\bمباح\s*ث\b/g, "مباحث"],
    [/\bمبا\s*حث\b/g, "مباحث"],
    [/\bاحا\s*دیث\b/g, "احادیث"],
    [/\bرو\s*ایات\b/g, "روایات"],
    [/\bخلا\s*صہ\b/g, "خلاصہ"],
    [/\bملا\s*حظہ\b/g, "ملاحظہ"],
    [/\bفرما\s*ئیں\b/g, "فرمائیں"],
    [/\bفرمایا\b/g, "فرمایا"],
    [/\bحوا\s*لہ\b/g, "حوالہ"],
    [/\bفر\s*ما\s*تے\b/g, "فرماتے"],
    [/\bہو\s*تا\b/g, "ہوتا"],
    [/\bہو\s*تی\b/g, "ہوتی"],
    [/\bہو\s*تے\b/g, "ہوتے"],
    [/\bہو\s*ئے\b/g, "ہوئے"],
    [/\bسک\s*تا\b/g, "سکتا"],
    [/\bسک\s*تی\b/g, "سکتی"],
    [/\bسک\s*تے\b/g, "سکتے"],
    [/\bدر\s*ست\b/g, "درست"],
    [/\bکیو\s*نکہ\b/g, "کیونکہ"],
    [/\bکیو\s*نک\s*ہ\b/g, "کیونکہ"],
    [/\bچنان\s*چہ\b/g, "چنانچہ"],
    [/\bچنا\s*نچہ\b/g, "چنانچہ"],
    [/\bمعلو\s*م\b/g, "معلوم"],
    [/\bمفہو\s*م\b/g, "مفہوم"],
    [/\bہد\s*ایت\b/g, "ہدایت"],
    [/\bمعصو\s*مین\b/g, "معصومین"],
    [/\bت\s*و\s*ح\s*ی\s*د\b/g, "توحید"],
    [/\bن\s*ب\s*و\s*ت\b/g, "نبوت"],
    [/\bا\s*م\s*ا\s*م\s*ت\b/g, "امامت"],
    [/\bق\s*ی\s*ا\s*م\s*ت\b/g, "قیامت"]
  ];

  for (const [pat, rep] of regexDictionary) {
    t = t.replace(pat, rep);
  }

  // Clean intra-word spaced characters
  t = t.replace(/([ء-غف-ی])\s+([ء-غف-ی])\s+([ء-غف-ی])\s+([ء-غف-ی])/g, "$1$2$3$4");
  t = t.replace(/([ء-غف-ی])\s+([ء-غف-ی])\s+([ء-غف-ی])/g, "$1$2$3");

  return t;
}

// AI Semantic Refiner with Gemini 3.8 Flash & Automatic Retry
export async function refineTafseerWithGemini(
  surahNumber: number,
  ayahNumber: number,
  arabicVerse: string,
  rawUrduText: string
): Promise<{ refinedUrdu: string; refinedHtml: string }> {
  const ai = getAI();
  const baseCleaned = cleanAndRepairUrduText(rawUrduText);

  if (!ai) {
    return {
      refinedUrdu: baseCleaned,
      refinedHtml: wrapInStructuredHtml(surahNumber, ayahNumber, arabicVerse, baseCleaned)
    };
  }

  const prompt = `آپ اردو زبان، عربی علومِ قرآن اور علامہ شیخ محسن علی نجفی کی کتاب "تفسیر الکوثر" کے ماہر محقق اور پروف ریڈر ہیں۔
درج ذیل متن پی ڈی ایف سے او سی آر (OCR) کیا گیا ہے جس میں ٹائپو، ٹوٹے ہوئے حروف، غیر مروج الفاظ، اور بے معنی جوڑ موجود ہیں۔

آپ کا کام:
1. الفاظ کی لسانی اور سیاقی تصحیح (AI Approximation & Proofreading) کریں۔
2. جملوں کو سلیس، شستہ، فصیح اور باوقار اردو میں تبدیل کریں تاکہ مفہوم بالکل واضح ہو۔
3. تمام قرآنی اصطلاحات (مفردات، نکات، آیات، احادیثِ معصومین، اور مآخذ) کو ان کی صحیح صورت میں برقرار رکھیں۔
4. کوئی قرآنی تفسیری نکتہ حذف نہ کریں۔

معلومات:
سورہ نمبر: ${surahNumber}
آیت نمبر: ${ayahNumber}
عربی آیت: ${arabicVerse}

خام تفسیری متن:
"""
${baseCleaned.substring(0, 3500)}
"""

براہ کرم مکمل تصحیح شدہ، انتہائی واضح، فصیح اردو تفسیر فراہم کریں۔ غیر ضروری انگریزی یا اضافی تمہید مت لکھیں۔ براہ راست تصحیح شدہ تفسیری متن لکھیں۔`;

  try {
    let responseText = "";
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt
        });
        if (response.text) {
          responseText = response.text.trim();
          break;
        }
      } catch (err: any) {
        console.warn(`Gemini refinement attempt ${attempt} failed: ${err.message}`);
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
        }
      }
    }

    if (!responseText) {
      responseText = baseCleaned;
    }

    const html = wrapInStructuredHtml(surahNumber, ayahNumber, arabicVerse, responseText);
    return {
      refinedUrdu: responseText,
      refinedHtml: html
    };
  } catch (err: any) {
    console.error("Gemini refinement error:", err);
    return {
      refinedUrdu: baseCleaned,
      refinedHtml: wrapInStructuredHtml(surahNumber, ayahNumber, arabicVerse, baseCleaned)
    };
  }
}

export function wrapInStructuredHtml(
  surahNumber: number,
  ayahNumber: number,
  arabicVerse: string,
  urduText: string
): string {
  // Format paragraphs nicely
  const paragraphs = urduText
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const formattedParas = paragraphs
    .map((p) => `<p class="text-justify mb-3 leading-loose font-urdu text-stone-900 dark:text-stone-100">${p}</p>`)
    .join("\n");

  return `<div class="tafseer-kauthar-container font-urdu text-right leading-relaxed" dir="rtl">
  <!-- Title Header -->
  <div class="tafseer-header mb-4 pb-3 border-b border-amber-200/60 dark:border-amber-900/60">
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-bold font-serif text-amber-950 dark:text-amber-100">تفسیر الکوثر</h3>
      <span class="text-xs px-2.5 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 rounded-full font-sans font-medium">علامہ شیخ محسن علی نجفی (تصحیح شدہ)</span>
    </div>
    <p class="text-xs text-stone-500 dark:text-stone-400 mt-1">سورہ نمبر ${surahNumber} • آیت ${ayahNumber} • مفصل لسانی و فکری تشریح</p>
  </div>

  <!-- Quranic Verse Display -->
  <div class="verse-box my-4 p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/40 rounded-xl">
    <p class="font-quran text-2xl text-emerald-950 dark:text-emerald-300 leading-loose text-center mb-2">${arabicVerse}</p>
  </div>

  <!-- Main Exegesis -->
  <div class="section-box my-4">
    <h4 class="text-base font-bold text-amber-900 dark:text-amber-300 mb-2.5 pb-1 border-b border-amber-100 dark:border-amber-900/40 flex items-center gap-1.5">
      <span>💡</span> تفسیر و تشریح:
    </h4>
    <div class="text-stone-800 dark:text-stone-200 text-base leading-relaxed space-y-3">
      ${formattedParas}
    </div>
  </div>
</div>`;
}
