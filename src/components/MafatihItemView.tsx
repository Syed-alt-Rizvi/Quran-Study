import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  ArrowLeft, Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX,
  Copy, Check, Bookmark, BookmarkCheck, Sliders, 
  ScrollText, ListOrdered, X, Compass,
  ChevronDown, ChevronUp, Repeat
} from 'lucide-react';
import { MafatihDetail, fetchMafatihItem } from '../mafatihApi';
import { useSettingsStore } from '../store';
import { useAudioStore } from '../audioStore';
import { hapticImpact, ImpactStyle } from '../utils/haptics';
import { motion, AnimatePresence } from 'motion/react';
import { getApiUrl } from '../utils/apiBase';

interface MafatihItemViewProps {
  itemId: string;
  onBack: () => void;
}

// Arabic normalization helper to identify instructions
function cleanArabicText(str: string): string {
  if (!str) return '';
  return str.replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '').trim();
}

function isInstructionLine(arabic: string, translation?: string): boolean {
  if (!arabic && !translation) return false;
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
  if (translation) {
    const t = translation.toLowerCase();
    if (
      t.startsWith('then recite') ||
      t.startsWith('then say') ||
      t.startsWith('repeat') ||
      t.startsWith('then prostrate') ||
      t.startsWith('then perform') ||
      t.includes('100 times') ||
      t.includes('70 times') ||
      t.includes('10 times')
    ) {
      return true;
    }
  }
  return false;
}

