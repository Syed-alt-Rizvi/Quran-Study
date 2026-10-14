// Shia Adhan Audio Player & Scheduler Engine
// Plays authentic Shia Ithna Ashari Adhan at the exact announced times (Fajr, Dhuhr, Maghrib)

import { ShiaPrayerTimings } from './shiaPrayerTimes';

export interface ShiaAdhanLine {
  arabic: string;
  transliteration: string;
  english: string;
  repeat: number;
}

export const SHIA_ADHAN_TEXT: ShiaAdhanLine[] = [
  {
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allāhu Akbar",
    english: "Allah is the Greatest",
    repeat: 4
  },
  {
    arabic: "أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ",
    transliteration: "Ashhadu an lā ilāha illallāh",
    english: "I bear witness that there is no god but Allah",
    repeat: 2
  },
  {
    arabic: "أَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ",
    transliteration: "Ashhadu anna Muḥammadan Rasūlullāh",
    english: "I bear witness that Muhammad is the Messenger of Allah",
    repeat: 2
  },
  {
    arabic: "أَشْهَدُ أَنَّ عَلِيًّا وَلِيُّ اللَّهِ",
    transliteration: "Ashhadu anna ‘Aliyyan Walīyullāh",
    english: "I bear witness that Ali is the Guardian / Wali of Allah",
    repeat: 2
  },
  {
    arabic: "حَيَّ عَلَى الصَّلَاةِ",
    transliteration: "Ḥayya ‘alaṣ-ṣalāh",
    english: "Hasten to the Prayer",
    repeat: 2
  },
  {
    arabic: "حَيَّ عَلَى الْفَلَاحِ",
    transliteration: "Ḥayya ‘alal-falāḥ",
    english: "Hasten to Success",
    repeat: 2
  },
  {
    arabic: "حَيَّ عَلَى خَيْرِ الْعَمَلِ",
    transliteration: "Ḥayya ‘alā khayril-‘amal",
    english: "Hasten to the Best of Deeds (Shia Call)",
    repeat: 2
  },
  {
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allāhu Akbar",
    english: "Allah is the Greatest",
    repeat: 2
  },
  {
    arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ",
    transliteration: "Lā ilāha illallāh",
    english: "There is no god but Allah",
    repeat: 2
  }
];

function timeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  const clean = timeStr.trim().split(' ')[0];
  const parts = clean.split(':');
  if (parts.length >= 2) {
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!isNaN(h) && !isNaN(m)) {
      return h * 60 + m;
    }
  }
  return null;
}

