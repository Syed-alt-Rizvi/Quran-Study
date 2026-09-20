import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Play, Pause, RotateCcw, RotateCw, Volume2, 
  Copy, Check, Share2, Bookmark, BookmarkCheck, Sliders, 
  ChevronUp, ChevronDown, Sparkles, BookOpen, ExternalLink,
  Star, ListOrdered, X, Compass
} from 'lucide-react';
import { MafatihDetail, fetchMafatihItem } from '../mafatihApi';
import { useSettingsStore } from '../store';
import { getApiUrl } from '../utils/apiBase';
import { hapticImpact } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';
import { motion, AnimatePresence } from 'motion/react';

interface MafatihItemViewProps {
  itemId: string;
  onBack: () => void;
}

export default function MafatihItemView({ itemId, onBack }: MafatihItemViewProps) {
  const [item, setItem] = useState<MafatihDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Settings & Bookmarks Store
  const { 
    arabicFont, 
    isDarkMode,
    mafatihFontSize,
    mafatihShowTranslation,
    mafatihAutoScroll,
    mafatihDefaultSpeed,
    setMafatihFontSize,
    setMafatihShowTranslation,
    setMafatihAutoScroll,
    setMafatihDefaultSpeed,
    isMafatihBookmarked,
    addMafatihBookmark,
    removeMafatihBookmark,
    addMafatihRecent
  } = useSettingsStore();

  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showJumpDrawer, setShowJumpDrawer] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<number>>(new Set());

  // Audio & Recitation Follower State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(mafatihDefaultSpeed || 1);
  const [activeVerseIndex, setActiveVerseIndex] = useState<number | null>(null);
  const [audioError, setAudioError] = useState(false);

  // Verse refs for auto-scrolling
  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const lastScrolledIndex = useRef<number | null>(null);

  // Load Mafatih Item
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchMafatihItem(itemId)
      .then((data) => {
        if (!isMounted) return;
        if (!data) {
          setError('Could not load this supplication. Please try again.');
        } else {
          setItem(data);
          addMafatihRecent(data.id);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Error loading supplication.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [itemId, addMafatihRecent]);

  // Handle Audio playback & Recitation Follower
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setActiveVerseIndex(null);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      const curDur = audio.duration || duration;
      if (curDur > 0 && item && item.verses.length > 0) {
        const ratio = Math.min(Math.max(audio.currentTime / curDur, 0), 0.999);
        const totalVerses = item.verses.length;
        const targetIndex = Math.min(Math.floor(ratio * totalVerses) + 1, totalVerses);
        
        if (targetIndex !== activeVerseIndex) {
          setActiveVerseIndex(targetIndex);
        }
      }
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onError = () => {
      console.warn('Direct audio stream failed, falling back to proxy');
      setAudioError(true);
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('error', onError);
    };
  }, [item, duration, activeVerseIndex]);

  // Auto-scroll to active verse when audio is playing
  useEffect(() => {
    if (mafatihAutoScroll && isPlaying && activeVerseIndex && activeVerseIndex !== lastScrolledIndex.current) {
      const el = verseRefs.current[activeVerseIndex];
      if (el) {
        lastScrolledIndex.current = activeVerseIndex;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeVerseIndex, mafatihAutoScroll, isPlaying]);

  // Toggle Audio Play / Pause
  const togglePlay = () => {
    hapticImpact(ImpactStyle.Light);
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => {
        console.error("Audio playback error:", e);
      });
    }
  };

  // Jump Audio to specific verse
  const playFromVerse = (verseIndex: number) => {
    hapticImpact(ImpactStyle.Light);
    if (!item || !audioRef.current || !duration) return;
    const total = item.verses.length;
    const targetSec = ((verseIndex - 1) / total) * duration;
    audioRef.current.currentTime = Math.max(0, targetSec);
    setActiveVerseIndex(verseIndex);
    audioRef.current.play().catch(() => {});
  };

  const jumpToLine = (verseIndex: number) => {
    hapticImpact(ImpactStyle.Medium);
    const el = verseRefs.current[verseIndex];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setShowJumpDrawer(false);
  };

  const skipSeconds = (seconds: number) => {
    hapticImpact(ImpactStyle.Light);
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, duration || 9999));
  };

  const handleSpeedChange = (speed: number) => {
    hapticImpact(ImpactStyle.Light);
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const copyVerse = (verse: { index: number; arabic: string; translation: string }) => {
    hapticImpact(ImpactStyle.Light);
    const text = `${verse.arabic}\n\n${verse.translation}\n\n[${item?.title} - Line ${verse.index}]`;
    navigator.clipboard?.writeText?.(text);
    setCopiedIndex(verse.index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleBookmark = (verseIndex: number) => {
    hapticImpact(ImpactStyle.Light);
    setBookmarkedVerses(prev => {
      const next = new Set(prev);
      if (next.has(verseIndex)) next.delete(verseIndex);
      else next.add(verseIndex);
      return next;
    });
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Resolve audio source URL
  const resolvedAudioUrl = item?.audioUrl
    ? (audioError || item.audioUrl.includes('ya-mahdi.net')
        ? getApiUrl(`/api/mafatih/audio-proxy?url=${encodeURIComponent(item.audioUrl)}`)
        : item.audioUrl)
    : null;

  const isCurrentItemBookmarked = item ? (isMafatihBookmarked(item.id) || isMafatihBookmarked(item.code)) : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-8 max-w-4xl mx-auto flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">
          Opening recitation...
        </p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-12 max-w-xl mx-auto text-center">
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
          <BookOpen className="mx-auto text-slate-400" size={40} />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 font-serif">Supplication Not Found</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">{error || "Unable to display this item."}</p>
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-medium transition-colors"
          >
            Back to Mafatih Al Jinan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-36 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Hidden Audio Element */}
      {resolvedAudioUrl && (
        <audio
          ref={audioRef}
          src={resolvedAudioUrl}
          preload="metadata"
        />
      )}

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/85 dark:bg-slate-950/85 border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => { hapticImpact(ImpactStyle.Light); onBack(); }}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Back to catalog"
            >
              <ArrowLeft size={22} />
            </button>
            <div className="truncate">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate font-serif">
                {item.title}
              </h1>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate">
                {item.categoryChain.join(' › ') || item.mainCategory}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Jump to Line Button */}
            {item.verses.length > 5 && (
              <button
                onClick={() => {
                  hapticImpact(ImpactStyle.Light);
                  setShowJumpDrawer(!showJumpDrawer);
                  if (showSettingsDrawer) setShowSettingsDrawer(false);
                }}
                className={`p-2 rounded-full transition-colors ${
                  showJumpDrawer
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
                title="Jump to Line"
              >
                <ListOrdered size={20} />
              </button>
            )}

            {/* Bookmark Star Button */}
            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Medium);
                if (isCurrentItemBookmarked) {
                  removeMafatihBookmark(item.id);
                } else {
                  addMafatihBookmark(item.id);
                }
              }}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
              title={isCurrentItemBookmarked ? "Remove bookmark" : "Add to bookmarks"}
            >
              {isCurrentItemBookmarked ? (
                <Star size={20} className="fill-amber-400 text-amber-400" />
              ) : (
                <Star size={20} />
              )}
            </button>

            {/* Reading Preferences */}
            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                setShowSettingsDrawer(!showSettingsDrawer);
                if (showJumpDrawer) setShowJumpDrawer(false);
              }}
              className={`p-2 rounded-full transition-colors ${
                showSettingsDrawer
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
              title="Reading Preferences"
            >
              <Sliders size={20} />
            </button>
          </div>
        </div>

        {/* Expandable Preferences Drawer */}
        <AnimatePresence>
          {showSettingsDrawer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-4xl mx-auto pt-3 pb-2 border-t border-slate-200/60 dark:border-slate-800/60 mt-3 text-xs sm:text-sm space-y-3 overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Font Size */}
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Arabic Font Size:</span>
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => setMafatihFontSize(Math.max(mafatihFontSize - 2, 20))}
                      className="px-2.5 py-1 hover:bg-white dark:hover:bg-slate-800 rounded font-bold"
                    >
                      A-
                    </button>
                    <span className="px-2 font-mono font-medium">{mafatihFontSize}px</span>
                    <button
                      onClick={() => setMafatihFontSize(Math.min(mafatihFontSize + 2, 44))}
                      className="px-2.5 py-1 hover:bg-white dark:hover:bg-slate-800 rounded font-bold"
                    >
                      A+
                    </button>
                  </div>
                </div>

                {/* Show Translation Toggle */}
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">English Translation:</span>
                  <button
                    onClick={() => setMafatihShowTranslation(!mafatihShowTranslation)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      mafatihShowTranslation
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {mafatihShowTranslation ? 'Shown' : 'Hidden'}
                  </button>
                </div>

                {/* Auto Scroll Toggle */}
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Recitation Follower:</span>
                  <button
                    onClick={() => setMafatihAutoScroll(!mafatihAutoScroll)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      mafatihAutoScroll
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {mafatihAutoScroll ? 'Auto-Scroll ON' : 'Manual Scroll'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Jump to Line Drawer */}
        <AnimatePresence>
          {showJumpDrawer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-4xl mx-auto pt-3 pb-3 border-t border-slate-200/60 dark:border-slate-800/60 mt-3 text-xs overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Jump Directly to Line (1 - {item.verses.length})
                </span>
                <button
                  onClick={() => setShowJumpDrawer(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap max-h-36 overflow-y-auto p-1">
                {item.verses.map((v) => (
                  <button
                    key={`jump-${v.index}`}
                    onClick={() => jumpToLine(v.index)}
                    className={`w-9 h-8 rounded-lg font-mono text-xs font-semibold transition-all ${
                      activeVerseIndex === v.index
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {v.index}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-6 sm:px-6 space-y-6">
        {/* Intro Card */}
        {item.introduction && (
          <div className="p-5 sm:p-6 bg-gradient-to-br from-emerald-50/70 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-200/60 dark:border-emerald-900/40 rounded-3xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-sm">
              <Sparkles size={16} />
              <span>Virtues &amp; Instructions (Mafatih Al Jinan)</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
              {item.introduction}
            </p>
          </div>
        )}

        {/* Verse Count and Details Ribbon */}
        <div className="flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>{item.versesCount} {item.versesCount === 1 ? 'Line' : 'Verses / Phrases'}</span>
          {resolvedAudioUrl ? (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Volume2 size={14} /> Recitation Audio Available
            </span>
          ) : (
            <span>Text Only</span>
          )}
        </div>

        {/* Verses Container */}
        <div className="space-y-4">
          {item.verses.map((verse) => {
            const isActive = activeVerseIndex === verse.index;
            const isBookmarked = bookmarkedVerses.has(verse.index);

            return (
              <div
                key={`verse-${verse.index}`}
                ref={(el) => { verseRefs.current[verse.index] = el; }}
                id={`verse-${verse.index}`}
                className={`group relative py-5 px-5 sm:px-8 transition-all duration-300 rounded-[2rem] border ${
                  isActive
                    ? 'border-emerald-500 dark:border-emerald-400/80 shadow-[0_4px_25px_-4px_rgba(16,185,129,0.35)] bg-gradient-to-br from-emerald-50 dark:from-emerald-950/40 to-teal-50/70 dark:to-teal-950/20'
                    : 'border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Verse Header Bar */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    {/* Verse Number Badge */}
                    <span
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md scale-105'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {verse.index}
                    </span>

                    {/* Active Reciting Indicator */}
                    {isActive && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500 text-white shadow-sm animate-pulse">
                        <Volume2 size={12} /> Reciting
                      </span>
                    )}

                    {/* Play from this line button */}
                    {resolvedAudioUrl && (
                      <button
                        onClick={() => playFromVerse(verse.index)}
                        className={`p-1.5 rounded-full transition-colors ${
                          isActive && isPlaying
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50'
                            : 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title="Recite from this line"
                      >
                        {isActive && isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                    )}
                  </div>

                  {/* Actions (Copy & Bookmark) */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyVerse(verse)}
                      className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                      title="Copy verse and translation"
                    >
                      {copiedIndex === verse.index ? (
                        <Check size={16} className="text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => toggleBookmark(verse.index)}
                      className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                      title="Bookmark line"
                    >
                      {isBookmarked ? (
                        <BookmarkCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Bookmark size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Arabic Text */}
                <p
                  dir="rtl"
                  className="font-arabic text-right leading-[2.2] text-slate-900 dark:text-slate-50 select-text mb-3"
                  style={{ fontSize: `${mafatihFontSize}px`, fontFamily: arabicFont }}
                >
                  {verse.arabic}
                </p>

                {/* English Translation */}
                {mafatihShowTranslation && verse.translation && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-2">
                    <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 font-normal">
                      {verse.translation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Sticky Recitation Follower Bottom Player Bar */}
      {resolvedAudioUrl && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="max-w-4xl mx-auto flex flex-col space-y-2">
            {/* Progress Slider Bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <div className="relative flex-1 group py-1">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => {
                    const target = parseFloat(e.target.value);
                    setCurrentTime(target);
                    if (audioRef.current) {
                      audioRef.current.currentTime = target;
                    }
                  }}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 w-10">
                {formatTime(duration)}
              </span>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between">
              {/* Active Reciting Badge */}
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                  {activeVerseIndex ? `Line ${activeVerseIndex} of ${item.versesCount}` : item.title}
                </span>
              </div>

              {/* Central Audio Playback Controls */}
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => skipSeconds(-10)}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full transition-colors"
                  title="Rewind 10s"
                >
                  <RotateCcw size={18} />
                </button>

                <button
                  onClick={togglePlay}
                  className="p-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-full shadow-lg transition-transform"
                  title={isPlaying ? "Pause" : "Play Recitation"}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                </button>

                <button
                  onClick={() => skipSeconds(10)}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full transition-colors"
                  title="Forward 10s"
                >
                  <RotateCw size={18} />
                </button>
              </div>

              {/* Speed Switcher & Follower Toggle */}
              <div className="flex items-center gap-1.5">
                {[1, 1.25, 1.5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => handleSpeedChange(spd)}
                    className={`px-2 py-0.5 text-xs font-semibold rounded-md transition-colors ${
                      playbackSpeed === spd
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
