/**
 * Native Media Bridge for Shia Markaz
 * Seamlessly connects React audio playback with Android OS Foreground Media Service,
 * CPU WakeLocks, and the Android System Notification Tray.
 * Ensures Quran and Mafatih audio continues uninterrupted when the app is minimized or screen is locked.
 */

import { registerPlugin, Capacitor } from '@capacitor/core';

interface MediaNativePluginType {
  startMediaNotification(options: { title: string; artist: string; isPlaying: boolean }): Promise<void>;
  updateMediaNotification(options: { title: string; artist: string; isPlaying: boolean }): Promise<void>;
  stopMediaNotification(): Promise<void>;
  addListener(
    eventName: 'mediaAction',
    listenerFunc: (data: { action: 'play' | 'pause' | 'next' | 'prev' | 'stop' }) => void
  ): Promise<{ remove: () => void }>;
}

const MediaNative = registerPlugin<MediaNativePluginType>('MediaNative');

let isNativeServiceActive = false;
let lastTitle = '';
let lastArtist = '';
let lastIsPlaying = false;
let activeActionSubscription: { remove: () => void } | null = null;

const actionListeners = new Set<(action: 'play' | 'pause' | 'next' | 'prev' | 'stop') => void>();

// Initialize event listener once
if (Capacitor.isNativePlatform()) {
  try {
    MediaNative.addListener('mediaAction', (data) => {
      if (data && data.action) {
        actionListeners.forEach(listener => {
          try {
            listener(data.action);
          } catch (e) {
            console.error('[NativeMediaBridge] Error invoking action listener:', e);
          }
        });
      }
    }).then(sub => {
      activeActionSubscription = sub;
    }).catch(err => {
      console.warn('[NativeMediaBridge] addListener notice:', err?.message);
    });
  } catch (err) {
    console.warn('[NativeMediaBridge] Initialization notice:', err);
  }
}

export function subscribeToMediaActions(callback: (action: 'play' | 'pause' | 'next' | 'prev' | 'stop') => void): () => void {
  actionListeners.add(callback);
  return () => {
    actionListeners.delete(callback);
  };
}

export async function syncNativeMediaNotification(title: string, artist: string, isPlaying: boolean) {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  // Avoid unnecessary redundant calls if data has not changed
  if (isNativeServiceActive && lastTitle === title && lastArtist === artist && lastIsPlaying === isPlaying) {
    return;
  }

  lastTitle = title;
  lastArtist = artist;
  lastIsPlaying = isPlaying;

  try {
    if (!isNativeServiceActive) {
      await MediaNative.startMediaNotification({ title, artist, isPlaying });
      isNativeServiceActive = true;
    } else {
      await MediaNative.updateMediaNotification({ title, artist, isPlaying });
    }
  } catch (err: any) {
    console.warn('[NativeMediaBridge] Sync media notification notice:', err?.message);
  }
}

export async function clearNativeMediaNotification() {
  if (!Capacitor.isNativePlatform() || !isNativeServiceActive) {
    return;
  }

  isNativeServiceActive = false;
  lastTitle = '';
  lastArtist = '';
  lastIsPlaying = false;

  try {
    await MediaNative.stopMediaNotification();
  } catch (err: any) {
    console.warn('[NativeMediaBridge] Stop media notification notice:', err?.message);
  }
}
