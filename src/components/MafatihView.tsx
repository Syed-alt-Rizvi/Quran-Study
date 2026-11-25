import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  Search, 
  Headphones, 
  Volume2, 
  X, 
  BookOpen
} from 'lucide-react';
import { MAFATIH_COLLECTION } from '../data/mafatihData';
import { getFullIndex, MafatihSummary } from '../mafatihApi';
import { useMafatihAudioStore } from '../mafatihAudioStore';
import { useSettingsStore } from '../store';
import { t } from '../i18n';
import { getMafatihUrduTitle, getMafatihUrduCategory, toUrduNumerals } from '../utils/mafatihUrdu';
import { getMafatihArabicTitle, getMafatihEnglishTitle } from '../utils/mafatihArabic';
import { hapticImpact, ImpactStyle } from '../utils/haptics';
import { normalizeSearchQuery, matchesSearch } from '../utils/arabicSearch';
import { getArabicFontFamily } from '../utils/arabicFonts';

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

const FEATURED_ITEMS = [
  { id: 'maf_dua40', titleEn: 'Dua Kumayl', titleUr: 'دعائے کمیل', titleAr: 'دعاء كميل بن زياد', cat: 'Duas' },
  { id: 'maf_ziy86', titleEn: 'Ziyarat Ashura', titleUr: 'زیارتِ عاشورہ', titleAr: 'زيارة عاشوراء المشرفة', cat: 'Ziyaraat' },
  { id: 'maf_dua51', titleEn: 'Dua Tawassul', titleUr: 'دعائے توسل', titleAr: 'دعاء التوسل بالأئمة الأطهار', cat: 'Duas' },
  { id: 'h_kisa', titleEn: 'Hadith al-Kisa', titleUr: 'حدیثِ کساء', titleAr: 'حديث الكساء اليماني الشريف', cat: 'Supplications' },
  { id: 'maf_ziy126a', titleEn: 'Dua Nudbah', titleUr: 'دعائے ندبہ', titleAr: 'دعاء الندبة لصاحب الزمان', cat: 'Duas' },
  { id: 'maf_dua46b', titleEn: 'Dua e Faraj', titleUr: 'دعائے فرج', titleAr: 'دعاء الفرج (عظم البلاء)', cat: 'Duas' },
  { id: 'maf_ziy128', titleEn: 'Dua al-Ahd', titleUr: 'دعائے عہـد', titleAr: 'دعاء العهد مع الإمام المهدي', cat: 'Duas' },
  { id: 'maf_ziy73a', titleEn: 'Ziyarat Waritha', titleUr: 'زیارتِ وارثہ', titleAr: 'زيارة وارث لشهيد كربلاء', cat: 'Ziyaraat' },
  { id: 'maf_ziy92', titleEn: 'Ziyarat Arbaeen', titleUr: 'زیارتِ اربعین', titleAr: 'زيارة الأربعين المشرفة', cat: 'Ziyaraat' },
  { id: 'maf_ziy124', titleEn: 'Ziyarat Ale Yasin', titleUr: 'زیارتِ آلِ یاسین', titleAr: 'زيارة آل ياسين لصاحب الزمان', cat: 'Ziyaraat' },
  { id: 'maf_ziy134a', titleEn: 'Ziyarat Ameenullah', titleUr: 'زیارتِ امین اللہ', titleAr: 'زيارة أمين الله لأمير المؤمنين', cat: 'Ziyaraat' },
  { id: 'maf_ziy132', titleEn: 'Ziyarat Jami\'ah Kabirah', titleUr: 'زیارتِ جامعۂ کبیرہ', titleAr: 'الزيارة الجامعة الكبيرة', cat: 'Ziyaraat' },
  { id: 'nahiya', titleEn: 'Ziyarat Nahiya', titleUr: 'زیارتِ ناحیہ', titleAr: 'زيارة الناحية المقدسة', cat: 'Ziyaraat' },
  { id: 'maf_ziy140a', titleEn: 'Ziyarat Lady Masumah', titleUr: 'زیارتِ حضرت معصومہ (س)', titleAr: 'زيارة السيدة فاطمة المعصومة عليها السلام', cat: 'Ziyaraat' },
  { id: 'maf_dua39', titleEn: 'Dua Sabah', titleUr: 'دعائے صباح', titleAr: 'دعاء الصباح لمولى الموحدين', cat: 'Duas' },
  { id: 'maf_dua43', titleEn: 'Dua Mashlool', titleUr: 'دعائے مشلول', titleAr: 'دعاء المشلول المروي عن أمير المؤمنين', cat: 'Duas' },
  { id: 'maf_dua45', titleEn: 'Dua Mujeer', titleUr: 'دعائے مجیر', titleAr: 'دعاء المجير المروي عن جبرئيل', cat: 'Duas' },
  { id: 'maf_aamal30', titleEn: 'Dua Iftitah', titleUr: 'دعائے افتتاح', titleAr: 'دعاء الافتتاح في ليالي شهر رمضان', cat: 'Duas' },
  { id: 'maf_dua47', titleEn: 'Jawshan Kabeer', titleUr: 'دعائے جوشنِ کبیر', titleAr: 'دعاء الجوشن الكبير المبارك', cat: 'Duas' },
];

