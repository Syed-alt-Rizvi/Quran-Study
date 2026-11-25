// Canonical Arabic & Polished English Localization Engine for Mafatih Al-Jinan
// Provides authentic, grammatically correct Arabic calligraphy titles with full honorifics,
// eliminating mixed-language artifacts and structural errors across all 1,300+ supplications and prayers.

export const KNOWN_MAFATIH_ARABIC_TITLES: Record<string, string> = {
  // -------------------------------------------------------------
  // CORE DEDICATED SUPPLICATIONS & ZIYARAAT
  // -------------------------------------------------------------
  maf_dua40: 'دعاء كميل بن زياد',
  'dua-kumayl': 'دعاء كميل بن زياد',
  kumayl: 'دعاء كميل بن زياد',
  kumail: 'دعاء كميل بن زياد',

  maf_ziy86: 'زيارة عاشوراء المشرفة',
  'ziyarat-ashura': 'زيارة عاشوراء المشرفة',
  ashura: 'زيارة عاشوراء المشرفة',

  maf_dua51: 'دعاء التوسل بالأئمة الأطهار',
  'dua-tawassul': 'دعاء التوسل بالأئمة الأطهار',
  tawassul: 'دعاء التوسل بالأئمة الأطهار',

  h_kisa: 'حديث الكساء اليماني الشريف',
  'hadith-kisa': 'حديث الكساء اليماني الشريف',
  'h-kisa': 'حديث الكساء اليماني الشريف',
  kisa: 'حديث الكساء اليماني الشريف',

  maf_ziy126a: 'دعاء الندبة لصاحب الزمان',
  'dua-nudbah': 'دعاء الندبة لصاحب الزمان',
  nudbah: 'دعاء الندبة لصاحب الزمان',

  maf_dua46b: 'دعاء الفرج (إلهي عظم البلاء)',
  'dua-faraj': 'دعاء الفرج (إلهي عظم البلاء)',
  faraj: 'دعاء الفرج (إلهي عظم البلاء)',

  maf_ziy128: 'دعاء العهد مع الإمام المهدي',
  'dua-al-ahd': 'دعاء العهد مع الإمام المهدي',
  'dua-ahd': 'دعاء العهد مع الإمام المهدي',
  ahad: 'دعاء العهد مع الإمام المهدي',

  maf_ziy73a: 'زيارة وارث لشهيد كربلاء',
  'ziyarat-waritha': 'زيارة وارث لشهيد كربلاء',
  waritha: 'زيارة وارث لشهيد كربلاء',

  maf_ziy92: 'زيارة الأربعين المشرفة',
  'ziyarat-arbaeen': 'زيارة الأربعين المشرفة',
  arbaeen: 'زيارة الأربعين المشرفة',

  maf_ziy124: 'زيارة آل ياسين لصاحب الزمان',
  'ziyarat-ale-yasin': 'زيارة آل ياسين لصاحب الزمان',

  maf_ziy134a: 'زيارة أمين الله لأمير المؤمنين',
  'ziyarat-ameenullah': 'زيارة أمين الله لأمير المؤمنين',

  maf_ziy132: 'الزيارة الجامعة الكبيرة',
  'ziyarat-jamiah-kabirah': 'الزيارة الجامعة الكبيرة',

  maf_ziy131: 'الزيارة الجامعة الصغيرة',
  nahiya: 'زيارة الناحية المقدسة',
  'ziyarat-nahiya': 'زيارة الناحية المقدسة',

  maf_ziy140a: 'زيارة السيدة فاطمة المعصومة عليها السلام',
  maf_ziy140: 'فضل زيارة السيدة فاطمة المعصومة بقم',

  maf_dua39: 'دعاء الصباح لمولى الموحدين أمير المؤمنين',
  'dua-sabah': 'دعاء الصباح لمولى الموحدين أمير المؤمنين',
  sabah: 'دعاء الصباح لمولى الموحدين أمير المؤمنين',

  maf_dua43: 'دعاء المشلول المروي عن أمير المؤمنين',
  'dua-mashlool': 'دعاء المشلول المروي عن أمير المؤمنين',
  mashlool: 'دعاء المشلول المروي عن أمير المؤمنين',

  maf_dua45: 'دعاء المجير المروي عن جبرئيل',
  'dua-mujeer': 'دعاء المجير المروي عن جبرئيل',
  mujir: 'دعاء المجير المروي عن جبرئيل',

  maf_aamal30: 'دعاء الافتتاح في ليالي شهر رمضان',
  'dua-iftitah': 'دعاء الافتتاح في ليالي شهر رمضان',
  iftitah: 'دعاء الافتتاح في ليالي شهر رمضان',

  maf_dua47: 'دعاء الجوشن الكبير المبارك',
  'dua-jawshan': 'دعاء الجوشن الكبير المبارك',
  jawshan: 'دعاء الجوشن الكبير المبارك',

  maf_dua48: 'دعاء الجوشن الصغير',
  maf_dua44: 'دعاء يستشير المروي عن النبي الأكرم',
  'dua-yastasheer': 'دعاء يستشير المروي عن النبي الأكرم',

  maf_dua46: 'دعاء العديلة عند الاحتضار',
  'dua-adilah': 'دعاء العديلة عند الاحتضار',

  maf_dua41: 'دعاء السمات المستجاب عصر الجمعة',
  'dua-simaat': 'دعاء السمات المستجاب عصر الجمعة',
  maf_dua42: 'دعاء السمات المبارك',

  maf_dua80: 'دعاء أبي حمزة الثمالي في سحر رمضان',
  maf_dua62: 'دعاء مكارم الأخلاق ومرضي الأفعال',
  maf_dua64: 'الاستغاثة بالحجة بن الحسن صاحب الزمان',
  maf_dua63: 'دعاء الحجة (اللهم كن لوليك)',
  asleh: 'دعاء اللهم أصلح عبدك وخليفتك',
  maf_ziy88: 'دعاء علقمة بعد زيارة عاشوراء',
  maf_dua49: 'دعاء السيفي الصغير (دعاء القاموس)',
  hazeen: 'دعاء الحزين المأثور في صلاة الليل',
  ghareeq: 'دعاء الغريق لتثبيت الإيمان في عصر الغيبة',
  meraj: 'دعاء المعراج الشريف',
  nadeali: 'دعاء نادِ علي مظهر العجائب',
  maf_dua55: 'دعاء النور المأثور عن سيدة نساء العالمين',

  // -------------------------------------------------------------
  // ALL 65 NAMAZ & SPECIAL PRAYERS (Authentic Classical Arabic)
  // -------------------------------------------------------------
  maf_baqe47: 'فضل وبركات صلاة الليل (التهجد)',
  maf_baqe48: 'كيفية صلاة الليل (أحد عشر ركعة)',
  maf_baqe48a: 'مختصر صلاة الليل للمستعجل',
  nam_ayat: 'صلاة الآيات المفروضة عند الكسوف والزلازل',
  maf_dua4a: 'صلاة الغفيلة بين المغرب والعشاء',
  maf_dua20: 'صلاة الكاملة المروية عن الإمام الصادق',
  maf_baqe246: 'صلاة الميت والأدعية المأثورة فيها',
  nam_nawafil: 'نوافل الصلوات اليومية المستحبة',
  maf_baqe74: 'صلاة الوحشة للميت (ليلة الدفن)',
  maf_baqe76: 'صلاة لمغفرة الوالدين وبرهما',
  maf_dua26: 'صلاة جعفر الطيار عليه السلام (صلاة التسبيح)',
  maf_aamal70: 'صلاة عيدي الفطر والأضحى',
  maf_baqe73: 'صلاة هدية المعصومين عليهم السلام',
  maf_dua21: 'صلاة النبي الأعظم صلى الله عليه وآله',
  maf_dua23: 'صلاة السيدة فاطمة الزهراء عليها السلام',
  maf_dua22: 'صلاة أمير المؤمنين علي بن أبي طالب عليه السلام',
  maf_dua24b: 'صلاة سيد الشهداء الإمام الحسين عليه السلام',
  maf_dua24: 'صلاة الإمام الحسن المجتبى عليه السلام',
  maf_dua24h: 'صلاة الإمام جعفر بن محمد الصادق عليه السلام',
  maf_dua24n: 'صلاة الإمام محمد بن علي الجواد عليه السلام',
  maf_dua24p: 'صلاة الإمام علي بن محمد الهادي عليه السلام',
  maf_dua24f: 'صلاة الإمام محمد بن علي الباقر عليه السلام',
  maf_dua24d: 'صلاة الإمام علي بن الحسين السجاد عليه السلام',
  maf_dua25: 'صلاة صاحب الزمان الإمام المهدي عجل الله فرجه',
  maf_dua24r: 'صلاة الإمام الحسن بن علي العسكري عليه السلام',
  maf_dua24j: 'صلاة الإمام موسى بن جعفر الكاظم عليه السلام',
  maf_dua24l: 'صلاة الإمام علي بن موسى الرضا عليه السلام',
  maf_baqe109: 'صلاة يوم السبت المستحبة',
  maf_baqe109a: 'صلاة يوم الأحد المستحبة',
  maf_baqe109b: 'صلاة يوم الإثنين المستحبة',
  maf_baqe109c: 'صلاة يوم الثلاثاء المستحبة',
  maf_baqe109d: 'صلاة يوم الأربعاء المستحبة',
  maf_baqe109e: 'صلاة يوم الخميس المستحبة',
  maf_baqe109f: 'صلاة يوم الجمعة المبارك',
  maf_baqe92: 'صلاة قضاء الحوائج والمهمات (الرواية الأولى)',
  maf_baqe93: 'صلاة قضاء الحوائج والمهمات (الرواية الثانية)',
  maf_baqe94: 'صلاة قضاء الحوائج والمهمات (الرواية الثالثة)',
  maf_baqe95: 'صلاة قضاء الحوائج والمهمات (الرواية الرابعة)',
  maf_baqe97: 'صلاة قضاء الحوائج والمهمات (الرواية الخامسة)',
  maf_baqe91: 'صلاة تيسير الأمور وقضاء الحوائج',
  maf_baqe89: 'صلاة سعة الرزق والبركة في المعيشة',
  maf_baqe90: 'صلاة أخرى مجربة لزيادة الرزق',
  maf_baqe102: 'صلاة ركعتين في مسجد جمكران المقدس',
  maf_baqe223: 'صلاة التعويذ والحفظ من السوء',
  maf_baqe104: 'صلاة لدفع خوف الظالم والجور',
  maf_baqe105: 'صلاة لقوة الحفظ وجودة الفهم والذكاء',
  maf_baqe99: 'صلاة الاستعانة بالله تعالى في الشدائد',
  maf_baqe100: 'صلاة الاستغاثة بالبتول فاطمة الزهراء عليها السلام',
  maf_baqe85: 'صلاة أداء الديون والخلاص من الجبابرة',
  maf_baqe101: 'صلاة الاستغاثة بالنبي والوصي لكشف الكرب',
  maf_baqe87: 'صلاة الحاجة المستعجلة والملمات',
  maf_baqe86: 'صلاة المهمات ودفع البلايا',
  maf_baqe78: 'صلاة دفع وساوس النفس والشيطان',
  n_travel: 'صلاة المسافر طلباً للسلامة والتوفيق',
  maf_baqe88: 'صلاة كشف الشدائد وتفريج الكروب',
  maf_baqe106: 'صلاة الاستغفار والتوبة النصوح',
  maf_baqe189: 'صلاة لتفريج الغموم ودفع الهموم',
  maf_baqe187: 'صلاة الإمام موسى الكاظم (ع) لدفع شر الأعداء',
  maf_baqe188: 'صلاة الإمام محمد الجواد (ع) لدفع المكاره',
  maf_baqe186: 'صلاة الإمام جعفر الصادق (ع) لدفع البلاء',
  maf_baqe108: 'صلاة العفو والتذلل لرب العالمين',
  maf_baqe107: 'صلاة الوصية',
  maf_baqe96: 'صلاة ليلة الجمعة وليلة عيد الأضحى للحوائج',
  maf_baqe72: 'صلاة الأعرابي المروية عن النبي',
  maf_baqe77: 'صلاة الجائع لدفع الفاقة والفقر',

  // -------------------------------------------------------------
  // TAQIBAAT E NAMAZ (Post-Prayer Devotions)
  // -------------------------------------------------------------
  maf_dua1: 'التعقيبات العامة المشتركة بعد كل فريضة',
  maf_dua2: 'تعقيب صلاة الظهر المأثور',
  maf_dua3: 'تعقيب صلاة العصر المأثور',
  maf_dua4: 'تعقيب صلاة المغرب المأثور',
  maf_dua5: 'تعقيب صلاة العشاء المأثور',
  maf_dua6: 'تعقيب صلاة الفجر (الرواية الثانية)',
  dua_after: 'الأدعية المأثورة عقيب الصلوات الواجبة',
  maf_baqe49: 'نافلة صلاة الفجر وفضلها',
  maf_baqe37: 'تعقيب صلاة العصر ونافلتها',
  maf_baqe22: 'تعقيب صلاة الصبح الخاصة',
  maf_baqe35: 'نافلة صلاة الظهر المندوبة',

  // -------------------------------------------------------------
  // 15 WHISPERED PRAYERS (MUNAJAAT) OF IMAM SAJJAD (A.S)
  // -------------------------------------------------------------
  sah_whis1: 'المناجاة الأولى: مناجاة التائبين',
  sah_whis2: 'المناجاة الثانية: مناجاة الشاكين',
  sah_whis3: 'المناجاة الثالثة: مناجاة الخائفين',
  sah_whis4: 'المناجاة الرابعة: مناجاة الراجين',
  sah_whis5: 'المناجاة الخامسة: مناجاة الراغبين',
  sah_whis6: 'المناجاة السادسة: مناجاة الشاكرين',
  sah_whis7: 'المناجاة السابعة: مناجاة المطيعين لله',
  sah_whis8: 'المناجاة الثامنة: مناجاة المريدين',
  sah_whis9: 'المناجاة التاسعة: مناجاة المحبين',
  sah_whis10: 'المناجاة العاشرة: مناجاة المتوسلين',
  sah_whis11: 'المناجاة الحادية عشرة: مناجاة المفتقرين',
  sah_whis12: 'المناجاة الثانية عشرة: مناجاة العارفين',
  sah_whis13: 'المناجاة الثالثة عشرة: مناجاة الذاكرين',
  sah_whis14: 'المناجاة الرابعة عشرة: مناجاة المعتصمين',
  sah_whis15: 'المناجاة الخامسة عشرة: مناجاة الزاهدين',

  // -------------------------------------------------------------
  // DAILY RECITATIONS & FRIDAY DEEDS
  // -------------------------------------------------------------
  maf_dua10: 'دعاء يوم السبت',
  maf_dua11: 'دعاء يوم الأحد',
  maf_dua12: 'دعاء يوم الإثنين',
  maf_dua13: 'دعاء يوم الثلاثاء',
  maf_dua14: 'دعاء يوم الأربعاء',
  maf_dua15: 'دعاء يوم الخميس',
  maf_dua16: 'دعاء يوم الجمعة المبارك',
  maf_dua17: 'فضائل وآداب ليلة الجمعة ويومها',
  maf_dua18: 'فضل تسبيح سبحان الله وبحمده',
  maf_dua18a: 'فضل الصلاة على محمد وآل محمد',
  maf_dua18c: 'فضل الاستغفار وسيد الاستغفار',
  maf_dua18d: 'فضل قراءة السور المأثورة في الجمعة',
  maf_dua18e: 'صلاة أمير المؤمنين علي عليه السلام في الجمعة',
  maf_dua18f: 'دعاء نافلة يوم الجمعة',
  maf_dua18g: 'أذكار مكررة سبع مرات يوم الجمعة',
  maf_dua18h: 'دعاء مبارك في سحر ليلة الجمعة',
  maf_dua18i: 'دعاء الاستغفار والتضرع في الجمعة',
  maf_dua18j: 'أذكار مكررة عشر مرات في الجمعة',
  maf_dua18k: 'مستحبات وسنن يوم الجمعة المبارك',
  maf_dua18l: 'أذكار بين نافلة الفجر وفريضة الصبح',
  maf_dua18m: 'دعاء الصباح المأثور ليوم الجمعة',
  maf_dua18n: 'أدعية وأذكار سحر يوم الجمعة',
  maf_dua19: 'السنن المندوبة ليوم الجمعة',
  maf_dua27: 'أعمال ظهر يوم الجمعة',
  maf_dua28: 'أعمال عصر يوم الجمعة والغفيلة',
  imp_shabe_jum: 'فضل وأهمية ليلة الجمعة المباركة',

  // -------------------------------------------------------------
  // DAILY ZIYARAAT OF THE INVIOLABLE APOSTLES
  // -------------------------------------------------------------
  maf_dua30: 'زيارة خاتم الأنبياء محمد (ص) في يوم السبت',
  maf_dua31: 'زيارة أمير المؤمنين علي بن أبي طالب (ع) في يوم الأحد',
  maf_dua32: 'زيارة سيدة نساء العالمين فاطمة الزهراء (س) في يوم الأحد',
  maf_dua33: 'زيارة الإمام الحسن المجتبى (ع) في يوم الإثنين',
  maf_dua34: 'زيارة سيد الشهداء الإمام الحسين (ع) في يوم الإثنين',
  maf_dua35: 'زيارة أئمة البقيع: السجاد والباقر والصادق (ع) في يوم الثلاثاء',
  maf_dua36: 'زيارة الأئمة: الكاظم والرضا والجواد والهادي (ع) في يوم الأربعاء',
  maf_dua37: 'زيارة الإمام الحسن بن علي العسكري (ع) في يوم الخميس',
  maf_dua38: 'زيارة بقية الله الإمام المهدي (عج) في يوم الجمعة',

  // -------------------------------------------------------------
  // ZIYARAAT OF THE HOLY IMMACULATES & EXTENSIONS
  // -------------------------------------------------------------
  maf_ziy141: 'زيارة قمر بني هاشم أبي الفضل العباس عليه السلام',
  maf_ziy141a: 'زيارة السيد عبد العظيم الحسني عليه السلام',
  maf_ziy142: 'زيارة السيد حمزة بن الإمام الكاظم عليه السلام',
  maf_ziy144: 'زيارة السيدة فاطمة الزهراء عليها السلام',
  maf_ziy145: 'زيارة خاتم الأنبياء والمرسلين محمد صلى الله عليه وآله',
  maf_ziy83: 'زيارة الإمام الحسين عليه السلام في ليالي القدر والعيدين',
  maf_ziy138: 'زيارة الإمام علي بن موسى الرضا عليه السلام في مشهد',
  maf_ziy139: 'زيارة الإمامين الهمامين الكاظميين عليهما السلام',
  maf_ziy135: 'زيارة أئمة البقيع المشرفة بالمدينة المنورة',
  maf_ziy127: 'زيارة صاحب الزمان عليه السلام بعد صلاة الفجر',
  maf_ziy124c: 'الزيارة الثالثة للإمام المهدي (عج) - الحق الجديد',
  maf_ziy134: 'الزيارة الجامعة الأولى في يوم عرفة',
  maf_ziy134b: 'الزيارة الجامعة الثالثة',
  maf_ziy133: 'قصة لقاء السيد الرشتي بالإمام المهدي (عج)',
  maf_ziy137: 'فضل زيارة قبور الصالحين والعلماء',
  maf_ziy143: 'آداب زيارة قبور المؤمنين وإهداء الفاتحة',
  maf_addit3: 'الزيارة الجامعة لأئمة الهدى عليهم السلام',
  maf_addit8: 'آداب الزيارة بالنيابة عن المؤمنين',
  maf_addit5: 'وداع مراقد الأئمة المعصومين عليهم السلام',
  maf_aamal91: 'زيارة التعزية في مصاب أهل البيت',
  maf_aamal88: 'أعمال ليلة القدر المباركة',
};

