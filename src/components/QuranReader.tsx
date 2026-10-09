import React, { useState } from 'react';
import { BookOpen, Search, ArrowLeft, ArrowRight, Share2, Bookmark, Check } from 'lucide-react';
import { SURAH_LIST, SurahMeta } from '../data/quranMetadata';
import { getTafseerForAyah } from '../data/tafseerData';
import { CitationBox } from './CitationBox';

// Sample verses for Surahs so the app is instantly usable and lightweight
const SURAH_VERSES_CACHE: Record<number, { num: number; text: string; en: string; ur: string }[]> = {
  1: [
    { num: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", en: "In the name of Allah, the Entirely Merciful, the Especially Merciful.", ur: "اللہ کے نام سے جو سراسر رحمت ہے، جس کی شفقت ابدی ہے۔" },
    { num: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", en: "[All] praise is [due] to Allah, Lord of the worlds -", ur: "سب تعریفیں اللہ ہی کے لیے ہیں جو تمام جہانوں کا پالنے والا ہے۔" },
    { num: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ", en: "The Entirely Merciful, the Especially Merciful,", ur: "جو بڑا مہربان نہایت رحم والا ہے۔" },
    { num: 4, text: "مَالِكِ يَوْمِ الدِّينِ", en: "Sovereign of the Day of Recompense.", ur: "روزِ جزا کا مالک ہے۔" },
    { num: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", en: "It is You we worship and You we ask for help.", ur: "ہم صرف تیری ہی عبادت کرتے ہیں اور صرف تجھ ہی سے مدد مانگتے ہیں۔" },
    { num: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", en: "Guide us to the straight path -", ur: "ہمیں سیدھے راستے کی ہدایت فرما۔" },
    { num: 7, text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", en: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.", ur: "ان لوگوں کا راستہ جن پر تو نے انعام فرمایا، نہ ان کا جن پر غضب ہوا اور نہ گمراہوں کا۔" }
  ],
  108: [
    { num: 1, text: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", en: "Indeed, We have granted you, [O Muhammad], abundance.", ur: "بے شک ہم نے آپ کو کوثر عطا فرمائی۔" },
    { num: 2, text: "فَصَلِّ لِرَبِّكَ وَانْحَرْ", en: "So pray to your Lord and sacrifice [to Him alone].", ur: "پس اپنے رب کے لیے نماز پڑھیں اور قربانی کریں۔" },
    { num: 3, text: "إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ", en: "Indeed, your enemy is the one cut off.", ur: "یقیناً آپ کا دشمن ہی بے نام و نشان رہے گا۔" }
  ],
  112: [
    { num: 1, text: "قُلْ هُوَ اللَّهُ أَحَدٌ", en: "Say, 'He is Allah, [who is] One,", ur: "کہہ دیجیے کہ وہ اللہ یکتا ہے۔" },
    { num: 2, text: "اللَّهُ الصَّمَدُ", en: "Allah, the Eternal Refuge.", ur: "اللہ بے نیاز ہے۔" },
    { num: 3, text: "لَمْ يَلِدْ وَلَمْ يُولَدْ", en: "He neither begets nor is born,", ur: "نہ اس کی کوئی اولاد ہے اور نہ وہ کسی کی اولاد ہے۔" },
    { num: 4, text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", en: "Nor is there to Him any equivalent.'", ur: "اور نہ کوئی اس کا ہمسر ہے۔" }
  ]
};

export const QuranReader: React.FC = () => {
  const [selectedSurah, setSelectedSurah] = useState<SurahMeta>(SURAH_LIST[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAyahForTafseer, setActiveAyahForTafseer] = useState<number | null>(1);
  const [activeTafseerTab, setActiveTafseerTab] = useState<'namoona' | 'kauthar'>('namoona');
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);

  // Filtered surahs for fast browsing
  const filteredSurahs = SURAH_LIST.filter(
    s =>
      s.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.includes(searchQuery) ||
      s.number.toString() === searchQuery.trim()
  );

  // Dynamic generate or fetch verses
  const verses = SURAH_VERSES_CACHE[selectedSurah.number] || Array.from(
    { length: Math.min(selectedSurah.totalVerses, 10) },
    (_, i) => ({
      num: i + 1,
      text: `الآية ${i + 1} مِنْ سُورَةِ ${selectedSurah.name}`,
      en: `Verse ${i + 1} of Surah ${selectedSurah.transliteration}.`,
      ur: `سورة ${selectedSurah.name} کی آیت نمبر ${i + 1}۔`
    })
  );

  const currentAyahData = activeAyahForTafseer
    ? verses.find(v => v.num === activeAyahForTafseer) || verses[0]
    : verses[0];

  const currentTafseer = getTafseerForAyah(
    selectedSurah.number,
    currentAyahData.num,
    currentAyahData.text
  );

  const handleShare = (num: number, text: string) => {
    navigator.clipboard.writeText(`${text}\n— Surah ${selectedSurah.transliteration} [${selectedSurah.number}:${num}]`);
    setCopiedAyah(num);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  const handlePrevSurah = () => {
    if (selectedSurah.number > 1) {
      const prev = SURAH_LIST.find(s => s.number === selectedSurah.number - 1);
      if (prev) {
        setSelectedSurah(prev);
        setActiveAyahForTafseer(1);
      }
    }
  };

  const handleNextSurah = () => {
    if (selectedSurah.number < 114) {
      const next = SURAH_LIST.find(s => s.number === selectedSurah.number + 1);
      if (next) {
        setSelectedSurah(next);
        setActiveAyahForTafseer(1);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Selector Grid / Search */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Surah Directory */}
        <div className="lg:col-span-1 border border-slate-800 bg-slate-900/60 rounded-2xl p-4 flex flex-col h-[750px] shadow-lg">
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search 114 Surahs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredSurahs.map((surah) => {
              const isSelected = selectedSurah.number === surah.number;
              return (
                <button
                  key={surah.number}
                  onClick={() => {
                    setSelectedSurah(surah);
                    setActiveAyahForTafseer(1);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between border ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'border-transparent hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700/50 text-[11px] font-mono flex items-center justify-center text-slate-400">
                      {surah.number}
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold">{surah.transliteration}</h4>
                      <p className="text-[10px] text-slate-400">{surah.totalVerses} verses • {surah.type}</p>
                    </div>
                  </div>
                  <span className="font-amiri text-sm font-bold text-slate-200">{surah.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 3 Columns: Surah Viewer + Tafseer & Citations Box */}
        <div className="lg:col-span-3 space-y-6">
          {/* Surah Header Card */}
          <div className="border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/20 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handlePrevSurah}
              disabled={selectedSurah.number === 1}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Prev
            </button>

            <div className="text-center">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                Surah #{selectedSurah.number} • {selectedSurah.type}
              </span>
              <h2 className="text-3xl font-bold font-amiri text-slate-100 mt-1">
                سُورَةُ {selectedSurah.name}
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {selectedSurah.transliteration} — {selectedSurah.translation} ({selectedSurah.totalVerses} Ayahs)
              </p>
            </div>

            <button
              onClick={handleNextSurah}
              disabled={selectedSurah.number === 114}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Ayah Stream */}
          <div className="border border-slate-800 bg-slate-900/50 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
              <span>Click on any Ayah to view Shia Tafseer & external citations below</span>
              <span className="font-mono text-emerald-400">Showing verses</span>
            </div>

            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
              {verses.map((ayah) => {
                const isActive = activeAyahForTafseer === ayah.num;
                return (
                  <div
                    key={ayah.num}
                    onClick={() => setActiveAyahForTafseer(ayah.num)}
                    className={`cursor-pointer border rounded-xl p-4 transition-all ${
                      isActive
                        ? 'border-emerald-500/60 bg-emerald-950/20 shadow-md ring-1 ring-emerald-500/30'
                        : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/60">
                      <span className="w-6 h-6 rounded-md bg-slate-800 text-[11px] font-mono flex items-center justify-center text-emerald-400 font-semibold">
                        {ayah.num}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(ayah.num, ayah.text);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs"
                          title="Copy verse text"
                        >
                          {copiedAyah === ayah.num ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {selectedSurah.number}:{ayah.num}
                        </span>
                      </div>
                    </div>

                    <p className="font-quran text-right text-xl sm:text-2xl text-slate-100 py-1" dir="rtl">
                      {ayah.text}
                    </p>

                    <p className="text-xs text-slate-300 mt-2 font-normal leading-relaxed">
                      {ayah.en}
                    </p>
                    {ayah.ur && (
                      <p className="text-xs text-slate-400 mt-1 font-amiri leading-relaxed" dir="rtl">
                        {ayah.ur}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tafseer Study Panel */}
          <div className="border border-slate-800 bg-slate-900/80 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                  Shia Exegesis Study • Ayah {selectedSurah.number}:{currentAyahData.num}
                </span>
                <h3 className="text-lg font-bold text-slate-100 mt-0.5 font-amiri">
                  تفسير الآية: {currentAyahData.text}
                </h3>
              </div>

              {/* Tafseer selector tabs */}
              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveTafseerTab('namoona')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTafseerTab === 'namoona'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  تفسير نمونه (Namoona)
                </button>
                <button
                  onClick={() => setActiveTafseerTab('kauthar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTafseerTab === 'kauthar'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  تفسير الكوثر (Al-Kauthar)
                </button>
              </div>
            </div>

            {/* Tafseer Content */}
            <div className="mt-5 space-y-4">
              {activeTafseerTab === 'namoona' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-emerald-400">
                    <span className="font-semibold">{currentTafseer.tafseerNamoona.author}</span>
                    <span className="text-[11px] text-slate-500">Seminary Standard Edition</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
                    {currentTafseer.tafseerNamoona.text}
                  </p>
                  {currentTafseer.tafseerNamoona.keyThemes && (
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="text-xs text-slate-500">Core Themes:</span>
                      {currentTafseer.tafseerNamoona.keyThemes.map((th, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {th}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-emerald-400">
                    <span className="font-semibold">{currentTafseer.tafseerAlKauthar.author}</span>
                    <span className="text-[11px] text-slate-500">Urdu & Arabic Scholarly Discourse</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
                    {currentTafseer.tafseerAlKauthar.text}
                  </p>
                  {currentTafseer.tafseerAlKauthar.scholarlyNotes && (
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400">
                      <span className="text-emerald-400 font-medium">Scholarly Footnote: </span>
                      {currentTafseer.tafseerAlKauthar.scholarlyNotes}
                    </div>
                  )}
                </div>
              )}

              {/* DEDICATED CITATION BOX AT BOTTOM OF TAFSIR */}
              <CitationBox
                surahNumber={selectedSurah.number}
                ayahNumber={currentAyahData.num}
                citations={currentTafseer.supportingResources}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
