import { hapticImpact } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';
import { useState, useEffect, useMemo } from 'react';
import { fetchSurahs, SurahMeta, prefetchSurah, prefetchJuz } from '../api';
import staticSurahs from '../surahList.json';
import { 
  Search, BookOpen, Settings, Microscope, ArrowRight, 
  MessageCircle, AlertTriangle, KeyRound, Edit3, Check, X
} from "lucide-react";
import GlobalDiscussions from "./GlobalDiscussions";
import ImamScienceFeed from "./ImamScienceFeed";
import MafatihView from "./MafatihView";
import { useSettingsStore } from '../store';
import { PWAInstallButton } from './PWAInstallButton';

const JUZ_NAMES = [
  'Alif Laam Meem', 'Sayaqool', 'Tilkal Rusul', 'Lan Tana Loo', 'Wal Mohsanat',
  'La Yuhibbullah', 'Wa Iza Samiu', 'Wa Lau Annana', 'Qalal Malao', 'Wa A\'lamu',
  'Yatazeroon', 'Wa Mamin Da\'abat', 'Wa Ma Ubrioo', 'Rubama', 'Subhanallahzi',
  'Qal Alam', 'Iqtaraba', 'Qadd Aflaha', 'Wa Qalallazina', 'A\'man Khalaqa',
  'Utlu Ma Oohi', 'Wa Manyaqnut', 'Wa Mali', 'Faman Azlam', 'Elahe Yuraddo',
  'Ha\'a Meem', 'Qala Fama Khatbukum', 'Qadd Sami Allah', 'Tabarakallazi', 'Amma Yatasa\'aloon'
];

const STATIC_JUZ_LIST = Array.from({ length: 30 }, (_, i) => ({
  number: i + 1,
  name: JUZ_NAMES[i]
}));

const SPIRITUAL_REFLECTIONS = [
  {
    quote: "The spring of the hearts is the Holy Quran.",
    source: "Amir al-Mu'minin Imam Ali (a.s)",
  },
  {
    quote: "Whoever recites the Quran in reflection, it becomes a guide and light for their soul.",
    source: "Imam Ja'far al-Sadiq (a.s)",
  },
  {
    quote: "In the Quran is the healing for hearts and the illumination for minds.",
    source: "Amir al-Mu'minin Imam Ali (a.s)",
  },
  {
    quote: "Reflect upon the verses of the Quran, for they are the treasures of divine knowledge.",
    source: "Imam Ali Zayn al-Abidin (a.s)",
  },
];

interface HomeProps {
  key?: string;
  onSelectSurah: (id: number, targetAyah?: number) => void;
  onSelectJuz: (id: number) => void;
  onSelectMafatihItem: (id: string) => void;
  onOpenSettings: () => void;
  onExit: () => void;
}

