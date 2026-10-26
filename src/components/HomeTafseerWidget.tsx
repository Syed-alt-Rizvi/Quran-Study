import React, { useState, useMemo } from 'react';
import { BookOpen, ChevronRight, Languages, ChevronDown, ChevronUp, Share2, Check } from 'lucide-react';
import { TAFSEER_SAMPLE_STORE, AyahTafseer } from '../data/tafseerData';
import { useSettingsStore } from '../store';
import { hapticImpact, ImpactStyle } from '../utils/haptics';
import { getArabicFontFamily } from '../utils/arabicFonts';
import { SURAH_URDU_MAP } from '../data/surahUrduNames';

interface HomeTafseerWidgetProps {
  onOpenSurahTafseer: (surahId: number, ayahNumber?: number) => void;
}

const FEATURED_KEYS = [
  '33:33', // Ayat al-Tatheer (Purity of Ahlulbayt)
  '42:23', // Ayat al-Mawaddah (Devotion to Ahlulbayt)
  '5:55',  // Ayat al-Wilayah (Charity in Ruku)
  '5:67',  // Ayat al-Tableegh (Proclamation of Ghadeer)
  '108:1', // Surah Al-Kawthar (Abundant Grace • Lady Fatimah)
  '2:255', // Ayat al-Kursi (Divine Sovereignty)
  '1:1',   // Bismillah
];