class ShiaAdhanPlayerService {
  private audio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private isPlaying = false;
  private currentPrayerName: string | null = null;
  private listeners: Set<() => void> = new Set();
  private repeatCount = 1;
  private currentRepeat = 0;
  private isUnlocked = false;
  private pendingPrayer: string | null = null;
  private wakeLock: any = null;
  private lastPlayedDate: { fajr: string; dhuhr: string; maghrib: string } = {
    fajr: '',
    dhuhr: '',
    maghrib: ''
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadLastPlayedDate();
      this.initAudio();
      this.setupGlobalUnlockListeners();

      // Ensure Screen WakeLock is maintained if app comes to foreground while playing
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible' && this.isPlaying) {
            this.acquireWakeLock();
          }
        });
      }

      // Listen for Capacitor native scheduled alarm triggers
      import('@capacitor/local-notifications').then(({ LocalNotifications }) => {
        LocalNotifications.addListener('localNotificationReceived', (notification: any) => {
          if (notification?.extra?.type === 'adhan') {
            this.playAdhan(notification.extra.prayer || 'Shia Adhan', 1);
          }
        });
        LocalNotifications.addListener('localNotificationActionPerformed', (action: any) => {
          if (action?.notification?.extra?.type === 'adhan') {
            this.playAdhan(action.notification.extra.prayer || 'Shia Adhan', 1);
          }
        });
      }).catch(() => {});
    }
  }

  private async acquireWakeLock() {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && (navigator as any).wakeLock?.request) {
      try {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        this.wakeLock.addEventListener?.('release', () => {
          this.wakeLock = null;
        });
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

  private updateMediaSession(prayerName: string) {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `Shia Adhan (${prayerName})`,
          artist: "Ahlulbayt (a.s) Prayer Call • Ja'fari Method",
          album: 'Shia Markaz Adhan',
          artwork: [
            { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          ]
        });
        navigator.mediaSession.playbackState = 'playing';
        navigator.mediaSession.setActionHandler('play', () => {
          this.resumeAdhan();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          this.pauseAdhan();
        });
        navigator.mediaSession.setActionHandler('stop', () => {
          this.stopAdhan();
        });
      } catch {}
    }
  }

  private clearMediaSession() {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'none';
      } catch {}
    }
  }

  private loadLastPlayedDate() {
    try {
      const stored = localStorage.getItem('shia_adhan_last_played');
      if (stored) {
        this.lastPlayedDate = JSON.parse(stored);
      }
    } catch {}
  }

  private saveLastPlayedDate() {
    try {
      localStorage.setItem('shia_adhan_last_played', JSON.stringify(this.lastPlayedDate));
    } catch {}
  }

  private initAudio() {
    if (this.audio) return;
    try {
      const audioUrl = typeof window !== 'undefined' && window.location.origin
        ? `${window.location.origin}/audio/shia_adhan.mp3`
        : '/audio/shia_adhan.mp3';

      this.audio = new Audio(audioUrl);
      this.audio.preload = 'auto';
      this.audio.volume = 0.9;

      this.audio.addEventListener('play', () => {
        this.isPlaying = true;
        this.notify();
      });

      this.audio.addEventListener('pause', () => {
        this.isPlaying = false;
        this.notify();
      });

      this.audio.addEventListener('timeupdate', () => {
        this.notify();
      });

      this.audio.addEventListener('ended', () => {
        if (this.currentRepeat < this.repeatCount - 1) {
          this.currentRepeat++;
          this.audio?.play().catch(() => {});
        } else {
          this.isPlaying = false;
          this.currentPrayerName = null;
          this.currentRepeat = 0;
          this.releaseWakeLock();
          this.clearMediaSession();
          this.notify();
        }
      });

      this.audio.addEventListener('error', (e) => {
        console.warn('Adhan audio element error:', e);
        this.isPlaying = false;
        this.releaseWakeLock();
        this.clearMediaSession();
        this.notify();
      });
    } catch (e) {
      console.warn('Failed to initialize Adhan Audio instance:', e);
    }
  }

  private setupGlobalUnlockListeners() {
    const unlock = () => {
      this.unlockAudio();
      if (this.pendingPrayer && !this.isPlaying) {
        const prayer = this.pendingPrayer;
        this.pendingPrayer = null;
        this.playAdhan(prayer, this.repeatCount || 1);
      }
    };

    ['click', 'touchstart', 'pointerdown', 'keydown'].forEach((evt) => {
      window.addEventListener(evt, unlock, { passive: true });
    });
  }

  // Pre-warms browser audio pipeline on user interaction to grant full autoplay capability
  public async unlockAudio(): Promise<boolean> {
    if (this.isUnlocked) return true;
    this.initAudio();
    if (!this.audio) return false;

    try {
      // 1. Resume Web Audio Context
      if (typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          if (!this.audioCtx) this.audioCtx = new AudioCtx();
          if (this.audioCtx.state === 'suspended') {
            await this.audioCtx.resume();
          }
        }
      }

      // 2. Play 1ms muted to permanently register document user activation for this audio element
      const originalVolume = this.audio.volume;
      this.audio.volume = 0;
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        this.audio.pause();
        this.audio.currentTime = 0;
      }
      this.audio.volume = originalVolume || 0.9;
      this.isUnlocked = true;
      this.notify();
      return true;
    } catch {
      return false;
    }
  }

  public isAudioUnlocked(): boolean {
    return this.isUnlocked;
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try { cb(); } catch {}
    });
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentPrayerName: this.currentPrayerName,
      currentTime: this.audio?.currentTime || 0,
      duration: this.audio?.duration || 0,
      volume: this.audio?.volume ?? 0.9,
      repeatCount: this.repeatCount,
      currentRepeat: this.currentRepeat,
      isUnlocked: this.isUnlocked
    };
  }

  public async playAdhan(prayerName: string = 'Shia Adhan', repeats: number = 1): Promise<boolean> {
    if (!this.audio) {
      this.initAudio();
    }
    if (!this.audio) return false;

    // Pause Quran recitation and Mafatih audio so they do not collide
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('pause-quran-audio'));
        window.dispatchEvent(new CustomEvent('pause-mafatih-audio'));
      } catch {}
    }

    try {
      this.currentPrayerName = prayerName;
      this.repeatCount = Math.max(1, repeats);
      this.currentRepeat = 0;
      this.audio.currentTime = 0;

      // Resume context if exists
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume().catch(() => {});
      }

      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      this.isPlaying = true;
      this.isUnlocked = true;
      this.pendingPrayer = null;

      // Lock screen / background playback preservation
      await this.acquireWakeLock();
      this.updateMediaSession(prayerName);

      // In PWA, if tab/screen is hidden, notify user via service worker
      if (typeof document !== 'undefined' && document.hidden && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(`Shia Adhan: ${prayerName}`, {
            body: `It is now time for ${prayerName} prayer. (Ja'fari Method)`,
            icon: '/pwa-192x192.png',
            tag: `adhan-${prayerName}`,
            requireInteraction: true
          });
        }).catch(() => {});
      }

      this.notify();
      return true;
    } catch (err) {
      console.warn('Playback blocked by browser policy:', err);
      this.isPlaying = false;
      this.pendingPrayer = prayerName;
      this.releaseWakeLock();
      this.clearMediaSession();
      this.notify();
      return false;
    }
  }

  public async resumeAdhan(): Promise<boolean> {
    if (!this.audio) return false;
    try {
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume().catch(() => {});
      }
      await this.audio.play();
      this.isPlaying = true;
      await this.acquireWakeLock();
      if (this.currentPrayerName) {
        this.updateMediaSession(this.currentPrayerName);
      }
      this.notify();
      return true;
    } catch {
      return false;
    }
  }

  public pauseAdhan() {
    if (this.audio) {
      this.audio.pause();
    }
    this.isPlaying = false;
    this.releaseWakeLock();
    this.clearMediaSession();
    this.notify();
  }

  public stopAdhan() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.isPlaying = false;
    this.currentPrayerName = null;
    this.currentRepeat = 0;
    this.releaseWakeLock();
    this.clearMediaSession();
    this.notify();
  }

  public setVolume(vol: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, vol));
    }
    this.notify();
  }

  public seek(seconds: number) {
    if (this.audio && Number.isFinite(seconds)) {
      this.audio.currentTime = Math.max(0, Math.min(this.audio.duration || 0, seconds));
    }
    this.notify();
  }

  // Scheduler check invoked continuously every second by the unthrottled ticker
  // Triggers automatically thrice daily: at Fajr, Dhuhr, and Maghrib
  public checkScheduledTimes(
    timings: { fajr: string; dhuhr: string; maghrib: string } | null,
    settings: {
      autoPlayFajr?: boolean;
      autoPlayDhuhr?: boolean;
      autoPlayMaghrib?: boolean;
      repeatCount?: number;
    }
  ) {
    if (!timings) return;
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const y = now.getFullYear();
    const m = (now.getMonth() + 1).toString().padStart(2, '0');
    const d = now.getDate().toString().padStart(2, '0');
    const todayKey = `${y}-${m}-${d}`;

    const autoFajr = settings.autoPlayFajr !== false;
    const autoDhuhr = settings.autoPlayDhuhr !== false;
    const autoMaghrib = settings.autoPlayMaghrib !== false;
    const repeats = settings.repeatCount || 1;

    // 1. Fajr (Subh) Adhan
    const fajrMins = timeToMinutes(timings.fajr);
    if (autoFajr && fajrMins !== null) {
      const diff = currentMins - fajrMins;
      // Trigger if current time is within [0, 5] minutes of Fajr and hasn't played today
      if (diff >= 0 && diff <= 5 && this.lastPlayedDate.fajr !== todayKey) {
        this.playAdhan('Fajr (Subh)', repeats).then(ok => {
          if (ok) {
            this.lastPlayedDate.fajr = todayKey;
            this.saveLastPlayedDate();
          }
        });
        return;
      }
    }

    // 2. Dhuhr (Midday / Zawal) Adhan
    const dhuhrMins = timeToMinutes(timings.dhuhr);
    if (autoDhuhr && dhuhrMins !== null) {
      const diff = currentMins - dhuhrMins;
      // Trigger if current time is within [0, 5] minutes of Dhuhr and hasn't played today
      if (diff >= 0 && diff <= 5 && this.lastPlayedDate.dhuhr !== todayKey) {
        this.playAdhan('Dhuhr (Zuhr)', repeats).then(ok => {
          if (ok) {
            this.lastPlayedDate.dhuhr = todayKey;
            this.saveLastPlayedDate();
          }
        });
        return;
      }
    }

    // 3. Maghrib (Sunset + Eastern Redness Clearance) Adhan
    const maghribMins = timeToMinutes(timings.maghrib);
    if (autoMaghrib && maghribMins !== null) {
      const diff = currentMins - maghribMins;
      // Trigger if current time is within [0, 5] minutes of Maghrib and hasn't played today
      if (diff >= 0 && diff <= 5 && this.lastPlayedDate.maghrib !== todayKey) {
        this.playAdhan('Maghrib', repeats).then(ok => {
          if (ok) {
            this.lastPlayedDate.maghrib = todayKey;
            this.saveLastPlayedDate();
          }
        });
        return;
      }
    }
  }
}

