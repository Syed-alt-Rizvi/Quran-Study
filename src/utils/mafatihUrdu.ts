// Canonical Urdu Localization Engine for Mafatih Al-Jinan
// Provides authentic, traditional Urdu titles, categories, snippets, and UI translations for all supplications

export interface MafatihSummaryLike {
  id?: string;
  title?: string;
  mainCategory?: string;
  snippet?: string;
}

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

  // Sahifa Sajjadiyyah - Canonical Titles
  sah_supp1: 'صحیفۂ سجادیہ دعا ۱: ابتدا میں خدا کی حمد و ثناء',
  sah_supp2: 'صحیفۂ سجادیہ دعا ۲: رسولِ اکرم (ص) پر درود و صلوات',
  sah_supp3: 'صحیفۂ سجادیہ دعا ۳: حاملانِ عرش اور مقرب فرشتوں پر درود',
  sah_supp4: 'صحیفۂ سجادیہ دعا ۴: انبیاء کے پیروکاروں اور مومنین پر درود',
  sah_supp5: 'صحیفۂ سجادیہ دعا ۵: اپنے اور اپنے دوستوں کے لیے دعا',
  sah_supp6: 'صحیفۂ سجادیہ دعا ۶: صبح و شام کی دعا',
  sah_supp7: 'صحیفۂ سجادیہ دعا ۷: شدائد، مہمات اور غموں سے نجات',
  sah_supp8: 'صحیفۂ سجادیہ دعا ۸: ناپسندیدہ عادات اور برے اخلاق سے پناہ',
  sah_supp9: 'صحیفۂ سجادیہ دعا ۹: بخشش، استغفار اور مغفرت کی طلب',
  sah_supp10: 'صحیفۂ سجادیہ دعا ۱۰: بارگاہِ الٰہی میں التجا و پناہ طلبی',
  sah_supp11: 'صحیفۂ سجادیہ دعا ۱۱: انجام بخیر اور حسنِ عاقبت کی دعا',
  sah_supp12: 'صحیفۂ سجادیہ دعا ۱۲: اعترافِ گناہ اور توبہ کی توفیق',
  sah_supp13: 'صحیفۂ سجادیہ دعا ۱۳: حوائج و حاجات کی طلب',
  sah_supp14: 'صحیفۂ سجادیہ دعا ۱۴: ظلم و زیادتی کے وقت داد خواہی',
  sah_supp15: 'صحیفۂ سجادیہ دعا ۱۵: بیماری، درد اور سختیوں میں دعا',
  sah_supp16: 'صحیفۂ سجادیہ دعا ۱۶: گناہوں سے درگزر اور بخشش کی دعا',
  sah_supp17: 'صحیفۂ سجادیہ دعا ۱۷: شرِّ شیطان اور وسوسوں سے پناہ',
  sah_supp18: 'صحیفۂ سجادیہ دعا ۱۸: خطرات اور بلاؤں کے ٹل جانے پر شکر',
  sah_supp19: 'صحیفۂ سجادیہ دعا ۱۹: طلبِ باران (بارش کی دعا)',
  sah_supp20: 'صحیفۂ سجادیہ دعا ۲۰: دعائے مکارم الاخلاق و مرضی الافعال',
  sah_supp21: 'صحیفۂ سجادیہ دعا ۲۱: غم و اندوہ اور پریشانی کے وقت دعا',
  sah_supp22: 'صحیفۂ سجادیہ دعا ۲۲: تنگی، فقر اور مصیبتوں میں دعا',
  sah_supp23: 'صحیفۂ سجادیہ دعا ۲۳: عافیت، سلامتی اور شکر کی دعا',
  sah_supp24: 'صحیفۂ سجادیہ دعا ۲۴: والدین (ماں باپ) کے حق میں دعا',
  sah_supp25: 'صحیفۂ سجادیہ دعا ۲۵: اولاد اور بچوں کے حق میں دعا',
  sah_supp26: 'صحیفۂ سجادیہ دعا ۲۶: ہمسایوں اور دوستوں کے حق میں دعا',
  sah_supp27: 'صحیفۂ سجادیہ دعا ۲۷: سرحدوں کے محافظین و مجاہدین کے لیے دعا',
  sah_supp28: 'صحیفۂ سجادیہ دعا ۲۸: فزع و خوف میں اللہ کی طرف رجوع',
  sah_supp29: 'صحیفۂ سجادیہ دعا ۲۹: تنگیِ رزق اور روزی میں کشادگی کی دعا',
  sah_supp30: 'صحیفۂ سجادیہ دعا ۳۰: ادائے قرض اور مالی مشکلات سے نجات',
  sah_supp31: 'صحیفۂ سجادیہ دعا ۳۱: دعائے توبہ و انابت',
  sah_supp32: 'صحیفۂ سجادیہ دعا ۳۲: نمازِ شب کے بعد اعترافِ تقصیر',
  sah_supp33: 'صحیفۂ سجادیہ دعا ۳۳: طلبِ خیر اور استخارہ',
  sah_supp34: 'صحیفۂ سجادیہ دعا ۳۴: آزمائش اور مبتلائے گناہ کو دیکھ کر دعا',
  sah_supp35: 'صحیفۂ سجادیہ دعا ۳۵: قضائے الٰہی اور مقدر پر رضامندی',
  sah_supp36: 'صحیفۂ سجادیہ دعا ۳۶: بادل، گرج اور بجلی کے وقت دعا',
  sah_supp37: 'صحیفۂ سجادیہ دعا ۳۷: شکر گزاری میں کوتاہی کے اعتراف کی دعا',
  sah_supp38: 'صحیفۂ سجادیہ دعا ۳۸: معذرت خواہی اور عفو طلبی',
  sah_supp39: 'صحیفۂ سجادیہ دعا ۳۹: عفو و درگزر اور رحمت کی طلب',
  sah_supp40: 'صحیفۂ سجادیہ دعا ۴۰: یادِ موت اور رحلت کی دعا',
  sah_supp41: 'صحیفۂ سجادیہ دعا ۴۱: ستر و پردہ پوشی اور عیوب چھپانے کی دعا',
  sah_supp42: 'صحیفۂ سجادیہ دعا ۴۲: ختمِ قرآنِ مجید کے بعد کی دعا',
  sah_supp43: 'صحیفۂ سجادیہ دعا ۴۳: نئے چاند (ہلال) کو دیکھ کر دعا',
  sah_supp44: 'صحیفۂ سجادیہ دعا ۴۴: ورود و آغازِ ماہِ رمضان کی دعا',
  sah_supp45: 'صحیفۂ سجادیہ دعا ۴۵: وداعِ ماہِ مبارکِ رمضان کی دعا',
  sah_supp46: 'صحیفۂ سجادیہ دعا ۴۶: عید الفطر اور جمعہ کے دن کی دعا',
  sah_supp47: 'صحیفۂ سجادیہ دعا ۴۷: روزِ عرفہ کی دعا',
  sah_supp48: 'صحیفۂ سجادیہ دعا ۴۸: عید الاضحیٰ (قربان) اور جمعہ کی دعا',
  sah_supp49: 'صحیفۂ سجادیہ دعا ۴۹: مکرِ اعداء اور دشمنوں کے دفعیہ کی دعا',
  sah_supp50: 'صحیفۂ سجادیہ دعا ۵۰: خوفِ خدا اور خشیت کی دعا',
  sah_supp51: 'صحیفۂ سجادیہ دعا ۵۱: تضرع و زاری اور عاجزی کی دعا',
  sah_supp52: 'صحیفۂ سجادیہ دعا ۵۲: اصرار بر مغفرت اور الحاح کی دعا',
  sah_supp53: 'صحیفۂ سجادیہ دعا ۵۳: بارگاہِ الٰہی میں کسرِ نفسی و تذلل',
  sah_supp54: 'صحیفۂ سجادیہ دعا ۵۴: غم و پریشانی اور اندوہ کے خاتمے کی دعا',
  sah_supp55: 'صحیفۂ سجادیہ دعا ۵۵: تسبیح و تمجیدِ پروردگار',
  sah_supp56: 'صحیفۂ سجادیہ دعا ۵۶: تمجید و تقدیسِ الٰہی',
  sah_supp57: 'صحیفۂ سجادیہ دعا ۵۷: آلِ محمد (ع) کے ذکر کی دعا',
  sah_supp58: 'صحیفۂ سجادیہ دعا ۵۸: درود بر رسول (ص) و آلِ رسول (ع)',
  sah_supp59: 'صحیفۂ سجادیہ دعا ۵۹: بلاؤں میں دعا اور طلبِ عافیت',
  sah_supp60: 'صحیفۂ سجادیہ دعا ۶۰: جس چیز سے ڈر ہو اس کے دفعیہ کی دعا',
  sah_supp61: 'صحیفۂ سجادیہ دعا ۶۱: بارگاہِ ربوبیت میں عاجزی و خاکساری',
  sah_day1: 'دعائے روزِ اتوار (صحیفۂ سجادیہ)',
  sah_day2: 'دعائے روزِ پیر (صحیفۂ سجادیہ)',
  sah_day3: 'دعائے روزِ منگل (صحیفۂ سجادیہ)',
  sah_day4: 'دعائے روزِ بدھ (صحیفۂ سجادیہ)',
  sah_day5: 'دعائے روزِ جمعرات (صحیفۂ سجادیہ)',
  sah_day6: 'دعائے روزِ جمعہ (صحیفۂ سجادیہ)',
  sah_day7: 'دعائے روزِ ہفتہ (صحیفۂ سجادیہ)',

  // Daily Taqibaat & Essential Aamaal
  maf_dua1: 'عمومی تعقیباتِ نماز',
  maf_dua2: 'تعقیباتِ نمازِ فجر (صبح)',
  maf_dua3: 'تعقیباتِ نمازِ ظہر',
  maf_dua3a: 'تعقیباتِ نمازِ عصر',
  maf_dua4: 'تعقیباتِ نمازِ مغرب',
  maf_dua5: 'تعقیباتِ نمازِ عشاء',
  maf_dua6: 'تعقیباتِ نمازِ فجر (روایت دوم)',
  dua_after: 'تعقیبات و دعائے بعد از نماز',
  maf_aamal88: 'اعمالِ شبِ قدر',
  maf_aamal91: 'اعمالِ روزِ جمعہ',
  maf_aamal70: 'نماز و اعمالِ عید الفطر',
  maf_baqe47: 'فضیلت و برکاتِ نمازِ شب (تہجد)',
  maf_baqe48: 'طریقۂ نمازِ شب (تہجد)',
  maf_baqe48a: 'مختصر طریقۂ نمازِ شب',
  nam_ayat: 'نمازِ آیات',
  maf_dua4a: 'نمازِ غفیلہ',
  maf_dua20: 'نمازِ کاملہ',
  maf_baqe246: 'طریقۂ نمازِ میت',
  nam_nawafil: 'نوافلِ یومیہ (مستحب نمازیں)',
  maf_baqe74: 'نمازِ وحشت (لیلة الدفن)',
  maf_baqe76: 'نمازِ مغفرت برائے والدین',
  maf_dua26: 'نمازِ حضرت جعفرِ طیار (ع)',
  maf_baqe73: 'نمازِ ہدیۂ معصومین (ع)',
  maf_baqe49: 'نافلۂ نمازِ فجر',
  maf_dua21: 'نمازِ رسولِ خدا حضرت محمد مصطفیٰ (ص)',
  maf_dua22: 'نمازِ امیر المؤمنین حضرت علی (ع)',
  maf_dua23: 'نمازِ سیدۃ النساء فاطمۃ الزہراء (س)',
  maf_dua24: 'نمازِ امام حسن مجتبیٰ (ع)',
  maf_dua24b: 'نمازِ سید الشہداء امام حسین (ع)',
  maf_dua24f: 'نمازِ امام محمد باقر (ع)',
  maf_dua24h: 'نمازِ امام جعفر صادق (ع)',
  maf_dua24n: 'نمازِ امام محمد تقی الجواد (ع)',
  maf_dua24p: 'نمازِ امام علی نقی الہادی (ع)',
};

