import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Moon, Sun, Type, Bookmark, BookOpen, Headphones, 
  Bell, Check, Trash2, ArrowRight, Clock,
  Flame, Compass, Volume2, Heart, ShieldCheck,
  Languages, FileEdit, CheckCircle2, User,
  Code, Mail, Copy, Info, Shield, FileText,
  ZoomIn, ZoomOut, Palette, Sliders
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

type TabCategory = 'display' | 'tafseer' | 'audio' | 'library' | 'about';

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
    tafseerZoom, setTafseerZoom,
    reminderTime, setReminderTime,
    autoScrollAudio, toggleAutoScrollAudio,
    reciter, setReciter,
    bookmarks, removeBookmark,
    lastRead, habitStats,
    tafseerNotes,
    userName, setUserName
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<TabCategory>('display');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName || '');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const upiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emailTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [privacyModal, setPrivacyModal] = useState<{
    isOpen: boolean;
    tab: 'privacy' | 'terms' | 'deletion';
  }>({
    isOpen: false,
    tab: 'privacy',
  });

  const upiId = '9906275833@superyes';
  const upiLink = `upi://pay?pa=9906275833@superyes&pn=Syed%20Murtaza%20Razavee&cu=INR&tn=Shia%20Quran%20Support`;

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (upiTimeoutRef.current) clearTimeout(upiTimeoutRef.current);
      if (emailTimeoutRef.current) clearTimeout(emailTimeoutRef.current);
    };
  }, []);

  const handleTabChange = (tab: TabCategory) => {
    hapticSelection();
    setActiveTab(tab);
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveName = () => {
    setUserName(tempName.trim());
    setIsEditingName(false);
    hapticSelection();
  };

  const handleCancelName = () => {
    setTempName(userName || '');
    setIsEditingName(false);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    hapticSelection();
    if (upiTimeoutRef.current) clearTimeout(upiTimeoutRef.current);
    upiTimeoutRef.current = setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('Syedmurtazarazavee@gmail.com');
    setCopiedEmail(true);
    hapticSelection();
    if (emailTimeoutRef.current) clearTimeout(emailTimeoutRef.current);
    emailTimeoutRef.current = setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleToggleReminder = async () => {
    hapticSelection();
    if (reminderTime) {
      setReminderTime(null);
    } else {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
        } catch (e) {
          // ignore
        }
      }
      setReminderTime('06:00');
    }
  };

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

  const tabs: { id: TabCategory; label: string; icon: any; badge?: number }[] = [
    { id: 'display', label: 'Display', icon: Palette },
    { id: 'tafseer', label: 'Tafseer', icon: BookOpen },
    { id: 'audio', label: 'Audio', icon: Headphones },
    { id: 'library', label: 'Library', icon: Bookmark, badge: bookmarks.length },
    { id: 'about', label: 'About', icon: Heart },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="sidebar-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-xs"
          onClick={() => { hapticImpact(ImpactStyle.Light); onClose(); }}
        />
      )}

      {isOpen && (
        <motion.div
          key="sidebar-drawer"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 280 }}
          className="fixed inset-y-0 right-0 z-[65] w-full max-w-md bg-slate-50 dark:bg-slate-950 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 pb-safe"
        >
          {/* Top Header */}
          <div className="px-5 pt-5 pb-3 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/70 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                  <Compass size={17} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    Settings & Library
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Shia Quran & Scholarly Tafseer</p>
                </div>
              </div>

              <button
                id="sidebar-close-btn"
                onClick={() => { hapticImpact(ImpactStyle.Light); onClose(); }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close settings"
              >
                <X size={18} />
              </button>
            </div>

            {/* User Profile & Greeting Bar */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 text-xs mb-3">
              <div className="flex items-center gap-2 flex-1 mr-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                  {userName ? userName.charAt(0).toUpperCase() : <User size={12} />}
                </div>
                {isEditingName ? (
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      id="sidebar-user-name-input"
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') handleCancelName();
                      }}
                      placeholder="Enter your name"
                      className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-emerald-500 text-slate-800 dark:text-slate-100 text-xs w-full focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      autoFocus
                    />
                    <button
                      id="sidebar-user-name-save"
                      onClick={handleSaveName}
                      className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded transition-colors"
                      title="Save name"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      id="sidebar-user-name-cancel"
                      onClick={handleCancelName}
                      className="p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                      title="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => {
                      setTempName(userName || '');
                      setIsEditingName(true);
                    }}
                    className="cursor-pointer group flex items-center gap-1.5 truncate"
                    title="Click to change your name"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {userName ? `Salam, ${userName}` : 'Salam, Noble Reader'}
                    </span>
                    <FileEdit size={12} className="text-slate-400 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Offline Ready</span>
              </div>
            </div>

            {/* Modern Segmented Navigation Bar */}
            <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={`sidebar-tab-${tab.id}`}
                    id={`sidebar-tab-btn-${tab.id}`}
                    onClick={() => handleTabChange(tab.id)}
                    className={`relative py-2 px-1 rounded-lg text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className="relative">
                      <Icon size={16} />
                      {tab.badge !== undefined && tab.badge > 0 && (
                        <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                          {tab.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold leading-none">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dedicated Scrollable Content Container */}
          <div ref={contentRef} className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">

            {/* TAB 1: DISPLAY & FONTS */}
            {activeTab === 'display' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Theme Mode Segmented Picker */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Appearance & Theme
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      id="theme-light-btn"
                      onClick={() => {
                        if (isDarkMode) {
                          hapticSelection();
                          toggleDarkMode();
                        }
                      }}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-center gap-2.5 font-medium text-xs ${
                        !isDarkMode
                          ? 'bg-amber-500/10 border-amber-500/80 text-amber-900 dark:text-amber-200 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <Sun size={17} className="text-amber-500" />
                      <span className="font-semibold">Light Mode</span>
                      {!isDarkMode && <CheckCircle2 size={14} className="text-amber-600 ml-auto" />}
                    </button>

                    <button
                      id="theme-dark-btn"
                      onClick={() => {
                        if (!isDarkMode) {
                          hapticSelection();
                          toggleDarkMode();
                        }
                      }}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-center gap-2.5 font-medium text-xs ${
                        isDarkMode
                          ? 'bg-emerald-500/10 border-emerald-500/80 text-emerald-300 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <Moon size={17} className="text-emerald-400" />
                      <span className="font-semibold">Dark Mode</span>
                      {isDarkMode && <CheckCircle2 size={14} className="text-emerald-400 ml-auto" />}
                    </button>
                  </div>
                </div>

                {/* Arabic Script Selector */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Arabic Script Style
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">5 Calligraphies</span>
                  </div>

                  <div className="space-y-2">
                    {arabicFonts.map((font) => {
                      const isSelected = arabicFont === font.id;
                      return (
                        <button
                          key={`arabic-font-${font.id}`}
                          id={`arabic-font-btn-${font.id}`}
                          onClick={() => {
                            hapticSelection();
                            setArabicFont(font.id);
                          }}
                          className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{font.name}</span>
                              {isSelected && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold">
                                  Selected
                                </span>
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
                      );
                    })}
                  </div>
                </div>

                {/* Arabic Font Size Slider with Live Preview */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Type size={16} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Arabic Text Size</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      {fontSize}px
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400">24px</span>
                    <input
                      id="arabic-font-size-slider"
                      type="range"
                      min="24"
                      max="64"
                      step="2"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <span className="text-xs font-bold text-slate-400">64px</span>
                  </div>

                  <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
                    <p 
                      className="text-emerald-800 dark:text-emerald-200 leading-relaxed py-1"
                      style={{ fontSize: `${fontSize}px`, fontFamily: arabicFont }}
                    >
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                  </div>
                </div>

                {/* Interface & Translation Typography */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Languages size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Interface & Translation Font</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {uiFonts.map((f) => (
                      <button
                        key={`ui-font-${f.id}`}
                        id={`ui-font-btn-${f.id}`}
                        onClick={() => {
                          hapticSelection();
                          setEnglishFont(f.id);
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          englishFont === f.id
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                        style={{ fontFamily: f.id }}
                      >
                        <span className="text-xs block">{f.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Translation Display Toggle */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <BookOpen size={17} className="text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Show Verse Translations</span>
                        <span className="text-[11px] text-slate-400">Display alongside Arabic verses</span>
                      </div>
                    </div>
                    <button
                      id="toggle-show-translation-btn"
                      onClick={() => { hapticSelection(); toggleShowTranslation(); }}
                      className={`w-11 h-6 rounded-full transition-colors relative ${showTranslation ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      aria-label="Toggle verse translation"
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${showTranslation ? 'translate-x-6 left-0' : 'translate-x-1 left-0'}`} />
                    </button>
                  </div>

                  {showTranslation && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                      <button
                        id="translation-lang-ur-btn"
                        onClick={() => { hapticSelection(); toggleTranslationLanguage('ur'); }}
                        className={`flex-1 p-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                          translationLanguages.includes('ur')
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500'
                        }`}
                      >
                        اردو ترجمہ (Urdu)
                      </button>
                      <button
                        id="translation-lang-en-btn"
                        onClick={() => { hapticSelection(); toggleTranslationLanguage('en'); }}
                        className={`flex-1 p-2 rounded-xl border text-center text-xs font-semibold transition-all ${
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

            {/* TAB 2: TAFSEER & SCHOLARLY COMMENTARY */}
            {activeTab === 'tafseer' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Select Shia Exegesis Provider
                  </span>

                  <div className="space-y-2.5">
                    {/* Tafseer-e-Namoona Card */}
                    <button
                      id="tafseer-provider-namoona-btn"
                      onClick={() => {
                        hapticSelection();
                        setTafseerProvider('namoona');
                      }}
                      className={`w-full p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                        tafseerProvider === 'namoona'
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
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
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">تفسیرِ نمونہ • جامع و تفصیلی</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            By Grand Ayatollah Naser Makarim Shirazi. Renowned 15-volume contemporary Shia commentary.
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Tafseer Al-Kauthar Card */}
                    <button
                      id="tafseer-provider-kauthar-btn"
                      onClick={() => {
                        hapticSelection();
                        setTafseerProvider('kauthar');
                      }}
                      className={`w-full p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                        tafseerProvider === 'kauthar'
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Tafseer Al-Kauthar</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                              <Check size={10} />
                              Digital Edition
                            </span>
                            {tafseerProvider === 'kauthar' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white ml-auto">Selected</span>
                            )}
                          </div>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">تفسیر الکوثر • علامہ شیخ محسن علی نجفی</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            By Allama Sheikh Mohsin Ali Najafi. Direct authentic digital exegesis from Balaghul Quran (balaghulquran.com).
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Accessible Zoom & Readability Slider */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ZoomIn size={16} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Tafseer Zoom & Readability</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        id="tafseer-zoom-reset-btn"
                        type="button"
                        onClick={() => {
                          hapticSelection();
                          setTafseerZoom(100);
                        }}
                        className="text-[10px] text-slate-500 hover:text-emerald-600 dark:text-slate-400 px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Reset (100%)
                      </button>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                        {tafseerZoom}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400">70%</span>
                    <input
                      id="tafseer-zoom-slider"
                      type="range"
                      min="70"
                      max="250"
                      step="5"
                      value={tafseerZoom}
                      onChange={(e) => setTafseerZoom(Number(e.target.value))}
                      className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <span className="text-xs font-bold text-slate-400">250%</span>
                  </div>

                  <div className="pt-2 text-right border-t border-slate-100 dark:border-slate-800">
                    <p 
                      className="font-urdu leading-relaxed text-slate-800 dark:text-slate-200 transition-[font-size] duration-150"
                      style={{ fontSize: `${Math.round(16 * (tafseerZoom / 100))}px` }}
                    >
                      تفسیرِ قرآن اور علمی نکات کا نمونہ متن برائے مطالعہ و تحقیق
                    </p>
                  </div>
                </div>

                {/* Commentary Language Selectors */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shadow-xs">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Exegesis Language Display</span>
                  <div className="flex gap-2">
                    <button
                      id="tafseer-lang-ur-btn"
                      onClick={() => { hapticSelection(); toggleTafseerLanguage('ur'); }}
                      className={`flex-1 p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                        tafseerLanguages.includes('ur')
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      اردو تفاسیر (Urdu)
                    </button>
                    <button
                      id="tafseer-lang-en-btn"
                      onClick={() => { hapticSelection(); toggleTafseerLanguage('en'); }}
                      className={`flex-1 p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                        tafseerLanguages.includes('en')
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      English Commentary
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: AUDIO & RECITATION */}
            {activeTab === 'audio' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Reciter List */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Headphones size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Featured Qari / Reciter</span>
                  </div>

                  <div className="space-y-2">
                    {reciters.map((r) => {
                      const isSelected = reciter === r.value;
                      return (
                        <button
                          key={`reciter-${r.value}`}
                          id={`reciter-btn-${r.value}`}
                          onClick={() => {
                            hapticSelection();
                            setReciter(r.value);
                          }}
                          className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-semibold shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold block">{r.name}</span>
                            <span className="text-[11px] text-slate-400 font-normal">{r.desc}</span>
                          </div>
                          {isSelected && <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Follow Recitation Switch */}
                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <div className="flex items-center gap-3">
                    <Volume2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Follow Recitation</span>
                      <span className="text-[11px] text-slate-400">Auto-scroll viewport to the active verse</span>
                    </div>
                  </div>
                  <button
                    id="toggle-auto-scroll-audio-btn"
                    onClick={() => { hapticSelection(); toggleAutoScrollAudio(); }}
                    className={`w-11 h-6 rounded-full transition-colors relative ${autoScrollAudio ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    aria-label="Toggle follow recitation"
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${autoScrollAudio ? 'translate-x-6 left-0' : 'translate-x-1 left-0'}`} />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: LIBRARY, SAVED & HABITS */}
            {activeTab === 'library' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Daily Study Activity */}
                <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-500/10 via-slate-50 to-amber-500/10 dark:from-emerald-950/40 dark:via-slate-900 dark:to-amber-950/20 border border-emerald-500/20 dark:border-emerald-800/40 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Flame size={16} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        Daily Study Activity
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">Today</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
                      <span className="block text-2xl font-bold text-slate-800 dark:text-slate-100">{todayAyahs}</span>
                      <span className="text-[11px] text-slate-500 font-medium">Ayahs Read</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
                      <span className="block text-2xl font-bold text-emerald-600 dark:text-emerald-400">{todayTafseer}</span>
                      <span className="text-[11px] text-slate-500 font-medium">Tafseer Studies</span>
                    </div>
                  </div>

                  {lastRead && (
                    <button
                      id="resume-last-read-btn"
                      onClick={() => {
                        hapticSelection();
                        onSelectSurah?.(lastRead.surahId, lastRead.ayahNumber);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen size={15} />
                        <span>Resume Last Read: Surah {lastRead.surahId}, Ayah {lastRead.ayahNumber}</span>
                      </div>
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>

                {/* Bookmarks Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Saved Verses ({bookmarks.length})
                    </span>
                  </div>

                  {bookmarks.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                      {bookmarks.map((b) => (
                        <div
                          key={`bookmark-${b.surahId}-${b.ayahNumber}`}
                          className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/50 transition-all group shadow-xs"
                        >
                          <button
                            id={`bookmark-jump-${b.surahId}-${b.ayahNumber}`}
                            onClick={() => {
                              hapticSelection();
                              onSelectSurah?.(b.surahId, b.ayahNumber);
                              onClose();
                            }}
                            className="flex items-center gap-2.5 text-left flex-1 mr-2"
                          >
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/40">
                              {b.surahId}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                Surah {b.surahId}, Ayah {b.ayahNumber}
                              </span>
                              <span className="text-[10px] text-slate-400 block">Tap to jump to verse</span>
                            </div>
                          </button>

                          <button
                            id={`bookmark-delete-${b.surahId}-${b.ayahNumber}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              hapticImpact(ImpactStyle.Light);
                              removeBookmark(b.surahId, b.ayahNumber);
                            }}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Remove bookmark"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1.5 bg-white/50 dark:bg-slate-900/50">
                      <Bookmark size={22} className="mx-auto text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No bookmarked Ayahs yet</p>
                      <p className="text-[11px] text-slate-400">Tap the bookmark icon on any verse while reading to save it here.</p>
                    </div>
                  )}
                </div>

                {/* Personal Tafseer Notes */}
                {notesList.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Personal Reflections & Notes ({notesList.length})
                    </span>
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                      {notesList.map(([key, note]) => {
                        const parts = key.split('_');
                        const sId = parseInt(parts[0], 10);
                        const aId = parseInt(parts[1], 10);
                        return (
                          <div
                            key={`note-item-${key}`}
                            onClick={() => {
                              if (!isNaN(sId) && !isNaN(aId)) {
                                hapticSelection();
                                onSelectSurah?.(sId, aId);
                                onClose();
                              }
                            }}
                            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:border-emerald-500/50 transition-all shadow-xs"
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

                {/* Daily Reading Reminder */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Bell size={17} className="text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Daily Quran Alert</span>
                        <span className="text-[11px] text-slate-400">
                          {reminderTime ? `Scheduled daily for ${reminderTime}` : 'Disabled'}
                        </span>
                      </div>
                    </div>
                    <button
                      id="toggle-reminder-btn"
                      onClick={handleToggleReminder}
                      className={`w-11 h-6 rounded-full transition-colors relative ${reminderTime ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      aria-label="Toggle daily reminder"
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${reminderTime ? 'translate-x-6 left-0' : 'translate-x-1 left-0'}`} />
                    </button>
                  </div>

                  {reminderTime && (
                    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-slate-400" />
                        <input
                          id="reminder-time-input"
                          type="time"
                          value={reminderTime}
                          onChange={(e) => {
                            setReminderTime(e.target.value);
                            hapticSelection();
                          }}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { label: 'Fajr', time: '05:30' },
                          { label: 'Dhuhr', time: '13:00' },
                          { label: 'Maghrib', time: '19:00' },
                          { label: 'Isha', time: '21:30' }
                        ].map((preset) => (
                          <button
                            key={`reminder-preset-${preset.label}`}
                            id={`reminder-preset-btn-${preset.label.toLowerCase()}`}
                            onClick={() => {
                              setReminderTime(preset.time);
                              hapticSelection();
                            }}
                            className={`p-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                              reminderTime === preset.time
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
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

            {/* TAB 5: ABOUT, SUPPORT & DEDICATION */}
            {activeTab === 'about' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Voluntary Support via UPI */}
                <div className="rounded-2xl border border-rose-200/80 dark:border-rose-900/40 bg-gradient-to-br from-rose-50/40 via-white to-amber-50/30 dark:from-rose-950/20 dark:via-slate-900 dark:to-amber-950/20 p-4 space-y-3.5 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
                      <Heart size={17} className="fill-rose-500/20" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          Support Project (Sadaqah Jariyah)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Voluntary contributions towards cloud hosting & servers
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 text-[11px] flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
                    <span><strong>100% Free Resource:</strong> No features require payment. Contributions are strictly voluntary.</span>
                  </div>

                  <div className="space-y-2">
                    <button
                      id="open-upi-app-btn"
                      type="button"
                      onClick={() => {
                        hapticSelection();
                        try {
                          window.location.href = upiLink;
                        } catch (e) {
                          handleCopyUpi();
                        }
                      }}
                      className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-between transition-all active:scale-[0.99] group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] tracking-wider">UPI</span>
                        <span>Contribute via UPI App</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-90 text-[11px]">
                        <span>Pay via UPI</span>
                        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                          UPI ID
                        </div>
                        <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                          {upiId}
                        </div>
                      </div>
                      <button
                        id="copy-upi-btn"
                        onClick={handleCopyUpi}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors flex-shrink-0"
                      >
                        {copiedUpi ? (
                          <>
                            <Check size={13} className="text-emerald-600 dark:text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sacred Dedication: ILTEMAS-E-SURAH FATIHA */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-amber-500/5 dark:from-amber-950/40 dark:via-emerald-950/30 dark:to-amber-950/20 border border-amber-300/70 dark:border-amber-700/60 shadow-xs space-y-3">
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

                  <div className="space-y-2 bg-white/95 dark:bg-slate-900/95 p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/60 shadow-xs">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-xs">
                      <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                      <span>Sakina Banoo D/O Akhoon Mohd Kazim</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-xs">
                      <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                      <span>Syed Abbas Rizvi S/O Syed Hassan Rizvi</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 italic leading-relaxed">
                    May Allah (SWT) grant them forgiveness, elevate their spiritual stations, and illuminate their graves in the company of the Holy Prophet Muhammad (s.a.w.w) and the 14 Infallible Ahlulbayt (a.s).
                  </p>
                </div>

                {/* Developer Profile Card */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                      SR
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Syed Murtaza Razavee</h4>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          Developer
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        Syedmurtazarazavee@gmail.com
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      id="contact-developer-mail-link"
                      href="mailto:Syedmurtazarazavee@gmail.com?subject=Shia%20Quran%20%26%20Tafseer%20Feedback"
                      className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Mail size={14} />
                      <span>Contact</span>
                    </a>

                    <button
                      id="copy-developer-email-btn"
                      onClick={handleCopyEmail}
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedEmail ? (
                        <>
                          <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy Email</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Legal, Privacy & Compliance */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={17} />
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Privacy & Data Safety
                    </h4>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      id="open-privacy-policy-btn"
                      type="button"
                      onClick={() => {
                        hapticSelection();
                        setPrivacyModal({ isOpen: true, tab: 'privacy' });
                      }}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <Shield size={12} className="text-emerald-600" />
                      <span>Privacy</span>
                    </button>

                    <button
                      id="open-terms-policy-btn"
                      type="button"
                      onClick={() => {
                        hapticSelection();
                        setPrivacyModal({ isOpen: true, tab: 'terms' });
                      }}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <FileText size={12} className="text-emerald-600" />
                      <span>Terms</span>
                    </button>

                    <button
                      id="open-deletion-modal-btn"
                      type="button"
                      onClick={() => {
                        hapticSelection();
                        setPrivacyModal({ isOpen: true, tab: 'deletion' });
                      }}
                      className="p-2 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <Trash2 size={12} className="text-rose-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* App Information & Version */}
                <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-center space-y-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Shia Quran & Tafseer</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tafseer-e-Namoona & Tafseer Al-Kauthar
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Version 1.2.0 • Offline Ready
                  </p>
                </div>
              </div>
            )}

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
