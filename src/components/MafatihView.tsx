import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookMarked, 
  Play, 
  Pause, 
  Search, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Headphones, 
  Volume2, 
  X, 
  ChevronRight,
  ScrollText,
  Star,
  RotateCcw,
  RotateCw
} from 'lucide-react';
import { MAFATIH_COLLECTION } from '../data/mafatihData';
import { getFullIndex, MafatihSummary } from '../mafatihApi';
import { useMafatihAudioStore } from '../mafatihAudioStore';

interface MafatihViewProps {
  onSelectItem?: (id: string) => void;
}

type CategoryKey = 'all' | 'ziyarat' | 'dua' | 'munajat' | 'aamaal' | 'namaz' | 'sahifa' | 'baqiyaat';

interface CategoryTab {
  id: CategoryKey;
  labelEn: string;
  labelAr: string;
}

const CATEGORIES: CategoryTab[] = [
  { id: 'all', labelEn: 'All Items', labelAr: 'الكل' },
  { id: 'ziyarat', labelEn: 'Ziyaraat', labelAr: 'زيارات' },
  { id: 'dua', labelEn: 'Duas', labelAr: 'أدعية' },
  { id: 'munajat', labelEn: 'Munajaat', labelAr: 'مناجاة' },
  { id: 'aamaal', labelEn: 'Aamaal & Rituals', labelAr: 'أعمال' },
  { id: 'namaz', labelEn: 'Taqibaat & Prayers', labelAr: 'تعقيبات وصلوات' },
  { id: 'sahifa', labelEn: 'Sahifa Collections', labelAr: 'الصحائف' },
  { id: 'baqiyaat', labelEn: 'Baqiyaat us Saalehaat', labelAr: 'باقيات الصالحات' },
];

const ARABIC_TITLE_MAP: Record<string, string> = {
  maf_dua40: 'دعاء كميل بن زياد',
  maf_ziy86: 'زيارة عاشوراء',
  maf_dua51: 'دعاء التوسل بالأئمة',
  h_kisa: 'حديث الكساء اليماني',
  maf_ziy126a: 'دعاء الندبة للمهدي',
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
    return 'صلاة وتعقيب ' + englishTitle.replace(/^(namaz|taqibaat)\s+(e\s+|of\s+)?/i, '');
  }
  return englishTitle;
}

function getCategoryBadge(cat: string) {
  const c = (cat || '').toLowerCase();
  if (c.includes('ziyarat')) {
    return {
      bg: 'bg-amber-500/10 dark:bg-amber-400/10',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-500/20 dark:border-amber-400/20',
      dot: 'bg-amber-500',
      label: 'Ziyarat'
    };
  }
  if (c.includes('dua') || c.includes('supplication')) {
    return {
      bg: 'bg-emerald-500/10 dark:bg-emerald-400/10',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-500/20 dark:border-emerald-400/20',
      dot: 'bg-emerald-500',
      label: 'Dua'
    };
  }
  if (c.includes('munajat') || c.includes('whispered')) {
    return {
      bg: 'bg-indigo-500/10 dark:bg-indigo-400/10',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-500/20 dark:border-indigo-400/20',
      dot: 'bg-indigo-500',
      label: 'Munajat'
    };
  }
  if (c.includes('aamaal') || c.includes('ritual')) {
    return {
      bg: 'bg-teal-500/10 dark:bg-teal-400/10',
      text: 'text-teal-700 dark:text-teal-300',
      border: 'border-teal-500/20 dark:border-teal-400/20',
      dot: 'bg-teal-500',
      label: 'Aamaal'
    };
  }
  if (c.includes('namaz') || c.includes('taqib')) {
    return {
      bg: 'bg-sky-500/10 dark:bg-sky-400/10',
      text: 'text-sky-700 dark:text-sky-300',
      border: 'border-sky-500/20 dark:border-sky-400/20',
      dot: 'bg-sky-500',
      label: 'Prayer'
    };
  }
  if (c.includes('sahifa')) {
    return {
      bg: 'bg-rose-500/10 dark:bg-rose-400/10',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-500/20 dark:border-rose-400/20',
      dot: 'bg-rose-500',
      label: 'Sahifa'
    };
  }
  return {
    bg: 'bg-slate-500/10',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-500/20',
    dot: 'bg-slate-400',
    label: 'Mafatih'
  };
}

