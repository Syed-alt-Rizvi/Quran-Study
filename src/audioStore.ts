import { create } from 'zustand';
import { Ayah } from './api';

interface AudioState {
  playlist: Ayah[];
  currentIndex: number;
  isPlaying: boolean;
  surahId: number | null; // This represents the context ID (e.g. Surah 1, or -1 for Juz 1)
  activeAyahNumber: number | null; // ayah.numberInSurah
  activeSurahNumber: number | null; // ayah.surahNumber
  
  setPlaylist: (surahId: number, playlist: Ayah[], startIndex?: number) => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  setCurrentIndex: (index: number) => void;
  stop: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  playlist: [],
  currentIndex: 0,
  isPlaying: false,
  surahId: null,
  activeAyahNumber: null,
  activeSurahNumber: null,

  setPlaylist: (surahId, playlist, startIndex = 0) => {
    const healedPlaylist = playlist.map(a => ({
      ...a,
      surahNumber: a.surahNumber || (surahId > 0 ? surahId : (a as any).surah?.number || 1)
    }));
    const cur = healedPlaylist[startIndex];
    set({
      surahId,
      playlist: healedPlaylist,
      currentIndex: startIndex,
      isPlaying: true,
      activeAyahNumber: cur?.numberInSurah || null,
      activeSurahNumber: cur?.surahNumber || (surahId > 0 ? surahId : 1),
    });
  },
  
  play: () => {
    if (get().playlist.length > 0) {
      set({ isPlaying: true });
    }
  },
  
  pause: () => set({ isPlaying: false }),
  
  next: () => {
    const { currentIndex, playlist, surahId } = get();
    if (currentIndex < playlist.length - 1) {
      const nextAyah = playlist[currentIndex + 1];
      set({ 
        currentIndex: currentIndex + 1,
        activeAyahNumber: nextAyah.numberInSurah,
        activeSurahNumber: nextAyah.surahNumber || (surahId && surahId > 0 ? surahId : 1),
      });
    } else {
      set({ isPlaying: false });
    }
  },
  
  prev: () => {
    const { currentIndex, playlist, surahId } = get();
    if (currentIndex > 0) {
      const prevAyah = playlist[currentIndex - 1];
      set({ 
        currentIndex: currentIndex - 1,
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
        activeAyahNumber: targetAyah.numberInSurah,
        activeSurahNumber: targetAyah.surahNumber || (surahId && surahId > 0 ? surahId : 1),
      });
    }
  },

  stop: () => {
    set({
      playlist: [],
      currentIndex: 0,
      isPlaying: false,
      surahId: null,
      activeAyahNumber: null,
      activeSurahNumber: null,
    });
  }
}));