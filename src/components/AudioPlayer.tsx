import React, { useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, X, LocateFixed, ChevronRight } from 'lucide-react';
import { useAudioStore } from '../audioStore';
import { useSettingsStore } from '../store';
import { hapticSelection } from '../utils/haptics';

interface AudioPlayerProps {
  onSelectSurah?: (surahId: number, targetAyah?: number) => void;
  onSelectJuz?: (juzId: number, targetAyah?: number, targetSurah?: number) => void;
}

export default function AudioPlayer({ onSelectSurah, onSelectJuz }: AudioPlayerProps) {
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

  const currentAyah = playlist[currentIndex];

  const audioSrc = currentAyah?.audio
    ? currentAyah.audio.replace(/\/\d+\/ar\.[^/]+/, `/${['ar.abdulbasitmurattal', 'ar.abdurrahmaansudais'].includes(reciter) ? '192' : '128'}/${reciter}`)
    : '';

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

    // If verse element is already present in DOM, smoothly scroll and highlight
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
    // If the click is on or inside a button, let the button handle it
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    handleNavigate(e);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    let isMounted = true;

    const attemptPlay = () => {
      if (!isMounted || !isPlaying) return;
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

  // Set up MediaSession API safely for lock screen / notification controls
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator && currentAyah) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `Ayah ${currentAyah.numberInSurah}`,
          artist: currentAyah.surahName || `Surah ${currentAyah.surahNumber || ''}`,
          album: 'Shia Quran',
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

  return (
    <div 
      id="bottom-audio-player-bar"
      onClick={handleContainerClick}
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-200/80 dark:border-emerald-900/50 shadow-2xl rounded-full px-4 py-2.5 sm:px-5 sm:py-3 z-50 flex items-center justify-between cursor-pointer transition-all hover:border-emerald-400/80 dark:hover:border-emerald-700/80 group/bar"
      title="Tap to return to playing verse"
    >
      
      {/* Clickable Track Info */}
      <button
        id="audio-player-track-info-btn"
        type="button"
        onClick={handleNavigate}
        className="flex flex-col text-left mr-2 sm:mr-3 overflow-hidden flex-1 group/info p-1 -ml-1 rounded-xl hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 transition-colors focus:outline-none text-left"
        aria-label={`Go to ${currentAyah.surahName || `Surah ${currentAyah.surahNumber}`} Ayah ${currentAyah.numberInSurah}`}
      >
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 truncate">
            {currentAyah.surahName || `Surah ${currentAyah.surahNumber}`}
          </span>
          <ChevronRight size={13} className="text-emerald-500 opacity-60 group-hover/info:opacity-100 group-hover/info:translate-x-0.5 group-hover/bar:opacity-100 transition-all shrink-0" />
        </div>
        <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 truncate font-medium">
          Ayah {currentAyah.numberInSurah}
        </span>
      </button>

      {/* Playback Controls */}
      <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
        <button 
          id="audio-player-prev-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          disabled={currentIndex === 0}
          className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 disabled:opacity-40 transition-colors p-1"
          aria-label="Previous Ayah"
        >
          <SkipBack size={18} fill="currentColor" />
        </button>
        
        <button 
          id="audio-player-play-pause-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (isPlaying) {
              pause();
            } else {
              play();
            }
          }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform shrink-0"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>
        
        <button 
          id="audio-player-next-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          disabled={currentIndex === playlist.length - 1}
          className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 disabled:opacity-40 transition-colors p-1"
          aria-label="Next Ayah"
        >
          <SkipForward size={18} fill="currentColor" />
        </button>
      </div>

      {/* Auxiliary Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 ml-1 sm:ml-2 shrink-0">
        <button 
          id="audio-player-autoscroll-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            hapticSelection();
            toggleAutoScrollAudio();
          }}
          title={autoScrollAudio ? "Auto-scroll to playing verse: ON" : "Auto-scroll to playing verse: OFF"}
          className={`p-1.5 rounded-full transition-all ${
            autoScrollAudio 
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 ring-1 ring-emerald-500/50' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
          aria-label="Toggle Auto Scroll"
        >
          <LocateFixed size={17} />
        </button>

        <button 
          id="audio-player-stop-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            stop();
          }}
          className="text-slate-400 hover:text-red-500 transition-colors p-1"
          aria-label="Close Player"
        >
          <X size={19} />
        </button>
      </div>

      {audioSrc && (
        <audio 
          ref={audioRef} 
          src={audioSrc} 
          onEnded={next} 
          onError={(e) => {
            console.warn("Audio failed to load from source:", e);
            pause();
          }}
        />
      )}
    </div>
  );
}