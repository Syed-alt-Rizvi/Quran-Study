import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';
import { Capacitor } from '@capacitor/core';
import { 
  ArrowLeft, Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX,
  Copy, Check, Bookmark, BookmarkCheck, Sliders, 
  ScrollText, ListOrdered, X, Compass, RefreshCw,
  Repeat
} from 'lucide-react';
import { MafatihDetail, fetchMafatihItem, MafatihVerse } from '../mafatihApi';
import { useSettingsStore } from '../store';
import { useAudioStore } from '../audioStore';
import { hapticImpact, ImpactStyle } from '../utils/haptics';
import { motion, AnimatePresence } from 'motion/react';
import { getApiUrl } from '../utils/apiBase';
import { getArabicFontFamily } from '../utils/arabicFonts';

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

// -------------------------------------------------------------
// MEMOIZED VERSE ROW
// Prevents thousands of DOM nodes from re-rendering during state updates
// -------------------------------------------------------------
interface MafatihVerseRowProps {
  verse: MafatihVerse;
  arabicFont: string;
  mafatihFontSize: number;
  mafatihShowTranslation: boolean;
  isBookmarked: boolean;
  isCopied: boolean;
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
        className="py-3 px-5 sm:px-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-amber-900 dark:text-amber-200 flex items-start gap-3 text-xs"
      >
        <Compass size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div className="space-y-1.5 flex-1">
          {verse.arabic && (
            <p 
              dir="rtl" 
              className="font-arabic font-medium text-right leading-[1.8]" 
              style={{ 
                fontSize: `${Math.max(18, Math.round(mafatihFontSize * 0.5))}px`, 
                fontFamily: arabicFont 
              }}
            >
              {verse.arabic}
            </p>
          )}
          {verse.translation && (
            <p 
              className="leading-relaxed text-amber-800/90 dark:text-amber-300/80 italic font-serif"
              style={{
                fontSize: `${Math.max(14, Math.round(mafatihFontSize * 0.4))}px`
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
      className={`surah-card-render group relative py-4 sm:py-5 px-3.5 sm:px-6 transition-all duration-200 rounded-2xl sm:rounded-3xl border ${
        isBookmarked
          ? 'bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-600 shadow-sm'
          : 'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-300 dark:hover:border-emerald-700/60 shadow-2xs'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
            {verse.index}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onCopy(verse)}
            className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-full transition-colors cursor-pointer"
            title="Copy verse and translation"
          >
            {isCopied ? (
              <Check size={15} className="text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy size={15} />
            )}
          </button>
          <button
            onClick={() => onToggleBookmark(verse.index)}
            className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-full transition-colors cursor-pointer"
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

      {verse.arabic && (
        <p
          dir="rtl"
          lang="ar"
          className="font-arabic text-right leading-[2.5] text-slate-900 dark:text-slate-100 select-text mb-3"
          style={{ 
            fontSize: `${mafatihFontSize}px`, 
            fontFamily: getArabicFontFamily(arabicFont),
            wordSpacing: '0.1em'
          }}
        >
          {verse.arabic}
        </p>
      )}

      {mafatihShowTranslation && verse.translation && (
        <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/50 mt-2">
          <p 
            className="leading-relaxed text-slate-700 dark:text-slate-300 font-normal"
            style={{
              fontSize: `${Math.max(15, Math.round(mafatihFontSize * 0.44))}px`,
              lineHeight: 1.75
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
// DEDICATED AUDIO PLAYER BAR
// Completely encapsulates timeupdate events so verses never re-render
// -------------------------------------------------------------
interface MafatihAudioPlayerProps {
  item: MafatihDetail;
  audioUrl: string;
  defaultSpeed: number;
  isDarkMode: boolean;
  onSpeedChanged: (speed: number) => void;
}

const MafatihAudioPlayer = memo(function MafatihAudioPlayer({
  item,
  audioUrl,
  defaultSpeed,
  isDarkMode,
  onSpeedChanged
}: MafatihAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(defaultSpeed || 1);
  const [isLooping, setIsLooping] = useState(false);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();
  const [useDirectUrl, setUseDirectUrl] = useState(false);

  // Compute resolved stream URL:
  // On native Capacitor Android APK, direct audioUrl connects natively without browser restrictions!
  // On Web browsers, use high-speed proxy with byte-range and disk-caching support, with direct fallback!
  const audioSrc = useMemo(() => {
    if (isNative || useDirectUrl) {
      return audioUrl;
    }
    return getApiUrl(`/api/mafatih/audio-proxy?url=${encodeURIComponent(audioUrl)}`);
  }, [audioUrl, isNative, useDirectUrl]);

  // Reset state when track changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setIsBuffering(false);
    setUseDirectUrl(false);
  }, [audioUrl]);

  // When source switches to fallback while user wanted to play, auto-resume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;
    if (isPlaying && useDirectUrl) {
      try {
        audio.load();
        audio.play().catch(() => {});
      } catch {}
    }
  }, [useDirectUrl]);

  // Audio Event Listeners (buffering, timeupdate, metadata, ended, error)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => {
      setIsPlaying(true);
      setIsBuffering(false);
    };
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onCanPlay = () => setIsBuffering(false);
    const onLoadedData = () => setIsBuffering(false);
    const onEnded = () => {
      if (!isLooping) setIsPlaying(false);
    };
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onError = (e: any) => {
      console.warn("Mafatih audio error from source:", audioSrc, e);
      if (!useDirectUrl && !isNative) {
        setUseDirectUrl(true);
      } else {
        setIsBuffering(false);
        setIsPlaying(false);
      }
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('loadeddata', onLoadedData);
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
      audio.removeEventListener('loadeddata', onLoadedData);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('error', onError);
    };
  }, [audioSrc, isLooping, useDirectUrl, isNative]);

  // Pause if Quran audio starts playing
  useEffect(() => {
    const handlePause = () => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    };
    window.addEventListener('pause-mafatih-audio', handlePause);
    return () => window.removeEventListener('pause-mafatih-audio', handlePause);
  }, []);

  // MediaSession API integration and audio unmount cleanup
  useEffect(() => {
    const audio = audioRef.current;
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator && item && audioSrc) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: item.title,
          artist: 'Mafatih al-Jinan • Sheikh Abbas Qummi',
          album: (item.categoryChain || []).join(' › ') || item.mainCategory,
        });
        navigator.mediaSession.setActionHandler('play', () => {
          togglePlay();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          if (audioRef.current) audioRef.current.pause();
          setIsPlaying(false);
        });
        navigator.mediaSession.setActionHandler('seekbackward', () => skipSeconds(-10));
        navigator.mediaSession.setActionHandler('seekforward', () => skipSeconds(10));
      } catch {}
    }

    return () => {
      if (audio) {
        try {
          audio.pause();
          audio.src = '';
        } catch {}
      }
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        try {
          navigator.mediaSession.setActionHandler('play', null);
          navigator.mediaSession.setActionHandler('pause', null);
          navigator.mediaSession.setActionHandler('seekbackward', null);
          navigator.mediaSession.setActionHandler('seekforward', null);
        } catch {}
      }
    };
  }, [item, audioSrc]);

  const togglePlay = () => {
    hapticImpact(ImpactStyle.Light);
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setIsBuffering(false);
    } else {
      useAudioStore.getState().pause(); // Pause Quran audio
      window.dispatchEvent(new CustomEvent('pause-quran-audio'));
      setIsPlaying(true);
      if (audio.readyState < 2) {
        setIsBuffering(true);
      }

      // Start playing directly within user click gesture!
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsBuffering(false);
          })
          .catch((e) => {
            if (e.name !== 'AbortError') {
              console.warn("Direct play failed, switching to direct URL fallback:", e);
              if (!useDirectUrl && !isNative) {
                setUseDirectUrl(true);
              } else {
                setIsPlaying(false);
                setIsBuffering(false);
              }
            }
          });
      }
    }
  };

  const skipSeconds = (sec: number) => {
    hapticImpact(ImpactStyle.Light);
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(audioRef.current.currentTime + sec, duration || 99999));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSpeed = (speed: number) => {
    hapticImpact(ImpactStyle.Light);
    setPlaybackSpeed(speed);
    onSpeedChanged(speed);
    if (audioRef.current) audioRef.current.playbackRate = speed;
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    handleSpeed(nextSpeed);
  };

  const toggleLoop = () => {
    hapticImpact(ImpactStyle.Light);
    setIsLooping(prev => {
      const next = !prev;
      if (audioRef.current) audioRef.current.loop = next;
      return next;
    });
  };

  const toggleMute = () => {
    hapticImpact(ImpactStyle.Light);
    setIsMuted(prev => {
      const next = !prev;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  };

  const handleVolume = (v: number) => {
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
      audioRef.current.muted = v === 0;
    }
    setIsMuted(v === 0);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <>
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="auto"
        loop={isLooping}
      />
      <div className="fixed bottom-0 left-0 right-0 z-50 px-3 sm:px-6 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 shadow-2xl gpu-layer">
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
                  if (audioRef.current) audioRef.current.currentTime = target;
                }}
                style={{
                  background: `linear-gradient(to right, #059669 0%, #10b981 ${progressPercent}%, ${isDarkMode ? '#334155' : '#e2e8f0'} ${progressPercent}%, ${isDarkMode ? '#334155' : '#e2e8f0'} 100%)`
                }}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
                aria-label="Seek audio"
              />
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 w-10 shrink-0">
              {duration > 0 ? `-${formatTime(Math.max(0, duration - currentTime))}` : formatTime(duration)}
            </span>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-2">
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

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <button
                onClick={() => skipSeconds(-10)}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full transition-colors active:scale-95 cursor-pointer"
                title="Rewind 10 seconds"
                aria-label="Rewind 10 seconds"
              >
                <RotateCcw size={18} />
              </button>

              <button
                onClick={togglePlay}
                className="w-11 h-11 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-full shadow-lg shadow-emerald-700/25 transition-all shrink-0 flex items-center justify-center relative cursor-pointer"
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
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full transition-colors active:scale-95 cursor-pointer"
                title="Forward 10 seconds"
                aria-label="Forward 10 seconds"
              >
                <RotateCw size={18} />
              </button>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0 justify-end flex-1 pl-2">
              <button
                onClick={toggleLoop}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isLooping
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title={isLooping ? "Repeat: ON" : "Repeat: OFF"}
                aria-label="Toggle repeat"
              >
                <Repeat size={16} />
              </button>

              <button
                onClick={cycleSpeed}
                className={`px-2 py-0.5 text-xs font-mono font-semibold rounded-lg border transition-colors cursor-pointer ${
                  playbackSpeed !== 1
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                    : 'bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800'
                }`}
                title="Cycle Audio Speed (0.75x, 1x, 1.25x, 1.5x)"
              >
                {playbackSpeed}x
              </button>

              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={toggleMute}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full transition-colors cursor-pointer"
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
                  onChange={(e) => handleVolume(parseFloat(e.target.value))}
                  className="w-14 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
                  title="Volume"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

// -------------------------------------------------------------
// MAIN MAFATIH ITEM VIEW
// Progressive rendering, error boundaries, safe area preservation
// -------------------------------------------------------------
export default function MafatihItemView({ itemId, onBack }: MafatihItemViewProps) {
  const [item, setItem] = useState<MafatihDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isIntroExpanded, setIsIntroExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(60); // Progressive initial chunk

  // Granular settings store selectors (prevents unnecessary re-renders)
  const isDarkMode = useSettingsStore(s => s.isDarkMode);
  const arabicFont = useSettingsStore(s => s.arabicFont);
  const mafatihFontSize = useSettingsStore(s => s.mafatihFontSize);
  const mafatihShowTranslation = useSettingsStore(s => s.mafatihShowTranslation);
  const mafatihDefaultSpeed = useSettingsStore(s => s.mafatihDefaultSpeed);
  const setMafatihFontSize = useSettingsStore(s => s.setMafatihFontSize);
  const setMafatihShowTranslation = useSettingsStore(s => s.setMafatihShowTranslation);
  const setMafatihDefaultSpeed = useSettingsStore(s => s.setMafatihDefaultSpeed);
  const isMafatihBookmarked = useSettingsStore(s => s.isMafatihBookmarked);
  const addMafatihBookmark = useSettingsStore(s => s.addMafatihBookmark);
  const removeMafatihBookmark = useSettingsStore(s => s.removeMafatihBookmark);
  const addMafatihRecent = useSettingsStore(s => s.addMafatihRecent);

  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showJumpDrawer, setShowJumpDrawer] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<number>>(new Set());

  // Verse refs for line jumping
  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const registerVerseRef = useCallback((index: number, el: HTMLDivElement | null) => {
    verseRefs.current[index] = el;
  }, []);

  // Load item with AbortController for cancelable requests during rapid navigation
  const loadItem = useCallback(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setVisibleCount(60);

    fetchMafatihItem(itemId, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        if (!data) {
          setError('Could not load this supplication. Please try again.');
        } else {
          setItem(data);
          addMafatihRecent(data.id);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err.message || 'Error loading supplication.');
        setLoading(false);
      });

    return () => controller.abort();
  }, [itemId, addMafatihRecent]);

  useEffect(() => {
    return loadItem();
  }, [loadItem]);

  // Progressive rendering for long supplications (800+ verses)
  useEffect(() => {
    if (!item?.verses || item.verses.length <= visibleCount) return;
    const timer = setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 100, item.verses.length));
    }, 120);
    return () => clearTimeout(timer);
  }, [item?.verses, visibleCount]);

  // Check if verse 1 is already Bismillah to avoid duplicate callouts
  const hasFirstVerseBismillah = useMemo(() => {
    if (!item?.verses || item.verses.length === 0) return false;
    const firstArabic = cleanArabicText(item.verses[0]?.arabic || '');
    return firstArabic.includes('بسم الله الرحمن الرحيم');
  }, [item]);

  const copyVerse = useCallback((verse: MafatihVerse) => {
    hapticImpact(ImpactStyle.Light);
    const text = `${verse.arabic}\n\n${verse.translation}\n\n[${item?.title || ''} - Line ${verse.index}]`;
    navigator.clipboard?.writeText?.(text);
    setCopiedIndex(verse.index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, [item?.title]);

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
    // Ensure the target verse is rendered in the visible slice
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-12 max-w-md mx-auto text-center space-y-4 pt-safe pb-safe">
        <div className="p-3 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
          <X size={24} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Unable to Load Recitation</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {error || 'Supplication not found or network disconnected.'}
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Return to Catalog
          </button>
          <button
            onClick={() => loadItem()}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  const categoryPath = Array.isArray(item.categoryChain) && item.categoryChain.length > 0
    ? item.categoryChain.join(' › ')
    : (item.mainCategory || 'Mafatih Al Jinan');

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 ${item.audioUrl ? 'pb-36 sm:pb-32' : 'pb-16'} transition-colors duration-300`}>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 app-header-safe pb-3 shadow-xs gpu-layer">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              onClick={onBack}
              className="p-2 -ml-1 sm:-ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
              title="Return to Catalog"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="truncate">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate font-serif">
                {item.title}
              </h1>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
                {categoryPath}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Jump to Line Button */}
            {item.verses && item.verses.length > 5 && (
              <button
                onClick={() => {
                  hapticImpact(ImpactStyle.Light);
                  setShowJumpDrawer(!showJumpDrawer);
                  if (showSettingsDrawer) setShowSettingsDrawer(false);
                }}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
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
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
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
              className={`p-2 rounded-full transition-colors cursor-pointer ${
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
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Arabic Script Size:</span>
                  <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => setMafatihFontSize(Math.max(mafatihFontSize - 3, 28))}
                      className="px-3 py-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      A-
                    </button>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{mafatihFontSize}px</span>
                    <button
                      onClick={() => setMafatihFontSize(Math.min(mafatihFontSize + 3, 96))}
                      className="px-3 py-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      A+
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Translation Display:</span>
                  <button
                    onClick={() => setMafatihShowTranslation(!mafatihShowTranslation)}
                    className={`w-full py-2 rounded-xl font-semibold transition-colors text-center border cursor-pointer ${
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
          {showJumpDrawer && item.verses && (
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
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {item.verses.map((v) => (
                  <button
                    key={`jump-${v.index}`}
                    onClick={() => jumpToLine(v.index)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-slate-850 dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-300 font-mono text-xs transition-colors shrink-0 cursor-pointer"
                  >
                    {v.index}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area - Full-Width Responsive Container */}
      <main className="w-full max-w-4xl mx-auto px-2.5 sm:px-4 py-3 sm:py-6 space-y-4">
        {/* Introduction Section (only when separate verses exist) */}
        {item.introduction && item.verses && item.verses.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                Virtues &amp; Etiquette
              </span>
              <button
                onClick={() => setIsIntroExpanded(!isIntroExpanded)}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {isIntroExpanded ? 'Show Less' : 'Read More'}
              </button>
            </div>
            <p className={`text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line ${
              isIntroExpanded ? '' : 'line-clamp-2'
            }`}>
              {item.introduction}
            </p>
          </div>
        )}

        {/* Majestic Bismillah Invocation */}
        <div className="relative text-center py-6 sm:py-8 px-4 sm:px-8 rounded-2xl sm:rounded-3xl border border-emerald-300/70 dark:border-emerald-800/60 bg-gradient-to-b from-emerald-50/80 via-white to-teal-50/40 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/20 shadow-xs transition-all duration-300 overflow-hidden">
          <h2 
            dir="rtl"
            className="font-arabic text-slate-900 dark:text-slate-100 font-normal leading-[1.8] select-text"
            style={{ 
              fontSize: `${Math.max(Math.round(mafatihFontSize * 1.1), 30)}px`,
              fontFamily: arabicFont 
            }}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </h2>

          <p 
            dir="rtl" 
            className="font-arabic text-emerald-700/80 dark:text-emerald-400/80 mt-1"
            style={{ 
              fontSize: `${Math.max(16, Math.round(mafatihFontSize * 0.46))}px`,
              fontFamily: arabicFont 
            }}
          >
            اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَآلِ مُحَمَّدٍ
          </p>

          {mafatihShowTranslation && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2.5 font-serif italic">
              In the Name of Allah, the Entirely Merciful, the Especially Merciful
            </p>
          )}
        </div>

        {/* PROSE VIEW FOR 0-VERSE ITEMS (Hajj guides, shrine histories, rituals) */}
        {(!item.verses || item.verses.length === 0) ? (
          <div className="p-5 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <ScrollText size={17} />
                <span>Text, Virtues &amp; Practical Guidelines</span>
              </div>
              <button
                onClick={() => {
                  hapticImpact(ImpactStyle.Light);
                  navigator.clipboard?.writeText?.(`${item.title}\n\n${item.introduction}`);
                  setCopiedIndex(9999);
                  setTimeout(() => setCopiedIndex(null), 2000);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                title="Copy entire text"
              >
                {copiedIndex === 9999 ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedIndex === 9999 ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            <div 
              className="text-slate-800 dark:text-slate-200 leading-[2] sm:leading-[2.2] space-y-4 select-text whitespace-pre-line font-serif text-sm sm:text-base"
            >
              {item.introduction || 'This supplication content is available in the complete Mafatih Al Jinan volume.'}
            </div>
          </div>
        ) : (
          /* Progressive Verses List */
          <div className="space-y-3 sm:space-y-4">
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
                  onCopy={copyVerse}
                  onToggleBookmark={toggleBookmark}
                  registerRef={registerVerseRef}
                />
              );
            })}

            {/* Load more button if long content still has chunks */}
            {visibleCount < item.verses.length && (
              <div className="text-center pt-4 pb-6">
                <button
                  onClick={() => setVisibleCount(item.verses.length)}
                  className="px-6 py-2.5 rounded-full bg-slate-100 hover:bg-emerald-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-emerald-700 dark:text-emerald-400 transition-colors cursor-pointer shadow-2xs"
                >
                  Load All {item.verses.length} Verses (Showing {visibleCount})
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Docked Isolated Audio Player */}
      {item.audioUrl && (
        <MafatihAudioPlayer
          key={`audio-${item.id}`}
          item={item}
          audioUrl={item.audioUrl}
          defaultSpeed={mafatihDefaultSpeed}
          isDarkMode={isDarkMode}
          onSpeedChanged={setMafatihDefaultSpeed}
        />
      )}
    </div>
  );
}
