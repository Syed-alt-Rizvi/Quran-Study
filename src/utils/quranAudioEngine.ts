/**
 * Quran Audio Engine & Dual-Stream Resilience Circuit Breaker
 * 
 * Provides:
 * 1. Primary CDN (`cdn.islamic.network`) and Mirror Archive (`everyayah.com`) resolution.
 * 2. Automatic URL synthesis even when Ayah audio fields are missing or offline.
 * 3. Session-level Circuit Breaker: If CDN fails consecutively, automatically switches
 *    all remaining ayahs in the session directly to the high-speed mirror to guarantee
 *    gapless playback without 2-5 second network stall on every verse.
 */

import { Ayah } from '../api';

export interface ReciterProfile {
  id: string;
  name: string;
  arabicName: string;
  subfolder: string;
  bitrate: string;
  style: string;
}

export const QURAN_RECITERS: Record<string, ReciterProfile> = {
  'ar.alafasy': {
    id: 'ar.alafasy',
    name: 'Mishary Rashid Alafasy',
    arabicName: 'مشاري راشد العفاسي',
    subfolder: 'Alafasy_128kbps',
    bitrate: '128',
    style: 'Kuwait • Clear & Melodic'
  },
  'ar.abdulbasitmurattal': {
    id: 'ar.abdulbasitmurattal',
    name: 'Abdul Basit (Murattal)',
    arabicName: 'عبد الباسط عبد الصمد (مرتل)',
    subfolder: 'Abdul_Basit_Murattal_192kbps',
    bitrate: '192',
    style: 'Egypt • Master Reciter'
  },
  'ar.abdurrahmaansudais': {
    id: 'ar.abdurrahmaansudais',
    name: 'Abdur-Rahman as-Sudais',
    arabicName: 'عبد الرحمن السديس',
    subfolder: 'Abdurrahmaan_As-Sudais_192kbps',
    bitrate: '192',
    style: 'Makkah • Reverent Pace'
  },
  'ar.minshawi': {
    id: 'ar.minshawi',
    name: 'Mohamed Siddiq al-Minshawi',
    arabicName: 'محمد صديق المنشاوي',
    subfolder: 'Minshawy_Murattal_128kbps',
    bitrate: '128',
    style: 'Egypt • Emotional & Soulful'
  }
};

// Circuit Breaker State
let consecutiveCdnErrors = 0;
const CDN_MAX_ERRORS = 2;
let cdnDegradedUntil = 0;

export function recordAudioOutcome(sourceType: 'cdn' | 'mirror', success: boolean) {
  if (sourceType === 'cdn') {
    if (success) {
      consecutiveCdnErrors = 0;
    } else {
      consecutiveCdnErrors++;
      if (consecutiveCdnErrors >= CDN_MAX_ERRORS) {
        // Degrade CDN for 15 minutes, automatically defaulting to EveryAyah mirror
        cdnDegradedUntil = Date.now() + 15 * 60 * 1000;
        console.warn(`[QuranAudioEngine] CDN entered degraded state after ${consecutiveCdnErrors} consecutive errors. Routing session to mirror.`);
      }
    }
  }
}

export function isCdnDegraded(): boolean {
  if (cdnDegradedUntil > 0) {
    if (Date.now() < cdnDegradedUntil) {
      return true;
    }
    // Cooldown elapsed, reset to re-test
    cdnDegradedUntil = 0;
    consecutiveCdnErrors = 0;
  }
  return false;
}

export function resetCdnHealth() {
  consecutiveCdnErrors = 0;
  cdnDegradedUntil = 0;
}

export interface AyahAudioSources {
  primaryUrl: string;
  backupUrl: string;
  activeUrl: string;
  isMirrorActive: boolean;
  surahNumber: number;
  ayahInSurah: number;
  globalAyahNumber: number;
}

/**
 * Resolves verified primary and mirror audio URLs for any given Ayah.
 * Synthesizes proper fallback paths even if `ayah.audio` is null or corrupted.
 */
export function resolveAyahAudio(
  ayah: Ayah | null | undefined,
  contextSurahId: number | null,
  reciterId: string,
  forceMirrorFallback: boolean = false
): AyahAudioSources {
  const profile = QURAN_RECITERS[reciterId] || QURAN_RECITERS['ar.alafasy'];

  if (!ayah) {
    return {
      primaryUrl: '',
      backupUrl: '',
      activeUrl: '',
      isMirrorActive: false,
      surahNumber: 1,
      ayahInSurah: 1,
      globalAyahNumber: 1
    };
  }

  // Determine exact surah and ayah numbers
  const surahNumber = ayah.surahNumber || (contextSurahId && contextSurahId > 0 ? contextSurahId : (ayah as any).surah?.number || 1);
  const ayahInSurah = ayah.numberInSurah || 1;
  const globalAyahNumber = ayah.number || 1;

  // Format 3-digit identifiers for EveryAyah mirror (e.g. 001007.mp3)
  const sStr = String(surahNumber).padStart(3, '0');
  const aStr = String(ayahInSurah).padStart(3, '0');
  const mirrorUrl = `https://everyayah.com/data/${profile.subfolder}/${sStr}${aStr}.mp3`;

  // Format CDN URL (e.g. https://cdn.islamic.network/quran/audio/128/ar.alafasy/7.mp3)
  let cdnUrl = '';
  if (ayah.audio && ayah.audio.includes('/ar.')) {
    cdnUrl = ayah.audio.replace(
      /\/\d+\/ar\.[^/]+/,
      `/${profile.bitrate}/${profile.id}`
    );
  } else {
    cdnUrl = `https://cdn.islamic.network/quran/audio/${profile.bitrate}/${profile.id}/${globalAyahNumber}.mp3`;
  }

  const shouldUseMirror = forceMirrorFallback || isCdnDegraded();
  const activeUrl = shouldUseMirror ? mirrorUrl : cdnUrl;
  const backupUrl = shouldUseMirror ? cdnUrl : mirrorUrl;

  return {
    primaryUrl: cdnUrl,
    backupUrl,
    activeUrl,
    isMirrorActive: shouldUseMirror,
    surahNumber,
    ayahInSurah,
    globalAyahNumber
  };
}

/**
 * Single-instance audio preloader to prevent dangling HTMLAudioElement memory leaks.
 */
class AyahPreloadManager {
  private preloader: HTMLAudioElement | null = null;
  private currentPreloadSrc: string = '';

  public preloadNextAyah(url: string) {
    if (!url || url === this.currentPreloadSrc || typeof window === 'undefined') {
      return;
    }

    try {
      if (!this.preloader) {
        this.preloader = new Audio();
      } else {
        this.preloader.pause();
        this.preloader.removeAttribute('src');
      }

      this.currentPreloadSrc = url;
      this.preloader.preload = 'auto';
      this.preloader.src = url;
    } catch {}
  }

  public cleanup() {
    if (this.preloader) {
      try {
        this.preloader.pause();
        this.preloader.removeAttribute('src');
        this.preloader.load();
      } catch {}
      this.preloader = null;
      this.currentPreloadSrc = '';
    }
  }
}

export const ayahPreloadManager = new AyahPreloadManager();
