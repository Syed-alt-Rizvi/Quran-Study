import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { useSettingsStore } from '../store';

export { ImpactStyle };

export const hapticImpact = async (style: ImpactStyle = ImpactStyle.Light) => {
  if (useSettingsStore.getState().hapticsEnabled === false) return;
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.impact({ style });
    } catch (e) {
      // ignore
    }
  }
};

export const hapticSelection = async () => {
  if (useSettingsStore.getState().hapticsEnabled === false) return;
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.selectionStart();
      await Haptics.selectionChanged();
      await Haptics.selectionEnd();
    } catch (e) {
      // ignore
    }
  }
};

export const hapticNotification = async (type: 'SUCCESS' | 'WARNING' | 'ERROR') => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.notification({ type: type as any });
    } catch (e) {
      // ignore
    }
  }
};

export const hapticVibrate = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.vibrate();
    } catch (e) {
      // ignore
    }
  }
};
