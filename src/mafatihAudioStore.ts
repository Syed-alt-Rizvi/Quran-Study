import { create } from 'zustand';
import { Capacitor } from '@capacitor/core';
import { getApiUrl } from './utils/apiBase';
import { useAudioStore } from './audioStore';

export interface MafatihAudioTrack {
  id: string;
  title: string;
  category?: string;
  audioUrl: string;
}

interface MafatihAudioState {
  currentTrack: MafatihAudioTrack | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  isLooping: boolean;
  volume: number;
  isMuted: boolean;

  playTrack: (track: MafatihAudioTrack) => Promise<void>;
  toggleTrack: (track: MafatihAudioTrack) => Promise<void>;
  pause: () => void;
  resume: () => Promise<void>;
  seek: (time: number) => void;
  skip: (seconds: number) => void;
  setSpeed: (speed: number) => void;
  cycleSpeed: () => void;
  toggleLoop: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  stop: () => void;
}

// In-memory singleton Audio instance across the application lifecycle
let globalAudio: HTMLAudioElement | null = null;
let currentFallbackUsed = false;

function cleanUrl(rawUrl: string): string {
  let u = (rawUrl || '').trim();
  if (u.startsWith('http://www.ya-mahdi.net')) u = u.replace('http://', 'https://');
  else if (u.startsWith('http://ya-mahdi.net')) u = u.replace('http://', 'https://');
  else if (u.startsWith('http://www.sibtayn.com')) u = u.replace('http://', 'https://');
  else if (u.startsWith('http://sibtayn.com')) u = u.replace('http://', 'https://');
  return u;
}

function resolveStreamUrl(url: string, useDirectFallback = false): string {
  const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();
  const cleaned = cleanUrl(url);
  if (isNative || useDirectFallback) {
    return cleaned;
  }
  return getApiUrl(`/api/mafatih/audio-proxy?url=${encodeURIComponent(cleaned)}`);
}

function updateMediaSession(track: MafatihAudioTrack, getStore: () => MafatihAudioState) {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: 'Mafatih al-Jinan • Sheikh Abbas Qummi',
      album: track.category || 'Supplications & Ziyaraat',
    });
    navigator.mediaSession.setActionHandler('play', () => {
      getStore().resume();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      getStore().pause();
    });
    navigator.mediaSession.setActionHandler('seekbackward', () => {
      getStore().skip(-10);
    });
    navigator.mediaSession.setActionHandler('seekforward', () => {
      getStore().skip(10);
    });
  } catch {}
}

