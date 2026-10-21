import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  X, 
  LocateFixed, 
  ChevronRight, 
  Repeat, 
  Volume2, 
  RotateCcw, 
  RotateCw, 
  Gauge 
} from 'lucide-react';
import { useAudioStore } from '../audioStore';
import { useMafatihAudioStore } from '../mafatihAudioStore';
import { useSettingsStore } from '../store';
import { hapticSelection, hapticImpact, ImpactStyle } from '../utils/haptics';
import { getMafatihUrduTitle, getMafatihUrduCategory, toUrduNumerals } from '../utils/mafatihUrdu';
import { t } from '../i18n';
import { 
  resolveAyahAudio, 
  recordAudioOutcome, 
  ayahPreloadManager, 
  QURAN_RECITERS 
} from '../utils/quranAudioEngine';
import { audioFocusCoordinator } from '../utils/audioFocus';
import { updateMediaSession as syncMediaSession, clearMediaSession } from '../utils/mediaSessionManager';

interface AudioPlayerProps {
  onSelectSurah?: (surahId: number, targetAyah?: number) => void;
  onSelectJuz?: (juzId: number, targetAyah?: number, targetSurah?: number) => void;
  onSelectMafatihItem?: (itemId: string) => void;
  selectedMafatihItem?: string | null;
  isOnHome?: boolean;
}

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5];

