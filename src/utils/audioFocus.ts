/**
 * Audio Focus & Session Coordinator for Shia Markaz
 * 
 * Guarantees mutually exclusive audio playback across:
 * 1. Quran Ayah-by-Ayah Reciter ('quran')
 * 2. Mafatih al-Jinan Supplications & Duas ('mafatih')
 * 3. Shia Ithna Ashari Adhan Player ('adhan')
 * 
 * Prevents multiple religious audios from clashing simultaneously,
 * coordinates Screen WakeLock, and ensures clean lockscreen MediaSession transitions.
 */

export type AudioSource = 'quran' | 'mafatih' | 'adhan';

class AudioFocusCoordinator {
  private currentFocus: AudioSource | null = null;
  private wakeLock: any = null;
  private listeners: Set<(source: AudioSource | null) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      // Listen for window events to maintain sync
      window.addEventListener('pause-quran-audio', () => {
        if (this.currentFocus === 'quran') {
          this.currentFocus = null;
          this.notify();
        }
      });

      window.addEventListener('pause-mafatih-audio', () => {
        if (this.currentFocus === 'mafatih') {
          this.currentFocus = null;
          this.notify();
        }
      });

      window.addEventListener('pause-adhan-audio', () => {
        if (this.currentFocus === 'adhan') {
          this.currentFocus = null;
          this.notify();
        }
      });

      // Handle visibility changes for Screen WakeLock
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible' && this.currentFocus !== null) {
            this.acquireWakeLock().catch(() => {});
          }
        });
      }
    }
  }

  /**
   * Request exclusive audio focus for a given subsystem.
   * Immediately commands all other subsystems to pause so recitations never overlap.
   */
  public async requestAudioFocus(source: AudioSource): Promise<boolean> {
    if (this.currentFocus === source) {
      return true;
    }

    const previous = this.currentFocus;
    this.currentFocus = source;

    if (typeof window !== 'undefined') {
      // Pause Quran if another source requested focus
      if (source !== 'quran') {
        try {
          window.dispatchEvent(new CustomEvent('pause-quran-audio'));
        } catch {}
      }

      // Pause Mafatih if another source requested focus
      if (source !== 'mafatih') {
        try {
          window.dispatchEvent(new CustomEvent('pause-mafatih-audio'));
        } catch {}
      }

      // Pause Adhan if another source requested focus
      if (source !== 'adhan') {
        try {
          window.dispatchEvent(new CustomEvent('pause-adhan-audio'));
        } catch {}
      }
    }

    // Acquire Screen WakeLock to prevent device sleep during recitation
    await this.acquireWakeLock();

    this.notify();
    return true;
  }

  /**
   * Release audio focus when playback is paused or completed
   */
  public releaseAudioFocus(source: AudioSource) {
    if (this.currentFocus === source) {
      this.currentFocus = null;
      this.releaseWakeLock();
      this.notify();
    }
  }

  public getCurrentFocus(): AudioSource | null {
    return this.currentFocus;
  }

  public isFocusActive(source: AudioSource): boolean {
    return this.currentFocus === source;
  }

  public subscribe(callback: (source: AudioSource | null) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach(cb => {
      try {
        cb(this.currentFocus);
      } catch {}
    });
  }

  private async acquireWakeLock() {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && (navigator as any).wakeLock?.request) {
      try {
        if (!this.wakeLock) {
          this.wakeLock = await (navigator as any).wakeLock.request('screen');
          this.wakeLock.addEventListener?.('release', () => {
            this.wakeLock = null;
          });
        }
      } catch {}
    }
  }

  private releaseWakeLock() {
    if (this.wakeLock) {
      try {
        this.wakeLock.release?.();
      } catch {}
      this.wakeLock = null;
    }
  }
}

export const audioFocusCoordinator = new AudioFocusCoordinator();