// Structural Regex Patterns
const STRUCTURAL_PATTERNS: [RegExp, string][] = [
  // Sahifa Fatemiyyah titles
  [/^(\d+)\.\s*Her\s+supplications?\s+in\s+glorification\s+of\s+(Almighty\s+)?Allah\s+on\s+the\s+third\s+of\s+the\s+month/i, '$1. دعائے تسبیح و تمجیدِ الٰہی در روزِ سوم ماہ (سیدہ فاطمہ س)'],
  [/^(\d+)\.\s*Her\s+supplications?\s+in\s+glorification\s+of\s+(Almighty\s+)?Allah/i, '$1. دعائے تسبیح و تمجیدِ پروردگار (سیدہ فاطمہ س)'],
  [/^(\d+)\.\s*Her\s+supplications?\s+in\s+praise\s+of\s+Allah,?\s*(the\s+)?Mighty\s+and\s+Sublime,?\s*(by\s+mention\s+of\s+His\s+qualities)?/i, '$1. دعائے حمد و صفاتِ الٰہی (سیدہ فاطمہ س)'],
  [/^(\d+)\.\s*Her\s+supplications?\s+seeking\s+mediation\s+of\s+the\s+names\s+of\s+Allah/i, '$1. دعائے توسل بہ اسمائے حسنیٰ (سیدہ فاطمہ س)'],
  [/^(\d+)\.\s*Her\s+supplications?\s+invoking\s+blessings\s+on\s+the\s+Prophet\s+and\s+his\s+progeny/i, '$1. دعائے صلوات بر پیغمبر (ص) و آلِ پیغمبر (سیدہ فاطمہ س)'],
  [/^(\d+)\.\s*Her\s+supplications?\s+seeking\s+forgiveness\s+of\s+sins\s+after\s+Prayer\s+on\s+Wednesday\s+night/i, '$1. دعائے طلبِ مغفرت بعد از نمازِ شبِ بدھ (سیدہ فاطمہ س)'],
  [/^(\d+)\.\s*Her\s+supplications?\s+for\s+all\s+the\s+issues\s+of\s+the\s+world\s+and\s+the\s+hereafter/i, '$1. دعائے حوائجِ دنیا و آخرت (سیدہ فاطمہ س)'],
  [/^(\d+)\.\s*Her\s+supplications?\s+seeking\s+noble\s+morals/i, '$1. دعائے مکارم الاخلاق (سیدہ فاطمہ س)'],
  [/^(\d+)\.\s*Her\s+supplications?\s+for\s+exaltation\s+of\s+issues\s+and\s+noble\s+morals/i, '$1. دعائے علوِ مراتب و مکارم الاخلاق (سیدہ فاطمہ س)'],
  [/^(\d+)\.\s*Her\s+supplications?\s+seeking\s+relief\s+and\s+dispelling\s+sorrow/i, '$1. دعائے رفعِ غم و کشائشِ امور (سیدہ فاطمہ س)'],
  [/^(\d+)\.\s*Her\s+supplications?\s+regarding\s+divine\s+praise\s+for\s+seeking\s+fulfillment\s+of\s+needs/i, '$1. دعائے حمد برائے برآوردہ ہونے حاجات (سیدہ فاطمہ س)'],
  [/^(\d+)\.\s*Her\s+supplications?\s+after\s+ritual\s+Prayer\s+seeking\s+relief\s+from\s+sorrow\s+and\s+grief/i, '$1. دعائے بعد از نماز برائے دفعِ حزن و ملال (سیدہ فاطمہ س)'],
  [/^(\d+)\.\s*Her\s+supplications?\s+for\s+important\s+matters\s+and\s+for\s+removal\s+of\s+grief/i, '$1. دعائے مہمات و رفعِ اندوہ (سیدہ فاطمہ س)'],
  [/^(\d+)\.\s*Her\s+supplications?\s+for\s+repayment\s+of\s+debts\s+and\s+ease\s+in\s+matters/i, '$1. دعائے ادائے قرض و تسہیلِ امور (سیدہ فاطمہ س)'],
  [/^(\d+)\.\s*Her\s+supplications?\s+for\s+/i, '$1. دعائے سیدہ فاطمہ (س) برائے '],
  [/^(\d+)\.\s*Her\s+supplications?\s+/i, '$1. دعائے سیدہ فاطمہ (س): '],
  [/Her\s+supplications?\s+for\s+/i, 'دعائے سیدہ فاطمہ (س) برائے '],
  [/Her\s+supplications?\s+/i, 'دعائے سیدہ فاطمہ (س) '],

  // Sahifa Mahdiyyah phrases
  [/The\s+Qunut\s+of\s+our\s+Master,?\s*The\s+Proof\s*\(a\.t\.f\.s\.\)/i, 'قنوتِ مولائے ما حضرت حجت و امامِ عصر (عج)'],
  [/Imam\'?s?\s*\(a\.t\.f\.s\.\)\s*prayer/i, 'نمازِ حضرت امام مہدی (عج)'],
  [/Prayer\s+in\s+the\s+sacred\s+mosque\s+of\s+Jamkaran/i, 'نمازِ مسجدِ مقدس جمکران'],
  [/Prayer\s+of\s+relief\s+and\s+It\'?s\s+Supplication/i, 'نمازِ فرج اور اس کی دعا'],
  [/Prayer\s+seeking\s+for\s+His\s+help\s*\(a\.t\.f\.s\.\)/i, 'نمازِ استغاثہ بہ حضرت امام مہدی (عج)'],
  [/Prayer\s+for\s+concentration/i, 'نماز برائے یکسوئی و حضورِ قلب'],
  [/Dedication\s+of\s+Prayer\s+to\s+Him\s*\(a\.t\.f\.s\.\)\s*on\s+Thursdays/i, 'ہدیۂ نماز بہ امامِ عصر (عج) در روزِ جمعرات'],
  [/Prayer\s+for\s+request\s+on\s+Friday\s+Night/i, 'نماز برائے طلبِ حاجت در شبِ جمعہ'],
  [/Supplication\s+For\s+Him\s*\(May\s+Our\s+Souls\s+Be\s+Sacrifice\s+For\s+Him\)\s*After\s+The\s+Obligatory\s+Prayers/i, 'دعائے سلامتیِ امامِ زمانہ (عج) بعد از نمازِ پنجگانہ'],
  [/Supplication\s+For\s+Him\s*\(May\s+Our\s+Souls\s+Be\s+Sacrifice\s+For\s+Him\)\s*After\s+Evening\s+Compulsory\s+Prayers/i, 'دعائے سلامتیِ امامِ عصر (عج) بعد از نمازِ مغرب و عشاء'],
  [/Supplication\s+To\s+Be\s+Offered\s+After\s+The\s+Compulsory\s+Prayers,?\s*It\s+Make\s+One\s+Victorious\s+In\s+Meeting\s+With\s+The\s+Imam\s*\(May\s+Our\s+Souls\s+Be\s+Sacrifice\s+For\s+Him\)/i, 'دعائے بعد از نمازِ واجب برائے شرفِ زیارتِ امامِ عصر (عج)'],
  [/Supplications\s+To\s+Witness\s+The\s+Imam/i, 'دعائیں برائے توفیقِ زیارت و دیدارِ امامِ زمانہ (عج)'],
  [/The\s+Supplication\s+After\s+Dawn\s+Prayer\s*\(Subh\)/i, 'دعائے بعد از نمازِ صبح'],
  [/Supplication\s+For\s+Him\s*\(Peace\s+Be\s+Upon\s+Him\)\s*After\s+Dawn\s+Prayer\s*\(Subh\)/i, 'دعائے سلامتیِ امامِ عصر (عج) بعد از نمازِ صبح'],
  [/The\s+Supplication\s+Teaches\s+By\s+Imam\s+Of\s+The\s+Time\s*\(Peace\s+Be\s+Upon\s+Him\)\s+To\s+A\s+Man\s+For\s+Impelling\s+Difficulties/i, 'دعائے تعلیم کردہ امامِ زمانہ (عج) برائے کشائشِ مشکلات'],
  [/Supplication\s+For\s+Quick\s+Relief\s+Of\s+The\s+Imam\s*\(Peace\s+Be\s+Upon\s+Him\)\s+After\s+Noon\s+Prayer/i, 'دعائے تعجیلِ فرجِ امامِ عصر (عج) بعد از نمازِ ظہر'],
  [/Supplication\s+For\s+His\s+Reappearance/i, 'دعائے تعجیل در فرج و ظہورِ امامِ زمانہ (عج)'],
  [/Preservation\s+For\s+Our\s+Master,?\s*al\s+Qaim/i, 'دعائے حفظ و سلامتیِ مولا حضرت قائم آلِ محمد (عج)'],
  [/How\s+To\s+Write\s+Letter\s+To\s+Our\s+Master/i, 'طریقۂ عریضہ نویسی برائے بارگاہِ امامِ زمانہ (عج)'],
  [/In\s+The\s+Holy\s+Tunnel/i, 'در سردابِ مقدس (سامراء)'],
  [/Holy\s+Tunnel/i, 'سردابِ مقدس'],

  // Ehraam / Hajj / Ziyarat rules
  [/Obligations\s+of\s+Ehraam/i, 'واجباتِ احرام (حج و عمرہ)'],
  [/Recommendations\s+of\s+Ehraam\s+till\s+halting\s+at\s+Arafah/i, 'مستحباتِ احرام تا وقوفِ عرفات'],
  [/Recommendations\s+of\s+Ehraam/i, 'مستحبات و آدابِ احرام'],
  [/Prohibitions\s+of\s+Ehraam/i, 'محرماتِ احرام (جن سے پرہیز لازم ہے)'],
  [/Obligations\s+of\s+Tawaf/i, 'واجباتِ طوافِ خانۂ کعبہ'],
  [/Recommendations\s+of\s+Tawaf/i, 'مستحباتِ طوافِ خانۂ کعبہ'],
  [/Obligations\s+of\s+Say/i, 'واجباتِ سعی بین الصفا والمروہ'],

  // Istikharah titles
  [/Istikharah\s+fom\s+Holy\s+Quran/i, 'استخارہ بذریعۂ قرآنِ مجید'],
  [/Prayer\s+of\s+Istikharah\s+with\s+Sheets/i, 'نماز و استخارہ ذات الرقاع (پرچوں سے)'],
  [/Istikharah\s+with\s+Rosary\s*\(Tasbeeh\)\s*attributed\s+to\s+Imam\s+Mahdi\s*\(a\)/i, 'استخارہ بذریعۂ تسبیح منسوب بہ امامِ زمانہ (عج)'],
  [/Istikharah\s+of\s+the\s+author\s+of\s+Al\s+Jawahir/i, 'طریقۂ استخارہ صاحبِ جواہر الکلام'],
  [/Tafa\"?Ul\s+and\s+Istikharah/i, 'تفاؤل بالقرآن اور استخارہ'],
  [/Numerical\s+Istikharah/i, 'عددی استخارہ'],
  [/Appearing\s+Istikharah\s+for\s+Others/i, 'دوسروں کے لیے استخارہ کرنے کا طریقہ'],
  [/The\s+time\s+of\s+Istikharah/i, 'ساعات و اوقاتِ استخارہ'],
  [/1st\s+Istikharah\s*\(Requesting\s+For\s+What\s+Is\s+Best\)\s*Using\s+chaplets/i, 'استخارہ اول بذریعۂ تسبیح برائے طلبِ خیر'],
  [/2nd\s+Istikharah\s+With\s+Champlet/i, 'استخارہ دوم بذریعۂ تسبیح'],

  // Shrines & Journeys
  [/Etiquettes?\s+to\s+be\s+observed\s+during\s+Journey\s+to\s+Imam\s+Husain\'?s?\s*\(a\)\s+tomb\s+and\s+inside\s+his\s+Holy\s+Shrine/i, 'آدابِ سفر و حاضری در روضۂ اقدسِ امام حسین (ع)'],
  [/Permission\s+to\s+enter\s+Holy\s+Shrine\s+of\s+/i, 'اذنِ دخول برائے حرمِ مطہرِ '],
  [/Permission\s+to\s+enter/i, 'اذنِ دخولِ حرم'],
  [/Miracles\s+Shown\s+in\s+Imam\s+Ali\s+Reza\'?s\s+Holy\s+Shrine/i, 'معجزات و کراماتِ روضۂ مطہرِ امام علی رضا (ع)'],
  [/Visitation\s+of\s+a\s+king\s+to\s+the\s+shrine\s+of\s+Imam\s+Ali\s+Reza\s*\(a\)/i, 'زیارتِ روضۂ امام علی رضا (ع) اور تاریخی واقعہ'],
  [/The\s+Holy\s+Shrine\s+of\s+the\s+Two\s+Imams/i, 'حرمِ مطہرِ امامین عسکریین (ع) در سامراء'],
  [/News\s+of\s+Safi\s+the\s+Servant\s+of\s+Imam\s+Ali\s+Naqi\s*\(a\)\s+and\s+his\s+journey\s+to\s+Mashhad/i, 'واقعۂ صفی خادمِ امام علی نقی (ع) اور سفرِ مشہد'],
  [/Verbal\s+harassment\s+to\s+a\s+female\s+pilgrim\s+talking\s+with\s+Na\s+Mahram/i, 'توجہ و آدابِ زائرینِ محترم'],

  // Evil & Protection
  [/Namaz\s+for\s+Fending\s+Off\s+Evil\s+Self\s+Inspirations/i, 'نماز برائے دفعِ وسوسہ ہائے نفس و شیطان'],
  [/Recitations\s+for\s+Fending\s+Off\s+Evil\s+Self\s+Inspirations/i, 'اذکار برائے دفعِ وسوسہ ہائے شیطانی'],
  [/Taweez\s+against\s+Satan\'?s\s+Evil\s+Insinuations/i, 'تعویذ برائے دفعِ وسوسۂ شیطان'],
  [/Taweez\s+against\s+Evil\s+Eyes?/i, 'تعویذ برائے حفاظت از چشمِ بد (نظرِ بد)'],
  [/Evil\s+Repelling\s+Prayers\s+and\s+Supplicatory\s+Amulets/i, 'دعائیں و حرز برائے دفعِ شر و بلا'],
  [/Dua\s+for\s+Repelling\s+the\s+Evil\s+of\s+Iblis/i, 'دعا برائے دفعِ شر و فتنۂ ابلیس'],
  [/Dua\s+for\s+safety\s+from\s+Fire\s+&\s+al\s+Evil\s+throughout\s+the\s+day/i, 'دعا برائے امان از آتش و ہر قسم کے شر در تمام روز'],

  // Prefix rules
  [/^Recommendation\s+of\s+reciting\s+(some\s+)?Surahs\s+of\s+the\s+Holy\s+Quran/i, 'تاکید بر تلاوتِ بعضی سورہ ہائے قرآنِ مجید'],
  [/^Recommendations?\s+of\s+/i, 'سفارشات و آدابِ '],
  [/^Recommendation\s+of\s+/i, 'سفارش و تاکیدِ '],
  [/^Importance\s+of\s+/i, 'اہمیت و فضیلتِ '],
  [/^Merits\s+of\s+/i, 'فضیلت و ثوابِ '],
  [/^Merit\s+of\s+/i, 'فضیلتِ '],
  [/^Etiquettes?\s+of\s+attending\s+Mosques/i, 'آدابِ مسجد و حاضری در مساجد'],
  [/^Etiquettes?\s+of\s+Going\s+to\s+Toilet/i, 'آدابِ تخلی و بیت الخلاء'],
  [/^Etiquettes?\s+of\s+Ziyarat/i, 'آدابِ زیارتِ مشاہدِ مشرفہ'],
  [/^Etiquettes?\s+of\s+Travel/i, 'آداب و احکامِ سفر'],
  [/^Etiquettes?\s+of\s+Journey/i, 'آداب و دعائے سفر'],
  [/^Etiquettes?\s+of\s+/i, 'آداب و سننِ '],
  [/^Cleansing\s+the\s+Teeth/i, 'مسواک اور دانتوں کی صفائی کے آداب'],
  [/^Ritual\s+Ablution\s*\(Wuzu\)/i, 'احکام و دعائے وضو'],
  [/^Aamaal\s+Between\s+Dawn\s+&\s+Sunrise/i, 'اعمالِ بین الطلوعین (فجر تا طلوعِ آفتاب)'],
  [/^Reciting\s+Subhanallah/i, 'فضیلتِ ذکرِ سبحان اللہ'],
  [/^Reciting\s+/i, 'فضیلت و تلاوتِ '],
  [/^Visiting\s+the\s+Tomb\s+of\s+/i, 'زیارتِ روضۂ مبارکِ '],
  [/^Visiting\s+the\s+Shrine\s+of\s+/i, 'زیارتِ بارگاہِ '],
  [/^Visiting\s+/i, 'زیارتِ '],
  [/^History\s+of\s+the\s+Shrine\s+of\s+/i, 'تاریخچۂ روضۂ اقدسِ '],
  [/^History\s+of\s+/i, 'تاریخِ '],
  [/^Salawat\s+upon\s+(the\s+)?Holy\s+Prophet/i, 'صلوات بر رسولِ اکرم حضرت محمد مصطفیٰ (ص)'],
  [/^Salawat\s+upon\s+/i, 'صلوات بر '],
  [/^Salawat\s+on\s+/i, 'صلوات بر '],
  [/^Salawat\s+/i, 'صلواتِ '],
  [/^Taweez\s+against\s+/i, 'تعویذ برائے حفاظت از '],
  [/^Taweez\s+of\s+/i, 'تعویذِ '],
  [/^Taweez\s+for\s+/i, 'تعویذ برائے '],
  [/^Taweez\s+/i, 'تعویذِ '],
  [/^Hirz\s+e\s+/i, 'حرزِ '],
  [/^Hirz\s+/i, 'حرزِ '],
  [/^Dua\s+After\s+Namaz/i, 'تعقیب و دعائے بعد از نماز'],
  [/^Dua\s+after\s+/i, 'دعا بعد از '],
  [/^Dua\s+for\s+/i, 'دعا برائے '],
  [/^Dua\s+e\s+/i, 'دعائے '],
  [/^Dua\s+of\s+/i, 'دعائے '],
  [/^Dua\s+al-?/i, 'دعائے '],
  [/^Dua\s+/i, 'دعائے '],
  [/^Ziyarat\s+e\s+Wida\s+/i, 'زیارتِ وداعِ '],
  [/^Ziyarat\s+e\s+/i, 'زیارتِ '],
  [/^Ziyarat\s+of\s+/i, 'زیارتِ '],
  [/^Ziyarat\s+al-?/i, 'زیارتِ '],
  [/^Ziyarat\s+/i, 'زیارتِ '],
  [/^Ziyarah\s+of\s+/i, 'زیارتِ '],
  [/^Ziyarah\s+/i, 'زیارتِ '],
  [/^Munajaat\s+al-?/i, 'مناجاتِ '],
  [/^Munajaat\s+of\s+/i, 'مناجاتِ '],
  [/^Munajaat\s+/i, 'مناجاتِ '],
  [/^Munajat\s+of\s+/i, 'مناجاتِ '],
  [/^Munajat\s+/i, 'مناجاتِ '],
  [/^Whispered\s+Prayer\s+of\s+the\s+/i, 'مناجاتِ '],
  [/^Whispered\s+Prayer\s+of\s+/i, 'مناجاتِ '],
  [/^Whispered\s+Prayers?\s+/i, 'مناجاتِ '],
  [/^Aamaal\s+of\s+the\s+Day\s+of\s+/i, 'اعمالِ روزِ '],
  [/^Aamaal\s+of\s+the\s+Night\s+of\s+/i, 'اعمالِ شبِ '],
  [/^Aamaal\s+of\s+Shabe\s+/i, 'اعمالِ شبِ '],
  [/^Aamaal\s+of\s+/i, 'اعمالِ '],
  [/^Aamaal\s+for\s+/i, 'اعمالِ '],
  [/^Aamaal\s+during\s+/i, 'اعمالِ ایامِ '],
  [/^Aamaal\s+in\s+/i, 'اعمالِ ماہِ '],
  [/^Aamaal\s+/i, 'اعمالِ '],
  [/^Amal\s+of\s+/i, 'اعمالِ '],
  [/^Amal\s+/i, 'عملِ '],
  [/^Taqibaat\s+e\s+Namaz\s+e\s+/i, 'تعقیباتِ نمازِ '],
  [/^Taqibaat\s+e\s+Namaz\s+/i, 'تعقیباتِ نمازِ '],
  [/^Taqibaat\s+e\s+/i, 'تعقیباتِ '],
  [/^Taqibaat\s+of\s+/i, 'تعقیباتِ '],
  [/^Taqibaat\s+/i, 'تعقیباتِ '],
  [/^Taqibat\s+e\s+/i, 'تعقیباتِ '],
  [/^Taqibat\s+/i, 'تعقیباتِ '],
  [/^General\s+Taqibaat/i, 'عمومی تعقیباتِ نماز'],
  [/^Namaz\s+e\s+/i, 'نمازِ '],
  [/^Namaz\s+of\s+/i, 'نمازِ '],
  [/^Namaz\s+/i, 'نمازِ '],
  [/^Nafilah\s+of\s+/i, 'نافلۂ '],
  [/^Nafilah\s+/i, 'نافلۂ '],
  [/^Salat\s+al-?/i, 'نمازِ '],
  [/^Salat\s+of\s+/i, 'نمازِ '],
  [/^Salat\s+/i, 'نمازِ '],
  [/^Supplication\s+for\s+/i, 'دعا برائے '],
  [/^Supplication\s+of\s+/i, 'دعائے '],
  [/^Supplication\s+after\s+/i, 'دعا بعد از '],
  [/^Supplication\s+when\s+/i, 'دعا بوقتِ '],
  [/^Supplication\s+on\s+/i, 'دعا در روزِ '],
  [/^Supplication\s+in\s+/i, 'دعا در '],
  [/^Supplication\s+/i, 'دعائے '],
  [/^Supplications\s+for\s+/i, 'دعائیں برائے '],
  [/^Supplications\s+of\s+/i, 'ادعیہ '],
  [/^Supplications\s+/i, 'ادعیہ '],
  [/^Prayer\s+for\s+/i, 'دعا برائے '],
  [/^Prayer\s+of\s+/i, 'نمازِ '],
  [/^Prayer\s+after\s+/i, 'نماز بعد از '],
  [/^Prayer\s+/i, 'نمازِ '],
  [/^Prayers\s+for\s+/i, 'نمازیں برائے '],
  [/^Prayers\s+of\s+/i, 'نمازیں '],
  [/^Prayers\s+/i, 'نمازیں '],
  [/^Hadith\s+al-?/i, 'حدیثِ '],
  [/^Hadith\s+of\s+/i, 'حدیثِ '],
  [/^Hadith\s+/i, 'حدیثِ '],
  [/^Sahifa\s+al-?/i, 'صحیفۂ '],
  [/^Sahifa\s+/i, 'صحیفۂ '],
  [/^Masjid\s+e\s+/i, 'مسجدِ '],
  [/^Masjid\s+/i, 'مسجدِ '],
  [/^Mosque\s+of\s+/i, 'مسجدِ '],
];

// Complete vocabulary word/token replacements
const WORD_MAP: [RegExp, string][] = [
  // Holy Persons & Infallibles
  [/\bAmeer\s+ul\s+Momineen\b/gi, 'امیر المؤمنین (ع)'],
  [/\bAmeerul\s+Momineen\b/gi, 'امیر المؤمنین (ع)'],
  [/\bAmeer\s+al[\s-]Momineen\b/gi, 'امیر المؤمنین (ع)'],
  [/\bHoly\s+Prophet\b/gi, 'رسولِ اکرم حضرت محمد مصطفیٰ (ص)'],
  [/\bProphet\s+Muhammad\b/gi, 'رسولِ خدا حضرت محمد مصطفیٰ (ص)'],
  [/\bLady\s+Fatimah\s+Zahra\b/gi, 'سیدۃ النساء حضرت فاطمۃ الزہراء (س)'],
  [/\bLady\s+Fatima\s+Zahra\b/gi, 'سیدۃ النساء حضرت فاطمۃ الزہراء (س)'],
  [/\bFatimah\s+Zahra\b/gi, 'حضرت فاطمۃ الزہراء (س)'],
  [/\bFatima\s+Zahra\b/gi, 'حضرت فاطمۃ الزہراء (س)'],
  [/\bLady\s+Fatimah\b/gi, 'حضرت فاطمہ (س)'],
  [/\bLady\s+Fatima\b/gi, 'حضرت فاطمہ (س)'],
  [/\bFatimah\b/gi, 'حضرت فاطمہ (س)'],
  [/\bFatima\b/gi, 'حضرت فاطمہ (س)'],
  [/\bZahra\b/gi, 'زہراء (س)'],
  [/\bHazrat\s+Masooma\s+e\s+Qum\b/gi, 'حضرت فاطمہ معصومہ قم (س)'],
  [/\bHazrat\s+Masooma\b/gi, 'حضرت فاطمہ معصومہ (س)'],
  [/\bMasooma\s+e\s+Qum\b/gi, 'حضرت فاطمہ معصومہ قم (س)'],
  [/\bMasooma\b/gi, 'حضرت معصومہ (س)'],
  [/\bMasumah\b/gi, 'حضرت معصومہ (س)'],
  [/\bHazrat\s+Zainab\b/gi, 'حضرت زینب کبریٰ (س)'],
  [/\bHazrat\s+Zaynab\b/gi, 'حضرت زینب کبریٰ (س)'],
  [/\bZainab\b/gi, 'حضرت زینب (س)'],
  [/\bZaynab\b/gi, 'حضرت زینب (س)'],
  [/\bJafar\s+e\s+Tayyar\b/gi, 'حضرت جعفرِ طیار (ع)'],
  [/\bJafar\s+Tayyar\b/gi, 'حضرت جعفرِ طیار (ع)'],
  [/\bAbul\s+Fazl\s+al[\s-]Abbas\b/gi, 'حضرت ابوالفضل العباس (ع)'],
  [/\bAbul\s+Fazl\b/gi, 'حضرت ابوالفضل العباس (ع)'],
  [/\bAbbas\b/gi, 'حضرت عباس (ع)'],
  [/\bAli\s+Akbar\b/gi, 'حضرت علی اکبر (ع)'],
  [/\bAli\s+Asghar\b/gi, 'حضرت علی اصغر (ع)'],
  [/\bMuslim\s+ibn\s+Aqeel\b/gi, 'حضرت مسلم بن عقیل (ع)'],
  [/\bMuslim\s+bin\s+Aqeel\b/gi, 'حضرت مسلم بن عقیل (ع)'],
  [/\bSalman\s+al[\s-]Farsi\b/gi, 'حضرت سلمان فارسی (رض)'],
  [/\bSalman\b/gi, 'حضرت سلمان (رض)'],
  [/\bHamzah\b/gi, 'حضرت حمزہ سید الشہداء (ع)'],
  [/\bAbu\s+Talib\b/gi, 'حضرت ابو طالب (ع)'],
  [/\bKhadijah\b/gi, 'ام المؤمنین حضرت خدیجہ الکبریٰ (س)'],
  [/\bKhadija\b/gi, 'ام المؤمنین حضرت خدیجہ الکبریٰ (س)'],
  [/\bUmmul\s+Baneen\b/gi, 'حضرت ام البنین (س)'],
  [/\bUmm\s+al[\s-]Baneen\b/gi, 'حضرت ام البنین (س)'],
  [/\bImam\s+Ali\b/gi, 'امام علی (ع)'],
  [/\bImam\s+Hussain\b/gi, 'امام حسین (ع)'],
  [/\bImam\s+Husain\b/gi, 'امام حسین (ع)'],
  [/\bImam\s+Hasan\b/gi, 'امام حسن (ع)'],
  [/\bImam\s+Sajjad\b/gi, 'امام زین العابدین سجاد (ع)'],
  [/\bImam\s+Baqir\b/gi, 'امام محمد باقر (ع)'],
  [/\bImam\s+Sadiq\b/gi, 'امام جعفر صادق (ع)'],
  [/\bImam\s+Kadhim\b/gi, 'امام موسیٰ کاظم (ع)'],
  [/\bImam\s+Kazim\b/gi, 'امام موسیٰ کاظم (ع)'],
  [/\bImam\s+Reza\b/gi, 'امام علی رضا (ع)'],
  [/\bImam\s+Rida\b/gi, 'امام علی رضا (ع)'],
  [/\bImam\s+Jawad\b/gi, 'امام محمد تقی الجواد (ع)'],
  [/\bImam\s+Hadi\b/gi, 'امام علی نقی الہادی (ع)'],
  [/\bImam\s+Askari\b/gi, 'امام حسن عسکری (ع)'],
  [/\bImam\s+Mahdi\b/gi, 'حضرت امام مہدی (عج)'],
  [/\bImam\s+e\s+Zamana\b/gi, 'امامِ زمانہ (عج)'],
  [/\bImams\b/gi, 'ائمۂ معصومین (ع)'],
  [/\bImam\b/gi, 'امام (ع)'],
  [/\bProphet\b/gi, 'رسولِ اکرم (ص)'],
  [/\bAhlulbayt\b/gi, 'اہلِ بیت (ع)'],
  [/\bAhlul\s+Bayt\b/gi, 'اہلِ بیت (ع)'],
  [/\bAale\s+Yasin\b/gi, 'آلِ یاسین'],
  [/\bAl[\s-]Qaim\b/gi, 'حضرت قائم آلِ محمد (عج)'],
  [/\bQaim\b/gi, 'حضرت قائم (عج)'],
  [/\bHujjah\b/gi, 'حضرت حجت (عج)'],
  [/\bAl[\s-]Hujjah\b/gi, 'حضرت حجت (عج)'],
  [/\bBaqir\b/gi, 'باقر (ع)'],
  [/\bSadiq\b/gi, 'صادق (ع)'],
  [/\bKazim\b/gi, 'کاظم (ع)'],
  [/\bKadhim\b/gi, 'کاظم (ع)'],
  [/\bReza\b/gi, 'رضا (ع)'],
  [/\bRida\b/gi, 'رضا (ع)'],
  [/\bJawad\b/gi, 'جواد (ع)'],
  [/\bTaqi\b/gi, 'تقی (ع)'],
  [/\bNaqi\b/gi, 'نقی (ع)'],
  [/\bHadi\b/gi, 'ہادی (ع)'],
  [/\bAskari\b/gi, 'عسکری (ع)'],
  [/\bHusain\b/gi, 'حسین (ع)'],
  [/\bHussain\b/gi, 'حسین (ع)'],
  [/\bHasan\b/gi, 'حسن (ع)'],
  [/\bAli\b/gi, 'علی (ع)'],
  [/\bMuhammad\b/gi, 'محمد (ص)'],
  [/\bJafar\b/gi, 'جعفر (ع)'],
  [/\bMusa\b/gi, 'موسیٰ (ع)'],
  [/\bZayn\s+al[\s-]Aabedeen\b/gi, 'زین العابدین (ع)'],
  [/\bJanab\s+e\s+/gi, 'حضرت '],
  [/\bJanab\b/gi, 'حضرت'],
  [/\bIbn\s+Abi\s+Talib\b/gi, 'ابن ابی طالب (ع)'],
  [/\bIbne\s+Abi\s+Talib\b/gi, 'ابن ابی طالب (ع)'],
  [/\bIbn\b/gi, 'ابن'],
  [/\bIbne\b/gi, 'ابنِ'],
  [/\bBin\b/gi, 'بن'],
  [/\bMaster\b/gi, 'مولا'],
  [/\bLeader\b/gi, 'پیشوا و سرور'],
  [/\bMomineen\b/gi, 'مومنین'],
  [/\bMomin\b/gi, 'مومن'],
  [/\bShia\b/gi, 'شیعہ'],
  [/\bShias\b/gi, 'شیعیانِ حیدرِ کرار'],
  [/\bMartyrs\b/gi, 'شہدائے کرام'],
  [/\bMartyr\b/gi, 'شہید'],
  [/\bShohada\b/gi, 'شہدائے کرام'],

  // Sacred Times & Months
  [/\bLaylatul\s+Qadr\b/gi, 'شبِ قدر'],
  [/\bNight\s+of\s+Qadr\b/gi, 'شبِ قدر'],
  [/\bShabe\s+Qadr\b/gi, 'شبِ قدر'],
  [/\bShabe\s+Ashura\b/gi, 'شبِ عاشور'],
  [/\bShabe\s+Jumah\b/gi, 'شبِ جمعہ'],
  [/\bEve\s+of\s+Friday\b/gi, 'شبِ جمعہ'],
  [/\bDay\s+of\s+Friday\b/gi, 'روزِ جمعہ'],
  [/\bFriday\s+Night\b/gi, 'شبِ جمعہ'],
  [/\bWednesday\s+night\b/gi, 'شبِ بدھ'],
  [/\bThursday\s+night\b/gi, 'شبِ جمعرات'],
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
  [/\bSha\'?ban\b/gi, 'ماہِ شعبان'],
  [/\bRajab\b/gi, 'ماہِ رجب'],
  [/\bMuharram\b/gi, 'ماہِ محرم'],
  [/\bSafar\b/gi, 'ماہِ صفر'],
  [/\bShawwal\b/gi, 'ماہِ شوال'],
  [/\bDhul\s+Hijjah\b/gi, 'ماہِ ذی الحجہ'],
  [/\bDhul\s+Qadah\b/gi, 'ماہِ ذی القعدہ'],
  [/\bZil\s+Hajj\b/gi, 'ذی الحجہ'],
  [/\bZil\s+Qad\b/gi, 'ذی القعدہ'],
  [/\bEid\s+al[\s-]Fitr\b/gi, 'عید الفطر'],
  [/\bEid\s+al[\s-]Adha\b/gi, 'عید الاضحیٰ'],
  [/\bEid\s+Azha\b/gi, 'عید الاضحیٰ'],
  [/\bEid\s+al[\s-]Ghadeer\b/gi, 'عیدِ غدیر'],
  [/\bGhadeer\b/gi, 'غدیرِ خم'],
  [/\bMab\'?ath\b/gi, 'عیدِ مبعث'],
  [/\bArba\'?een\b/gi, 'اربعین'],
  [/\bAshura\b/gi, 'عاشورہ'],
  [/\bTasua\b/gi, 'تاسوعا'],
  [/\bArafah\b/gi, 'روزِ عرفہ'],
  [/\bArafat\b/gi, 'عرفات'],
  [/\bMubahala\b/gi, 'روزِ مباہلہ'],
  [/\bNawruz\b/gi, 'عیدِ نوروز'],
  [/\bDawn\b/gi, 'طلوعِ فجر'],
  [/\bSunrise\b/gi, 'طلوعِ آفتاب'],
  [/\bSunset\b/gi, 'غروبِ آفتاب'],
  [/\bAfternoon\b/gi, 'بعد از دوپہر'],
  [/\bNoon\b/gi, 'دوپہر (وقتِ ظہر)'],
  [/\bMorning\s+and\s+Evening\b/gi, 'صبح و شام'],
  [/\bMorning\b/gi, 'صبح'],
  [/\bEvening\b/gi, 'شام'],
  [/\bNight\b/gi, 'شب'],
  [/\bDays\b/gi, 'ایام'],
  [/\bDay\b/gi, 'روز'],
  [/\bMonths\b/gi, 'مہینے'],
  [/\bMonth\b/gi, 'ماہ'],
  [/\bHours\b/gi, 'گھنٹے'],
  [/\bHour\b/gi, 'گھنٹہ'],
  [/\bTime\b/gi, 'وقت'],
  [/\bTimes\b/gi, 'مرتبہ'],

  // Prayers & Liturgy
  [/\bFajr\b/gi, 'فجر'],
  [/\bSubh\b/gi, 'صبح'],
  [/\bDhuhr\b/gi, 'ظہر'],
  [/\bZuhr\b/gi, 'ظہر'],
  [/\bAsr\b/gi, 'عصر'],
  [/\bMaghrib\b/gi, 'مغرب'],
  [/\bIsha\b/gi, 'عشاء'],
  [/\bTahajjud\b/gi, 'تہجد'],
  [/\bNight\s+Prayer\b/gi, 'نمازِ شب'],
  [/\bNamaz\s+e\s+Shab\b/gi, 'نمازِ شب'],
  [/\bSalat\s+al[\s-]Layl\b/gi, 'نمازِ شب'],
  [/\bWuzu\b/gi, 'وضو'],
  [/\bAblution\b/gi, 'وضو'],
  [/\bObligatory\s+Prayers?\b/gi, 'نمازِ واجب'],
  [/\bCompulsory\s+Prayers?\b/gi, 'نمازِ واجب'],
  [/\bNawafil\b/gi, 'نوافل'],
  [/\bQunut\b/gi, 'قنوت'],
  [/\bRaka\'?ats?\b/gi, 'رکعت'],
  [/\bUnits?\b/gi, 'رکعت'],

  // Places
  [/\bMadinah\b/gi, 'مدینۂ منورہ'],
  [/\bMedina\b/gi, 'مدینۂ منورہ'],
  [/\bMakkah\b/gi, 'مکہ مکرمہ'],
  [/\bMecca\b/gi, 'مکہ مکرمہ'],
  [/\bKarbala\b/gi, 'کربلائے معلیٰ'],
  [/\bNajaf\b/gi, 'نجفِ اشرف'],
  [/\bKufa\b/gi, 'کوفہ'],
  [/\bMashhad\b/gi, 'مشہدِ مقدس'],
  [/\bSamarra\b/gi, 'سامراء'],
  [/\bKazmain\b/gi, 'کاظمین'],
  [/\bBaqee\b/gi, 'جنت البقیع'],
  [/\bBaqi\b/gi, 'جنت البقیع'],
  [/\bJamkaran\b/gi, 'مسجدِ جمکران'],
  [/\bMosque\b/gi, 'مسجد'],
  [/\bMasjid\b/gi, 'مسجد'],
  [/\bShrines?\b/gi, 'روضۂ اقدس'],
  [/\bTombs?\b/gi, 'مزارِ مقدس'],
  [/\bPlace\b/gi, 'مقام'],
  [/\bPlaces\b/gi, 'مقامات'],

  // Core thematic words
  [/\bAllah\b/gi, 'اللہ تعالی'],
  [/\bGod\b/gi, 'خداوندِ متعال'],
  [/\bAlmighty\b/gi, 'قادرِ مطلق'],
  [/\bHoly\b/gi, 'مقدس'],
  [/\bSacred\b/gi, 'مقدس'],
  [/\bReappearance\b/gi, 'ظہورِ پرنور'],
  [/\bIstikharah\b/gi, 'استخارہ'],
  [/\bHirz\b/gi, 'حرز'],
  [/\bTaweez\b/gi, 'تعویذ'],
  [/\bEhraam\b/gi, 'احرام'],
  [/\bIhram\b/gi, 'احرام'],
  [/\bTawaf\b/gi, 'طواف'],
  [/\bMethod\b/gi, 'طریقہ'],
  [/\bEtiquettes?\b/gi, 'آداب'],
  [/\bRecommendations?\b/gi, 'سفارشات'],
  [/\bRecommendation\b/gi, 'سفارش'],
  [/\bMerits?\b/gi, 'فضیلت و ثواب'],
  [/\bImportance\b/gi, 'اہمیت'],
  [/\bVirtues?\b/gi, 'فضائل'],
  [/\bVirtue\b/gi, 'فضیلت'],
  [/\bRecite\b/gi, 'تلاوت کریں'],
  [/\bReciting\b/gi, 'تلاوت'],
  [/\bRecited\b/gi, 'پڑھی جانے والی'],
  [/\bRecitation\b/gi, 'تلاوت'],
  [/\bReading\b/gi, 'تلاوت و قرأت'],
  [/\bSeeking\b/gi, 'طلب'],
  [/\bFulfillment\b/gi, 'برآوردگی'],
  [/\bNeeds\b/gi, 'حاجات'],
  [/\bNeed\b/gi, 'حاجت'],
  [/\bForgiveness\b/gi, 'بخشش و مغفرت'],
  [/\bRepentance\b/gi, 'توبہ و استغفار'],
  [/\bSins?\b/gi, 'گناہ'],
  [/\bProtection\b/gi, 'حفاظت و امان'],
  [/\bHealing\b/gi, 'شفائے امراض'],
  [/\bRelief\b/gi, 'کشائش و فرج'],
  [/\bPreservation\b/gi, 'حفظ و امان'],
  [/\bSickness\b/gi, 'بیماری'],
  [/\bIllness\b/gi, 'مرض'],
  [/\bRecovery\b/gi, 'صحت یابی'],
  [/\bCure\b/gi, 'علاج و شفا'],
  [/\bDebts?\b/gi, 'قرض'],
  [/\bRepayment\b/gi, 'ادائیگی'],
  [/\bSustenance\b/gi, 'رزق و روزی'],
  [/\bParents\b/gi, 'والدین'],
  [/\bChildren\b/gi, 'اولاد'],
  [/\bTravel\b/gi, 'سفر'],
  [/\bJourney\b/gi, 'سفر'],
  [/\bBidding\s+adieu\b/gi, 'الوداع کہنا'],
  [/\bBidding\b/gi, 'الوداع'],
  [/\bAdieu\b/gi, 'الوداع'],
  [/\bFarewell\b/gi, 'وداع'],
  [/\bEvil\b/gi, 'شر و بدی'],
  [/\bSatan\'?s?\b/gi, 'شیطان'],
  [/\bIblis\b/gi, 'ابلیس'],
  [/\bFire\b/gi, 'آگ و جہنم'],
  [/\bHell\b/gi, 'جہنم'],
  [/\bParadise\b/gi, 'جنت'],
  [/\bHeaven\b/gi, 'بہشت'],
  [/\bTawassul\b/gi, 'توسل'],
  [/\bMediation\b/gi, 'توسل'],
  [/\bIntercession\b/gi, 'شفاعت'],
  [/\bVisiting\b/gi, 'زیارت'],
  [/\bVisitation\b/gi, 'زیارت'],
  [/\bDonating\b/gi, 'ہدیہ کرنا'],
  [/\bRecompense\b/gi, 'ثواب'],
  [/\bReward\b/gi, 'اجر و ثواب'],
  [/\bTasbih\b/gi, 'تسبیح'],
  [/\bTasbeeh\b/gi, 'تسبیح'],
  [/\bRosary\b/gi, 'تسبیح'],
  [/\bChaplets?\b/gi, 'تسبیح کے دانے'],
  [/\bChamplet\b/gi, 'تسبیح'],
  [/\bGlorification\b/gi, 'تسبیح و تمجید'],
  [/\bPraise\b/gi, 'حمد و ستائش'],
  [/\bSalawat\b/gi, 'صلوات'],
  [/\bBlessings?\b/gi, 'برکات و درود'],
  [/\bProgeny\b/gi, 'آل و اولاد'],
  [/\bFamily\b/gi, 'اہل و عیال'],
  [/\bSouls\b/gi, 'جانیں'],
  [/\bSacrifice\b/gi, 'قربان'],
  [/\bPeace\b/gi, 'سلامتی'],
  [/\bSafety\b/gi, 'امان'],
  [/\bSecurity\b/gi, 'امن و عافیت'],
  [/\bFear\b/gi, 'خوف'],
  [/\bScared\b/gi, 'خوفزدہ'],
  [/\bDifficulties\b/gi, 'مشکلات'],
  [/\bDifficulty\b/gi, 'مشکل'],
  [/\bDistress\b/gi, 'پریشانی'],
  [/\bSorrow\b/gi, 'غم'],
  [/\bGrief\b/gi, 'حزن و ملال'],
  [/\bAffliction\b/gi, 'مصیبت'],
  [/\bHardships?\b/gi, 'سختیاں'],
  [/\bCalmity\b/gi, 'بلا'],
  [/\bCalamity\b/gi, 'مصیبت'],
  [/\bMisfortune\b/gi, 'بلا'],
  [/\bTroubles?\b/gi, 'تکلیف'],
  [/\bConcentration\b/gi, 'حضورِ قلب'],
  [/\bRepelling\b/gi, 'دفع کرنا'],
  [/\bFending\s+Off\b/gi, 'دفع کرنا'],
  [/\bFleeing\b/gi, 'پناہ لینا'],
  [/\bRefuge\b/gi, 'پناہ'],
  [/\bShelter\b/gi, 'امان'],
  [/\bConfession\b/gi, 'اعتراف'],
  [/\bShortcomings?\b/gi, 'کوتاہیاں'],
  [/\bMisdeeds?\b/gi, 'خطائیں'],
  [/\bOutcomes?\b/gi, 'عاقبت و انجام'],
  [/\bHostility\b/gi, 'دشمنی و عداوت'],
  [/\bEnem(y|ies)\b/gi, 'دشمنان'],
  [/\bDeviousness\b/gi, 'مکر و فریب'],
  [/\bFrontiers?\b/gi, 'سرحدیں'],
  [/\bNeighbours?\b/gi, 'ہمسائے'],
  [/\bFriends?\b/gi, 'دوست'],
  [/\bWater\b/gi, 'پانی'],
  [/\bRain\b/gi, 'بارش'],
  [/\bClouds?\b/gi, 'بادل'],
  [/\bThunder\b/gi, 'گرج'],
  [/\bLightning\b/gi, 'بجلی'],
  [/\bCrescent\b/gi, 'ہلال (نیا چاند)'],
  [/\bMoon\b/gi, 'چاند'],
  [/\bSun\b/gi, 'سورج'],
  [/\bStars?\b/gi, 'ستارے'],
  [/\bDeath\b/gi, 'موت'],
  [/\bGraves?\b/gi, 'قبر'],
  [/\bGraveyard\b/gi, 'قبرستان'],
  [/\bCemetery\b/gi, 'قبرستان'],
  [/\bDead\b/gi, 'مردے و اموات'],
  [/\bDeceased\b/gi, 'مرحومین'],
  [/\bDust\b/gi, 'خاکِ شفا'],
  [/\bEarth\b/gi, 'زمین'],
  [/\bSoil\b/gi, 'مٹی'],
  [/\bKing\b/gi, 'بادشاہ'],
  [/\bServant\b/gi, 'خادم'],
  [/\bMiracles?\b/gi, 'معجزات و کرامات'],
  [/\bShown\b/gi, 'ظاہر کردہ'],
  [/\bNews\b/gi, 'خبر و داستان'],
  [/\bSheets?\b/gi, 'پرچے'],
  [/\bLetter\b/gi, 'عریضہ'],
  [/\bWriting\b/gi, 'تحریر'],
  [/\bDrinking\b/gi, 'پینا'],
  [/\bWater\b/gi, 'پانی'],
  [/\bOrdered\b/gi, 'حکم دیا'],
  [/\bIntends\b/gi, 'ارادہ کرے'],
  [/\bGoing\s+Out\b/gi, 'باہر جانا'],
  [/\bObserve\b/gi, 'انجام دیں'],
  [/\bPaying\s+Visit\b/gi, 'زیارت کرنا'],
  [/\bVisit\b/gi, 'زیارت'],
  [/\bFemale\b/gi, 'خاتون'],
  [/\bPilgrim\b/gi, 'زائر'],
  [/\bTalking\b/gi, 'بات چیت'],
  [/\bNa\s+Mahram\b/gi, 'نامحرم'],
  [/\bMahram\b/gi, 'محرم'],
  [/\bAuthor\b/gi, 'مصنف'],
  [/\bJawahir\b/gi, 'جواہر الکلام'],
  [/\bKafi\b/gi, 'الکافی'],
  [/\bFaqih\b/gi, 'الفقیہ'],
  [/\bTahdhib\b/gi, 'التہذیب'],
  [/\bIstabsar\b/gi, 'الاستبصار'],
  [/\bBaqiyat\b/gi, 'باقیات الصالحات'],
  [/\bBaqiyaat\b/gi, 'باقیات الصالحات'],
  [/\bSaalehaat\b/gi, 'الصالحات'],
  [/\bSaalihat\b/gi, 'الصالحات'],
  [/\bFatemiyyah\b/gi, 'فاطمیہ (س)'],
  [/\bSajjadiyyah\b/gi, 'سجادیہ (ع)'],
  [/\bMahdiyyah\b/gi, 'مہدیہ (عج)'],
  [/\bQuran\b/gi, 'قرآنِ مجید'],
  [/\bSurahs?\b/gi, 'سورہ'],
  [/\bAyahs?\b/gi, 'آیات'],
  [/\bAyat\b/gi, 'آیت'],
  [/\bJuzz\b/gi, 'پارہ'],
  [/\bJuz\b/gi, 'پارہ'],
  [/\bPara\b/gi, 'پارہ'],
  [/\bHadith\b/gi, 'حدیث'],
  [/\bHadees\b/gi, 'حدیث'],
  [/\bSupplications?\b/gi, 'دعائیں'],
  [/\bSupplication\b/gi, 'دعا'],
  [/\bPrayers?\b/gi, 'نماز'],
  [/\bPrayer\b/gi, 'نماز'],
  [/\bNamaz\b/gi, 'نماز'],
  [/\bSalat\b/gi, 'نماز'],
  [/\bSalah\b/gi, 'نماز'],
  [/\bDuas?\b/gi, 'دعا'],
  [/\bDua\b/gi, 'دعا'],
  [/\bMunajaat\b/gi, 'مناجات'],
  [/\bMunajat\b/gi, 'مناجات'],
  [/\bZiyarat\b/gi, 'زیارت'],
  [/\bZiyaraat\b/gi, 'زیارات'],
  [/\bAamaal\b/gi, 'اعمال'],
  [/\bAmal\b/gi, 'عمل'],
  [/\bTaqibaat\b/gi, 'تعقیبات'],
  [/\bTaqibat\b/gi, 'تعقیبات'],
  [/\bNafilah\b/gi, 'نافلۂ'],
  [/\bNawafil\b/gi, 'نوافل'],

  // Ordinals & Small Words
  [/\b1st\b/gi, 'اول'],
  [/\b2nd\b/gi, 'دوم'],
  [/\b3rd\b/gi, 'سوم'],
  [/\b4th\b/gi, 'چہارم'],
  [/\b5th\b/gi, 'پنجم'],
  [/\b6th\b/gi, 'ششم'],
  [/\b7th\b/gi, 'ہفتم'],
  [/\b8th\b/gi, 'ہشتم'],
  [/\b9th\b/gi, 'نہم'],
  [/\b10th\b/gi, 'دہم'],
  [/\b11th\b/gi, 'گیارہواں'],
  [/\b12th\b/gi, 'بارہواں'],
  [/\b13th\b/gi, 'تیرہواں'],
  [/\b14th\b/gi, 'چودہواں'],
  [/\b15th\b/gi, 'پندرہواں'],
  [/\b16th\b/gi, 'سولہواں'],
  [/\b17th\b/gi, 'سترہواں'],
  [/\b18th\b/gi, 'اٹھارہواں'],
  [/\b19th\b/gi, 'انیسواں'],
  [/\b20th\b/gi, 'بیسواں'],
  [/\b21st\b/gi, 'اکیسواں'],
  [/\b22nd\b/gi, 'بائیسواں'],
  [/\b23rd\b/gi, 'تیئیسواں'],
  [/\b24th\b/gi, 'چوبیسواں'],
  [/\b25th\b/gi, 'پچیسواں'],
  [/\b26th\b/gi, 'چھبیسواں'],
  [/\b27th\b/gi, 'ستائیسواں'],
  [/\b28th\b/gi, 'اٹھائیسواں'],
  [/\b29th\b/gi, 'انتیسواں'],
  [/\b30th\b/gi, 'تیسواں'],
  [/\bFirst\b/gi, 'اول'],
  [/\bSecond\b/gi, 'دوم'],
  [/\bThird\b/gi, 'سوم'],
  [/\bFourth\b/gi, 'چہارم'],
  [/\bFifth\b/gi, 'پنجم'],
  [/\bSixth\b/gi, 'ششم'],
  [/\bSeventh\b/gi, 'ہفتم'],
  [/\bEighth\b/gi, 'ہشتم'],
  [/\bNinth\b/gi, 'نہم'],
  [/\bTenth\b/gi, 'دہم'],
  [/\bAnother\b/gi, 'دیگر'],
  [/\bOther\b/gi, 'دیگر'],
  [/\bAnot\b/gi, 'دیگر'],
  [/\bEvery\b/gi, 'ہر'],
  [/\bEach\b/gi, 'ہر ایک'],
  [/\bDaily\b/gi, 'روزانہ'],
  [/\bWeekly\b/gi, 'ہفتہ وار'],
  [/\bMonthly\b/gi, 'ماہانہ'],
  [/\bGeneral\b/gi, 'عمومی'],
  [/\bSpecial\b/gi, 'خصوصی'],
  [/\bCommon\b/gi, 'مشترکہ'],
  [/\bSpecific\b/gi, 'مخصوص'],
  [/\bComplete\b/gi, 'مکمل'],
  [/\bShort\b/gi, 'مختصر'],
  [/\bBrief\b/gi, 'مختصر'],
  [/\bAll\b/gi, 'تمام'],
  [/\bBetween\b/gi, 'درمیان'],
  [/\bDuring\b/gi, 'کے دوران'],
  [/\bAfter\b/gi, 'بعد از'],
  [/\bBefore\b/gi, 'قبل از'],
  [/\bWhen\b/gi, 'بوقتِ'],
  [/\bWhile\b/gi, 'بوقتِ'],
  [/\bUpon\b/gi, 'پر'],
  [/\bOn\b/gi, 'در'],
  [/\bAt\b/gi, 'بوقتِ'],
  [/\bIn\b/gi, 'میں'],
  [/\bFor\b/gi, 'برائے'],
  [/\bBy\b/gi, 'بذریعہ'],
  [/\bFrom\b/gi, 'از'],
  [/\bTo\b/gi, 'بہ سوئے'],
  [/\bWith\b/gi, 'ہمراہ'],
  [/\bAgainst\b/gi, 'بر خلاف'],
  [/\bAnd\b/gi, 'اور'],
  [/\bOr\b/gi, 'یا'],
  [/\bOf\b/gi, ''],
  [/\bThe\b/gi, ''],
  [/\bAn\b/gi, ''],
  [/\bA\b/gi, ''],
  [/\bAs\b/gi, 'حضرت'],
  [/\bHis\b/gi, 'ان کی'],
  [/\bHer\b/gi, 'ان کی'],
  [/\bHim\b/gi, 'ان کو'],
  [/\bOur\b/gi, 'ہمارے'],
  [/\bBe\b/gi, 'ہو'],
  [/\bMay\b/gi, 'ہو'],
  [/\bIs\b/gi, 'ہے'],
  [/\bIt\'?s\b/gi, 'اس کا'],
  [/\bAl-?\b/gi, 'ال'],
  [/\bUl-?\b/gi, 'ال'],
  [/\bEl-?\b/gi, 'ال'],
  [/\bE\b/gi, 'ِ'],
];

// Transliteration helper for Romanized Arabic words to Urdu
const PHONETIC_MAP: Record<string, string> = {
  th: 'ث',
  kh: 'خ',
  dh: 'ذ',
  sh: 'ش',
  gh: 'غ',
  ch: 'چ',
  zh: 'ژ',
  ee: 'ی',
  oo: 'و',
  aa: 'ا',
  ou: 'و',
  ai: 'ئ',
  ay: 'ے',
  a: 'ا',
  b: 'ب',
  p: 'پ',
  t: 'ت',
  j: 'ج',
  h: 'ح',
  d: 'د',
  r: 'ر',
  z: 'ز',
  s: 'س',
  f: 'ف',
  q: 'ق',
  k: 'ک',
  g: 'گ',
  l: 'ل',
  m: 'م',
  n: 'ن',
  w: 'و',
  y: 'ی',
  v: 'و',
};

function transliterateWord(w: string): string {
  const str = w.toLowerCase();
  let res = '';
  let i = 0;
  while (i < str.length) {
    const two = str.slice(i, i + 2);
    if (PHONETIC_MAP[two]) {
      res += PHONETIC_MAP[two];
      i += 2;
    } else if (PHONETIC_MAP[str[i]]) {
      res += PHONETIC_MAP[str[i]];
      i += 1;
    } else {
      i += 1;
    }
  }
  return res;
}

/**
 * Returns the authentic Urdu title for a Mafatih item with 0 remaining English words
 */
export function getMafatihUrduTitle(id: string, englishTitle: string): string {
  const cleanId = (id || '').trim().toLowerCase();

  // 1. Direct lookup in canonical table
  if (KNOWN_MAFATIH_URDU_TITLES[cleanId]) {
    return KNOWN_MAFATIH_URDU_TITLES[cleanId];
  }

  // Check with common prefixes stripped
  const strippedId = cleanId.replace(/^(maf_|dua-|ziyarat-)/, '');
  if (KNOWN_MAFATIH_URDU_TITLES[strippedId]) {
    return KNOWN_MAFATIH_URDU_TITLES[strippedId];
  }

  if (!englishTitle) return 'دعا و زیارتِ معصومین (ع)';

  let t = englishTitle;

  // 2. Structural pattern replacement
  for (const [pattern, replacement] of STRUCTURAL_PATTERNS) {
    t = t.replace(pattern, replacement);
  }

  // 3. Word and vocabulary dictionary replacements
  for (const [pattern, replacement] of WORD_MAP) {
    t = t.replace(pattern, replacement);
  }

  // 4. Transliterate any remaining Latin words as a safe guarantee
  t = t.replace(/[A-Za-z]{2,}/g, (match) => {
    return transliterateWord(match);
  });

  // 5. Clean up single English letters, hyphens, and whitespace
  t = t.replace(/\b[a-zA-Z]\b/g, '')
       .replace(/[-–—]+/g, ' ')
       .replace(/\s+/g, ' ')
       .replace(/\s+([,:()،؛])/g, '$1')
       .trim();

  return t || 'دعا و زیارت';
}

/**
 * Translates Mafatih categories into clean, traditional Urdu
 */
export function getMafatihUrduCategory(catName?: string | null): string {
  if (!catName) return 'مفاتیح الجنان';
  const c = catName.trim().toLowerCase();

  if (c === 'taqibaat e namaz' || c.includes('taqib')) {
    return 'تعقیباتِ نماز';
  }
  if (c === 'namaz & special prayers' || (c.includes('namaz') && !c.includes('taqib'))) {
    return 'مستحب نمازیں و صلوات';
  }
  if (c === 'everyday recitations' || c.includes('everyday')) {
    return 'روزمرہ دعائیں و تسبیحات';
  }
  if (c === 'ziyaraat of ahlulbayt (a.s)' || (c.includes('ziyara') && c.includes('ahlulbayt'))) {
    return 'زیاراتِ ائمہ معصومین (ع)';
  }
  if (c === 'ziyaraat of holy places' || (c.includes('ziyara') && (c.includes('holy') || c.includes('places')))) {
    return 'زیاراتِ مشاہد و مقاماتِ مقدسہ';
  }
  if (c.includes('ziyarat') || c.includes('ziyaraat')) {
    return 'زیاراتِ معصومین (ع)';
  }
  if (c === '15 whispered prayers (munajaat)' || c.includes('whispered') || c.includes('15')) {
    return 'مناجاتِ خمس عشرہ (امام سجادؑ)';
  }
  if (c.includes('munajaat') || c.includes('munajat')) {
    return 'مناجاتِ ائمہ اطہار';
  }
  if (c === 'aamaal & monthly rituals' || c.includes('aamaal') || c.includes('ritual') || c.includes('amal')) {
    return 'اعمال و عباداتِ ایام و مہینۂ سال';
  }
  if (c === 'sahifa e fatemiyyah' || c.includes('fatemiyyah')) {
    return 'صحیفۂ فاطمیہ (س)';
  }
  if (c === 'sahifa e sajjadiyyah' || c.includes('sajjadiyyah')) {
    return 'صحیفۂ سجادیہ (ع)';
  }
  if (c === 'sahifa e mahdiyyah' || c.includes('mahdiyyah')) {
    return 'صحیفۂ مہدیہ (عج)';
  }
  if (c.includes('sahifa')) {
    return 'صحائفِ معصومین (ع)';
  }
  if (c === 'baqiyaat us saalehaat' || c.includes('baqiyaat') || c.includes('baqiyat')) {
    return 'باقیات الصالحات';
  }
  if (c === 'journey to paradise' || c.includes('paradise')) {
    return 'زاد المعاد و نجات کی راہیں';
  }
  if (c.includes('dua') || c.includes('supplication')) {
    return 'ادعیہ و مناجات';
  }

  return 'مفاتیح الجنان';
}

/**
 * Returns an authentic, eloquent Urdu snippet / context description for card previews
 * preventing any raw English descriptions from leaking into the Urdu UI.
 */
export function getMafatihUrduSnippet(item: MafatihSummaryLike): string {
  const id = (item.id || '').toLowerCase();
  const cat = (item.mainCategory || '').toLowerCase();
  const title = (item.title || '').toLowerCase();

  // Curated prominent supplications
  if (id === 'maf_dua40' || id.includes('kumayl')) {
    return 'اہل بیتؑ کی معتبر ترین دعا برائے آمرزشِ گناہ، وسعتِ رزق اور دفعِ شرور جو شبِ جمعہ و نیمۂ شعبان کو پڑھی جاتی ہے۔';
  }
  if (id === 'maf_ziy86' || id.includes('ashura')) {
    return 'سید الشہداء امام حسینؑ اور شہدائے کربلا کی با فضیلت ترین زیارت بمعہ صد مرتبہ لعن و سلام اور سجدۂ شکر۔';
  }
  if (id === 'maf_dua51' || id.includes('tawassul')) {
    return 'بارگاہِ الٰہی میں چودہ معصومین علیہم السلام کو وسیلہ بنا کر حاجات اور مشکلات کے حل کی دعا۔';
  }
  if (id === 'h_kisa' || id.includes('kisa')) {
    return 'پنجتن پاک علیہم السلام کی عظمت، نزولِ آیتِ تطہیر اور نزولِ برکات کا روح پرور تاریخی واقعہ۔';
  }
  if (id === 'maf_ziy126a' || id.includes('nudbah')) {
    return 'امامِ عصر حضرت مہدی (عج) کے فراق میں تڑپ اور ظہورِ پرنور کے لیے جمعہ اور عیدین کے دن پڑھی جانے والی دعا۔';
  }
  if (id === 'maf_dua46b' || id.includes('faraj')) {
    return 'مشکلات سے نجات اور تعجیلِ فرجِ امامِ زمانہ (عج) کے لیے منقول نہایت معروف اور پر اثر دعا۔';
  }
  if (id === 'maf_ziy128' || id.includes('ahd')) {
    return 'امامِ زمانہ حضرت مہدی (عج) کی بیعت کی تجدید اور ان کے انصار و اعوان میں شامل ہونے کی دعا۔';
  }
  if (id === 'maf_ziy73a' || id.includes('waritha')) {
    return 'حضرت امام حسینؑ کی عظیم الشان زیارت جس میں انبیاء کے وارث ہونے کا تذکرہ ہے۔';
  }
  if (id === 'maf_ziy92' || id.includes('arbaeen')) {
    return 'چہلمِ شہدائے کربلا (۲۰ صفر) کی مخصوص زیارت جو علاماتِ مومن میں سے شمار ہوتی ہے۔';
  }
  if (id === 'maf_ziy124' || id.includes('ale-yasin')) {
    return 'حضرت صاحب الزمان (عج) کی مستند زیارت جس پر خود امامؑ نے مداومت کی تاکید فرمائی۔';
  }
  if (id === 'maf_ziy134a' || id.includes('ameenullah')) {
    return 'امیر المؤمنین حضرت علی (ع) کی زیارت جو تمام ائمہ معصومینؑ کے روضوں پر بھی پڑھی جا سکتی ہے۔';
  }
  if (id === 'maf_dua39' || id.includes('sabah')) {
    return 'امیر المؤمنین حضرت علی (ع) کی صبح کے وقت کی فصیح و بلیغ دعا اور توحیدی مناجات۔';
  }
  if (id === 'maf_dua47' || id.includes('jawshan')) {
    return 'ایک ہزار اسمائے حسنیٰ الٰہی پر مشتمل عظیم الشان دعا جو امان اور بخشش کا حصار ہے۔';
  }
  if (id === 'maf_dua45' || id.includes('mujeer')) {
    return 'ایام البیض (۱۳، ۱۴، ۱۵ ماہِ رمضان) میں گناہوں کی بخشش اور جہنم کی آگ سے نجات کی دعا۔';
  }
  if (id === 'maf_aamal30' || id.includes('iftitah')) {
    return 'ماہِ مبارکِ رمضان کی راتوں کی مخصوص دعا جس میں حمدِ الٰہی اور حکومتِ مہدوی کی آرزو ہے۔';
  }
  if (id === 'maf_dua43' || id.includes('mashlool')) {
    return 'اسم اعظم پر مشتمل دعا جو گناہوں کی معافی، شفائے امراض اور کشائشِ امور کے لیے آزمودہ ہے۔';
  }
  if (id === 'maf_dua62' || id.includes('makarem')) {
    return 'امام سجادؑ کی اخلاقی کمالات، نیک صفات اور بلندیِ کردار کے حصول کی بلند پایہ دعا۔';
  }

  // Category & theme-based authentic Urdu descriptions
  if (cat.includes('taqib')) {
    return 'نماز کے بعد کی مخصوص مسنون دعائیں، تسبیحات اور استغفار جو قربِ الٰہی کا ذریعہ ہیں۔';
  }
  if (cat.includes('namaz') || title.includes('namaz') || title.includes('prayer') || title.includes('salat')) {
    return 'ائمہ معصومین علیہم السلام کی منقول مستحب نمازیں، رکعات کی تعداد، طریقہ اور مخصوص اذکار۔';
  }
  if (cat.includes('whispered') || cat.includes('15') || title.includes('whispered')) {
    return 'امام زین العابدینؑ کی الٰہی معرفت، توبہ، شکر اور محبتِ پروردگار سے لبریز مناجات۔';
  }
  if (cat.includes('ziyara') && (cat.includes('holy') || cat.includes('places') || title.includes('shrine') || title.includes('masjid'))) {
    return 'مشاہدِ مشرفہ، مساجدِ مقدسہ اور مزاراتِ متبرکہ کے آدابِ حاضری اور زیارات۔';
  }
  if (cat.includes('ziyara')) {
    return 'ائمہ اطہار علیہم السلام کے دربار میں با ادب سلام اور معرفت سے لبریز زیارت۔';
  }
  if (cat.includes('fatemiyyah')) {
    return 'سیدہ کونین حضرت فاطمۃ الزہراء سلام اللہ علیہا کی تسبیحات، دعائیں اور التجائیں۔';
  }
  if (cat.includes('sajjadiyyah')) {
    return 'صحیفۂ کاملۂ سجادیہ سے ماخوذ امام زین العابدینؑ کی معرفت اور بندگی پر مبنی دعا۔';
  }
  if (cat.includes('mahdiyyah')) {
    return 'حضرت ولی عصر امام مہدی (عج) سے منسوب دعائیں، نصرت کے طریقے اور زیارات۔';
  }
  if (cat.includes('baqiyaat') || cat.includes('paradise')) {
    return 'باقیات الصالحات و زاد المعاد: دنیا و آخرت کی فلاح، روزمرہ اعمال اور متبرک احکام۔';
  }
  if (cat.includes('aamaal') || title.includes('aamaal') || title.includes('amal')) {
    return 'مبارک ایام، متبرک راتوں اور مہینوں کے مخصوص اعمال، مستحب نمازیں اور دعائیں۔';
  }
  if (title.includes('taweez') || title.includes('hirz') || title.includes('evil')) {
    return 'شرور، آفات، بیماریوں اور شیطانی وسوسوں سے امان کے لیے معصومینؑ کے منقول تعویذ و حرز۔';
  }
  if (title.includes('istikharah')) {
    return 'قرآنِ مجید اور تسبیح کے ذریعے طلبِ خیر، استخارہ اور فیصلے کے آداب و طریقے';
  }

  return 'مفاتیح الجنان کی معتبر اور مستند دعا بمعہ مکمل اعراب اور مسنون آداب۔';
}

/**
 * Converts Western digits to Eastern Urdu numerals (e.g. 12 -> ۱۲)
 */
export function toUrduNumerals(num: number | string): string {
  const urduDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (d) => urduDigits[parseInt(d, 10)] || d);
}