const FEATURED_ITEMS = [
  { id: 'maf_dua40', titleEn: 'Dua Kumayl', titleAr: 'دعاء كميل', cat: 'Duas', reciter: 'Hajj Aba Thar Al-Halawaji' },
  { id: 'maf_ziy86', titleEn: 'Ziyarat Ashura', titleAr: 'زيارة عاشوراء', cat: 'Ziyaraat', reciter: 'Hajj Mahdi Sedghi' },
  { id: 'maf_dua51', titleEn: 'Dua Tawassul', titleAr: 'دعاء التوسل', cat: 'Duas', reciter: 'Mohsin Farahmand' },
  { id: 'h_kisa', titleEn: 'Hadith al-Kisa', titleAr: 'حديث الكساء', cat: 'Supplications', reciter: 'Hajj Mahdi Mirdamad' },
  { id: 'maf_ziy126a', titleEn: 'Dua Nudbah', titleAr: 'دعاء الندبة', cat: 'Duas', reciter: 'Mahdi Mirdamad' },
  { id: 'maf_dua46b', titleEn: 'Dua e Faraj', titleAr: 'دعاء الفرج', cat: 'Duas', reciter: 'Mahdi Sedghi' },
  { id: 'maf_ziy128', titleEn: 'Dua al-Ahd', titleAr: 'دعاء العهد', cat: 'Duas', reciter: 'Aba Thar Al-Halawaji' },
  { id: 'maf_ziy73a', titleEn: 'Ziyarat Waritha', titleAr: 'زيارة وارث', cat: 'Ziyaraat', reciter: 'Mahdi Samavati' },
  { id: 'maf_ziy92', titleEn: 'Ziyarat Arbaeen', titleAr: 'زيارة الأربعين', cat: 'Ziyaraat', reciter: 'Mahdi Sedghi' },
  { id: 'maf_ziy124', titleEn: 'Ziyarat Ale Yasin', titleAr: 'زيارة آل ياسين', cat: 'Ziyaraat', reciter: 'Mahdi Sedghi' },
  { id: 'maf_ziy134a', titleEn: 'Ziyarat Ameenullah', titleAr: 'زيارة أمين الله', cat: 'Ziyaraat', reciter: 'Mirdamad' },
  { id: 'maf_ziy132', titleEn: 'Ziyarat Jami\'ah Kabirah', titleAr: 'الزيارة الجامعة الكبيرة', cat: 'Ziyaraat', reciter: 'Aba Thar' },
  { id: 'nahiya', titleEn: 'Ziyarat Nahiya', titleAr: 'زيارة الناحية المقدسة', cat: 'Ziyaraat', reciter: 'Recitation' },
  { id: 'maf_ziy140a', titleEn: 'Ziyarat Lady Masumah', titleAr: 'زيارة السيدة معصومة', cat: 'Ziyaraat', reciter: 'Recitation' },
  { id: 'maf_dua39', titleEn: 'Dua Sabah', titleAr: 'دعاء الصباح', cat: 'Duas', reciter: 'Mohsin Farahmand' },
  { id: 'maf_dua43', titleEn: 'Dua Mashlool', titleAr: 'دعاء المشلول', cat: 'Duas', reciter: 'Mahdi Sedghi' },
  { id: 'maf_dua45', titleEn: 'Dua Mujeer', titleAr: 'دعاء المجير', cat: 'Duas', reciter: 'Natiq' },
  { id: 'maf_aamal30', titleEn: 'Dua Iftitah', titleAr: 'دعاء الافتتاح', cat: 'Duas', reciter: 'Mahdi Sedghi' },
  { id: 'maf_dua47', titleEn: 'Jawshan Kabeer', titleAr: 'جوشن كبير', cat: 'Duas', reciter: 'Mahdi Mirdamad' },
];

