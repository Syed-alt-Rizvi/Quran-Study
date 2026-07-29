import { useState, useEffect } from 'react';
import { fetchSurahs, SurahMeta } from '../api';
import { Search, BookOpen, Settings, LogOut } from 'lucide-react';
import { useSettingsStore } from '../store';

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
  const [activeTab, setActiveTab] = useState<'surah' | 'juz'>('surah');
  
  const { readProgress } = useSettingsStore();

  useEffect(() => {
    fetchSurahs()
      .then(data => {
        setSurahs(data);
        setLoading(false);
      })
      .catch(console.error);
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
      <header className="sticky top-0 z-30 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-4 py-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-500">
            <BookOpen size={28} />
            <h1 className="text-xl font-bold tracking-tight">Quran Study</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onOpenSettings}
              className="p-2 text-stone-600 hover:text-emerald-600 dark:text-stone-400 dark:hover:text-emerald-400 bg-stone-100 hover:bg-emerald-50 dark:bg-stone-900 dark:hover:bg-stone-800 rounded-full transition-colors"
            >
              <Settings size={22} />
            </button>
            <button 
              onClick={onExit}
              className="p-2 text-stone-600 hover:text-red-600 dark:text-stone-400 dark:hover:text-red-400 bg-stone-100 hover:bg-red-50 dark:bg-stone-900 dark:hover:bg-red-900/20 rounded-full transition-colors"
              title="Exit App"
            >
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Hadith Banner */}
        <div className="mb-8 p-6 bg-emerald-700 dark:bg-emerald-900 rounded-2xl relative overflow-hidden shadow-lg border border-emerald-600 dark:border-emerald-800">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-600/30 dark:bg-emerald-800/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-emerald-800/30 dark:bg-emerald-950/30 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <h4 className="text-emerald-100 font-semibold uppercase tracking-widest text-xs mb-3">Hadith al-Thaqalayn</h4>
            <p className="font-arabic text-3xl md:text-5xl text-white leading-loose mb-6 drop-shadow-md" style={{ fontFamily: "'Thuluth', 'Amiri Quran', serif" }}>
              إِنِّي تَارِكٌ فِيكُمْ الثَّقَلَيْنِ كِتَابَ اللَّهِ وَعِتْرَتِي أَهْلَ بَيْتِي
            </p>
            <p className="text-emerald-50 text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-3">
              "Indeed, I am leaving among you two weighty things: the Book of Allah and my progeny, the members of my household."
            </p>
            <div className="bg-emerald-800/50 dark:bg-emerald-950/50 px-4 py-1.5 rounded-full backdrop-blur-sm">
              <p className="text-xs text-emerald-200 font-medium tracking-wide">
                Sahih Muslim 2408 • Sahih Bukhari (Concept)
              </p>
            </div>
          </div>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search Surah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-shadow"
          />
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-stone-200/50 dark:bg-stone-900/50 rounded-xl">
          <button
            onClick={() => setActiveTab('surah')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'surah'
                ? 'bg-white dark:bg-stone-800 shadow-sm text-emerald-700 dark:text-emerald-400'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Surah
          </button>
          <button
            onClick={() => setActiveTab('juz')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'juz'
                ? 'bg-white dark:bg-stone-800 shadow-sm text-emerald-700 dark:text-emerald-400'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Juz
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-20 bg-stone-200 dark:bg-stone-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : activeTab === 'surah' ? (
          <div className="space-y-3">
            {filteredSurahs.map((surah) => {
              const highestRead = readProgress?.[surah.number] || 0;
              const progressPercent = Math.min(100, Math.round((highestRead / surah.numberOfAyahs) * 100));
              
              return (
                <button
                  key={surah.number}
                  onClick={() => onSelectSurah(surah.number)}
                  className="w-full text-left group flex flex-col p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm rotate-45 group-hover:rotate-0 transition-transform duration-300">
                        <span className="-rotate-45 group-hover:rotate-0 transition-transform duration-300">{surah.number}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-900 dark:text-stone-100">{surah.englishName}</h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                          {surah.revelationType} • {surah.numberOfAyahs} Ayahs
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-arabic text-2xl text-stone-800 dark:text-stone-200">{surah.name}</span>
                    </div>
                  </div>
                  
                  {highestRead > 0 && (
                    <div className="w-full mt-4">
                      <div className="flex justify-between text-[10px] text-stone-500 font-medium mb-1.5 uppercase tracking-wider">
                        <span>Progress</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out" 
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredJuzs.map((juz) => (
              <button
                key={juz.number}
                onClick={() => onSelectJuz(juz.number)}
                className="w-full text-left group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm rotate-45 group-hover:rotate-0 transition-transform duration-300">
                    <span className="-rotate-45 group-hover:rotate-0 transition-transform duration-300">{juz.number}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900 dark:text-stone-100">{juz.name}</h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Juz {juz.number}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-arabic text-2xl text-stone-800 dark:text-stone-200">الجزء {juz.number}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
