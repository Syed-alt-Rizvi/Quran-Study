import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Bookmark {
  surahId: number;
  ayahNumber: number; // ayah.numberInSurah
}

interface LastRead {
  surahId: number;
  ayahNumber: number;
  type: 'text' | 'tafseer';
  surahName?: string;
}

interface HabitStats {
  dailyAyahsRead: Record<string, number>;
  dailyTafseerRead: Record<string, number>;
}

export type AppTab = 'quran' | 'mafatih' | 'science' | 'discuss';

interface SettingsState {
  isDarkMode: boolean;
  fontSize: number; // For Arabic text
  arabicFont: string;
  englishFont: string;
  hasSeenWelcome: boolean;
  bookmarks: Bookmark[];
  lastRead: LastRead | null;
  habitStats: HabitStats;
  tafseerNotes: Record<string, string>;
  showTranslation: boolean;
  translationLanguages: ('en' | 'ur')[];
  tafseerLanguages: ('en' | 'ur')[];
  tafseerProvider: 'namoona' | 'kauthar';
  tafseerZoom: number; // Percentage zoom for Tafseer readability (default 100)
  readProgress: Record<number, number>; // Maps surahId to highest read ayahNumber
  reminderTime: string | null;
  reminderSound: string; // HH:MM format
  autoScrollAudio: boolean;
  reciter: string;
  userName: string;
  
  // Generalized App Utility Settings
  defaultAppTab: AppTab;
  hapticsEnabled: boolean;
  mafatihFontSize: number;
  mafatihShowTranslation: boolean;
  mafatihDefaultSpeed: number;
  globalAudioSpeed: number; // Reimagined unified global playback speed (0.5x, 0.75x, 1x, 1.25x, 1.5x, 1.75x, 2x)
  scienceCategory: string;
  mafatihBookmarks: string[];
  mafatihRecentIds: string[];

