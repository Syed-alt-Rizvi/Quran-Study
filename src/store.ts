import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CalendarNotificationSettings } from './types/calendar';
import { fastStorage } from './utils/fastStorage';

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

export type AppTab = 'quran' | 'mafatih' | 'calendar' | 'adhan' | 'science' | 'discuss';

export interface UserLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  description?: string;
}

export interface AdhanSettings {
  autoPlayFajr: boolean;
  autoPlayDhuhr: boolean;
  autoPlayMaghrib: boolean;
  repeatCount: number; // Plays adhan three times as specified by user
  volume: number;
  notificationsEnabled: boolean;
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
  currentAppTab: AppTab;
  hapticsEnabled: boolean;
  mafatihFontSize: number;
  mafatihShowTranslation: boolean;
  mafatihDefaultSpeed: number;
  globalAudioSpeed: number; // Reimagined unified global playback speed (0.5x, 0.75x, 1x, 1.25x, 1.5x, 1.75x, 2x)
  scienceCategory: string;
  mafatihBookmarks: string[];
  mafatihRecentIds: string[];

  // Shia Calendar & Notifications Settings
  hijriOffset: number; // -2 to +2 days for local moon sighting adjustment
  calendarNotificationSettings: CalendarNotificationSettings;

  // Shia Adhan & Global Map Location Settings
  userLocation: UserLocation;
  adhanSettings: AdhanSettings;
  setUserLocation: (loc: UserLocation) => void;
  updateAdhanSettings: (partial: Partial<AdhanSettings>) => void;

  appLanguage: 'en' | 'ur';
  setAppLanguage: (lang: 'en' | 'ur') => void;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
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
  setCurrentAppTab: (tab: AppTab) => void;
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

