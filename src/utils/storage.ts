import { Preferences } from '@capacitor/preferences';

export const setStorage = async (key: string, value: string) => {
  try {
    await Preferences.set({ key, value });
    localStorage.setItem(key, value); // Fallback/Sync for web
  } catch (e) {
    localStorage.setItem(key, value);
  }
};

export const getStorage = async (key: string): Promise<string | null> => {
  try {
    const { value } = await Preferences.get({ key });
    if (value !== null) return value;
    return localStorage.getItem(key);
  } catch (e) {
    return localStorage.getItem(key);
  }
};

export const removeStorage = async (key: string) => {
  try {
    await Preferences.remove({ key });
    localStorage.removeItem(key);
  } catch (e) {
    localStorage.removeItem(key);
  }
};
