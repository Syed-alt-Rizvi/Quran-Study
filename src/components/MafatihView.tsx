import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Headphones, BookOpen, Star, X, ChevronRight, RefreshCw
} from 'lucide-react';
import { MafatihSummary, MafatihCategory, fetchMafatihCategories, fetchMafatihItems } from '../mafatihApi';
import { useSettingsStore } from '../store';
import { hapticImpact } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';

interface MafatihViewProps {
  onSelectItem: (id: string) => void;
}

const PRIMARY_CATEGORIES = [
  { id: 'all', label: 'All Recitations' },
  { id: 'Duas & Supplications', label: 'Duas' },
  { id: 'Ziyaraat of Ahlulbayt (a.s)', label: 'Ziyaraat' },
  { id: '15 Whispered Prayers (Munajaat)', label: '15 Whispered Prayers' },
  { id: 'Taqibaat e Namaz', label: 'Taqibaat' },
  { id: 'Namaz & Special Prayers', label: 'Special Prayers' },
  { id: 'Aamaal & Monthly Rituals', label: 'Aamaal' },
  { id: 'Sahifa e Sajjadiyyah', label: 'Sahifa Sajjadiyyah' },
  { id: 'bookmarked', label: 'Bookmarked' }
];

export default function MafatihView({ onSelectItem }: MafatihViewProps) {
  const [items, setItems] = useState<MafatihSummary[]>([]);
  const [allCatalogItems, setAllCatalogItems] = useState<MafatihSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [audioOnly, setAudioOnly] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const { 
    mafatihBookmarks, 
    addMafatihBookmark, 
    removeMafatihBookmark, 
    isMafatihBookmarked,
    addMafatihRecent
  } = useSettingsStore();

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
        category: selectedCategory === 'all' ? undefined : selectedCategory,
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

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {PRIMARY_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat.label}
              {cat.id === 'bookmarked' && mafatihBookmarks.length > 0 && (
                <span className="ml-1 text-[10px] bg-emerald-700 text-white px-1.5 py-0.2 rounded-full">
                  {mafatihBookmarks.length}
                </span>
              )}
            </button>
          );
        })}
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
            {searchQuery || selectedCategory !== 'all' || audioOnly ? 'No Results Found' : 'Catalog Standby'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            {searchQuery || selectedCategory !== 'all' || audioOnly
              ? 'Try adjusting your search query or category filter.'
              : 'Connecting to Mafatih catalog...'}
          </p>
          <div className="flex items-center justify-center gap-2">
            {(searchQuery || selectedCategory !== 'all' || audioOnly) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setAudioOnly(false);
                }}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                Reset Filters
              </button>
            )}
            <button
              onClick={() => loadCatalog()}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors"
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
              className="group p-4 bg-white dark:bg-slate-900 hover:bg-emerald-50/30 dark:hover:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/60 dark:hover:border-emerald-600/60 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
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
                      className="p-1 rounded-full text-slate-400 hover:text-amber-500 transition-colors"
                      title="Bookmark"
                    >
                      {isMafatihBookmarked(item.id) ? (
                        <Star size={15} className="fill-amber-400 text-amber-400" />
                      ) : (
                        <Star size={15} />
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
