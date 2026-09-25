import React, { useState, useEffect, useMemo } from 'react';
import { Search, Microscope, Clock, BookOpen, Filter, ArrowRight, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ImamScienceReaderModal, { ImamArticle } from './ImamScienceReaderModal';
import { getApiUrl } from '../utils/apiBase';
import { hapticImpact, hapticSelection } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';

interface ImamScienceFeedProps {
  onSelectSurah?: (surah: number, ayah?: number) => void;
}

// Module-level in-memory cache to guarantee instantaneous tab transitions
let cachedArticles: ImamArticle[] = [];
let cachedCategories: { name: string; count: number; slug: string }[] = [];

export default function ImamScienceFeed({ onSelectSurah }: ImamScienceFeedProps) {
  const [articles, setArticles] = useState<ImamArticle[]>(() => cachedArticles);
  const [categories, setCategories] = useState<{ name: string; count: number; slug: string }[]>(() => cachedCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'shortest' | 'longest' | 'recent' | 'title'>('shortest');
  const [loading, setLoading] = useState<boolean>(() => cachedArticles.length === 0);
  const [selectedArticle, setSelectedArticle] = useState<ImamArticle | null>(null);

  useEffect(() => {
    let isCancelled = false;

    // If already in memory, no need to show loading or refetch
    if (cachedArticles.length > 0) {
      setLoading(false);
      return;
    }

    // Load static dataset first for instant render
    fetch('/imam_science_data.json')
      .then(res => {
        if (!res.ok) throw new Error('Static data missing');
        return res.json();
      })
      .then(data => {
        if (isCancelled) return;
        if (data && data.articles) {
          cachedArticles = data.articles;
          setArticles(data.articles);
          if (data.categories) {
            cachedCategories = data.categories;
            setCategories(data.categories);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        // Failover gracefully to live API
        fetch(getApiUrl('/api/imam-science/articles?limit=100'))
          .then(res => res.json())
          .then(data => {
            if (isCancelled) return;
            if (data && data.articles) {
              cachedArticles = data.articles;
              setArticles(data.articles);
              setLoading(false);
            }
          })
          .catch(() => {
            if (!isCancelled) setLoading(false);
          });
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetch(getApiUrl('/api/imam-science/articles?limit=100'))
      .then(res => res.json())
      .then(data => {
        if (data && data.articles && data.articles.length > 0) {
          cachedArticles = data.articles;
          setArticles(data.articles);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // Filtered & sorted articles based on active category, search query, and sort order
  const filteredArticles = useMemo(() => {
    const list = articles.filter(article => {
      // Category filter
      if (selectedCategory !== 'all') {
        const matchesPrimary = article.primaryCategory?.toLowerCase() === selectedCategory.toLowerCase();
        const matchesArray = (article.categories || []).some(
          c => c.toLowerCase() === selectedCategory.toLowerCase() ||
               c.toLowerCase().replace(/[^a-z0-9]+/g, '-') === selectedCategory.toLowerCase()
        );
        if (!matchesPrimary && !matchesArray) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = article.title.toLowerCase().includes(q);
        const matchesExcerpt = article.excerpt?.toLowerCase().includes(q);
        const matchesCategory = (article.categories || []).some(c => c.toLowerCase().includes(q));
        if (!matchesTitle && !matchesExcerpt && !matchesCategory) {
          return false;
        }
      }

      return true;
    });

    // Pure non-mutating sort according to user preference
    return [...list].sort((a, b) => {
      if (sortBy === 'shortest') {
        return (a.wordCount || 0) - (b.wordCount || 0);
      } else if (sortBy === 'longest') {
        return (b.wordCount || 0) - (a.wordCount || 0);
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'recent') {
        return new Date(b.publishedDate || 0).getTime() - new Date(a.publishedDate || 0).getTime();
      }
      return 0;
    });
  }, [articles, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* Archive Header & Mission Statement */}
      <div className="border-b-[0.5px] border-slate-200 dark:border-slate-800 pb-5 mt-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
            <Microscope size={11} className="mr-1" />
            Dynamic Research Archive
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-slate-900 dark:text-slate-50">
          Qur'an, Hadith & Scientific Wisdom
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          Exploring scientific discoveries, natural biology, medicine, astronomy, and cosmic principles through the profound teachings of the Holy Qur'an and the Holy Ahlebait (a.s.).
        </p>
      </div>

      {/* Search & Topic Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search articles across biology, health, astronomy, Ahlebait teachings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              hapticSelection();
              setSelectedCategory('all');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Topics
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedCategory === 'all' ? 'bg-emerald-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              {articles.length}
            </span>
          </button>

          {categories.map((cat, idx) => {
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
                               selectedCategory.toLowerCase() === cat.slug?.toLowerCase();
            return (
              <button
                key={`cat-pill-${cat.slug || cat.name || idx}-${idx}`}
                onClick={() => {
                  hapticSelection();
                  setSelectedCategory(cat.name);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.name}
                {cat.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredArticles.length}</strong> articles
            {selectedCategory !== 'all' && (
              <span> in <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{selectedCategory}</span></span>
            )}
            {searchQuery && (
              <span> matching "<span className="text-emerald-600 dark:text-emerald-400 font-semibold">{searchQuery}</span>"</span>
            )}
          </span>

          {(selectedCategory !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium ml-2"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Length & Order Sort Selector */}
        <div className="flex items-center gap-1 self-end sm:self-auto bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border-[0.5px] border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 px-2">
            Order:
          </span>
          <button
            onClick={() => {
              hapticSelection();
              setSortBy('shortest');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              sortBy === 'shortest'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Shortest articles on top, lengthy ones and books on bottom"
          >
            Shortest First
          </button>
          <button
            onClick={() => {
              hapticSelection();
              setSortBy('longest');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              sortBy === 'longest'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Books & lengthy treatises on top"
          >
            Books & Longest
          </button>
          <button
            onClick={() => {
              hapticSelection();
              setSortBy('recent');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              sortBy === 'recent'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Recent
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && articles.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={`feed-skeleton-${i}`} className="h-80 bg-slate-100 dark:bg-slate-800/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border-[0.5px] border-slate-200 dark:border-slate-800">
          <Layers size={36} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100 mb-1">
            No matching articles found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            Try adjusting your search terms or selecting "All Topics" to browse the full archive.
          </p>
          <button
            onClick={() => {
              hapticSelection();
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Article Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, idx) => (
            <div
              key={`article-card-${article.id || article.slug || 'art'}-${idx}`}
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                setSelectedArticle(article);
              }}
              className="group cursor-pointer flex flex-col bg-white dark:bg-slate-900 rounded-2xl border-[0.5px] border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
            >
              {/* Thumbnail with standard 540x360 ratio */}
              <div className="relative aspect-[3/2] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={article.imageUrl}
                  alt={article.imageAlt || article.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to high quality science/nature background if thumbnail fails
                    (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=800&q=80');
                  }}
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-900/80 backdrop-blur-md text-emerald-300">
                    {article.primaryCategory || 'Science'}
                  </span>
                  {((article.wordCount || 0) > 15000 || (article.title && article.title.toLowerCase().startsWith('book'))) ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-amber-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30">
                      <BookOpen size={11} />
                      <span>Full Treatise</span>
                    </span>
                  ) : ((article.wordCount || 0) < 1000) ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-950/80 backdrop-blur-md text-emerald-200 border border-emerald-500/30">
                      <Clock size={11} />
                      <span>Quick Read</span>
                    </span>
                  ) : null}
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                  {article.wordCount ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 backdrop-blur-md text-slate-200">
                      {article.wordCount > 1000 ? `${(article.wordCount / 1000).toFixed(1)}k words` : `${article.wordCount} words`}
                    </span>
                  ) : null}
                  {article.readingTime && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 backdrop-blur-md text-white">
                      <Clock size={10} className="mr-1" />
                      {article.readingTime}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 flex flex-col flex-1 justify-between">
                <div className="space-y-2.5">
                  <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  {article.excerpt && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}
                </div>

                {/* Highlights Callout if present */}
                {article.highlights && article.highlights.length > 0 && (
                  <div className="mt-3 pt-3 border-t-[0.5px] border-slate-100 dark:border-slate-800/80">
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 italic line-clamp-2">
                      "{article.highlights[0]}"
                    </p>
                  </div>
                )}

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t-[0.5px] border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Read Article <ArrowRight size={13} />
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    Qur'an & Science Archive
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reader Modal */}
      {selectedArticle && (
        <ImamScienceReaderModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />
      )}
    </div>
  );
}
