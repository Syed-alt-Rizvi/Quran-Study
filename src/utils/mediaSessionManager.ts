/**
 * Unified MediaSession API Manager for Shia Markaz
 * Safely provides lockscreen notifications, smartwatch controls, position tracking,
 * and high-resolution artwork across iOS Safari, Android Chrome, and PWA WebViews.
 */

export interface MediaSessionConfig {
  title: string;
  artist: string;
  album: string;
  artworkUrl?: string;
  playbackState: 'playing' | 'paused' | 'none';
  duration?: number;
  position?: number;
  playbackRate?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSeek?: (position: number) => void;
  onSkip?: (seconds: number) => void;
}

const toAbsoluteUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin + (path.startsWith('/') ? path : '/' + path);
  }
  return path;
};

const DEFAULT_ARTWORK = [
  { src: toAbsoluteUrl('/pwa-192x192.png'), sizes: '192x192', type: 'image/png' },
  { src: toAbsoluteUrl('/pwa-512x512.png'), sizes: '512x512', type: 'image/png' }
];

import { syncNativeMediaNotification, clearNativeMediaNotification } from './nativeMediaBridge';

export function updateMediaSession(config: MediaSessionConfig) {
  // Synchronize OS-level native media notification & WakeLock on Android
  syncNativeMediaNotification(
    config.title || "The Holy Qur'an",
    config.artist || "Recitation",
    config.playbackState === 'playing'
  );

  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
    return;
  }

  try {
    const artworkList = config.artworkUrl
      ? [
          { src: toAbsoluteUrl(config.artworkUrl), sizes: '512x512', type: 'image/png' },
          ...DEFAULT_ARTWORK
        ]
      : DEFAULT_ARTWORK;

    // 1. Metadata with high-res artwork
    navigator.mediaSession.metadata = new MediaMetadata({
      title: config.title,
      artist: config.artist,
      album: config.album,
      artwork: artworkList
    });

    // 2. Playback State
    navigator.mediaSession.playbackState = config.playbackState;

    // 3. Action Handlers
    navigator.mediaSession.setActionHandler('play', config.onPlay || null);
    navigator.mediaSession.setActionHandler('pause', config.onPause || null);
    navigator.mediaSession.setActionHandler('stop', config.onStop || null);
    navigator.mediaSession.setActionHandler('previoustrack', config.onPrevious || null);
    navigator.mediaSession.setActionHandler('nexttrack', config.onNext || null);

    if (config.onSkip) {
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        config.onSkip?.(-(details.seekOffset || 10));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        config.onSkip?.(details.seekOffset || 10);
      });
    } else {
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
    }

    if (config.onSeek) {
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && Number.isFinite(details.seekTime)) {
          config.onSeek?.(details.seekTime);
        }
      });
    } else {
      navigator.mediaSession.setActionHandler('seekto', null);
    }

    // 4. Position State tracking (for lockscreen scrubbing)
    if (
      'setPositionState' in navigator.mediaSession &&
      config.duration !== undefined &&
      config.duration > 0 &&
      config.position !== undefined &&
      Number.isFinite(config.position)
    ) {
      try {
        navigator.mediaSession.setPositionState({
          duration: Math.max(0, config.duration),
          playbackRate: config.playbackRate || 1.0,
          position: Math.max(0, Math.min(config.position, config.duration))
        });
      } catch {}
    }
  } catch (err) {
    // Gracefully ignore WebView permission or MediaSession constraint errors
    console.debug('[MediaSession] Non-fatal config update note:', err);
  }
}

export function clearMediaSession() {
  clearNativeMediaNotification();

  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
    return;
  }

  try {
    navigator.mediaSession.playbackState = 'none';
    if (navigator.mediaSession.metadata) {
      navigator.mediaSession.metadata = null;
    }
    const actions: MediaSessionAction[] = [
      'play', 'pause', 'stop', 'previoustrack', 'nexttrack', 'seekbackward', 'seekforward', 'seekto'
    ];
    actions.forEach(action => {
      try {
        navigator.mediaSession.setActionHandler(action, null);
      } catch {}
    });
  } catch {}
}