export default function Home({ onSelectSurah, onSelectJuz, onSelectMafatihItem, onOpenSettings, onExit }: HomeProps) {
  const [surahs, setSurahs] = useState<SurahMeta[]>(() => {
    return Array.isArray(staticSurahs) && staticSurahs.length === 114 ? (staticSurahs as SurahMeta[]) : [];
  });
  const [loading, setLoading] = useState(() => surahs.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { readProgress, lastRead, defaultAppTab, userName, setUserName, habitStats } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<'quran' | 'mafatih' | 'science' | 'discuss'>(defaultAppTab || 'quran');
  const [quranMode, setQuranMode] = useState<'surah' | 'juz'>('surah');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName || '');

  useEffect(() => {
    setTempName(userName || '');
  }, [userName]);

  const handleSaveName = () => {
    const trimmed = tempName.trim();
    setUserName(trimmed);
    setIsEditingName(false);
    hapticImpact(ImpactStyle.Medium);
  };

  const handleCancelName = () => {
    setTempName(userName || '');
    setIsEditingName(false);
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayAyahs = habitStats?.dailyAyahsRead?.[todayStr] || 0;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return { ar: 'صَبَاحَ الْخَيْرِ وَالْبَرَكَةِ', en: 'Subh Mubarak' };
    }
    if (hour < 17) {
      return { ar: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ', en: 'Salam Alaykum' };
    }
    return { ar: 'مَسَاءَ النُّورِ وَالْمَغْفِرَةِ', en: 'Peaceful Evening' };
  }, []);

  const reflection = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return SPIRITUAL_REFLECTIONS[dayOfYear % SPIRITUAL_REFLECTIONS.length];
  }, []);

  const userInitial = useMemo(() => {
    if (userName && userName.trim().length > 0) {
      return userName.trim().charAt(0).toUpperCase();
    }
    return 'ش';
  }, [userName]);

  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    if (defaultAppTab) {
      setActiveTab(defaultAppTab);
    }
  }, [defaultAppTab]);

  // Idle background prefetching for zero-latency instant opening
  useEffect(() => {
    if (lastRead?.surahId) {
      prefetchSurah(lastRead.surahId);
    }
    prefetchSurah(1); // Al-Fatiha
    prefetchSurah(36); // Yaseen
    prefetchSurah(67); // Al-Mulk
  }, [lastRead?.surahId]);

  const loadSurahs = () => {
    if (surahs.length === 0) {
      setLoading(true);
    }
    setError(null);
    fetchSurahs()
      .then(data => {
        setSurahs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch surahs:", err);
        if (surahs.length === 0) {
          setError("Unable to load Quran chapters. Please check your internet connection.");
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    if (surahs.length < 114) {
      loadSurahs();
    }
  }, [surahs.length]);

  const q = searchQuery.trim().toLowerCase();
  const filteredSurahs = useMemo(() => {
    if (!q) return surahs;
    const cleanQ = q.replace(/[^a-z0-9]/g, '');
    return surahs.filter(s => {
      return (
        s.number.toString() === q ||
        s.englishName.toLowerCase().includes(q) ||
        (s.englishNameTranslation && s.englishNameTranslation.toLowerCase().includes(q)) ||
        s.name.includes(searchQuery.trim()) ||
        (cleanQ.length > 0 && s.englishName.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanQ))
      );
    });
  }, [surahs, q, searchQuery]);
  
  const filteredJuzs = useMemo(() => {
    if (!q) return STATIC_JUZ_LIST;
    return STATIC_JUZ_LIST.filter(j => 
      `juz ${j.number}`.includes(q) || 
      j.number.toString().includes(q) ||
      j.name.toLowerCase().includes(q)
    );
  }, [q]);

  return (
    <div className="min-h-screen pb-24 text-slate-900 dark:text-slate-100">
      {/* Clean Minimalist Header */}
      <header className="sticky top-0 z-30 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-3 sm:px-4 py-2.5 sm:py-3 gpu-layer">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-arabic font-bold text-sm sm:text-base shadow-xs select-none ring-1 ring-emerald-600/30 shrink-0">
              ش
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                Shia Markaz
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Holy Quran &amp; Mafatih Al Jinan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-right">
            <PWAInstallButton variant="compact" />
            <span className="text-[11px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {activeTab === 'quran' && 'Quran Reader'}
              {activeTab === 'mafatih' && 'Mafatih Al Jinan'}
              {activeTab === 'science' && 'Imams & Science'}
              {activeTab === 'discuss' && 'Discussions'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 sm:py-4">
        {/* Thoughtful, Simplistic & Elegant Welcome Masthead - Proportional on all mobile ratios */}
        <section className="mb-3 pt-0.5 pb-2.5 border-b border-slate-200/70 dark:border-slate-800/70">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-3">
            <div className="min-w-0 flex-1">
              {/* Sacred Arabic Salutation */}
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-emerald-800/90 dark:text-emerald-400/90 font-medium select-none mb-0.5">
                <span className="font-arabic font-semibold text-xs sm:text-sm leading-none">{greeting.ar}</span>
                <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                <span className="text-slate-500 dark:text-slate-400 font-normal">{greeting.en}</span>
              </div>

              {/* Personal Reader Name & In-line Name Editing */}
              {isEditingName ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <input
                    type="text"
                    autoFocus
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') handleCancelName();
                    }}
                    placeholder="Enter your name..."
                    className="text-xl sm:text-2xl font-['Cormorant_Garamond',_'Playfair_Display',_Georgia,_serif] italic font-semibold text-slate-900 dark:text-slate-100 bg-transparent border-b-2 border-emerald-600 dark:border-emerald-400 focus:outline-none px-0 py-0.5 max-w-sm transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    className="p-1 text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors"
                    title="Save Name"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelName}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    title="Cancel"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => {
                    hapticImpact(ImpactStyle.Light);
                    setIsEditingName(true);
                  }}
                  className="group inline-flex items-baseline gap-2 cursor-pointer select-none"
                  title="Click to edit name"
                >
                  <h2 className="text-xl sm:text-2xl font-['Cormorant_Garamond',_'Playfair_Display',_Georgia,_serif] italic font-semibold tracking-wide text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                    {userName && userName.trim().length > 0 ? userName.trim() : 'Noble Reader'}
                  </h2>
                  <Edit3 size={13} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0" />
                </div>
              )}

              {/* Thoughtful Spiritual Reflection from Ahlulbayt (a.s) - Responsive and concise */}
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-serif italic max-w-xl leading-snug line-clamp-2">
                &ldquo;{reflection.quote}&rdquo;
                <span className="not-italic text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 ml-1.5 font-sans">
                  — {reflection.source}
                </span>
              </p>
            </div>

            {/* Quiet, Unboxed Daily Recitation Status */}
            {todayAyahs > 0 && !isEditingName && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 sm:text-right shrink-0 self-start sm:self-auto pt-0.5 sm:pt-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
                <span>
                  <strong className="text-slate-700 dark:text-slate-300 font-semibold">{todayAyahs}</strong>{' '}
                  {todayAyahs === 1 ? 'ayah recited today' : 'ayahs recited today'}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Last Read Ayah Quick Resume */}
        {lastRead && activeTab === 'quran' && (
          <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Continue Reading
              </p>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                {lastRead.surahName || ('Surah ' + lastRead.surahId)} &bull; Ayah {lastRead.ayahNumber}
              </h3>
            </div>
            <button 
              onClick={() => onSelectSurah(lastRead.surahId, lastRead.ayahNumber)}
              onMouseEnter={() => prefetchSurah(lastRead.surahId)}
              onTouchStart={() => prefetchSurah(lastRead.surahId)}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1"
            >
              <span>Resume</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}

        {/* View Switcher Content */}
        {activeTab === 'mafatih' ? (
          <MafatihView onSelectItem={onSelectMafatihItem} />
        ) : activeTab === 'science' ? (
          <ImamScienceFeed onSelectSurah={onSelectSurah} />
        ) : activeTab === 'discuss' ? (
          <GlobalDiscussions />
        ) : (
          <div>
            {/* Search Input for Quran */}
            <div className="relative mb-2.5">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder={quranMode === 'surah' ? 'Search Surah by name or number...' : 'Search Juz by number or title...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-shadow text-xs sm:text-sm truncate"
              />
            </div>

            {/* Sub-Switch: Surahs (114) vs Juz (30) */}
            <div className="flex gap-1.5 mb-3 p-1 bg-slate-200/50 dark:bg-slate-900/50 rounded-xl max-w-xs mx-auto border border-slate-200/60 dark:border-slate-800/60">
              <button
                onClick={() => { hapticImpact(ImpactStyle.Light); setQuranMode('surah'); }}
                className={`flex-1 py-1 sm:py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  quranMode === 'surah'
                    ? 'bg-white dark:bg-slate-800 shadow-xs text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                114 Surahs
              </button>
              <button
                onClick={() => { hapticImpact(ImpactStyle.Light); setQuranMode('juz'); }}
                className={`flex-1 py-1 sm:py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  quranMode === 'juz'
                    ? 'bg-white dark:bg-slate-800 shadow-xs text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                30 Juz
              </button>
            </div>

            {loading ? (
              <div className="space-y-2.5">
                {[...Array(8)].map((_, i) => (
                  <div key={`skeleton-${i}`} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : error && surahs.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs max-w-md mx-auto my-4">
                <AlertTriangle size={24} className="text-rose-500 mx-auto mb-2" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Failed to Load</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{error}</p>
                <button
                  onClick={loadSurahs}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Retry
                </button>
              </div>
            ) : quranMode === 'surah' ? (
              filteredSurahs.length === 0 ? (
                <div className="text-center py-10 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    No Surahs found matching &ldquo;{searchQuery}&rdquo;
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
                  {filteredSurahs.map((surah, surahIdx) => {
                    const highestRead = readProgress?.[surah.number] || 0;
                    const progressPercent = Math.min(100, Math.round((highestRead / surah.numberOfAyahs) * 100));
                    
                    return (
                      <button
                        key={`surah-card-${surah.number || 's'}-${surahIdx}`}
                        onClick={() => { hapticImpact(ImpactStyle.Light); onSelectSurah(surah.number); }}
                        onMouseEnter={() => prefetchSurah(surah.number)}
                        onTouchStart={() => prefetchSurah(surah.number)}
                        className="surah-card-render w-full text-left group flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-600/60 hover:shadow-md transition-all duration-150"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs group-hover:bg-emerald-600 group-hover:text-white transition-all flex-shrink-0 shadow-xs">
                            {surah.number}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                              {surah.englishName}
                            </h3>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                              <span>{surah.numberOfAyahs} Ayahs</span>
                              <span>&bull;</span>
                              <span>{surah.revelationType}</span>
                            </div>
                            {highestRead > 0 && (
                              <div className="w-20 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1.5">
                                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right pl-2 flex-shrink-0">
                          <span className="font-arabic text-xl font-normal text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {surah.name}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )
            ) : (
              filteredJuzs.length === 0 ? (
                <div className="text-center py-10 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    No Juz found matching &ldquo;{searchQuery}&rdquo;
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
                  {filteredJuzs.map((juz, juzIdx) => (
                    <button
                      key={`juz-card-${juz.number || 'j'}-${juzIdx}`}
                      onClick={() => onSelectJuz(juz.number)}
                      onMouseEnter={() => prefetchJuz(juz.number)}
                      onTouchStart={() => prefetchJuz(juz.number)}
                      className="juz-card-render w-full text-left group flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 transition-colors">
                          {juz.number}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                            {juz.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Juz {juz.number}
                          </p>
                        </div>
                      </div>
                      <span className="font-arabic text-xl text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        الجزء {juz.number}
                      </span>
                    </button>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* Minimal Footer with Solemn Iltemas-e-Surah Fatiha */}
        <footer className="mt-12 pt-6 pb-8 border-t border-slate-200/80 dark:border-slate-800/80 text-center space-y-2">
          <p className="text-xs font-serif text-slate-800 dark:text-slate-200">
            التماسِ سورۂ فاتحہ برائے مغفرت: <span className="font-semibold">Sakina Banoo D/O Akhoon Mohd Kazim</span> &bull; <span className="font-semibold">Syed Abbas Rizvi S/O Syed Hassan Rizvi</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Shia Markaz &bull; Developer: Syed Murtaza Razavee
          </p>
        </footer>
      </main>

      {/* Single Persistent Bottom Navigation Dock - Perfectly Sized for Every Phone & Screen Ratio */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 pt-1 pb-safe px-1 sm:px-3 shadow-lg gpu-layer">
        <div className="max-w-lg mx-auto grid grid-cols-5 gap-0.5 sm:gap-1 items-center">
          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); setActiveTab('quran'); }}
            className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 rounded-xl transition-all min-w-0 ${
              activeTab === 'quran'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen size={19} className="shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-medium leading-tight truncate max-w-full text-center mt-0.5">Quran</span>
          </button>

          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); setActiveTab('mafatih'); }}
            className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 rounded-xl transition-all min-w-0 ${
              activeTab === 'mafatih'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <KeyRound size={19} className="shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-medium leading-tight truncate max-w-full text-center mt-0.5">Mafatih</span>
          </button>

          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); setActiveTab('science'); }}
            className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 rounded-xl transition-all min-w-0 ${
              activeTab === 'science'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Microscope size={19} className="shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-medium leading-tight truncate max-w-full text-center mt-0.5">Science</span>
          </button>

          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); setActiveTab('discuss'); }}
            className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 rounded-xl transition-all min-w-0 ${
              activeTab === 'discuss'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MessageCircle size={19} className="shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-medium leading-tight truncate max-w-full text-center mt-0.5">Community</span>
          </button>

          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); onOpenSettings(); }}
            className="flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all min-w-0"
          >
            <Settings size={19} className="shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-medium leading-tight truncate max-w-full text-center mt-0.5">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
