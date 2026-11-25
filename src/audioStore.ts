import { create } from 'zustand';
import { Ayah } from './api';
import { audioFocusCoordinator } from './utils/audioFocus';

interface AudioState {
  playlist: Ayah[];
  currentIndex: number;
  isPlaying: boolean;
  isBuffering: boolean;
  isLoopingAyah: boolean;
  loopCountRemaining: number;
  playbackSpeed: number;
  surahId: number | null; // This represents the context ID (e.g. Surah 1, or -1 for Juz 1)
  activeAyahNumber: number | null; // ayah.numberInSurah
  activeSurahNumber: number | null; // ayah.surahNumber
  
  setPlaylist: (surahId: number, playlist: Ayah[], startIndex?: number) => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  setCurrentIndex: (index: number) => void;
  setIsBuffering: (buffering: boolean) => void;
  setIsLoopingAyah: (looping: boolean) => void;
  toggleLoopAyah: () => void;
  setPlaybackSpeed: (speed: number) => void;
  surahViewMode: 'text' | 'player';
  setSurahViewMode: (mode: 'text' | 'player') => void;
  mafatihViewMode: 'text' | 'player';
  setMafatihViewMode: (mode: 'text' | 'player') => void;
  stop: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => {
  // Listen for focus requests or external pause events
  if (typeof window !== 'undefined') {
    window.addEventListener('pause-quran-audio', () => {
      if (get().isPlaying) {
        set({ isPlaying: false, isBuffering: false });
      }
    });
  }

  return {
    playlist: [],
    currentIndex: 0,
    isPlaying: false,
    isBuffering: false,
    isLoopingAyah: false,
    loopCountRemaining: 0,
    playbackSpeed: 1,
    surahId: null,
    activeAyahNumber: null,
    activeSurahNumber: null,
    surahViewMode: 'text',
    setSurahViewMode: (mode: 'text' | 'player') => set({ surahViewMode: mode }),
    mafatihViewMode: 'text',
    setMafatihViewMode: (mode: 'text' | 'player') => set({ mafatihViewMode: mode }),

    setPlaylist: (surahId, playlist, startIndex = 0) => {
      const healedPlaylist = playlist.map(a => ({
        ...a,
        surahNumber: a.surahNumber || (surahId > 0 ? surahId : (a as any).surah?.number || 1)
      }));
      const validIndex = Math.max(0, Math.min(startIndex, healedPlaylist.length - 1));
      const cur = healedPlaylist[validIndex];

      // Request audio focus for Quran recitation
      audioFocusCoordinator.requestAudioFocus('quran').catch(() => {});

      set({
        surahId,
        playlist: healedPlaylist,
        currentIndex: validIndex,
        isPlaying: true,
        isBuffering: true,
        activeAyahNumber: cur?.numberInSurah || null,
        activeSurahNumber: cur?.surahNumber || (surahId > 0 ? surahId : 1),
      });
    },
    
    play: () => {
      if (get().playlist.length > 0) {
        audioFocusCoordinator.requestAudioFocus('quran').catch(() => {});
        set({ isPlaying: true });
      }
    },
    
    pause: () => {
      audioFocusCoordinator.releaseAudioFocus('quran');
      set({ isPlaying: false, isBuffering: false });
    },
    
    next: () => {
      const { currentIndex, playlist, surahId } = get();
      if (currentIndex < playlist.length - 1) {
        const nextAyah = playlist[currentIndex + 1];
        set({ 
          currentIndex: currentIndex + 1,
          isBuffering: true,
          activeAyahNumber: nextAyah.numberInSurah,
          activeSurahNumber: nextAyah.surahNumber || (surahId && surahId > 0 ? surahId : 1),
        });
      } else {
        audioFocusCoordinator.releaseAudioFocus('quran');
        set({ isPlaying: false, isBuffering: false });
      }
    },
    
    prev: () => {
      const { currentIndex, playlist, surahId } = get();
      if (currentIndex > 0) {
        const prevAyah = playlist[currentIndex - 1];
        set({ 
          currentIndex: currentIndex - 1,
          isBuffering: true,
          activeAyahNumber: prevAyah.numberInSurah,
          activeSurahNumber: prevAyah.surahNumber || (surahId && surahId > 0 ? surahId : 1),
        });
      }
    },
    
    setCurrentIndex: (index: number) => {
      const { playlist, surahId } = get();
      if (index >= 0 && index < playlist.length) {
        const targetAyah = playlist[index];
        set({ 
          currentIndex: index,
          isBuffering: true,
          activeAyahNumber: targetAyah.numberInSurah,
          activeSurahNumber: targetAyah.surahNumber || (surahId && surahId > 0 ? surahId : 1),
        });
      }
    },

    setIsBuffering: (buffering: boolean) => {
      set({ isBuffering: buffering });
    },

    setIsLoopingAyah: (looping: boolean) => {
      set({ isLoopingAyah: looping });
    },

    toggleLoopAyah: () => {
      set((s) => ({ isLoopingAyah: !s.isLoopingAyah }));
    },

    setPlaybackSpeed: (speed: number) => {
      set({ playbackSpeed: speed });
    },

    stop: () => {
      audioFocusCoordinator.releaseAudioFocus('quran');
      set({
        playlist: [],
        currentIndex: 0,
        isPlaying: false,
        isBuffering: false,
        surahId: null,
        activeAyahNumber: null,
        activeSurahNumber: null,
      });
    }
  };
});