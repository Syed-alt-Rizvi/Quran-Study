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
  readProgress: Record<number, number>; // Maps surahId to highest read ayahNumber
  reminderTime: string | null; // HH:MM format
  
  toggleDarkMode: () => void;
  setFontSize: (size: number) => void;
  setArabicFont: (font: string) => void;
  setEnglishFont: (font: string) => void;
  toggleShowTranslation: () => void;
  toggleTranslationLanguage: (lang: 'en' | 'ur') => void;
  setHasSeenWelcome: (seen: boolean) => void;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (surahId: number, ayahNumber: number) => void;
  isBookmarked: (surahId: number, ayahNumber: number) => boolean;
  setLastRead: (lastRead: LastRead) => void;
  incrementAyahsRead: (date: string) => void;
  incrementTafseerRead: (date: string) => void;
  saveTafseerNote: (key: string, note: string) => void;
  setReminderTime: (time: string | null) => void;
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
      readProgress: {},
      reminderTime: null,
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
    }),
    {
      name: 'quran-app-settings',
    }
  )
);
