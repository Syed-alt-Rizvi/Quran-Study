import { useSettingsStore } from '../store';
import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface UserDataPayload {
  version: number;
  exportedAt: string;
  bookmarks: Array<{ surahId: number; ayahNumber: number }>;
  lastRead: any;
  habitStats: any;
  tafseerNotes: Record<string, string>;
  readProgress: Record<number, number>;
  reciter?: string;
  isDarkMode?: boolean;
  fontSize?: number;
  arabicFont?: string;
  englishFont?: string;
  showTranslation?: boolean;
  translationLanguages?: Array<'en' | 'ur'>;
  tafseerLanguages?: Array<'en' | 'ur'>;
  tafseerProvider?: 'namoona' | 'kauthar';
  tafseerZoom?: number;
  mafatihBookmarks?: string[];
  userName?: string;
}

/**
 * Capture current user data into a clean serializable payload
 */
export function exportUserData(): UserDataPayload {
  const state = useSettingsStore.getState();
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    bookmarks: state.bookmarks || [],
    lastRead: state.lastRead || null,
    habitStats: state.habitStats || { dailyAyahsRead: {}, dailyTafseerRead: {} },
    tafseerNotes: state.tafseerNotes || {},
    readProgress: state.readProgress || {},
    reciter: state.reciter,
    isDarkMode: state.isDarkMode,
    fontSize: state.fontSize,
    arabicFont: state.arabicFont,
    englishFont: state.englishFont,
    showTranslation: state.showTranslation,
    translationLanguages: state.translationLanguages,
    tafseerLanguages: state.tafseerLanguages,
    tafseerProvider: state.tafseerProvider,
    tafseerZoom: state.tafseerZoom,
    mafatihBookmarks: state.mafatihBookmarks || [],
    userName: state.userName || '',
  };
}

/**
 * Safely import and merge user data into the active Zustand store
 */
export function importUserData(data: Partial<UserDataPayload>): { success: boolean; importedCount: number } {
  if (!data || typeof data !== 'object') return { success: false, importedCount: 0 };

  const current = useSettingsStore.getState();
  let count = 0;

  // 1. Merge bookmarks (avoid duplicates)
  if (Array.isArray(data.bookmarks)) {
    const existingKeys = new Set((current.bookmarks || []).map(b => `${b.surahId}_${b.ayahNumber}`));
    for (const b of data.bookmarks) {
      if (b && typeof b.surahId === 'number' && typeof b.ayahNumber === 'number') {
        const key = `${b.surahId}_${b.ayahNumber}`;
        if (!existingKeys.has(key)) {
          current.addBookmark(b);
          existingKeys.add(key);
          count++;
        }
      }
    }
  }

  // 2. Merge Mafatih bookmarks
  if (Array.isArray(data.mafatihBookmarks)) {
    const existingMafatih = new Set(current.mafatihBookmarks || []);
    for (const mId of data.mafatihBookmarks) {
      if (typeof mId === 'string' && !existingMafatih.has(mId)) {
        current.addMafatihBookmark(mId);
        existingMafatih.add(mId);
        count++;
      }
    }
  }

  // 3. Merge Tafseer notes
  if (data.tafseerNotes && typeof data.tafseerNotes === 'object') {
    for (const [key, note] of Object.entries(data.tafseerNotes)) {
      if (typeof note === 'string' && note.trim()) {
        current.saveTafseerNote(key, note);
        count++;
      }
    }
  }

  // 4. Merge read progress (keep highest)
  if (data.readProgress && typeof data.readProgress === 'object') {
    useSettingsStore.setState((prev) => {
      const merged = { ...prev.readProgress };
      for (const [sId, aNum] of Object.entries(data.readProgress!)) {
        const s = Number(sId);
        const a = Number(aNum);
        if (!isNaN(s) && !isNaN(a)) {
          merged[s] = Math.max(merged[s] || 0, a);
        }
      }
      return { readProgress: merged };
    });
  }

  // 5. Restore last read if present
  if (data.lastRead && data.lastRead.surahId) {
    current.setLastRead(data.lastRead);
  }

  // 6. Restore user preferences
  if (data.reciter) current.setReciter(data.reciter);
  if (data.arabicFont) current.setArabicFont(data.arabicFont);
  if (data.englishFont) current.setEnglishFont(data.englishFont);
  if (typeof data.fontSize === 'number') current.setFontSize(data.fontSize);
  if (data.tafseerProvider) current.setTafseerProvider(data.tafseerProvider);
  if (data.userName) current.setUserName(data.userName);

  return { success: true, importedCount: count };
}

