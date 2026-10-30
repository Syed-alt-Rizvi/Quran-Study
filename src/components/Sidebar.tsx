import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Moon, Sun, Type, Bookmark, BookOpen, Headphones, 
  Bell, Check, Trash2, ArrowRight, Clock,
  Activity, Volume2, Heart, ShieldCheck,
  Languages, FileEdit, CheckCircle2, User,
  Code, Mail, Copy, Info, Shield, FileText,
  ZoomIn, ZoomOut, Palette, Sliders, KeyRound,
  Smartphone, Vibrate, ExternalLink,
  LogOut, RefreshCw, Calendar,
  ChevronDown, ChevronUp, Share2, Bluetooth, Wifi
} from 'lucide-react';
import { useSettingsStore } from '../store';
import { t } from '../i18n';
import { hapticImpact, hapticSelection } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import { PWAInstallButton } from './PWAInstallButton';
import { getApiUrl } from '../utils/apiBase';
import { SURAH_URDU_MAP } from '../data/surahUrduNames';
import staticSurahs from '../surahList.json';

import { registerModal } from '../utils/modalBackHandler';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSurah?: (surahId: number, ayahNumber?: number) => void;
  onSelectMafatihItem?: (itemId: string) => void;
  onExitApp?: () => void;
}

type TabCategory = 'display' | 'quran' | 'mafatih' | 'audio' | 'library' | 'about';

