import React, { useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, X, LocateFixed } from 'lucide-react';
import { useAudioStore } from '../audioStore';
import { useSettingsStore } from '../store';
import { hapticSelection } from '../utils/haptics';

export default function AudioPlayer() {
  const { 
    playlist, 
    currentIndex, 
    isPlaying, 
    play, 
    pause, 
    next, 
    prev, 
    stop 
  } = useAudioStore();
  
  const { reciter, autoScrollAudio, toggleAutoScrollAudio } = useSettingsStore();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentAyah = playlist[currentIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            // Ignore AbortError which happens when pause() is called while play() is pending
            if (e.name !== 'AbortError') {
              console.error("Audio playback error:", e);
            }
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
    
    // Set up MediaSession API for background playback
    if ('mediaSession' in navigator && currentAyah) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `Ayah ${currentAyah.numberInSurah}`,
        artist: currentAyah.surahName || `Surah ${currentAyah.surahNumber}`,
        album: 'Quran Study App',
      });

      navigator.mediaSession.setActionHandler('play', () => play());
      navigator.mediaSession.setActionHandler('pause', () => pause());
      navigator.mediaSession.setActionHandler('previoustrack', currentIndex > 0 ? () => prev() : null);
      navigator.mediaSession.setActionHandler('nexttrack', currentIndex < playlist.length - 1 ? () => next() : null);
    }
  }, [isPlaying, currentIndex, playlist, currentAyah, play, pause, prev, next]);

  if (playlist.length === 0 || !currentAyah) {
    return null;
  }

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-200/80 dark:border-emerald-900/50 shadow-2xl rounded-full px-5 py-3 z-50 flex items-center justify-between">
      
      <div className="flex flex-col text-left mr-4 overflow-hidden">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          {currentAyah.surahName || `Surah ${currentAyah.surahNumber}`}
        </span>
        <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
          Ayah {currentAyah.numberInSurah}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={prev}
          disabled={currentIndex === 0}
          className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 disabled:opacity-50 transition-colors"
        >
          <SkipBack size={20} fill="currentColor" />
        </button>
        
        <button 
          onClick={isPlaying ? pause : play}
          className="w-10 h-10 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
        </button>
        
        <button 
          onClick={next}
          disabled={currentIndex === playlist.length - 1}
          className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 disabled:opacity-50 transition-colors"
        >
          <SkipForward size={20} fill="currentColor" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => {
            hapticSelection();
            toggleAutoScrollAudio();
          }}
          title={autoScrollAudio ? "Auto-scroll to playing verse: ON" : "Auto-scroll to playing verse: OFF"}
          className={`p-1.5 rounded-full transition-all ${
            autoScrollAudio 
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 ring-1 ring-emerald-500/50' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <LocateFixed size={18} />
        </button>

        <button 
          onClick={stop}
          className="text-slate-400 hover:text-red-500 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {currentAyah.audio && (
        <audio 
          ref={audioRef} 
          src={currentAyah.audio.replace(/\/\d+\/ar\.[^/]+/, `/${['ar.abdulbasitmurattal', 'ar.abdurrahmaansudais'].includes(reciter) ? '192' : '128'}/${reciter}`)} 
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