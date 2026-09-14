import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ChevronLeft, ChevronRight, Pause, Play, Copy, Check, BookOpen, Star } from 'lucide-react';
import { useSettingsStore } from '../store';
import { hapticImpact } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';

export interface BannerItem {
  id: string;
  type: 'quran' | 'hadith';
  category: string;
  topic: string;
  title: string;
  arabic: string;
  translation: string;
  citation: string;
  context: string;
  surahId?: number;
  ayahNumber?: number;
  watermarkCalligraphy?: string;
}

const BANNERS: BannerItem[] = [
  {
    id: "tatheer",
    type: "quran",
    category: "AHL AL-BAYT IN QUR'AN",
    topic: "Divine Infallibility (Ismah)",
    title: "Verse of Purification (Ayah al-Tat'heer)",
    arabic: "إِنَّمَا يُرِيدُ ٱللَّهُ لِيُذْهِبَ عَنكُمُ ٱلرِّجْسَ أَهْلَ ٱلْبَيْتِ وَيُطَهِّرَكُمْ تَطْهِيرًۭا",
    translation: "Allah intends only to remove all impurity from you, O People of the Household, and to purify you with a thorough purification.",
    citation: "Quran 33:33 (Surah Al-Ahzab)",
    context: "Revealed under the Cloak (Hadith al-Kisa) purifying the Panjatan Pak.",
    surahId: 33,
    ayahNumber: 33,
    watermarkCalligraphy: "أَهْلَ ٱلْبَيْتِ وَيُطَهِّرَكُمْ",
  },
  {
    id: "thaqalayn",
    type: "hadith",
    category: "PROPHETIC TESTAMENT",
    topic: "Quran & Ahl al-Bayt Unity",
    title: "Hadith al-Thaqalayn (The Two Weighty Things)",
    arabic: "إِنِّي تَارِكٌ فِيكُمْ الثَّقَلَيْنِ كِتَابَ اللَّهِ وَعِتْرَتِي أَهْلَ بَيْتِي",
    translation: "Indeed, I am leaving among you two weighty things: the Book of Allah and my progeny, my Ahl al-Bayt; they shall never separate until they meet me at the Pool.",
    citation: "Sahih Muslim 2408",
    context: "Delivered at Ghadir Khumm affirming eternal dual guidance.",
    watermarkCalligraphy: "كِتَابَ اللَّهِ وَعِتْرَتِي",
  },
  {
    id: "wilayah",
    type: "quran",
    category: "IMAMATE & WILAYAH",
    topic: "Spiritual Leadership & Charity",
    title: "Verse of Wilayah (Giving in Ruku)",
    arabic: "إِنَّمَا وَلِيُّكُمُ ٱللَّهُ وَرَسُولُهُۥ وَٱلَّذِينَ ءَامَنُوا۟ ٱلَّذِينَ يُقِيمُونَ ٱلصَّلَوٰةَ وَيُؤْتُونَ ٱلزَّكَوٰةَ وَهُمْ رَٰكِعُونَ",
    translation: "Only Allah is your Guardian, and His Messenger, and those who believe—those who establish prayer and give zakah while bowing.",
    citation: "Quran 5:55 (Surah Al-Ma'idah)",
    context: "Revealed when Imam Ali (a.s.) gave his ring to a beggar in Ruku.",
    surahId: 5,
    ayahNumber: 55,
    watermarkCalligraphy: "إِنَّمَا وَلِيُّكُمُ ٱللَّهُ وَرَسُولُهُۥ",
  },
  {
    id: "tabligh",
    type: "quran",
    category: "DIVINE COMMISSION",
    topic: "Completion of Islam",
    title: "Verse of Proclamation (Ayah al-Tabligh)",
    arabic: "يَـٰٓأَيُّهَا ٱلرَّسُولُ بَلِّغْ مَآ أُنزِلَ إِلَيْكَ مِن رَّبِّكَ ۖ وَإِن لَّمْ تَفْعَلْ فَمَا بَلَّغْتَ رِسَالَتَهُۥ",
    translation: "O Messenger, proclaim that which has been revealed to you from your Lord; and if you do not, you have not conveyed His message.",
    citation: "Quran 5:67 (Surah Al-Ma'idah)",
    context: "Preceded the appointment of Imam Ali (a.s.) at Ghadir Khumm.",
    surahId: 5,
    ayahNumber: 67,
    watermarkCalligraphy: "يَـٰٓأَيُّهَا ٱلرَّسُولُ بَلِّغْ",
  },
  {
    id: "safina",
    type: "hadith",
    category: "PATH OF SALVATION",
    topic: "Ark of Deliverance",
    title: "Hadith of the Ark (Safina)",
    arabic: "مَثَلُ أَهْلِ بَيْتِي فِيكُمْ كَمَثَلِ سَفِينَةِ نُوحٍ، مَنْ رَكِبَهَا نَجَا، وَمَنْ تَخَلَّفَ عَنْهَا غَرِقَ",
    translation: "The likeness of my Ahl al-Bayt among you is that of Noah's Ark: whoever boards it is saved, and whoever stays behind drowns.",
    citation: "Al-Mustadrak al-Hakim 3312",
    context: "Certified sanctuary of steadfast faith through trials.",
    watermarkCalligraphy: "سَفِينَةِ نُوحٍ مَنْ رَكِبَهَا نَجَا",
  },
  {
    id: "mawaddah",
    type: "quran",
    category: "SPIRITUAL DEVOTION",
    topic: "Reward of Prophethood",
    title: "Verse of Affection (Ayah al-Mawaddah)",
    arabic: "قُل لَّآ أَسْـَٔلُكُمْ عَلَيْهِ أَجْرًا إِلَّا ٱلْمَوَدَّةَ فِى ٱلْقُرْبَىٰ",
    translation: "Say, [O Muhammad]: 'I do not ask you for it any reward except affection for [my] near relatives.'",
    citation: "Quran 42:23 (Surah Ash-Shura)",
    context: "Commanding deep love and allegiance toward the Prophet's family.",
    surahId: 42,
    ayahNumber: 23,
    watermarkCalligraphy: "إِلَّا ٱلْمَوَدَّةَ فِى ٱلْقُرْبَىٰ",
  },
  {
    id: "qirtas",
    type: "hadith",
    category: "FINAL COUNSEL",
    topic: "Protection from Deviation",
    title: "The Written Guidance (Hadith al-Qirtas)",
    arabic: "ائْتُونِي بِكِتَابٍ أَكْتُبْ لَكُمْ كِتَابًا لَنْ تَضِلُّوا بَعْدَهُ أَبَدًا",
    translation: "Bring for me writing material that I may write for you a testament after which you shall never go astray.",
    citation: "Sahih al-Bukhari 114",
    context: "The Holy Prophet's final safeguarding of the Ummah's unity.",
    watermarkCalligraphy: "كِتَابًا لَنْ تَضِلُّوا بَعْدَهُ",
  },
];

