import { getApiUrl } from '../utils/apiBase';
import { hapticImpact, hapticSelection } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';
import { useState, useEffect, useRef, memo } from 'react';
import { fetchSurahDetail, SurahDetail, Ayah } from '../api';
import { fetchTafseer } from '../services/tafseerScraper';
import { useSettingsStore } from '../store';
import { useAudioStore } from '../audioStore';
import Markdown from 'react-markdown';
import { ArrowLeft, Loader2, Link as LinkIcon, PlayCircle, FileText, BookOpen, ChevronDown, ChevronUp, Bookmark, BookmarkCheck, PauseCircle, MessageSquare, ZoomIn, ZoomOut, RotateCcw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DiscussionModal from './DiscussionModal';

interface SurahViewProps {
  key?: string;
  surahId: number;
  targetAyah?: number;
  onBack: () => void;
}

const AyahCard = memo(function AyahCard({ ayah, surah, isLast }: { key?: string | number; ayah: Ayah; surah: SurahDetail; isLast?: boolean }) {
  const isDarkMode = useSettingsStore(s => s.isDarkMode);
  const fontSize = useSettingsStore(s => s.fontSize);
  const arabicFont = useSettingsStore(s => s.arabicFont);
  const showTranslation = useSettingsStore(s => s.showTranslation);
  const translationLanguages = useSettingsStore(s => s.translationLanguages);
  const tafseerLanguages = useSettingsStore(s => s.tafseerLanguages);
  const tafseerProvider = useSettingsStore(s => s.tafseerProvider);
  const tafseerZoom = useSettingsStore(s => s.tafseerZoom);
  const setTafseerZoom = useSettingsStore(s => s.setTafseerZoom);
  const autoScrollAudio = useSettingsStore(s => s.autoScrollAudio);
  const bookmarked = useSettingsStore(s => s.bookmarks.some(b => b.surahId === surah.number && b.ayahNumber === ayah.numberInSurah));
  const isLastRead = useSettingsStore(s => s.lastRead?.surahId === surah.number && s.lastRead?.ayahNumber === ayah.numberInSurah);
  const addBookmark = useSettingsStore(s => s.addBookmark);
  const removeBookmark = useSettingsStore(s => s.removeBookmark);
  const setLastRead = useSettingsStore(s => s.setLastRead);
  const incrementAyahsRead = useSettingsStore(s => s.incrementAyahsRead);

  // High-performance granular audio selectors (prevents 280+ Ayah cards from re-rendering on audio ticks)
  const isActivePlaying = useAudioStore(s => 
    s.surahId === surah.number && s.activeAyahNumber === ayah.numberInSurah && s.activeSurahNumber === surah.number && s.isPlaying
  );
  const isAudioPlaying = useAudioStore(s => s.isPlaying);
  const pause = useAudioStore(s => s.pause);
  const setPlaylist = useAudioStore(s => s.setPlaylist);

  const [activeTab, setActiveTab] = useState<'none' | 'translation' | 'tafseer'>('none');
  const [lazyTafseer, setLazyTafseer] = useState<any>(null);
  const [lazyLoading, setLazyLoading] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const ayahRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScrollAudio && isActivePlaying && isAudioPlaying && ayahRef.current) {
      ayahRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActivePlaying, isAudioPlaying, autoScrollAudio]);

  useEffect(() => {
    setLazyTafseer(null);
  }, [tafseerProvider]);

  useEffect(() => {
    if (activeTab === 'tafseer' && !lazyTafseer && !lazyLoading) {
      setLazyLoading(true);
      fetchTafseer(surah.number, ayah.numberInSurah, tafseerProvider)
        .then(res => setLazyTafseer(res))
        .catch(err => {
          console.error(err);
          setLazyTafseer(err?.message || "Tafseer for this Ayah could not be found or failed to load.");
        })
        .finally(() => setLazyLoading(false));
    }
  }, [activeTab, surah.number, ayah.numberInSurah, lazyTafseer, lazyLoading, tafseerProvider]);

  const handlePressStart = () => {
    pressTimer.current = setTimeout(() => {
      toggleBookmark();
    }, 600); // 600ms long press
  };

  const handlePressEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const toggleBookmark = () => {
    if (bookmarked) {
      removeBookmark(surah.number, ayah.numberInSurah);
    } else {
      addBookmark({ surahId: surah.number, ayahNumber: ayah.numberInSurah });
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    }
  };

  const handleMarkAsRead = () => {
    setLastRead({
      surahId: surah.number,
      ayahNumber: ayah.numberInSurah,
      type: 'text',
      surahName: surah.englishName
    });
    
    // Also track daily habit
    const today = new Date().toISOString().split('T')[0];
    incrementAyahsRead(today);
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActivePlaying && isAudioPlaying) {
      pause();
    } else {
      const index = surah.ayahs.findIndex(a => a.numberInSurah === ayah.numberInSurah);
      setPlaylist(surah.number, surah.ayahs, index !== -1 ? index : 0);
    }
  };

  return (
    <div className="flex flex-col">
      <div 
        id={`ayah-${ayah.numberInSurah}`}
        ref={ayahRef}
        className={`ayah-card-render ayah-card group relative py-4 sm:py-5 px-3 sm:px-8 transition-all duration-200 rounded-2xl sm:rounded-[1.75rem] border ${
          isActivePlaying || isLastRead
            ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-500/70 dark:border-emerald-600/70 shadow-md ring-1 ring-emerald-400/30'
            : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800/90 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
        }`}
        style={{
          forcedColorAdjust: 'none',
          backgroundColor: isActivePlaying || isLastRead
            ? (isDarkMode ? '#0d281e' : '#f0fdf4')
            : (isDarkMode ? '#0f172a' : '#ffffff'),
          borderColor: isActivePlaying || isLastRead
            ? (isDarkMode ? '#059669' : '#86efac')
            : (isDarkMode ? '#1e293b' : '#e2e8f0'),
        }}
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        onContextMenu={(e) => {
          // Prevent context menu on long press for mobile
          if (window.matchMedia('(pointer: coarse)').matches) {
            e.preventDefault();
          }
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <span 
              className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors border"
              style={{
                backgroundColor: isActivePlaying ? '#10b981' : (isLastRead ? (isDarkMode ? '#065f46' : '#d1fae5') : (isDarkMode ? '#1e293b' : '#f1f5f9')),
                color: isActivePlaying ? '#ffffff' : (isLastRead ? (isDarkMode ? '#6ee7b7' : '#065f46') : (isDarkMode ? '#cbd5e1' : '#334155')),
                borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                forcedColorAdjust: 'none',
              }}
            >
              {ayah.numberInSurah}
            </span>
            
            <button 
              onClick={handlePlayAudio}
              className={`p-1 rounded-full transition-colors ${
                isActivePlaying 
                  ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800' 
                  : 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isActivePlaying && isAudioPlaying ? "Pause Audio" : "Play from this Ayah"}
            >
              {isActivePlaying && isAudioPlaying ? <PauseCircle size={22} fill="currentColor" /> : <PlayCircle size={22} />}
            </button>
            {bookmarked && (
              <BookmarkCheck size={20} className="text-emerald-500" />
            )}
            {isLastRead && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Last Read</span>
            )}
          </div>
          <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            {!isLastRead && (
              <button
                onClick={handleMarkAsRead}
                className="px-3 py-1 text-xs font-medium rounded-full transition-colors border"
                style={{
                  backgroundColor: isDarkMode ? '#064e3b' : '#ecfdf5',
                  color: isDarkMode ? '#6ee7b7' : '#047857',
                  borderColor: isDarkMode ? '#047857' : '#a7f3d0',
                  forcedColorAdjust: 'none',
                }}
              >
                Mark Read
              </button>
            )}
            <button
              onClick={() => {
                const text = `Qur'an ${surah.number}:${ayah.numberInSurah}`;
                try {
                  navigator.clipboard?.writeText?.(text)?.catch?.(() => {});
                } catch (e) {}
                const event = new CustomEvent('open-discussion', { detail: { ayah, surah } });
                window.dispatchEvent(event);
              }}
              className="p-2 text-slate-400 hover:text-emerald-500 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              title="Cite & Discuss"
            >
              <MessageSquare size={18} />
            </button>
            <button 
              onClick={toggleBookmark}
              className="p-2 text-slate-400 hover:text-emerald-500 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              title="Bookmark (or Long Press)"
            >
              {bookmarked ? <BookmarkCheck size={18} className="text-emerald-500" /> : <Bookmark size={18} />}
            </button>
          </div>
        </div>
        
        <AnimatePresence>
          {showTooltip && (
            <motion.div 
              key={`tooltip-${surah.number}-${ayah.numberInSurah}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-0 right-1/2 translate-x-1/2 -mt-12 bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg z-10"
            >
              Bookmarked!
            </motion.div>
          )}
        </AnimatePresence>

        <p 
          className="ayah-arabic-text font-arabic text-right leading-loose select-none mb-3 font-normal"
          style={{ 
            fontSize: `${fontSize}px`, 
            fontFamily: arabicFont,
            color: isDarkMode ? '#F8FAFC' : '#0F172A',
            forcedColorAdjust: 'none',
          }}
        >
          {ayah.text}
        </p>

        {/* Clean, high-contrast Ayah Tabs with subtle divider */}
        <div className="flex items-center justify-center gap-3 mt-4 mb-2">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
          <div className="flex gap-2">
            {showTranslation && (
              <button 
                onClick={() => setActiveTab(activeTab === 'translation' ? 'none' : 'translation')}
                className="px-3.5 py-1.5 text-[11px] uppercase tracking-wider font-semibold rounded-full border transition-all"
                style={{
                  backgroundColor: activeTab === 'translation' 
                    ? '#059669' 
                    : (isDarkMode ? '#1e293b' : '#f1f5f9'),
                  color: activeTab === 'translation' 
                    ? '#ffffff' 
                    : (isDarkMode ? '#cbd5e1' : '#334155'),
                  borderColor: activeTab === 'translation' 
                    ? '#059669' 
                    : (isDarkMode ? '#334155' : '#cbd5e1'),
                  forcedColorAdjust: 'none',
                }}
              >
                Translation
              </button>
            )}
            <button 
              onClick={() => setActiveTab(activeTab === 'tafseer' ? 'none' : 'tafseer')}
              className="px-3.5 py-1.5 text-[11px] uppercase tracking-wider font-semibold rounded-full border transition-all"
              style={{
                backgroundColor: activeTab === 'tafseer' 
                  ? '#059669' 
                  : (isDarkMode ? '#1e293b' : '#f1f5f9'),
                color: activeTab === 'tafseer' 
                  ? '#ffffff' 
                  : (isDarkMode ? '#cbd5e1' : '#334155'),
                borderColor: activeTab === 'tafseer' 
                  ? '#059669' 
                  : (isDarkMode ? '#334155' : '#cbd5e1'),
                forcedColorAdjust: 'none',
              }}
            >
              Tafseer
            </button>
          </div>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'translation' && (
            <motion.div
              key={`ayah-tab-trans-${ayah.numberInSurah}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="py-4 space-y-4">
                {translationLanguages.includes('en') && (
                  <div className="relative pt-2">
                    <span className="block text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest mb-1">English</span>
                    <p className="leading-relaxed text-slate-700 dark:text-slate-300 text-[15px]">
                      {ayah.translationEn}
                    </p>
                  </div>
                )}
                {translationLanguages.includes('ur') && (
                  <div className="relative pt-2">
                    <span className="block text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest text-right mb-1">اردو</span>
                    <p className="leading-relaxed text-slate-700 dark:text-slate-300 text-lg font-arabic text-right">
                      {ayah.translationUr}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'tafseer' && (
            <motion.div
              key={`ayah-tab-tafseer-${ayah.numberInSurah}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="py-4">
                
                <>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="text-[11px] font-bold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-widest flex items-center gap-2">
                      <FileText size={13} />
                      {tafseerProvider === 'kauthar' ? 'تفسیر الکوثر — علامہ شیخ محسن علی نجفی' : 'تفسیرِ نمونہ — آیت اللہ ناصر مکارم شیرازی'}
                    </h4>

                    {/* Accessible Zoom / Readability Controls */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 rounded-lg p-0.5 border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
                      <button
                        id={`surah-zoom-out-btn-${ayah.numberInSurah}`}
                        type="button"
                        title="Zoom Out / کم زوم"
                        onClick={() => {
                          hapticSelection();
                          setTafseerZoom(tafseerZoom - 15);
                        }}
                        disabled={tafseerZoom <= 70}
                        className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ZoomOut size={13} />
                      </button>
                      <button
                        id={`surah-zoom-reset-btn-${ayah.numberInSurah}`}
                        type="button"
                        title="Reset Zoom / اصل سائز"
                        onClick={() => {
                          hapticSelection();
                          setTafseerZoom(100);
                        }}
                        className="px-1.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors"
                      >
                        {tafseerZoom}%
                      </button>
                      <button
                        id={`surah-zoom-in-btn-${ayah.numberInSurah}`}
                        type="button"
                        title="Zoom In / زیادہ زوم (بزرگوں اور کمزور نظر کے لیے)"
                        onClick={() => {
                          hapticSelection();
                          setTafseerZoom(tafseerZoom + 15);
                        }}
                        disabled={tafseerZoom >= 250}
                        className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ZoomIn size={13} />
                      </button>
                    </div>
                  </div>
                  <div 
                    className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 transition-[font-size] duration-150"
                    style={{
                      fontSize: `${Math.round(15 * (tafseerZoom / 100))}px`,
                      lineHeight: 1.85
                    }}
                  >
                    {lazyLoading ? (
                      <div className="py-8 flex flex-col items-center justify-center text-center">
                        <Loader2 className="w-5 h-5 text-emerald-600 animate-spin mb-3" />
                        <p className="text-slate-400 text-xs uppercase tracking-widest">Loading Tafseer Content...</p>
                      </div>
                    ) : typeof lazyTafseer === 'string' ? (
                      <div className="py-4 text-center">
                        <p className="text-red-500 text-sm mb-3 font-urdu leading-relaxed">{lazyTafseer}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setLazyTafseer(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          دوبارہ کوشش کریں (Retry)
                        </button>
                      </div>
                    ) : (
                      <div>
                        {tafseerLanguages.includes('en') && lazyTafseer?.en && (
                          <div className="mb-4">
                            <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">English</h5>
                            <Markdown>{lazyTafseer.en}</Markdown>
                          </div>
                        )}
                        {tafseerLanguages.includes('ur') && lazyTafseer?.tafseer_text ? (
                          <div 
                            className="tafseer-html-content text-slate-800 dark:text-slate-200 font-urdu leading-loose" 
                            style={{
                              fontSize: `${Math.round(17 * (tafseerZoom / 100))}px`,
                              lineHeight: 2.1
                            }}
                            dangerouslySetInnerHTML={{ __html: lazyTafseer.tafseer_text }} 
                          />
                        ) : tafseerLanguages.includes('ur') && lazyTafseer?.ur ? (
                          <div 
                            dir="rtl" 
                            className="font-arabic leading-loose text-right text-slate-800 dark:text-slate-200"
                            style={{
                              fontSize: `${Math.round(17 * (tafseerZoom / 100))}px`,
                              lineHeight: 2.1
                            }}
                          >
                            <h5 dir="ltr" className="font-semibold text-slate-800 dark:text-slate-200 mb-2 text-left">Urdu</h5>
                            <Markdown>{lazyTafseer.ur}</Markdown>
                          </div>
                        ) : null}
                        {tafseerLanguages.length === 0 && (
                          <p className="text-amber-600 dark:text-amber-400 italic text-sm">Please enable Urdu or English in Tafseer Settings (sidebar) to view commentary.</p>
                        )}
                        {tafseerLanguages.length > 0 && !lazyTafseer?.en && !lazyTafseer?.ur && !lazyTafseer?.tafseer_text && (
                          <p className="text-slate-500 italic text-sm">No tafseer content available for this ayah in the selected provider.</p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {!isLast && (
        <div className="w-full flex items-center justify-center py-2">
          <div className="w-24 flex items-center justify-center opacity-30">
            <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
            <div className="w-16 h-[0.5px] bg-emerald-500/30"></div>
            <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
          </div>
        </div>
      )}
    </div>
  );
});

export default function SurahView({ surahId, targetAyah, onBack }: SurahViewProps) {
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fontSize } = useSettingsStore();
  const { play, pause, isPlaying, surahId: audioSurahId, setPlaylist } = useAudioStore();
  const [discussionAyah, setDiscussionAyah] = useState<{ ayah: Ayah, surah: SurahDetail } | null>(null);
  const hasScrolledTargetRef = useRef(false);

  useEffect(() => {
    // Reset scroll lock when target ayah or surah changes
    hasScrolledTargetRef.current = false;

    // Clear any dirty hash from URL so native browser layout doesn't jump
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    
    // If opening without a specific target ayah, guarantee starting at the top
    if (!targetAyah) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [surahId, targetAyah]);

  useEffect(() => {
    const handleOpenDiscussion = (e: CustomEvent) => {
      setDiscussionAyah(e.detail);
    };
    const handleScrollToAyah = (e: CustomEvent<{ ayahNumber?: number; surahNumber?: number }>) => {
      const sNum = e.detail?.surahNumber;
      const aNum = e.detail?.ayahNumber;
      if (aNum && (!sNum || sNum === surahId)) {
        let attempts = 0;
        const tryScroll = () => {
          const el = document.getElementById(`ayah-${aNum}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('bg-emerald-50', 'dark:bg-emerald-900/20', 'ring-2', 'ring-emerald-500/50', 'transition-all', 'duration-700');
            setTimeout(() => {
              el.classList.remove('bg-emerald-50', 'dark:bg-emerald-900/20', 'ring-2', 'ring-emerald-500/50');
            }, 3000);
          } else if (attempts < 10) {
            attempts++;
            setTimeout(tryScroll, 100);
          }
        };
        tryScroll();
      }
    };

    window.addEventListener('open-discussion', handleOpenDiscussion as EventListener);
    window.addEventListener('scroll-to-ayah', handleScrollToAyah as EventListener);
    return () => {
      window.removeEventListener('open-discussion', handleOpenDiscussion as EventListener);
      window.removeEventListener('scroll-to-ayah', handleScrollToAyah as EventListener);
    };
  }, [surahId]);

  const loadSurah = () => {
    setLoading(true);
    setError(null);
    hasScrolledTargetRef.current = false;
    fetchSurahDetail(surahId)
      .then((surahData) => {
        setSurah(surahData);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Failed to load Surah:", e);
        setError("Unable to load Surah verses. Please check your internet connection.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSurah();
  }, [surahId]);

  // One-time smooth scroll to target ayah if specifically requested
  useEffect(() => {
    if (loading || !surah || hasScrolledTargetRef.current) return;
    
    if (targetAyah) {
      let attempts = 0;
      let timeoutId: any;
      const tryScroll = () => {
        const el = document.getElementById(`ayah-${targetAyah}`);
        if (el) {
          hasScrolledTargetRef.current = true;
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('bg-emerald-50', 'dark:bg-emerald-900/20', 'ring-2', 'ring-emerald-500/50', 'transition-all', 'duration-700');
          setTimeout(() => {
            el.classList.remove('bg-emerald-50', 'dark:bg-emerald-900/20', 'ring-2', 'ring-emerald-500/50');
          }, 3000);
        } else if (attempts < 10) {
          attempts++;
          timeoutId = setTimeout(tryScroll, 100);
        }
      };
      timeoutId = setTimeout(tryScroll, 80);
      return () => clearTimeout(timeoutId);
    }
  }, [loading, surah, targetAyah]);

  const isThisSurahPlaying = audioSurahId === surah?.number && isPlaying;

  const handlePlaySurah = () => {
    if (isThisSurahPlaying) {
      pause();
    } else if (surah) {
      setPlaylist(surah.number, surah.ayahs, 0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error || !surah) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <header className="sticky top-0 z-30 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-b-[0.5px] border-slate-200 dark:border-slate-800 px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button 
              onClick={() => { hapticImpact(ImpactStyle.Light); onBack(); }}
              className="p-2 -ml-2 text-slate-600 hover:text-emerald-600 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <span className="font-bold text-slate-800 dark:text-slate-200">Surah {surahId}</span>
            <div className="w-8" />
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Could Not Load Surah</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            {error || "An unexpected error occurred while fetching the Quran verses."}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => onBack()}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={loadSurah}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-36 sm:pb-32 pb-safe">
      <header className="sticky top-0 z-30 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-b-[0.5px] border-slate-200 dark:border-slate-800 px-4 py-4">
        <div className="max-w-4xl lg:max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-4">
            <button 
              onClick={() => { hapticImpact(ImpactStyle.Light); onBack(); }}
              className="p-2 -ml-2 text-slate-600 hover:text-emerald-600 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          </div>
          <div className="text-center">
            <h1 className="font-bold text-lg text-slate-900 dark:text-slate-100">{surah.englishName}</h1>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-arabic">{surah.name}</p>
          </div>
          <div className="flex-1 flex justify-end">
            <button 
              onClick={() => { hapticImpact(ImpactStyle.Heavy); handlePlaySurah(); }}
              className={`p-2 rounded-full transition-colors flex items-center gap-2 text-sm font-medium pr-4 ${
                isThisSurahPlaying 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isThisSurahPlaying ? (
                <>
                  <PauseCircle size={20} fill="currentColor" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <PlayCircle size={20} fill="currentColor" className="ml-1" />
                  <span>Play</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl lg:max-w-5xl mx-auto px-2.5 sm:px-4 py-4 sm:py-8 md:py-12">
        <div className="bg-white dark:bg-slate-900 sm:shadow-sm sm:rounded-2xl sm:border-[0.5px] border-slate-200 dark:border-slate-800 p-2 sm:p-8 md:p-12 relative">
          {surah.number !== 1 && surah.number !== 9 && (
            <div className="text-center mb-10 pb-8 border-b-[0.5px] border-slate-200 dark:border-slate-800">
              <h2 
                className="font-arabic text-slate-900 dark:text-slate-100" 
                style={{ fontSize: `${fontSize * 1.5}px` }}
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </h2>
            </div>
          )}

          <div className="flex flex-col">
            {surah.ayahs.map((ayah, index) => {
              const isLast = index === surah.ayahs.length - 1;
              return (
                <AyahCard 
                  key={`ayah-s${surah.number}-a${ayah.numberInSurah}-${index}`} 
                  ayah={ayah} 
                  surah={surah} 
                  isLast={isLast}
                />
              );
            })}
          </div>
        </div>

        {/* Citation Box at the bottom */}
        <div className="mt-16 bg-emerald-50 dark:bg-emerald-900/20 border-[0.5px] border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6">
          <h3 className="font-semibold text-emerald-800 dark:text-emerald-400 mb-2 flex items-center gap-2">
            <LinkIcon size={18} />
            Supporting Documents & Citations
          </h3>
          <div className="space-y-3">
            <a 
              href={`https://www.tafseerenamoona.net/surahs/${surah.number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl hover:shadow-md transition-shadow group border-[0.5px] border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
            >
              <FileText className="text-emerald-500 mt-0.5 shrink-0" size={18} />
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Tafseer-e-Namoona (Official Reference)
                </p>
                <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                  Complete extensive commentary for {surah.englishName}
                </p>
              </div>
            </a>
            <a 
              href="https://quran.com/en"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl hover:shadow-md transition-shadow group border-[0.5px] border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
            >
              <FileText className="text-emerald-500 mt-0.5 shrink-0" size={18} />
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Quran.com Audio & Text Resources
                </p>
                <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                  Verified text and recitations used in this compilation.
                </p>
              </div>
            </a>
          </div>
        </div>
      </main>
      
      {discussionAyah && (
        <DiscussionModal
          isOpen={true}
          onClose={() => setDiscussionAyah(null)}
          ayah={discussionAyah.ayah}
          surah={discussionAyah.surah}
        />
      )}
    </div>
  );
}
