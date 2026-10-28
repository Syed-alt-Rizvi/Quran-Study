import { hapticImpact } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';
import { useState, useEffect, useMemo } from 'react';
import { fetchSurahs, SurahMeta, prefetchSurah, prefetchJuz } from '../api';
import staticSurahs from '../surahList.json';
import { 
  Search, BookOpen, Settings, Microscope, ArrowRight, 
  MessageCircle, AlertTriangle, KeyRound, Edit3, Check, X,
  LogOut, Calendar as CalendarIcon, Compass
} from "lucide-react";
import GlobalDiscussions from "./GlobalDiscussions";
import ImamScienceFeed from "./ImamScienceFeed";
import MafatihView from "./MafatihView";
import CalendarView from "./CalendarView";
import AdhanMapScreen from "./AdhanMapScreen";
import HomeAdhanWidget from "./HomeAdhanWidget";
import HomeTafseerWidget from "./HomeTafseerWidget";
import HomeQuranAudioWidget from "./HomeQuranAudioWidget";
import { useSettingsStore, AppTab } from '../store';
import { t } from '../i18n';
import { PWAInstallButton } from './PWAInstallButton';
import { getArabicFontFamily } from '../utils/arabicFonts';
import { SURAH_URDU_MAP, JUZ_URDU_NAMES } from '../data/surahUrduNames';
import { normalizeSearchQuery, matchesSearch } from '../utils/arabicSearch';

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
  const { readProgress, lastRead, defaultAppTab, currentAppTab, setCurrentAppTab, userName, setUserName, habitStats, arabicFont, appLanguage } = useSettingsStore();
  const activeTab = currentAppTab || defaultAppTab || 'quran';
  const setActiveTab = (tab: AppTab) => {
    setCurrentAppTab(tab);
  };
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
    if (defaultAppTab && !currentAppTab) {
      setCurrentAppTab(defaultAppTab);
    }
  }, [defaultAppTab, currentAppTab, setCurrentAppTab]);

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

  const qNormal = useMemo(() => normalizeSearchQuery(searchQuery), [searchQuery]);

  const filteredSurahs = useMemo(() => {
    if (!qNormal.raw) return [...surahs].sort((a, b) => a.number - b.number);

    return surahs.filter(s => {
      // 1. Direct number match (supports ASCII "112", Eastern Arabic "١١٢", Urdu "۱۱۲")
      if (qNormal.asciiDigits && s.number.toString() === qNormal.asciiDigits) {
        return true;
      }
      // 2. English name & translation
      if (matchesSearch(s.englishName, qNormal) || matchesSearch(s.englishNameTranslation, qNormal)) {
        return true;
      }
      // 3. Arabic Quranic name (diacritics-insensitive: "البقرة" matches "سُورَةُ البَقَرَةِ")
      if (matchesSearch(s.name, qNormal)) {
        return true;
      }
      // 4. Urdu name & meaning
      const urduInfo = SURAH_URDU_MAP[s.number];
      if (urduInfo) {
        if (matchesSearch(urduInfo.urduName, qNormal) || matchesSearch(urduInfo.urduMeaning, qNormal)) {
          return true;
        }
      }
      return false;
    }).sort((a, b) => a.number - b.number);
  }, [surahs, qNormal]);
  
  const filteredJuzs = useMemo(() => {
    if (!qNormal.raw) return STATIC_JUZ_LIST;
    return STATIC_JUZ_LIST.filter(j => {
      // Direct number match
      if (qNormal.asciiDigits && j.number.toString() === qNormal.asciiDigits) {
        return true;
      }
      if (matchesSearch(`juz ${j.number}`, qNormal) || matchesSearch(j.name, qNormal)) {
        return true;
      }
      const urduJuz = JUZ_URDU_NAMES[j.number];
      if (urduJuz && matchesSearch(urduJuz, qNormal)) {
        return true;
      }
      return false;
    });
  }, [qNormal]);

  return (
    <div className="min-h-screen pb-32 text-slate-900 dark:text-slate-100">
      {/* Liquid Glass Minimalist Header */}
      <header className="sticky top-0 z-30 liquid-glass border-b border-white/30 dark:border-white/10 app-header-safe pb-2.5 sm:pb-3 shadow-xs gpu-layer">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white flex items-center justify-center font-arabic font-bold text-sm sm:text-base shadow-[0_0_15px_rgba(16,185,129,0.35)] select-none ring-1 ring-white/40 shrink-0">
              ش
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight truncate">
                {t('app_title', appLanguage)}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-tight truncate">
                {t('app_subtitle', appLanguage)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 text-right shrink-0">
            <PWAInstallButton variant="compact" />
            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                onExit();
              }}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors flex items-center gap-1 cursor-pointer"
              title="Exit App (Dua e Khatm e Quran)"
              aria-label="Exit App and Recite Dua e Khatm e Quran"
            >
              <LogOut size={16} className="shrink-0" />
              <span className="hidden sm:inline text-[11px] font-medium">{t('exit', appLanguage)}</span>
            </button>
            <span className="hidden min-[380px]:inline text-[11px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-400 truncate max-w-[110px] sm:max-w-none">
              {activeTab === 'quran' && t('tab_quran', appLanguage)}
              {activeTab === 'mafatih' && t('tab_mafatih', appLanguage)}
              {activeTab === 'calendar' && t('tab_calendar', appLanguage)}
              {activeTab === 'science' && t('tab_science', appLanguage)}
              {activeTab === 'discuss' && t('tab_discuss', appLanguage)}
            </span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-2.5 sm:py-4 overflow-x-hidden min-w-0">
        {/* Welcome Masthead */}
        <section className="mb-3.5 p-3 sm:p-4 rounded-2xl liquid-glass-card glass-emerald-fusion border border-white/40 dark:border-white/10 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-3">
            <div className="min-w-0 flex-1">
              {/* Sacred Arabic Salutation */}
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-emerald-800 dark:text-emerald-300 font-medium select-none mb-0.5">
                <span className="font-arabic font-semibold text-xs sm:text-sm leading-none">{greeting.ar}</span>
                <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
                <span className="text-slate-600 dark:text-slate-400 font-normal">{greeting.en}</span>
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
                    {userName && userName.trim().length > 0 ? userName.trim() : 'Welcome'}
                  </h2>
                  <Edit3 size={13} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0" />
                </div>
              )}

              {/* Hadith Reflection from Ahlulbayt (a.s) */}
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-serif italic max-w-xl leading-snug line-clamp-2">
                &ldquo;{reflection.quote}&rdquo;
                <span className="not-italic text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 ml-1.5 font-sans">
                  — {reflection.source}
                </span>
              </p>
            </div>

            {/* Daily Recitation Status */}
            {todayAyahs > 0 && !isEditingName && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 sm:text-right shrink-0 self-start sm:self-auto pt-0.5 sm:pt-0 bg-white/40 dark:bg-slate-900/40 px-2.5 py-1 rounded-full border border-white/30 dark:border-white/10 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span>
                  <strong className="text-slate-800 dark:text-slate-200 font-semibold">{todayAyahs}</strong>{' '}
                  {todayAyahs === 1 ? 'ayah recited today' : 'ayahs recited today'}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Last Read Ayah Quick Resume */}
        {lastRead && activeTab === 'quran' && typeof lastRead.surahId === 'number' && lastRead.surahId >= 1 && lastRead.surahId <= 114 && (
          <div className="mb-4 p-3.5 liquid-glass-card glass-emerald-fusion rounded-2xl border border-emerald-400/40 shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>{appLanguage === 'ur' ? 'جاری رکھیں' : 'Continue Reading'}</span>
              </p>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                {appLanguage === 'ur' && SURAH_URDU_MAP[lastRead.surahId]
                  ? `سورۃ ${SURAH_URDU_MAP[lastRead.surahId].urduName} • آیت ${lastRead.ayahNumber}`
                  : `${lastRead.surahName || ('Surah ' + lastRead.surahId)} • Ayah ${lastRead.ayahNumber}`}
              </h3>
            </div>
            <button 
              onClick={() => onSelectSurah(lastRead.surahId, lastRead.ayahNumber)}
              onMouseEnter={() => prefetchSurah(lastRead.surahId)}
              onTouchStart={() => prefetchSurah(lastRead.surahId)}
              className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl transition-all shadow-[0_4px_12px_rgba(16,185,129,0.3)] flex items-center gap-1 cursor-pointer"
            >
              <span>Resume</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}

        {/* View Switcher Content */}
        {activeTab === 'mafatih' ? (
          <MafatihView onSelectItem={onSelectMafatihItem} />
        ) : activeTab === 'calendar' ? (
          <CalendarView onSelectMafatihItem={onSelectMafatihItem} onOpenSettings={onOpenSettings} />
        ) : activeTab === 'adhan' ? (
          <AdhanMapScreen onBack={() => setActiveTab('quran')} />
        ) : activeTab === 'science' ? (
          <ImamScienceFeed onSelectSurah={onSelectSurah} />
        ) : activeTab === 'discuss' ? (
          <GlobalDiscussions />
        ) : (
          <div>
            {/* Quick Shia Prayer & Adhan Countdown Widget */}
            <HomeAdhanWidget onOpenMapAndPrayers={() => { hapticImpact(ImpactStyle.Light); setActiveTab('adhan'); }} />

            {/* Holy Quran Audio Player on Homescreen */}
            <HomeQuranAudioWidget onSelectSurah={onSelectSurah} />

            {/* Read Shia Tafseer on Homescreen */}
            <HomeTafseerWidget onOpenSurahTafseer={onSelectSurah} />

            {/* Search Input for Quran */}
            <div className="relative mb-2.5">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder={quranMode === 'surah' ? t('search_surah_placeholder', appLanguage) : t('search_juz_placeholder', appLanguage)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 sm:py-2.5 rounded-2xl liquid-glass border border-white/40 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-xs sm:text-sm truncate placeholder-slate-400"
              />
            </div>

            {/* Sub-Switch: Surahs (114) vs Juz (30) */}
            <div className="flex items-center justify-center mb-3">
              <div className="flex gap-1.5 p-1 liquid-glass rounded-2xl w-full sm:max-w-xs border border-white/30 dark:border-white/10 shadow-inner">
                <button
                  onClick={() => { hapticImpact(ImpactStyle.Light); setQuranMode('surah'); }}
                  className={`flex-1 py-1 sm:py-1.5 text-xs font-semibold rounded-xl transition-all ${
                    quranMode === 'surah'
                      ? 'liquid-glass text-emerald-800 dark:text-emerald-300 font-bold shadow-xs border border-white/60 dark:border-white/20'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {t('quran_114_surahs', appLanguage)}
                </button>
                <button
                  onClick={() => { hapticImpact(ImpactStyle.Light); setQuranMode('juz'); }}
                  className={`flex-1 py-1 sm:py-1.5 text-xs font-semibold rounded-xl transition-all ${
                    quranMode === 'juz'
                      ? 'liquid-glass text-emerald-800 dark:text-emerald-300 font-bold shadow-xs border border-white/60 dark:border-white/20'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {t('quran_30_juz', appLanguage)}
                </button>
              </div>
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
                <div className="responsive-surah-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
                  {filteredSurahs.map((surah, surahIdx) => {
                    const highestRead = readProgress?.[surah.number] || 0;
                    const progressPercent = Math.min(100, Math.round((highestRead / surah.numberOfAyahs) * 100));
                    
                    return (
                      <button
                        key={`surah-card-${surah.number || 's'}-${surahIdx}`}
                        onClick={() => { hapticImpact(ImpactStyle.Light); onSelectSurah(surah.number); }}
                        onMouseEnter={() => prefetchSurah(surah.number)}
                        onTouchStart={() => prefetchSurah(surah.number)}
                        className="surah-card-render w-full text-left group flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl liquid-glass-card border border-white/50 dark:border-white/10 hover:border-emerald-400/60 dark:hover:border-emerald-400/50 hover:shadow-md transition-all duration-150"
                      >
                        {/* Arabic text ABOVE with Surah number badge */}
                        <div className="flex items-center justify-between w-full gap-2">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl liquid-glass text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs ring-1 ring-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white group-hover:ring-emerald-600 transition-all shrink-0 shadow-xs">
                            {surah.number}
                          </div>
                          <div className="text-right flex-1 min-w-0">
                            <span 
                              dir="rtl"
                              lang="ar"
                              className="ayah-arabic-text font-arabic text-lg sm:text-xl font-normal text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors block leading-tight"
                              style={{ fontFamily: getArabicFontFamily(arabicFont) }}
                            >
                              {surah.name}
                            </span>
                          </div>
                        </div>

                        {/* Title text NEATLY BELOW with Ayahs count & revelation type */}
                        <div className="w-full mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-baseline justify-between gap-1.5">
                          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                            {appLanguage === 'ur' && SURAH_URDU_MAP[surah.number]
                              ? `${SURAH_URDU_MAP[surah.number].urduName} (${SURAH_URDU_MAP[surah.number].urduMeaning})`
                              : surah.englishName}
                          </h3>
                          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                            <span>{surah.numberOfAyahs} {t('ayahs', appLanguage)}</span>
                            <span>&bull;</span>
                            <span>
                              {appLanguage === 'ur'
                                ? (SURAH_URDU_MAP[surah.number]?.typeUrdu || (surah.revelationType === 'Meccan' ? 'مکی' : 'مدنی'))
                                : surah.revelationType}
                            </span>
                          </div>
                        </div>

                        {highestRead > 0 && (
                          <div className="w-full h-1 bg-slate-200/60 dark:bg-slate-700/60 rounded-full overflow-hidden mt-1.5">
                            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )
            ) : (
              filteredJuzs.length === 0 ? (
                <div className="text-center py-10 px-4 liquid-glass-card rounded-2xl border border-white/40 dark:border-white/10">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {appLanguage === 'ur' ? `کوئی پارہ نہیں ملا برائے "${searchQuery}"` : `No Juz found matching "${searchQuery}"`}
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {t('clear', appLanguage)}
                  </button>
                </div>
              ) : (
                <div className="responsive-surah-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
                  {filteredJuzs.map((juz, juzIdx) => (
                    <button
                      key={`juz-card-${juz.number || 'j'}-${juzIdx}`}
                      onClick={() => onSelectJuz(juz.number)}
                      onMouseEnter={() => prefetchJuz(juz.number)}
                      onTouchStart={() => prefetchJuz(juz.number)}
                      className="juz-card-render w-full text-left group flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl liquid-glass-card border border-white/50 dark:border-white/10 hover:border-emerald-400/50 hover:shadow-xs transition-all"
                    >
                      {/* Arabic text ABOVE with Juz number badge */}
                      <div className="flex items-center justify-between w-full gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl liquid-glass text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs ring-1 ring-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white group-hover:ring-emerald-600 transition-all shrink-0 shadow-xs">
                          {juz.number}
                        </div>
                        <span 
                          dir="rtl"
                          lang="ar"
                          className="ayah-arabic-text font-arabic text-lg sm:text-xl text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight"
                          style={{ fontFamily: getArabicFontFamily(arabicFont) }}
                        >
                          الجزء {juz.number}
                        </span>
                      </div>

                      {/* Text NEATLY BELOW */}
                      <div className="w-full mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-baseline justify-between gap-1.5">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm truncate">
                          {appLanguage === 'ur' ? (JUZ_URDU_NAMES[juz.number] || juz.name) : juz.name}
                        </h3>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                          {appLanguage === 'ur' ? `پارہ ${juz.number}` : `Juz ${juz.number}`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* Standardized Global Footer */}
        <footer className="mt-12 pt-6 pb-8 border-t border-white/20 dark:border-white/10 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            &copy; 2026 Shia Markaz. All Rights Reserved.
          </p>
        </footer>
      </main>

      {/* Floating Liquid Glass Dock - VisionOS Native Mobile Touch Bar */}
      <nav className="fixed bottom-2.5 sm:bottom-4 inset-x-2.5 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 max-w-lg w-auto sm:w-full z-40 liquid-glass-dock rounded-3xl p-1.5 sm:p-2 shadow-[0_20px_50px_-8px_rgba(0,0,0,0.5)] gpu-layer">
        <div className="grid grid-cols-7 gap-1 items-center">
          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); setActiveTab('quran'); }}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl transition-all duration-200 min-w-0 ${
              activeTab === 'quran'
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold ring-1 ring-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-800/30'
            }`}
          >
            <BookOpen size={17} className="shrink-0" />
            <span className="text-[8px] sm:text-[9.5px] font-medium leading-tight truncate max-w-full text-center mt-0.5">{t('tab_quran', appLanguage)}</span>
          </button>

          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); setActiveTab('mafatih'); }}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl transition-all duration-200 min-w-0 ${
              activeTab === 'mafatih'
                ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300 font-bold ring-1 ring-sky-500/40 shadow-[0_0_12px_rgba(14,165,233,0.3)]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-800/30'
            }`}
          >
            <KeyRound size={17} className="shrink-0" />
            <span className="text-[8px] sm:text-[9.5px] font-medium leading-tight truncate max-w-full text-center mt-0.5">{t('tab_mafatih', appLanguage)}</span>
          </button>

          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); setActiveTab('adhan'); }}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl transition-all duration-200 min-w-0 ${
              activeTab === 'adhan'
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold ring-1 ring-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-800/30'
            }`}
          >
            <Compass size={17} className="shrink-0" />
            <span className="text-[8px] sm:text-[9.5px] font-medium leading-tight truncate max-w-full text-center mt-0.5">{t('tab_adhan', appLanguage)}</span>
          </button>

          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); setActiveTab('calendar'); }}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl transition-all duration-200 min-w-0 ${
              activeTab === 'calendar'
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold ring-1 ring-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-800/30'
            }`}
          >
            <CalendarIcon size={17} className="shrink-0" />
            <span className="text-[8px] sm:text-[9.5px] font-medium leading-tight truncate max-w-full text-center mt-0.5">{t('tab_calendar', appLanguage)}</span>
          </button>

          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); setActiveTab('science'); }}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl transition-all duration-200 min-w-0 ${
              activeTab === 'science'
                ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold ring-1 ring-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-800/30'
            }`}
          >
            <Microscope size={17} className="shrink-0" />
            <span className="text-[8px] sm:text-[9.5px] font-medium leading-tight truncate max-w-full text-center mt-0.5">{t('tab_science', appLanguage)}</span>
          </button>

          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); setActiveTab('discuss'); }}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl transition-all duration-200 min-w-0 ${
              activeTab === 'discuss'
                ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold ring-1 ring-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-800/30'
            }`}
          >
            <MessageCircle size={17} className="shrink-0" />
            <span className="text-[8px] sm:text-[9.5px] font-medium leading-tight truncate max-w-full text-center mt-0.5">{t('tab_discuss', appLanguage)}</span>
          </button>

          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); onOpenSettings(); }}
            className="flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-all min-w-0"
          >
            <Settings size={17} className="shrink-0" />
            <span className="text-[8px] sm:text-[9.5px] font-medium leading-tight truncate max-w-full text-center mt-0.5">{t('tab_settings', appLanguage)}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