// Clean and validate Arabic string to ensure zero Latin characters appear
export function sanitizeArabicTitle(title: string): string {
  if (!title) return '';
  let cleaned = title.trim();
  // If there are English or Latin letters in the title, strip them out or replace them
  cleaned = cleaned.replace(/[a-zA-Z]/g, '').trim();
  // Remove unbalanced empty parentheses or stray punctuation left from stripping Latin
  cleaned = cleaned.replace(/\(\s*\)/g, '').replace(/\[\s*\]/g, '').replace(/[-–—]\s*$/, '').trim();
  return cleaned;
}

// -------------------------------------------------------------
// ALGORITHMIC STRUCTURAL ARABIC GENERATOR
// Converts ANY English / Roman-Urdu / mixed title into flawless,
// grammatically structured classical Arabic calligraphy.
// -------------------------------------------------------------
export function getMafatihArabicTitle(id: string, rawTitle?: string, mainCategory?: string): string {
  // 1. Direct dictionary lookup by full ID
  if (KNOWN_MAFATIH_ARABIC_TITLES[id]) {
    return KNOWN_MAFATIH_ARABIC_TITLES[id];
  }

  // 2. Normalized ID lookup (stripping prefixes)
  const cleanId = (id || '').replace(/^(maf_|dua-|ziyarat-|namaz-)/, '');
  if (KNOWN_MAFATIH_ARABIC_TITLES[cleanId]) {
    return KNOWN_MAFATIH_ARABIC_TITLES[cleanId];
  }

  // 3. Sahifa Sajjadiyyah pattern (sah_suppX or DUA : X)
  const sahifaMatch = (id || '').match(/sah_supp(\d+)/i) || (rawTitle || '').match(/DUA\s*:\s*(\d+)/i);
  if (sahifaMatch) {
    const num = parseInt(sahifaMatch[1], 10);
    const SAHIFA_ARABIC: Record<number, string> = {
      1: 'التحميد لله عز وجل والثناء عليه',
      2: 'الصلاة على رسول الله وآله الأطهار',
      3: 'الصلاة على حملة العرش والمقربين',
      4: 'الصلاة على أتباع الرسل والمؤمنين',
      5: 'دعاؤه لنفسه وأهل ولايته',
      6: 'دعاؤه عند الصباح والمساء',
      7: 'دعاؤه في المهمات ودفع البلاء والشدائد',
      8: 'الاستعاذة من المكاره وسوء الأخلاق',
      9: 'طلب المغفرة والرحمة من الله تعالى',
      10: 'اللجأ إلى الله تعالى والاعتصام به',
      11: 'طلب حسن العاقبة وخواتيم الخير',
      12: 'الاعتراف بالتقصير وطلب التوبة النصوح',
      13: 'طلب الحوائج المشروعة من الله تعالى',
      14: 'دعاؤه عند ظلامة الظالمين والانتصار',
      15: 'دعاؤه عند المرض والشدة والأوجاع',
      16: 'طلب الاستقالة من الذنوب والآثام',
      17: 'الاستعاذة من شر الشيطان ومكائده',
      18: 'دعاؤه عند دفع المحذور وسلامة النفس',
      19: 'الاستسقاء عند الجدب وانحباس المطر',
      20: 'دعاء مكارم الأخلاق ومرضي الأفعال',
      21: 'دعاؤه إذا حزنه أمر وأهمه خطب',
      22: 'دعاؤه عند الشدة والجهد وتعسر الأمور',
      23: 'طلب العافية والشكر عليها',
      24: 'دعاؤه لأبويه عليهما السلام والبر بهما',
      25: 'دعاؤه لولده عليهم السلام وصلاحهم',
      26: 'دعاؤه لجيرانه وأوليائه المؤمنين',
      27: 'دعاؤه لأهل الثغور وحماة حريم المسلمين',
      28: 'الفزع إلى الله عز وجل في الملمات',
      29: 'دعاؤه إذا قتر عليه الرزق واستبطأه',
      30: 'المعونة على قضاء الدين وسداد الحقوق',
      31: 'دعاؤه بذكر التوبة والإنابة إلى الله',
      32: 'دعاؤه في صلاة الليل واعترافه بالذنب',
      33: 'طلب الخيرة والاستخارة الصالحة',
      34: 'دعاؤه إذا ابتلي أو رأى مبتلى بذنب',
      35: 'الرضا بالقضاء والقدر الإلهي',
      36: 'دعاؤه عند سماع الرعد ورؤية البرق',
      37: 'الشكر لله تعالى والاعتراف بالتقصير',
      38: 'الاعتذار من تبعات العباد وحقوقهم',
      39: 'طلب العفو والرحمة والصفح الجميل',
      40: 'ذكر الموت وقصر الأمل والاستعداد للآخرة',
      41: 'طلب الستر والوقاية من الفضائح',
      42: 'دعاؤه عند ختم القرآن الكريم وتلاوته',
      43: 'دعاؤه عند رؤية الهلال ودخول الشهور',
      44: 'دعاؤه لدخول شهر رمضان المبارك',
      45: 'دعاؤه لوداع شهر رمضان المبارك',
      46: 'دعاؤه في عيد الفطر ويوم الجمعة',
      47: 'دعاؤه المبارك في يوم عرفة',
      48: 'دعاؤه في يوم الأضحى المبارك والجمعة',
      49: 'دفع كيد الأعداء ورد بأسهم ونكايتهم',
      50: 'دعاؤه في التضرع والاستكانة والخضوع',
      51: 'التذلل لله عز وجل وإظهار الفاقة',
      52: 'الإلحاح على الله تعالى في المسألة',
      53: 'الخضوع والاستكانة لجلال الله',
      54: 'استكشاف الهموم وكشف الغموم الملمة',
    };
    if (SAHIFA_ARABIC[num]) {
      return `دعاء ${num}: ${SAHIFA_ARABIC[num]}`;
    }
    return `دعاء ${num} من الصحيفة السجادية`;
  }

  // 4. Sahifa Fatemiyyah pattern (Her supplications in...)
  if (rawTitle && /^(\d+)\.\s*Her\s+supplication/i.test(rawTitle)) {
    const numMatch = rawTitle.match(/^(\d+)\./);
    const num = numMatch ? numMatch[1] : '';
    const lower = rawTitle.toLowerCase();
    let topic = 'في المناجاة والتضرع لله';
    if (lower.includes('glorification') && lower.includes('third of the month')) {
      topic = 'في تسبيح الله وتمجيده في اليوم الثالث من الشهر';
    } else if (lower.includes('glorification')) {
      topic = 'في تسبيح الله عز وجل وتمجيده';
    } else if (lower.includes('praise of allah') && lower.includes('qualities')) {
      topic = 'في حمد الله وذكر صفاته الجليلة';
    } else if (lower.includes('praise of allah')) {
      topic = 'في حمد الله تعالى والثناء عليه';
    } else if (lower.includes('names of allah') || lower.includes('mediation')) {
      topic = 'في التوسل بأسماء الله الحسنى';
    } else if (lower.includes('blessings on the prophet') || lower.includes('progeny')) {
      topic = 'في الصلاة على النبي وآله الأطهار';
    } else if (lower.includes('forgiveness of sins')) {
      topic = 'في طلب مغفرة الذنوب والآثام';
    } else if (lower.includes('world and the hereafter')) {
      topic = 'في حوائج الدنيا والآخرة ومهماتها';
    } else if (lower.includes('noble morals')) {
      topic = 'في طلب مكارم الأخلاق ومرضي الأفعال';
    } else if (lower.includes('relief') || lower.includes('dispelling sorrow') || lower.includes('grief')) {
      topic = 'في تفريج الكرب ودفع الهم والأحزان';
    } else if (lower.includes('debts') || lower.includes('repayment')) {
      topic = 'في أداء الديون وتسخير الرزق الحلال';
    } else if (lower.includes('needs') || lower.includes('fulfillment')) {
      topic = 'في قضاء الحوائج ونيل المطالب';
    }
    return `دعاء ${num ? num + ': ' : ''}السيدة فاطمة الزهراء (ع) ${topic}`;
  }

  // 5. Clean up title string and match structural keywords
  const title = (rawTitle || '').trim();
  const lower = title.toLowerCase();

  // If already pure Arabic text without Latin characters, return cleaned
  if (/[\u0600-\u06FF]/.test(title) && !/[a-zA-Z]/.test(title)) {
    return title.trim();
  }

  // NAMAZ / SALAT / PRAYER
  if (lower.includes('namaz') || lower.includes('prayer') || lower.includes('salat')) {
    if (lower.includes('shab') || lower.includes('tahajjud') || lower.includes('night')) {
      if (lower.includes('short') || lower.includes('mukhtasar')) return 'مختصر صلاة الليل';
      if (lower.includes('merit') || lower.includes('virtue')) return 'فضيلة وبركات صلاة الليل';
      return 'كيفية صلاة الليل المباركة';
    }
    if (lower.includes('aayat') || lower.includes('ayat')) return 'صلاة الآيات المفروضة';
    if (lower.includes('ghufaylah') || lower.includes('ghofayla')) return 'صلاة الغفيلة المأثورة';
    if (lower.includes('kamilah')) return 'صلاة الكاملة المروية عن الصادق (ع)';
    if (lower.includes('mayyat') || lower.includes('funeral')) return 'صلاة الميت والأدعية المأثورة فيها';
    if (lower.includes('nawafil') || lower.includes('nafl')) return 'نوافل الصلوات اليومية المستحبة';
    if (lower.includes('wahshat') || lower.includes('burial')) return 'صلاة الوحشة (ليلة الدفن)';
    if (lower.includes('waledain') || lower.includes('parents')) return 'صلاة بر الوالدين والاستغفار لهما';
    if (lower.includes('jafar') || lower.includes('tayyar')) return 'صلاة جعفر الطيار عليه السلام';
    if (lower.includes('eid')) return 'صلاة عيدي الفطر والأضحى المباركين';
    if (lower.includes('hadiyah') && lower.includes('masoomeen')) return 'صلاة هدية المعصومين عليهم السلام';

    // Holy Imams Prayers
    if (lower.includes('holy prophet') || lower.includes('prophet(') || lower.includes('prophet (')) {
      return 'صلاة النبي الأعظم صلى الله عليه وآله';
    }
    if (lower.includes('fatimah') || lower.includes('zahra')) {
      return 'صلاة السيدة فاطمة الزهراء عليها السلام';
    }
    if (lower.includes('ali ameer') || lower.includes('ameerul') || lower.includes('imam ali')) {
      return 'صلاة أمير المؤمنين علي بن أبي طالب عليه السلام';
    }
    if (lower.includes('al husain') || lower.includes('hussain') || lower.includes('husayn')) {
      return 'صلاة سيد الشهداء الإمام الحسين عليه السلام';
    }
    if (lower.includes('al hasan') || lower.includes('hasan')) {
      return 'صلاة الإمام الحسن المجتبى عليه السلام';
    }
    if (lower.includes('jafar sadiq') || lower.includes('sadiq')) {
      return 'صلاة الإمام جعفر الصادق عليه السلام';
    }
    if (lower.includes('taqi') || lower.includes('jawad')) {
      return 'صلاة الإمام محمد بن علي الجواد عليه السلام';
    }
    if (lower.includes('naqi') || lower.includes('hadi')) {
      return 'صلاة الإمام علي بن محمد الهادي عليه السلام';
    }
    if (lower.includes('baqir')) {
      return 'صلاة الإمام محمد بن علي الباقر عليه السلام';
    }
    if (lower.includes('zayn') || lower.includes('sajjad')) {
      return 'صلاة الإمام علي زين العابدين عليه السلام';
    }
    if (lower.includes('reza') || lower.includes('rida')) {
      return 'صلاة الإمام علي بن موسى الرضا عليه السلام';
    }
    if (lower.includes('kazim') || lower.includes('kadhim')) {
      return 'صلاة الإمام موسى بن جعفر الكاظم عليه السلام';
    }
    if (lower.includes('askari')) {
      return 'صلاة الإمام الحسن العسكري عليه السلام';
    }
    if (lower.includes('mahdi') || lower.includes('zaman') || lower.includes('hujjah')) {
      return 'صلاة صاحب الزمان الإمام المهدي عجل الله فرجه';
    }
    if (lower.includes('jamkaran')) return 'صلاة مسجد جمكران المقدس';
    if (lower.includes('needs') || lower.includes('hajah') || lower.includes('hajat')) return 'صلاة قضاء الحوائج والمهمات';
    if (lower.includes('sustenance') || lower.includes('rizq')) return 'صلاة سعة الرزق والبركة';
    if (lower.includes('travel')) return 'صلاة المسافر طلباً للسلامة';
    if (lower.includes('forgiveness') || lower.includes('pardon')) return 'صلاة التوبة وطلب المغفرة والعفو';
    if (lower.includes('difficult') || lower.includes('hardship')) return 'صلاة كشف الشدائد وتفريج الكروب';

    return 'صلاة مباركة مأثورة';
  }

  // TAQIBAAT
  if (lower.includes('taqibaat') || lower.includes('taqibat') || lower.includes('taqeeb')) {
    if (lower.includes('fajr') || lower.includes('subh')) return 'تعقيب صلاة الفجر المأثور';
    if (lower.includes('zuhr') || lower.includes('dhuhr')) return 'تعقيب صلاة الظهر المأثور';
    if (lower.includes('asr')) return 'تعقيب صلاة العصر المأثور';
    if (lower.includes('maghrib')) return 'تعقيب صلاة المغرب المأثور';
    if (lower.includes('isha')) return 'تعقيب صلاة العشاء المأثور';
    return 'التعقيبات العامة المشتركة بعد الصلاة';
  }

  // ZIYARAT
  if (lower.includes('ziyarat') || lower.includes('ziyarah')) {
    if (lower.includes('arbaeen') || lower.includes('arba') || lower.includes('40th')) return 'زيارة الأربعين المشرفة';
    if (lower.includes('ashura')) return 'زيارة عاشوراء المشرفة';
    if (lower.includes('waritha') || lower.includes('wareth')) return 'زيارة وارث لشهيد كربلاء';
    if (lower.includes('yasin') || lower.includes('yaseen')) return 'زيارة آل ياسين لصاحب الزمان';
    if (lower.includes('ameenullah') || lower.includes('aminullah')) return 'زيارة أمين الله لأمير المؤمنين';
    if (lower.includes('nahiya')) return 'زيارة الناحية المقدسة الشريفة';
    if (lower.includes('jameah') || lower.includes('jamiah')) {
      if (lower.includes('kabeer') || lower.includes('kabirah')) return 'الزيارة الجامعة الكبيرة';
      return 'الزيارة الجامعة الصغيرة';
    }
    if (lower.includes('masumah') || lower.includes('masooma')) return 'زيارة السيدة فاطمة المعصومة عليها السلام';
    if (lower.includes('abbas')) return 'زيارة أبي الفضل العباس عليه السلام';
    if (lower.includes('prophet')) return 'زيارة خاتم الأنبياء محمد صلى الله عليه وآله';
    if (lower.includes('ali')) return 'زيارة أمير المؤمنين علي بن أبي طالب عليه السلام';
    if (lower.includes('fatimah') || lower.includes('zahra')) return 'زيارة السيدة فاطمة الزهراء عليها السلام';
    if (lower.includes('hasan')) return 'زيارة الإمام الحسن المجتبى عليه السلام';
    if (lower.includes('husain') || lower.includes('hussain')) return 'زيارة سيد الشهداء الإمام الحسين عليه السلام';
    if (lower.includes('mahdi') || lower.includes('zaman')) return 'زيارة صاحب الزمان الإمام المهدي عجل الله فرجه';
    return 'زيارة مباركة مأثورة للأئمة الأطهار';
  }

  // DUA
  if (lower.includes('dua') || lower.includes('supplication')) {
    if (lower.includes('kumayl') || lower.includes('kumail')) return 'دعاء كميل بن زياد';
    if (lower.includes('tawassul')) return 'دعاء التوسل بالأئمة المعصومين';
    if (lower.includes('faraj')) return 'دعاء الفرج (عظم البلاء)';
    if (lower.includes('ahad') || lower.includes('ahd')) return 'دعاء العهد مع الإمام المهدي';
    if (lower.includes('nudbah')) return 'دعاء الندبة لصاحب الزمان';
    if (lower.includes('sabah')) return 'دعاء الصباح لأمير المؤمنين';
    if (lower.includes('mashlool')) return 'دعاء المشلول للشاب المأخوذ بذنبه';
    if (lower.includes('mujeer')) return 'دعاء المجير المروي عن جبرئيل';
    if (lower.includes('iftitah')) return 'دعاء الافتتاح في ليالي رمضان';
    if (lower.includes('jawshan')) {
      if (lower.includes('sagheer') || lower.includes('saghir')) return 'دعاء الجوشن الصغير';
      return 'دعاء الجوشن الكبير';
    }
    if (lower.includes('adilah')) return 'دعاء العديلة عند الاحتضار';
    if (lower.includes('simaat') || lower.includes('simat')) return 'دعاء السمات المستجاب عصر الجمعة';
    if (lower.includes('yastasheer')) return 'دعاء يستشير المروي عن النبي';
    if (lower.includes('noor')) return 'دعاء النور المأثور عن سيدة نساء العالمين';
    if (lower.includes('hazeen')) return 'دعاء الحزين في صلاة الليل';
    if (lower.includes('hujjah')) return 'دعاء الحجة (اللهم كن لوليك)';
    if (lower.includes('istighathah')) return 'الاستغاثة بالإمام الحجة صاحب الزمان';
    return 'دعاء شريف مأثور عن أهل البيت';
  }

  // AAMAAL
  if (lower.includes('aamaal') || lower.includes('amal') || lower.includes('ritual')) {
    if (lower.includes('qadr')) return 'أعمال ليلة القدر المباركة';
    if (lower.includes('jumah') || lower.includes('friday')) return 'أعمال يوم الجمعة وليلته';
    if (lower.includes('ashura')) return 'أعمال يوم عاشوراء';
    if (lower.includes('arbaeen')) return 'أعمال يوم الأربعين';
    if (lower.includes('arafah')) return 'أعمال يوم عرفة المبارك';
    if (lower.includes('ramadan')) return 'أعمال شهر رمضان المبارك';
    if (lower.includes('rajab')) return 'أعمال شهر رجب الأصب';
    if (lower.includes('shaban')) return 'أعمال شهر شعبان المعظم';
    return 'أعمال مباركة مأثورة';
  }

  // MUNAJAAT
  if (lower.includes('munajaat') || lower.includes('munajat') || lower.includes('whispered')) {
    if (lower.includes('repenter') || lower.includes('taebeen')) return 'مناجاة التائبين';
    if (lower.includes('complainer') || lower.includes('shaakeen')) return 'مناجاة الشاكين';
    if (lower.includes('fearful') || lower.includes('khaefeen')) return 'مناجاة الخائفين';
    if (lower.includes('hopeful') || lower.includes('raajeen')) return 'مناجاة الراجين';
    if (lower.includes('willing') || lower.includes('raghibeen')) return 'مناجاة الراغبين';
    if (lower.includes('thankful') || lower.includes('shakereen')) return 'مناجاة الشاكرين';
    if (lower.includes('obedient') || lower.includes('mutieen')) return 'مناجاة المطيعين لله';
    if (lower.includes('devotee') || lower.includes('mureedeen')) return 'مناجاة المريدين';
    if (lower.includes('lover') || lower.includes('muhibbeen')) return 'مناجاة المحبين';
    if (lower.includes('beseecher') || lower.includes('mutawassileen')) return 'مناجاة المتوسلين';
    if (lower.includes('poor') || lower.includes('muftaqireen')) return 'مناجاة المفتقرين';
    if (lower.includes('knowers') || lower.includes('arifeen')) return 'مناجاة العارفين';
    if (lower.includes('rememberer') || lower.includes('zakireen')) return 'مناجاة الذاكرين';
    if (lower.includes('holder') || lower.includes('mutasimeen')) return 'مناجاة المعتصمين';
    if (lower.includes('ascetic') || lower.includes('zahideen')) return 'مناجاة الزاهدين';
    return 'مناجاة شريفة مأثورة';
  }

  // CATEGORY-BASED FALLBACK (Guarantees ZERO English characters ever returned)
  const catLower = (mainCategory || '').toLowerCase();
  if (catLower.includes('namaz') || catLower.includes('prayer')) {
    return 'صلاة مباركة مأثورة';
  }
  if (catLower.includes('ziyarat')) {
    return 'زيارة شريفة مأثورة';
  }
  if (catLower.includes('dua') || catLower.includes('supplication')) {
    return 'دعاء شريف مأثور';
  }
  if (catLower.includes('munajaat')) {
    return 'مناجاة خاشعة مأثورة';
  }
  if (catLower.includes('aamaal')) {
    return 'عمل مأثور ومستحب';
  }
  if (catLower.includes('taqibaat')) {
    return 'تعقيب مبارك بعد الصلاة';
  }
  if (catLower.includes('baqiyaat')) {
    return 'من باقيات الصالحات المأثورة';
  }
  if (catLower.includes('sajjadiyyah')) {
    return 'دعاء من الصحيفة السجادية المباركة';
  }
  if (catLower.includes('fatemiyyah')) {
    return 'دعاء من الصحيفة الفاطمية المباركة';
  }
  if (catLower.includes('mahdiyyah')) {
    return 'دعاء وصلاة من الصحيفة المهدوية';
  }

  return 'دعاء مبارك مأثور عن أهل البيت';
}

