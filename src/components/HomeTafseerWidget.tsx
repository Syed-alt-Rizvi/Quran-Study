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

  if (!isExpanded) {
    return (
      <div 
        onClick={() => {
          hapticImpact(ImpactStyle.Light);
          setIsExpanded(true);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(true);
          }
        }}
        className="mb-3 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl liquid-glass-card glass-amber-fusion border border-amber-400/30 dark:border-amber-500/20 shadow-xs hover:border-amber-400/60 active:scale-[0.99] transition-all flex items-center justify-between gap-2 cursor-pointer select-none"
        title="View Daily Tafseer"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <BookOpen size={17} strokeWidth={1.6} className="text-amber-600 dark:text-amber-400 shrink-0" />

          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium truncate">
            <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {isUrdu ? 'روزانہ کی تفسیر' : 'Daily Tafseer'}
            </span>
            <span className="text-[11px] text-amber-700 dark:text-amber-300 font-normal truncate">
              {surahName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold shrink-0">
          <span className="hidden xs:inline">{isUrdu ? 'پڑھیں' : 'Read'}</span>
          <ChevronDown size={15} strokeWidth={1.6} />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-3xl liquid-glass-card glass-amber-fusion p-4 sm:p-5 shadow-sm border border-amber-400/40 dark:border-amber-500/20 relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen size={18} strokeWidth={1.6} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
              {isUrdu ? 'روزانہ کی شیعہ تفسیر' : 'Daily Shia Tafseer'}
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {surahName}
            </h3>
          </div>
        </div>

        {/* Tafseer Source Switcher (Namoona vs Al-Kauthar) & Collapse Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 liquid-glass p-0.5 rounded-xl border border-white/30 dark:border-white/10">
            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                setTafseerProvider('namoona');
              }}
              className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${
                provider === 'namoona'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Tafseer Namoona (Ayatollah Naser Makarim Shirazi)"
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
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Al-Kauthar fi Tafseer (Allama Mohsin Ali Najafi)"
            >
              {isUrdu ? 'الکوثر' : 'Al-Kauthar'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              hapticImpact(ImpactStyle.Light);
              setIsExpanded(false);
            }}
            className="p-1.5 rounded-xl liquid-glass text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer border border-white/30 dark:border-white/10"
            title="Collapse Daily Tafseer"
            aria-label="Collapse"
          >
            <ChevronUp size={15} strokeWidth={1.6} />
          </button>
        </div>
      </div>

      {/* Sacred Arabic Ayah Text */}
      <div className="my-2.5 p-3.5 rounded-2xl liquid-glass border border-white/40 dark:border-white/10 relative z-10">
        <p
          dir="rtl"
          lang="ar"
          className="font-arabic text-lg sm:text-xl text-slate-900 dark:text-amber-200 leading-[2.2] text-center select-text font-normal"
          style={{ fontFamily: getArabicFontFamily(arabicFont) }}
        >
          {item.arabicText}
        </p>
      </div>

      {/* Translation */}
      <div className="mb-3 relative z-10 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif italic select-text">
        &ldquo;{isUrdu && item.urduTranslation ? item.urduTranslation : item.englishTranslation}&rdquo;
      </div>

      {/* Exegetical Commentary */}
      <div className="relative z-10 pt-2.5 border-t border-amber-300/30 dark:border-amber-500/20">
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="font-medium truncate">{authorName}</span>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {commentaryText}
        </p>

        {/* Clean Unboxed Key Themes with Typographic Separator */}
        {item.tafseerNamoona.keyThemes && item.tafseerNamoona.keyThemes.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mt-2.5 pt-2 border-t border-white/20 dark:border-white/10 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Themes:</span>
            {item.tafseerNamoona.keyThemes.map((theme, idx) => (
              <React.Fragment key={`theme-${idx}`}>
                {idx > 0 && <span aria-hidden="true">&bull;</span>}
                <span>{theme}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Actions Bar */}
      <div className="mt-3.5 pt-2.5 border-t border-white/20 dark:border-white/10 flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            className="px-2.5 py-1 rounded-xl text-xs font-medium liquid-glass border border-white/40 dark:border-white/10 hover:border-amber-400 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="Previous Ayah"
          >
            &larr;
          </button>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            {activeKeyIndex + 1}/{FEATURED_KEYS.length}
          </span>
          <button
            onClick={handleNext}
            className="px-2.5 py-1 rounded-xl text-xs font-medium liquid-glass border border-white/40 dark:border-white/10 hover:border-amber-400 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="Next Ayah"
          >
            &rarr;
          </button>
          <button
            onClick={handleShare}
            className="p-1.5 rounded-xl liquid-glass border border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors ml-1 cursor-pointer"
            title="Copy Ayah and Tafseer text"
            aria-label="Copy"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
          </button>
        </div>

        <button
          onClick={() => {
            hapticImpact(ImpactStyle.Medium);
            onOpenSurahTafseer(item.surahNumber, item.ayahNumber);
          }}
          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer"
        >
          <span>{isUrdu ? 'مکمل سورہ کھولیں' : 'Open in Quran'}</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