export const useMafatihAudioStore = create<MafatihAudioState>((set, get) => {
  // Listen for global Quran playback events to pause Mafatih playback
  if (typeof window !== 'undefined') {
    window.addEventListener('pause-mafatih-audio', () => {
      if (globalAudio && !globalAudio.paused) {
        globalAudio.pause();
      }
      set({ isPlaying: false, isBuffering: false });
    });
  }

  const attachAudioListeners = (audio: HTMLAudioElement, track: MafatihAudioTrack) => {
    audio.onplay = () => set({ isPlaying: true, isBuffering: false });
    audio.onpause = () => set({ isPlaying: false });
    audio.onwaiting = () => set({ isBuffering: true });
    audio.onplaying = () => set({ isPlaying: true, isBuffering: false });
    audio.oncanplay = () => set({ isBuffering: false });
    audio.ontimeupdate = () => set({ currentTime: audio.currentTime || 0 });
    audio.onloadedmetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        set({ duration: audio.duration });
      }
    };
    audio.onended = () => {
      if (!get().isLooping) {
        set({ isPlaying: false, currentTime: 0 });
      }
    };
    audio.onerror = (e) => {
      console.warn('Mafatih Audio stream error encountered:', e);
      if (!currentFallbackUsed) {
        currentFallbackUsed = true;
        const direct = resolveStreamUrl(track.audioUrl, true);
        console.info('Switching to direct stream source:', direct);
        try {
          audio.src = direct;
          audio.load();
          audio.play().catch((err) => {
            console.error('Direct audio fallback failed:', err);
            set({ isPlaying: false, isBuffering: false });
          });
        } catch {
          set({ isPlaying: false, isBuffering: false });
        }
      } else {
        set({ isPlaying: false, isBuffering: false });
      }
    };
  };

  return {
    currentTrack: null,
    isPlaying: false,
    isBuffering: false,
    currentTime: 0,
    duration: 0,
    playbackSpeed: 1,
    isLooping: false,
    volume: 1,
    isMuted: false,

    playTrack: async (track: MafatihAudioTrack) => {
      if (!track.audioUrl) return;

      // Pause Quran audio
      useAudioStore.getState().pause();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pause-quran-audio'));
      }

      currentFallbackUsed = false;
      const targetSrc = resolveStreamUrl(track.audioUrl, false);

      if (globalAudio) {
        try {
          globalAudio.pause();
          globalAudio.src = '';
        } catch {}
      }

      const audio = new Audio();
      globalAudio = audio;
      audio.preload = 'auto';
      audio.playbackRate = get().playbackSpeed;
      audio.loop = get().isLooping;
      audio.volume = get().isMuted ? 0 : get().volume;
      audio.muted = get().isMuted;

      attachAudioListeners(audio, track);
      audio.src = targetSrc;

      set({
        currentTrack: track,
        isPlaying: true,
        isBuffering: true,
        currentTime: 0,
        duration: 0,
      });

      updateMediaSession(track, get);

      try {
        await audio.play();
        set({ isBuffering: false });
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.warn('Initial stream play failed, trying direct stream:', err);
          currentFallbackUsed = true;
          const directSrc = resolveStreamUrl(track.audioUrl, true);
          audio.src = directSrc;
          try {
            await audio.play();
            set({ isBuffering: false });
          } catch (directErr) {
            console.error('All playback sources failed:', directErr);
            set({ isPlaying: false, isBuffering: false });
          }
        }
      }
    },

    toggleTrack: async (track: MafatihAudioTrack) => {
      const state = get();
      if (state.currentTrack?.id === track.id && globalAudio) {
        if (state.isPlaying) {
          get().pause();
        } else {
          await get().resume();
        }
      } else {
        await get().playTrack(track);
      }
    },

    pause: () => {
      if (globalAudio) {
        try {
          globalAudio.pause();
        } catch {}
      }
      set({ isPlaying: false, isBuffering: false });
    },

    resume: async () => {
      if (globalAudio) {
        // Pause Quran audio
        useAudioStore.getState().pause();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('pause-quran-audio'));
        }
        set({ isPlaying: true });
        try {
          await globalAudio.play();
        } catch {
          set({ isPlaying: false });
        }
      } else if (get().currentTrack) {
        await get().playTrack(get().currentTrack!);
      }
    },

    seek: (time: number) => {
      if (globalAudio) {
        try {
          globalAudio.currentTime = time;
        } catch {}
      }
      set({ currentTime: time });
    },

    skip: (seconds: number) => {
      if (globalAudio) {
        const cur = globalAudio.currentTime || 0;
        const dur = globalAudio.duration || get().duration || 999999;
        const target = Math.max(0, Math.min(dur, cur + seconds));
        get().seek(target);
      }
    },

    setSpeed: (speed: number) => {
      if (globalAudio) {
        try {
          globalAudio.playbackRate = speed;
        } catch {}
      }
      set({ playbackSpeed: speed });
    },

    cycleSpeed: () => {
      const speeds = [0.75, 1, 1.25, 1.5];
      const cur = get().playbackSpeed;
      const idx = speeds.indexOf(cur);
      const next = speeds[(idx + 1) % speeds.length];
      get().setSpeed(next);
    },

    toggleLoop: () => {
      const next = !get().isLooping;
      if (globalAudio) {
        globalAudio.loop = next;
      }
      set({ isLooping: next });
    },

    setVolume: (vol: number) => {
      const v = Math.max(0, Math.min(1, vol));
      if (globalAudio) {
        globalAudio.volume = v;
        globalAudio.muted = v === 0;
      }
      set({ volume: v, isMuted: v === 0 });
    },

    toggleMute: () => {
      const nextMuted = !get().isMuted;
      if (globalAudio) {
        globalAudio.muted = nextMuted;
      }
      set({ isMuted: nextMuted });
    },

    stop: () => {
      if (globalAudio) {
        try {
          globalAudio.pause();
          globalAudio.src = '';
        } catch {}
        globalAudio = null;
      }
      set({
        currentTrack: null,
        isPlaying: false,
        isBuffering: false,
        currentTime: 0,
        duration: 0,
      });
    },
  };
});