export const MafatihView: React.FC<MafatihViewProps> = ({ onSelectItem }) => {
  const [items, setItems] = useState<MafatihSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAudio, setOnlyAudio] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(48);

  // Settings & Locale
  const appLanguage = useSettingsStore((s) => s.appLanguage);
  const arabicFont = useSettingsStore((s) => s.arabicFont);
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
        const englishTitle = getMafatihEnglishTitle(item.id, item.title);
        const arTitle = getMafatihArabicTitle(item.id, item.title, item.mainCategory);
        const urduCat = getMafatihUrduCategory(item.mainCategory);
        const chain = (item.categoryChain || []).join(' ');

        return (
          matchesSearch(item.title, qNormal) ||
          matchesSearch(englishTitle, qNormal) ||
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

  // Counts per library category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: items.length,
      ziyarat: 0,
      dua: 0,
      munajat: 0,
      aamaal: 0,
      namaz: 0,
      sahifa: 0,
      baqiyaat: 0
    };
    for (const item of items) {
      const cat = (item.mainCategory || '').toLowerCase();
      const title = (item.title || '').toLowerCase();
      if (cat.includes('ziyarat') || title.includes('ziyarat')) counts.ziyarat++;
      else if (cat.includes('dua') || cat.includes('supplication')) counts.dua++;
      else if (cat.includes('munajaat') || cat.includes('whispered') || title.includes('munajat')) counts.munajat++;
      else if (cat.includes('aamaal') || cat.includes('ritual') || title.includes('aamaal')) counts.aamaal++;
      else if (cat.includes('namaz') || cat.includes('taqib') || cat.includes('prayer')) counts.namaz++;
      else if (cat.includes('sahifa')) counts.sahifa++;
      else if (cat.includes('baqiyaat') || cat.includes('paradise')) counts.baqiyaat++;
    }
    return counts;
  }, [items]);

  useEffect(() => {
    setVisibleLimit(48);
  }, [selectedCategory, searchQuery, onlyAudio]);

  const handleSelectItem = (id: string) => {
    hapticImpact(ImpactStyle.Light);
    onSelectItem?.(id);
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full overflow-x-hidden min-w-0" dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Sanctuary Header Banner */}
      <div className="relative overflow-hidden rounded-3xl liquid-glass-card glass-emerald-fusion p-4 sm:p-5 text-slate-900 dark:text-white shadow-[0_12px_32px_-4px_rgba(5,150,105,0.18)] dark:shadow-[0_16px_40px_-6px_rgba(0,0,0,0.6)] border border-emerald-400/50 dark:border-emerald-400/25 min-w-0 w-full max-w-full">
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-400/25 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-teal-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
              <span>{isUrdu ? 'کتابِ دعا و زیارت' : 'Sacred Supplications & Ziyaraat'}</span>
              <span aria-hidden="true" className="opacity-60">·</span>
              <span className="font-arabic font-bold text-sm">مَفَاتِيحُ الْجِنَانِ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-wide text-slate-900 dark:text-white flex items-center gap-2 truncate">
              <span>{isUrdu ? 'مفاتیح الجنان' : 'Mafatih Al Jinan'}</span>
              <span className="text-xs font-normal not-italic text-emerald-800/80 dark:text-emerald-200/80 hidden sm:inline font-sans">
                — {isUrdu ? 'محدث شیخ عباس قمی (رح)' : 'Sheikh Abbas Qummi (r.a)'}
              </span>
            </h2>
          </div>
        </div>
      </div>

      {/* Core Recitations Horizontal Reel */}
      <div className="space-y-2 w-full max-w-full overflow-hidden min-w-0">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">
            {isUrdu ? 'برگزیدہ دعائیں و زیارات' : 'Core Recitations'}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tabular-nums">
            {isUrdu ? `${toUrduNumerals(19)} منتخب دعائیں` : '19 Selected'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {FEATURED_ITEMS.map((fav) => {
            const isFavPlaying = isPlaying && currentTrack?.id === fav.id;
            const primaryTitle = isUrdu ? fav.titleUr : fav.titleEn;

            return (
              <div
                key={`fav-${fav.id}`}
                onClick={() => handleSelectItem(fav.id)}
                className="shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-2xl liquid-glass-card border border-white/60 dark:border-white/12 hover:border-emerald-400/60 dark:hover:border-emerald-400/40 transition-all group cursor-pointer shadow-xs hover:shadow-md hover:scale-[1.02]"
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
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    isFavPlaying
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-[0_0_14px_rgba(16,185,129,0.5)]'
                      : 'glass-slab-tab text-slate-700 dark:text-slate-300 group-hover:bg-emerald-600 group-hover:text-white border border-emerald-400/30'
                  }`}
                  title={isFavPlaying ? (isUrdu ? 'روکیں' : 'Pause') : (isUrdu ? 'سنیں' : 'Listen')}
                >
                  {isBuffering && currentTrack?.id === fav.id ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  ) : isFavPlaying ? (
                    <Pause size={13} fill="currentColor" />
                  ) : (
                    <Play size={13} fill="currentColor" className={isUrdu ? 'mr-0.5' : 'ml-0.5'} />
                  )}
                </button>
                <div className={isUrdu ? 'text-right' : 'text-left'}>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors whitespace-nowrap">
                    {primaryTitle}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-arabic block leading-none mt-0.5">
                    {fav.titleAr}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search Input for Mafatih (Matching Quran Search styling) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('mafatih_search_placeholder', appLanguage)}
            className="w-full pl-9 pr-9 py-2 sm:py-2.5 rounded-2xl liquid-glass border border-white/40 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-xs sm:text-sm truncate placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
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
          className={`flex items-center justify-center gap-2 px-3.5 py-2 sm:py-2.5 rounded-2xl text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
            onlyAudio
              ? 'glass-slab-tab-active font-bold border-emerald-500/50 shadow-sm'
              : 'glass-slab-tab text-slate-600 dark:text-slate-300 border-white/40 dark:border-white/10'
          }`}
          title={isUrdu ? 'صرف آڈیو والی دعائیں دکھائیں' : 'Show recitations with audio recordings'}
        >
          <Headphones size={15} className={onlyAudio ? 'text-emerald-800 dark:text-emerald-200' : 'text-slate-500'} />
          <span>{t('with_audio', appLanguage)}</span>
        </button>
      </div>

      {/* Clean Library Segmented Bar (Matching Surah & Juz switch styling) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {CATEGORIES.map((tab) => {
          const isSelected = selectedCategory === tab.id;
          const displayLabel = isUrdu ? tab.labelUr : tab.labelEn;
          const count = categoryCounts[tab.id] || 0;

          return (
            <button
              key={`tab-${tab.id}`}
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                setSelectedCategory(tab.id);
              }}
              className={`shrink-0 px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
                isSelected
                  ? 'glass-slab-tab-active font-bold border-emerald-500/50 shadow-sm'
                  : 'glass-slab-tab text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-white/40 dark:border-white/10'
              }`}
            >
              <span>{displayLabel}</span>
              <span className={`text-[10px] font-mono tabular-nums ${isSelected ? 'text-emerald-900 dark:text-emerald-200 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                ({isUrdu ? toUrduNumerals(count) : count})
              </span>
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

      {/* Main Grid: Sleek 3-Column Cards Matching Surah and Juz library layout */}
      {loading ? (
        <div className="space-y-2.5">
          {[...Array(9)].map((_, i) => (
            <div key={`skeleton-${i}`} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3">
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
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
          >
            {t('reset_filters', appLanguage)}
          </button>
        </div>
      ) : (
        <div className="responsive-surah-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
          {filteredItems.slice(0, visibleLimit).map((item, itemIdx) => {
            const isItemPlaying = isPlaying && (currentTrack?.id === item.id || (!!item.audioUrl && currentTrack?.audioUrl === item.audioUrl));
            const primaryTitle = isUrdu ? getMafatihUrduTitle(item.id, item.title) : getMafatihEnglishTitle(item.id, item.title);
            const arTitle = getMafatihArabicTitle(item.id, item.title, item.mainCategory);
            const categoryLabel = isUrdu ? getMafatihUrduCategory(item.mainCategory) : (item.mainCategory || 'Supplication');
            const versesCountFormatted = isUrdu ? `${toUrduNumerals(item.versesCount)} سطور` : `${item.versesCount} ${t('ayahs', appLanguage)}`;

            return (
              <div
                key={`maf-${item.id}-${itemIdx}`}
                onClick={() => handleSelectItem(item.id)}
                className="surah-card-render w-full text-left group flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl liquid-glass-card border border-white/50 dark:border-white/10 hover:border-emerald-400/60 dark:hover:border-emerald-400/50 hover:shadow-md transition-all duration-150 cursor-pointer"
              >
                {/* Top Row: Left Number Index & Audio Button, Right Arabic Calligraphy */}
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs sm:text-sm font-mono font-bold tracking-wider text-emerald-800/80 dark:text-emerald-400/80 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 select-none transition-colors">
                      {String(itemIdx + 1).padStart(2, '0')}
                    </span>

                    {(item.hasAudio || item.audioUrl) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAudio(item.audioUrl, item.id, item.title, item.mainCategory);
                        }}
                        className={`p-1 rounded-full transition-colors cursor-pointer ${
                          isItemPlaying 
                            ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800' 
                            : 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={isItemPlaying ? (isUrdu ? 'روکیں' : 'Pause Audio') : (isUrdu ? 'آڈیو سنیں' : 'Play Audio')}
                      >
                        {isBuffering && (currentTrack?.id === item.id || currentTrack?.audioUrl === item.audioUrl) ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        ) : isItemPlaying ? (
                          <Pause size={15} fill="currentColor" />
                        ) : (
                          <Play size={15} fill="currentColor" />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="text-right flex-1 min-w-0">
                    <span 
                      dir="rtl"
                      lang="ar"
                      className="ayah-arabic-text font-arabic text-lg sm:text-xl font-normal text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors block leading-tight truncate"
                      style={{ fontFamily: getArabicFontFamily(arabicFont) }}
                    >
                      {arTitle}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Title on the left, verse count & category on the right */}
                <div className="w-full mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-baseline justify-between gap-1.5">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {primaryTitle}
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                    {item.versesCount > 0 && (
                      <>
                        <span>{versesCountFormatted}</span>
                        <span className="text-slate-400/80">·</span>
                      </>
                    )}
                    <span className="truncate max-w-[100px]">{categoryLabel}</span>
                  </div>
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
              setVisibleLimit((prev) => prev + 48);
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
