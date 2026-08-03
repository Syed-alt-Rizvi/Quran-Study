import { useState, useEffect, useRef } from 'react';
import { fetchJuzDetail, JuzDetail, Ayah } from '../api';
import { fetchTafseer } from '../services/tafseerScraper';
import { useSettingsStore } from '../store';
import Markdown from 'react-markdown';
import { ArrowLeft, Loader2, Link as LinkIcon, PlayCircle, FileText, BookOpen, ChevronDown, ChevronUp, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface JuzViewProps {
  key?: string;
  juzId: number;
  onBack: () => void;
}

function AyahCard({ ayah, juz }: { key?: string | number; ayah: Ayah; juz: JuzDetail }) {
  const { fontSize, arabicFont, isBookmarked, addBookmark, removeBookmark, lastRead, setLastRead, incrementAyahsRead, showTranslation, translationLanguages, tafseerLanguages } = useSettingsStore();
  const [showDetailedTafseer, setShowDetailedTafseer] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [lazyTafseer, setLazyTafseer] = useState<any>(null);
  const [lazyLoading, setLazyLoading] = useState(false);
  
  const surahId = ayah.surahNumber || 1;

  useEffect(() => {
    if (showDetailedTafseer && !lazyTafseer) {
      setLazyLoading(true);
      fetchTafseer(surahId, ayah.numberInSurah)
        .then(res => setLazyTafseer(res))
        .catch(err => {
          console.error(err);
          setLazyTafseer("Tafseer for this Ayah could not be found or failed to load.");
        })
        .finally(() => setLazyLoading(false));
    }
  }, [showDetailedTafseer, surahId, ayah.numberInSurah, lazyTafseer]);
  const bookmarked = isBookmarked(surahId, ayah.numberInSurah);
  const isLastRead = lastRead?.surahId === surahId && lastRead?.ayahNumber === ayah.numberInSurah;

  const handlePressStart = () => {
    pressTimer.current = setTimeout(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    }, 500);
  };

  const handlePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
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
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className={`group relative p-6 border-b border-stone-200/70 dark:border-stone-800/70 last:border-0 transition-colors ${isLastRead ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}
      onPointerDown={handlePressStart}
      onPointerUp={handlePressEnd}
      onPointerLeave={handlePressEnd}
      onContextMenu={(e) => { e.preventDefault(); handlePressStart(); }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${isLastRead ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200' : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'}`}>
            {ayah.numberInSurah}
          </span>
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            {ayah.surahName}
          </span>
          {bookmarked && (
            <Bookmark size={16} className="text-emerald-500 fill-emerald-500" />
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
            className="p-2 text-stone-400 hover:text-emerald-500 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          >
            <Bookmark size={20} className={bookmarked ? "fill-emerald-500 text-emerald-500" : ""} />
          </button>
        </div>
      </div>
      
      <p 
        className="font-arabic text-right leading-loose text-stone-900 dark:text-stone-50 mb-8"
        style={{ fontSize: `${fontSize}px`, fontFamily: arabicFont }}
      >
        {ayah.text}
      </p>
      
      {showTranslation && (
        <div className="space-y-4 mb-4">
          {translationLanguages.includes('en') && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 relative">
              <span className="absolute -top-3 left-6 px-2 bg-white dark:bg-stone-900 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                English
              </span>
              <p className="leading-relaxed text-stone-700 dark:text-stone-300 text-base">
                {ayah.translationEn}
              </p>
            </div>
          )}
          {translationLanguages.includes('ur') && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 relative">
              <span className="absolute -top-3 right-6 px-2 bg-white dark:bg-stone-900 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                اردو
              </span>
              <p className="leading-relaxed text-stone-700 dark:text-stone-300 text-lg font-arabic text-right">
                {ayah.translationUr}
              </p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setShowDetailedTafseer(!showDetailedTafseer)}
        className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-500 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors px-2 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
      >
        <BookOpen size={16} />
        {showDetailedTafseer ? 'Hide Tafseer' : 'Tafseer'}
        {showDetailedTafseer ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <AnimatePresence>
        {showDetailedTafseer && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-6 bg-stone-100 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-800">
              <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-emerald-600 dark:text-emerald-500" />
                Tafseer-e-Namoona - Juz {juz.number}, Verse {ayah.numberInSurah}
              </h4>
              <div className="prose prose-stone dark:prose-invert max-w-none text-sm md:text-base text-stone-700 dark:text-stone-300">
                {lazyLoading ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center">
                    <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mb-4" />
                    <p className="text-stone-500">Loading exact tafseer from Tafseer-e-Namoona...</p>
                  </div>
                ) : typeof lazyTafseer === 'string' ? (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
                    {lazyTafseer}
                  </div>
                ) : (
                  <div>
                    {tafseerLanguages.includes('en') && lazyTafseer?.en && (
                       <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                         <h5 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">English Tafseer</h5>
                         <Markdown>{lazyTafseer.en}</Markdown>
                       </div>
                    )}
                    {tafseerLanguages.includes('ur') && lazyTafseer?.ur && (
                      <div dir="rtl" className="font-arabic leading-loose text-right text-stone-800 dark:text-stone-200">
                        <h5 dir="ltr" className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2 text-left">Urdu Tafseer</h5>
                        <Markdown>{lazyTafseer.ur}</Markdown>
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-700 text-xs text-stone-500 dark:text-stone-400">
                  <p>Source: Tafseer-e-Namoona (تفسیر نمونه) by Ayatollah Naser Makarem Shirazi and other scholars.</p>
                  <a 
                    href={`https://www.tafseerenamoona.net/juzs/${juz.number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 dark:text-emerald-500 hover:underline mt-1 inline-block"
                  >
                    Read the full unabridged original text on tafseerenamoona.net
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function JuzView({ juzId, onBack }: JuzViewProps) {
  const [juz, setJuz] = useState<JuzDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { fontSize } = useSettingsStore();

  useEffect(() => {
    setLoading(true);
    fetchJuzDetail(juzId)
      .then(data => {
        setJuz(data);
        setLoading(false);
      })
      .catch(console.error);
  }, [juzId]);

  if (loading || !juz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-safe">
      <header className="sticky top-0 z-30 bg-stone-50/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 text-stone-600 hover:text-emerald-600 dark:text-stone-400 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 text-center pr-10">
            <h1 className="font-bold text-lg text-stone-900 dark:text-stone-100">Juz {juz.number}</h1>
            <p className="text-xs text-stone-500 font-arabic">الجزء {juz.number} • {juz.ayahs.length} Ayahs</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-12">
          {juz.ayahs.map((ayah, index) => {
            const isNewSurah = index === 0 || ayah.surahNumber !== juz.ayahs[index - 1].surahNumber;
            const isSurahStart = isNewSurah && ayah.numberInSurah === 1;

            return (
              <React.Fragment key={`${ayah.surahNumber}-${ayah.numberInSurah}-${index}`}>
                {isNewSurah && (
                  <div className="text-center my-12 pt-8">
                    {index > 0 && <hr className="mb-12 border-stone-200 dark:border-stone-800" />}
                    <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-200 mb-2">
                      Surah {ayah.surahName}
                    </h2>
                    {isSurahStart && ayah.surahNumber !== 1 && ayah.surahNumber !== 9 && (
                      <h3
                        className="font-arabic text-emerald-700 dark:text-emerald-500 mt-4 mb-8"
                        style={{ fontSize: `${fontSize * 1.2}px` }}
                      >
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </h3>
                    )}
                  </div>
                )}
                <AyahCard ayah={ayah} juz={juz} />
              </React.Fragment>
            );
          })}
        </div>

        {/* Citation Box at the bottom */}
        <div className="mt-16 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6">
          <h3 className="font-semibold text-emerald-800 dark:text-emerald-400 mb-4 flex items-center gap-2">
            <LinkIcon size={18} />
            Supporting Documents & Citations
          </h3>
          <div className="space-y-3">
            <a 
              href={`https://www.tafseerenamoona.net/juzs/${juz.number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 bg-white dark:bg-stone-900 rounded-xl hover:shadow-md transition-shadow group border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
            >
              <FileText className="text-emerald-500 mt-0.5 shrink-0" size={18} />
              <div>
                <p className="font-medium text-stone-800 dark:text-stone-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Tafseer-e-Namoona (Official Reference)
                </p>
                <p className="text-sm text-stone-500 mt-1 line-clamp-1">
                  Complete extensive commentary for Juz {juz.number}
                </p>
              </div>
            </a>
            <a 
              href="https://quran.com/en"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 bg-white dark:bg-stone-900 rounded-xl hover:shadow-md transition-shadow group border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
            >
              <FileText className="text-emerald-500 mt-0.5 shrink-0" size={18} />
              <div>
                <p className="font-medium text-stone-800 dark:text-stone-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Quran.com Audio & Text Resources
                </p>
                <p className="text-sm text-stone-500 mt-1 line-clamp-1">
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
