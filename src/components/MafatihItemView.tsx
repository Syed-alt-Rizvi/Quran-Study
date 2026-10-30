import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';
import { 
  ArrowLeft, Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX,
  Copy, Check, Bookmark, BookmarkCheck, Sliders, 
  ScrollText, ListOrdered, X, Compass, RefreshCw,
  Repeat, Square
} from 'lucide-react';
import { MafatihDetail, fetchMafatihItem, MafatihVerse, getFullIndex } from '../mafatihApi';
import { useSettingsStore } from '../store';
import { useMafatihAudioStore, isSameTrack } from '../mafatihAudioStore';
import { hapticImpact, ImpactStyle } from '../utils/haptics';
import { motion, AnimatePresence } from 'motion/react';
import { getArabicFontFamily } from '../utils/arabicFonts';
import { getMafatihUrduTitle, getMafatihUrduCategory, toUrduNumerals } from '../utils/mafatihUrdu';
import { t } from '../i18n';

interface MafatihItemViewProps {
  itemId: string;
  onBack: () => void;
}

// Arabic normalization helper to identify rubrics & instructional lines
function cleanArabicText(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '').trim();
}

function isInstructionLine(arabic?: string, translation?: string): boolean {
  if (!arabic && !translation) return false;
  if (arabic && typeof arabic === 'string') {
    const cleaned = cleanArabicText(arabic);
    if (
      cleaned.startsWith('ثم قل') ||
      cleaned.startsWith('ثم اقرأ') ||
      cleaned.startsWith('تقول') ||
      cleaned.startsWith('تكرر') ||
      cleaned.startsWith('ثم تسجد') ||
      cleaned.startsWith('ثم تركع') ||
      cleaned.includes('مائة مرة') ||
      cleaned.includes('سبعين مرة') ||
      cleaned.includes('عشر مرات')
    ) {
      return true;
    }
  }
  if (translation && typeof translation === 'string') {
    const text = translation.toLowerCase();
    if (
      text.startsWith('then recite') ||
      text.startsWith('then say') ||
      text.startsWith('repeat') ||
      text.startsWith('then prostrate') ||
      text.startsWith('then perform') ||
      text.includes('100 times') ||
      text.includes('70 times') ||
      text.includes('10 times')
    ) {
      return true;
    }
  }
  return false;
}

// -------------------------------------------------------------
// MEMOIZED MINIMALIST VERSE ROW
// -------------------------------------------------------------
interface MafatihVerseRowProps {
  verse: MafatihVerse;
  arabicFont: string;
  mafatihFontSize: number;
  mafatihShowTranslation: boolean;
  isBookmarked: boolean;
  isCopied: boolean;
  isUrdu: boolean;
  onCopy: (verse: MafatihVerse) => void;
  onToggleBookmark: (index: number) => void;
  registerRef: (index: number, el: HTMLDivElement | null) => void;
}