  setHijriOffset: (offset: number) => void;
  updateCalendarNotificationSettings: (partial: Partial<CalendarNotificationSettings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      isDarkMode: typeof document !== 'undefined' 
        ? document.documentElement.classList.contains('dark') || (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
        : false,
      fontSize: 38, // Comfortable large natural default for effortless reading
      arabicFont: 'Amiri',
      englishFont: 'Inter',
      hasSeenWelcome: true,
      bookmarks: [],
      lastRead: null,
      habitStats: { dailyAyahsRead: {}, dailyTafseerRead: {} },
      tafseerNotes: {},
      showTranslation: true,
      translationLanguages: ['en'],
      tafseerLanguages: ['ur'],
      tafseerProvider: 'namoona',
      tafseerZoom: 100, // Standard 100% natural zoom
      readProgress: {},
      reminderTime: null,
      reminderSound: 'bismillah.ogg',
      autoScrollAudio: false,
      reciter: 'ar.alafasy',
      userName: '',
      defaultAppTab: 'quran',
      currentAppTab: 'quran',
      hapticsEnabled: true,
      mafatihFontSize: 36, // Comfortable natural default for supplications
      mafatihShowTranslation: true,
      mafatihDefaultSpeed: 1,
      globalAudioSpeed: 1,
      scienceCategory: 'all',
      mafatihBookmarks: [],
      mafatihRecentIds: ['maf_dua46b', 'maf_dua40', 'maf_ziy86'],

      hijriOffset: 0,
      calendarNotificationSettings: {
        enabled: true,
        notifyOnEids: true,
        notifyOnWiladats: true,
        notifyOnShahadats: true,
        notifyOnUrs: true,
        notifyOnFastingDays: true,
        notifyDayBefore: true,
        notificationTime: '08:00',
      },

      userLocation: {
        name: 'Karbala',
        country: 'Iraq',
        latitude: 32.6160,
        longitude: 44.0249,
        timezone: 'Asia/Baghdad',
        description: 'Holy Shrine of Imam Hussain (a.s)'
      },
      adhanSettings: {
        autoPlayFajr: true,
        autoPlayDhuhr: true,
        autoPlayMaghrib: true,
        repeatCount: 3, // Plays adhan three times as specified
        volume: 0.9,
        notificationsEnabled: true
      },
      setUserLocation: (loc) => set({ userLocation: loc }),
      updateAdhanSettings: (partial) => set((state) => ({
        adhanSettings: {
          ...state.adhanSettings,
          ...partial
        }
      })),
      appLanguage: 'en',
      setAppLanguage: (lang: 'en' | 'ur') => set((state) => {
        return {
          appLanguage: lang,
          translationLanguages: lang === 'ur' ? ['ur'] : ['en'],
          tafseerLanguages: lang === 'ur' ? ['ur'] : state.tafseerLanguages
        };
      }),
      toggleDarkMode: () => set((state) => {
        const next = !state.isDarkMode;
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', next);
          document.body?.classList.toggle('dark', next);
          const metaTheme = document.querySelector('meta[name="theme-color"]');
          if (metaTheme) metaTheme.setAttribute('content', next ? '#020617' : '#047857');
        }
        return { isDarkMode: next };
      }),
      setDarkMode: (isDark: boolean) => set(() => {
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', isDark);
          document.body?.classList.toggle('dark', isDark);
          const metaTheme = document.querySelector('meta[name="theme-color"]');
          if (metaTheme) metaTheme.setAttribute('content', isDark ? '#020617' : '#047857');
        }
        return { isDarkMode: isDark };
      }),
      setFontSize: (size) => set({ fontSize: Math.max(22, Math.min(56, size)) }),
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
      setTafseerZoom: (zoom) => set({ tafseerZoom: Math.max(70, Math.min(400, zoom)) }),
      toggleAutoScrollAudio: () => set((state) => ({ autoScrollAudio: !state.autoScrollAudio })),
      setAutoScrollAudio: (val) => set({ autoScrollAudio: val }),
      setHasSeenWelcome: (seen) => set({ hasSeenWelcome: seen }),
      addBookmark: (bookmark) => {
        if (!bookmark || typeof bookmark.surahId !== 'number' || typeof bookmark.ayahNumber !== 'number') return;
        if (bookmark.surahId < 1 || bookmark.surahId > 114 || bookmark.ayahNumber < 1) return;
        set((state) => ({ 
          bookmarks: [...state.bookmarks.filter(b => !(b.surahId === bookmark.surahId && b.ayahNumber === bookmark.ayahNumber)), bookmark] 
        }));
      },
      removeBookmark: (surahId, ayahNumber) => set((state) => ({
        bookmarks: state.bookmarks.filter(b => !(b.surahId === surahId && b.ayahNumber === ayahNumber))
      })),
      isBookmarked: (surahId, ayahNumber) => {
        return get().bookmarks.some(b => b.surahId === surahId && b.ayahNumber === ayahNumber);
      },
      setLastRead: (lastRead) => {
        if (!lastRead || typeof lastRead.surahId !== 'number' || typeof lastRead.ayahNumber !== 'number') return;
        if (lastRead.surahId < 1 || lastRead.surahId > 114 || lastRead.ayahNumber < 1) return;
        set((state) => ({ 
          lastRead,
          readProgress: {
            ...state.readProgress,
            [lastRead.surahId]: Math.max(state.readProgress[lastRead.surahId] || 0, lastRead.ayahNumber)
          }
        }));
      },
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
      setCurrentAppTab: (tab) => set({ currentAppTab: tab }),
      toggleHaptics: () => set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),
      setMafatihFontSize: (val) => set({ mafatihFontSize: Math.max(20, Math.min(56, val)) }),
      toggleMafatihShowTranslation: () => set((state) => ({ mafatihShowTranslation: !state.mafatihShowTranslation })),
      setMafatihShowTranslation: (val) => set({ mafatihShowTranslation: val }),
      setMafatihDefaultSpeed: (speed) => {
        set({ mafatihDefaultSpeed: speed, globalAudioSpeed: speed });
        if (typeof window !== 'undefined') {
          try {
            window.dispatchEvent(new CustomEvent('global-audio-speed-changed', { detail: { speed } }));
          } catch {}
        }
      },
      setGlobalAudioSpeed: (speed) => {
        set({ globalAudioSpeed: speed, mafatihDefaultSpeed: speed });
        if (typeof window !== 'undefined') {
          try {
            window.dispatchEvent(new CustomEvent('global-audio-speed-changed', { detail: { speed } }));
          } catch {}
        }
      },
      setScienceCategory: (cat) => set({ scienceCategory: cat }),
      addMafatihBookmark: (id) => {
        if (!id || typeof id !== 'string') return;
        const clean = id.trim();
        if (!clean) return;
        set((state) => ({
          mafatihBookmarks: state.mafatihBookmarks.includes(clean) 
            ? state.mafatihBookmarks 
            : [clean, ...state.mafatihBookmarks]
        }));
      },
      removeMafatihBookmark: (id) => set((state) => ({
        mafatihBookmarks: state.mafatihBookmarks.filter(bId => bId !== id)
      })),
      isMafatihBookmarked: (id) => get().mafatihBookmarks.includes(id),
      addMafatihRecent: (id) => {
        if (!id || typeof id !== 'string') return;
        const clean = id.trim();
        if (!clean) return;
        set((state) => {
          const filtered = state.mafatihRecentIds.filter(rId => rId !== clean);
          return {
            mafatihRecentIds: [clean, ...filtered].slice(0, 15)
          };
        });
      },
      clearMafatihRecents: () => set({ mafatihRecentIds: [] }),
      setHijriOffset: (offset) => set({ hijriOffset: Math.max(-2, Math.min(2, offset)) }),
      updateCalendarNotificationSettings: (partial) => set((state) => ({
        calendarNotificationSettings: {
          ...state.calendarNotificationSettings,
          ...partial
        }
      })),
    }),
    {
      name: 'quran-app-settings',
      version: 6,
      migrate: (persistedState: any, version: number) => {
        const state = persistedState || {};
        // Restore standard comfortable font sizes and natural zoom
        if (!state.fontSize || state.fontSize > 56 || state.fontSize < 20) {
          state.fontSize = 38;
        }
        if (!state.mafatihFontSize || state.mafatihFontSize > 56 || state.mafatihFontSize < 20) {
          state.mafatihFontSize = 36;
        }
        if (!state.tafseerZoom || state.tafseerZoom > 300 || state.tafseerZoom < 70) {
          state.tafseerZoom = 100;
        }
        if (state.hijriOffset === undefined || state.hijriOffset < -2 || state.hijriOffset > 2) {
          state.hijriOffset = 0;
        }
        // Validate bookmarks array integrity
        if (Array.isArray(state.bookmarks)) {
          state.bookmarks = state.bookmarks.filter(
            (b: any) => b && typeof b.surahId === 'number' && b.surahId >= 1 && b.surahId <= 114 && typeof b.ayahNumber === 'number' && b.ayahNumber >= 1
          );
        } else {
          state.bookmarks = [];
        }
        // Validate lastRead integrity
        if (state.lastRead) {
          if (
            typeof state.lastRead.surahId !== 'number' || 
            state.lastRead.surahId < 1 || 
            state.lastRead.surahId > 114 || 
            typeof state.lastRead.ayahNumber !== 'number' || 
            state.lastRead.ayahNumber < 1
          ) {
            state.lastRead = null;
          }
        }
        // Validate mafatihBookmarks
        if (!Array.isArray(state.mafatihBookmarks)) {
          state.mafatihBookmarks = [];
        }
        if (!Array.isArray(state.mafatihRecentIds)) {
          state.mafatihRecentIds = ['maf_dua46b', 'maf_dua40', 'maf_ziy86'];
        }
        if (!state.calendarNotificationSettings) {
          state.calendarNotificationSettings = {
            enabled: true,
            notifyOnEids: true,
            notifyOnWiladats: true,
            notifyOnShahadats: true,
            notifyOnUrs: true,
            notifyOnFastingDays: true,
            notifyDayBefore: true,
            notificationTime: '08:00',
          };
        }
        if (!state.userLocation) {
          state.userLocation = {
            name: 'Karbala',
            country: 'Iraq',
            latitude: 32.6160,
            longitude: 44.0249,
            timezone: 'Asia/Baghdad',
            description: 'Holy Shrine of Imam Hussain (a.s)'
          };
        }
        if (!state.adhanSettings) {
          state.adhanSettings = {
            autoPlayFajr: true,
            autoPlayDhuhr: true,
            autoPlayMaghrib: true,
            repeatCount: 1,
            volume: 0.9,
            notificationsEnabled: true
          };
        } else {
          if (state.adhanSettings.autoPlayFajr === undefined) state.adhanSettings.autoPlayFajr = true;
          if (state.adhanSettings.autoPlayDhuhr === undefined) state.adhanSettings.autoPlayDhuhr = true;
          if (state.adhanSettings.autoPlayMaghrib === undefined) state.adhanSettings.autoPlayMaghrib = true;
        }
        return state;
      },
      storage: {
        getItem: async (name) => {
          if (typeof localStorage === 'undefined') return null;
          let parsed: any = null;
          try {
            const primary = localStorage.getItem(name);
            if (primary) {
              parsed = JSON.parse(primary);
            }
          } catch (e) {
            console.warn('[Storage] Corrupted primary storage detected, clearing bad key:', e);
            try { localStorage.removeItem(name); } catch {}
          }

          if (!parsed) {
            // Check legacy keys
            const legacyKeys = ['shia-quran-settings', 'shia_quran_settings', 'quran_settings'];
            for (const legacyKey of legacyKeys) {
              try {
                const val = localStorage.getItem(legacyKey);
                if (val) {
                  parsed = JSON.parse(val);
                  if (parsed) {
                    try {
                      localStorage.setItem(name, val);
                      localStorage.removeItem(legacyKey);
                    } catch {}
                    break;
                  }
                }
              } catch {}
            }
          }

          // If still null, attempt restore from IndexedDB shadow backup
          if (!parsed) {
            try {
              const shadow = await fastStorage.get<any>('settings_shadow_backup');
              if (shadow && typeof shadow === 'object') {
                parsed = shadow;
                try {
                  localStorage.setItem(name, JSON.stringify(shadow));
                } catch {}
              }
            } catch {}
          }

          return parsed;
        },
        setItem: (name, value) => {
          try {
            const serialized = JSON.stringify(value);
            if (typeof localStorage !== 'undefined') {
              try {
                localStorage.setItem(name, serialized);
              } catch (quotaErr) {
                console.warn('[Storage] QuotaExceededError in localStorage, pruning duplicate legacy keys:', quotaErr);
                ['shia-quran-settings', 'shia_quran_settings', 'quran_settings'].forEach((k) => {
                  try { localStorage.removeItem(k); } catch {}
                });
                try {
                  localStorage.setItem(name, serialized);
                } catch (secondErr) {
                  console.error('[Storage] Persistent quota ceiling reached, state safely preserved in memory and IndexedDB:', secondErr);
                }
              }

              // Reflect hasSeenWelcome flag directly for ultra-fast instantaneous splash bypass
              if (value?.state?.hasSeenWelcome) {
                try { localStorage.setItem('shia-quran-has-seen-welcome', 'true'); } catch {}
              }
            }

            // Dual-persist to IndexedDB as shadow backup (unlimited quota, crash safe)
            fastStorage.set('settings_shadow_backup', value).catch(() => {});
          } catch (e) {
            console.error('[Storage] Serialization error in setItem:', e);
          }
        },
        removeItem: (name) => {
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.removeItem(name);
              localStorage.removeItem('shia-quran-settings');
            }
            fastStorage.del('settings_shadow_backup').catch(() => {});
          } catch (e) {}
        }
      }
    }
  )
);
