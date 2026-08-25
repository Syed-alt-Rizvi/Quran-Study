import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { fetchJuzDetail, JuzDetail, Ayah } from '../api';
import { fetchTafseer } from '../services/tafseerScraper';
import { useSettingsStore } from '../store';
import { useAudioStore } from '../audioStore';
import Markdown from 'react-markdown';
import { ArrowLeft, Loader2, Link as LinkIcon, FileText, Bookmark, BookmarkCheck, PlayCircle, PauseCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface JuzViewProps {
  key?: string;
  juzId: number;
  onBack: () => void;
}

function AyahCard({ ayah, juz, isLast }: { key?: string | number; ayah: Ayah; juz: JuzDetail; isLast?: boolean }) {
  const { fontSize, arabicFont, isBookmarked, addBookmark, removeBookmark, lastRead, setLastRead, incrementAyahsRead, showTranslation, translationLanguages, tafseerLanguages } = useSettingsStore();
  const { play, pause, isPlaying, surahId: audioSurahId, activeAyahNumber, activeSurahNumber, setPlaylist } = useAudioStore();
  const [activeTab, setActiveTab] = useState<'none' | 'translation' | 'tafseer'>('none');
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [lazyTafseer, setLazyTafseer] = useState<any>(null);
  const [lazyLoading, setLazyLoading] = useState(false);
  const ayahRef = useRef<HTMLDivElement>(null);
  
  const surahId = ayah.surahNumber || 1;
  const isActivePlaying = audioSurahId === -juz.number && activeAyahNumber === ayah.numberInSurah && activeSurahNumber === surahId;

  useEffect(() => {
    if (isActivePlaying && isPlaying && ayahRef.current) {
      ayahRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActivePlaying, isPlaying]);

  useEffect(() => {
    if (activeTab === 'tafseer' && !lazyTafseer) {
      setLazyLoading(true);
      fetchTafseer(surahId, ayah.numberInSurah)
        .then(res => setLazyTafseer(res))
        .catch(err => {
          console.error(err);
          setLazyTafseer("Tafseer for this Ayah could not be found or failed to load.");
        })
        .finally(() => setLazyLoading(false));
    }
  }, [activeTab, surahId, ayah.numberInSurah, lazyTafseer]);
  const bookmarked = isBookmarked(surahId, ayah.numberInSurah);
  const isLastRead = lastRead?.surahId === surahId && lastRead?.ayahNumber === ayah.numberInSurah;

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
    if (isActivePlaying && isPlaying) {
      pause();
    } else {
      const index = juz.ayahs.findIndex(a => a.numberInSurah === ayah.numberInSurah && a.surahNumber === surahId);
      setPlaylist(surahId, juz.ayahs, index !== -1 ? index : 0);
    }
  };

  return (
    <div className="flex flex-col">
      <div 
        id={`ayah-${surahId}-${ayah.numberInSurah}`}
        ref={ayahRef}
        className={`group relative py-2 px-2 sm:px-6 transition-all duration-500 rounded-xl ${
          isActivePlaying 
            ? 'bg-emerald-100/50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800' 
            : isLastRead 
              ? 'bg-emerald-50/30 dark:bg-emerald-900/10 border border-transparent' 
              : 'border border-transparent'
        }`}
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        onContextMenu={(e) => { e.preventDefault(); handlePressStart(); }}
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
          className="font-arabic text-right leading-loose text-slate-900 dark:text-slate-50 mb-2"
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
              key="translation"
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
              key="tafseer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="py-4">
                <h4 className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <FileText size={12} />
                  Tafseer-e-Namoona Discussion
                </h4>
                <div className="prose prose-slate dark:prose-invert max-w-none text-[15px] text-slate-700 dark:text-slate-300">
                  {lazyLoading ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                      <Loader2 className="w-5 h-5 text-emerald-600 animate-spin mb-3" />
                      <p className="text-slate-400 text-xs uppercase tracking-widest">Loading Reference...</p>
                    </div>
                  ) : typeof lazyTafseer === 'string' ? (
                    <div className="text-red-500 text-sm">
                      {lazyTafseer}
                    </div>
                  ) : (
                    <div>
                      {tafseerLanguages.includes('en') && lazyTafseer?.en && (
                         <div className="mb-2">
                           <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">English</h5>
                           <Markdown>{lazyTafseer.en}</Markdown>
                         </div>
                      )}
                      {tafseerLanguages.includes('ur') && lazyTafseer?.ur && (
                        <div dir="rtl" className="font-arabic leading-loose text-right text-slate-800 dark:text-slate-200">
                          <h5 dir="ltr" className="font-semibold text-slate-800 dark:text-slate-200 mb-2 text-left">Urdu</h5>
                          <Markdown>{lazyTafseer.ur}</Markdown>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mt-6 pt-4 border-t-[0.5px] border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                    <p>Source: Tafseer-e-Namoona (تفسیر نمونه)</p>
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
}

export default function JuzView({ juzId, onBack }: JuzViewProps) {
  const [juz, setJuz] = useState<JuzDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { fontSize } = useSettingsStore();
  const { play, pause, isPlaying, surahId: audioSurahId, setPlaylist } = useAudioStore();

  useEffect(() => {
    setLoading(true);
    fetchJuzDetail(juzId)
      .then(data => {
        setJuz(data);
        setLoading(false);

        // Restore scroll position robustly using capacitor preferences
        import('../utils/storage').then(({ getStorage }) => {
          getStorage(`shia-quran-scroll-ayah-juz-${juzId}`).then((savedAyahId) => {
            if (savedAyahId) {
              setTimeout(() => {
                const el = document.getElementById(savedAyahId);
                if (el) {
                  el.scrollIntoView({ behavior: 'auto', block: 'center' });
                }
              }, 100);
            }
          });
        });
      })
      .catch(console.error);
  }, [juzId]);

  // Track scroll position
  useEffect(() => {
    if (!juz) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const ayahId = entry.target.id; // e.g. "ayah-surahId-ayahNum"
            import('../utils/storage').then(({ setStorage }) => {
              setStorage(`shia-quran-scroll-ayah-juz-${juzId}`, ayahId);
            });
          }
        });
      },
      { rootMargin: '-10% 0px -80% 0px' }
    );
    
    juz.ayahs.forEach(ayah => {
      // In juz, ayah has surahId attached manually in JuzView mapping
      const el = document.getElementById(`ayah-${ayah.surahNumber}-${ayah.numberInSurah}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [juz, juzId]);

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

  if (loading || !juz) {
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

      <main className="max-w-4xl lg:max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-slate-700/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] sm:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:sm:shadow-[0_8px_30px_rgb(0,0,0,0.4)] sm:rounded-2xl sm:border-[0.5px] border-slate-200 dark:border-slate-800 p-2 sm:p-12 md:p-16 relative">
          <div className="flex flex-col space-y-0">
            {juz.ayahs.map((ayah, index) => {
              const isNewSurah = index === 0 || ayah.surahNumber !== juz.ayahs[index - 1].surahNumber;
              const isSurahStart = ayah.numberInSurah === 1;
              const isLast = index === juz.ayahs.length - 1;

              return (
                <div key={`${ayah.surahNumber}-${ayah.numberInSurah}-${index}`}>
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
              className="flex items-start gap-3 p-3 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-slate-700/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-xl hover:shadow-md transition-shadow group border-[0.5px] border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
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
              className="flex items-start gap-3 p-3 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-slate-700/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-xl hover:shadow-md transition-shadow group border-[0.5px] border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
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