export default function HomeTafseerWidget({ onOpenSurahTafseer }: HomeTafseerWidgetProps) {
  const { appLanguage, arabicFont, tafseerProvider, setTafseerProvider } = useSettingsStore();
  const isUrdu = appLanguage === 'ur';

  const [activeKeyIndex, setActiveKeyIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentKey = FEATURED_KEYS[activeKeyIndex];
  const item: AyahTafseer | undefined = TAFSEER_SAMPLE_STORE[currentKey] || TAFSEER_SAMPLE_STORE['33:33'];

  const provider = tafseerProvider || 'namoona';

  const surahName = useMemo(() => {
    if (!item) return '';
    const urduMeta = SURAH_URDU_MAP[item.surahNumber];
    if (isUrdu && urduMeta?.urduName) {
      return `سورۃ ${urduMeta.urduName} • آیت ${item.ayahNumber}`;
    }
    return `Surah ${item.surahNumber} • Ayah ${item.ayahNumber}`;
  }, [item, isUrdu]);

  const handleNext = () => {
    hapticImpact(ImpactStyle.Light);
    setActiveKeyIndex((prev) => (prev + 1) % FEATURED_KEYS.length);
  };

  const handlePrev = () => {
    hapticImpact(ImpactStyle.Light);
    setActiveKeyIndex((prev) => (prev - 1 + FEATURED_KEYS.length) % FEATURED_KEYS.length);
  };

  const handleShare = () => {
    if (!item) return;
    hapticImpact(ImpactStyle.Light);
    const text = `${item.arabicText}\n\n${isUrdu && item.urduTranslation ? item.urduTranslation : item.englishTranslation}\n\n[${surahName} - Shia Tafseer (${provider === 'namoona' ? 'Tafseer Namoona' : 'Al-Kauthar'})]`;
    navigator.clipboard?.writeText?.(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!item) return null;

  const commentaryText = provider === 'namoona' ? item.tafseerNamoona.text : item.tafseerAlKauthar.text;
  const authorName = provider === 'namoona' ? item.tafseerNamoona.author : item.tafseerAlKauthar.author;

  return (
    <div className="mb-4 rounded-3xl bg-slate-900 dark:bg-slate-950 text-white p-4 sm:p-5 shadow-sm border border-emerald-800/40 relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <BookOpen size={17} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              {isUrdu ? 'روزانہ کی شیعہ تفسیر' : 'Daily Shia Tafseer'}
            </span>
            <h3 className="text-sm font-semibold text-emerald-100 flex items-center gap-1.5">
              <span>{surahName}</span>
            </h3>
          </div>
        </div>

        {/* Tafseer Source Switcher (Namoona vs Al-Kauthar) */}
        <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-xl border border-emerald-700/50">
          <button
            onClick={() => {
              hapticImpact(ImpactStyle.Light);
              setTafseerProvider('namoona');
            }}
            className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${
              provider === 'namoona'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-300/70 hover:text-white'
            }`}
            title="Tafseer Namoona (Grand Ayatollah Naser Makarim Shirazi)"
          >
            {isUrdu ? 'نمونہ' : 'Namoona'}
          </button>
          <button
            onClick={() => {
              hapticImpact(ImpactStyle.Light);
              setTafseerProvider('kauthar');
            }}
            className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${
              provider === 'kauthar'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-300/70 hover:text-white'
            }`}
            title="Al-Kauthar fi Tafseer (Allama Mohsin Ali Najafi)"
          >
            {isUrdu ? 'الکوثر' : 'Al-Kauthar'}
          </button>
        </div>
      </div>

      {/* Sacred Arabic Ayah Text */}
      <div className="my-2.5 p-3 rounded-2xl bg-black/30 border border-emerald-800/40 relative z-10">
        <p
          dir="rtl"
          lang="ar"
          className="font-arabic text-lg sm:text-xl text-amber-200/95 leading-[2.1] text-center select-text"
          style={{ fontFamily: getArabicFontFamily(arabicFont) }}
        >
          {item.arabicText}
        </p>
      </div>

      {/* Translation */}
      <div className="mb-3 relative z-10 text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-serif italic select-text">
        &ldquo;{isUrdu && item.urduTranslation ? item.urduTranslation : item.englishTranslation}&rdquo;
      </div>

      {/* Exegetical Commentary (Expandable) */}
      <div className="relative z-10 pt-2 border-t border-emerald-800/50">
        <div className="flex items-center justify-between text-[11px] text-emerald-300/80 mb-1">
          <span className="font-medium truncate max-w-[200px] sm:max-w-none">{authorName}</span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <span>{isExpanded ? (isUrdu ? 'مختصر کریں' : 'Show less') : (isUrdu ? 'مکمل تفسیر پڑھیں' : 'Read commentary')}</span>
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        <p
          className={`text-xs text-slate-200 leading-relaxed transition-all ${
            isExpanded ? 'line-clamp-none' : 'line-clamp-2'
          }`}
        >
          {commentaryText}
        </p>

        {/* Key Themes Chips if available */}
        {isExpanded && item.tafseerNamoona.keyThemes && (
          <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-emerald-800/40">
            {item.tafseerNamoona.keyThemes.map((theme, idx) => (
              <span
                key={`theme-${idx}`}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-800/50 text-emerald-200 border border-emerald-700/50"
              >
                {theme}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Actions Bar */}
      <div className="mt-3.5 pt-2.5 border-t border-emerald-800/60 flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            className="px-2.5 py-1 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Previous Ayah"
          >
            &larr;
          </button>
          <span className="text-[11px] text-emerald-300/70 font-mono">
            {activeKeyIndex + 1}/{FEATURED_KEYS.length}
          </span>
          <button
            onClick={handleNext}
            className="px-2.5 py-1 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Next Ayah"
          >
            &rarr;
          </button>
          <button
            onClick={handleShare}
            className="p-1.5 rounded-xl text-emerald-300/80 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
            title="Copy Ayah and Tafseer text"
            aria-label="Copy"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
          </button>
        </div>

        <button
          onClick={() => {
            hapticImpact(ImpactStyle.Medium);
            onOpenSurahTafseer(item.surahNumber, item.ayahNumber);
          }}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-emerald-950 font-bold text-xs transition-all shadow-md flex items-center gap-1 cursor-pointer"
        >
          <span>{isUrdu ? 'مکمل سورہ کھولیں' : 'Open in Quran'}</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
