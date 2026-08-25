import { Preferences } from '@capacitor/preferences';

export const setStorage = async (key: string, value: string) => {
  try {
    await Preferences.set({ key, value });
  } catch (e) {
    console.error('Storage Error:', e);
  }
};

export const getStorage = async (key: string): Promise<string | null> => {
  try {
    const { value } = await Preferences.get({ key });
    return value;
  } catch (e) {
    console.error('Storage Error:', e);
    return null;
  }
};

export const removeStorage = async (key: string) => {
  try {
    await Preferences.remove({ key });
  } catch (e) {
    console.error('Storage Error:', e);
  }
};
