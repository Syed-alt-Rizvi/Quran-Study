import { hapticImpact } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';
import { useState, useEffect, useMemo } from 'react';
import { fetchSurahs, SurahMeta, prefetchSurah, prefetchJuz } from '../api';
import staticSurahs from '../surahList.json';
import { 
  Search, BookOpen, Settings, ArrowRight, ChevronRight,
  MessageCircle, AlertTriangle, KeyRound, Edit3, Check, X,
  LogOut, Calendar as CalendarIcon, Compass, Clock
} from "lucide-react";
import GlobalDiscussions from "./GlobalDiscussions";
import QiblaFinder from "./QiblaFinder";
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
      {/* Liquid Glass Minimalist Header with Fine Gold Sheen & Balanced Centered Layout */}
      <header className="sticky top-0 z-30 liquid-glass border-b border-emerald-500/20 dark:border-emerald-400/15 app-header-safe pb-2.5 sm:pb-3 shadow-xs gpu-layer relative">
        {/* Ethereal Gold Ambient Highlight Line */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 dark:via-amber-400/25 to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-4 relative z-10 px-0.5">
          {/* Left Balancing Space */}
          <div className="flex-1 min-w-0" />

          {/* Center: Shia Markaz Golden Calligraphy with Words' Edges Painted in Emerald Green (No squircle box) */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <h1 
              dir="rtl"
              lang="ar"
              className="font-arabic font-bold text-2xl sm:text-3xl leading-none select-none tracking-wide transition-colors shia-markaz-calligraphy py-0.5"
            >
              {appLanguage === 'ur' ? 'شیعہ مرکز' : 'شِيعَة مَرْكَز'}
            </h1>
          </div>

          {/* Right Action Elements: PWA Jewel + Exit App Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0 justify-end shrink-0">
            <PWAInstallButton variant="compact" />
            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                onExit();
              }}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-[11px] font-medium rounded-full liquid-glass border border-white/40 dark:border-white/12 text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-amber-300 hover:border-emerald-500/30 dark:hover:border-amber-400/30 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
              title="Exit App (Dua e Khatm e Quran)"
              aria-label="Exit App and Recite Dua e Khatm e Quran"
            >
              <LogOut size={12} strokeWidth={1.6} className="shrink-0" />
              <span className="hidden sm:inline">{t('exit', appLanguage)}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-2.5 sm:py-4 overflow-x-hidden min-w-0">
        {/* Welcome Masthead with Islamic Rosette Watermark & Gold Accent (Homescreen Only) */}
        {activeTab === 'quran' && (
          <section className="mb-3.5 p-3 sm:p-4 rounded-2xl liquid-glass-card glass-emerald-fusion border border-white/40 dark:border-white/10 shadow-xs relative overflow-hidden">
            {/* Subtle Golden Sheen on Top Edge */}
            <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-amber-400/35 dark:via-amber-400/20 to-transparent pointer-events-none" />
            
            {/* Background Sacred Geometric Rosette Watermark */}
            <div className="absolute -right-4 -bottom-6 text-emerald-600/[0.04] dark:text-emerald-400/[0.04] select-none pointer-events-none text-8xl font-arabic leading-none" aria-hidden="true">
              ۞
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-3 relative z-10">
              <div className="min-w-0 flex-1">
                {/* Sacred Arabic Salutation */}
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-emerald-800 dark:text-emerald-300 font-medium select-none mb-0.5">
                  <span className="font-arabic font-semibold text-xs sm:text-sm leading-none">{greeting.ar}</span>
                  <span className="text-amber-500/80 dark:text-amber-400/70 text-[9px]" aria-hidden="true">✦</span>
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

              {/* Daily Recitation Status Pill */}
              {todayAyahs > 0 && !isEditingName && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass border border-emerald-500/30 dark:border-emerald-400/20 text-xs text-slate-700 dark:text-slate-200 font-medium sm:text-right shrink-0 self-start sm:self-auto shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  <span>
                    <strong className="text-emerald-700 dark:text-emerald-300 font-bold">{todayAyahs}</strong>{' '}
                    {todayAyahs === 1 ? 'ayah recited today' : 'ayahs recited today'}
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Last Read Ayah Quick Resume */}
        {lastRead && activeTab === 'quran' && typeof lastRead.surahId === 'number' && lastRead.surahId >= 1 && lastRead.surahId <= 114 && (
          <div className="mb-4 p-3.5 liquid-glass-card glass-emerald-fusion rounded-2xl border border-emerald-400/30 dark:border-emerald-500/20 shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={12} className="text-emerald-600 dark:text-emerald-400" />
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
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-medium text-xs rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <span>{appLanguage === 'ur' ? 'پڑھیں' : 'Resume'}</span>
              <ChevronRight size={14} />
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
        ) : activeTab === 'qibla' ? (
          <QiblaFinder onBack={() => setActiveTab('quran')} />
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
              <div className="flex gap-2 p-1.5 liquid-glass rounded-2xl w-full sm:max-w-xs border border-white/50 dark:border-white/15 shadow-inner">
                <button
                  onClick={() => { hapticImpact(ImpactStyle.Light); setQuranMode('surah'); }}
                  className={`flex-1 py-1.5 sm:py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    quranMode === 'surah'
                      ? 'glass-slab-tab-active font-bold'
                      : 'glass-slab-tab text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t('quran_114_surahs', appLanguage)}
                </button>
                <button
                  onClick={() => { hapticImpact(ImpactStyle.Light); setQuranMode('juz'); }}
                  className={`flex-1 py-1.5 sm:py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    quranMode === 'juz'
                      ? 'glass-slab-tab-active font-bold'
                      : 'glass-slab-tab text-slate-600 dark:text-slate-400'
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
              <div className="p-8 text-center liquid-glass-card border border-white/40 dark:border-white/10 rounded-2xl shadow-xs max-w-md mx-auto my-4">
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
                        {/* Arabic text ABOVE with Surah number */}
                        <div className="flex items-center justify-between w-full gap-2">
                          <span className="text-xs sm:text-sm font-mono font-bold tracking-wider text-emerald-800/80 dark:text-emerald-400/80 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 select-none shrink-0 transition-colors">
                            {String(surah.number).padStart(2, '0')}
                          </span>
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
                      {/* Arabic text ABOVE with Juz number */}
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="text-xs sm:text-sm font-mono font-bold tracking-wider text-emerald-800/80 dark:text-emerald-400/80 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 select-none shrink-0 transition-colors">
                          {String(juz.number).padStart(2, '0')}
                        </span>
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
      <nav className="fixed bottom-2.5 sm:bottom-4 inset-x-2.5 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 max-w-lg w-auto sm:w-full z-40 liquid-glass-dock rounded-3xl p-1.5 sm:p-2 shadow-[0_20px_50px_-8px_rgba(0,0,0,0.65)] gpu-layer">
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 items-center">
          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); setActiveTab('quran'); }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 min-w-0 cursor-pointer ${
              activeTab === 'quran'
                ? 'glass-slab-tab-active font-bold'
                : 'glass-slab-tab text-slate-600 dark:text-slate-300'
            }`}
          >
            <BookOpen size={18} strokeWidth={1.6} className="shrink-0" />
            <span className="text-[8px] sm:text-[9.5px] font-medium leading-tight truncate max-w-full text-center mt-0.5">{t('tab_quran', appLanguage)}</span>
          </button>

          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); setActiveTab('mafatih'); }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 min-w-0 cursor-pointer ${
              activeTab === 'mafatih'
                ? 'glass-slab-tab-active font-bold'
                : 'glass-slab-tab text-slate-600 dark:text-slate-300'
            }`}
          >
            <KeyRound size={18} strokeWidth={1.6} className="shrink-0" />
            <span className="text-[8px] sm:text-[9.5px] font-medium leading-tight truncate max-w-full text-center mt-0.5">{t('tab_mafatih', appLanguage)}</span>
          </button>

          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); setActiveTab('adhan'); }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 min-w-0 cursor-pointer ${
              activeTab === 'adhan'
                ? 'glass-slab-tab-active font-bold'
                : 'glass-slab-tab text-slate-600 dark:text-slate-300'
            }`}
          >
            <Clock size={18} strokeWidth={1.6} className="shrink-0" />
            <span className="text-[8px] sm:text-[9.5px] font-medium leading-tight truncate max-w-full text-center mt-0.5">{t('tab_adhan', appLanguage)}</span>
          </button>

          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); setActiveTab('calendar'); }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 min-w-0 cursor-pointer ${
              activeTab === 'calendar'
                ? 'glass-slab-tab-active font-bold'
                : 'glass-slab-tab text-slate-600 dark:text-slate-300'
            }`}
          >
            <CalendarIcon size={18} strokeWidth={1.6} className="shrink-0" />
            <span className="text-[8px] sm:text-[9.5px] font-medium leading-tight truncate max-w-full text-center mt-0.5">{t('tab_calendar', appLanguage)}</span>
          </button>

          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); setActiveTab('qibla'); }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 min-w-0 cursor-pointer ${
              activeTab === 'qibla'
                ? 'glass-slab-tab-active font-bold'
                : 'glass-slab-tab text-slate-600 dark:text-slate-300'
            }`}
          >
            <Compass size={18} strokeWidth={1.6} className="shrink-0" />
            <span className="text-[8px] sm:text-[9.5px] font-medium leading-tight truncate max-w-full text-center mt-0.5">{t('tab_qibla', appLanguage)}</span>
          </button>

          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); setActiveTab('discuss'); }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 min-w-0 cursor-pointer ${
              activeTab === 'discuss'
                ? 'glass-slab-tab-active font-bold'
                : 'glass-slab-tab text-slate-600 dark:text-slate-300'
            }`}
          >
            <MessageCircle size={18} strokeWidth={1.6} className="shrink-0" />
            <span className="text-[8px] sm:text-[9.5px] font-medium leading-tight truncate max-w-full text-center mt-0.5">{t('tab_discuss', appLanguage)}</span>
          </button>

          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); onOpenSettings(); }}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl glass-slab-tab text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-all min-w-0 cursor-pointer"
          >
            <Settings size={18} strokeWidth={1.6} className="shrink-0" />
            <span className="text-[8px] sm:text-[9.5px] font-medium leading-tight truncate max-w-full text-center mt-0.5">{t('tab_settings', appLanguage)}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
