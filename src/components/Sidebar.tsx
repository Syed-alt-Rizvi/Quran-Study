import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Moon, Sun, Type, Bookmark, BookOpen, Headphones, 
  Bell, Sparkles, Check, Trash2, ArrowRight, Clock,
  Flame, Compass, Volume2, Globe, Heart, ShieldCheck,
  Languages, FileEdit, CheckCircle2, User, ChevronDown,
  Gift, Coffee, Code, Mail, Copy, ExternalLink, Sparkle,
  CreditCard, Wallet, Send, Share2, Info, Shield, FileText
} from 'lucide-react';
import { useSettingsStore } from '../store';
import { hapticImpact, hapticSelection } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';
import PrivacyPolicyModal from './PrivacyPolicyModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSurah?: (surahId: number, ayahNumber?: number) => void;
}

type TabCategory = 'all' | 'display' | 'tafseer' | 'audio' | 'bookmarks' | 'reminders' | 'donate' | 'developer';

export default function Sidebar({ isOpen, onClose, onSelectSurah }: SidebarProps) {
  const { 
    isDarkMode, toggleDarkMode, 
    fontSize, setFontSize, 
    arabicFont, setArabicFont,
    englishFont, setEnglishFont,
    showTranslation, toggleShowTranslation,
    translationLanguages, toggleTranslationLanguage,
    tafseerLanguages, toggleTafseerLanguage, 
    tafseerProvider, setTafseerProvider,
    reminderTime, setReminderTime, reminderSound, setReminderSound,
    autoScrollAudio, toggleAutoScrollAudio,
    reciter, setReciter,
    bookmarks, removeBookmark,
    lastRead, habitStats,
    tafseerNotes,
    userName, setUserName
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<TabCategory>('all');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName || '');
  const [isDonationOpen, setIsDonationOpen] = useState(true);
  const [isDevOpen, setIsDevOpen] = useState(true);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [privacyModal, setPrivacyModal] = useState<{
    isOpen: boolean;
    tab: 'privacy' | 'terms' | 'deletion';
  }>({
    isOpen: false,
    tab: 'privacy',
  });

  const upiId = '9906275833@superyes';
  const upiLink = `upi://pay?pa=9906275833@superyes&pn=Syed%20Murtaza%20Razavee&cu=INR&tn=Shia%20Quran%20Support`;

  const reciters = [
    { name: 'Mishary Rashid Alafasy', value: 'ar.alafasy', desc: 'Kuwait • Clear & Melodic' },
    { name: 'Abdul Basit (Murattal)', value: 'ar.abdulbasitmurattal', desc: 'Egypt • Master Reciter' },
    { name: 'Abdur-Rahman as-Sudais', value: 'ar.abdurrahmaansudais', desc: 'Makkah • Reverent Pace' },
    { name: 'Mohamed Siddiq al-Minshawi', value: 'ar.minshawi', desc: 'Egypt • Emotional & Soulful' }
  ];

  const arabicFonts = [
    { id: 'Amiri', name: 'Amiri', desc: 'Traditional Classical Naskh', sample: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ' },
    { id: 'Uthmani', name: 'Uthmani', desc: 'Standard Mushaf Hafs Style', sample: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ' },
    { id: 'IndoPak', name: 'IndoPak', desc: 'Subcontinent Nastaliq Nuances', sample: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
    { id: 'Scheherazade New', name: 'Scheherazade', desc: 'Modern Elegant Calligraphy', sample: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
    { id: 'Lateef', name: 'Lateef', desc: 'Light & Fluid Curves', sample: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' }
  ];

  const uiFonts = [
    { id: 'Inter', name: 'Inter', desc: 'Modern Sans-Serif' },
    { id: 'Playfair Display', name: 'Playfair Display', desc: 'Luxury Serif' },
    { id: 'Lora', name: 'Lora', desc: 'Editorial Book Serif' }
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAyahs = habitStats?.dailyAyahsRead?.[todayStr] || 0;
  const todayTafseer = habitStats?.dailyTafseerRead?.[todayStr] || 0;

  const notesList = Object.entries(tafseerNotes || {}).filter(([_, note]) => note && note.trim().length > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="sidebar-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-md"
          onClick={() => { hapticImpact(ImpactStyle.Light); onClose(); }}
        />
      )}

      {isOpen && (
        <motion.div
          key="sidebar-drawer"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="fixed inset-y-0 right-0 z-[65] w-full max-w-md bg-slate-50 dark:bg-slate-950 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800"
        >
        {/* Top Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                <Compass size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
                  Settings & Library
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Shia Quran & Scholarly Tafseer</p>
              </div>
            </div>

            <button
              onClick={() => { hapticImpact(ImpactStyle.Light); onClose(); }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close settings"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Profile & Greeting Greeting Bar */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 text-xs">
            <div className="flex items-center gap-2 flex-1 mr-2">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                {userName ? userName.charAt(0).toUpperCase() : <User size={12} />}
              </div>
              {isEditingName ? (
                <div className="flex items-center gap-1.5 flex-1">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Enter your name"
                    className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-emerald-500 text-slate-800 dark:text-slate-100 text-xs w-full focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setUserName(tempName.trim());
                      setIsEditingName(false);
                      hapticSelection();
                    }}
                    className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded"
                  >
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => {
                    setTempName(userName || '');
                    setIsEditingName(true);
                  }}
                  className="cursor-pointer group flex items-center gap-1.5"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {userName ? `Salam, ${userName}` : 'Salam, Noble Reader'}
                  </span>
                  <FileEdit size={12} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              <ShieldCheck size={13} />
              <span>Offline Ready</span>
            </div>
          </div>

          {/* Quick Segmented Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-0.5 no-scrollbar">
            {[
              { id: 'all', label: 'Overview' },
              { id: 'display', label: 'Display & Fonts' },
              { id: 'tafseer', label: 'Tafseer' },
              { id: 'audio', label: 'Audio' },
              { id: 'bookmarks', label: `Saved (${bookmarks.length})` },
              { id: 'reminders', label: 'Reminders' },
              { id: 'donate', label: '💖 Support & Sadaqah' },
              { id: 'developer', label: '👨‍💻 About Developer' },
            ].map((tab, tabIdx) => (
              <button
                key={`sidebar-tab-${tab.id}-${tabIdx}`}
                onClick={() => {
                  hapticSelection();
                  setActiveTab(tab.id as TabCategory);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">

          {/* 1. Habit & Resume Reading Overview Card (shown in 'all' or 'bookmarks') */}
          {(activeTab === 'all' || activeTab === 'bookmarks') && (
            <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-900/10 via-emerald-800/5 to-amber-900/10 dark:from-emerald-950/40 dark:via-slate-900 dark:to-amber-950/30 border border-emerald-500/20 dark:border-emerald-800/40 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Flame size={16} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Daily Study Activity
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Today</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-center">
                  <span className="block text-2xl font-bold text-slate-800 dark:text-slate-100">{todayAyahs}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Ayahs Read</span>
                </div>
                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-center">
                  <span className="block text-2xl font-bold text-emerald-600 dark:text-emerald-400">{todayTafseer}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Tafseer Studies</span>
                </div>
              </div>

              {lastRead && (
                <button
                  onClick={() => {
                    hapticSelection();
                    onSelectSurah?.(lastRead.surahId, lastRead.ayahNumber);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} />
                    <span>Resume Last Read: Surah {lastRead.surahId}, Ayah {lastRead.ayahNumber}</span>
                  </div>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          )}

          {/* 2. Appearance & Dark Mode (shown in 'all' or 'display') */}
          {(activeTab === 'all' || activeTab === 'display') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Appearance & Theme
                </span>
              </div>

              {/* Theme Dual Toggle Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    if (isDarkMode) {
                      hapticSelection();
                      toggleDarkMode();
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-center gap-2.5 font-medium text-xs ${
                    !isDarkMode
                      ? 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-200 shadow-sm'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <Sun size={18} className="text-amber-500" />
                  <span>Light Mode</span>
                  {!isDarkMode && <CheckCircle2 size={14} className="text-amber-600 ml-auto" />}
                </button>

                <button
                  onClick={() => {
                    if (!isDarkMode) {
                      hapticSelection();
                      toggleDarkMode();
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-center gap-2.5 font-medium text-xs ${
                    isDarkMode
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-sm'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <Moon size={18} className="text-emerald-400" />
                  <span>Dark Mode</span>
                  {isDarkMode && <CheckCircle2 size={14} className="text-emerald-400 ml-auto" />}
                </button>
              </div>
            </div>
          )}

          {/* 3. Arabic Typography (shown in 'all' or 'display') */}
          {(activeTab === 'all' || activeTab === 'display') && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Arabic Script & Typography
              </span>

              {/* Arabic Font Selection Cards */}
              <div className="space-y-2">
                {arabicFonts.map((font, fIdx) => (
                  <button
                    key={`arabic-font-${font.id}-${fIdx}`}
                    onClick={() => {
                      hapticSelection();
                      setArabicFont(font.id);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      arabicFont === font.id
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-sm'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">{font.name}</span>
                        {arabicFont === font.id && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium">Active</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{font.desc}</p>
                    </div>

                    <div className="text-right pl-3">
                      <p className="text-base text-emerald-700 dark:text-emerald-300" style={{ fontFamily: font.id }}>
                        {font.sample}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Arabic Font Size Slider with Live Responsive Box */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Arabic Text Size</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    {fontSize}px
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400">24px</span>
                  <input
                    type="range"
                    min="24"
                    max="64"
                    step="2"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <span className="text-sm font-bold text-slate-400">64px</span>
                </div>

                {/* Live Preview Container */}
                <div className="pt-2 text-center overflow-x-auto border-t border-slate-100 dark:border-slate-700/50">
                  <p 
                    className="text-emerald-800 dark:text-emerald-200 leading-relaxed py-1"
                    style={{ fontSize: `${fontSize}px`, fontFamily: arabicFont }}
                  >
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                </div>
              </div>

              {/* UI / English Font Selection */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/60 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Languages size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Interface & Translation Font</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {uiFonts.map((f, uiIdx) => (
                    <button
                      key={`ui-font-${f.id}-${uiIdx}`}
                      onClick={() => {
                        hapticSelection();
                        setEnglishFont(f.id);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        englishFont === f.id
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                      style={{ fontFamily: f.id }}
                    >
                      <span className="text-xs block">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. Tafseer & Translation Settings (shown in 'all' or 'tafseer') */}
          {(activeTab === 'all' || activeTab === 'tafseer') && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Tafseer & Scholarly Commentaries
              </span>

              {/* Tafseer Provider Selector Cards */}
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    hapticSelection();
                    setTafseerProvider('namoona');
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    tafseerProvider === 'namoona'
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-sm'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Tafseer-e-Namoona</span>
                        {tafseerProvider === 'namoona' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">Selected</span>
                        )}
                      </div>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">تفسیر نمونہ • جامع و تفصیلی</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        By Grand Ayatollah Naser Makarim Shirazi. Renowned 15-volume contemporary Shia exegesis.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    hapticSelection();
                    setTafseerProvider('kauthar');
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    tafseerProvider === 'kauthar'
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-sm'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Tafseer Al-Kauthar</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                          <Sparkles size={10} />
                          AI Refined
                        </span>
                        {tafseerProvider === 'kauthar' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white ml-auto">Selected</span>
                        )}
                      </div>
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mt-0.5">تفسیر الکوثر • علامہ شیخ محسن علی نجفی</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        By Allama Sheikh Mohsin Ali Najafi. Analytical, contextual Shia commentary with reconstructed Urdu typography.
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Translation Display Toggle */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">Show Verse Translation</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">Display alongside Arabic verses</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { hapticSelection(); toggleShowTranslation(); }}
                    className={`w-11 h-6 rounded-full transition-colors relative ${showTranslation ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${showTranslation ? 'translate-x-6 left-0' : 'translate-x-1 left-0'}`} />
                  </button>
                </div>

                {showTranslation && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50 flex gap-2">
                    <button
                      onClick={() => { hapticSelection(); toggleTranslationLanguage('ur'); }}
                      className={`flex-1 p-2 rounded-xl border text-center text-xs font-medium transition-all ${
                        translationLanguages.includes('ur')
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      اردو ترجمہ (Urdu)
                    </button>
                    <button
                      onClick={() => { hapticSelection(); toggleTranslationLanguage('en'); }}
                      className={`flex-1 p-2 rounded-xl border text-center text-xs font-medium transition-all ${
                        translationLanguages.includes('en')
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      English Translation
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. Audio & Recitation (shown in 'all' or 'audio') */}
          {(activeTab === 'all' || activeTab === 'audio') && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Audio Recitation & Sync
              </span>

              {/* Reciter List */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/60 space-y-3">
                <div className="flex items-center gap-2">
                  <Headphones size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Featured Qari / Reciter</span>
                </div>

                <div className="space-y-2">
                  {reciters.map((r, rIdx) => (
                    <button
                      key={`reciter-${r.value}-${rIdx}`}
                      onClick={() => {
                        hapticSelection();
                        setReciter(r.value);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        reciter === r.value
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <span className="text-xs block">{r.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{r.desc}</span>
                      </div>
                      {reciter === r.value && <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Follow Recitation Switch */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/60">
                <div className="flex items-center gap-3">
                  <Volume2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">Follow Recitation</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">Auto-scroll viewport to active verse</span>
                  </div>
                </div>
                <button
                  onClick={() => { hapticSelection(); toggleAutoScrollAudio(); }}
                  className={`w-11 h-6 rounded-full transition-colors relative ${autoScrollAudio ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${autoScrollAudio ? 'translate-x-6 left-0' : 'translate-x-1 left-0'}`} />
                </button>
              </div>
            </div>
          )}

          {/* 6. Daily Reminders & Habit (shown in 'all' or 'reminders') */}
          {(activeTab === 'all' || activeTab === 'reminders') && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Daily Quran Reminder
              </span>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/60 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">Daily Reading Alert</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {reminderTime ? `Scheduled daily for ${reminderTime}` : 'Not set'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      hapticSelection();
                      if (reminderTime) {
                        setReminderTime(null);
                      } else {
                        setReminderTime('06:00');
                      }
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative ${reminderTime ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${reminderTime ? 'translate-x-6 left-0' : 'translate-x-1 left-0'}`} />
                  </button>
                </div>

                {reminderTime && (
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-slate-400" />
                      <input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => {
                          setReminderTime(e.target.value);
                          hapticSelection();
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: 'Fajr', time: '05:30' },
                        { label: 'Dhuhr', time: '13:00' },
                        { label: 'Maghrib', time: '19:00' },
                        { label: 'Isha', time: '21:30' }
                      ].map((preset, pIdx) => (
                        <button
                          key={`reminder-preset-${preset.label}-${pIdx}`}
                          onClick={() => {
                            setReminderTime(preset.time);
                            hapticSelection();
                          }}
                          className={`p-1.5 rounded-lg text-[11px] font-medium transition-all ${
                            reminderTime === preset.time
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 7. Bookmarks & Saved Notes Manager (shown in 'all' or 'bookmarks') */}
          {(activeTab === 'all' || activeTab === 'bookmarks') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Bookmarks ({bookmarks.length})
                </span>
              </div>

              {bookmarks.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {bookmarks.map((b, bIdx) => (
                    <div
                      key={`bookmark-${b.surahId}-${b.ayahNumber}-${bIdx}`}
                      className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/60 hover:border-emerald-500/50 transition-all group"
                    >
                      <button
                        onClick={() => {
                          hapticSelection();
                          onSelectSurah?.(b.surahId, b.ayahNumber);
                          onClose();
                        }}
                        className="flex items-center gap-2.5 text-left flex-1 mr-2"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                          {b.surahId}
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            Surah {b.surahId}, Ayah {b.ayahNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 block">Tap to open directly</span>
                        </div>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          hapticImpact(ImpactStyle.Light);
                          removeBookmark(b.surahId, b.ayahNumber);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Remove bookmark"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                  <Bookmark size={24} className="mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No bookmarked Ayahs yet</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Tap the bookmark icon next to any verse while reading to save it here.</p>
                </div>
              )}

              {/* Saved Tafseer Notes */}
              {notesList.length > 0 && (
                <div className="pt-2 space-y-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Personal Tafseer Notes ({notesList.length})
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {notesList.map(([key, note], noteIdx) => {
                      const parts = key.split('_');
                      const sId = parseInt(parts[0], 10);
                      const aId = parseInt(parts[1], 10);
                      return (
                        <div
                          key={`note-item-${key}-${noteIdx}`}
                          onClick={() => {
                            if (!isNaN(sId) && !isNaN(aId)) {
                              hapticSelection();
                              onSelectSurah?.(sId, aId);
                              onClose();
                            }
                          }}
                          className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/60 cursor-pointer hover:border-emerald-500/50 transition-all"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                              Surah {sId}, Ayah {aId}
                            </span>
                            <FileEdit size={12} className="text-slate-400" />
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                            "{note}"
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 8. Support & Donations via UPI Section (shown in 'all' or 'donate') */}
          {(activeTab === 'all' || activeTab === 'donate') && (
            <div className="rounded-2xl border border-rose-200/80 dark:border-rose-900/40 bg-gradient-to-br from-rose-50/50 via-white to-amber-50/40 dark:from-rose-950/20 dark:via-slate-900 dark:to-amber-950/20 overflow-hidden shadow-sm transition-all">
              <button
                onClick={() => {
                  hapticSelection();
                  setIsDonationOpen(!isDonationOpen);
                }}
                className="w-full p-4 flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-sm">
                    <Heart size={18} className="fill-rose-500/20" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Support Project (UPI)
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-300">
                        Sadaqah Jariyah
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Support development & server upkeep via UPI
                    </p>
                  </div>
                </div>

                {activeTab === 'all' && (
                  <motion.div
                    animate={{ rotate: isDonationOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                )}
              </button>

              <AnimatePresence>
                {(activeTab === 'donate' || isDonationOpen) && (
                  <motion.div
                    key="sidebar-donation-panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-1 border-t border-rose-100 dark:border-rose-900/30 space-y-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 text-[11px] flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
                        <span><strong>100% Free & Open Resource:</strong> No features or content require payment. Contributions are strictly voluntary.</span>
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                        This application is developed as a sincere community effort to preserve authentic Shia Tafseer. Voluntary contributions assist in covering cloud hosting, database servers, and audio bandwidth costs.
                      </p>

                      {/* Direct UPI Donation Button */}
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            hapticSelection();
                            try {
                              window.location.href = upiLink;
                            } catch (e) {
                              navigator.clipboard.writeText(upiId);
                              setCopiedUpi(true);
                            }
                          }}
                          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md flex items-center justify-between transition-all active:scale-[0.99] group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center font-bold text-[10px] tracking-wider">
                              UPI
                            </div>
                            <span>Voluntary Contribution via UPI</span>
                          </div>
                          <div className="flex items-center gap-1.5 opacity-90 text-[11px]">
                            <span>Open UPI App</span>
                            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </button>

                        {/* UPI ID Copy Card */}
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                              UPI ID / Account
                            </div>
                            <div className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                              {upiId}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(upiId);
                              setCopiedUpi(true);
                              hapticSelection();
                              setTimeout(() => setCopiedUpi(false), 2500);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0"
                          >
                            {copiedUpi ? (
                              <>
                                <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                <span>Copy UPI</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-center">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                          Compatible with Google Pay, PhonePe, Paytm, BHIM, and all UPI banking apps.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* 9. Developer Information & Iltemas-e-Surah Fatiha Section (Kept at the Bottom) */}
          {(activeTab === 'all' || activeTab === 'developer') && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all">
              <button
                onClick={() => {
                  hapticSelection();
                  setIsDevOpen(!isDevOpen);
                }}
                className="w-full p-4 flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
                    <Code size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Developer & Dedication
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        Syed Murtaza Razavee
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Developer info & Iltemas-e-Surah Fatiha for Marhoomeen
                    </p>
                  </div>
                </div>

                {activeTab === 'all' && (
                  <motion.div
                    animate={{ rotate: isDevOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                )}
              </button>

              <AnimatePresence>
                {(activeTab === 'developer' || isDevOpen) && (
                  <motion.div
                    key="sidebar-developer-panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs">
                      {/* Developer Profile Header */}
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                          SR
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Syed Murtaza Razavee</h4>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                              Developer
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            Syedmurtazarazavee@gmail.com
                          </p>
                        </div>
                      </div>

                      {/* Contact & Feedback Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href="mailto:Syedmurtazarazavee@gmail.com?subject=Shia%20Quran%20%26%20Tafseer%20Feedback"
                          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Mail size={14} />
                          <span>Contact Developer</span>
                        </a>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText('Syedmurtazarazavee@gmail.com');
                            setCopiedEmail(true);
                            hapticSelection();
                            setTimeout(() => setCopiedEmail(false), 2500);
                          }}
                          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          {copiedEmail ? (
                            <>
                              <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Copy Email</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Sacred Dedication: ILTEMAS-E-SURAH FATIHA */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-amber-500/5 dark:from-amber-950/40 dark:via-emerald-950/30 dark:to-amber-950/20 border border-amber-300/60 dark:border-amber-700/50 shadow-sm space-y-3">
                        <div className="text-center space-y-1">
                          <p className="text-sm font-bold text-amber-900 dark:text-amber-200 font-arabic">
                            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                          </p>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 font-serif">
                            التماسِ سورۂ فاتحہ (Iltemas-e-Surah Fatiha)
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                            Please recite Surah Al-Fatiha for the Isal-e-Sawab and Maghfirat of:
                          </p>
                        </div>

                        <div className="space-y-2 bg-white/90 dark:bg-slate-900/90 p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-900/60 shadow-xs">
                          <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 font-bold text-xs">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
                            <span>Sakina Banoo D/O Akhoon Mohd Kazim</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 font-bold text-xs">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
                            <span>Syed Abbas Rizvi S/O Syed Hassan Rizvi</span>
                          </div>
                        </div>

                        <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 italic">
                          May Allah (SWT) grant them forgiveness, elevate their spiritual stations, and illuminate their graves in the blessed company of the Holy Prophet Muhammad (s.a.w.w) and the 14 Infallible Ahlulbayt (a.s).
                        </p>
                      </div>

                      {/* Technical & Source Attribution */}
                      <div className="space-y-1.5 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                          <span>Developer</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Syed Murtaza Razavee</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                          <span>Primary Exegesis</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Tafseer-e-Namoona & Tafseer Al-Kauthar</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Application Version</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">v1.2.0 (PWA & Offline Ready)</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* 10. Legal, Privacy & Google Play Data Safety Compliance */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={18} />
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Privacy & Data Safety
              </h4>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              We respect your privacy and adhere to Google Play User Data & Content Policies. No commercial tracking or advertising.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  hapticSelection();
                  setPrivacyModal({ isOpen: true, tab: 'privacy' });
                }}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Shield size={13} className="text-emerald-600" />
                <span>Privacy Policy</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  hapticSelection();
                  setPrivacyModal({ isOpen: true, tab: 'terms' });
                }}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <FileText size={13} className="text-emerald-600" />
                <span>Terms & UGC</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  hapticSelection();
                  setPrivacyModal({ isOpen: true, tab: 'deletion' });
                }}
                className="p-2 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200/80 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 size={13} className="text-rose-600" />
                <span>Delete Data</span>
              </button>
            </div>
          </div>

          {/* 11. Scholarly Attribution & App Info Footer */}
          <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 text-center space-y-1">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Shia Quran & Tafseer</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Exegesis: Tafseer-e-Namoona & Tafseer Al-Kauthar
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Preserving Authentic Islamic Heritage • v1.2.0
            </p>
          </div>

        </div>
      </motion.div>
      )}

      {/* In-app Privacy, Terms & Data Deletion Modal */}
      <PrivacyPolicyModal
        isOpen={privacyModal.isOpen}
        onClose={() => setPrivacyModal(p => ({ ...p, isOpen: false }))}
        initialTab={privacyModal.tab}
      />
    </AnimatePresence>
  );
}