export default function MafatihItemView({ itemId, onBack }: MafatihItemViewProps) {
  const [item, setItem] = useState<MafatihDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isIntroExpanded, setIsIntroExpanded] = useState(false);

  // Settings Store
  const { 
    isDarkMode,
    arabicFont, 
    mafatihFontSize,
    mafatihShowTranslation,
    mafatihDefaultSpeed,
    setMafatihFontSize,
    setMafatihShowTranslation,
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

  // Audio Playback State (Serene player without artificial follower)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(mafatihDefaultSpeed || 1);
  const [isLooping, setIsLooping] = useState(false);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [audioError, setAudioError] = useState(false);

  // Verse refs for user-initiated jumping
  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

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

  // Compute item seed for dynamic color theme generation
  const itemSeed = useMemo(() => {
    if (!item) return 10;
    const str = item.id + (item.code || '');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash + str.charCodeAt(i) * (i + 1)) % 360;
    }
    return hash;
  }, [item]);

  // Check if verse 1 is already Bismillah to avoid duplication
  const hasFirstVerseBismillah = useMemo(() => {
    if (!item || !item.verses || item.verses.length === 0) return false;
    const firstArabic = cleanArabicText(item.verses[0].arabic);
    return firstArabic.includes('بسم الله الرحمن الرحيم');
  }, [item]);

  // Resolve audio source URL with auto-fallback to proxy
  const resolvedAudioUrl = useMemo(() => {
    if (!item?.audioUrl) return null;
    if (audioError || item.audioUrl.includes('ya-mahdi.net')) {
      return getApiUrl(`/api/mafatih/audio-proxy?url=${encodeURIComponent(item.audioUrl)}`);
    }
    return item.audioUrl;
  }, [item?.audioUrl, audioError]);

  // Pause Mafatih audio if Quran audio starts playing
  useEffect(() => {
    const handlePauseMafatih = () => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    };

    window.addEventListener('pause-mafatih-audio', handlePauseMafatih);
    return () => {
      window.removeEventListener('pause-mafatih-audio', handlePauseMafatih);
    };
  }, []);

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };
    const onCanPlay = () => setIsBuffering(false);
    const onEnded = () => {
      if (!isLooping) {
        setIsPlaying(false);
      }
    };
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onError = () => {
      setIsBuffering(false);
      if (!audioError && item?.audioUrl) {
        console.warn('Direct audio stream failed, switching to backend audio proxy');
        setAudioError(true);
      } else {
        console.error('Mafatih audio stream unreachable');
        setIsPlaying(false);
      }
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('error', onError);
    };
  }, [audioError, item?.audioUrl, isLooping]);

  // Set up MediaSession API for lock screen and notification drawer playback
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator && item && resolvedAudioUrl) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: item.title,
          artist: 'Mafatih al-Jinan • Sheikh Abbas Qummi',
          album: item.categoryChain.join(' › ') || item.mainCategory,
        });

        navigator.mediaSession.setActionHandler('play', () => {
          audioRef.current?.play().catch(() => {});
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          audioRef.current?.pause();
        });
        navigator.mediaSession.setActionHandler('seekbackward', () => {
          skipSeconds(-10);
        });
        navigator.mediaSession.setActionHandler('seekforward', () => {
          skipSeconds(10);
        });
      } catch (e) {
        // Safe failover
      }
    }
  }, [item, resolvedAudioUrl]);

  // Toggle Audio Play / Pause
  const togglePlay = () => {
    hapticImpact(ImpactStyle.Light);
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Pause any active Qur'an audio so recitations don't overlap
      useAudioStore.getState().pause();
      audioRef.current.play().catch((e) => {
        console.warn('Audio playback error, attempting recovery:', e);
        setAudioError(true);
      });
    }
  };

  const skipSeconds = useCallback((seconds: number) => {
    hapticImpact(ImpactStyle.Light);
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, duration || 99999));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const handleSpeedChange = (speed: number) => {
    hapticImpact(ImpactStyle.Light);
    setPlaybackSpeed(speed);
    setMafatihDefaultSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    handleSpeedChange(nextSpeed);
  };

  const toggleLoop = () => {
    hapticImpact(ImpactStyle.Light);
    setIsLooping((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.loop = next;
      }
      return next;
    });
  };

  const toggleMute = () => {
    hapticImpact(ImpactStyle.Light);
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.muted = next;
      }
      return next;
    });
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
      audioRef.current.muted = newVol === 0;
    }
    setIsMuted(newVol === 0);
  };

  const jumpToLine = (verseIndex: number) => {
    hapticImpact(ImpactStyle.Medium);
    const el = verseRefs.current[verseIndex];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setShowJumpDrawer(false);
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
    setBookmarkedVerses((prev) => {
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

  const isCurrentItemBookmarked = item ? (isMafatihBookmarked(item.id) || isMafatihBookmarked(item.code)) : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-8 max-w-4xl mx-auto flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          Opening recitation &amp; supplication text...
        </p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-12 max-w-md mx-auto text-center space-y-4">
        <div className="p-3 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
          <X size={24} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Unable to Load Recitation</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{error || 'Supplication not found.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 ${resolvedAudioUrl ? 'pb-36 sm:pb-32' : 'pb-16'} transition-colors duration-300`}>
      {/* Hidden Audio Element */}
      {resolvedAudioUrl && (
        <audio
          ref={audioRef}
          src={resolvedAudioUrl}
          preload="metadata"
          loop={isLooping}
        />
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3 sm:px-6 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              title="Return to Catalog"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="truncate">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate font-serif">
                {item.title}
              </h1>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
                {item.categoryChain.join(' › ') || item.mainCategory}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
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
                <ListOrdered size={18} />
              </button>
            )}

            {/* Bookmark Supplication Button */}
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
                <BookmarkCheck size={18} className="text-emerald-500 fill-emerald-500/20" />
              ) : (
                <Bookmark size={18} />
              )}
            </button>

            {/* Reading Preferences Toggle */}
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
              <Sliders size={18} />
            </button>
          </div>
        </div>

        {/* Expandable Reading Preferences Drawer */}
        <AnimatePresence>
          {showSettingsDrawer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-4xl mx-auto pt-3 pb-2 border-t border-slate-200/60 dark:border-slate-800/60 mt-3 text-xs space-y-3 overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Font Size */}
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Arabic Script Size:</span>
                  <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => setMafatihFontSize(Math.max(mafatihFontSize - 2, 20))}
                      className="px-3 py-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg font-bold text-slate-700 dark:text-slate-300"
                    >
                      A-
                    </button>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{mafatihFontSize}px</span>
                    <button
                      onClick={() => setMafatihFontSize(Math.min(mafatihFontSize + 2, 44))}
                      className="px-3 py-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg font-bold text-slate-700 dark:text-slate-300"
                    >
                      A+
                    </button>
                  </div>
                </div>

                {/* Translation Toggle */}
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Translation Display:</span>
                  <button
                    onClick={() => setMafatihShowTranslation(!mafatihShowTranslation)}
                    className={`w-full py-2 rounded-xl font-semibold transition-colors text-center border ${
                      mafatihShowTranslation
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {mafatihShowTranslation ? 'English Translation Visible' : 'Arabic Script Only'}
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
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Jump to Line (1 - {item.verses.length})
                </span>
                <button
                  onClick={() => setShowJumpDrawer(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap max-h-36 overflow-y-auto p-1">
                {item.verses.map((v) => (
                  <button
                    key={`jump-${v.index}`}
                    onClick={() => jumpToLine(v.index)}
                    className="w-8 h-8 rounded-lg font-mono text-xs font-semibold bg-slate-100 dark:bg-slate-900 hover:bg-emerald-100 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-300 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors"
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
      <main className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-36">
        {/* Virtues & Overview Card */}
        {item.introduction && (
          <div className="p-5 bg-gradient-to-br from-emerald-50/70 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-200/50 dark:border-emerald-900/30 rounded-3xl space-y-2.5 transition-all shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs uppercase tracking-wider">
                <ScrollText size={15} />
                <span>Virtues &amp; Overview</span>
              </div>
              <button
                onClick={() => setIsIntroExpanded(!isIntroExpanded)}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                <span>{isIntroExpanded ? 'Collapse' : 'Read Overview'}</span>
                {isIntroExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>
            <p className={`text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line ${
              isIntroExpanded ? '' : 'line-clamp-2'
            }`}>
              {item.introduction}
            </p>
          </div>
        )}

        {/* Majestic Bismillah Sanctification Header */}
        <div
          className="relative text-center py-8 px-4 sm:px-8 rounded-3xl border border-emerald-300/70 dark:border-emerald-800/60 bg-gradient-to-b from-emerald-50/80 via-white to-teal-50/40 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/20 shadow-xs transition-all duration-300 overflow-hidden"
        >
          {/* Majestic Calligraphic Bismillah */}
          <h2 
            dir="rtl"
            className="font-arabic text-slate-900 dark:text-slate-100 font-normal leading-[1.8] select-text"
            style={{ 
              fontSize: `${Math.max(mafatihFontSize * 1.25, 32)}px`,
              fontFamily: arabicFont 
            }}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </h2>

          {/* Sacred Salawat Invocation */}
          <p 
            dir="rtl" 
            className="font-arabic text-emerald-700/80 dark:text-emerald-400/80 text-sm mt-1"
            style={{ fontFamily: arabicFont }}
          >
            اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَآلِ مُحَمَّدٍ
          </p>

          {/* Translation */}
          {mafatihShowTranslation && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 font-serif italic">
              In the Name of Allah, the Entirely Merciful, the Especially Merciful
            </p>
          )}
        </div>

        {/* Verses Container */}
        <div className="space-y-4">
          {item.verses.map((verse) => {
            // Skip rendering verse 1 if it's already purely Bismillah
            if (verse.index === 1 && hasFirstVerseBismillah && cleanArabicText(verse.arabic).length < 35) {
              return null;
            }

            const isInstruction = isInstructionLine(verse.arabic, verse.translation);
            const isBookmarked = bookmarkedVerses.has(verse.index);

            // Render instructional rubrics with distinct gentle styling
            if (isInstruction) {
              return (
                <div
                  key={`verse-instruction-${verse.index}`}
                  ref={(el) => { verseRefs.current[verse.index] = el; }}
                  id={`verse-${verse.index}`}
                  className="py-3 px-5 sm:px-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-amber-900 dark:text-amber-200 flex items-start gap-3 text-xs"
                >
                  <Compass size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div className="space-y-1 flex-1">
                    <p dir="rtl" className="font-arabic text-sm font-medium text-right leading-[1.8]" style={{ fontFamily: arabicFont }}>
                      {verse.arabic}
                    </p>
                    {mafatihShowTranslation && verse.translation && (
                      <p className="text-xs leading-relaxed text-amber-800/90 dark:text-amber-300/80 italic">
                        {verse.translation}
                      </p>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={`verse-${verse.index}`}
                ref={(el) => { verseRefs.current[verse.index] = el; }}
                id={`verse-${verse.index}`}
                className={`surah-card-render group relative py-4 sm:py-5 px-3.5 sm:px-8 transition-all duration-200 rounded-2xl sm:rounded-3xl border ${
                  isBookmarked
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-300 dark:hover:border-emerald-700/60 shadow-2xs'
                }`}
              >
                {/* Verse Header Bar */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {/* Verse Number Badge */}
                    <span className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                      {verse.index}
                    </span>
                  </div>

                  {/* Actions (Copy & Bookmark) */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyVerse(verse)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-full transition-colors"
                      title="Copy verse and translation"
                    >
                      {copiedIndex === verse.index ? (
                        <Check size={15} className="text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy size={15} />
                      )}
                    </button>
                    <button
                      onClick={() => toggleBookmark(verse.index)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-full transition-colors"
                      title={isBookmarked ? "Remove line bookmark" : "Bookmark line"}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck size={15} className="text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Bookmark size={15} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Arabic Sacred Text */}
                <p
                  dir="rtl"
                  className="font-arabic text-right leading-[2.2] text-slate-900 dark:text-slate-100 select-text mb-3"
                  style={{ fontSize: `${mafatihFontSize}px`, fontFamily: arabicFont }}
                >
                  {verse.arabic}
                </p>

                {/* English Translation */}
                {mafatihShowTranslation && verse.translation && (
                  <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/50 mt-2">
                    <p className="text-sm sm:text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 font-normal">
                      {verse.translation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* =========================================================
          POLISHED SERENE BOTTOM AUDIO PLAYER
          Docked at screen bottom with smooth controls & safe insets
         ========================================================= */}
      {resolvedAudioUrl && (() => {
        const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
        return (
          <div className="fixed bottom-0 left-0 right-0 z-50 px-3 sm:px-6 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 shadow-2xl">
            <div className="max-w-4xl mx-auto flex flex-col space-y-2">
              {/* Scrubber Progress Slider */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 w-10 text-right shrink-0">
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
                    style={{
                      background: `linear-gradient(to right, #059669 0%, #10b981 ${progressPercent}%, ${isDarkMode ? '#334155' : '#e2e8f0'} ${progressPercent}%, ${isDarkMode ? '#334155' : '#e2e8f0'} 100%)`
                    }}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
                    aria-label="Seek audio"
                  />
                </div>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 w-10 shrink-0">
                  {duration > 0 ? (
                    `-${formatTime(Math.max(0, duration - currentTime))}`
                  ) : (
                    formatTime(duration)
                  )}
                </span>
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between gap-2">
                {/* Left: Supplication Title & Audio Pulse */}
                <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  <div className="truncate">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate block">
                      {item.mainCategory}
                    </span>
                  </div>
                </div>

                {/* Center: Audio Playback Controls */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  <button
                    onClick={() => skipSeconds(-10)}
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full transition-colors active:scale-95"
                    title="Rewind 10 seconds"
                    aria-label="Rewind 10 seconds"
                  >
                    <RotateCcw size={18} />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="w-11 h-11 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-full shadow-lg shadow-emerald-700/25 transition-all shrink-0 flex items-center justify-center relative"
                    title={isPlaying ? "Pause" : "Play Supplication"}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isBuffering ? (
                      <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : isPlaying ? (
                      <Pause size={20} fill="currentColor" />
                    ) : (
                      <Play size={20} fill="currentColor" className="ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => skipSeconds(10)}
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full transition-colors active:scale-95"
                    title="Forward 10 seconds"
                    aria-label="Forward 10 seconds"
                  >
                    <RotateCw size={18} />
                  </button>
                </div>

                {/* Right: Audio Auxiliary Controls (Speed, Repeat, Volume) */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0 justify-end flex-1 pl-2">
                  {/* Loop / Repeat Button */}
                  <button
                    onClick={toggleLoop}
                    className={`p-1.5 rounded-full transition-colors ${
                      isLooping
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                    title={isLooping ? "Repeat: ON" : "Repeat: OFF"}
                    aria-label="Toggle repeat"
                  >
                    <Repeat size={16} />
                  </button>

                  {/* Speed Button */}
                  <button
                    onClick={cycleSpeed}
                    className={`px-2 py-0.5 text-xs font-mono font-semibold rounded-lg border transition-colors ${
                      playbackSpeed !== 1
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                        : 'bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800'
                    }`}
                    title="Cycle Audio Speed (0.75x, 1x, 1.25x, 1.5x)"
                  >
                    {playbackSpeed}x
                  </button>

                  {/* Volume / Mute Toggle */}
                  <div className="hidden sm:flex items-center gap-1.5">
                    <button
                      onClick={toggleMute}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full transition-colors"
                      title={isMuted ? "Unmute" : "Mute"}
                      aria-label="Mute toggle"
                    >
                      {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-14 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
                      title="Volume"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
