import { getApiUrl } from '../utils/apiBase';
import { useState, useEffect } from 'react';
import { fetchSurahs, SurahMeta } from '../api';
import { Search, BookOpen, Settings, LogOut, Microscope, ArrowRight, MessageCircle } from "lucide-react";
import DynamicBanner from "./DynamicBanner";
import GlobalDiscussions from "./GlobalDiscussions";
import ScienceArticle from "./ScienceArticle";
import { useSettingsStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';

interface HomeProps {
  key?: string;
  onSelectSurah: (id: number) => void;
  onSelectJuz: (id: number) => void;
  onOpenSettings: () => void;
  onExit: () => void;
}

export default function Home({ onSelectSurah, onSelectJuz, onOpenSettings, onExit }: HomeProps) {
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'surah' | 'juz' | 'science' | 'discuss'>('surah');
  const [scienceArticles, setScienceArticles] = useState<any[]>([]);
  
  const { readProgress, lastRead, userName } = useSettingsStore();

  useEffect(() => {
    const abortController = new AbortController();
    fetchSurahs()
      .then(data => {
        setSurahs(data);
        setLoading(false);
      })
      .catch(console.error);

    fetch(getApiUrl('/api/science'))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setScienceArticles(data);
        } else {
          console.error("Failed to fetch science articles:", data);
        }
      })
      .catch(console.error);
    return () => abortController.abort();
  }, []);

  const filteredSurahs = surahs.filter(s => 
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.includes(searchQuery)
  );
  
  const juzNames = [
    'Alif Laam Meem',
    'Sayaqool',
    'Tilkal Rusul',
    'Lan Tana Loo',
    'Wal Mohsanat',
    'La Yuhibbullah',
    'Wa Iza Samiu',
    'Wa Lau Annana',
    'Qalal Malao',
    'Wa A\'lamu',
    'Yatazeroon',
    'Wa Mamin Da\'abat',
    'Wa Ma Ubrioo',
    'Rubama',
    'Subhanallahzi',
    'Qal Alam',
    'Iqtaraba',
    'Qadd Aflaha',
    'Wa Qalallazina',
    'A\'man Khalaqa',
    'Utlu Ma Oohi',
    'Wa Manyaqnut',
    'Wa Mali',
    'Faman Azlam',
    'Elahe Yuraddo',
    'Ha\'a Meem',
    'Qala Fama Khatbukum',
    'Qadd Sami Allah',
    'Tabarakallazi',
    'Amma Yatasa\'aloon'
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
    <div className="min-h-screen pb-safe">
      <header className="sticky top-0 z-30 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b-[0.5px] border-slate-200 dark:border-slate-800 px-4 py-4 sm:px-6">
        <div className="max-w-4xl lg:max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
            <BookOpen size={28} />
            <h1 className="text-xl font-bold tracking-tight">Quran Study</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onOpenSettings}
              className="p-2 text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 bg-slate-100 hover:bg-emerald-50 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <Settings size={22} />
            </button>
            <button 
              onClick={onExit}
              className="p-2 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 bg-slate-100 hover:bg-red-50 dark:bg-slate-900 dark:hover:bg-red-900/20 rounded-full transition-colors"
              title="Exit App"
            >
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </header>
      {userName && (
        <div className="max-w-4xl lg:max-w-5xl mx-auto px-4 pt-10 pb-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col space-y-2"
          >
            <h2 className="text-2xl sm:text-3xl font-light text-slate-800 dark:text-slate-200 tracking-tight">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Assalamualaikum,</span> {userName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-medium">
              May peace and blessings be upon you
            </p>
          </motion.div>
        </div>
      )}
      <main className="max-w-4xl lg:max-w-5xl mx-auto px-4 py-6">

        <DynamicBanner />
        {lastRead && (
          <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border-[0.5px] border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Continue Reading</p>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{lastRead.surahName || ('Surah ' + lastRead.surahId)} &bull; Ayah {lastRead.ayahNumber}</h3>
            </div>
            <button 
              onClick={() => {
                window.location.hash = `ayah-${lastRead.ayahNumber}`;
                onSelectSurah(lastRead.surahId);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-colors"
            >
              Resume
            </button>
          </div>
        )}


        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search Surah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border-[0.5px] border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-shadow"
          />
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-slate-200/50 dark:bg-slate-900/50 rounded-xl">
          <button
            onClick={() => setActiveTab('surah')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'surah'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-emerald-700 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Surah
          </button>
          <button
            onClick={() => setActiveTab('juz')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'juz'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-emerald-700 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Juz
          </button>
          <button
            onClick={() => setActiveTab('science')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'science'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-emerald-700 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Quran & Science
          </button>
          <button
            onClick={() => setActiveTab('discuss')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'discuss'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-emerald-700 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Discuss
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : activeTab === 'surah' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSurahs.map((surah) => {
              const highestRead = readProgress?.[surah.number] || 0;
              const progressPercent = Math.min(100, Math.round((highestRead / surah.numberOfAyahs) * 100));
              
              return (
                <button
                  key={surah.number}
                  onClick={() => onSelectSurah(surah.number)}
                  className="w-full text-left group flex flex-col p-5 rounded-2xl bg-white dark:bg-slate-900 border-[0.5px] border-slate-200/60 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start justify-between w-full mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
                        {surah.number}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">{surah.englishName}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium uppercase tracking-wider">
                          {surah.revelationType} • {surah.numberOfAyahs} Ayahs
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between w-full mt-auto pt-2">
                    <div className="w-2/3">
                      {highestRead > 0 ? (
                        <div className="w-full">
                          <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1.5 uppercase tracking-wider">
                            <span>Progress</span>
                            <span className="text-emerald-600 dark:text-emerald-400">{progressPercent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out" 
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="h-1.5" /> /* placeholder for alignment */
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-arabic text-2xl text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{surah.name}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : activeTab === 'science' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b-[0.5px] border-slate-900 dark:border-slate-100 pb-2 mb-6 mt-4">
               <h2 className="text-3xl font-serif font-black uppercase tracking-widest text-slate-900 dark:text-slate-50">Qur'an & Science</h2>
               <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">Research Archive</span>
            </div>

            {scienceArticles.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No articles loaded yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scienceArticles.map((article: any) => (
                  <ScienceArticle 
                    key={article.id} 
                    article={article} 
                    onSelectSurah={onSelectSurah} 
                  />
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'discuss' ? (
          <GlobalDiscussions />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJuzs.map((juz) => (
              <button
                key={juz.number}
                onClick={() => onSelectJuz(juz.number)}
                className="w-full text-left group flex flex-col p-5 rounded-2xl bg-white dark:bg-slate-900 border-[0.5px] border-slate-200/60 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between w-full mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
                      {juz.number}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">{juz.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium uppercase tracking-wider">
                        Juz {juz.number}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-end justify-between w-full mt-auto pt-2">
                  <div className="w-2/3" />
                  <div className="text-right">
                    <span className="font-arabic text-2xl text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">الجزء {juz.number}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