export const MafatihView: React.FC<MafatihViewProps> = ({ onSelectItem }) => {
  const [items, setItems] = useState<MafatihSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAudio, setOnlyAudio] = useState(false);
  const [activeItem, setActiveItem] = useState<MafatihSummary | null>(null);
  const [visibleLimit, setVisibleLimit] = useState(40);

  // Global shared Mafatih Audio Store
  const currentTrack = useMafatihAudioStore((s) => s.currentTrack);
  const isPlaying = useMafatihAudioStore((s) => s.isPlaying);
  const isBuffering = useMafatihAudioStore((s) => s.isBuffering);
  const currentTime = useMafatihAudioStore((s) => s.currentTime);
  const duration = useMafatihAudioStore((s) => s.duration);
  const toggleTrack = useMafatihAudioStore((s) => s.toggleTrack);
  const pauseAudio = useMafatihAudioStore((s) => s.pause);
  const skipAudio = useMafatihAudioStore((s) => s.skip);
  const seekAudio = useMafatihAudioStore((s) => s.seek);
  const stopAudio = useMafatihAudioStore((s) => s.stop);

  // Load complete index on mount (0ms from pre-bundled JSON)
  useEffect(() => {
    let isMounted = true;
    getFullIndex()
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
          setActiveItem(data[0] || null);
        } else {
          // Fallback to static collection if index unavailable
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
          setActiveItem(mapped[0] || null);
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

    // 1. Category Filter
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

    // 2. Audio only Filter
    if (onlyAudio) {
      result = result.filter((i) => i.hasAudio || !!i.audioUrl);
    }

    // 3. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        const title = (item.title || '').toLowerCase();
        const snippet = (item.snippet || '').toLowerCase();
        const cat = (item.mainCategory || '').toLowerCase();
        const chain = (item.categoryChain || []).join(' ').toLowerCase();
        return title.includes(q) || snippet.includes(q) || cat.includes(q) || chain.includes(q);
      });
    }

    return result;
  }, [items, selectedCategory, onlyAudio, searchQuery]);

  // Reset pagination limit on category or search change
  useEffect(() => {
    setVisibleLimit(40);
  }, [selectedCategory, searchQuery, onlyAudio]);

  const handleSelectItem = (id: string) => {
    onSelectItem?.(id);
  };

  return (
    <div className="space-y-6">
      {/* Featured Recitations Carousel / Quick Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Most Beloved Supplications &amp; Ziyaraat</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">19 Core Recitations</span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none pt-1">
          {FEATURED_ITEMS.map((fav) => {
            const isFavPlaying = isPlaying && currentTrack?.id === fav.id;
            return (
              <div
                key={`fav-${fav.id}`}
                className="shrink-0 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 transition-all shadow-2xs group cursor-pointer"
                onClick={() => handleSelectItem(fav.id)}
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
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950'
                  }`}
                  title={isFavPlaying ? 'Pause' : 'Listen'}
                >
                  {isBuffering && currentTrack?.id === fav.id ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  ) : isFavPlaying ? (
                    <Pause size={13} />
                  ) : (
                    <Play size={13} className="fill-current ml-0.5" />
                  )}
                </button>
                <div className="text-left">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block group-hover:text-emerald-500 transition-colors">
                    {fav.titleEn}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-arabic block leading-none">
                    {fav.titleAr}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search Bar & Audio Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all 1,300+ ziyaraat, duas, munajaat, aamaal..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <button
          onClick={() => setOnlyAudio((prev) => !prev)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            onlyAudio
              ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
          title="Filter recitations with audio recordings"
        >
          <Headphones size={15} />
          <span>With Audio</span>
          <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
            onlyAudio ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }`}>
            320+
          </span>
        </button>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {CATEGORIES.map((tab) => {
          const isSelected = selectedCategory === tab.id;
          return (
            <button
              key={`tab-${tab.id}`}
              onClick={() => setSelectedCategory(tab.id)}
              className={`shrink-0 px-3.5 py-2 rounded-xl transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-white dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <span>{tab.labelEn}</span>
              <span className="font-arabic text-[11px] opacity-75">({tab.labelAr})</span>
            </button>
          );
        })}
      </div>

      {searchQuery && (
        <div className="flex justify-end px-1">
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Main Grid: Responsive 2-column list */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 mx-auto border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading complete Mafatih Al Jinan volume...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Supplications Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or select another category from the top pills.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setOnlyAudio(false);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredItems.slice(0, visibleLimit).map((item) => {
            const isItemPlaying = isPlaying && (currentTrack?.id === item.id || (!!item.audioUrl && currentTrack?.audioUrl === item.audioUrl));
            const badge = getCategoryBadge(item.mainCategory);
            const arTitle = getArabicTitle(item.id, item.title);

            return (
              <div
                key={`maf-${item.id}`}
                onClick={() => handleSelectItem(item.id)}
                className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/40 transition-all duration-200 shadow-2xs hover:shadow-md group cursor-pointer flex flex-col justify-between space-y-3"
              >
                {/* Subtle top indicator bar based on category */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${badge.dot}`} />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      <span className="truncate max-w-[140px] sm:max-w-[200px]">{badge.label}</span>
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.versesCount > 0 && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-medium">
                          {item.versesCount} verses
                        </span>
                      )}
                      {(item.hasAudio || item.audioUrl) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20" title="Audio recitation available">
                          <Volume2 size={12} className={isItemPlaying ? 'animate-pulse text-emerald-500' : ''} />
                          <span>Audio</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dual Title: Arabic script prominently displayed in calligraphy */}
                  <div className="space-y-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                        {item.title}
                      </h3>
                      {arTitle && (
                        <span dir="rtl" className="font-arabic text-emerald-700 dark:text-emerald-400 text-sm font-semibold shrink-0 text-right">
                          {arTitle}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.snippet && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                      {item.snippet}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    {(item.hasAudio || item.audioUrl) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAudio(item.audioUrl, item.id, item.title, item.mainCategory);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isItemPlaying
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400'
                        }`}
                        title={isItemPlaying ? 'Pause Audio' : 'Play Audio'}
                      >
                        {isBuffering && (currentTrack?.id === item.id || currentTrack?.audioUrl === item.audioUrl) ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        ) : isItemPlaying ? (
                          <Pause size={13} />
                        ) : (
                          <Play size={13} className="fill-current" />
                        )}
                        <span>{isItemPlaying ? 'Pause' : 'Listen'}</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectItem(item.id);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors ml-auto cursor-pointer"
                  >
                    <span>Read Full</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Load More Button */}
      {visibleLimit < filteredItems.length && (
        <div className="text-center pt-4 pb-8">
          <button
            onClick={() => setVisibleLimit((prev) => prev + 40)}
            className="px-6 py-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 shadow-2xs transition-colors cursor-pointer"
          >
            Load More Recitations ({filteredItems.length - visibleLimit} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default MafatihView;

