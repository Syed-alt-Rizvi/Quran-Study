import { getApiUrl } from '../utils/apiBase';
import { hapticImpact, hapticSelection } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';
import { useState, useEffect, useRef } from 'react';
import { fetchSurahDetail, SurahDetail, Ayah } from '../api';
import { fetchTafseer } from '../services/tafseerScraper';
import { useSettingsStore } from '../store';
import { useAudioStore } from '../audioStore';
import Markdown from 'react-markdown';
import { ArrowLeft, Loader2, Link as LinkIcon, PlayCircle, FileText, BookOpen, ChevronDown, ChevronUp, Bookmark, BookmarkCheck, PauseCircle, Sparkles, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DiscussionModal from './DiscussionModal';

interface SurahViewProps {
  key?: string;
  surahId: number;
  targetAyah?: number;
  onBack: () => void;
}

function AyahCard({ ayah, surah, isLast }: { key?: string | number; ayah: Ayah; surah: SurahDetail; isLast?: boolean }) {
  const { fontSize, arabicFont, isBookmarked, addBookmark, removeBookmark, lastRead, setLastRead, incrementAyahsRead, showTranslation, translationLanguages, tafseerLanguages, tafseerProvider, tafseerZoom, setTafseerZoom, autoScrollAudio } = useSettingsStore();
  const { play, pause, isPlaying, surahId: audioSurahId, activeAyahNumber, activeSurahNumber, setPlaylist } = useAudioStore();
  const [activeTab, setActiveTab] = useState<'none' | 'translation' | 'tafseer'>('none');
  const [lazyTafseer, setLazyTafseer] = useState<any>(null);
  const [lazyLoading, setLazyLoading] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const ayahRef = useRef<HTMLDivElement>(null);

  const isActivePlaying = audioSurahId === surah.number && activeAyahNumber === ayah.numberInSurah && activeSurahNumber === surah.number;

  useEffect(() => {
    if (autoScrollAudio && isActivePlaying && isPlaying && ayahRef.current) {
      ayahRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActivePlaying, isPlaying, autoScrollAudio]);

  useEffect(() => {
    if (activeTab === 'tafseer' && !lazyTafseer) {
      setLazyLoading(true);
      fetchTafseer(surah.number, ayah.numberInSurah, tafseerProvider)
        .then(res => setLazyTafseer(res))
        .catch(err => {
          console.error(err);
          setLazyTafseer("Tafseer for this Ayah could not be found or failed to load.");
        })
        .finally(() => setLazyLoading(false));
    }
  }, [activeTab, surah.number, ayah.numberInSurah, lazyTafseer, tafseerProvider]);

  const bookmarked = isBookmarked(surah.number, ayah.numberInSurah);
  const isLastRead = lastRead?.surahId === surah.number && lastRead?.ayahNumber === ayah.numberInSurah;

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
    if (isActivePlaying && isPlaying) {
      pause();
    } else {
      const index = surah.ayahs.findIndex(a => a.numberInSurah === ayah.numberInSurah);
      setPlaylist(surah.number, surah.ayahs, index !== -1 ? index : 0);
    }
  };

  const baseHue = Math.floor(((surah.number * 137.5) + (ayah.numberInSurah * 35)) % 360);
  const secHue = (baseHue + 40) % 360;

  const styleProps = {
    '--ayah-base-hue': `${baseHue}`,
    '--ayah-sec-hue': `${secHue}`,
  } as React.CSSProperties;

  return (
    <div className="flex flex-col">
      <div 
        id={`ayah-${ayah.numberInSurah}`}
        ref={ayahRef}
        style={styleProps}
        className={`group relative py-4 px-4 sm:px-8 transition-all duration-500 rounded-[2rem] border ${
          isActivePlaying || isLastRead
            ? 'border-[hsl(var(--ayah-base-hue),60%,80%)] dark:border-[hsl(var(--ayah-base-hue),40%,30%)] shadow-[0_4px_15px_-3px_hsla(var(--ayah-base-hue),70%,70%,0.4)] dark:shadow-[0_4px_15px_-3px_hsla(var(--ayah-base-hue),70%,20%,0.6)] bg-gradient-to-br from-[hsl(var(--ayah-base-hue),80%,90%)] to-[hsl(var(--ayah-sec-hue),70%,85%)] dark:from-[hsl(var(--ayah-base-hue),60%,20%)] dark:to-[hsl(var(--ayah-sec-hue),50%,15%)]' 
            : 'border-transparent bg-gradient-to-br from-[hsl(var(--ayah-base-hue),40%,98%)] to-[hsl(var(--ayah-sec-hue),30%,95%)] dark:from-[hsl(var(--ayah-base-hue),20%,12%)] dark:to-[hsl(var(--ayah-sec-hue),15%,8%)]'
        }`}
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
            <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${
              isActivePlaying 
                ? 'bg-emerald-500 text-white shadow-md' 
                : isLastRead 
                  ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>
              {ayah.numberInSurah}
            </span>
            
            <button 
              onClick={handlePlayAudio}
              className={`p-1 rounded-full transition-colors ${
                isActivePlaying 
                  ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800' 
                  : 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isActivePlaying && isPlaying ? "Pause Audio" : "Play from this Ayah"}
            >
              {isActivePlaying && isPlaying ? <PauseCircle size={22} fill="currentColor" /> : <PlayCircle size={22} />}
            </button>
            {bookmarked && (
              <BookmarkCheck size={20} className="text-emerald-500" />
            )}
            {isLastRead && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Last Read</span>
            )}
          </div>
          <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            {!isLastRead && (
              <button
                onClick={handleMarkAsRead}
                className="px-3 py-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 rounded-full transition-colors"
              >
                Mark Read
              </button>
            )}
            <button
              onClick={() => {
                const text = `Qur'an ${surah.number}:${ayah.numberInSurah}`;
                navigator.clipboard.writeText(text);
                const event = new CustomEvent('open-discussion', { detail: { ayah, surah } });
                window.dispatchEvent(event);
              }}
              className="p-2 text-slate-400 hover:text-emerald-500 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              title="Cite & Discuss"
            >
              <BookOpen size={18} />
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
          className="font-arabic text-right leading-loose text-slate-900 dark:text-slate-50 select-none mb-2"
          style={{ fontSize: `${fontSize}px`, fontFamily: arabicFont }}
        >
          {ayah.text}
        </p>

        {/* Tiny Elegant Tabs with Beautiful Breaker Line */}
        <div className="flex items-center justify-center gap-4 mt-4 mb-2">
          <div className="flex-1 h-[0.5px] bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-emerald-500/20"></div>
          <div className="flex gap-2">
            {showTranslation && (
              <button 
                onClick={() => setActiveTab(activeTab === 'translation' ? 'none' : 'translation')}
                className={`px-4 py-1.5 text-[10px] uppercase tracking-widest font-semibold rounded-full border-[0.5px] transition-all ${activeTab === 'translation' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700' : 'bg-transparent text-slate-400 border-slate-200 dark:border-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200'}`}
              >
                Translation
              </button>
            )}
            <button 
              onClick={() => setActiveTab(activeTab === 'tafseer' ? 'none' : 'tafseer')}
              className={`px-4 py-1.5 text-[10px] uppercase tracking-widest font-semibold rounded-full border-[0.5px] transition-all ${activeTab === 'tafseer' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700' : 'bg-transparent text-slate-400 border-slate-200 dark:border-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200'}`}
            >
              Tafseer
            </button>
          </div>
          <div className="flex-1 h-[0.5px] bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-800 to-emerald-500/20"></div>
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
                      <div className="text-red-500 text-sm">
                        {lazyTafseer}
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
}

export default function SurahView({ surahId, targetAyah, onBack }: SurahViewProps) {
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
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
    window.addEventListener('open-discussion', handleOpenDiscussion as EventListener);
    return () => window.removeEventListener('open-discussion', handleOpenDiscussion as EventListener);
  }, []);

  useEffect(() => {
    setLoading(true);
    hasScrolledTargetRef.current = false;
    fetchSurahDetail(surahId)
      .then((surahData) => {
        setSurah(surahData);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [surahId]);

  // One-time smooth scroll to target ayah if specifically requested
  useEffect(() => {
    if (loading || !surah || hasScrolledTargetRef.current) return;
    
    if (targetAyah) {
      hasScrolledTargetRef.current = true;
      const timer = setTimeout(() => {
        const el = document.getElementById(`ayah-${targetAyah}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('bg-emerald-50', 'dark:bg-emerald-900/20', 'ring-2', 'ring-emerald-500/50', 'transition-all', 'duration-700');
          setTimeout(() => {
            el.classList.remove('bg-emerald-50', 'dark:bg-emerald-900/20', 'ring-2', 'ring-emerald-500/50');
          }, 3000);
        }
      }, 150);
      return () => clearTimeout(timer);
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

  if (loading || !surah) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-safe">
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

      <main className="max-w-4xl lg:max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="bg-white dark:bg-slate-900 sm:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:sm:shadow-[0_8px_30px_rgb(0,0,0,0.4)] sm:rounded-2xl sm:border-[0.5px] border-slate-200 dark:border-slate-800 p-2 sm:p-12 md:p-16 relative">
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
