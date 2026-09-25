import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, X, LocateFixed, ChevronRight, Repeat, Volume2 } from 'lucide-react';
import { useAudioStore } from '../audioStore';
import { useSettingsStore } from '../store';
import { hapticSelection, hapticImpact, ImpactStyle } from '../utils/haptics';

interface AudioPlayerProps {
  onSelectSurah?: (surahId: number, targetAyah?: number) => void;
  onSelectJuz?: (juzId: number, targetAyah?: number, targetSurah?: number) => void;
  isOnHome?: boolean;
}

export default function AudioPlayer({ onSelectSurah, onSelectJuz, isOnHome }: AudioPlayerProps) {
  const { 
    playlist, 
    currentIndex, 
    isPlaying, 
    surahId,
    play, 
    pause, 
    next, 
    prev, 
    stop 
  } = useAudioStore();
  
  const { reciter, autoScrollAudio, toggleAutoScrollAudio } = useSettingsStore();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoopingAyah, setIsLoopingAyah] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  const currentAyah = playlist[currentIndex];

  const audioSrc = currentAyah?.audio
    ? currentAyah.audio.replace(/\/\d+\/ar\.[^/]+/, `/${['ar.abdulbasitmurattal', 'ar.abdurrahmaansudais'].includes(reciter) ? '192' : '128'}/${reciter}`)
    : '';

  const reciterNames: Record<string, string> = {
    'ar.alafasy': 'Mishary Alafasy',
    'ar.abdulbasitmurattal': 'Abdul Basit',
    'ar.abdurrahmaansudais': 'Abdur-Rahman as-Sudais',
    'ar.minshawi': 'Mohamed al-Minshawi'
  };

  const handleNavigate = (e?: React.MouseEvent) => {
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
      const el = document.getElementById(`ayah-${targetAyahNumber}`) || document.getElementById(`ayah-${targetSurahNumber}-${targetAyahNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('bg-emerald-50', 'dark:bg-emerald-900/20', 'ring-2', 'ring-emerald-500/50', 'transition-all', 'duration-700');
        setTimeout(() => {
          el.classList.remove('bg-emerald-50', 'dark:bg-emerald-900/20', 'ring-2', 'ring-emerald-500/50');
        }, 2500);
      }
    }, 150);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }
    handleNavigate(e);
  };

  // Synchronize audio playback & pause Mafatih audio if Quran audio starts
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    let isMounted = true;

    const attemptPlay = () => {
      if (!isMounted || !isPlaying) return;
      window.dispatchEvent(new CustomEvent('pause-mafatih-audio'));
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          if (e.name !== 'AbortError') {
            console.warn("Audio playback issue:", e);
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
  }, [isPlaying, audioSrc, currentIndex]);

  // Audio time update listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onCanPlay = () => setIsBuffering(false);

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
  }, [audioSrc]);

  // Proactively preload the next audio file for instantaneous gapless playback
  useEffect(() => {
    if (currentIndex < playlist.length - 1) {
      const nextAyah = playlist[currentIndex + 1];
      if (nextAyah?.audio) {
        const nextSrc = nextAyah.audio.replace(/\/\d+\/ar\.[^/]+/, `/${['ar.abdulbasitmurattal', 'ar.abdurrahmaansudais'].includes(reciter) ? '192' : '128'}/${reciter}`);
        const preloader = new Audio();
        preloader.preload = 'auto';
        preloader.src = nextSrc;
      }
    }
  }, [currentIndex, playlist, reciter]);

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

  // Set up MediaSession API safely for lock screen / notification controls
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator && currentAyah) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `Ayah ${currentAyah.numberInSurah}`,
          artist: currentAyah.surahName || `Surah ${currentAyah.surahNumber || ''}`,
          album: 'The Holy Qur\'an',
        });

        navigator.mediaSession.setActionHandler('play', () => play());
        navigator.mediaSession.setActionHandler('pause', () => pause());
        navigator.mediaSession.setActionHandler('previoustrack', currentIndex > 0 ? () => prev() : null);
        navigator.mediaSession.setActionHandler('nexttrack', currentIndex < playlist.length - 1 ? () => next() : null);
      } catch (e) {
        // Ignore if MediaSession fails in WebView
      }
    }
  }, [currentAyah, currentIndex, playlist.length, play, pause, prev, next]);

  if (playlist.length === 0 || !currentAyah) {
    return null;
  }

  const handleEnded = () => {
    if (isLoopingAyah && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
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
              • {reciterNames[reciter] || 'Recitation'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 truncate font-semibold">
              Ayah {currentAyah.numberInSurah}
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
            className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 disabled:opacity-30 transition-colors p-1"
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
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform shrink-0 relative"
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
            className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 disabled:opacity-30 transition-colors p-1"
            aria-label="Next Ayah"
          >
            <SkipForward size={18} fill="currentColor" />
          </button>
        </div>

        {/* Auxiliary Controls (Loop verse, Auto-scroll, Close) */}
        <div className="flex items-center gap-1 sm:gap-1.5 ml-1 sm:ml-2 shrink-0">
          {/* Loop Ayah (Hifz memorization) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              hapticSelection();
              setIsLoopingAyah(!isLoopingAyah);
            }}
            title={isLoopingAyah ? "Loop current Ayah: ON" : "Loop current Ayah: OFF"}
            className={`p-1.5 rounded-full transition-all ${
              isLoopingAyah
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/70 ring-1 ring-emerald-500/50'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            aria-label="Toggle Repeat Ayah"
          >
            <Repeat size={16} />
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
            className={`p-1.5 rounded-full transition-all ${
              autoScrollAudio 
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 ring-1 ring-emerald-500/50' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            aria-label="Toggle Auto Scroll"
          >
            <LocateFixed size={16} />
          </button>

          {/* Close Player */}
          <button 
            id="audio-player-stop-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              hapticImpact(ImpactStyle.Light);
              stop();
            }}
            className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
            aria-label="Close Player"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {audioSrc && (
        <audio 
          ref={audioRef} 
          src={audioSrc} 
          onEnded={handleEnded} 
          onError={(e) => {
            console.warn("Audio failed to load from source:", e);
            pause();
          }}
        />
      )}
    </div>
  );
}