export const shiaAdhanPlayer = new ShiaAdhanPlayerService();

import { registerPlugin, Capacitor } from '@capacitor/core';

export interface AdhanNativePlugin {
  scheduleAlarms(options: {
    todayDate: string;
    fajrToday: string;
    dhuhrToday: string;
    maghribToday: string;
    tomorrowDate: string;
    fajrTomorrow: string;
    dhuhrTomorrow: string;
    maghribTomorrow: string;
    autoPlayFajr: boolean;
    autoPlayDhuhr: boolean;
    autoPlayMaghrib: boolean;
    latitude: number;
    longitude: number;
  }): Promise<{ success: boolean; message: string }>;
  cancelAllAlarms(): Promise<{ success: boolean }>;
  checkExactAlarmPermission(): Promise<{ granted: boolean; required: boolean; sdkInt: number }>;
  requestExactAlarmPermission(): Promise<{ opened: boolean; alreadyGranted?: boolean }>;
  checkBatteryOptimization(): Promise<{ ignoringBatteryOptimizations: boolean }>;
  requestIgnoreBatteryOptimization(): Promise<{ requested: boolean; error?: string }>;
  playAdhanNow(options?: { prayerName?: string }): Promise<{ success: boolean }>;
  stopAdhanPlayback(): Promise<{ success: boolean }>;
  getAlarmStatus(): Promise<any>;
}