export default function Sidebar({ isOpen, onClose, onSelectSurah, onSelectMafatihItem, onExitApp }: SidebarProps) {
  const { 
    isDarkMode, toggleDarkMode, setDarkMode,
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
    userName, setUserName,
    hapticsEnabled, toggleHaptics,
    mafatihFontSize, setMafatihFontSize,
    mafatihShowTranslation, toggleMafatihShowTranslation,
    mafatihDefaultSpeed, setMafatihDefaultSpeed,
    appLanguage, setAppLanguage
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<TabCategory>('display');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName || '');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const upiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emailTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shareTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [privacyModal, setPrivacyModal] = useState<{
    isOpen: boolean;
    tab: 'privacy' | 'terms' | 'deletion' | 'licenses';
  }>({
    isOpen: false,
    tab: 'privacy',
  });
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [isFatihaExpanded, setIsFatihaExpanded] = useState(true);

  const handleManualCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    setUpdateMessage(null);
    hapticSelection();
    try {
      const bundled = typeof __APP_BUILD_ID__ !== 'undefined' ? String(__APP_BUILD_ID__) : '1.2.0';
      const urls = [
        getApiUrl(`/api/version?_t=${Date.now()}`),
        `/api/version?_t=${Date.now()}`
      ];
      let serverVer: string | null = null;
      for (const u of urls) {
        try {
          const res = await fetch(u, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache, no-store' }
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.version) {
              serverVer = String(data.version);
              break;
            }
          }
        } catch {}
      }

      if (serverVer && serverVer !== bundled && bundled !== 'dev') {
        setUpdateMessage('New published version found! Reloading latest build...');
        if ('caches' in window) {
          try {
            const keys = await caches.keys();
            for (const k of keys) {
              await caches.delete(k).catch(() => {});
            }
          } catch {}
        }
        if ('serviceWorker' in navigator) {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const reg of registrations) {
              await reg.update().catch(() => {});
              if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
          } catch {}
        }
        setTimeout(() => {
          window.location.href = window.location.pathname + '?_v=' + Date.now();
        }, 500);
      } else {
        setUpdateMessage('App is on the latest published build!');
        setTimeout(() => setUpdateMessage(null), 3500);
      }
    } catch {
      setUpdateMessage('Could not verify server version. Please check connection.');
      setTimeout(() => setUpdateMessage(null), 3000);
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const upiId = '9906275833@superyes';
  const upiLink = `upi://pay?pa=9906275833@superyes&pn=Syed%20Murtaza%20Razavee&cu=INR&tn=Shia%20Quran%20Support`;

  useEffect(() => {
    if (isOpen) {
      return registerModal(onClose);
    }
  }, [isOpen, onClose]);

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

  const handleShareApp = async () => {
    hapticImpact(ImpactStyle.Medium);
    const shareData = {
      title: 'Shia Markaz - Holy Quran, Mafatih & Adhan',
      text: 'Install Shia Markaz: Complete Holy Quran with Shia Tafseer (Namoona & Al-Kauthar), 1,307 Mafatih al-Jinan supplications & high-precision Shia Adhan prayer times.',
      url: window.location.origin,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        setShareSuccess(true);
        if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
        shareTimeoutRef.current = setTimeout(() => setShareSuccess(false), 3000);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          handleCopyAppShare();
        }
      }
    } else {
      handleCopyAppShare();
    }
  };

  const handleCopyAppShare = () => {
    try {
      const textToCopy = `Shia Markaz - Complete Holy Quran with Shia Tafseer, 1,307 authentic Mafatih al-Jinan supplications & Adhan: ${window.location.origin}`;
      navigator.clipboard.writeText(textToCopy);
      setShareSuccess(true);
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
      shareTimeoutRef.current = setTimeout(() => setShareSuccess(false), 3000);
    } catch {}
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

  const sortedBookmarks = useMemo(() => {
    return [...bookmarks]
      .filter((b) => b && typeof b.surahId === 'number' && b.surahId >= 1 && b.surahId <= 114 && typeof b.ayahNumber === 'number' && b.ayahNumber >= 1)
      .sort((a, b) => {
        if (a.surahId !== b.surahId) return a.surahId - b.surahId;
        return a.ayahNumber - b.ayahNumber;
      });
  }, [bookmarks]);

  const isUrdu = appLanguage === 'ur';

  const tabs: { id: TabCategory; label: string; icon: any; badge?: number }[] = [
    { id: 'display', label: isUrdu ? 'ترتیبات' : 'App', icon: Sliders },
    { id: 'quran', label: isUrdu ? 'قرآن' : 'Quran', icon: BookOpen },
    { id: 'mafatih', label: isUrdu ? 'مفاتیح' : 'Mafatih', icon: KeyRound },
    { id: 'audio', label: isUrdu ? 'آڈیو' : 'Audio', icon: Headphones },
    { id: 'library', label: isUrdu ? 'کتب خانہ' : 'Library', icon: Bookmark, badge: bookmarks.length },
    { id: 'about', label: isUrdu ? 'تعارف' : 'About', icon: Info },
  ];

  return (
    <>
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
          className="fixed inset-y-0 right-0 z-[65] w-full max-w-md liquid-glass-dock shadow-[-20px_0_60px_-4px_rgba(0,0,0,0.6)] flex flex-col border-l border-white/40 dark:border-white/10 pb-safe backdrop-blur-3xl"
        >
          {/* Top Header */}
          <div className="px-5 modal-header-safe pb-3 border-b border-white/30 dark:border-white/10 liquid-glass">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-arabic font-bold text-sm shadow-[0_0_12px_rgba(16,185,129,0.4)] border border-white/40 shrink-0">
                  ش
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {isUrdu ? 'شیعہ مرکز ترتیبات' : 'Shia Markaz Settings'}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isUrdu ? 'قرآنِ مجید • مفاتیح الجنان • ترتیبات' : 'Quran • Mafatih Al Jinan • Global Controls'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {onExitApp && (
                  <button
                    onClick={() => {
                      hapticImpact(ImpactStyle.Light);
                      onClose();
                      onExitApp();
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    title="Exit App (Dua e Khatm e Quran)"
                    aria-label="Exit App and Recite Dua e Khatm e Quran"
                  >
                    <LogOut size={18} />
                  </button>
                )}
                <button
                  id="sidebar-close-btn"
                  onClick={() => { hapticImpact(ImpactStyle.Light); onClose(); }}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  aria-label="Close settings"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* User Profile & Greeting Bar */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl liquid-glass border border-white/35 dark:border-white/10 text-xs mb-3 shadow-2xs">
              <div className="flex items-center gap-2 flex-1 mr-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 shadow-xs">
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
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-500 text-slate-800 dark:text-slate-100 text-xs w-full focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      autoFocus
                    />
                    <button
                      id="sidebar-user-name-save"
                      onClick={handleSaveName}
                      className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg transition-colors cursor-pointer"
                      title="Save name"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      id="sidebar-user-name-cancel"
                      onClick={handleCancelName}
                      className="p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
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
                      {userName ? `Salam, ${userName}` : 'Salam alaykum'}
                    </span>
                    <FileEdit size={12} className="text-slate-400 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span>Offline Ready</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-6 gap-1 p-1 liquid-glass rounded-2xl border border-white/35 dark:border-white/10 shadow-inner">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={`sidebar-tab-${tab.id}`}
                    id={`sidebar-tab-btn-${tab.id}`}
                    onClick={() => handleTabChange(tab.id)}
                    className={`relative py-2 px-0.5 rounded-xl text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isActive
                        ? 'liquid-glass text-emerald-800 dark:text-emerald-300 font-bold shadow-xs border border-white/60 dark:border-white/20 ring-1 ring-emerald-500/30'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className="relative">
                      <Icon size={15} />
                      {tab.badge !== undefined && tab.badge > 0 && (
                        <span className="absolute -top-1.5 -right-2 min-w-[13px] h-[13px] rounded-full bg-emerald-600 text-white text-[8px] font-bold flex items-center justify-center px-0.5 shadow-xs">
                          {tab.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold leading-none truncate max-w-full">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dedicated Scrollable Content Container */}
          <div ref={contentRef} className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">

            {/* TAB 1: GENERAL APP CONTROLS */}
            {activeTab === 'display' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* SUB-SETTING: APP LANGUAGE & LOCALIZATION */}
                <div className="p-4 rounded-2xl border border-emerald-400/40 dark:border-emerald-500/30 liquid-glass-card glass-emerald-fusion space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Languages size={18} className="text-emerald-700 dark:text-emerald-400" />
                      <div>
                        <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {t('app_language_title', appLanguage)} • {t('language', appLanguage)}
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {appLanguage === 'ur' ? 'مکمل ایپ کی زبان تبدیل کریں' : 'Choose application UI language'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full liquid-glass border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold">
                      {appLanguage === 'ur' ? 'اردو' : 'English'}
                    </span>
                  </div>

                  {/* Primary Language Selectors: English vs Urdu */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="display-lang-en-btn"
                      onClick={() => {
                        hapticSelection();
                        setAppLanguage('en');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                        appLanguage === 'en'
                          ? 'liquid-glass border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-950 dark:text-emerald-100 shadow-xs font-semibold'
                          : 'liquid-glass border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-emerald-400/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs">English</span>
                        {appLanguage === 'en' && <Check size={13} className="text-emerald-600 dark:text-emerald-400" />}
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight">
                        Latin script &amp; translations
                      </span>
                    </button>

                    <button
                      id="display-lang-ur-btn"
                      onClick={() => {
                        hapticSelection();
                        setAppLanguage('ur');
                      }}
                      className={`p-3 rounded-xl border text-right transition-all cursor-pointer relative ${
                        appLanguage === 'ur'
                          ? 'liquid-glass border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-950 dark:text-emerald-100 shadow-xs font-semibold'
                          : 'liquid-glass border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-emerald-400/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 flex-row-reverse">
                        <span className="font-bold text-xs font-arabic">اردو (Urdu)</span>
                        {appLanguage === 'ur' && <Check size={13} className="text-emerald-600 dark:text-emerald-400" />}
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight font-arabic">
                        مکمل اردو انٹرفیس
                      </span>
                    </button>
                  </div>
                </div>

                {/* Theme Mode Segmented Picker */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Appearance & Theme
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      id="theme-light-btn"
                      onClick={() => {
                        hapticSelection();
                        setDarkMode(false);
                      }}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-center gap-2.5 font-medium text-xs cursor-pointer ${
                        !isDarkMode
                          ? 'liquid-glass border-amber-500/80 text-amber-900 dark:text-amber-200 shadow-xs ring-1 ring-amber-500/30'
                          : 'liquid-glass border-white/30 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-amber-400/40'
                      }`}
                    >
                      <Sun size={17} className="text-amber-500" />
                      <span className="font-semibold">Light Mode</span>
                      {!isDarkMode && <CheckCircle2 size={14} className="text-amber-600 ml-auto" />}
                    </button>

                    <button
                      id="theme-dark-btn"
                      onClick={() => {
                        hapticSelection();
                        setDarkMode(true);
                      }}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-center gap-2.5 font-medium text-xs cursor-pointer ${
                        isDarkMode
                          ? 'liquid-glass border-emerald-500/80 text-emerald-300 shadow-xs ring-1 ring-emerald-500/30'
                          : 'liquid-glass border-white/30 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-emerald-400/40'
                      }`}
                    >
                      <Moon size={17} className="text-emerald-400" />
                      <span className="font-semibold">Dark Mode</span>
                      {isDarkMode && <CheckCircle2 size={14} className="text-emerald-400 ml-auto" />}
                    </button>
                  </div>
                </div>

                {/* Haptic Vibration Feedback Toggle */}
                <div className="p-4 rounded-2xl border border-white/40 dark:border-white/10 liquid-glass-card space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Vibrate size={17} className="text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Haptic Vibration Feedback</span>
                        <span className="text-[11px] text-slate-400">Native physical feedback on interactions</span>
                      </div>
                    </div>
                    <button
                      id="toggle-haptics-btn"
                      onClick={() => {
                        toggleHaptics();
                        hapticSelection();
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative border border-white/30 ${hapticsEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      aria-label="Toggle haptic vibration"
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${hapticsEnabled ? 'translate-x-6 left-0' : 'translate-x-1 left-0'}`} />
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
                              ? 'liquid-glass border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-xs ring-1 ring-emerald-500/30'
                              : 'liquid-glass border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-emerald-400/40'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{font.name}</span>
                              {isSelected && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/30">
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

                {/* Interface & Translation Typography */}
                <div className="p-4 rounded-2xl border border-white/40 dark:border-white/10 liquid-glass-card space-y-2.5 shadow-xs">
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
                            ? 'liquid-glass border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs ring-1 ring-emerald-500/30'
                            : 'liquid-glass border-white/30 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-white/50'
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

            {/* TAB 2: QURAN & SCHOLARLY TAFSEER */}
            {activeTab === 'quran' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Arabic Font Size Slider with Live Preview */}
                <div className="p-4 rounded-2xl border border-white/40 dark:border-white/10 liquid-glass-card space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Type size={16} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Quran Verse Text Size</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md liquid-glass border border-emerald-500/30 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      {fontSize}px
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400">22px</span>
                    <input
                      id="arabic-font-size-slider"
                      type="range"
                      min="22"
                      max="64"
                      step="2"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="flex-1 h-2 bg-slate-200/80 dark:bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <span className="text-xs font-bold text-slate-400">64px</span>
                  </div>

                  <div className="pt-2 text-center border-t border-white/20 dark:border-white/10">
                    <p 
                      className="text-emerald-800 dark:text-emerald-200 leading-relaxed py-1"
                      style={{ fontSize: `${fontSize}px`, fontFamily: arabicFont }}
                    >
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                  </div>
                </div>

                {/* Translation Display Toggle */}
                <div className="p-4 rounded-2xl border border-white/40 dark:border-white/10 liquid-glass-card space-y-3 shadow-xs">
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
                      className={`w-11 h-6 rounded-full transition-colors relative border border-white/30 ${showTranslation ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      aria-label="Toggle verse translation"
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${showTranslation ? 'translate-x-6 left-0' : 'translate-x-1 left-0'}`} />
                    </button>
                  </div>

                  {showTranslation && (
                    <div className="pt-2 border-t border-white/20 dark:border-white/10 flex gap-2">
                      <button
                        id="translation-lang-ur-btn"
                        onClick={() => { hapticSelection(); toggleTranslationLanguage('ur'); }}
                        className={`flex-1 p-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                          translationLanguages.includes('ur')
                            ? 'liquid-glass border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs ring-1 ring-emerald-500/30'
                            : 'liquid-glass border-white/30 dark:border-white/10 text-slate-500 hover:border-white/50'
                        }`}
                      >
                        اردو ترجمہ (Urdu)
                      </button>
                      <button
                        id="translation-lang-en-btn"
                        onClick={() => { hapticSelection(); toggleTranslationLanguage('en'); }}
                        className={`flex-1 p-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                          translationLanguages.includes('en')
                            ? 'liquid-glass border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs ring-1 ring-emerald-500/30'
                            : 'liquid-glass border-white/30 dark:border-white/10 text-slate-500 hover:border-white/50'
                        }`}
                      >
                        English Translation
                      </button>
                    </div>
                  )}
                </div>

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
                          ? 'liquid-glass-card glass-emerald-fusion border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-xs ring-1 ring-emerald-500/30'
                          : 'liquid-glass-card border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-emerald-400/40'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Tafseer-e-Namoona</span>
                            {tafseerProvider === 'namoona' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">Selected</span>
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
                          ? 'liquid-glass-card glass-emerald-fusion border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-xs ring-1 ring-emerald-500/30'
                          : 'liquid-glass-card border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-emerald-400/40'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Tafseer Al-Kauthar</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 border border-emerald-500/30">
                              <Check size={10} />
                              Digital Edition
                            </span>
                            {tafseerProvider === 'kauthar' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white ml-auto shadow-xs">Selected</span>
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
                <div className="p-4 rounded-2xl border border-white/40 dark:border-white/10 liquid-glass-card space-y-3 shadow-xs">
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
                        className="text-[10px] text-slate-600 dark:text-slate-400 hover:text-emerald-600 px-2 py-0.5 rounded-lg liquid-glass border border-white/20 transition-colors"
                      >
                        Reset (100%)
                      </button>
                      <span className="px-2 py-0.5 rounded-md liquid-glass border border-emerald-500/30 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
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
                      step="10"
                      value={tafseerZoom}
                      onChange={(e) => setTafseerZoom(Number(e.target.value))}
                      className="flex-1 h-2 bg-slate-200/80 dark:bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <span className="text-xs font-bold text-slate-400">250%</span>
                  </div>

                  <div className="pt-2 text-right border-t border-white/20 dark:border-white/10">
                    <p 
                      className="font-urdu leading-relaxed text-slate-800 dark:text-slate-200 transition-[font-size] duration-150"
                      style={{ fontSize: `${Math.round(18 * (tafseerZoom / 100))}px` }}
                    >
                      تفسیرِ قرآن اور علمی نکات کا نمونہ متن برائے مطالعہ و تحقیق
                    </p>
                  </div>
                </div>

                {/* Commentary Language Selectors */}
                <div className="p-4 rounded-2xl border border-white/40 dark:border-white/10 liquid-glass-card space-y-2.5 shadow-xs">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Exegesis Language Display</span>
                  <div className="flex gap-2">
                    <button
                      id="tafseer-lang-ur-btn"
                      onClick={() => { hapticSelection(); toggleTafseerLanguage('ur'); }}
                      className={`flex-1 p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                        tafseerLanguages.includes('ur')
                          ? 'liquid-glass border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs ring-1 ring-emerald-500/30'
                          : 'liquid-glass border-white/30 dark:border-white/10 text-slate-500 hover:border-white/50'
                      }`}
                    >
                      اردو تفاسیر (Urdu)
                    </button>
                    <button
                      id="tafseer-lang-en-btn"
                      onClick={() => { hapticSelection(); toggleTafseerLanguage('en'); }}
                      className={`flex-1 p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                        tafseerLanguages.includes('en')
                          ? 'liquid-glass border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs ring-1 ring-emerald-500/30'
                          : 'liquid-glass border-white/30 dark:border-white/10 text-slate-500 hover:border-white/50'
                      }`}
                    >
                      English Commentary
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MAFATIH AL JINAN SETTINGS */}
            {activeTab === 'mafatih' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Supplications Arabic Font Size */}
                <div className="p-4 rounded-2xl border border-white/40 dark:border-white/10 liquid-glass-card glass-sapphire-fusion space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Type size={16} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {isUrdu ? 'دعاؤں کا فونٹ سائز' : 'Dua & Ziyarat Text Size'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md liquid-glass border border-emerald-500/30 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      {mafatihFontSize}px
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400">22px</span>
                    <input
                      id="mafatih-font-size-slider"
                      type="range"
                      min="22"
                      max="64"
                      step="2"
                      value={mafatihFontSize}
                      onChange={(e) => setMafatihFontSize(Number(e.target.value))}
                      className="flex-1 h-2 bg-slate-200/80 dark:bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <span className="text-xs font-bold text-slate-400">64px</span>
                  </div>

                  <div className="pt-2 text-center border-t border-white/20 dark:border-white/10">
                    <p 
                      className="text-emerald-800 dark:text-emerald-200 leading-relaxed py-1 font-arabic"
                      style={{ fontSize: `${mafatihFontSize}px`, fontFamily: arabicFont }}
                    >
                      اَللَّهُمَّ إِنِّي أَسْأَلُكَ بِرَحْمَتِكَ الَّتِي وَسِعَتْ كُلَّ شَيْءٍ
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                      {isUrdu ? 'دعائے کمیل کے نمونے کا پیش منظر' : 'Dua Kumayl sample verse preview'}
                    </p>
                  </div>
                </div>

                {/* Show English Translation in Mafatih */}
                <div className="p-4 rounded-2xl border border-white/40 dark:border-white/10 liquid-glass-card space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <BookOpen size={17} className="text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                          {isUrdu ? 'ترجمہ دکھائیں' : 'Show Translation'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {isUrdu ? 'عربی کے نیچے ترجمہ دکھائیں' : 'Display translation below supplication verses'}
                        </span>
                      </div>
                    </div>
                    <button
                      id="toggle-mafatih-translation-btn"
                      onClick={() => { hapticSelection(); toggleMafatihShowTranslation(); }}
                      className={`w-11 h-6 rounded-full transition-colors relative border border-white/30 ${mafatihShowTranslation ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      aria-label="Toggle supplication translation"
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${mafatihShowTranslation ? 'translate-x-6 left-0' : 'translate-x-1 left-0'}`} />
                    </button>
                  </div>
                </div>

                {/* Supplication Audio & Reading Quality */}
                <div className="p-4 rounded-2xl border border-white/40 dark:border-white/10 liquid-glass-card space-y-2 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <Headphones size={17} className="text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                        {isUrdu ? 'روح پرور آڈیو تلاوت' : 'Serene Audio Recitation'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {isUrdu ? 'تکرار اور رفتار کی تبدیلی کے ساتھ اعلیٰ معیار کی ریکارڈنگز' : 'High-fidelity recordings with loop mode and speed tuning'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Default Audio Playback Speed */}
                <div className="p-4 rounded-2xl border border-white/40 dark:border-white/10 liquid-glass-card space-y-2.5 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Headphones size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isUrdu ? 'بنیادی آڈیو رفتار' : 'Default Audio Speed'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                      <button
                        key={`mafatih-speed-${speed}`}
                        onClick={() => {
                          hapticSelection();
                          setMafatihDefaultSpeed(speed);
                        }}
                        className={`py-2 rounded-xl border text-center text-xs font-bold transition-all ${
                          mafatihDefaultSpeed === speed
                            ? 'liquid-glass border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs ring-1 ring-emerald-500/30'
                            : 'liquid-glass border-white/30 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-white/50'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Access to Main Duas & Ziyaraat */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {isUrdu ? 'دعاؤں تک فوری رسائی' : 'Quick Open Supplication'}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      {isUrdu ? 'براہِ راست' : 'Direct Launch'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'maf_dua40', title: isUrdu ? 'دعائے کمیل' : 'Dua Kumail', arabic: 'دعاء كميل' },
                      { id: 'maf_dua51', title: isUrdu ? 'دعائے توسل' : 'Dua Tawassul', arabic: 'دعاء التوسل' },
                      { id: 'maf_ziy86', title: isUrdu ? 'زیارتِ عاشورہ' : 'Ziyarat Ashura', arabic: 'زيارة عاشوراء' },
                      { id: 'maf_ziy126a', title: isUrdu ? 'دعائے ندبہ' : 'Dua Nudba', arabic: 'دعاء الندبة' },
                      { id: 'maf_dua46b', title: isUrdu ? 'دعائے فرج' : 'Dua Al-Faraj', arabic: 'دعاء الفرج' },
                      { id: 'h_kisa', title: isUrdu ? 'حدیثِ کساء' : 'Hadith al-Kisa', arabic: 'حديث الكساء' },
                    ].map((item) => (
                      <button
                        key={`quick-mafatih-${item.id}`}
                        onClick={() => {
                          hapticSelection();
                          if (onSelectMafatihItem) {
                            onSelectMafatihItem(item.id);
                          }
                          onClose();
                        }}
                        className="p-2.5 rounded-xl border border-white/40 dark:border-white/10 liquid-glass hover:border-emerald-500/60 transition-all text-left group shadow-xs cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {item.title}
                          </span>
                          <ExternalLink size={12} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                        </div>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-arabic block mt-0.5">
                          {item.arabic}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: AUDIO & RECITATION */}
            {activeTab === 'audio' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Reciter List */}
                <div className="p-4 rounded-2xl border border-white/40 dark:border-white/10 liquid-glass-card space-y-3 shadow-xs">
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
                              ? 'liquid-glass border-emerald-500 text-emerald-800 dark:text-emerald-200 font-semibold shadow-xs ring-1 ring-emerald-500/30'
                              : 'liquid-glass border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-emerald-400/40'
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
                <div className="flex items-center justify-between p-4 rounded-2xl border border-white/40 dark:border-white/10 liquid-glass-card shadow-xs">
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
                    className={`w-11 h-6 rounded-full transition-colors relative border border-white/30 ${autoScrollAudio ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    aria-label="Toggle follow recitation"
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${autoScrollAudio ? 'translate-x-6 left-0' : 'translate-x-1 left-0'}`} />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: LIBRARY, SAVED & HABITS */}
            {activeTab === 'library' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Daily Study Activity */}
                <div className="rounded-2xl p-4 liquid-glass-card glass-emerald-fusion border border-emerald-400/40 dark:border-emerald-800/40 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg liquid-glass border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                        <Activity size={16} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        Daily Study Activity
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">Today</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl liquid-glass border border-white/40 dark:border-white/10 text-center">
                      <span className="block text-2xl font-bold text-slate-800 dark:text-slate-100">{todayAyahs}</span>
                      <span className="text-[11px] text-slate-500 font-medium">Ayahs Read</span>
                    </div>
                    <div className="p-3 rounded-xl liquid-glass border border-white/40 dark:border-white/10 text-center">
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
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md border border-white/20 transition-all group"
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
                      {sortedBookmarks.map((b, bIdx) => (
                        <div
                          key={`bookmark-${b.surahId}-${b.ayahNumber}-${bIdx}`}
                          className="flex items-center justify-between p-3 rounded-2xl border border-white/40 dark:border-white/10 liquid-glass hover:border-emerald-500/50 transition-all group shadow-xs"
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
                            <div className="w-8 h-8 rounded-xl liquid-glass text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-400/40 shrink-0">
                              {b.surahId}
                            </div>
                            <div className="min-w-0 flex-1">
                              {(() => {
                                const surahMeta = (staticSurahs as any[])?.find((s) => s.number === b.surahId);
                                const urduInfo = SURAH_URDU_MAP[b.surahId];
                                const name = isUrdu && urduInfo ? `سورۃ ${urduInfo.urduName}` : (surahMeta?.englishName || `Surah ${b.surahId}`);
                                return (
                                  <>
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors block truncate">
                                      {name} • {isUrdu ? `آیت ${b.ayahNumber}` : `Ayah ${b.ayahNumber}`}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block truncate">
                                      {isUrdu ? 'آیت پر جانے کیلئے ٹیپ کریں' : 'Tap to jump to verse'}
                                    </span>
                                  </>
                                );
                              })()}
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
                    <div className="p-6 rounded-2xl border border-dashed border-white/30 dark:border-white/10 text-center space-y-1.5 liquid-glass">
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
                      {notesList.map(([key, note], nIdx) => {
                        const parts = key.split('_');
                        const sId = parseInt(parts[0], 10);
                        const aId = parseInt(parts[1], 10);
                        return (
                          <div
                            key={`note-item-${key}-${nIdx}`}
                            onClick={() => {
                              if (!isNaN(sId) && !isNaN(aId)) {
                                hapticSelection();
                                onSelectSurah?.(sId, aId);
                                onClose();
                              }
                            }}
                            className="p-3.5 rounded-2xl border border-white/40 dark:border-white/10 liquid-glass cursor-pointer hover:border-emerald-500/50 transition-all shadow-xs"
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
                <div className="p-4 rounded-2xl border border-white/40 dark:border-white/10 liquid-glass-card space-y-3 shadow-xs">
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
                      className={`w-11 h-6 rounded-full transition-colors relative border border-white/30 ${reminderTime ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      aria-label="Toggle daily reminder"
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${reminderTime ? 'translate-x-6 left-0' : 'translate-x-1 left-0'}`} />
                    </button>
                  </div>

                  {reminderTime && (
                    <div className="space-y-3 pt-2 border-t border-white/20 dark:border-white/10">
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
                          className="px-3 py-1.5 rounded-xl border border-white/40 dark:border-white/10 liquid-glass text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
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
                                : 'liquid-glass border border-white/30 dark:border-white/10 text-slate-600 dark:text-slate-300'
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

            {/* TAB 6: ABOUT, SUPPORT & DEDICATION */}
            {activeTab === 'about' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Dedicated Collapsible Tab: Iltemas e Surah Fatiha */}
                <div className="rounded-2xl border border-amber-300/50 dark:border-amber-500/30 liquid-glass-card glass-gold-fusion p-4 shadow-xs space-y-3 transition-all">
                  <button
                    type="button"
                    onClick={() => {
                      hapticSelection();
                      setIsFatihaExpanded(prev => !prev);
                    }}
                    className="w-full flex items-center justify-between gap-3 text-left cursor-pointer group"
                    aria-expanded={isFatihaExpanded}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl liquid-glass border border-amber-400/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shadow-xs shrink-0">
                        <BookOpen size={17} />
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span>Iltemas e Surah Fatiha</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          Memorial dedication & supplication
                        </p>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-lg liquid-glass border border-amber-400/30 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 transition-transform">
                      {isFatihaExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isFatihaExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="overflow-hidden pt-2 border-t border-amber-200/50 dark:border-amber-900/50 space-y-3"
                      >
                        <div className="p-3.5 rounded-xl liquid-glass border border-amber-300/40 dark:border-amber-500/20 space-y-2.5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                          <p className="font-bold text-amber-800 dark:text-amber-300">
                            Iltemas e Surah Fatiha:
                          </p>
                          <ul className="space-y-1.5 pl-1">
                            <li className="flex items-start gap-2">
                              <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                              <span className="font-medium">Madar e Aziz Sakina Banoo D/O Akhoon Mohd Kazim</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                              <span className="font-medium">Dada Jaan Syed Abbas Rizvi S/O Syed Hassan Rizvi</span>
                            </li>
                          </ul>
                          <div className="pt-2 border-t border-amber-200/30 dark:border-white/10 text-[11px] text-slate-600 dark:text-slate-400 italic">
                            Iltemas e Dua- Syed Murtaza Rizvi(Developer)
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Voluntary Support via UPI */}
                <div className="rounded-2xl border border-rose-300/40 dark:border-rose-800/40 liquid-glass-card p-4 space-y-3.5 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl liquid-glass border border-rose-400/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
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

                  <div className="p-2.5 rounded-xl liquid-glass border border-emerald-400/30 text-emerald-900 dark:text-emerald-200 text-[11px] flex items-center gap-2">
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
                      className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md border border-white/20 flex items-center justify-between transition-all active:scale-[0.99] group cursor-pointer"
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

                    <div className="p-2.5 rounded-xl liquid-glass border border-white/35 dark:border-white/10 flex items-center justify-between gap-2">
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
                        className="px-3 py-1.5 rounded-lg liquid-glass border border-emerald-400/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors flex-shrink-0"
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

                {/* Download Web App (Android / iOS) */}
                <PWAInstallButton variant="full" />

                {/* Direct App Sharing via Android Share Sheet (Bluetooth, Hotspot, Quick Share, Third-party apps) */}
                <div className="p-4 rounded-2xl liquid-glass-card glass-emerald-fusion border border-emerald-500/40 dark:border-emerald-400/20 shadow-xs space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-500/30 shrink-0">
                      <Share2 size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Share Shia Markaz App
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                        Transfer via Bluetooth, Hotspot, Quick Share, WhatsApp, or any app
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-600 dark:text-slate-300">
                    <span className="px-2 py-0.5 rounded-lg liquid-glass border border-white/40 dark:border-white/10 flex items-center gap-1">
                      <Bluetooth size={11} className="text-sky-600 dark:text-sky-400" /> Bluetooth
                    </span>
                    <span className="px-2 py-0.5 rounded-lg liquid-glass border border-white/40 dark:border-white/10 flex items-center gap-1">
                      <Wifi size={11} className="text-emerald-600 dark:text-emerald-400" /> Hotspot / Quick Share
                    </span>
                    <span className="px-2 py-0.5 rounded-lg liquid-glass border border-white/40 dark:border-white/10">
                      WhatsApp &amp; Telegram
                    </span>
                  </div>

                  <button
                    id="sidebar-share-app-btn"
                    type="button"
                    onClick={handleShareApp}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md border border-white/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    {shareSuccess ? (
                      <>
                        <Check size={15} className="text-emerald-200" />
                        <span>Share Sheet Opened / Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={15} />
                        <span>Share App via Bluetooth / Hotspot / Social</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Device Hardware & Android Permissions Hub */}
                <div className="p-3 rounded-2xl liquid-glass border border-white/35 dark:border-white/10 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                      <span>Device Permissions &amp; Hardware</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                      GPS Location (Adhan &amp; Qibla) • Notifications • Background Alarms
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      hapticImpact(ImpactStyle.Light);
                      const { requestAppPermissions } = await import('../utils/permissionManager');
                      await requestAppPermissions();
                    }}
                    className="px-2.5 py-1.5 rounded-lg liquid-glass border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-500/10 transition-colors shrink-0 cursor-pointer"
                  >
                    Recheck
                  </button>
                </div>

                {/* Legal, Privacy & Compliance */}
                <div className="rounded-2xl border border-white/40 dark:border-white/10 liquid-glass-card p-4 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={17} />
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Privacy & Data Safety
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      id="open-privacy-policy-btn"
                      type="button"
                      onClick={() => {
                        hapticSelection();
                        setPrivacyModal({ isOpen: true, tab: 'privacy' });
                      }}
                      className="p-2 rounded-xl liquid-glass hover:border-emerald-500/50 border border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1 transition-colors min-h-[44px]"
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
                      className="p-2 rounded-xl liquid-glass hover:border-emerald-500/50 border border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1 transition-colors min-h-[44px]"
                    >
                      <FileText size={12} className="text-emerald-600" />
                      <span>Terms</span>
                    </button>

                    <button
                      id="open-licenses-modal-btn"
                      type="button"
                      onClick={() => {
                        hapticSelection();
                        setPrivacyModal({ isOpen: true, tab: 'licenses' });
                      }}
                      className="p-2 rounded-xl liquid-glass hover:border-emerald-500/50 border border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1 transition-colors min-h-[44px]"
                    >
                      <Code size={12} className="text-emerald-600" />
                      <span>Licenses</span>
                    </button>

                    <button
                      id="open-deletion-modal-btn"
                      type="button"
                      onClick={() => {
                        hapticSelection();
                        setPrivacyModal({ isOpen: true, tab: 'deletion' });
                      }}
                      className="p-2 rounded-xl liquid-glass hover:border-rose-500/50 border border-rose-300/40 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 font-semibold text-xs flex items-center justify-center gap-1 transition-colors min-h-[44px]"
                    >
                      <Trash2 size={12} className="text-rose-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* App Information & Version */}
                <div className="p-3.5 rounded-2xl liquid-glass-card border border-white/40 dark:border-white/10 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Shia Quran & Tafseer</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tafseer-e-Namoona & Tafseer Al-Kauthar
                  </p>
                  <div>
                    <p className="text-[10px] text-slate-400">
                      Build {typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : '1.2.0'} • Offline Ready
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleManualCheckUpdate}
                    disabled={isCheckingUpdate}
                    className="w-full mt-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs border border-white/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:opacity-60"
                  >
                    <RefreshCw size={13} className={isCheckingUpdate ? 'animate-spin' : ''} />
                    <span>{isCheckingUpdate ? 'Checking for updates...' : 'Check for Published Updates'}</span>
                  </button>

                  {updateMessage && (
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-200">
                      {updateMessage}
                    </p>
                  )}

                  {onExitApp && (
                    <button
                      type="button"
                      onClick={() => {
                        hapticImpact(ImpactStyle.Medium);
                        onClose();
                        onExitApp();
                      }}
                      className="w-full mt-2 py-2.5 px-3 rounded-xl liquid-glass hover:border-emerald-400/50 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 border border-white/40 dark:border-white/10 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Exit App (Dua e Khatm e Quraan)</span>
                    </button>
                  )}
                </div>

                {/* Standardized Global Footer */}
                <div className="pt-4 pb-2 text-center border-t border-white/20 dark:border-white/10">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    &copy; 2026 Shia Markaz. All Rights Reserved.
                  </p>
                </div>
              </div>
            )}

          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* In-app Privacy, Terms & Data Deletion Modal */}
    <PrivacyPolicyModal
      isOpen={privacyModal.isOpen}
      onClose={() => setPrivacyModal(p => ({ ...p, isOpen: false }))}
      initialTab={privacyModal.tab}
    />
  </>
  );
}
