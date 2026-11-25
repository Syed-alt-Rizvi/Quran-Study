import React, { useMemo } from 'react';
import { getArabicFontFamily } from '../utils/arabicFonts';
import { SURAH_LIST } from '../data/quranMetadata';
import { SURAH_URDU_MAP } from '../data/surahUrduNames';
import { getMafatihArabicTitle, getMafatihEnglishTitle } from '../utils/mafatihArabic';

export interface QuranAlbumArtProps {
  type: 'quran';
  surahNumber: number;
  surahNameArabic?: string;
  surahNameEnglish?: string;
  title?: string;
  revelationType?: 'Meccan' | 'Medinan' | string;
  ayahCount?: number;
  isPlaying?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export interface MafatihAlbumArtProps {
  type: 'mafatih';
  itemId: string;
  title: string;
  arabicTitle?: string;
  category?: string;
  isPlaying?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export type SacredAlbumArtProps = QuranAlbumArtProps | MafatihAlbumArtProps;

// Curated Sacred Theme Archetypes
interface SacredPalette {
  bgGradient: string;
  primaryGlow: string;
  secondaryGlow: string;
  accentGold: string;
  darkRing: string;
  starColor: string;
  borderHalo: string;
  archetypeBadge: string;
}

// Well-known spiritual archetypes for Quranic Surahs
const SURAH_PALETTES: Record<number, SacredPalette> = {
  1: { // Al-Fatihah
    bgGradient: 'from-emerald-950 via-teal-900 to-amber-950',
    primaryGlow: 'rgba(16, 185, 129, 0.45)',
    secondaryGlow: 'rgba(245, 158, 11, 0.35)',
    accentGold: '#fbbf24',
    darkRing: '#064e3b',
    starColor: '#fef08a',
    borderHalo: 'border-emerald-500/40',
    archetypeBadge: 'THE OPENING • UMM AL-KITAB'
  },
  2: { // Al-Baqarah
    bgGradient: 'from-slate-950 via-emerald-950 to-stone-900',
    primaryGlow: 'rgba(5, 150, 105, 0.4)',
    secondaryGlow: 'rgba(217, 119, 6, 0.3)',
    accentGold: '#f59e0b',
    darkRing: '#022c22',
    starColor: '#fde68a',
    borderHalo: 'border-emerald-400/35',
    archetypeBadge: 'THE PINNACLE OF THE QURAN'
  },
  36: { // Ya-Sin
    bgGradient: 'from-indigo-950 via-violet-950 to-slate-950',
    primaryGlow: 'rgba(139, 92, 246, 0.45)',
    secondaryGlow: 'rgba(234, 179, 8, 0.35)',
    accentGold: '#facc15',
    darkRing: '#2e1065',
    starColor: '#fef9c3',
    borderHalo: 'border-violet-500/40',
    archetypeBadge: 'THE HEART OF THE QURAN'
  },
  55: { // Ar-Rahman
    bgGradient: 'from-cyan-950 via-teal-950 to-emerald-950',
    primaryGlow: 'rgba(20, 184, 166, 0.45)',
    secondaryGlow: 'rgba(251, 191, 36, 0.35)',
    accentGold: '#38bdf8',
    darkRing: '#134e4a',
    starColor: '#bae6fd',
    borderHalo: 'border-teal-400/40',
    archetypeBadge: 'THE BRIDE OF THE QURAN'
  },
  56: { // Al-Waqi'ah
    bgGradient: 'from-slate-950 via-blue-950 to-indigo-950',
    primaryGlow: 'rgba(59, 130, 246, 0.4)',
    secondaryGlow: 'rgba(245, 158, 11, 0.35)',
    accentGold: '#fbbf24',
    darkRing: '#1e3a8a',
    starColor: '#fde68a',
    borderHalo: 'border-blue-400/40',
    archetypeBadge: 'THE INEVITABLE REALITY'
  },
  67: { // Al-Mulk
    bgGradient: 'from-blue-950 via-slate-900 to-indigo-950',
    primaryGlow: 'rgba(99, 102, 241, 0.4)',
    secondaryGlow: 'rgba(251, 191, 36, 0.35)',
    accentGold: '#fbbf24',
    darkRing: '#1e1b4b',
    starColor: '#fef08a',
    borderHalo: 'border-indigo-400/40',
    archetypeBadge: 'PROTECTOR OF THE GRAVE'
  },
  112: { // Al-Ikhlas
    bgGradient: 'from-amber-950 via-yellow-950 to-stone-950',
    primaryGlow: 'rgba(245, 158, 11, 0.5)',
    secondaryGlow: 'rgba(251, 191, 36, 0.4)',
    accentGold: '#fef08a',
    darkRing: '#451a03',
    starColor: '#ffffff',
    borderHalo: 'border-amber-400/50',
    archetypeBadge: 'DIVINE MONOTHEISM • TAWHID'
  }
};

// Procedural harmonic palette generator for any Quran Surah 1-114
function getSurahPalette(surahNumber: number, type?: 'Meccan' | 'Medinan' | string): SacredPalette {
  if (SURAH_PALETTES[surahNumber]) {
    return SURAH_PALETTES[surahNumber];
  }

  const isMeccan = type === 'Meccan';
  // Derive harmonious color stops based on Surah number
  const mod = surahNumber % 8;
  switch (mod) {
    case 0:
      return {
        bgGradient: 'from-emerald-950 via-teal-950 to-slate-950',
        primaryGlow: 'rgba(16, 185, 129, 0.4)',
        secondaryGlow: 'rgba(245, 158, 11, 0.3)',
        accentGold: '#34d399',
        darkRing: '#064e3b',
        starColor: '#a7f3d0',
        borderHalo: 'border-emerald-400/35',
        archetypeBadge: isMeccan ? 'MECCAN REVELATION' : 'MEDINAN REVELATION'
      };
    case 1:
      return {
        bgGradient: 'from-blue-950 via-indigo-950 to-slate-950',
        primaryGlow: 'rgba(99, 102, 241, 0.4)',
        secondaryGlow: 'rgba(251, 191, 36, 0.3)',
        accentGold: '#818cf8',
        darkRing: '#1e1b4b',
        starColor: '#c7d2fe',
        borderHalo: 'border-indigo-400/35',
        archetypeBadge: isMeccan ? 'MECCAN REVELATION' : 'MEDINAN REVELATION'
      };
    case 2:
      return {
        bgGradient: 'from-amber-950 via-stone-900 to-emerald-950',
        primaryGlow: 'rgba(245, 158, 11, 0.4)',
        secondaryGlow: 'rgba(16, 185, 129, 0.3)',
        accentGold: '#fbbf24',
        darkRing: '#451a03',
        starColor: '#fde68a',
        borderHalo: 'border-amber-400/35',
        archetypeBadge: isMeccan ? 'MECCAN REVELATION' : 'MEDINAN REVELATION'
      };
    case 3:
      return {
        bgGradient: 'from-teal-950 via-cyan-950 to-slate-950',
        primaryGlow: 'rgba(20, 184, 166, 0.4)',
        secondaryGlow: 'rgba(56, 189, 248, 0.3)',
        accentGold: '#2dd4bf',
        darkRing: '#134e4a',
        starColor: '#99f6e4',
        borderHalo: 'border-teal-400/35',
        archetypeBadge: isMeccan ? 'MECCAN REVELATION' : 'MEDINAN REVELATION'
      };
    case 4:
      return {
        bgGradient: 'from-violet-950 via-purple-950 to-slate-950',
        primaryGlow: 'rgba(168, 85, 247, 0.4)',
        secondaryGlow: 'rgba(251, 191, 36, 0.3)',
        accentGold: '#c084fc',
        darkRing: '#3b0764',
        starColor: '#e9d5ff',
        borderHalo: 'border-purple-400/35',
        archetypeBadge: isMeccan ? 'MECCAN REVELATION' : 'MEDINAN REVELATION'
      };
    case 5:
      return {
        bgGradient: 'from-sky-950 via-blue-950 to-teal-950',
        primaryGlow: 'rgba(14, 165, 233, 0.4)',
        secondaryGlow: 'rgba(245, 158, 11, 0.3)',
        accentGold: '#38bdf8',
        darkRing: '#0c4a6e',
        starColor: '#bae6fd',
        borderHalo: 'border-sky-400/35',
        archetypeBadge: isMeccan ? 'MECCAN REVELATION' : 'MEDINAN REVELATION'
      };
    case 6:
      return {
        bgGradient: 'from-rose-950 via-slate-950 to-indigo-950',
        primaryGlow: 'rgba(244, 63, 94, 0.35)',
        secondaryGlow: 'rgba(251, 191, 36, 0.35)',
        accentGold: '#fb7185',
        darkRing: '#4c0519',
        starColor: '#fecdd3',
        borderHalo: 'border-rose-400/35',
        archetypeBadge: isMeccan ? 'MECCAN REVELATION' : 'MEDINAN REVELATION'
      };
    default:
      return {
        bgGradient: 'from-slate-950 via-emerald-950 to-teal-950',
        primaryGlow: 'rgba(16, 185, 129, 0.4)',
        secondaryGlow: 'rgba(217, 119, 6, 0.3)',
        accentGold: '#facc15',
        darkRing: '#022c22',
        starColor: '#fef08a',
        borderHalo: 'border-emerald-400/35',
        archetypeBadge: isMeccan ? 'MECCAN REVELATION' : 'MEDINAN REVELATION'
      };
  }
}

// Well-known spiritual archetypes for Mafatih al-Jinan recitations
function getMafatihPalette(itemId: string, title: string, category?: string): SacredPalette {
  const id = (itemId || '').toLowerCase();
  const t = (title || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  // 1. Karbala / Ashura / Imam Husayn / Arbaeen (Sacred Crimson & Karbala Gold)
  if (id.includes('ashura') || id.includes('waritha') || id.includes('arbaeen') || t.includes('ashura') || t.includes('karbala') || id === 'maf_ziy86' || id === 'maf_ziy73a' || id === 'maf_ziy92') {
    return {
      bgGradient: 'from-rose-950 via-red-950 to-stone-950',
      primaryGlow: 'rgba(225, 29, 72, 0.45)',
      secondaryGlow: 'rgba(245, 158, 11, 0.4)',
      accentGold: '#fbbf24',
      darkRing: '#4c0519',
      starColor: '#ffe4e6',
      borderHalo: 'border-red-500/40',
      archetypeBadge: 'KARBALA • SAYYID AL-SHUHADA (A.S.)'
    };
  }

  // 2. Amir al-Mu'minin Imam Ali (Kumayl, Sabah, Ameenullah) (Lapis Lazuli & Celestial Gold)
  if (id.includes('kumayl') || id.includes('sabah') || id.includes('ameenullah') || id === 'maf_dua40' || id === 'maf_dua39' || id === 'maf_ziy134a' || t.includes('kumayl')) {
    return {
      bgGradient: 'from-blue-950 via-indigo-950 to-slate-950',
      primaryGlow: 'rgba(59, 130, 246, 0.45)',
      secondaryGlow: 'rgba(234, 179, 8, 0.4)',
      accentGold: '#facc15',
      darkRing: '#1e3a8a',
      starColor: '#fef08a',
      borderHalo: 'border-blue-400/40',
      archetypeBadge: 'NAJAF • AMIR AL-MU\'MININ (A.S.)'
    };
  }

  // 3. Imam al-Mahdi (Ahad, Faraj, Nudbah, Ale Yasin) (Cyan Dawn & Solar Gold)
  if (id.includes('ahad') || id.includes('faraj') || id.includes('nudb') || id.includes('yasin') || id === 'maf_ziy128' || id === 'maf_dua46b' || id === 'maf_ziy126a' || id === 'maf_ziy124') {
    return {
      bgGradient: 'from-teal-950 via-cyan-950 to-slate-950',
      primaryGlow: 'rgba(6, 182, 212, 0.45)',
      secondaryGlow: 'rgba(245, 158, 11, 0.35)',
      accentGold: '#22d3ee',
      darkRing: '#134e4a',
      starColor: '#cffafe',
      borderHalo: 'border-cyan-400/40',
      archetypeBadge: 'BAQIYATULLAH • IMAM AL-MAHDI (A.T.F.S.)'
    };
  }

  // 4. Lady Fatimah & Ahlulbayt (Hadith al-Kisa, Lady Masumah) (Emerald Green & Divine Light)
  if (id.includes('kisa') || id.includes('masum') || id === 'h_kisa' || id === 'maf_ziy140a' || t.includes('kisa')) {
    return {
      bgGradient: 'from-emerald-950 via-teal-950 to-stone-950',
      primaryGlow: 'rgba(16, 185, 129, 0.5)',
      secondaryGlow: 'rgba(251, 191, 36, 0.4)',
      accentGold: '#34d399',
      darkRing: '#064e3b',
      starColor: '#d1fae5',
      borderHalo: 'border-emerald-400/45',
      archetypeBadge: 'AHL AL-KISA • THE CLOAK OF PURITY'
    };
  }

  // 5. Dua Tawassul (Royal Sapphire & Intercession Starburst)
  if (id.includes('tawassul') || id === 'maf_dua51' || t.includes('tawassul')) {
    return {
      bgGradient: 'from-indigo-950 via-blue-950 to-slate-950',
      primaryGlow: 'rgba(99, 102, 241, 0.45)',
      secondaryGlow: 'rgba(251, 191, 36, 0.35)',
      accentGold: '#fbbf24',
      darkRing: '#1e1b4b',
      starColor: '#fef08a',
      borderHalo: 'border-indigo-400/40',
      archetypeBadge: 'THE FOURTEEN INFALLIBLES (A.S.)'
    };
  }

  // 6. Munajaat of Imam Sajjad (Whispered Prayers 1-15) (Mystic Amethyst & Starlight)
  if (id.includes('whis') || cat.includes('munajat') || cat.includes('whisper') || t.includes('munajat')) {
    return {
      bgGradient: 'from-purple-950 via-violet-950 to-slate-950',
      primaryGlow: 'rgba(168, 85, 247, 0.45)',
      secondaryGlow: 'rgba(244, 114, 182, 0.3)',
      accentGold: '#e879f9',
      darkRing: '#3b0764',
      starColor: '#f3e8ff',
      borderHalo: 'border-purple-400/40',
      archetypeBadge: 'SAHIFA SAJJADIYYA • MUNAJAAT'
    };
  }

  // 7. Ramadan & Night of Qadr (Iftitah, Mujir, Jawshan, Aamaal)
  if (id.includes('iftitah') || id.includes('mujir') || id.includes('mujeer') || id.includes('jawshan') || id.includes('aamal') || t.includes('ramadan')) {
    return {
      bgGradient: 'from-slate-950 via-sky-950 to-indigo-950',
      primaryGlow: 'rgba(14, 165, 233, 0.45)',
      secondaryGlow: 'rgba(251, 191, 36, 0.4)',
      accentGold: '#38bdf8',
      darkRing: '#082f49',
      starColor: '#e0f2fe',
      borderHalo: 'border-sky-400/40',
      archetypeBadge: 'RAMADAN & SACRED NIGHTS'
    };
  }

  // 8. General Supplications / Baqiyaat
  return {
    bgGradient: 'from-stone-950 via-amber-950 to-emerald-950',
    primaryGlow: 'rgba(217, 119, 6, 0.4)',
    secondaryGlow: 'rgba(16, 185, 129, 0.35)',
    accentGold: '#f59e0b',
    darkRing: '#451a03',
    starColor: '#fde68a',
    borderHalo: 'border-amber-400/40',
    archetypeBadge: 'MAFATIH AL-JINAN • SHEIKH ABBAS QUMMI'
  };
}

export const SacredAlbumArt: React.FC<SacredAlbumArtProps> = (props) => {
  const { type, isPlaying = false, size = 'lg', className = '' } = props;

  // Dimensional sizes with strict aspect ratio preservation
  const sizeClasses = {
    sm: 'w-10 h-10 rounded-xl text-[9px]',
    md: 'w-24 h-24 sm:w-28 sm:h-28 aspect-square rounded-2xl text-[10px]',
    lg: 'w-48 h-48 sm:w-56 sm:h-56 xl:w-60 xl:h-60 aspect-square rounded-3xl text-xs',
    xl: 'w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 aspect-square rounded-3xl text-sm'
  }[size];

  // Dynamic values depending on type
  const isQuran = type === 'quran';

  const surahMeta = useMemo(() => {
    if (!isQuran) return null;
    const num = props.surahNumber || 1;
    return SURAH_LIST.find((s) => s.number === num) || {
      number: num,
      name: props.surahNameArabic || 'سورة مباركة',
      transliteration: props.surahNameEnglish || `Surah ${num}`,
      translation: 'The Holy Quran',
      totalVerses: props.ayahCount || 7,
      type: props.revelationType || 'Meccan'
    };
  }, [isQuran, props]);

  const palette = useMemo(() => {
    if (isQuran) {
      return getSurahPalette(props.surahNumber || 1, surahMeta?.type);
    }
    return getMafatihPalette(props.itemId, props.title, props.category);
  }, [isQuran, props, surahMeta]);

  // Titles for display
  const arabicText = isQuran 
    ? (surahMeta?.name || 'القرآن الكريم') 
    : (props.arabicTitle || getMafatihArabicTitle(props.itemId, props.title, props.category));
  const englishTitle = isQuran 
    ? (surahMeta?.transliteration || `Surah ${props.surahNumber}`) 
    : getMafatihEnglishTitle(props.itemId, props.title);
  const subtitle = isQuran ? `${surahMeta?.totalVerses} Ayahs • ${surahMeta?.type}` : (props.category || 'Supplication');
  const numberBadge = isQuran ? `№ ${String(props.surahNumber).padStart(3, '0')}` : 'مَفَاتِيحُ';

  // Fluid font size for central Arabic calligraphy based on text length to prevent clipping
  const arabicFontSize = useMemo(() => {
    const len = (arabicText || '').length;
    if (size === 'md') {
      return len > 22 ? '13px' : len > 14 ? '15px' : '17px';
    }
    if (size === 'lg') {
      return len > 26 ? '18px' : len > 18 ? '21px' : len > 12 ? '24px' : '28px';
    }
    return len > 26 ? '22px' : len > 18 ? '26px' : '32px';
  }, [arabicText, size]);

  // -------------------------------------------------------------
  // DEDICATED CRISP MICRO-THUMBNAIL (For player bars and mini widgets)
  // -------------------------------------------------------------
  if (size === 'sm') {
    return (
      <div
        className={`relative select-none overflow-hidden shrink-0 flex items-center justify-center shadow-md rounded-xl transition-all duration-300 gpu-layer border bg-gradient-to-br ${palette.bgGradient} ${palette.borderHalo} ${className || 'w-10 h-10'}`}
        style={{
          boxShadow: isPlaying
            ? `0 0 14px ${palette.primaryGlow}`
            : '0 3px 8px rgba(0,0,0,0.45)'
        }}
      >
        {/* Subtle radial sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />

        {/* Outer illuminated geometric ring with smooth rotation */}
        <svg
          className={`absolute inset-0 w-full h-full pointer-events-none ${isPlaying ? 'animate-spin-slow' : ''}`}
          viewBox="0 0 40 40"
          fill="none"
          style={{ animationDuration: '28s', transformOrigin: 'center center' }}
        >
          <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2 2" className="text-white/25" />
          <circle cx="20" cy="20" r="14" stroke={palette.accentGold} strokeWidth="0.5" strokeOpacity="0.4" />
        </svg>

        {/* Central emblem */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-0.5 leading-none">
          <span
            dir="rtl"
            lang="ar"
            className="font-arabic font-bold text-white leading-none select-none drop-shadow-sm"
            style={{
              fontFamily: getArabicFontFamily('amiri'),
              fontSize: isQuran ? (String(props.surahNumber || 1).length > 2 ? '11px' : '13px') : '11px',
              textShadow: `0 0 8px ${palette.accentGold}, 0 1px 2px rgba(0,0,0,0.9)`
            }}
          >
            {isQuran ? (props.surahNumber || 1) : (arabicText?.slice(0, 6) || 'دعاء')}
          </span>
          <span className="text-[7px] font-mono font-bold tracking-tight text-emerald-200/90 uppercase leading-none mt-0.5">
            {isQuran ? 'سورة' : 'مفاتیح'}
          </span>
        </div>

        {isPlaying && (
          <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // FULL / SIDEBAR GRAND SACRED ARTWORK
  // -------------------------------------------------------------
  const isCompact = size === 'md';

  return (
    <div
      className={`relative select-none overflow-hidden flex flex-col justify-between p-3.5 sm:p-5 shadow-2xl transition-all duration-300 gpu-layer border bg-gradient-to-br ${palette.bgGradient} ${palette.borderHalo} ${sizeClasses} ${className}`}
      style={{
        boxShadow: isPlaying
          ? `0 20px 45px -10px ${palette.primaryGlow}, 0 0 25px ${palette.secondaryGlow}`
          : '0 16px 36px -12px rgba(0,0,0,0.65)'
      }}
    >
      {/* Dynamic Ambient Background Glows */}
      <div
        className="absolute -top-1/4 -right-1/4 w-3/4 h-3/4 rounded-full blur-2xl pointer-events-none transition-transform duration-700"
        style={{
          backgroundColor: palette.primaryGlow,
          transform: isPlaying ? 'scale(1.2)' : 'scale(1)'
        }}
      />
      <div
        className="absolute -bottom-1/4 -left-1/4 w-3/4 h-3/4 rounded-full blur-2xl pointer-events-none transition-transform duration-700"
        style={{
          backgroundColor: palette.secondaryGlow,
          transform: isPlaying ? 'scale(1.15)' : 'scale(1)'
        }}
      />

      {/* Vinyl / CD Luster Arc Highlight */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/8 to-white/18 pointer-events-none rounded-3xl" />
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      {/* Outer Illuminated Geometric Border Ring */}
      <svg
        className={`absolute inset-0 w-full h-full pointer-events-none ${isPlaying ? 'animate-spin-slow' : ''}`}
        viewBox="0 0 200 200"
        fill="none"
        style={{ animationDuration: '36s', transformOrigin: 'center center' }}
      >
        <circle cx="100" cy="100" r="94" stroke="currentColor" strokeWidth="0.7" strokeDasharray="3 3" className="text-white/20" />
        <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="0.5" className="text-white/15" />
        <circle cx="100" cy="100" r="76" stroke="currentColor" strokeWidth="0.4" strokeDasharray="2 4" className="text-white/10" />
      </svg>

      {/* Top Header: Badge & Number */}
      <div className="relative z-10 flex items-center justify-between w-full gap-2">
        <span className="font-mono font-bold tracking-widest text-[9px] sm:text-[11px] px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/90 shadow-xs uppercase">
          {numberBadge}
        </span>

        {!isCompact && (
          <span className="text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/80 truncate max-w-[150px]">
            {palette.archetypeBadge}
          </span>
        )}
      </div>

      {/* Center: Grand Calligraphic Shamsa / Medallion */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center my-1">
        {/* Animated Sacred Rosette Medallion */}
        <div className="relative flex items-center justify-center">
          {/* Subtle spinning star rays when playing */}
          <svg
            className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 transition-all duration-500 ${
              isPlaying ? 'animate-spin-slow scale-105' : 'scale-100 opacity-90'
            }`}
            viewBox="0 0 120 120"
            fill="none"
            style={{ animationDuration: '48s', transformOrigin: 'center center' }}
          >
            {/* 8-Point Rub el Hizb Star Polygon */}
            <polygon
              points="60,6 74,38 108,38 82,60 94,92 60,74 26,92 38,60 12,38 46,38"
              stroke={palette.accentGold}
              strokeWidth="1.2"
              fill="rgba(0,0,0,0.25)"
              className="drop-shadow-md"
            />
            {/* Rotated 45 deg secondary star */}
            <polygon
              points="60,6 74,38 108,38 82,60 94,92 60,74 26,92 38,60 12,38 46,38"
              stroke={palette.starColor}
              strokeWidth="0.8"
              strokeDasharray="2 2"
              fill="none"
              transform="rotate(45 60 60)"
            />
            <circle cx="60" cy="60" r="32" stroke={palette.accentGold} strokeWidth="1" strokeDasharray="4 2" />
            <circle cx="60" cy="60" r="28" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          </svg>

          {/* Central Calligraphic Typography */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
            <span
              dir="rtl"
              lang="ar"
              className="font-arabic font-normal leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] tracking-wide max-w-[90%] break-words"
              style={{
                fontFamily: getArabicFontFamily('amiri'),
                fontSize: arabicFontSize,
                color: '#ffffff',
                textShadow: `0 0 16px ${palette.accentGold}, 0 2px 4px rgba(0,0,0,0.9)`
              }}
            >
              {arabicText}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Footer: English Title, Translation & Subtitle */}
      <div className="relative z-10 w-full flex flex-col items-center text-center">
        <h3 className="font-bold text-white drop-shadow-md text-xs sm:text-sm md:text-base leading-tight tracking-wide truncate max-w-full">
          {englishTitle}
        </h3>
        {!isCompact && (
          <p className="text-[10px] sm:text-[11px] text-white/75 font-medium tracking-tight mt-0.5 truncate max-w-full">
            {subtitle}
          </p>
        )}

        {/* Dynamic Playing Waveform / Equalizer Indicator */}
        {isPlaying && (
          <div className="flex items-center gap-1 mt-2">
            <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-5 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-2.5 bg-teal-300 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            <span className="w-1 h-4.5 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
            <span className="w-1 h-2 bg-amber-300 rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
          </div>
        )}
      </div>
    </div>
  );
};