interface DynamicBannerProps {
  onSelectSurah?: (surahId: number, targetAyah?: number) => void;
}

export default function DynamicBanner({ onSelectSurah }: DynamicBannerProps = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const { arabicFont } = useSettingsStore();

  useEffect(() => {
    if (isPaused || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
    }, 9500);
    return () => clearInterval(interval);
  }, [isPaused, isHovered]);

  const current = BANNERS[currentIndex];
  const isQuranVerse = current.type === 'quran';

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticImpact(ImpactStyle.Light);
    setCurrentIndex((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticImpact(ImpactStyle.Light);
    setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
  };

  const handleTogglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticImpact(ImpactStyle.Light);
    setIsPaused((prev) => !prev);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticImpact(ImpactStyle.Light);
    const textToCopy = `${current.title}\n\n${current.arabic}\n\n"${current.translation}"\n\n— ${current.citation} (${current.context})`;
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleNavigateToSurah = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (current.surahId && onSelectSurah) {
      hapticImpact(ImpactStyle.Light);
      onSelectSurah(current.surahId, current.ayahNumber);
    }
  };

  return (
    <div 
      id="compact-dynamic-banner"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="mb-6 relative rounded-[2.5rem] sm:rounded-[3.25rem] overflow-hidden border border-[#e2ba52]/40 shadow-[0_16px_50px_-10px_rgba(14,61,50,0.45)] bg-gradient-to-br from-[#165a4c] via-[#11463a] to-[#0c362c] p-3.5 sm:p-5 md:p-6 transition-all ring-1 ring-slate-100/20"
    >
      {/* ========================================================================= */}
      {/* 1. TACTILE TOUGH TEXTURE (Crushed parchment / Moroccan leather stipple) */}
      {/* ========================================================================= */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.20] mix-blend-overlay select-none" aria-hidden="true">
        <filter id="toughCanvasTexture">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#toughCanvasTexture)" />
      </svg>

      {/* ========================================================================= */}
      {/* 2. ASTRONOMICAL CELESTIAL AURORA & STARFIELD (Nebulae, Twinkles, Starlight) */}
      {/* ========================================================================= */}
      {/* Cosmic Nebula Cloud Glows */}
      <div className="absolute -top-12 -right-8 w-80 h-80 rounded-full bg-gradient-to-br from-amber-300/15 via-emerald-400/15 to-transparent blur-3xl pointer-events-none mix-blend-screen" />
      <div className="absolute -bottom-16 -left-12 w-96 h-96 rounded-full bg-gradient-to-tr from-slate-100/15 via-emerald-300/10 to-transparent blur-3xl pointer-events-none mix-blend-screen" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Astronomical Starlight Constellations */}
      <div className="absolute top-4 left-1/4 w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_10px_#fef08a] opacity-90 animate-pulse pointer-events-none" />
      <div className="absolute top-12 right-1/4 w-1 h-1 rounded-full bg-white shadow-[0_0_8px_#ffffff] opacity-80 pointer-events-none" />
      <div className="absolute bottom-6 left-1/5 w-1 h-1 rounded-full bg-amber-300 shadow-[0_0_6px_#fef08a] opacity-70 pointer-events-none" />
      <div className="absolute bottom-10 right-1/3 w-1.5 h-1.5 rounded-full bg-slate-100 shadow-[0_0_8px_#e2e8f0] opacity-80 animate-pulse pointer-events-none" />
      <div className="absolute top-1/2 left-8 w-1 h-1 rounded-full bg-amber-200/80 shadow-[0_0_6px_#fde047] pointer-events-none" />
      <div className="absolute top-8 right-12 w-2 h-2 rounded-full bg-amber-400/20 blur-sm pointer-events-none" />

      {/* ========================================================================= */}
      {/* 3. MAGICAL ARABIC CALLIGRAPHIC CURVES (Indistinguishable from Words)      */}
      {/* ========================================================================= */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none" 
        viewBox="0 0 900 320" 
        preserveAspectRatio="none" 
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="celestialArabicGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fffbeb" stopOpacity="0" />
            <stop offset="20%" stopColor="#fef08a" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#e2ba52" stopOpacity="0.75" />
            <stop offset="80%" stopColor="#f1f5f9" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="celestialArabicSilver" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="25%" stopColor="#f8fafc" stopOpacity="0.45" />
            <stop offset="65%" stopColor="#cbd5e1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#e2ba52" stopOpacity="0" />
          </linearGradient>

          <filter id="celestialAuraGlow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sweeping Diwani / Thuluth Ribbon Kashidas (Undulating Calligraphic Loops) */}
        <path 
          d="M -40,190 C 130,270 260,140 430,220 C 600,290 730,130 960,180" 
          stroke="url(#celestialArabicGold)" 
          strokeWidth="2.2" 
          strokeLinecap="round"
          filter="url(#celestialAuraGlow)"
        />
        <path 
          d="M -20,196 C 150,276 280,146 450,226 C 620,296 750,136 980,186" 
          stroke="url(#celestialArabicGold)" 
          strokeWidth="0.8" 
          strokeDasharray="8,6" 
          opacity="0.65" 
        />

        {/* Grand Descending Calligraphic Loop (Resembling divine Waw / Yaa / Noon swoops) */}
        <path 
          d="M 140,-25 C 210,85 170,195 260,215 C 350,235 440,105 540,65 C 640,25 780,135 940,35" 
          stroke="url(#celestialArabicSilver)" 
          strokeWidth="2.8" 
          strokeLinecap="round" 
          opacity="0.45" 
        />

        {/* Sweeping Arabesque Crown Ribbon (Resembling celestial Bismillah flourish) */}
        <path 
          d="M 280,25 C 380,5 480,90 600,55 C 720,20 800,145 950,95" 
          stroke="url(#celestialArabicGold)" 
          strokeWidth="1.6" 
          strokeLinecap="round" 
          opacity="0.55"
        />

        {/* Lower Celestial Tail swooping across the bottom */}
        <path 
          d="M 60,75 Q 180,265 400,165 T 760,135" 
          stroke="url(#celestialArabicGold)" 
          strokeWidth="1.4" 
          strokeLinecap="round" 
          opacity="0.35" 
        />
        <path 
          d="M 210,285 C 360,305 520,205 670,225 S 860,295 940,255" 
          stroke="url(#celestialArabicSilver)" 
          strokeWidth="1.2" 
          strokeLinecap="round" 
          opacity="0.5" 
        />

        {/* Floating Calligraphic Diacritics (Celestial Crescent, Shaddah, and Starlight Nuqtas) */}
        <path d="M 690,80 C 706,68 728,74 734,90 C 728,84 706,84 690,80 Z" fill="#fef08a" opacity="0.65" filter="url(#celestialAuraGlow)" />
        <path d="M 230,125 C 240,118 252,122 258,134 C 252,128 240,128 230,125 Z" fill="#f8fafc" opacity="0.5" />
        <circle cx="722" cy="62" r="2.2" fill="#fef08a" opacity="0.85" filter="url(#celestialAuraGlow)" />
        <circle cx="738" cy="56" r="1.6" fill="#ffffff" opacity="0.75" />
        <circle cx="270" cy="115" r="1.8" fill="#e2e8f0" opacity="0.6" />
      </svg>

      {/* Sweeping Translucent Quranic Calligraphy Layer in the deep background */}
      <div 
        aria-hidden="true"
        dir="rtl"
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-full max-w-3xl text-center select-none pointer-events-none font-arabic opacity-[0.14] whitespace-nowrap overflow-hidden tracking-widest text-3xl sm:text-4xl md:text-5xl"
        style={{
          fontFamily: "'Amiri', 'Lateef', serif",
          background: "linear-gradient(90deg, rgba(226,186,82,0) 0%, rgba(254,240,138,0.85) 30%, rgba(248,250,252,0.95) 50%, rgba(226,186,82,0.85) 70%, rgba(226,186,82,0) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ ۞ وَٱلْقُرْءَانِ ٱلْحَكِيمِ
      </div>

      {/* Dynamic Watermark Calligraphy of Current Verse floating astronomically */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`astrowatermark-${current.id}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.7 }}
          aria-hidden="true"
          dir="rtl"
          className="absolute -right-6 -bottom-8 md:right-6 md:-bottom-5 select-none pointer-events-none font-arabic opacity-[0.12] text-6xl sm:text-8xl md:text-9xl leading-none whitespace-nowrap z-0"
          style={{
            fontFamily: arabicFont ? `'${arabicFont}', 'Amiri', serif` : "'Amiri', serif",
            background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(253,224,71,0.8) 45%, rgba(148,163,184,0) 85%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {current.watermarkCalligraphy || current.title}
        </motion.div>
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* FOREGROUND: CELESTIAL CONTROLS & CURVING CAPSULE BADGES                   */}
      {/* ========================================================================= */}

      {/* Top Header Bar: Organic Curving Pills & Micro-Navigation */}
      <div className="relative z-10 flex items-center justify-between gap-2 pb-2.5 border-b border-amber-300/20">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {/* Dynamic Distinction Pill: Holy Quran vs Prophetic Hadith */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(226,186,82,0.2)] border ${
            isQuranVerse
              ? 'bg-gradient-to-r from-amber-400/25 via-amber-300/15 to-emerald-400/10 border-amber-300/50 text-amber-200'
              : 'bg-gradient-to-r from-slate-200/20 via-amber-400/15 to-emerald-400/10 border-slate-200/40 text-slate-100'
          }`}>
            <Sparkles size={11} className={isQuranVerse ? "text-amber-300" : "text-slate-200"} />
            <span className="font-bold">{isQuranVerse ? "Holy Qur'an" : "Sacred Hadith"}</span>
            <span className="opacity-40">|</span>
            <span className="truncate opacity-90">{current.category}</span>
          </span>

          {/* Lush Silver Topic Capsule */}
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-200/80 font-medium truncate">
            <span className="text-amber-300/40">&bull;</span>
            <span className="bg-gradient-to-r from-slate-100 to-amber-200 bg-clip-text text-transparent">{current.topic}</span>
          </span>
        </div>

        {/* Curving Capsule Carousel Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Slide counter pill */}
          <span className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/25 border border-slate-100/15 text-slate-200">
            <span className="text-amber-300 font-semibold">{currentIndex + 1}</span>
            <span className="text-slate-400 mx-0.5">/</span>
            <span className="text-slate-300">{BANNERS.length}</span>
          </span>

          {/* Copy Button */}
          <button
            id="banner-copy-btn"
            type="button"
            onClick={handleCopy}
            className={`p-1.5 sm:p-2 rounded-full border transition-all ${
              copied 
                ? 'bg-emerald-400/35 border-emerald-300 text-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.5)]' 
                : 'bg-black/30 hover:bg-black/50 border-amber-300/30 hover:border-amber-300 text-slate-200 hover:text-amber-200 shadow-sm'
            }`}
            title={copied ? "Copied to clipboard!" : "Copy reflection & citation"}
            aria-label="Copy reflection"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>

          {/* Pause / Resume Button */}
          <button
            id="banner-pause-toggle-btn"
            type="button"
            onClick={handleTogglePause}
            className={`p-1.5 sm:p-2 rounded-full border transition-all ${
              isPaused 
                ? 'bg-amber-400/25 border-amber-300 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.35)]' 
                : 'bg-black/30 hover:bg-black/50 border-amber-300/30 hover:border-amber-300 text-slate-200 hover:text-amber-200 shadow-sm'
            }`}
            title={isPaused ? "Resume rotation" : "Pause rotation"}
            aria-label={isPaused ? "Resume rotation" : "Pause rotation"}
          >
            {isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
          </button>

          {/* Previous / Next Slide Capsule Controls */}
          <div className="flex items-center ml-0.5 rounded-full border border-amber-300/30 bg-black/30 overflow-hidden shadow-sm">
            <button
              id="banner-prev-btn"
              type="button"
              onClick={handlePrev}
              className="p-1.5 sm:p-2 text-slate-200 hover:text-amber-200 hover:bg-white/10 transition-colors"
              title="Previous reflection"
              aria-label="Previous reflection"
            >
              <ChevronLeft size={13} />
            </button>
            <div className="w-[1px] h-3 bg-amber-400/30" />
            <button
              id="banner-next-btn"
              type="button"
              onClick={handleNext}
              className="p-1.5 sm:p-2 text-slate-200 hover:text-amber-200 hover:bg-white/10 transition-colors"
              title="Next reflection"
              aria-label="Next reflection"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`banner-slide-${current.id}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative z-10 pt-3 sm:pt-4 flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
        >
          {/* ========================================================================= */}
          {/* LEFT COLUMN: TITLE, TRANSLATION, CONTEXT, DIRECT ACTIONS                  */}
          {/* ========================================================================= */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-baseline gap-2 mb-1.5">
                <h3 className="text-xs sm:text-sm font-serif font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-300 drop-shadow-sm">
                  {current.title}
                </h3>
              </div>

              {/* English Translation */}
              <p className="text-xs sm:text-[13px] text-slate-100 font-serif italic leading-relaxed line-clamp-3 mb-2.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                "{current.translation}"
              </p>
            </div>

            {/* Context Snippet & Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Citation badge */}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-black/35 border border-slate-100/25 text-[10px] sm:text-[11px] font-medium text-slate-100 shadow-sm">
                {current.citation}
              </span>

              {/* Context illumination */}
              {current.context && (
                <span className="text-[10px] sm:text-[11px] text-amber-200/90 italic line-clamp-1">
                  &bull; {current.context}
                </span>
              )}

              {/* Direct 'Read in Surah' Action Link */}
              {current.surahId && onSelectSurah && (
                <button
                  id={`banner-read-surah-${current.surahId}`}
                  type="button"
                  onClick={handleNavigateToSurah}
                  className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-400/30 via-amber-400/20 to-emerald-400/30 hover:from-emerald-400/40 hover:to-amber-400/30 border border-amber-300/50 text-[10px] sm:text-[11px] font-bold text-amber-100 hover:text-white transition-all active:scale-95 shadow-[0_0_14px_rgba(226,186,82,0.25)]"
                  title={`Open Surah ${current.surahId}:${current.ayahNumber} in Quran Reader`}
                >
                  <BookOpen size={11} className="text-amber-300" />
                  <span>Read Verse</span>
                </button>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: GRAND ASTRONOMICAL CALLIGRAPHY                              */}
          {/* (Quranic words are produced substantially larger than Hadith)             */}
          {/* ========================================================================= */}
          <div className="md:w-[46%] shrink-0">
            <div className={`relative rounded-[2rem] sm:rounded-[2.5rem] border ${
              isQuranVerse 
                ? 'border-amber-300/40 ring-1 ring-slate-100/30 bg-gradient-to-br from-[#1b6b5a]/80 via-[#135244]/85 to-[#0e3d32]/90 shadow-[inset_0_2px_15px_rgba(254,240,138,0.15)]' 
                : 'border-slate-300/35 ring-1 ring-amber-300/20 bg-gradient-to-br from-[#186253]/75 via-[#124d40]/80 to-[#0d3b31]/85 shadow-[inset_0_2px_15px_rgba(226,232,240,0.12)]'
            } backdrop-blur-md p-3.5 sm:p-4 md:p-5 flex flex-col justify-center items-center text-center overflow-hidden transition-all`}>
              
              {/* Subtle background Islamic crescent glyph */}
              <div 
                aria-hidden="true" 
                className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08] select-none text-8xl font-arabic text-slate-100"
              >
                {isQuranVerse ? "۞" : "﷽"}
              </div>

              {/* Classification Label */}
              <div className="relative z-10 mb-1 flex items-center gap-1 opacity-75">
                <Star size={9} className="text-amber-300" fill="currentColor" />
                <span className="text-[9px] sm:text-[10px] font-arabic tracking-widest uppercase text-amber-200 font-semibold">
                  {isQuranVerse ? "آيَةٌ مُحْكَمَةٌ • QURANIC SCRIPTURE" : "حَدِيثٌ شَرِيفٌ • PROPHETIC TRADITION"}
                </span>
                <Star size={9} className="text-amber-300" fill="currentColor" />
              </div>

              {/* 
                PRODUCED ARABIC CALLIGRAPHY:
                Quranic words are rendered significantly larger than Hadith words!
              */}
              <p 
                dir="rtl" 
                className={`relative z-10 font-arabic font-medium leading-[2.1] text-center transition-all ${
                  isQuranVerse
                    ? 'text-xl sm:text-2xl md:text-3xl lg:text-[32px] tracking-wide drop-shadow-[0_4px_16px_rgba(253,224,71,0.35)]'
                    : 'text-base sm:text-lg md:text-xl lg:text-[22px] tracking-normal drop-shadow-[0_3px_12px_rgba(226,232,240,0.25)]'
                }`}
                style={{ 
                  fontFamily: arabicFont ? `'${arabicFont}', 'Amiri', serif` : "'Amiri', serif",
                  background: isQuranVerse
                    ? "linear-gradient(180deg, #ffffff 0%, #fef08a 35%, #e2ba52 70%, #ffffff 100%)"
                    : "linear-gradient(180deg, #ffffff 0%, #f1f5f9 45%, #cbd5e1 80%, #fef08a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {current.arabic}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* CELESTIAL TIMELINE PROGRESS INDICATOR                                     */}
      {/* ========================================================================= */}
      <div className="relative z-10 mt-3 sm:mt-4 pt-2.5 border-t border-amber-300/15 flex items-center justify-between">
        <div className="flex gap-2 items-center">
          {BANNERS.map((b, idx) => (
            <button
              key={`indicator-${b.id}`}
              type="button"
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex 
                  ? 'w-7 bg-gradient-to-r from-amber-300 via-white to-amber-400 shadow-[0_0_10px_rgba(254,240,138,0.6)]' 
                  : 'w-2 bg-slate-200/30 hover:bg-amber-300/60'
              }`}
              aria-label={`Jump to ${b.title}`}
            />
          ))}
        </div>

        <span className="text-[10px] sm:text-[11px] text-slate-200/80 font-serif italic">
          <span className="text-amber-200 font-semibold">{current.topic}</span>
        </span>
      </div>
    </div>
  );
}