export default function AudioPlayer({ 
  onSelectSurah, 
  onSelectJuz, 
  onSelectMafatihItem, 
  selectedMafatihItem, 
  isOnHome 
}: AudioPlayerProps) {
  const { 
    playlist, 
    currentIndex, 
    isPlaying, 
    surahId,
    play, 
    pause, 
    next, 
    prev, 
    stop,
    setIsBuffering: setStoreBuffering
  } = useAudioStore();
  
  const { 
    reciter, 
    autoScrollAudio, 
    toggleAutoScrollAudio, 
    appLanguage,
    globalAudioSpeed,
    setGlobalAudioSpeed
  } = useSettingsStore();

  const isUrdu = appLanguage === 'ur';
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoopingAyah, setIsLoopingAyah] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);

  const currentAyah = playlist[currentIndex];

  // Resolve active audio source and mirror fallback via QuranAudioEngine
  const audioSourceInfo = resolveAyahAudio(currentAyah, surahId, reciter, fallbackAttempted);
  const audioSrc = audioSourceInfo.activeUrl;

  // Reset fallback attempt when track index changes
  useEffect(() => {
    setFallbackAttempted(false);
  }, [currentIndex, playlist]);

  // Reciter display profile
  const activeReciterProfile = QURAN_RECITERS[reciter] || QURAN_RECITERS['ar.alafasy'];

  // Handle navigate to active ayah in Mushaf view
  const handleNavigate = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!currentAyah) return;
    hapticSelection();

    const targetAyahNumber = currentAyah.numberInSurah || 1;
    const targetSurahNumber = currentAyah.surahNumber || (surahId && surahId > 0 ? surahId : 1);

    if (surahId && surahId < 0) {
      if (onSelectJuz) {
        onSelectJuz(Math.abs(surahId));
      } else if (onSelectSurah) {
        onSelectSurah(targetSurahNumber, targetAyahNumber);
      }
    } else if (onSelectSurah) {
      onSelectSurah(targetSurahNumber, targetAyahNumber);
    }

    // Broadcast event for active views to highlight and scroll
    window.dispatchEvent(new CustomEvent('scroll-to-ayah', { 
      detail: { ayahNumber: targetAyahNumber, surahNumber: targetSurahNumber } 
    }));

    // If verse element is present in DOM, smoothly scroll and highlight
    setTimeout(() => {
      const el = document.getElementById(`ayah-${targetAyahNumber}`) || 
                 document.getElementById(`ayah-${targetSurahNumber}-${targetAyahNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('bg-emerald-50', 'dark:bg-emerald-900/20', 'ring-2', 'ring-emerald-500/50', 'transition-all', 'duration-700');
        setTimeout(() => {
          el.classList.remove('bg-emerald-50', 'dark:bg-emerald-900/20', 'ring-2', 'ring-emerald-500/50');
        }, 2500);
      }
    }, 150);
  }, [currentAyah, surahId, onSelectJuz, onSelectSurah]);

  const handleContainerClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }
    handleNavigate(e);
  };

  // Synchronize audio focus & pause when external subsystem requests focus
  useEffect(() => {
    const handlePauseQuran = () => {
      pause();
    };
    window.addEventListener('pause-quran-audio', handlePauseQuran);
    return () => window.removeEventListener('pause-quran-audio', handlePauseQuran);
  }, [pause]);

  // Apply playback speed to native audio element whenever speed setting changes
  useEffect(() => {
    if (audioRef.current && globalAudioSpeed) {
      try {
        audioRef.current.playbackRate = globalAudioSpeed;
      } catch {}
    }
  }, [globalAudioSpeed, audioSrc]);

  // Main Audio Element Lifecycle & Playback Management
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    let isMounted = true;

    const attemptPlay = () => {
      if (!isMounted || !isPlaying) return;
      audioFocusCoordinator.requestAudioFocus('quran').catch(() => {});

      // Apply playback speed before starting playback
      if (globalAudioSpeed) {
        try {
          audio.playbackRate = globalAudioSpeed;
        } catch {}
      }

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (isMounted) {
              setIsBuffering(false);
              setStoreBuffering(false);
              recordAudioOutcome(fallbackAttempted ? 'mirror' : 'cdn', true);
            }
          })
          .catch(e => {
            if (e.name !== 'AbortError') {
              console.warn("[QuranAudio] Playback interrupted or blocked:", e);
              if (e.name === 'NotAllowedError') {
                pause();
              }
            }
          });
      }
    };

    if (isPlaying) {
      if (audio.readyState >= 2) {
        attemptPlay();
      } else {
        const onCanPlay = () => {
          attemptPlay();
          audio.removeEventListener('canplay', onCanPlay);
        };
        audio.addEventListener('canplay', onCanPlay);
        return () => {
          isMounted = false;
          audio.removeEventListener('canplay', onCanPlay);
        };
      }
    } else {
      audio.pause();
    }

    return () => {
      isMounted = false;
    };
  }, [isPlaying, audioSrc, currentIndex, globalAudioSpeed, fallbackAttempted, pause, setStoreBuffering]);

  // Audio Event Listeners (timeupdate, loadedmetadata, buffering, playbackRate)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
      if (globalAudioSpeed) {
        try {
          audio.playbackRate = globalAudioSpeed;
        } catch {}
      }
    };

    const onWaiting = () => {
      setIsBuffering(true);
      setStoreBuffering(true);
    };

    const onPlaying = () => {
      setIsBuffering(false);
      setStoreBuffering(false);
      if (globalAudioSpeed) {
        try {
          audio.playbackRate = globalAudioSpeed;
        } catch {}
      }
    };

    const onCanPlay = () => {
      setIsBuffering(false);
      setStoreBuffering(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('canplay', onCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('canplay', onCanPlay);
    };
  }, [audioSrc, globalAudioSpeed, setStoreBuffering]);

  // Proactively preload the next audio track via the single-instance manager (gapless)
  useEffect(() => {
    if (currentIndex < playlist.length - 1) {
      const nextAyah = playlist[currentIndex + 1];
      if (nextAyah) {
        const nextInfo = resolveAyahAudio(nextAyah, surahId, reciter, fallbackAttempted);
        if (nextInfo.activeUrl) {
          ayahPreloadManager.preloadNextAyah(nextInfo.activeUrl);
        }
      }
    }
  }, [currentIndex, playlist, reciter, surahId, fallbackAttempted]);

  // Scrub progress handler
  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!audioRef.current || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPercent = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = newPercent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    hapticSelection();
  };

  // Synchronize MediaSession API for lockscreen and smartwatch controls
  useEffect(() => {
    if (currentAyah) {
      const surahTitle = currentAyah.surahName || `Surah ${currentAyah.surahNumber || ''}`;
      syncMediaSession({
        title: `Ayah ${currentAyah.numberInSurah}`,
        artist: `${surahTitle} • ${activeReciterProfile.name}`,
        album: "The Holy Qur'an",
        playbackState: isPlaying ? 'playing' : 'paused',
        duration,
        position: currentTime,
        playbackRate: globalAudioSpeed || 1.0,
        onPlay: () => play(),
        onPause: () => pause(),
        onStop: () => stop(),
        onPrevious: currentIndex > 0 ? () => prev() : undefined,
        onNext: currentIndex < playlist.length - 1 ? () => next() : undefined,
        onSeek: (pos) => {
          if (audioRef.current) {
            audioRef.current.currentTime = pos;
            setCurrentTime(pos);
          }
        },
        onSkip: (secs) => {
          if (audioRef.current) {
            const target = Math.max(0, Math.min(duration, audioRef.current.currentTime + secs));
            audioRef.current.currentTime = target;
            setCurrentTime(target);
          }
        }
      });
    }

    return () => {
      if (!currentAyah) {
        clearMediaSession();
      }
    };
  }, [
    currentAyah, 
    currentIndex, 
    playlist.length, 
    isPlaying, 
    duration, 
    currentTime, 
    globalAudioSpeed, 
    activeReciterProfile.name, 
    play, 
    pause, 
    stop, 
    prev, 
    next
  ]);

  // Keyboard navigation shortcuts (Space: Play/Pause, Left/Right: Prev/Next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable || 
        target.tagName === 'SELECT'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        hapticImpact(ImpactStyle.Medium);
        if (isPlaying) {
          pause();
        } else {
          play();
        }
      } else if (e.code === 'ArrowRight') {
        if (currentIndex < playlist.length - 1) {
          e.preventDefault();
          hapticImpact(ImpactStyle.Light);
          next();
        }
      } else if (e.code === 'ArrowLeft') {
        if (currentIndex > 0) {
          e.preventDefault();
          hapticImpact(ImpactStyle.Light);
          prev();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentIndex, playlist.length, play, pause, next, prev]);

  // Cycle playback speed directly from player
  const handleCycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticSelection();
    const curSpeed = globalAudioSpeed || 1.0;
    const curIdx = SPEED_OPTIONS.findIndex(s => Math.abs(s - curSpeed) < 0.05);
    const nextIdx = (curIdx + 1) % SPEED_OPTIONS.length;
    const newSpeed = SPEED_OPTIONS[nextIdx];
    setGlobalAudioSpeed(newSpeed);
  };

  // Mafatih audio store subscription
  const mafatihTrack = useMafatihAudioStore((s) => s.currentTrack);
  const isMafatihPlaying = useMafatihAudioStore((s) => s.isPlaying);
  const isMafatihBuffering = useMafatihAudioStore((s) => s.isBuffering);
  const mafatihCurrentTime = useMafatihAudioStore((s) => s.currentTime);
  const mafatihDuration = useMafatihAudioStore((s) => s.duration);
  const toggleMafatihTrack = useMafatihAudioStore((s) => s.toggleTrack);
  const seekMafatih = useMafatihAudioStore((s) => s.seek);
  const skipMafatih = useMafatihAudioStore((s) => s.skip);
  const stopMafatih = useMafatihAudioStore((s) => s.stop);

  const hasQuranAudio = playlist.length > 0 && !!currentAyah;
  const hasMafatihAudio = !!mafatihTrack && (isMafatihPlaying || mafatihCurrentTime > 0);

  // If user is currently inside MafatihItemView reading any supplication,
  // MafatihItemView displays its own docked dedicated reader player at the bottom.
  const isReadingThisMafatihItem = !!selectedMafatihItem;

  if (!hasQuranAudio && (!hasMafatihAudio || isReadingThisMafatihItem)) {
    return null;
  }

  // Render floating audio player for Mafatih when Quran is not playing
  if (!hasQuranAudio && hasMafatihAudio && mafatihTrack) {
    const mProgress = mafatihDuration > 0 ? Math.min(100, (mafatihCurrentTime / mafatihDuration) * 100) : 0;
    const formatMTime = (secs: number) => {
      if (isNaN(secs) || secs <= 0) return isUrdu ? toUrduNumerals('00:00') : '00:00';
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      const str = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      return isUrdu ? toUrduNumerals(str) : str;
    };

    const displayMTitle = isUrdu ? getMafatihUrduTitle(mafatihTrack.id, mafatihTrack.title) : mafatihTrack.title;
    const displayMCat = isUrdu ? getMafatihUrduCategory(mafatihTrack.category) : (mafatihTrack.category || 'Supplication Recitation');

    return (
      <div 
        id="global-mafatih-audio-bar"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          if (mafatihTrack.id && onSelectMafatihItem) {
            hapticSelection();
            onSelectMafatihItem(mafatihTrack.id);
          }
        }}
        className={`fixed ${isOnHome ? 'bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))]' : 'bottom-[max(1rem,env(safe-area-inset-bottom,0px))]'} left-1/2 -translate-x-1/2 w-[94%] max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-emerald-300/60 dark:border-emerald-800/60 shadow-2xl rounded-2xl sm:rounded-full px-3.5 py-2.5 sm:px-5 sm:py-3 z-50 flex flex-col gap-1.5 cursor-pointer transition-all hover:border-emerald-500/70 dark:hover:border-emerald-600/70 group/bar gpu-layer`}
        title={isUrdu ? "متن پڑھنے کے لیے ٹیپ کریں" : "Tap to read supplication text"}
        dir={isUrdu ? "rtl" : "ltr"}
      >
        {/* Interactive Progress Bar */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if (mafatihDuration <= 0) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newPercent = Math.max(0, Math.min(1, clickX / rect.width));
            seekMafatih(newPercent * mafatihDuration);
            hapticSelection();
          }}
          className="w-full group/scrub py-1 -my-0.5 cursor-pointer"
          title={isUrdu ? "تلاش کریں" : "Tap to seek"}
        >
          <div className="w-full bg-slate-200/80 dark:bg-slate-800/80 h-1.5 group-hover/scrub:h-2 rounded-full overflow-hidden transition-all relative">
            <div 
              className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 h-full rounded-full transition-all duration-100"
              style={{ width: `${mProgress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Track Info */}
          <div className="flex items-center gap-2.5 overflow-hidden flex-1 p-1 -ml-1">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Volume2 size={16} className={isMafatihPlaying ? "animate-pulse" : ""} />
            </div>
            <div className="truncate min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 truncate">
                  {displayMTitle}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0 font-mono tabular-nums">
                  {formatMTime(mafatihCurrentTime)} {mafatihDuration > 0 ? `/ ${formatMTime(mafatihDuration)}` : ''}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                {displayMCat} • {isUrdu ? 'پڑھنے کے لیے ٹیپ کریں' : 'Tap to read'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                hapticImpact(ImpactStyle.Light);
                skipMafatih(-10);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 p-1.5 rounded-lg transition-colors cursor-pointer"
              title={isUrdu ? '۱۰ سیکنڈ پیچھے' : 'Rewind 10 seconds'}
              aria-label={isUrdu ? '۱۰ سیکنڈ پیچھے' : 'Rewind 10 seconds'}
            >
              <RotateCcw size={16} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                hapticImpact(ImpactStyle.Medium);
                toggleMafatihTrack(mafatihTrack);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
              title={isUrdu ? (isMafatihPlaying ? 'روکیں' : 'سنیں') : (isMafatihPlaying ? 'Pause' : 'Play')}
              aria-label={isUrdu ? (isMafatihPlaying ? 'روکیں' : 'سنیں') : (isMafatihPlaying ? 'Pause' : 'Play')}
            >
              {isMafatihBuffering ? (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : isMafatihPlaying ? (
                <Pause size={17} fill="currentColor" />
              ) : (
                <Play size={17} fill="currentColor" className={isUrdu ? 'mr-0.5' : 'ml-0.5'} />
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                hapticImpact(ImpactStyle.Light);
                skipMafatih(10);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 p-1.5 rounded-lg transition-colors cursor-pointer"
              title={isUrdu ? '۱۰ سیکنڈ آگے' : 'Forward 10 seconds'}
              aria-label={isUrdu ? '۱۰ سیکنڈ آگے' : 'Forward 10 seconds'}
            >
              <RotateCw size={16} />
            </button>

            <button
              id="global-mafatih-stop-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                hapticImpact(ImpactStyle.Light);
                stopMafatih();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchEnd={(e) => {
                e.stopPropagation();
                e.preventDefault();
                hapticImpact(ImpactStyle.Light);
                stopMafatih();
              }}
              className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 ml-0.5 cursor-pointer"
              title={isUrdu ? 'پلیئر بند کریں' : 'Close player'}
              aria-label={isUrdu ? 'بند کریں' : 'Close'}
            >
              <X size={17} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle track finished (support looping verse for Hifz memorization)
  const handleEnded = () => {
    if (isLoopingAyah && audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      } catch {}
    } else {
      next();
    }
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div 
      id="bottom-audio-player-bar"
      onClick={handleContainerClick}
      className={`fixed ${isOnHome ? 'bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))]' : 'bottom-[max(1rem,env(safe-area-inset-bottom,0px))]'} left-1/2 -translate-x-1/2 w-[94%] max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-emerald-300/60 dark:border-emerald-800/60 shadow-2xl rounded-2xl sm:rounded-full px-3.5 py-2.5 sm:px-5 sm:py-3 z-50 flex flex-col gap-1.5 cursor-pointer transition-all hover:border-emerald-500/70 dark:hover:border-emerald-600/70 group/bar gpu-layer`}
      title="Tap to return to playing verse"
    >
      {/* Interactive Micro-Progress Bar Line across top of player */}
      <div 
        onClick={handleScrub}
        className="w-full group/scrub py-1 -my-0.5 cursor-pointer"
        title="Tap or drag to seek in current Ayah"
      >
        <div className="w-full bg-slate-200/80 dark:bg-slate-800/80 h-1.5 group-hover/scrub:h-2 rounded-full overflow-hidden transition-all relative">
          <div 
            className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 h-full rounded-full transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        {/* Clickable Track Info */}
        <button
          id="audio-player-track-info-btn"
          type="button"
          onClick={handleNavigate}
          className="flex flex-col text-left mr-2 sm:mr-3 overflow-hidden flex-1 group/info p-1 -ml-1 rounded-xl hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 transition-colors focus:outline-none"
          aria-label={`Go to ${currentAyah.surahName || `Surah ${currentAyah.surahNumber}`} Ayah ${currentAyah.numberInSurah}`}
        >
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 truncate">
              {currentAyah.surahName || `Surah ${currentAyah.surahNumber}`}
            </span>
            <ChevronRight size={13} className="text-emerald-500 opacity-60 group-hover/info:opacity-100 group-hover/info:translate-x-0.5 transition-all shrink-0" />
            <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline truncate">
              • {activeReciterProfile.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 truncate font-semibold">
              {isUrdu ? `${t('ayah', appLanguage)} ${toUrduNumerals(currentAyah.numberInSurah)}` : `Ayah ${currentAyah.numberInSurah}`}
            </span>
            {duration > 0 && (
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                {Math.floor(currentTime)}s / {Math.floor(duration)}s
              </span>
            )}
          </div>
        </button>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button 
            id="audio-player-prev-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              hapticImpact(ImpactStyle.Light);
              prev();
            }}
            disabled={currentIndex === 0}
            className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 disabled:opacity-30 transition-colors p-1 cursor-pointer"
            aria-label="Previous Ayah"
          >
            <SkipBack size={18} fill="currentColor" />
          </button>
          
          <button 
            id="audio-player-play-pause-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              hapticImpact(ImpactStyle.Medium);
              if (isPlaying) {
                pause();
              } else {
                play();
              }
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform shrink-0 relative cursor-pointer"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isBuffering ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-0.5" />
            )}
          </button>
          
          <button 
            id="audio-player-next-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              hapticImpact(ImpactStyle.Light);
              next();
            }}
            disabled={currentIndex === playlist.length - 1}
            className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 disabled:opacity-30 transition-colors p-1 cursor-pointer"
            aria-label="Next Ayah"
          >
            <SkipForward size={18} fill="currentColor" />
          </button>
        </div>

        {/* Auxiliary Controls (Speed, Loop verse, Auto-scroll, Close) */}
        <div className="flex items-center gap-1 sm:gap-1.5 ml-1 sm:ml-2 shrink-0">
          {/* Universal Recitation Speed Pill */}
          <button
            type="button"
            onClick={handleCycleSpeed}
            title={`Recitation Speed: ${globalAudioSpeed || 1.0}x (Tap to cycle)`}
            className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all border cursor-pointer ${
              globalAudioSpeed && globalAudioSpeed !== 1.0
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400/60'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
            }`}
            aria-label={`Playback speed: ${globalAudioSpeed || 1.0}x`}
          >
            <div className="flex items-center gap-0.5">
              <Gauge size={11} className={globalAudioSpeed !== 1.0 ? 'text-amber-600' : 'text-slate-400'} />
              <span>{globalAudioSpeed || 1.0}x</span>
            </div>
          </button>

          {/* Loop Ayah (Hifz memorization) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              hapticSelection();
              setIsLoopingAyah(!isLoopingAyah);
            }}
            title={isLoopingAyah ? "Loop current Ayah (Hifz Mode): ON" : "Loop current Ayah (Hifz Mode): OFF"}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              isLoopingAyah
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/70 ring-1 ring-emerald-500/50'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            aria-label="Toggle Repeat Ayah"
          >
            <Repeat size={15} />
          </button>

          {/* Auto-scroll toggle */}
          <button 
            id="audio-player-autoscroll-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              hapticSelection();
              toggleAutoScrollAudio();
            }}
            title={autoScrollAudio ? "Auto-scroll to active verse: ON" : "Auto-scroll to active verse: OFF"}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              autoScrollAudio 
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 ring-1 ring-emerald-500/50' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            aria-label="Toggle Auto Scroll"
          >
            <LocateFixed size={15} />
          </button>

          {/* Close Player */}
          <button 
            id="audio-player-stop-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              hapticImpact(ImpactStyle.Light);
              ayahPreloadManager.cleanup();
              stop();
            }}
            className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 cursor-pointer"
            aria-label="Close Player"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {audioSrc && (
        <audio 
          ref={audioRef} 
          src={audioSrc} 
          preload="auto"
          onEnded={handleEnded} 
          onError={(e) => {
            console.warn("[QuranAudio] Primary audio load failure for:", audioSrc, e);
            if (!fallbackAttempted) {
              recordAudioOutcome('cdn', false);
              setFallbackAttempted(true);
            } else {
              recordAudioOutcome('mirror', false);
              pause();
            }
          }}
        />
      )}
    </div>
  );
}
