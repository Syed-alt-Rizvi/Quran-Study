import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Search, Headphones, BookOpen, Bookmark, BookmarkCheck, X, ChevronRight, ChevronLeft, RefreshCw,
  Compass, ScrollText, Sun, Repeat, Feather, Moon, BookMarked, LayoutGrid, SlidersHorizontal
} from 'lucide-react';
import { MafatihSummary, MafatihCategory, fetchMafatihCategories, fetchMafatihItems } from '../mafatihApi';
import { useSettingsStore } from '../store';
import { hapticImpact } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';

interface MafatihViewProps {
  onSelectItem: (id: string) => void;
}

const DEFAULT_CATEGORY_COUNTS: Record<string, number> = {
  'Duas & Supplications': 154,
  'Ziyaraat of Ahlulbayt (a.s)': 175,
  'Namaz & Special Prayers': 65,
  'Taqibaat e Namaz': 11,
  '15 Whispered Prayers (Munajaat)': 17,
  'Aamaal & Monthly Rituals': 304,
  'Sahifa e Sajjadiyyah': 68,
  bookmarked: 0,
};

interface CategoryOption {
  id: string;
  label: string;
  arabic: string;
  sublabel: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconBg: string;
  iconColor: string;
}

const PRIMARY_CATEGORIES: CategoryOption[] = [
  { 
    id: 'Duas & Supplications', 
    label: 'Duas', 
    arabic: 'الأدعية والمناجاة', 
    sublabel: 'Kumayl, Tawassul, Joshan',
    icon: ScrollText,
    iconBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    iconColor: 'text-rose-600 dark:text-rose-400'
  },
  { 
    id: 'Ziyaraat of Ahlulbayt (a.s)', 
    label: 'Ziyaraat', 
    arabic: 'زيارات أهل البيت (ع)', 
    sublabel: 'Ashura, Waritha, Jamia',
    icon: Compass,
    iconBg: 'bg-teal-500/10 dark:bg-teal-500/20',
    iconColor: 'text-teal-600 dark:text-teal-400'
  },
  { 
    id: 'Namaz & Special Prayers', 
    label: 'Namaz & Prayers', 
    arabic: 'الصلوات المندوبة', 
    sublabel: 'Salat al-Layl, Ja\'far Tayyar',
    icon: Sun,
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400'
  },
  { 
    id: 'Taqibaat e Namaz', 
    label: 'Taqibaat', 
    arabic: 'تعقيبات الصلوات', 
    sublabel: 'Daily 5-Salat Post Dhikr',
    icon: Repeat,
    iconBg: 'bg-orange-500/10 dark:bg-orange-500/20',
    iconColor: 'text-orange-600 dark:text-orange-400'
  },
  { 
    id: '15 Whispered Prayers (Munajaat)', 
    label: '15 Munajaat', 
    arabic: 'المناجاة الخمس عشرة', 
    sublabel: 'Imam Zayn al-Abidin (a.s)',
    icon: Feather,
    iconBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
  { 
    id: 'Aamaal & Monthly Rituals', 
    label: 'Aamaal & Rituals', 
    arabic: 'أعمال الشهور والأيام', 
    sublabel: 'Rajab, Shaban, Ramadan',
    icon: Moon,
    iconBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    iconColor: 'text-indigo-600 dark:text-indigo-400'
  },
  { 
    id: 'Sahifa e Sajjadiyyah', 
    label: 'Sahifa Sajjadiyyah', 
    arabic: 'الصحيفة السجادية', 
    sublabel: 'Psalms of Islam',
    icon: BookMarked,
    iconBg: 'bg-sky-500/10 dark:bg-sky-500/20',
    iconColor: 'text-sky-600 dark:text-sky-400'
  },
  { 
    id: 'bookmarked', 
    label: 'Bookmarked', 
    arabic: 'المحفوظات', 
    sublabel: 'Your Saved Duas',
    icon: BookmarkCheck,
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400'
  }
];

interface FeaturedItem {
  id: string;
  label: string;
  arabic: string;
  occasion: string;
  badge: string;
  bgGradient: string;
  borderClass: string;
  textColor: string;
  hasAudio?: boolean;
}

const FEATURED_ITEMS: FeaturedItem[] = [
  {
    id: 'maf_dua40',
    label: 'Dua Kumayl',
    arabic: 'دُعَاء كُمَيْل',
    occasion: 'Thursday Nights & Mid-Sha’ban',
    badge: 'Beloved',
    bgGradient: 'from-emerald-500/15 via-teal-500/10 to-emerald-50/50 dark:to-slate-900',
    borderClass: 'border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 dark:hover:border-emerald-400',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    hasAudio: true,
  },
  {
    id: 'maf_ziy86',
    label: 'Ziyarat Ashura',
    arabic: 'زِيَارَة عَاشُورَاء',
    occasion: 'Imam Hussain (a.s)',
    badge: 'Daily Essential',
    bgGradient: 'from-rose-500/15 via-amber-500/10 to-rose-50/50 dark:to-slate-900',
    borderClass: 'border-rose-300 dark:border-rose-800 hover:border-rose-500 dark:hover:border-rose-400',
    textColor: 'text-rose-700 dark:text-rose-300',
    hasAudio: true,
  },
  {
    id: 'h_kisa',
    label: 'Hadith al-Kisa',
    arabic: 'حَدِيثُ الكِسَاء',
    occasion: 'Holy Ahlulbayt (a.s)',
    badge: 'Blessing',
    bgGradient: 'from-amber-500/15 via-emerald-500/10 to-amber-50/50 dark:to-slate-900',
    borderClass: 'border-amber-300 dark:border-amber-800 hover:border-amber-500 dark:hover:border-amber-400',
    textColor: 'text-amber-700 dark:text-amber-300',
    hasAudio: true,
  },
  {
    id: 'maf_dua46',
    label: 'Dua Tawassul',
    arabic: 'دُعَاء التَّوَسُّل',
    occasion: 'Tuesday Nights',
    badge: '14 Infallibles',
    bgGradient: 'from-teal-500/15 via-sky-500/10 to-teal-50/50 dark:to-slate-900',
    borderClass: 'border-teal-300 dark:border-teal-800 hover:border-teal-500 dark:hover:border-teal-400',
    textColor: 'text-teal-700 dark:text-teal-300',
    hasAudio: true,
  },
  {
    id: 'maf_dua46b',
    label: 'Dua al-Faraj',
    arabic: 'دُعَاء الفَرَج',
    occasion: 'Imam al-Mahdi (a.t.f.s)',
    badge: 'Reappearance',
    bgGradient: 'from-emerald-500/15 via-green-500/10 to-emerald-50/50 dark:to-slate-900',
    borderClass: 'border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 dark:hover:border-emerald-400',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    hasAudio: true,
  },
  {
    id: 'maf_ziy126a',
    label: 'Dua Nudbah',
    arabic: 'دُعَاء النُّدْبَة',
    occasion: 'Friday Mornings',
    badge: 'Lamentation',
    bgGradient: 'from-purple-500/15 via-indigo-500/10 to-purple-50/50 dark:to-slate-900',
    borderClass: 'border-purple-300 dark:border-purple-800 hover:border-purple-500 dark:hover:border-purple-400',
    textColor: 'text-purple-700 dark:text-purple-300',
    hasAudio: true,
  },
  {
    id: 'maf_ziy128',
    label: 'Dua Ahad',
    arabic: 'دُعَاء العَهْد',
    occasion: 'Morning Allegiance Pledge',
    badge: 'Dawn Oath',
    bgGradient: 'from-sky-500/15 via-blue-500/10 to-sky-50/50 dark:to-slate-900',
    borderClass: 'border-sky-300 dark:border-sky-800 hover:border-sky-500 dark:hover:border-sky-400',
    textColor: 'text-sky-700 dark:text-sky-300',
    hasAudio: true,
  },
  {
    id: 'maf_ziy85',
    label: 'Ziyarat Waritha',
    arabic: 'زِيَارَة وَارِث',
    occasion: 'Heritage of the Prophets',
    badge: 'Sublime Ziyarat',
    bgGradient: 'from-teal-500/15 via-emerald-500/10 to-teal-50/50 dark:to-slate-900',
    borderClass: 'border-teal-300 dark:border-teal-800 hover:border-teal-500 dark:hover:border-teal-400',
    textColor: 'text-teal-700 dark:text-teal-300',
    hasAudio: true,
  },
  {
    id: 'maf_dua47',
    label: 'Jawshan Kabeer',
    arabic: 'جَوْشَن كَبِير',
    occasion: '1,000 Holy Names & Armor',
    badge: 'Laylatul Qadr',
    bgGradient: 'from-indigo-500/15 via-violet-500/10 to-indigo-50/50 dark:to-slate-900',
    borderClass: 'border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 dark:hover:border-indigo-400',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    hasAudio: true,
  },
  {
    id: 'maf_dua45',
    label: 'Dua Mujeer',
    arabic: 'دُعَاء مُجِير',
    occasion: 'Mid-Month of Ramadan',
    badge: 'Protection',
    bgGradient: 'from-amber-500/15 via-orange-500/10 to-amber-50/50 dark:to-slate-900',
    borderClass: 'border-amber-300 dark:border-amber-800 hover:border-amber-500 dark:hover:border-amber-400',
    textColor: 'text-amber-700 dark:text-amber-300',
    hasAudio: true,
  }
];

export default function MafatihView({ onSelectItem }: MafatihViewProps) {
  const [items, setItems] = useState<MafatihSummary[]>([]);
  const [allCatalogItems, setAllCatalogItems] = useState<MafatihSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Duas & Supplications');
  const [audioOnly, setAudioOnly] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [categoryViewMode, setCategoryViewMode] = useState<'slider' | 'grid'>('slider');
  const scrollRailRef = useRef<HTMLDivElement>(null);
  const featuredRailRef = useRef<HTMLDivElement>(null);

  const { 
    mafatihBookmarks, 
    addMafatihBookmark, 
    removeMafatihBookmark, 
    isMafatihBookmarked,
    addMafatihRecent
  } = useSettingsStore();

  const scrollLeft = () => {
    scrollRailRef.current?.scrollBy({ left: -260, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRailRef.current?.scrollBy({ left: 260, behavior: 'smooth' });
  };

  const scrollFeaturedLeft = () => {
    featuredRailRef.current?.scrollBy({ left: -280, behavior: 'smooth' });
  };

  const scrollFeaturedRight = () => {
    featuredRailRef.current?.scrollBy({ left: 280, behavior: 'smooth' });
  };

  // Category items count lookup
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      bookmarked: mafatihBookmarks.length,
    };
    for (const item of allCatalogItems) {
      const cat = item.mainCategory;
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
      const catLower = (item.mainCategory || '').toLowerCase();
      if (catLower.includes('ziyaraat') || catLower.includes('ziyarat')) {
        counts['Ziyaraat of Ahlulbayt (a.s)'] = (counts['Ziyaraat of Ahlulbayt (a.s)'] || 0) + 1;
      }
    }
    return counts;
  }, [allCatalogItems, mafatihBookmarks.length]);

  const loadCatalog = useCallback(() => {
    setLoading(true);
    fetchMafatihItems({ limit: 400 })
      .then((itemsRes) => {
        setItems(itemsRes.items);
        setAllCatalogItems(itemsRes.items);
        setTotalCount(itemsRes.total);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Mafatih catalog loading notice:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  // Search & Filter execution
  useEffect(() => {
    let mounted = true;
    const timeout = setTimeout(() => {
      // If user selected "bookmarked", filter locally from full catalog
      if (selectedCategory === 'bookmarked') {
        let filtered = allCatalogItems.filter(i => 
          mafatihBookmarks.includes(i.id) || mafatihBookmarks.includes(i.code)
        );
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          filtered = filtered.filter(i => 
            i.title.toLowerCase().includes(q) || i.snippet?.toLowerCase().includes(q)
          );
        }
        if (audioOnly) {
          filtered = filtered.filter(i => i.hasAudio);
        }
        setItems(filtered);
        setTotalCount(filtered.length);
        setLoading(false);
        return;
      }

      setLoading(true);
      fetchMafatihItems({
        category: searchQuery.trim() ? undefined : selectedCategory,
        search: searchQuery,
        hasAudio: audioOnly,
        limit: 300
      }).then(res => {
        if (!mounted) return;
        setItems(res.items);
        setTotalCount(res.total);
        setLoading(false);
      }).catch(() => {
        if (mounted) setLoading(false);
      });
    }, 150);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [selectedCategory, searchQuery, audioOnly, allCatalogItems, mafatihBookmarks]);

  const handleSelect = (id: string) => {
    hapticImpact(ImpactStyle.Light);
    addMafatihRecent(id);
    onSelectItem(id);
  };

  const handleToggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    hapticImpact(ImpactStyle.Medium);
    if (isMafatihBookmarked(id)) {
      removeMafatihBookmark(id);
    } else {
      addMafatihBookmark(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input & Audio Filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search Mafatih Al Jinan (e.g. Kumayl, Ashura, Tawassul, Kisa)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-shadow text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          onClick={() => {
            hapticImpact(ImpactStyle.Light);
            setAudioOnly(!audioOnly);
          }}
          className={`flex items-center gap-1.5 px-3.5 py-3 rounded-2xl text-xs font-semibold border transition-all ${
            audioOnly
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
          title="Filter recitations with audio"
        >
          <Headphones size={15} />
          <span className="hidden sm:inline">Audio</span>
        </button>
      </div>

      {/* Prominent Featured Recitations Banner & Carousel */}
      {!searchQuery && (
        <section className="rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-amber-500/10 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/30 border border-emerald-500/25 dark:border-emerald-500/20 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-xl leading-none select-none shrink-0">
                🤲
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    Featured Recitations
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                    Essential
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Quick access to the most beloved sacred supplications & ziyaraat
                </p>
              </div>
            </div>

            {/* Desktop scroll navigation arrows */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={scrollFeaturedLeft}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                title="Previous featured recitations"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={scrollFeaturedRight}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                title="Next featured recitations"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* Prominent Horizontal Scrollable Cards */}
          <div
            ref={featuredRailRef}
            className="flex items-stretch gap-3 overflow-x-auto pb-1.5 pt-1 px-0.5 scrollbar-none snap-x snap-mandatory"
          >
            {FEATURED_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`group relative flex flex-col justify-between text-left p-3.5 sm:p-4 rounded-2xl min-w-[210px] sm:min-w-[235px] max-w-[250px] shrink-0 snap-start bg-gradient-to-br ${item.bgGradient} border ${item.borderClass} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-2xs`}
              >
                {/* Top Badge & Audio Tag */}
                <div className="flex items-center justify-between w-full mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs ${item.textColor} border border-black/5 dark:border-white/10 shadow-2xs`}>
                    {item.badge}
                  </span>
                  {item.hasAudio && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-white/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-full border border-emerald-500/20 shadow-2xs">
                      <Headphones size={10} />
                      <span>Audio</span>
                    </span>
                  )}
                </div>

                {/* English & Arabic Titles */}
                <div className="my-1">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                    {item.label}
                  </h4>
                  <div
                    dir="rtl"
                    className="font-arabic text-base sm:text-lg font-bold text-emerald-800 dark:text-emerald-300 mt-0.5 leading-normal"
                  >
                    {item.arabic}
                  </div>
                </div>

                {/* Occasion & CTA Footer */}
                <div className="pt-2 mt-1 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="truncate pr-1 font-medium">{item.occasion}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform shrink-0 flex items-center">
                    <ChevronRight size={13} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Prominent Category Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Categories
            </span>
            <span className="text-[11px] font-arabic text-emerald-700 dark:text-emerald-400 font-semibold hidden sm:inline">
              أقسام مفاتيح الجنان
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold">
              {PRIMARY_CATEGORIES.length} Sections
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View Mode Switcher: Slider vs Grid */}
            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                setCategoryViewMode(categoryViewMode === 'slider' ? 'grid' : 'slider');
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
              title={categoryViewMode === 'slider' ? 'Switch to Grid view' : 'Switch to Slider view'}
            >
              {categoryViewMode === 'slider' ? (
                <>
                  <LayoutGrid size={13} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px]">Grid</span>
                </>
              ) : (
                <>
                  <SlidersHorizontal size={13} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px]">Slider</span>
                </>
              )}
            </button>

            {/* Slider Navigation Arrows */}
            {categoryViewMode === 'slider' && (
              <div className="hidden sm:flex items-center gap-1">
                <button
                  onClick={scrollLeft}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Scroll categories left"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={scrollRight}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Scroll categories right"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Categories Display: Slider View or Grid View */}
        {categoryViewMode === 'slider' ? (
          <div
            ref={scrollRailRef}
            className="flex items-stretch gap-2.5 overflow-x-auto pb-2 pt-1 px-1 scrollbar-none snap-x snap-mandatory"
          >
            {PRIMARY_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const Icon = cat.icon;
              const count = cat.id === 'bookmarked'
                ? mafatihBookmarks.length
                : (categoryCounts[cat.id] || DEFAULT_CATEGORY_COUNTS[cat.id] || 0);

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    hapticImpact(ImpactStyle.Light);
                    setSelectedCategory(cat.id);
                  }}
                  className={`group relative flex flex-col justify-between text-left p-3.5 sm:p-4 rounded-2xl min-w-[170px] sm:min-w-[195px] max-w-[215px] shrink-0 snap-start border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white border-emerald-500 shadow-md shadow-emerald-700/20 ring-2 ring-emerald-500/30 scale-[1.02]'
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                  }`}
                >
                  {/* Top Row: Icon Badge & Count */}
                  <div className="flex items-center justify-between w-full mb-3">
                    <div
                      className={`p-2.5 rounded-xl transition-colors ${
                        isSelected
                          ? 'bg-white/20 text-white backdrop-blur-xs'
                          : `${cat.iconBg} ${cat.iconColor}`
                      }`}
                    >
                      <Icon size={20} className="shrink-0" />
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60'
                      }`}
                    >
                      {count}
                    </span>
                  </div>

                  {/* Middle & Bottom: Labels */}
                  <div>
                    <div
                      className={`text-sm sm:text-base font-bold leading-tight mb-0.5 tracking-tight ${
                        isSelected
                          ? 'text-white'
                          : 'text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                      }`}
                    >
                      {cat.label}
                    </div>
                    <div
                      dir="rtl"
                      className={`font-arabic text-xs sm:text-sm font-medium leading-normal mb-1 ${
                        isSelected ? 'text-emerald-100/90' : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {cat.arabic}
                    </div>
                    <div
                      className={`text-[11px] leading-tight line-clamp-1 ${
                        isSelected ? 'text-emerald-100/80' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {cat.sublabel}
                    </div>
                  </div>

                  {/* Active Indicator Bar */}
                  {isSelected && (
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-white/80" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1 px-1">
            {PRIMARY_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const Icon = cat.icon;
              const count = cat.id === 'bookmarked'
                ? mafatihBookmarks.length
                : (categoryCounts[cat.id] || DEFAULT_CATEGORY_COUNTS[cat.id] || 0);

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    hapticImpact(ImpactStyle.Light);
                    setSelectedCategory(cat.id);
                  }}
                  className={`group relative flex flex-col justify-between text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white border-emerald-500 shadow-md shadow-emerald-700/20 ring-2 ring-emerald-500/30'
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                  }`}
                >
                  {/* Top Row: Icon Badge & Count */}
                  <div className="flex items-center justify-between w-full mb-2.5">
                    <div
                      className={`p-2.5 rounded-xl transition-colors ${
                        isSelected
                          ? 'bg-white/20 text-white backdrop-blur-xs'
                          : `${cat.iconBg} ${cat.iconColor}`
                      }`}
                    >
                      <Icon size={20} className="shrink-0" />
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60'
                      }`}
                    >
                      {count}
                    </span>
                  </div>

                  {/* Middle & Bottom: Labels */}
                  <div>
                    <div
                      className={`text-sm font-bold leading-tight mb-0.5 tracking-tight ${
                        isSelected
                          ? 'text-white'
                          : 'text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                      }`}
                    >
                      {cat.label}
                    </div>
                    <div
                      dir="rtl"
                      className={`font-arabic text-xs font-medium leading-normal mb-1 ${
                        isSelected ? 'text-emerald-100/90' : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {cat.arabic}
                    </div>
                    <div
                      className={`text-[11px] leading-tight line-clamp-1 ${
                        isSelected ? 'text-emerald-100/80' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {cat.sublabel}
                    </div>
                  </div>

                  {/* Active Indicator Bar */}
                  {isSelected && (
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-white/80" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Supplications List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <BookOpen className="mx-auto text-slate-400 mb-2" size={30} />
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
            {searchQuery || audioOnly ? 'No Results Found' : 'Catalog Standby'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            {searchQuery || audioOnly
              ? 'Try adjusting your search query or audio filter.'
              : 'Connecting to Mafatih catalog...'}
          </p>
          <div className="flex items-center justify-center gap-2">
            {(searchQuery || audioOnly) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Duas & Supplications');
                  setAudioOnly(false);
                }}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
            <button
              onClick={() => loadCatalog()}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Reload</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className="surah-card-render group p-4 bg-white dark:bg-slate-900 hover:bg-emerald-50/30 dark:hover:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/60 dark:hover:border-emerald-600/60 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md truncate">
                    {item.mainCategory}
                  </span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {item.hasAudio && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full" title="Audio available">
                        <Headphones size={11} />
                        <span>Audio</span>
                      </span>
                    )}
                    <button
                      onClick={(e) => handleToggleBookmark(e, item.id)}
                      className="p-1 rounded-full text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
                      title={isMafatihBookmarked(item.id) ? "Remove Bookmark" : "Add Bookmark"}
                    >
                      {isMafatihBookmarked(item.id) ? (
                        <BookmarkCheck size={16} className="text-emerald-500 fill-emerald-500/20" />
                      ) : (
                        <Bookmark size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h4>

                {item.snippet && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.snippet}
                  </p>
                )}
              </div>

              <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>{item.versesCount} verses</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                  Read <ChevronRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