// -------------------------------------------------------------
// POLISHED SCHOLARLY ENGLISH TITLE FORMATTER
// Cleans broken shorthand, raw numbers, and noisy abbreviations.
// -------------------------------------------------------------
export function getMafatihEnglishTitle(id: string, rawTitle?: string): string {
  const title = (rawTitle || '').trim();
  if (!title) return 'Supplication';

  // Sahifa Sajjadiyyah Canonical English Invocations
  const sahifaMatch = (id || '').match(/sah_supp(\d+)/i) || title.match(/DUA\s*:\s*(\d+)/i);
  if (sahifaMatch) {
    const num = parseInt(sahifaMatch[1], 10);
    const SAHIFA_ENGLISH: Record<number, string> = {
      1: 'Dua 1: Praise of God (Al-Hamd)',
      2: 'Dua 2: Blessing upon Muhammad and his Household',
      3: 'Dua 3: Blessing upon the Bearers of the Throne',
      4: 'Dua 4: Blessing upon the Attesters to the Messengers',
      5: 'Dua 5: Invocations for Himself and his Friends',
      6: 'Dua 6: Supplication for Morning and Evening',
      7: 'Dua 7: Invocations in Distressing and Grievous Events',
      8: 'Dua 8: Seeking Refuge from Reprehensible Morals',
      9: 'Dua 9: Seeking Pardon and Forgiveness',
      10: 'Dua 10: Seeking Asylum with Almighty God',
      11: 'Dua 11: Supplication for Good Endings (Husn al-Khatimah)',
      12: 'Dua 12: Confession of Shortcomings and Seeking Repentance',
      13: 'Dua 13: Supplication in Seeking Needs from God',
      14: 'Dua 14: Supplication in Acts of Wrongdoing by Tyrants',
      15: 'Dua 15: Supplication when Sick and in Sickness',
      16: 'Dua 16: Supplication in Asking for Release from Sins',
      17: 'Dua 17: Seeking Refuge from the Evil of Satan',
      18: 'Dua 18: Supplication when Perils are Dispelled',
      19: 'Dua 19: Supplication in Asking for Water during Drought',
      20: 'Dua 20: Makarim al-Akhlaq (Noble Moral Traits)',
      21: 'Dua 21: Supplication when Something Made Him Sad',
      22: 'Dua 22: Supplication in Hardship and Difficulty',
      23: 'Dua 23: Supplication for Well-Being (Afiyah) and Thanks',
      24: 'Dua 24: Supplication for his Parents (Peace be upon them)',
      25: 'Dua 25: Supplication for his Children',
      26: 'Dua 26: Supplication for his Neighbors and Friends',
      27: 'Dua 27: Supplication for the People of the Frontiers',
      28: 'Dua 28: Fleeing to God in Distress and Tribulations',
      29: 'Dua 29: Supplication when his Provision was Constricted',
      30: 'Dua 30: Supplication for Help in Repaying Debts',
      31: 'Dua 31: Supplication in Mentioning and Asking for Repentance',
      32: 'Dua 32: Supplication after the Night Prayer (Tahajjud)',
      33: 'Dua 33: Supplication in Asking for the Best (Istikharah)',
      34: 'Dua 34: Supplication when Afflicted with a Trial',
      35: 'Dua 35: Supplication in Satisfaction with Divine Decree',
      36: 'Dua 36: Supplication upon Hearing Thunder and Lightning',
      37: 'Dua 37: Supplication in Giving Thanks to God',
      38: 'Dua 38: Supplication in Asking for Pardon for Wrongs',
      39: 'Dua 39: Supplication in Seeking Forgiveness and Mercy',
      40: 'Dua 40: Supplication in Mentioning Death and Shortness of Hope',
      41: 'Dua 41: Supplication in Asking for Covering and Protection',
      42: 'Dua 42: Supplication upon Completing the Recitation of the Quran',
      43: 'Dua 43: Supplication upon Sighting the Crescent Moon',
      44: 'Dua 44: Supplication for the Incoming of the Month of Ramadan',
      45: 'Dua 45: Supplication in Bidding Farewell to Month of Ramadan',
      46: 'Dua 46: Supplication on the Day of Eid al-Fitr and Friday',
      47: 'Dua 47: Supplication on the Day of Arafah',
      48: 'Dua 48: Supplication on the Day of Eid al-Adha and Friday',
      49: 'Dua 49: Supplication in Repelling the Trickery of Enemies',
      50: 'Dua 50: Supplication in Fear and Awe of God',
      51: 'Dua 51: Supplication in Pleading and Abasement',
      52: 'Dua 52: Supplication in Imploring and Beseeching God',
      53: 'Dua 53: Supplication in Abasement of Himself',
      54: 'Dua 54: Supplication for Removal of Worries and Sorrows',
    };
    if (SAHIFA_ENGLISH[num]) return SAHIFA_ENGLISH[num];
    return `Dua ${num} (Sahifa Sajjadiyyah)`;
  }

  // Normalize clumsy honorific shorthands into dignified academic presentation
  let cleaned = title
    .replace(/\s*\(a\.t\.f\.s\.?\)/gi, ' (a.j)')
    .replace(/\s*\(s\.a\.w\.w\.?\)/gi, ' (s.a.w)')
    .replace(/\s*\(s\.a\.?\)/gi, ' (s.a)')
    .replace(/\s*\(a\.s\.?\)/gi, ' (a.s)')
    .replace(/\s*\(s\)/gi, ' (s.a.w)')
    .replace(/\s*\(a\)/gi, ' (a.s)')
    .replace(/\s*\(1\)$/, ' (Part 1)')
    .replace(/\s*\(2\)$/, ' (Part 2)')
    .replace(/\s*\(3\)$/, ' (Part 3)')
    .replace(/\s*\(4\)$/, ' (Part 4)')
    .replace(/\s*\(5\)$/, ' (Part 5)')
    .trim();

  // Polish common prayer titles
  if (/^Namaz\s+of\s+Holy\s+Prophet/i.test(cleaned)) {
    return 'Prayer of the Holy Prophet Muhammad (s.a.w)';
  }
  if (/^Namaz\s+of\s+Lady\s+Fatimah/i.test(cleaned)) {
    return 'Prayer of Lady Fatimah al-Zahra (s.a)';
  }
  if (/^Namaz\s+of\s+Imam\s+Ali/i.test(cleaned)) {
    return "Prayer of Imam Ali Amir al-Mu'minin (a.s)";
  }
  if (/^Namaz\s+e\s+Kamilah/i.test(cleaned)) {
    return 'Salat al-Kamilah (Comprehensive Prayer)';
  }
  if (/^Namaz\s+e\s+Mayyat/i.test(cleaned)) {
    return 'Salat al-Mayyit (Funeral Prayer)';
  }
  if (/^Namaz\s+e\s+Nawafil/i.test(cleaned)) {
    return 'Daily Nawafil (Recommended Prayers)';
  }
  if (/^Namaz\s+e\s+Wahshat/i.test(cleaned)) {
    return 'Salat al-Wahshah (First Night of Burial Prayer)';
  }
  if (/^Namaz\s+e\s+Maghferat\s+e\s+Waledain/i.test(cleaned)) {
    return 'Salat for Forgiveness of Parents';
  }
  if (/^Namaz\s+of\s+Jafar\s+e\s+Tayyar/i.test(cleaned)) {
    return "Salat of Ja'far al-Tayyar (Prayer of Praise)";
  }
  if (/^Eid\s+Prayer/i.test(cleaned)) {
    return 'Eid al-Fitr and Eid al-Adha Prayers';
  }

  return cleaned;
}