export const AdhanNative = registerPlugin<AdhanNativePlugin>('AdhanNative');

/**
 * High-Precision Adhan Native Scheduler
 * 
 * Android Architecture:
 * - Uses AlarmManager.setAlarmClock() for to-the-second execution bypassing Doze Mode & OEM task killers
 * - BroadcastReceiver for ACTION_BOOT_COMPLETED & ACTION_TIMEZONE_CHANGED to auto-reschedule alarms
 * - Foreground Service with START_STICKY, WakeLock, and persistent notification for reliable playback
 * - Handles SCHEDULE_EXACT_ALARM (Android 12+) and USE_EXACT_ALARM (Android 14+)
 * 
 * iOS Architecture:
 * - Schedules local notifications using UNCalendarNotificationTrigger specifications (48-hour rolling queue)
 * - Critical Alerts entitlement (com.apple.developer.usernotifications.critical-alerts) allows bypassing hardware mute switch
 * - Strictly avoids infinite background loops or background execution timers which iOS aggressively terminates
 * 
 * Midnight Refresh:
 * - Rolling 48-hour queue (Today + Tomorrow)
 * - Native 00:02 AM alarm that advances the queue and recalculates the next 48-hour prayer times
 */
export async function scheduleNativeAdhanAlarms(
  todayTimings: ShiaPrayerTimings,
  tomorrowTimings?: ShiaPrayerTimings | null,
  options?: {
    autoPlayFajr?: boolean;
    autoPlayDhuhr?: boolean;
    autoPlayMaghrib?: boolean;
    latitude?: number;
    longitude?: number;
    todayDateStr?: string;
    tomorrowDateStr?: string;
  }
) {
  const autoFajr = options?.autoPlayFajr !== false;
  const autoDhuhr = options?.autoPlayDhuhr !== false;
  const autoMaghrib = options?.autoPlayMaghrib !== false;
  const lat = options?.latitude || 0;
  const lng = options?.longitude || 0;

  const now = new Date();
  const formatYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = options?.todayDateStr || formatYMD(now);
  const tomDate = new Date(now.getTime() + 86400000);
  const tomorrowStr = options?.tomorrowDateStr || formatYMD(tomDate);

  const fajrToday = todayTimings.fajr || '';
  const dhuhrToday = todayTimings.dhuhr || '';
  const maghribToday = todayTimings.maghrib || '';

  const fajrTomorrow = tomorrowTimings?.fajr || fajrToday;
  const dhuhrTomorrow = tomorrowTimings?.dhuhr || dhuhrToday;
  const maghribTomorrow = tomorrowTimings?.maghrib || maghribToday;

  // 1. Android: Native AlarmManager.setAlarmClock() via AdhanNativePlugin
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    try {
      await AdhanNative.scheduleAlarms({
        todayDate: todayStr,
        fajrToday,
        dhuhrToday,
        maghribToday,
        tomorrowDate: tomorrowStr,
        fajrTomorrow,
        dhuhrTomorrow,
        maghribTomorrow,
        autoPlayFajr: autoFajr,
        autoPlayDhuhr: autoDhuhr,
        autoPlayMaghrib: autoMaghrib,
        latitude: lat,
        longitude: lng,
      });
      return;
    } catch (err) {
      console.warn('AdhanNative.scheduleAlarms error, falling back to LocalNotifications:', err);
    }
  }

  // 2. iOS / Native Companion: UNCalendarNotificationTrigger via @capacitor/local-notifications
  if (Capacitor.isNativePlatform()) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }

      // iOS & Android Notification Channel
      await LocalNotifications.createChannel({
        id: 'shia_adhan_alarm',
        name: 'Shia Adhan Prayer Calls',
        description: 'Authentic Shia Ithna-Ashari Adhan Announcements',
        importance: 5,
        visibility: 1,
        sound: 'shia_adhan.mp3',
        vibration: true,
        lights: true,
      }).catch(() => {});

      // Cancel existing 48-hour scheduled notifications
      const existingIds = [800001, 800002, 800003, 800004, 800005, 800006];
      await LocalNotifications.cancel({
        notifications: existingIds.map((id) => ({ id })),
      }).catch(() => {});

      const notificationsToSchedule: any[] = [];

      // Queue for Today and Tomorrow (48-Hour Rolling Window)
      const dayConfigs = [
        {
          date: now,
          fajr: fajrToday,
          dhuhr: dhuhrToday,
          maghrib: maghribToday,
          idBase: 800000,
          labelSuffix: 'Today',
        },
        {
          date: tomDate,
          fajr: fajrTomorrow,
          dhuhr: dhuhrTomorrow,
          maghrib: maghribTomorrow,
          idBase: 800003,
          labelSuffix: 'Tomorrow',
        },
      ];

      for (const day of dayConfigs) {
        const prayers = [
          { id: day.idBase + 1, name: 'Fajr (Subh)', time: day.fajr, enabled: autoFajr },
          { id: day.idBase + 2, name: 'Dhuhr (Zuhr)', time: day.dhuhr, enabled: autoDhuhr },
          { id: day.idBase + 3, name: 'Maghrib', time: day.maghrib, enabled: autoMaghrib },
        ];

        for (const p of prayers) {
          if (!p.enabled || !p.time) continue;
          const cleanTime = p.time.split(' ')[0];
          const [h, m] = cleanTime.split(':').map(Number);
          if (isNaN(h) || isNaN(m)) continue;

          const targetDate = new Date(
            day.date.getFullYear(),
            day.date.getMonth(),
            day.date.getDate(),
            h,
            m,
            0
          );

          if (targetDate.getTime() > now.getTime()) {
            notificationsToSchedule.push({
              id: p.id,
              title: `Shia Adhan • ${p.name}`,
              body: `It is now time for ${p.name} prayer. (Ja'fari Method)`,
              channelId: 'shia_adhan_alarm',
              sound: 'shia_adhan.mp3',
              // On iOS, 'schedule: { at: targetDate }' maps to UNCalendarNotificationTrigger
              schedule: { at: targetDate, allowWhileIdle: true },
              extra: { prayer: p.name, type: 'adhan', critical: true },
            });
          }
        }
      }

      if (notificationsToSchedule.length > 0) {
        await LocalNotifications.schedule({ notifications: notificationsToSchedule });
      }
    } catch (e) {
      console.warn('LocalNotifications scheduling error:', e);
    }
  }
}