  toggleDarkMode: () => void;
  setFontSize: (size: number) => void;
  setArabicFont: (font: string) => void;
  setEnglishFont: (font: string) => void;
  toggleShowTranslation: () => void;
  toggleTranslationLanguage: (lang: 'en' | 'ur') => void;
  toggleTafseerLanguage: (lang: 'en' | 'ur') => void;
  setTafseerProvider: (provider: 'namoona' | 'kauthar') => void;
  setTafseerZoom: (zoom: number) => void;
  toggleAutoScrollAudio: () => void;
  setAutoScrollAudio: (val: boolean) => void;
  setHasSeenWelcome: (seen: boolean) => void;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (surahId: number, ayahNumber: number) => void;
  isBookmarked: (surahId: number, ayahNumber: number) => boolean;
  setLastRead: (lastRead: LastRead) => void;
  incrementAyahsRead: (date: string) => void;
  incrementTafseerRead: (date: string) => void;
  saveTafseerNote: (key: string, note: string) => void;
  setReminderTime: (time: string | null) => void;
  setReminderSound: (sound: string) => void;
  setReciter: (reciter: string) => void;
  setUserName: (name: string) => void;
  setDefaultAppTab: (tab: AppTab) => void;
  toggleHaptics: () => void;
  setMafatihFontSize: (val: number) => void;
  toggleMafatihShowTranslation: () => void;
  setMafatihShowTranslation: (val: boolean) => void;
  setMafatihDefaultSpeed: (speed: number) => void;
  setGlobalAudioSpeed: (speed: number) => void;
  setScienceCategory: (cat: string) => void;
  addMafatihBookmark: (id: string) => void;
  removeMafatihBookmark: (id: string) => void;
  isMafatihBookmarked: (id: string) => boolean;
  addMafatihRecent: (id: string) => void;
  clearMafatihRecents: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      isDarkMode: false,
      fontSize: 32,
      arabicFont: 'Amiri',
      englishFont: 'Inter',
      hasSeenWelcome: false,
      bookmarks: [],
      lastRead: null,
      habitStats: { dailyAyahsRead: {}, dailyTafseerRead: {} },
      tafseerNotes: {},
      showTranslation: true,
      translationLanguages: ['en'],
      tafseerLanguages: ['ur'],
      tafseerProvider: 'namoona',
      tafseerZoom: 100,
      readProgress: {},
      reminderTime: null,
      reminderSound: 'bismillah.ogg',
      autoScrollAudio: false,
      reciter: 'ar.alafasy',
      userName: '',
      defaultAppTab: 'quran',
      hapticsEnabled: true,
      mafatihFontSize: 28,
      mafatihShowTranslation: true,
      mafatihDefaultSpeed: 1,
      globalAudioSpeed: 1,
      scienceCategory: 'all',
      mafatihBookmarks: [],
      mafatihRecentIds: ['maf_dua46b', 'maf_dua40', 'maf_ziy86'],
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setFontSize: (size) => set({ fontSize: size }),
      setArabicFont: (font) => set({ arabicFont: font }),
      setEnglishFont: (font) => set({ englishFont: font }),
      toggleShowTranslation: () => set((state) => ({ showTranslation: !state.showTranslation })),
      toggleTranslationLanguage: (lang) => set((state) => ({
        translationLanguages: state.translationLanguages.includes(lang)
          ? state.translationLanguages.filter(l => l !== lang)
          : [...state.translationLanguages, lang]
      })),
      toggleTafseerLanguage: (lang) => set((state) => ({
        tafseerLanguages: state.tafseerLanguages.includes(lang)
          ? state.tafseerLanguages.filter(l => l !== lang)
          : [...state.tafseerLanguages, lang]
      })),
      setTafseerProvider: (provider) => set({ tafseerProvider: provider }),
      setTafseerZoom: (zoom) => set({ tafseerZoom: Math.max(70, Math.min(250, zoom)) }),
      toggleAutoScrollAudio: () => set((state) => ({ autoScrollAudio: !state.autoScrollAudio })),
      setAutoScrollAudio: (val) => set({ autoScrollAudio: val }),
      setHasSeenWelcome: (seen) => set({ hasSeenWelcome: seen }),
      addBookmark: (bookmark) => set((state) => ({ 
        bookmarks: [...state.bookmarks.filter(b => !(b.surahId === bookmark.surahId && b.ayahNumber === bookmark.ayahNumber)), bookmark] 
      })),
      removeBookmark: (surahId, ayahNumber) => set((state) => ({
        bookmarks: state.bookmarks.filter(b => !(b.surahId === surahId && b.ayahNumber === ayahNumber))
      })),
      isBookmarked: (surahId, ayahNumber) => {
        return get().bookmarks.some(b => b.surahId === surahId && b.ayahNumber === ayahNumber);
      },
      setLastRead: (lastRead) => set((state) => ({ 
        lastRead,
        readProgress: {
          ...state.readProgress,
          [lastRead.surahId]: Math.max(state.readProgress[lastRead.surahId] || 0, lastRead.ayahNumber)
        }
      })),
      incrementAyahsRead: (date) => set((state) => ({
        habitStats: {
          ...state.habitStats,
          dailyAyahsRead: {
            ...state.habitStats.dailyAyahsRead,
            [date]: (state.habitStats.dailyAyahsRead[date] || 0) + 1
          }
        }
      })),
      incrementTafseerRead: (date) => set((state) => ({
        habitStats: {
          ...state.habitStats,
          dailyTafseerRead: {
            ...state.habitStats.dailyTafseerRead,
            [date]: (state.habitStats.dailyTafseerRead[date] || 0) + 1
          }
        }
      })),
      saveTafseerNote: (key, note) => set((state) => ({
        tafseerNotes: {
          ...state.tafseerNotes,
          [key]: note
        }
      })),
      setReminderTime: (time) => set({ reminderTime: time }),
      setReminderSound: (sound) => set({ reminderSound: sound }),
      setReciter: (reciter) => set({ reciter }),
      setUserName: (name) => set({ userName: name }),
      setDefaultAppTab: (tab) => set({ defaultAppTab: tab }),
      toggleHaptics: () => set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),
      setMafatihFontSize: (val) => set({ mafatihFontSize: val }),
      toggleMafatihShowTranslation: () => set((state) => ({ mafatihShowTranslation: !state.mafatihShowTranslation })),
      setMafatihShowTranslation: (val) => set({ mafatihShowTranslation: val }),
      setMafatihDefaultSpeed: (speed) => set({ mafatihDefaultSpeed: speed, globalAudioSpeed: speed }),
      setGlobalAudioSpeed: (speed) => set({ globalAudioSpeed: speed, mafatihDefaultSpeed: speed }),
      setScienceCategory: (cat) => set({ scienceCategory: cat }),
      addMafatihBookmark: (id) => set((state) => ({
        mafatihBookmarks: state.mafatihBookmarks.includes(id) 
          ? state.mafatihBookmarks 
          : [id, ...state.mafatihBookmarks]
      })),
      removeMafatihBookmark: (id) => set((state) => ({
        mafatihBookmarks: state.mafatihBookmarks.filter(bId => bId !== id)
      })),
      isMafatihBookmarked: (id) => get().mafatihBookmarks.includes(id),
      addMafatihRecent: (id) => set((state) => {
        const filtered = state.mafatihRecentIds.filter(rId => rId !== id);
        return {
          mafatihRecentIds: [id, ...filtered].slice(0, 15)
        };
      }),
      clearMafatihRecents: () => set({ mafatihRecentIds: [] }),
    }),
    {
      name: 'quran-app-settings',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        // Automatically migrate legacy formats or cross-version updates
        return persistedState || {};
      },
      storage: {
        getItem: (name) => {
          try {
            // Check primary key first, then fallback to historical keys across updates
            const primary = localStorage.getItem(name);
            if (primary) return JSON.parse(primary);
            const legacyKeys = ['shia-quran-settings', 'shia_quran_settings', 'quran_settings'];
            for (const legacyKey of legacyKeys) {
              const val = localStorage.getItem(legacyKey);
              if (val) {
                // Mirror to standard key
                localStorage.setItem(name, val);
                return JSON.parse(val);
              }
            }
          } catch (e) {
            console.warn("Storage hydration error", e);
          }
          return null;
        },
        setItem: (name, value) => {
          try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(name, serialized);
            // Also dual-write to legacy keys to ensure backwards compatibility across versions
            localStorage.setItem('shia-quran-settings', serialized);
            // Reflect hasSeenWelcome flag directly for ultra-fast instantaneous splash bypass
            if (value?.state?.hasSeenWelcome) {
              localStorage.setItem('shia-quran-has-seen-welcome', 'true');
            }
          } catch (e) {}
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
            localStorage.removeItem('shia-quran-settings');
          } catch (e) {}
        }
      }
    }
  )
);
