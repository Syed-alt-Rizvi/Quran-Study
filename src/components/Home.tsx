import { hapticImpact } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';
import { useState, useEffect } from 'react';
import { fetchSurahs, SurahMeta } from '../api';
import staticSurahs from '../surahList.json';
import { 
  Search, BookOpen, Settings, Microscope, ArrowRight, 
  MessageCircle, AlertTriangle, Sparkles
} from "lucide-react";
import GlobalDiscussions from "./GlobalDiscussions";
import ImamScienceFeed from "./ImamScienceFeed";
import MafatihView from "./MafatihView";
import { useSettingsStore } from '../store';

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
  const { readProgress, lastRead, defaultAppTab } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<'quran' | 'mafatih' | 'science' | 'discuss'>(defaultAppTab || 'quran');
  const [quranMode, setQuranMode] = useState<'surah' | 'juz'>('surah');

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
    loadSurahs();
  }, []);

  const q = searchQuery.trim().toLowerCase();
  const filteredSurahs = surahs.filter(s => {
    if (!q) return true;
    return (
      s.number.toString() === q ||
      s.englishName.toLowerCase().includes(q) ||
      (s.englishNameTranslation && s.englishNameTranslation.toLowerCase().includes(q)) ||
      s.name.includes(searchQuery.trim()) ||
      s.englishName.toLowerCase().replace(/[^a-z0-9]/g, '').includes(q.replace(/[^a-z0-9]/g, ''))
    );
  });
  
  const juzNames = [
    'Alif Laam Meem', 'Sayaqool', 'Tilkal Rusul', 'Lan Tana Loo', 'Wal Mohsanat',
    'La Yuhibbullah', 'Wa Iza Samiu', 'Wa Lau Annana', 'Qalal Malao', 'Wa A\'lamu',
    'Yatazeroon', 'Wa Mamin Da\'abat', 'Wa Ma Ubrioo', 'Rubama', 'Subhanallahzi',
    'Qal Alam', 'Iqtaraba', 'Qadd Aflaha', 'Wa Qalallazina', 'A\'man Khalaqa',
    'Utlu Ma Oohi', 'Wa Manyaqnut', 'Wa Mali', 'Faman Azlam', 'Elahe Yuraddo',
    'Ha\'a Meem', 'Qala Fama Khatbukum', 'Qadd Sami Allah', 'Tabarakallazi', 'Amma Yatasa\'aloon'
  ];

  const juzs = Array.from({ length: 30 }, (_, i) => ({
    number: i + 1,
    name: juzNames[i]
  }));
  
  const filteredJuzs = juzs.filter(j => 
    `juz ${j.number}`.includes(searchQuery.toLowerCase()) || 
    j.number.toString().includes(searchQuery) ||
    j.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-24 text-slate-900 dark:text-slate-100">
      {/* Clean Minimalist Header */}
      <header className="sticky top-0 z-30 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-arabic font-bold text-base shadow-xs select-none">
              ش
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Shia Markaz
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Holy Quran &amp; Mafatih Al Jinan
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {activeTab === 'quran' && 'Quran Reader'}
              {activeTab === 'mafatih' && 'Mafatih Al Jinan'}
              {activeTab === 'science' && 'Imams & Science'}
              {activeTab === 'discuss' && 'Discussions'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
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
            <div className="relative mb-3">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search size={17} />
              </div>
              <input
                type="text"
                placeholder={quranMode === 'surah' ? 'Search Surah by name or number (e.g. Yaseen, 36)...' : 'Search Juz by number or title...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-shadow text-sm"
              />
            </div>

            {/* Sub-Switch: Surahs (114) vs Juz (30) */}
            <div className="flex gap-2 mb-4 p-1 bg-slate-200/50 dark:bg-slate-900/50 rounded-xl max-w-xs mx-auto border border-slate-200/60 dark:border-slate-800/60">
              <button
                onClick={() => { hapticImpact(ImpactStyle.Light); setQuranMode('surah'); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  quranMode === 'surah'
                    ? 'bg-white dark:bg-slate-800 shadow-xs text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                114 Surahs
              </button>
              <button
                onClick={() => { hapticImpact(ImpactStyle.Light); setQuranMode('juz'); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {filteredSurahs.map((surah, surahIdx) => {
                    const highestRead = readProgress?.[surah.number] || 0;
                    const progressPercent = Math.min(100, Math.round((highestRead / surah.numberOfAyahs) * 100));
                    
                    return (
                      <button
                        key={`surah-card-${surah.number || 's'}-${surahIdx}`}
                        onClick={() => { hapticImpact(ImpactStyle.Light); onSelectSurah(surah.number); }}
                        className="w-full text-left group flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-xs transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 transition-colors flex-shrink-0">
                            {surah.number}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                              {surah.englishName}
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {surah.numberOfAyahs} Ayahs &bull; {surah.revelationType}
                            </p>
                            {highestRead > 0 && (
                              <div className="w-20 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right pl-2 flex-shrink-0">
                          <span className="font-arabic text-xl text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {filteredJuzs.map((juz, juzIdx) => (
                    <button
                      key={`juz-card-${juz.number || 'j'}-${juzIdx}`}
                      onClick={() => onSelectJuz(juz.number)}
                      className="w-full text-left group flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-xs transition-all"
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

      {/* Single Persistent Bottom Navigation Dock (The Only Navigation Control) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 py-1.5 px-3 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); setActiveTab('quran'); }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'quran'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen size={20} />
            <span className="text-[11px]">Quran</span>
          </button>

          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); setActiveTab('mafatih'); }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'mafatih'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles size={20} />
            <span className="text-[11px]">Mafatih</span>
          </button>

          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); setActiveTab('science'); }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'science'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Microscope size={20} />
            <span className="text-[11px]">Science</span>
          </button>

          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); setActiveTab('discuss'); }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'discuss'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MessageCircle size={20} />
            <span className="text-[11px]">Community</span>
          </button>

          <button
            onClick={() => { hapticImpact(ImpactStyle.Light); onOpenSettings(); }}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
          >
            <Settings size={20} />
            <span className="text-[11px]">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
