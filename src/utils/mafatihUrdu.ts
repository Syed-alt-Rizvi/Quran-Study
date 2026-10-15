// Canonical Urdu Localization Engine for Mafatih Al-Jinan
// Provides authentic, traditional Urdu titles, categories, and UI translations for all supplications

export const KNOWN_MAFATIH_URDU_TITLES: Record<string, string> = {
  // Core beloved supplications & ziyaraat
  maf_dua40: 'دعائے کمیل',
  'dua-kumayl': 'دعائے کمیل',
  kumayl: 'دعائے کمیل',
  kumail: 'دعائے کمیل',

  maf_ziy86: 'زیارتِ عاشورہ',
  'ziyarat-ashura': 'زیارتِ عاشورہ',
  ashura: 'زیارتِ عاشورہ',

  maf_dua51: 'دعائے توسل',
  'dua-tawassul': 'دعائے توسل',
  tawassul: 'دعائے توسل',

  h_kisa: 'حدیثِ کساء',
  'hadith-kisa': 'حدیثِ کساء',
  'h-kisa': 'حدیثِ کساء',
  kisa: 'حدیثِ کساء',

  maf_ziy126a: 'دعائے ندبہ',
  'dua-nudbah': 'دعائے ندبہ',
  nudbah: 'دعائے ندبہ',
  nudba: 'دعائے ندبہ',

  maf_dua46b: 'دعائے فرج (عظم البلاء)',
  'dua-faraj': 'دعائے فرج (عظم البلاء)',
  faraj: 'دعائے فرج',

  maf_ziy128: 'دعائے عہـد',
  'dua-al-ahd': 'دعائے عہـد',
  'dua-ahd': 'دعائے عہـد',
  ahad: 'دعائے عہـد',

  maf_ziy73a: 'زیارتِ وارثہ',
  'ziyarat-waritha': 'زیارتِ وارثہ',
  waritha: 'زیارتِ وارثہ',

  maf_ziy92: 'زیارتِ اربعین',
  'ziyarat-arbaeen': 'زیارتِ اربعین',
  arbaeen: 'زیارتِ اربعین',

  maf_ziy124: 'زیارتِ آلِ یاسین',
  'ziyarat-ale-yasin': 'زیارتِ آلِ یاسین',

  maf_ziy134a: 'زیارتِ امین اللہ',
  'ziyarat-ameenullah': 'زیارتِ امین اللہ',

  maf_ziy132: 'الزیارۃ الجامعۃ الکبیرہ (زیارتِ جامعۂ کبیرہ)',
  'ziyarat-jamiah-kabirah': 'زیارتِ جامعۂ کبیرہ',

  maf_ziy131: 'زیارتِ جامعۂ صغیرہ',
  nahiya: 'زیارتِ ناحیہ مقدّسہ',
  'ziyarat-nahiya': 'زیارتِ ناحیہ مقدّسہ',

  maf_ziy140a: 'زیارتِ حضرت فاطمہ معصومہ (س)',
  maf_dua39: 'دعائے صباح',
  'dua-sabah': 'دعائے صباح',
  sabah: 'دعائے صباح',

  maf_dua43: 'دعائے مشلول',
  'dua-mashlool': 'دعائے مشلول',
  mashlool: 'دعائے مشلول',

  maf_dua45: 'دعائے مجیر',
  'dua-mujeer': 'دعائے مجیر',
  mujir: 'دعائے مجیر',

  maf_aamal30: 'دعائے افتتاح',
  'dua-iftitah': 'دعائے افتتاح',
  iftitah: 'دعائے افتتاح',

  maf_dua47: 'دعائے جوشنِ کبیر',
  'dua-jawshan': 'دعائے جوشنِ کبیر',
  jawshan: 'دعائے جوشنِ کبیر',

  maf_dua48: 'دعائے جوشنِ صغیر',
  maf_dua44: 'دعائے یستشیر',
  'dua-yastasheer': 'دعائے یستشیر',

  maf_dua46: 'دعائے عدیلہ',
  'dua-adilah': 'دعائے عدیلہ',

  maf_dua41: 'دعائے سمات',
  'dua-simaat': 'دعائے سمات',

  maf_dua80: 'دعائے ابو حمزہ ثمالی',
  maf_dua62: 'دعائے مکارم الاخلاق',

  maf_ziy141: 'زیارتِ حضرت ابوالفضل العباس (ع)',
  maf_ziy141a: 'زیارتِ حضرت علی اکبر (ع)',
  maf_ziy142: 'زیارتِ شہدائے کربلا (ع)',
  maf_ziy144: 'زیارتِ سیدۃ النساء فاطمۃ الزہراء (س)',
  maf_ziy145: 'زیارتِ خاتم الانبیاء حضرت محمد مصطفیٰ (ص)',
  maf_ziy83: 'زیارتِ امیر المؤمنین علی ابن ابی طالب (ع)',
  maf_ziy138: 'زیارتِ شمس الشموس امام علی رضا (ع)',
  maf_ziy139: 'زیارتِ امام محمد تقی الجواد (ع)',
  maf_ziy135: 'زیارتِ ائمۂ بقیع (ع)',

  // 15 Whispered Prayers of Imam Zayn al-Abidin (a.s)
  sah_whis1: 'مناجاتِ اول: مناجاتِ تائبین (توبہ کرنے والوں کی مناجات)',
  sah_whis2: 'مناجاتِ دوم: مناجاتِ شاکین (شکوہ کرنے والوں کی مناجات)',
  sah_whis3: 'مناجاتِ سوم: مناجاتِ خائفین (خوفِ خدا رکھنے والوں کی مناجات)',
  sah_whis4: 'مناجاتِ چہارم: مناجاتِ راجین (امیدواروں کی مناجات)',
  sah_whis5: 'مناجاتِ پنجم: مناجاتِ راغبین (شائقین کی مناجات)',
  sah_whis6: 'مناجاتِ ششم: مناجاتِ شاکرین (شکر گزاروں کی مناجات)',
  sah_whis7: 'مناجاتِ ہفتم: مناجاتِ مطیعین (فرمانبرداروں کی مناجات)',
  sah_whis8: 'مناجاتِ ہشتم: مناجاتِ مریدین (ارادت مندوں کی مناجات)',
  sah_whis9: 'مناجاتِ نہم: مناجاتِ محبین (محبت کرنے والوں کی مناجات)',
  sah_whis10: 'مناجاتِ دہم: مناجاتِ متوسلین (توسل اختیار کرنے والوں کی مناجات)',
  sah_whis11: 'مناجاتِ یازدہم: مناجاتِ مفتقرین (محتاجوں کی مناجات)',
  sah_whis12: 'مناجاتِ دوازدہم: مناجاتِ عارفین (اہلِ معرفت کی مناجات)',
  sah_whis13: 'مناجاتِ سیزدہم: مناجاتِ ذاکرین (ذکر کرنے والوں کی مناجات)',
  sah_whis14: 'مناجاتِ چہاردہم: مناجاتِ معتصمین (پناہ مانگنے والوں کی مناجات)',
  sah_whis15: 'مناجاتِ پانزدہم: مناجاتِ زاہدین (اہلِ زہد کی مناجات)',

  // Daily Taqibaat
  maf_dua1: 'عمومی تعقیباتِ نماز',
  maf_dua2: 'تعقیباتِ نمازِ فجر (صبح)',
  maf_dua3: 'تعقیباتِ نمازِ ظہر',
  maf_dua3a: 'تعقیباتِ نمازِ عصر',
  maf_dua4: 'تعقیباتِ نمازِ مغرب',
  maf_dua5: 'تعقیباتِ نمازِ عشاء',

  // Aamaal
  maf_aamal88: 'اعمالِ شبِ قدر',
  maf_aamal91: 'اعمالِ روزِ جمعہ',
};