/**
 * Generate a compact base64-encoded string for URL transfer
 */
export function encodeTransferPayload(data: UserDataPayload): string {
  try {
    const jsonStr = JSON.stringify(data);
    return btoa(encodeURIComponent(jsonStr));
  } catch (e) {
    console.error('Failed to encode transfer payload:', e);
    return '';
  }
}

/**
 * Decode a base64-encoded string from URL
 */
export function decodeTransferPayload(encoded: string): UserDataPayload | null {
  try {
    const jsonStr = decodeURIComponent(atob(encoded));
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to decode transfer payload:', e);
  }
  return null;
}

/**
 * Generate a 1-click Transfer Link for a given destination origin
 */
export function generateTransferUrl(destinationOrigin?: string): string {
  const payload = exportUserData();
  const encoded = encodeTransferPayload(payload);
  const origin = destinationOrigin || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${origin.replace(/\/+$/, '')}/#transfer=${encoded}`;
}

/**
 * Save user data to Firestore under a short 6-character sync code
 */
export async function createCloudSyncCode(customCode?: string): Promise<{ syncCode: string; success: boolean }> {
  const payload = exportUserData();
  const syncCode = (customCode || Math.random().toString(36).substring(2, 8)).toUpperCase();

  try {
    const ref = doc(db, 'user_sync_profiles', syncCode);
    await setDoc(ref, {
      ...payload,
      syncCode,
      updatedAt: serverTimestamp(),
      platform: typeof navigator !== 'undefined' ? navigator.userAgent : 'web'
    });

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('shia_active_sync_code', syncCode);
    }

    return { syncCode, success: true };
  } catch (err: any) {
    console.error('Failed to create cloud sync:', err);
    throw new Error(err.message || 'Cloud sync failed');
  }
}

/**
 * Load user data from Firestore using a sync code
 */
export async function restoreFromCloudSync(syncCode: string): Promise<{ success: boolean; importedCount: number }> {
  const cleanCode = (syncCode || '').trim().toUpperCase();
  if (!cleanCode) throw new Error('Please enter a valid sync code');

  try {
    const ref = doc(db, 'user_sync_profiles', cleanCode);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      throw new Error(`Sync Code "${cleanCode}" not found. Please verify the code on your primary device.`);
    }

    const data = snap.data() as UserDataPayload;
    const result = importUserData(data);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('shia_active_sync_code', cleanCode);
    }

    return result;
  } catch (err: any) {
    console.error('Failed to restore from cloud sync:', err);
    throw err;
  }
}

/**
 * Check if the active page URL contains a transfer payload or sync code on startup
 */
export function checkUrlForTransfer(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // 1. Check hash for #transfer=...
    const hash = window.location.hash;
    if (hash.includes('transfer=')) {
      const match = hash.match(/transfer=([^&]+)/);
      if (match && match[1]) {
        const decoded = decodeTransferPayload(match[1]);
        if (decoded) {
          const res = importUserData(decoded);
          // Clean hash from URL so it doesn't re-import on refresh
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          return res.success;
        }
      }
    }

    // 2. Check query params for ?sync_code=...
    const params = new URLSearchParams(window.location.search);
    const syncCode = params.get('sync_code');
    if (syncCode) {
      restoreFromCloudSync(syncCode).then(() => {
        // Clean query param
        params.delete('sync_code');
        const newSearch = params.toString() ? `?${params.toString()}` : '';
        window.history.replaceState(null, '', window.location.pathname + newSearch + window.location.hash);
      }).catch((e) => console.warn('Auto sync code restore notice:', e));
      return true;
    }
  } catch (e) {
    console.warn('URL transfer check error:', e);
  }

  return false;
}
