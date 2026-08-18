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
    set({
      surahId,
      playlist,
      currentIndex: startIndex,
      isPlaying: true,
      activeAyahNumber: playlist[startIndex]?.numberInSurah || null,
      activeSurahNumber: playlist[startIndex]?.surahNumber || null,
    });
  },
  
  play: () => {
    if (get().playlist.length > 0) {
      set({ isPlaying: true });
    }
  },
  
  pause: () => set({ isPlaying: false }),
  
  next: () => {
    const { currentIndex, playlist } = get();
    if (currentIndex < playlist.length - 1) {
      set({ 
        currentIndex: currentIndex + 1,
        activeAyahNumber: playlist[currentIndex + 1].numberInSurah,
        activeSurahNumber: playlist[currentIndex + 1].surahNumber || null,
      });
    } else {
      set({ isPlaying: false });
    }
  },
  
  prev: () => {
    const { currentIndex, playlist } = get();
    if (currentIndex > 0) {
      set({ 
        currentIndex: currentIndex - 1,
        activeAyahNumber: playlist[currentIndex - 1].numberInSurah,
        activeSurahNumber: playlist[currentIndex - 1].surahNumber || null,
      });
    }
  },
  
  setCurrentIndex: (index: number) => {
    const { playlist } = get();
    if (index >= 0 && index < playlist.length) {
      set({ 
        currentIndex: index,
        activeAyahNumber: playlist[index].numberInSurah,
        activeSurahNumber: playlist[index].surahNumber || null,
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