const MafatihVerseRow = memo(function MafatihVerseRow({
  verse,
  arabicFont,
  mafatihFontSize,
  mafatihShowTranslation,
  isBookmarked,
  isCopied,
  isUrdu,
  onCopy,
  onToggleBookmark,
  registerRef
}: MafatihVerseRowProps) {
  const isInstruction = isInstructionLine(verse.arabic, verse.translation) || (!verse.arabic && !!verse.translation);

  if (isInstruction) {
    return (
      <div
        ref={(el) => registerRef(verse.index, el)}
        id={`verse-${verse.index}`}
        className="py-3 px-4 sm:px-5 rounded-2xl liquid-glass border border-emerald-500/35 text-slate-700 dark:text-slate-300 flex items-start gap-3 text-xs shadow-2xs"
      >
        <Compass size={15} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
        <div className="space-y-1 flex-1">
          {verse.arabic && (
            <p 
              dir="rtl" 
              className="font-arabic font-medium text-right leading-[1.8]" 
              style={{ 
                fontSize: `${Math.max(17, Math.round(mafatihFontSize * 0.5))}px`, 
                fontFamily: getArabicFontFamily(arabicFont) 
              }}
            >
              {verse.arabic}
            </p>
          )}
          {verse.translation && (
            <p 
              className="leading-relaxed text-slate-500 dark:text-slate-400 italic"
              style={{
                fontSize: `${Math.max(13, Math.round(mafatihFontSize * 0.4))}px`
              }}
            >
              {verse.translation}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={(el) => registerRef(verse.index, el)}
      id={`verse-${verse.index}`}
      className={`relative py-4 px-3.5 sm:px-5 transition-all rounded-2xl liquid-glass-card border shadow-xs ${
        isBookmarked
          ? 'glass-emerald-fusion border-emerald-500/70 ring-1 ring-emerald-500/30 shadow-md'
          : 'border-white/60 dark:border-white/10 hover:border-emerald-400/50'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500">
          {isUrdu ? toUrduNumerals(verse.index) : verse.index}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onCopy(verse)}
            className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
            title={isUrdu ? 'سطر کاپی کریں' : 'Copy line'}
            aria-label="Copy"
          >
            {isCopied ? (
              <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy size={14} />
            )}
          </button>
          <button
            onClick={() => onToggleBookmark(verse.index)}
            className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
            title={isBookmarked ? (isUrdu ? 'محفوظ سطر ختم کریں' : 'Remove bookmark') : (isUrdu ? 'سطر محفوظ کریں' : 'Bookmark line')}
            aria-label="Bookmark"
          >
            {isBookmarked ? (
              <BookmarkCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Bookmark size={14} />
            )}
          </button>
        </div>
      </div>

      {verse.arabic && (
        <p
          dir="rtl"
          lang="ar"
          className="font-arabic text-right leading-[2.4] text-slate-900 dark:text-slate-100 select-text mb-2"
          style={{ 
            fontSize: `${mafatihFontSize}px`, 
            fontFamily: getArabicFontFamily(arabicFont),
            wordSpacing: '0.08em'
          }}
        >
          {verse.arabic}
        </p>
      )}

      {mafatihShowTranslation && verse.translation && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 mt-2">
          <p 
            className="leading-relaxed text-slate-600 dark:text-slate-300 font-normal"
            style={{
              fontSize: `${Math.max(14, Math.round(mafatihFontSize * 0.44))}px`,
              lineHeight: 1.7
            }}
          >
            {verse.translation}
          </p>
        </div>
      )}
    </div>
  );
});

// -------------------------------------------------------------
// DEDICATED ISOLATED AUDIO PLAYER BAR
// -------------------------------------------------------------
interface MafatihAudioPlayerProps {
  item: MafatihDetail;
  isDarkMode: boolean;
  isUrdu: boolean;
}

const MafatihAudioPlayer = memo(function MafatihAudioPlayer({
  item,
  isDarkMode,
  isUrdu,
}: MafatihAudioPlayerProps) {
  const currentTrack = useMafatihAudioStore((s) => s.currentTrack);
  const isPlaying = useMafatihAudioStore((s) => s.isPlaying);
  const isBuffering = useMafatihAudioStore((s) => s.isBuffering);
  const currentTime = useMafatihAudioStore((s) => s.currentTime);
  const duration = useMafatihAudioStore((s) => s.duration);
  const playbackSpeed = useMafatihAudioStore((s) => s.playbackSpeed);
  const isLooping = useMafatihAudioStore((s) => s.isLooping);
  const volume = useMafatihAudioStore((s) => s.volume);
  const isMuted = useMafatihAudioStore((s) => s.isMuted);

  const toggleTrack = useMafatihAudioStore((s) => s.toggleTrack);
  const seek = useMafatihAudioStore((s) => s.seek);
  const skip = useMafatihAudioStore((s) => s.skip);
  const cycleSpeed = useMafatihAudioStore((s) => s.cycleSpeed);
  const toggleLoop = useMafatihAudioStore((s) => s.toggleLoop);
  const setVolume = useMafatihAudioStore((s) => s.setVolume);
  const toggleMute = useMafatihAudioStore((s) => s.toggleMute);
  const stopAudio = useMafatihAudioStore((s) => s.stop);

  const isThisItemActive = isSameTrack(currentTrack, {
    id: item.id,
    title: item.title,
    audioUrl: item.audioUrl || '',
  });
  const isThisItemPlaying = isThisItemActive && isPlaying;
  const isThisItemBuffering = isThisItemActive && isBuffering;
  const activeCurrentTime = isThisItemActive ? currentTime : 0;
  const activeDuration = isThisItemActive ? duration : 0;

  const handleTogglePlay = () => {
    hapticImpact(ImpactStyle.Light);
    const effectiveAudioUrl = item.audioUrl || (isThisItemActive ? currentTrack?.audioUrl : null);
    if (!effectiveAudioUrl) return;
    toggleTrack({
      id: item.id,
      title: item.title,
      category: (item.categoryChain || []).join(' › ') || item.mainCategory,
      audioUrl: effectiveAudioUrl,
    });
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const str = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return isUrdu ? toUrduNumerals(str) : str;
  };

  const progressPercent = activeDuration > 0 ? Math.min(100, (activeCurrentTime / activeDuration) * 100) : 0;
  const displayTitle = isUrdu ? getMafatihUrduTitle(item.id, item.title) : item.title;
  const displayCategory = isUrdu ? getMafatihUrduCategory(item.mainCategory) : item.mainCategory;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-3 sm:px-6 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] liquid-glass-dock border-t border-white/40 dark:border-white/10 shadow-2xl gpu-layer">
      <div className="max-w-4xl mx-auto flex flex-col space-y-2">
        {/* Scrubber Progress Slider */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 w-12 text-right shrink-0 tabular-nums">
            {formatTime(activeCurrentTime)}
          </span>
          <div className="relative flex-1 group py-1">
            <input
              type="range"
              min={0}
              max={activeDuration || 100}
              step={0.1}
              value={activeCurrentTime}
              onChange={(e) => {
                const target = parseFloat(e.target.value);
                if (isThisItemActive) {
                  seek(target);
                }
              }}
              style={{
                background: `linear-gradient(to right, #059669 0%, #10b981 ${progressPercent}%, ${isDarkMode ? '#334155' : '#e2e8f0'} ${progressPercent}%, ${isDarkMode ? '#334155' : '#e2e8f0'} 100%)`
              }}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
              aria-label="Seek audio"
            />
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 w-12 shrink-0 tabular-nums">
            {activeDuration > 0 ? `-${formatTime(Math.max(0, activeDuration - activeCurrentTime))}` : formatTime(activeDuration)}
          </span>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
            <div className={`w-2 h-2 rounded-full shrink-0 ${isThisItemPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <div className="truncate">
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate block">
                {displayTitle}
              </span>
              <span className="text-[10px] text-slate-400 truncate block">
                {displayCategory}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                if (isThisItemActive) skip(-10);
              }}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg transition-colors cursor-pointer"
              title={isUrdu ? '۱۰ سیکنڈ پیچھے' : 'Rewind 10 seconds'}
              aria-label="Rewind"
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={handleTogglePlay}
              className="w-9 h-9 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-400 rounded-full transition-all shrink-0 flex items-center justify-center cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.4)]"
              title={isThisItemPlaying ? (isUrdu ? 'روکیں' : 'Pause') : (isUrdu ? 'سنیں' : 'Play')}
              aria-label={isThisItemPlaying ? 'Pause' : 'Play'}
            >
              {isThisItemBuffering ? (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : isThisItemPlaying ? (
                <Pause size={16} fill="currentColor" />
              ) : (
                <Play size={16} fill="currentColor" className={isUrdu ? 'mr-0.5' : 'ml-0.5'} />
              )}
            </button>

            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                if (isThisItemActive) skip(10);
              }}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg transition-colors cursor-pointer"
              title={isUrdu ? '۱۰ سیکنڈ آگے' : 'Forward 10 seconds'}
              aria-label="Forward"
            >
              <RotateCw size={16} />
            </button>

            {isThisItemActive && (
              <button
                onClick={() => {
                  hapticImpact(ImpactStyle.Light);
                  stopAudio();
                }}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                title={isUrdu ? 'تلاوت ختم کریں' : 'Stop Recitation'}
                aria-label="Stop"
              >
                <Square size={15} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 justify-end flex-1 pl-2">
            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                toggleLoop();
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLooping
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title={isLooping ? (isUrdu ? 'تکرار: فعال' : 'Repeat: ON') : (isUrdu ? 'تکرار: غیر فعال' : 'Repeat: OFF')}
              aria-label="Toggle repeat"
            >
              <Repeat size={15} />
            </button>

            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                cycleSpeed();
              }}
              className="px-2 py-0.5 text-xs font-mono font-medium rounded border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400 transition-colors cursor-pointer"
              title={isUrdu ? 'آڈیو رفتار تبدیل کریں' : 'Cycle playback speed'}
            >
              {playbackSpeed}x
            </button>

            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => {
                  hapticImpact(ImpactStyle.Light);
                  toggleMute();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                title={isMuted ? (isUrdu ? 'آواز کھولیں' : 'Unmute') : (isUrdu ? 'آواز بند کریں' : 'Mute')}
                aria-label="Mute toggle"
              >
                {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
                title={isUrdu ? 'آواز' : 'Volume'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// -------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------
export default function MafatihItemView({ itemId, onBack }: MafatihItemViewProps) {
  const [item, setItem] = useState<MafatihDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isIntroExpanded, setIsIntroExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(60);

  // Settings
  const isDarkMode = useSettingsStore((s) => s.isDarkMode);
  const arabicFont = useSettingsStore((s) => s.arabicFont);
  const mafatihFontSize = useSettingsStore((s) => s.mafatihFontSize);
  const mafatihShowTranslation = useSettingsStore((s) => s.mafatihShowTranslation);
  const setMafatihFontSize = useSettingsStore((s) => s.setMafatihFontSize);
  const setMafatihShowTranslation = useSettingsStore((s) => s.setMafatihShowTranslation);
  const isMafatihBookmarked = useSettingsStore((s) => s.isMafatihBookmarked);
  const addMafatihBookmark = useSettingsStore((s) => s.addMafatihBookmark);
  const removeMafatihBookmark = useSettingsStore((s) => s.removeMafatihBookmark);
  const addMafatihRecent = useSettingsStore((s) => s.addMafatihRecent);
  const appLanguage = useSettingsStore((s) => s.appLanguage);
  const isUrdu = appLanguage === 'ur';

  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showJumpDrawer, setShowJumpDrawer] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<number>>(new Set());

  // Audio Store
  const currentTrack = useMafatihAudioStore((s) => s.currentTrack);
  const isAudioPlaying = useMafatihAudioStore((s) => s.isPlaying);
  const isAudioBuffering = useMafatihAudioStore((s) => s.isBuffering);
  const toggleTrack = useMafatihAudioStore((s) => s.toggleTrack);

  const isCurrentTrackThisItem = !!item && isSameTrack(currentTrack, {
    id: item.id,
    title: item.title,
    audioUrl: item.audioUrl || '',
  });
  const isThisItemPlaying = isCurrentTrackThisItem && isAudioPlaying;
  const isThisItemBuffering = isCurrentTrackThisItem && isAudioBuffering;

  const handleTogglePlay = useCallback(() => {
    hapticImpact(ImpactStyle.Light);
    const effectiveAudioUrl = item?.audioUrl || (isCurrentTrackThisItem ? currentTrack?.audioUrl : null);
    if (!effectiveAudioUrl || !item) return;
    toggleTrack({
      id: item.id,
      title: item.title,
      category: (item.categoryChain || []).join(' › ') || item.mainCategory,
      audioUrl: effectiveAudioUrl,
    });
  }, [item, isCurrentTrackThisItem, currentTrack, toggleTrack]);

  // Verse refs for line jumping
  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const registerVerseRef = useCallback((index: number, el: HTMLDivElement | null) => {
    verseRefs.current[index] = el;
  }, []);

  const loadItem = useCallback(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setVisibleCount(60);

    fetchMafatihItem(itemId, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        if (!data) {
          setError(isUrdu ? 'دعا لوڈ کرنے میں دشواری پیش آئی۔' : 'Could not load this supplication. Please try again.');
        } else {
          setItem(data);
          addMafatihRecent(data.id);
          if (!data.audioUrl) {
            getFullIndex().then((index) => {
              const found = index.find(
                (i) =>
                  i.id.toLowerCase() === data.id.toLowerCase() ||
                  (i.code && i.code.toLowerCase() === data.id.toLowerCase()) ||
                  i.id.toLowerCase() === itemId.toLowerCase()
              );
              if (found?.audioUrl) {
                setItem((prev) => (prev ? { ...prev, audioUrl: found.audioUrl } : prev));
              }
            }).catch(() => {});
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err.message || (isUrdu ? 'دعا لوڈ کرنے میں خرابی۔' : 'Error loading supplication.'));
        setLoading(false);
      });

    return () => controller.abort();
  }, [itemId, addMafatihRecent, isUrdu]);

  useEffect(() => {
    return loadItem();
  }, [loadItem]);

  useEffect(() => {
    if (!item?.verses || item.verses.length <= visibleCount) return;
    const timer = setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 100, item.verses.length));
    }, 120);
    return () => clearTimeout(timer);
  }, [item?.verses, visibleCount]);

  const hasFirstVerseBismillah = useMemo(() => {
    if (!item?.verses || item.verses.length === 0) return false;
    const firstArabic = cleanArabicText(item.verses[0]?.arabic || '');
    return firstArabic.includes('بسم الله الرحمن الرحيم');
  }, [item]);

  const copyVerse = useCallback((verse: MafatihVerse) => {
    hapticImpact(ImpactStyle.Light);
    const itemTitle = isUrdu ? getMafatihUrduTitle(item?.id || '', item?.title || '') : (item?.title || '');
    const lineLabel = isUrdu ? `سطر ${toUrduNumerals(verse.index)}` : `Line ${verse.index}`;
    const text = `${verse.arabic}\n\n${verse.translation}\n\n[${itemTitle} - ${lineLabel}]`;
    navigator.clipboard?.writeText?.(text);
    setCopiedIndex(verse.index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, [item?.id, item?.title, isUrdu]);

  const toggleBookmark = useCallback((verseIndex: number) => {
    hapticImpact(ImpactStyle.Light);
    setBookmarkedVerses((prev) => {
      const next = new Set(prev);
      if (next.has(verseIndex)) next.delete(verseIndex);
      else next.add(verseIndex);
      return next;
    });
  }, []);

  const jumpToLine = useCallback((verseIndex: number) => {
    hapticImpact(ImpactStyle.Medium);
    setShowJumpDrawer(false);
    if (verseIndex > visibleCount && item?.verses) {
      setVisibleCount(Math.min(verseIndex + 50, item.verses.length));
    }
    setTimeout(() => {
      const el = verseRefs.current[verseIndex];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
  }, [visibleCount, item?.verses]);

  const isCurrentItemBookmarked = item ? (isMafatihBookmarked(item.id) || isMafatihBookmarked(item.code)) : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-8 max-w-4xl mx-auto flex flex-col items-center justify-center space-y-4" dir={isUrdu ? 'rtl' : 'ltr'}>
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isUrdu ? 'دعا و زیارت کا متن لوڈ ہو رہا ہے...' : 'Opening recitation & supplication text...'}
        </p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-12 max-w-md mx-auto text-center space-y-4 pt-safe pb-safe" dir={isUrdu ? 'rtl' : 'ltr'}>
        <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-full w-10 h-10 mx-auto flex items-center justify-center">
          <X size={20} />
        </div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {isUrdu ? 'دعا لوڈ کرنے میں دشواری' : 'Unable to Load Recitation'}
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          {error || (isUrdu ? 'دعا دستیاب نہیں ہے یا انٹرنیٹ رابطہ منقطع ہے۔' : 'Supplication not found or network disconnected.')}
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
          >
            {t('return_to_catalog', appLanguage)}
          </button>
          <button
            onClick={() => loadItem()}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white dark:bg-emerald-600 rounded-xl text-xs font-medium cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>{t('retry', appLanguage)}</span>
          </button>
        </div>
      </div>
    );
  }

  const primaryTitle = isUrdu ? getMafatihUrduTitle(item.id, item.title) : item.title;
  const categoryLabel = isUrdu ? getMafatihUrduCategory(item.mainCategory) : (item.mainCategory || 'Mafatih Al Jinan');

  return (
    <div 
      className={`min-h-screen text-slate-900 dark:text-slate-100 ${item.audioUrl ? 'pb-32 sm:pb-28' : 'pb-16'} transition-colors duration-200 w-full max-w-full overflow-x-hidden min-w-0`}
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 liquid-glass border-b border-white/30 dark:border-white/10 app-header-safe pb-3 shadow-xs gpu-layer">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 px-3 sm:px-4">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onBack}
              className="p-2 -ml-1 sm:-ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
              title={t('return_to_catalog', appLanguage)}
              aria-label="Back"
            >
              <ArrowLeft size={18} className={isUrdu ? 'rotate-180' : ''} />
            </button>
            <div className="truncate">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                {primaryTitle}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {categoryLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Quick Audio Play Button in Header */}
            {(item.audioUrl || isCurrentTrackThisItem) && (
              <button
                onClick={handleTogglePlay}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isThisItemPlaying
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={isThisItemPlaying ? t('pause_audio', appLanguage) : t('play_audio', appLanguage)}
                aria-label={isThisItemPlaying ? 'Pause' : 'Play'}
              >
                {isThisItemBuffering ? (
                  <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                ) : isThisItemPlaying ? (
                  <Pause size={17} />
                ) : (
                  <Volume2 size={17} />
                )}
              </button>
            )}

            {/* Jump to Line Button */}
            {item.verses && item.verses.length > 5 && (
              <button
                onClick={() => {
                  hapticImpact(ImpactStyle.Light);
                  setShowJumpDrawer(!showJumpDrawer);
                  if (showSettingsDrawer) setShowSettingsDrawer(false);
                }}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  showJumpDrawer
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={t('jump_to_line', appLanguage)}
                aria-label="Jump to line"
              >
                <ListOrdered size={17} />
              </button>
            )}

            {/* Bookmark Button */}
            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Medium);
                if (isCurrentItemBookmarked) {
                  removeMafatihBookmark(item.id);
                } else {
                  addMafatihBookmark(item.id);
                }
              }}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isCurrentItemBookmarked ? t('remove_line_bookmark', appLanguage) : t('bookmark_line', appLanguage)}
              aria-label="Bookmark"
            >
              {isCurrentItemBookmarked ? (
                <BookmarkCheck size={17} className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Bookmark size={17} />
              )}
            </button>

            {/* Reading Preferences Toggle */}
            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                setShowSettingsDrawer(!showSettingsDrawer);
                if (showJumpDrawer) setShowJumpDrawer(false);
              }}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                showSettingsDrawer
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={t('reading_preferences', appLanguage)}
              aria-label="Settings"
            >
              <Sliders size={17} />
            </button>
          </div>
        </div>

        {/* Reading Preferences Drawer */}
        <AnimatePresence>
          {showSettingsDrawer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-4xl mx-auto pt-3 pb-1 border-t border-slate-200/60 dark:border-slate-800/60 mt-3 text-xs space-y-3 overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-slate-500 font-medium">
                    {t('arabic_script_size', appLanguage)}:
                  </span>
                  <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200/70 dark:border-slate-800">
                    <button
                      onClick={() => setMafatihFontSize(Math.max(mafatihFontSize - 3, 26))}
                      className="px-3 py-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      A-
                    </button>
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                      {isUrdu ? toUrduNumerals(mafatihFontSize) : mafatihFontSize}px
                    </span>
                    <button
                      onClick={() => setMafatihFontSize(Math.min(mafatihFontSize + 3, 96))}
                      className="px-3 py-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      A+
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-medium">
                    {t('translation_display', appLanguage)}:
                  </span>
                  <button
                    onClick={() => setMafatihShowTranslation(!mafatihShowTranslation)}
                    className={`w-full py-2 rounded-xl font-medium transition-colors text-center border cursor-pointer ${
                      mafatihShowTranslation
                        ? 'bg-slate-900 text-white dark:bg-emerald-600 border-slate-900 dark:border-emerald-600'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200/70 dark:border-slate-800'
                    }`}
                  >
                    {mafatihShowTranslation ? t('translation_visible', appLanguage) : t('arabic_only', appLanguage)}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Jump to Line Drawer */}
        <AnimatePresence>
          {showJumpDrawer && item.verses && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-4xl mx-auto pt-3 pb-2 border-t border-slate-200/60 dark:border-slate-800/60 mt-3 text-xs overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                  {isUrdu
                    ? `سطر پر جائیں (۱ تا ${toUrduNumerals(item.verses.length)})`
                    : `Jump to Line (1 - ${item.verses.length})`}
                </span>
                <button
                  onClick={() => setShowJumpDrawer(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {item.verses.map((v) => (
                  <button
                    key={`jump-${v.index}`}
                    onClick={() => jumpToLine(v.index)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white dark:bg-slate-850 dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-300 font-mono text-xs transition-colors shrink-0 cursor-pointer tabular-nums"
                  >
                    {isUrdu ? toUrduNumerals(v.index) : v.index}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-4 min-w-0 overflow-x-hidden">
        {/* Illuminated Recitation Header with Authentic Identity */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 p-5 sm:p-6 text-white shadow-sm border border-emerald-800/50 min-w-0 w-full">
          <div className="relative z-10 space-y-2.5 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {categoryLabel}
              </span>
              <span className="text-xs font-mono text-emerald-200/90 bg-white/10 px-2.5 py-1 rounded-lg">
                {isUrdu ? `${toUrduNumerals(item.verses?.length || 0)} سطریں` : `${item.verses?.length || 0} Lines`}
              </span>
            </div>

            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white leading-snug break-words">
                {primaryTitle}
              </h1>
              <p className="text-xs text-emerald-200/80 mt-1">
                {isUrdu 
                  ? 'مفاتیح الجنان • تالیف: ثقۃ الاسلام محدث شیخ عباس قمی (رح)' 
                  : 'Mafatih al-Jinan • Compiled by Sheikh Abbas Qummi (r.a)'}
              </p>
            </div>
          </div>
        </div>

        {/* Virtues & Context (if present) */}
        {item.introduction && item.verses && item.verses.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-2.5 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                {t('virtues_etiquette', appLanguage)}
              </span>
              <button
                onClick={() => setIsIntroExpanded(!isIntroExpanded)}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
              >
                {isIntroExpanded ? (isUrdu ? 'مختصر کریں' : 'Show Less') : (isUrdu ? 'مکمل پڑھیں' : 'Read More')}
              </button>
            </div>
            <p className={`text-xs leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-line break-words min-w-0 max-w-full ${
              isIntroExpanded ? '' : 'line-clamp-2'
            }`}>
              {item.introduction}
            </p>
          </div>
        )}

        {/* Serene Minimalist Bismillah Banner */}
        <div className="text-center py-6 sm:py-8 px-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
          <h2 
            dir="rtl"
            className="font-arabic text-slate-900 dark:text-slate-100 font-normal leading-[1.8] select-text"
            style={{ 
              fontSize: `${Math.max(Math.round(mafatihFontSize * 1.05), 28)}px`,
              fontFamily: getArabicFontFamily(arabicFont)
            }}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </h2>

          <p 
            dir="rtl" 
            className="font-arabic text-emerald-700 dark:text-emerald-400 mt-1"
            style={{ 
              fontSize: `${Math.max(15, Math.round(mafatihFontSize * 0.44))}px`,
              fontFamily: getArabicFontFamily(arabicFont)
            }}
          >
            اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَآلِ مُحَمَّدٍ
          </p>

          {mafatihShowTranslation && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-serif italic">
              {isUrdu 
                ? 'شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے'
                : 'In the Name of Allah, the Entirely Merciful, the Especially Merciful'}
            </p>
          )}
        </div>

        {/* PROSE VIEW FOR 0-VERSE ITEMS (Hajj guides, shrine guidelines, rituals) */}
        {(!item.verses || item.verses.length === 0) ? (
          <div className="p-5 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isUrdu ? 'متن، فضائل اور احکام' : 'Text, Virtues & Guidelines'}
              </span>
              <button
                onClick={() => {
                  hapticImpact(ImpactStyle.Light);
                  navigator.clipboard?.writeText?.(`${primaryTitle}\n\n${item.introduction}`);
                  setCopiedIndex(9999);
                  setTimeout(() => setCopiedIndex(null), 2000);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
                title={t('copy_all_text', appLanguage)}
              >
                {copiedIndex === 9999 ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedIndex === 9999 ? t('line_copied', appLanguage) : t('copy_all_text', appLanguage)}</span>
              </button>
            </div>

            <div className="space-y-4 select-text text-sm sm:text-base">
              {item.introduction ? (
                item.introduction.split('\n\n').filter((p) => p.trim().length > 0).map((para, idx) => {
                  const isArabic = /[\u0600-\u06FF]/.test(para) && !/[a-zA-Z]/.test(para);
                  return (
                    <p
                      key={idx}
                      dir={isArabic ? 'rtl' : isUrdu ? 'rtl' : 'ltr'}
                      className={`leading-[2] sm:leading-[2.2] text-slate-800 dark:text-slate-200 ${
                        isArabic ? 'font-arabic text-right text-base sm:text-lg font-medium text-emerald-950 dark:text-emerald-100 py-1' : ''
                      }`}
                      style={
                        isArabic
                          ? { fontFamily: getArabicFontFamily(arabicFont), fontSize: `${Math.max(16, Math.round(mafatihFontSize * 0.75))}px` }
                          : undefined
                      }
                    >
                      {para}
                    </p>
                  );
                })
              ) : (
                <p className="text-slate-500 italic">
                  {isUrdu ? 'یہ متن مفاتیح الجنان کی مکمل جلد میں دستیاب ہے۔' : 'This supplication content is available in the complete Mafatih Al Jinan volume.'}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Progressive Verses List */
          <div className="space-y-3">
            {item.verses.slice(0, visibleCount).map((verse) => {
              if (verse.index === 1 && hasFirstVerseBismillah && cleanArabicText(verse.arabic).length < 35 && !verse.translation?.trim()) {
                return null;
              }

              return (
                <MafatihVerseRow
                  key={`verse-${verse.index}`}
                  verse={verse}
                  arabicFont={arabicFont}
                  mafatihFontSize={mafatihFontSize}
                  mafatihShowTranslation={mafatihShowTranslation}
                  isBookmarked={bookmarkedVerses.has(verse.index)}
                  isCopied={copiedIndex === verse.index}
                  isUrdu={isUrdu}
                  onCopy={copyVerse}
                  onToggleBookmark={toggleBookmark}
                  registerRef={registerVerseRef}
                />
              );
            })}

            {visibleCount < item.verses.length && (
              <div className="text-center pt-3 pb-6">
                <button
                  onClick={() => setVisibleCount(item.verses.length)}
                  className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-emerald-500/40 transition-colors cursor-pointer"
                >
                  {isUrdu 
                    ? `تمام ${toUrduNumerals(item.verses.length)} سطور دیکھیں (${toUrduNumerals(visibleCount)} ظاہر ہیں)`
                    : `Load All ${item.verses.length} Verses (Showing ${visibleCount})`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Standardized Global Footer */}
        <footer className="mt-12 pt-6 pb-8 border-t border-slate-200/80 dark:border-slate-800/80 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            &copy; 2026 Shia Markaz. All Rights Reserved.
          </p>
        </footer>
      </main>

      {/* Docked Isolated Audio Player */}
      {(item.audioUrl || isCurrentTrackThisItem) && (
        <MafatihAudioPlayer
          key={`audio-${item.id}`}
          item={item}
          isDarkMode={isDarkMode}
          isUrdu={isUrdu}
        />
      )}
    </div>
  );
}