// Word translation dictionary for algorithmic Urdu title construction
const URDU_WORD_REPLACEMENTS: [RegExp, string][] = [
  [/^Dua\s+e\s+/i, 'دعائے '],
  [/^Dua\s+al-?/i, 'دعائے '],
  [/^Dua\s+of\s+/i, 'دعائے '],
  [/^Dua\s+/i, 'دعائے '],
  [/^Ziyarat\s+e\s+/i, 'زیارتِ '],
  [/^Ziyarat\s+of\s+/i, 'زیارتِ '],
  [/^Ziyarat\s+al-?/i, 'زیارتِ '],
  [/^Ziyarat\s+/i, 'زیارتِ '],
  [/^Ziyarah\s+of\s+/i, 'زیارتِ '],
  [/^Ziyarah\s+/i, 'زیارتِ '],
  [/^Munajaat\s+of\s+/i, 'مناجاتِ '],
  [/^Munajaat\s+/i, 'مناجاتِ '],
  [/^Munajat\s+of\s+/i, 'مناجاتِ '],
  [/^Munajat\s+/i, 'مناجاتِ '],
  [/^Whispered\s+Prayer\s+of\s+/i, 'مناجاتِ '],
  [/^Whispered\s+Prayers?\s+/i, 'مناجاتِ '],
  [/^Aamaal\s+of\s+/i, 'اعمالِ '],
  [/^Aamaal\s+for\s+/i, 'اعمالِ '],
  [/^Aamaal\s+/i, 'اعمالِ '],
  [/^Amal\s+of\s+/i, 'اعمالِ '],
  [/^Amal\s+/i, 'اعمالِ '],
  [/^Taqibaat\s+e\s+/i, 'تعقیباتِ '],
  [/^Taqibaat\s+of\s+/i, 'تعقیباتِ '],
  [/^Taqibaat\s+/i, 'تعقیباتِ '],
  [/^Taqibat\s+e\s+/i, 'تعقیباتِ '],
  [/^Taqibat\s+/i, 'تعقیباتِ '],
  [/^Namaz\s+e\s+/i, 'نمازِ '],
  [/^Namaz\s+of\s+/i, 'نمازِ '],
  [/^Namaz\s+/i, 'نمازِ '],
  [/^Salat\s+al-?/i, 'نمازِ '],
  [/^Salat\s+of\s+/i, 'نمازِ '],
  [/^Salat\s+/i, 'نمازِ '],
  [/^Hadith\s+al-?/i, 'حدیثِ '],
  [/^Hadith\s+of\s+/i, 'حدیثِ '],
  [/^Hadith\s+/i, 'حدیثِ '],
  [/^Sahifa\s+al-?/i, 'صحیفۂ '],
  [/^Sahifa\s+/i, 'صحیفۂ '],
  [/^Supplication\s+for\s+/i, 'دعا برائے '],
  [/^Supplication\s+of\s+/i, 'دعائے '],
  [/^Supplication\s+/i, 'دعائے '],
  [/^Prayer\s+for\s+/i, 'دعا برائے '],
  [/^Prayer\s+of\s+/i, 'دعائے '],
  [/^Prayer\s+/i, 'دعائے '],

  // Specific Names & Key Terms
  [/\bImam\s+Ali\b/gi, 'امام علی (ع)'],
  [/\bImam\s+Hussain\b/gi, 'امام حسین (ع)'],
  [/\bImam\s+Husain\b/gi, 'امام حسین (ع)'],
  [/\bImam\s+Hasan\b/gi, 'امام حسن (ع)'],
  [/\bImam\s+Sajjad\b/gi, 'امام سجاد (ع)'],
  [/\bImam\s+Baqir\b/gi, 'امام باقر (ع)'],
  [/\bImam\s+Sadiq\b/gi, 'امام صادق (ع)'],
  [/\bImam\s+Kadhim\b/gi, 'امام کاظم (ع)'],
  [/\bImam\s+Reza\b/gi, 'امام علی رضا (ع)'],
  [/\bImam\s+Rida\b/gi, 'امام علی رضا (ع)'],
  [/\bImam\s+Jawad\b/gi, 'امام جواد (ع)'],
  [/\bImam\s+Hadi\b/gi, 'امام ہادی (ع)'],
  [/\bImam\s+Askari\b/gi, 'امام حسن عسکری (ع)'],
  [/\bImam\s+Mahdi\b/gi, 'امام مہدی (عج)'],
  [/\bImam\s+e\s+Zamana\b/gi, 'امامِ زمانہ (عج)'],
  [/\bAhlulbayt\b/gi, 'اہلِ بیت (ع)'],
  [/\bAhlul\s+Bayt\b/gi, 'اہلِ بیت (ع)'],
  [/\bFatimah\b/gi, 'حضرت فاطمۃ الزہراء (س)'],
  [/\bFatima\b/gi, 'حضرت فاطمۃ الزہراء (س)'],
  [/\bProphet\b/gi, 'رسولِ اکرم (ص)'],
  [/\bHoly\s+Prophet\b/gi, 'پیغمبرِ اکرم (ص)'],
  [/\bAbbas\b/gi, 'حضرت عباس (ع)'],
  [/\bAli\s+Akbar\b/gi, 'حضرت علی اکبر (ع)'],
  [/\bAli\s+Asghar\b/gi, 'حضرت علی اصغر (ع)'],
  [/\bMuslim\s+ibn\s+Aqeel\b/gi, 'حضرت مسلم بن عقیل (ع)'],
  [/\bMasumah\b/gi, 'حضرت معصومہ (س)'],
  [/\bZaynab\b/gi, 'حضرت زینب (س)'],

  // Sacred Times & Days
  [/\bLaylatul\s+Qadr\b/gi, 'شبِ قدر'],
  [/\bNight\s+of\s+Qadr\b/gi, 'شبِ قدر'],
  [/\bEve\s+of\s+Friday\b/gi, 'شبِ جمعہ'],
  [/\bFriday\b/gi, 'جمعہ'],
  [/\bThursday\b/gi, 'جمعرات'],
  [/\bWednesday\b/gi, 'بدھ'],
  [/\bTuesday\b/gi, 'منگل'],
  [/\bMonday\b/gi, 'پیر'],
  [/\bSunday\b/gi, 'اتوار'],
  [/\bSaturday\b/gi, 'ہفتہ'],
  [/\bRamadhan\b/gi, 'ماہِ رمضان'],
  [/\bRamadan\b/gi, 'ماہِ رمضان'],
  [/\bShaban\b/gi, 'ماہِ شعبان'],
  [/\bSha'ban\b/gi, 'ماہِ شعبان'],
  [/\bRajab\b/gi, 'ماہِ رجب'],
  [/\bMuharram\b/gi, 'ماہِ محرم'],
  [/\bSafar\b/gi, 'ماہِ صفر'],
  [/\bShawwal\b/gi, 'ماہِ شوال'],
  [/\bDhul\s+Hijjah\b/gi, 'ماہِ ذی الحجہ'],
  [/\bDhul\s+Qadah\b/gi, 'ماہِ ذی القعدہ'],
  [/\bEid\s+al-?Fitr\b/gi, 'عید الفطر'],
  [/\bEid\s+al-?Adha\b/gi, 'عید الاضحیٰ'],
  [/\bEid\s+al-?Ghadeer\b/gi, 'عیدِ غدیر'],
  [/\bGhadeer\b/gi, 'غدیر'],
  [/\bMab'ath\b/gi, 'عیدِ مبعث'],
  [/\bArba'een\b/gi, 'اربعین'],
  [/\bArbaeen\b/gi, 'اربعین'],
  [/\bAshura\b/gi, 'عاشورہ'],
  [/\bTasua\b/gi, 'تاسوعا'],
  [/\bArafah\b/gi, 'روزِ عرفہ'],
  [/\bArafat\b/gi, 'عرفات'],

  // Prayers
  [/\bFajr\b/gi, 'فجر'],
  [/\bSubh\b/gi, 'صبح'],
  [/\bDhuhr\b/gi, 'ظہر'],
  [/\bZuhr\b/gi, 'ظہر'],
  [/\bAsr\b/gi, 'عصر'],
  [/\bMaghrib\b/gi, 'مغرب'],
  [/\bIsha\b/gi, 'عشاء'],
  [/\bTahajjud\b/gi, 'تہجد'],
  [/\bNight\s+Prayer\b/gi, 'نمازِ شب'],
  [/\bSalat\s+al-?Layl\b/gi, 'نمازِ شب'],

  // Connecting Prepositions & Descriptors
  [/\bfor\s+the\s+Forgiveness\s+of\s+Sins\b/gi, 'برائے بخششِ گناہ'],
  [/\bfor\s+Sustenance\b/gi, 'برائے وسعتِ رزق'],
  [/\bfor\s+Repentance\b/gi, 'برائے توبہ و استغفار'],
  [/\bfor\s+Protection\b/gi, 'برائے حفاظت و امان'],
  [/\bfor\s+Healing\b/gi, 'برائے شفائے امراض'],
  [/\bfor\s+Relief\s+from\s+Distress\b/gi, 'برائے رفعِ پریشانی و غم'],
  [/\bfor\s+Debt\b/gi, 'برائے ادائے قرض'],
  [/\bfor\s+Parents\b/gi, 'برائے والدین'],
  [/\bfor\s+Children\b/gi, 'برائے اولاد'],
  [/\bfor\s+Travel\b/gi, 'برائے سفر'],
  [/\bDaily\s+Duas\b/gi, 'روزمرہ دعائیں'],
  [/\bWeekly\s+Duas\b/gi, 'ہفتہ وار دعائیں'],
  [/\bGeneral\s+Taqibaat\b/gi, 'عمومی تعقیبات'],
];

/**
 * Returns the authentic Urdu title for a Mafatih item
 */
export function getMafatihUrduTitle(id: string, englishTitle: string): string {
  const cleanId = (id || '').trim().toLowerCase();

  // 1. Check known lookup table
  if (KNOWN_MAFATIH_URDU_TITLES[cleanId]) {
    return KNOWN_MAFATIH_URDU_TITLES[cleanId];
  }

  // Check with 'dua-' or 'ziyarat-' stripped
  const strippedId = cleanId.replace(/^(maf_|dua-|ziyarat-)/, '');
  if (KNOWN_MAFATIH_URDU_TITLES[strippedId]) {
    return KNOWN_MAFATIH_URDU_TITLES[strippedId];
  }

  if (!englishTitle) return 'دعا و زیارت';

  // 2. Apply algorithmic replacements for titles
  let title = englishTitle;
  for (const [pattern, replacement] of URDU_WORD_REPLACEMENTS) {
    if (pattern.test(title)) {
      title = title.replace(pattern, replacement);
    }
  }

  return title.trim();
}

/**
 * Translates Mafatih categories into clean, traditional Urdu
 */
export function getMafatihUrduCategory(catName?: string | null): string {
  if (!catName) return 'مفاتیح الجنان';
  const c = catName.toLowerCase();

  if (c.includes('ziyarat') || c.includes('ziyaraat')) {
    return 'زیاراتِ معصومین (ع)';
  }
  if (c.includes('dua') || c.includes('supplication')) {
    return 'ادعیہ و مناجات';
  }
  if (c.includes('munajaat') || c.includes('munajat') || c.includes('whispered')) {
    return 'مناجاتِ ائمہ اطہار';
  }
  if (c.includes('aamaal') || c.includes('ritual') || c.includes('amal')) {
    return 'اعمال و عبادات';
  }
  if (c.includes('namaz') || c.includes('taqib') || c.includes('prayer')) {
    return 'تعقیباتِ نماز و صلوات';
  }
  if (c.includes('sahifa')) {
    return 'صحیفۂ سجادیہ و صحائف';
  }
  if (c.includes('baqiyaat') || c.includes('paradise')) {
    return 'باقیات الصالحات';
  }
  if (c.includes('ramadhan') || c.includes('ramadan')) {
    return 'اعمالِ ماہِ رمضان';
  }
  if (c.includes('rajab') || c.includes('shaban')) {
    return 'اعمالِ رجب و شعبان';
  }
  if (c.includes('muharram') || c.includes('safar')) {
    return 'اعمالِ محرم و صفر';
  }

  return 'مفاتیح الجنان';
}

/**
 * Converts Western digits to Eastern Urdu numerals (e.g. 12 -> ۱۲)
 */
export function toUrduNumerals(num: number | string): string {
  const urduDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (d) => urduDigits[parseInt(d, 10)] || d);
}
