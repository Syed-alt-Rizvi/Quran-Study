import React, { useState, useEffect, useMemo, memo } from 'react';
import { 
  Play, 
  Pause, 
  Search, 
  Headphones, 
  Volume2, 
  X, 
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { MAFATIH_COLLECTION } from '../data/mafatihData';
import { getFullIndex, MafatihSummary } from '../mafatihApi';
import { useMafatihAudioStore } from '../mafatihAudioStore';
import { useSettingsStore } from '../store';
import { t } from '../i18n';
import { getMafatihUrduTitle, getMafatihUrduCategory, toUrduNumerals } from '../utils/mafatihUrdu';
import { hapticImpact, ImpactStyle } from '../utils/haptics';
import { normalizeSearchQuery, matchesSearch } from '../utils/arabicSearch';

interface MafatihViewProps {
  onSelectItem?: (id: string) => void;
}

type CategoryKey = 'all' | 'ziyarat' | 'dua' | 'munajat' | 'aamaal' | 'namaz' | 'sahifa' | 'baqiyaat';

interface CategoryTab {
  id: CategoryKey;
  labelEn: string;
  labelUr: string;
  labelAr: string;
}

const CATEGORIES: CategoryTab[] = [
  { id: 'all', labelEn: 'All', labelUr: 'تمام', labelAr: 'الكل' },
  { id: 'ziyarat', labelEn: 'Ziyaraat', labelUr: 'زیارات', labelAr: 'زيارات' },
  { id: 'dua', labelEn: 'Duas', labelUr: 'ادعیہ', labelAr: 'أدعية' },
  { id: 'munajat', labelEn: 'Munajaat', labelUr: 'مناجات', labelAr: 'مناجاة' },
  { id: 'aamaal', labelEn: 'Aamaal', labelUr: 'اعمال', labelAr: 'أعمال' },
  { id: 'namaz', labelEn: 'Taqibaat', labelUr: 'تعقیبات', labelAr: 'تعقيبات' },
  { id: 'sahifa', labelEn: 'Sahifa', labelUr: 'صحیفۂ سجادیہ', labelAr: 'الصحائف' },
  { id: 'baqiyaat', labelEn: 'Baqiyaat', labelUr: 'باقیات الصالحات', labelAr: 'باقيات' },
];

const ARABIC_TITLE_MAP: Record<string, string> = {
  maf_dua40: 'دعاء كميل بن زياد',
  maf_ziy86: 'زيارة عاشوراء',
  maf_dua51: 'دعاء التوسل بالأئمة',
  h_kisa: 'حديث الكساء اليماني',
  maf_ziy126a: 'دعاء الندبة للمهدی',
  maf_dua46b: 'دعاء الفرج (عظم البلاء)',
  maf_ziy128: 'دعاء العهد مع الإمام',
  maf_ziy73a: 'زيارة وارث لشهيد كربلاء',
  maf_ziy92: 'زيارة الأربعين',
  maf_ziy124: 'زيارة آل ياسين',
  maf_ziy134a: 'زيارة أمين الله لأمير المؤمنين',
  maf_ziy132: 'الزيارة الجامعة الكبيرة',
  nahiya: 'زيارة الناحية المقدسة',
  maf_ziy140a: 'زيارة السيدة فاطمة المعصومة',
  maf_dua39: 'دعاء الصباح لمولى الموحدين',
  maf_dua43: 'دعاء المشلول للشاب المأخوذ بذنبه',
  maf_dua45: 'دعاء المجير المستجاب',
  maf_aamal30: 'دعاء الافتتاح في ليالي رمضان',
  maf_dua47: 'دعاء الجوشن الكبير',
  maf_dua48: 'دعاء الجوشن الصغير',
  maf_dua44: 'دعاء يستشير المروي عن النبي',
  maf_dua46: 'دعاء العديلة عند الاحتضار',
  maf_dua41: 'دعاء السمات',
  maf_ziy131: 'زيارة الجامعة الصغيرة',
  maf_ziy141: 'زيارة أبي الفضل العباس',
  maf_ziy144: 'زيارة سيدة نساء العالمين فاطمة',
  maf_ziy145: 'زيارة خاتم الأنبياء محمد',
  maf_ziy83: 'زيارة أمير المؤمنين علي',
  maf_ziy138: 'زيارة شمس الشموس علي بن موسى الرضا',
};

function getArabicTitle(id: string, englishTitle: string): string {
  if (ARABIC_TITLE_MAP[id]) return ARABIC_TITLE_MAP[id];
  const lower = englishTitle.toLowerCase();
  if (lower.startsWith('ziyarat')) {
    return 'زيارة ' + englishTitle.replace(/^ziyarat\s+(e\s+|of\s+)?/i, '');
  }
  if (lower.startsWith('dua')) {
    return 'دعاء ' + englishTitle.replace(/^dua\s+(e\s+|of\s+)?/i, '');
  }
  if (lower.startsWith('munajaat') || lower.startsWith('whispered')) {
    return 'مناجاة ' + englishTitle.replace(/^(munajaat|whispered\s+prayer)\s+(of\s+|the\s+)?/i, '');
  }
  if (lower.startsWith('aamaal')) {
    return 'أعمال ' + englishTitle.replace(/^aamaal\s+(of\s+|for\s+)?/i, '');
  }
  if (lower.startsWith('namaz') || lower.startsWith('taqibaat')) {
    return 'تعقيب ' + englishTitle.replace(/^(namaz|taqibaat)\s+(e\s+|of\s+)?/i, '');
  }
  return englishTitle;
}

const FEATURED_ITEMS = [
  { id: 'maf_dua40', titleEn: 'Dua Kumayl', titleUr: 'دعائے کمیل', titleAr: 'دعاء كميل', cat: 'Duas' },
  { id: 'maf_ziy86', titleEn: 'Ziyarat Ashura', titleUr: 'زیارتِ عاشورہ', titleAr: 'زيارة عاشوراء', cat: 'Ziyaraat' },
  { id: 'maf_dua51', titleEn: 'Dua Tawassul', titleUr: 'دعائے توسل', titleAr: 'دعاء التوسل', cat: 'Duas' },
  { id: 'h_kisa', titleEn: 'Hadith al-Kisa', titleUr: 'حدیثِ کساء', titleAr: 'حديث الكساء', cat: 'Supplications' },
  { id: 'maf_ziy126a', titleEn: 'Dua Nudbah', titleUr: 'دعائے ندبہ', titleAr: 'دعاء الندبة', cat: 'Duas' },
  { id: 'maf_dua46b', titleEn: 'Dua e Faraj', titleUr: 'دعائے فرج', titleAr: 'دعاء الفرج', cat: 'Duas' },
  { id: 'maf_ziy128', titleEn: 'Dua al-Ahd', titleUr: 'دعائے عہـد', titleAr: 'دعاء العهد', cat: 'Duas' },
  { id: 'maf_ziy73a', titleEn: 'Ziyarat Waritha', titleUr: 'زیارتِ وارثہ', titleAr: 'زيارة وارث', cat: 'Ziyaraat' },
  { id: 'maf_ziy92', titleEn: 'Ziyarat Arbaeen', titleUr: 'زیارتِ اربعین', titleAr: 'زيارة الأربعين', cat: 'Ziyaraat' },
  { id: 'maf_ziy124', titleEn: 'Ziyarat Ale Yasin', titleUr: 'زیارتِ آلِ یاسین', titleAr: 'زيارة آل ياسين', cat: 'Ziyaraat' },
  { id: 'maf_ziy134a', titleEn: 'Ziyarat Ameenullah', titleUr: 'زیارتِ امین اللہ', titleAr: 'زيارة أمين الله', cat: 'Ziyaraat' },
  { id: 'maf_ziy132', titleEn: 'Ziyarat Jami\'ah Kabirah', titleUr: 'زیارتِ جامعۂ کبیرہ', titleAr: 'الزيارة الجامعة الكبيرة', cat: 'Ziyaraat' },
  { id: 'nahiya', titleEn: 'Ziyarat Nahiya', titleUr: 'زیارتِ ناحیہ', titleAr: 'زيارة الناحية المقدسة', cat: 'Ziyaraat' },
  { id: 'maf_ziy140a', titleEn: 'Ziyarat Lady Masumah', titleUr: 'زیارتِ حضرت معصومہ (س)', titleAr: 'زيارة السيدة معصومة', cat: 'Ziyaraat' },
  { id: 'maf_dua39', titleEn: 'Dua Sabah', titleUr: 'دعائے صباح', titleAr: 'دعاء الصباح', cat: 'Duas' },
  { id: 'maf_dua43', titleEn: 'Dua Mashlool', titleUr: 'دعائے مشلول', titleAr: 'دعاء المشلول', cat: 'Duas' },
  { id: 'maf_dua45', titleEn: 'Dua Mujeer', titleUr: 'دعائے مجیر', titleAr: 'دعاء المجير', cat: 'Duas' },
  { id: 'maf_aamal30', titleEn: 'Dua Iftitah', titleUr: 'دعائے افتتاح', titleAr: 'دعاء الافتتاح', cat: 'Duas' },
  { id: 'maf_dua47', titleEn: 'Jawshan Kabeer', titleUr: 'دعائے جوشنِ کبیر', titleAr: 'جوشن كبير', cat: 'Duas' },
];

export const MafatihView: React.FC<MafatihViewProps> = ({ onSelectItem }) => {
  const [items, setItems] = useState<MafatihSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAudio, setOnlyAudio] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(40);

  // Settings & Locale
  const appLanguage = useSettingsStore((s) => s.appLanguage);
  const isUrdu = appLanguage === 'ur';

  // Global shared Mafatih Audio Store
  const currentTrack = useMafatihAudioStore((s) => s.currentTrack);
  const isPlaying = useMafatihAudioStore((s) => s.isPlaying);
  const isBuffering = useMafatihAudioStore((s) => s.isBuffering);
  const toggleTrack = useMafatihAudioStore((s) => s.toggleTrack);

  // Load complete index on mount (0ms fast retrieval)
  useEffect(() => {
    let isMounted = true;
    getFullIndex()
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        } else {
          const mapped: MafatihSummary[] = MAFATIH_COLLECTION.map((m) => ({
            id: m.id,
            code: m.id,
            title: m.titleEnglish,
            mainCategory: m.category === 'ziyarat' ? 'Ziyaraat of Ahlulbayt (a.s)' : 'Duas & Supplications',
            mainCategoryCode: m.category,
            categoryChain: [m.titleEnglish],
            hasAudio: !!m.audioUrl,
            audioUrl: m.audioUrl,
            versesCount: 50,
            snippet: m.description,
          }));
          setItems(mapped);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleAudio = (rawUrl?: string | null, itemId?: string, title?: string, category?: string) => {
    if (!rawUrl || !itemId) return;
    hapticImpact(ImpactStyle.Light);
    toggleTrack({
      id: itemId,
      title: title || items.find((i) => i.id === itemId)?.title || 'Recitation',
      category: category || items.find((i) => i.id === itemId)?.mainCategory || 'Supplication',
      audioUrl: rawUrl,
    });
  };

  // Filter items by category, search text, and audio availability
  const filteredItems = useMemo(() => {
    let result = items;

    if (selectedCategory !== 'all') {
      result = result.filter((item) => {
        const cat = (item.mainCategory || '').toLowerCase();
        const title = (item.title || '').toLowerCase();
        switch (selectedCategory) {
          case 'ziyarat':
            return cat.includes('ziyarat') || title.includes('ziyarat');
          case 'dua':
            return (cat.includes('dua') || cat.includes('supplication')) && !cat.includes('ziyarat');
          case 'munajat':
            return cat.includes('munajaat') || cat.includes('whispered') || title.includes('munajat');
          case 'aamaal':
            return cat.includes('aamaal') || cat.includes('ritual') || title.includes('aamaal');
          case 'namaz':
            return cat.includes('namaz') || cat.includes('taqib') || cat.includes('prayer');
          case 'sahifa':
            return cat.includes('sahifa');
          case 'baqiyaat':
            return cat.includes('baqiyaat') || cat.includes('paradise');
          default:
            return true;
        }
      });
    }

    if (onlyAudio) {
      result = result.filter((i) => i.hasAudio || !!i.audioUrl);
    }

    if (searchQuery.trim()) {
      const qNormal = normalizeSearchQuery(searchQuery);
      result = result.filter((item) => {
        const urduTitle = getMafatihUrduTitle(item.id, item.title);
        const arTitle = getArabicTitle(item.id, item.title);
        const urduCat = getMafatihUrduCategory(item.mainCategory);
        const chain = (item.categoryChain || []).join(' ');

        return (
          matchesSearch(item.title, qNormal) ||
          matchesSearch(urduTitle, qNormal) ||
          matchesSearch(arTitle, qNormal) ||
          matchesSearch(item.snippet, qNormal) ||
          matchesSearch(item.mainCategory, qNormal) ||
          matchesSearch(urduCat, qNormal) ||
          matchesSearch(chain, qNormal)
        );
      });
    }

    return result;
  }, [items, selectedCategory, onlyAudio, searchQuery]);

  useEffect(() => {
    setVisibleLimit(40);
  }, [selectedCategory, searchQuery, onlyAudio]);

  const handleSelectItem = (id: string) => {
    hapticImpact(ImpactStyle.Light);
    onSelectItem?.(id);
  };

  return (
    <div className="space-y-5" dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Sleek Minimalist Quick Recitations Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isUrdu ? 'برگزیدہ دعائیں و زیارات' : 'Core Recitations'}
          </span>
          <span className="text-[11px] text-slate-400 tabular-nums">
            {isUrdu ? `${toUrduNumerals(19)} منتخب دعائیں` : '19 Selected'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {FEATURED_ITEMS.map((fav) => {
            const isFavPlaying = isPlaying && currentTrack?.id === fav.id;
            const primaryTitle = isUrdu ? fav.titleUr : fav.titleEn;

            return (
              <div
                key={`fav-${fav.id}`}
                onClick={() => handleSelectItem(fav.id)}
                className="shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 hover:border-emerald-500/40 transition-colors group cursor-pointer"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const found = items.find((i) => i.id === fav.id);
                    if (found?.audioUrl) {
                      toggleAudio(found.audioUrl, fav.id, fav.titleEn, fav.cat);
                    } else {
                      handleSelectItem(fav.id);
                    }
                  }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                    isFavPlaying
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-emerald-600 group-hover:text-white'
                  }`}
                  title={isFavPlaying ? (isUrdu ? 'روکیں' : 'Pause') : (isUrdu ? 'سنیں' : 'Listen')}
                >
                  {isBuffering && currentTrack?.id === fav.id ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  ) : isFavPlaying ? (
                    <Pause size={13} />
                  ) : (
                    <Play size={13} className={`fill-current ${isUrdu ? 'mr-0.5' : 'ml-0.5'}`} />
                  )}
                </button>
                <div className={isUrdu ? 'text-right' : 'text-left'}>
                  <span className="text-xs font-medium text-slate-900 dark:text-slate-100 block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors whitespace-nowrap">
                    {primaryTitle}
                  </span>
                  <span className="text-[10px] text-slate-400 font-arabic block leading-none mt-0.5">
                    {fav.titleAr}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search Input & Audio Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className={`absolute ${isUrdu ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('mafatih_search_placeholder', appLanguage)}
            className={`w-full ${isUrdu ? 'pr-9 pl-9 text-right' : 'pl-9 pr-9 text-left'} py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute ${isUrdu ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer`}
              title={isUrdu ? 'صاف کریں' : 'Clear search'}
            >
              <X size={15} />
            </button>
          )}
        </div>

        <button
          onClick={() => {
            hapticImpact(ImpactStyle.Light);
            setOnlyAudio((prev) => !prev);
          }}
          className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-colors shrink-0 cursor-pointer ${
            onlyAudio
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
          title={isUrdu ? 'صرف آڈیو والی دعائیں دکھائیں' : 'Show recitations with audio recordings'}
        >
          <Headphones size={15} />
          <span>{t('with_audio', appLanguage)}</span>
          <span className={`text-[10px] tabular-nums ${onlyAudio ? 'text-emerald-100' : 'text-slate-400'}`}>
            ({isUrdu ? toUrduNumerals('320+') : '320+'})
          </span>
        </button>
      </div>

      {/* Category Segmented Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {CATEGORIES.map((tab) => {
          const isSelected = selectedCategory === tab.id;
          const displayLabel = isUrdu ? tab.labelUr : tab.labelEn;

          return (
            <button
              key={`tab-${tab.id}`}
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                setSelectedCategory(tab.id);
              }}
              className={`shrink-0 px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium flex items-center gap-1.5 whitespace-nowrap ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200/70 dark:border-slate-800'
              }`}
            >
              <span>{displayLabel}</span>
              {!isUrdu && (
                <span className="font-arabic text-[11px] opacity-60">({tab.labelAr})</span>
              )}
            </button>
          );
        })}
      </div>

      {searchQuery && (
        <div className="flex justify-between items-center px-1 text-xs text-slate-500">
          <span>
            {isUrdu 
              ? `${toUrduNumerals(filteredItems.length)} نتائج برائے "${searchQuery}"`
              : `${filteredItems.length} results for "${searchQuery}"`}
          </span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            {t('clear_search', appLanguage)}
          </button>
        </div>
      )}

      {/* Main Grid: Clean Minimalist Cards (Zero-Pill Discipline, Anti-AI Slop) */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 mx-auto border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">
            {isUrdu ? 'مفاتیح الجنان لوڈ ہو رہا ہے...' : 'Loading complete Mafatih Al Jinan volume...'}
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-10 text-center rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {t('no_supplications_found', appLanguage)}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {t('no_supplications_hint', appLanguage)}
          </p>
          <button
            onClick={() => {
              hapticImpact(ImpactStyle.Light);
              setSelectedCategory('all');
              setSearchQuery('');
              setOnlyAudio(false);
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-emerald-600 text-xs font-medium cursor-pointer"
          >
            {t('reset_filters', appLanguage)}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredItems.slice(0, visibleLimit).map((item) => {
            const isItemPlaying = isPlaying && (currentTrack?.id === item.id || (!!item.audioUrl && currentTrack?.audioUrl === item.audioUrl));
            const primaryTitle = isUrdu ? getMafatihUrduTitle(item.id, item.title) : item.title;
            const arTitle = getArabicTitle(item.id, item.title);
            const categoryLabel = isUrdu ? getMafatihUrduCategory(item.mainCategory) : (item.mainCategory || 'Supplication');
            const versesCountFormatted = isUrdu ? `${toUrduNumerals(item.versesCount)} ${t('verses', appLanguage)}` : `${item.versesCount} verses`;

            return (
              <div
                key={`maf-${item.id}`}
                onClick={() => handleSelectItem(item.id)}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 hover:border-emerald-500/40 dark:hover:border-emerald-600/40 transition-colors group cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Clean unboxed metadata header */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <span className="truncate max-w-[200px]">{categoryLabel}</span>
                    {item.versesCount > 0 && (
                      <>
                        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                        <span className="tabular-nums">{versesCountFormatted}</span>
                      </>
                    )}
                    {(item.hasAudio || item.audioUrl) && (
                      <>
                        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <Volume2 size={12} className={isItemPlaying ? 'animate-pulse' : ''} />
                          <span>{t('audio', appLanguage)}</span>
                        </span>
                      </>
                    )}
                  </div>

                  {/* Title and Arabic Calligraphy */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                      {primaryTitle}
                    </h3>
                    {arTitle && (
                      <span dir="rtl" className="font-arabic text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-medium shrink-0 text-right">
                        {arTitle}
                      </span>
                    )}
                  </div>

                  {/* Snippet / Description */}
                  {item.snippet && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                      {item.snippet}
                    </p>
                  )}
                </div>

                {/* Bottom Action Strip */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
                  <div>
                    {(item.hasAudio || item.audioUrl) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAudio(item.audioUrl, item.id, item.title, item.mainCategory);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          isItemPlaying
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-600 hover:text-white'
                        }`}
                        title={isItemPlaying ? (isUrdu ? 'روکیں' : 'Pause Audio') : (isUrdu ? 'آڈیو سنیں' : 'Play Audio')}
                      >
                        {isBuffering && (currentTrack?.id === item.id || currentTrack?.audioUrl === item.audioUrl) ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        ) : isItemPlaying ? (
                          <Pause size={13} />
                        ) : (
                          <Play size={13} className={`fill-current ${isUrdu ? 'mr-0.5' : 'ml-0.5'}`} />
                        )}
                        <span>{isItemPlaying ? (isUrdu ? 'روکیں' : 'Pause') : (isUrdu ? 'سنیں' : 'Listen')}</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectItem(item.id);
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline transition-colors cursor-pointer"
                  >
                    <span>{t('read_full', appLanguage)}</span>
                    <ChevronRight size={14} className={isUrdu ? 'rotate-180' : ''} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Load More */}
      {visibleLimit < filteredItems.length && (
        <div className="text-center pt-3 pb-8">
          <button
            onClick={() => {
              hapticImpact(ImpactStyle.Light);
              setVisibleLimit((prev) => prev + 40);
            }}
            className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-emerald-500/40 transition-colors cursor-pointer"
          >
            {isUrdu
              ? `مزید دعائیں دیکھیں (${toUrduNumerals(filteredItems.length - visibleLimit)} باقی ہیں)`
              : `Load More Recitations (${filteredItems.length - visibleLimit} remaining)`}
          </button>
        </div>
      )}
    </div>
  );
};

export default MafatihView;
