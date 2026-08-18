import React, { useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react';
import { useAudioStore } from '../audioStore';

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
  }, [isPlaying, currentIndex, playlist]);

  if (playlist.length === 0 || !currentAyah) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-emerald-200 dark:border-emerald-900/50 shadow-2xl rounded-full px-6 py-3 z-50 flex items-center justify-between">
      
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

      <button 
        onClick={stop}
        className="ml-4 text-slate-400 hover:text-red-500 transition-colors"
      >
        <X size={20} />
      </button>

      {currentAyah.audio && (
        <audio 
          ref={audioRef} 
          src={currentAyah.audio} 
          onEnded={next} 
        />
      )}
    </div>
  );
}