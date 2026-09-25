import React, { memo } from 'react';
import { useState, useEffect, useRef } from 'react';
import { fetchJuzDetail, JuzDetail, Ayah } from '../api';
import { fetchTafseer } from '../services/tafseerScraper';
import { useSettingsStore } from '../store';
import { useAudioStore } from '../audioStore';
import Markdown from 'react-markdown';
import { ArrowLeft, Loader2, Link as LinkIcon, FileText, Bookmark, BookmarkCheck, PlayCircle, PauseCircle, ZoomIn, ZoomOut, RotateCcw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface JuzViewProps {
  key?: string;
  juzId: number;
  targetAyah?: number;
  targetSurah?: number;
  onBack: () => void;
}

const AyahCard = memo(function AyahCard({ ayah, juz, isLast }: { key?: string | number; ayah: Ayah; juz: JuzDetail; isLast?: boolean }) {
  const surahId = ayah.surahNumber || 1;

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
  const bookmarked = useSettingsStore(s => s.bookmarks.some(b => b.surahId === surahId && b.ayahNumber === ayah.numberInSurah));
  const isLastRead = useSettingsStore(s => s.lastRead?.surahId === surahId && s.lastRead?.ayahNumber === ayah.numberInSurah);
  const addBookmark = useSettingsStore(s => s.addBookmark);
  const removeBookmark = useSettingsStore(s => s.removeBookmark);
  const setLastRead = useSettingsStore(s => s.setLastRead);
  const incrementAyahsRead = useSettingsStore(s => s.incrementAyahsRead);

  // High-performance granular audio selectors for Juz
  const isActivePlaying = useAudioStore(s => 
    (s.surahId === -juz.number || s.surahId === surahId) && 
    s.activeAyahNumber === ayah.numberInSurah && 
    s.activeSurahNumber === surahId &&
    s.isPlaying
  );
  const isAudioPlaying = useAudioStore(s => s.isPlaying);
  const pause = useAudioStore(s => s.pause);
  const setPlaylist = useAudioStore(s => s.setPlaylist);

  const [activeTab, setActiveTab] = useState<'none' | 'translation' | 'tafseer'>('none');
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [lazyTafseer, setLazyTafseer] = useState<any>(null);
  const [lazyLoading, setLazyLoading] = useState(false);
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
      fetchTafseer(surahId, ayah.numberInSurah, tafseerProvider)
        .then(res => setLazyTafseer(res))
        .catch(err => {
          console.error(err);
          setLazyTafseer(err?.message || "Tafseer for this Ayah could not be found or failed to load.");
        })
        .finally(() => setLazyLoading(false));
    }
  }, [activeTab, surahId, ayah.numberInSurah, lazyTafseer, lazyLoading, tafseerProvider]);

  const handlePressStart = () => {
    pressTimer.current = setTimeout(() => {
      toggleBookmark();
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
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
      removeBookmark(surahId, ayah.numberInSurah);
    } else {
      addBookmark({ surahId, ayahNumber: ayah.numberInSurah });
    }
  };

  const handleMarkAsRead = () => {
    setLastRead({
      surahId,
      ayahNumber: ayah.numberInSurah,
      type: 'text',
      surahName: ayah.surahName || `Surah ${surahId}`
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
      const index = juz.ayahs.findIndex(a => a.numberInSurah === ayah.numberInSurah && a.surahNumber === surahId);
      setPlaylist(-juz.number, juz.ayahs, index !== -1 ? index : 0);
    }
  };

  return (
    <div className="flex flex-col">
      <div 
        id={`ayah-${surahId}-${ayah.numberInSurah}`}
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
        onContextMenu={(e) => { e.preventDefault(); handlePressStart(); }}
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
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {ayah.surahName}
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
              key={`juz-tooltip-${ayah.surahNumber}-${ayah.numberInSurah}`}
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
              key={`juz-ayah-tab-trans-${ayah.surahNumber}-${ayah.numberInSurah}`}
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
              key={`juz-ayah-tab-tafseer-${ayah.surahNumber}-${ayah.numberInSurah}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="py-4">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-[11px] font-bold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={13} />
                    {tafseerProvider === 'kauthar' ? 'تفسیر الکوثر — علامہ شیخ محسن علی نجفی' : 'تفسیرِ نمونہ — آیت اللہ ناصر مکارم شیرازی'}
                  </h4>

                  {/* Accessible Zoom / Readability Controls */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 rounded-lg p-0.5 border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
                    <button
                      id={`juz-zoom-out-btn-${ayah.surahNumber}-${ayah.numberInSurah}`}
                      type="button"
                      title="Zoom Out / کم زوم"
                      onClick={() => setTafseerZoom(tafseerZoom - 15)}
                      disabled={tafseerZoom <= 70}
                      className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ZoomOut size={13} />
                    </button>
                    <button
                      id={`juz-zoom-reset-btn-${ayah.surahNumber}-${ayah.numberInSurah}`}
                      type="button"
                      title="Reset Zoom / اصل سائز"
                      onClick={() => setTafseerZoom(100)}
                      className="px-1.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors"
                    >
                      {tafseerZoom}%
                    </button>
                    <button
                      id={`juz-zoom-in-btn-${ayah.surahNumber}-${ayah.numberInSurah}`}
                      type="button"
                      title="Zoom In / زیادہ زوم (بزرگوں اور کمزور نظر کے لیے)"
                      onClick={() => setTafseerZoom(tafseerZoom + 15)}
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
                         <div className="mb-2">
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
                  <div className="mt-6 pt-4 border-t-[0.5px] border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                    <p>
                      {tafseerProvider === 'kauthar' 
                        ? 'ماخذ: تفسیر الکوثر — علامہ شیخ محسن علی نجفی (balaghulquran.com)'
                        : 'ماخذ: تفسیرِ نمونہ — آیت اللہ العظمی ناصر مکارم شیرازی (tafseerenamoona.net)'}
                    </p>
                  </div>
                </div>
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

export default function JuzView({ juzId, targetAyah, targetSurah, onBack }: JuzViewProps) {
  const [juz, setJuz] = useState<JuzDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fontSize } = useSettingsStore();
  const { play, pause, isPlaying, surahId: audioSurahId, setPlaylist } = useAudioStore();
  const hasScrolledTargetRef = useRef(false);

  useEffect(() => {
    hasScrolledTargetRef.current = false;
  }, [juzId, targetAyah]);

  useEffect(() => {
    // Clear any dirty URL hash and start at top if not navigating to target ayah
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    if (!targetAyah) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [juzId, targetAyah]);

  useEffect(() => {
    const handleScrollToAyah = (e: CustomEvent<{ ayahNumber?: number; surahNumber?: number }>) => {
      const sNum = e.detail?.surahNumber;
      const aNum = e.detail?.ayahNumber;
      if (aNum) {
        let attempts = 0;
        const tryScroll = () => {
          const el = (sNum ? document.getElementById(`ayah-${sNum}-${aNum}`) : null) || 
                     document.getElementById(`ayah-${aNum}`);
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

    window.addEventListener('scroll-to-ayah', handleScrollToAyah as EventListener);
    return () => {
      window.removeEventListener('scroll-to-ayah', handleScrollToAyah as EventListener);
    };
  }, [juzId]);

  // One-time smooth scroll to target ayah if specifically requested
  useEffect(() => {
    if (loading || !juz || hasScrolledTargetRef.current) return;
    if (targetAyah) {
      let attempts = 0;
      let timeoutId: any;
      const tryScroll = () => {
        const el = (targetSurah ? document.getElementById(`ayah-${targetSurah}-${targetAyah}`) : null) ||
                   document.getElementById(`ayah-${targetAyah}`);
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
  }, [loading, juz, targetAyah, targetSurah]);

  const loadJuz = () => {
    setLoading(true);
    setError(null);
    fetchJuzDetail(juzId)
      .then(data => {
        setJuz(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load Juz:", err);
        setError("Unable to load Juz verses. Please check your internet connection.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadJuz();
  }, [juzId]);

  // Using -1 * juzId to differentiate between surahId and juzId in the store if needed, 
  // or we can just pass juzId. Wait, audioSurahId is just an ID. 
  const isThisJuzPlaying = audioSurahId === -juzId && isPlaying;

  const handlePlayJuz = () => {
    if (isThisJuzPlaying) {
      pause();
    } else if (juz) {
      setPlaylist(-juzId, juz.ayahs, 0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error || !juz) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <header className="sticky top-0 z-30 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-b-[0.5px] border-slate-200 dark:border-slate-800 px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 text-slate-600 hover:text-emerald-600 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <span className="font-bold text-slate-800 dark:text-slate-200">Juz {juzId}</span>
            <div className="w-8" />
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Could Not Load Juz</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            {error || "An unexpected error occurred while fetching the Juz verses."}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={loadJuz}
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
              onClick={onBack}
              className="p-2 -ml-2 text-slate-600 hover:text-emerald-600 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          </div>
          <div className="text-center">
            <h1 className="font-bold text-lg text-slate-900 dark:text-slate-100">Juz {juz.number}</h1>
            <p className="text-xs text-slate-500 font-arabic">الجزء {juz.number} • {juz.ayahs.length} Ayahs</p>
          </div>
          <div className="flex-1 flex justify-end">
            <button 
              onClick={handlePlayJuz}
              className={`p-2 rounded-full transition-colors flex items-center gap-2 text-sm font-medium pr-4 ${
                isThisJuzPlaying 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isThisJuzPlaying ? (
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
          <div className="flex flex-col space-y-0">
            {juz.ayahs.map((ayah, index) => {
              const isNewSurah = index === 0 || ayah.surahNumber !== juz.ayahs[index - 1].surahNumber;
              const isSurahStart = ayah.numberInSurah === 1;
              const isLast = index === juz.ayahs.length - 1;

              return (
                <div key={`juz-ayah-${ayah.surahNumber}-${ayah.numberInSurah}-${index}`}>
                  {isNewSurah && (
                    <div className="text-center my-12 pt-8">
                      {index > 0 && <hr className="mb-12 border-slate-200 dark:border-slate-800" />}
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                        Surah {ayah.surahName}
                      </h2>
                      {isSurahStart && ayah.surahNumber !== 1 && ayah.surahNumber !== 9 && (
                        <h3
                          className="font-arabic text-slate-900 dark:text-slate-100 mt-4 mb-8"
                          style={{ fontSize: `${fontSize * 1.5}px` }}
                        >
                          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                        </h3>
                      )}
                    </div>
                  )}
                  <AyahCard ayah={ayah} juz={juz} isLast={isLast} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Citation Box at the bottom */}
        <div className="mt-16 bg-emerald-50 dark:bg-emerald-900/20 border-[0.5px] border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6">
          <h3 className="font-semibold text-emerald-800 dark:text-emerald-400 mb-4 flex items-center gap-2">
            <LinkIcon size={18} />
            Supporting Documents & Citations
          </h3>
          <div className="space-y-3">
            <a 
              href={`https://www.tafseerenamoona.net/juzs/${juz.number}`}
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
                  Complete extensive commentary for Juz {juz.number}
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
    </div>
  );
}
