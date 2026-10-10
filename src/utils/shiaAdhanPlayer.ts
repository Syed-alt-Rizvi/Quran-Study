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
          this.notify();
        }
      });

      this.audio.addEventListener('error', (e) => {
        console.warn('Adhan audio element error:', e);
        this.isPlaying = false;
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
      this.notify();
      return false;
    }
  }

  public pauseAdhan() {
    if (this.audio) {
      this.audio.pause();
    }
    this.isPlaying = false;
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

// Schedules native device alarms on Android via Capacitor without external push
export async function scheduleNativeAdhanAlarms(
  timings: ShiaPrayerTimings,
  settings: { autoPlayFajr?: boolean; autoPlayDhuhr?: boolean; autoPlayMaghrib?: boolean }
) {
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }

    // Create high-importance Android notification channel with authentic Shia Adhan audio
    await LocalNotifications.createChannel({
      id: 'shia_adhan_alarm',
      name: 'Shia Adhan Prayer Calls',
      description: 'Authentic Shia Ithna-Ashari Adhan Announcements',
      importance: 5,
      visibility: 1,
      sound: 'shia_adhan.mp3',
      vibration: true,
      lights: true
    }).catch(() => {});

    // Cancel existing adhan alarms
    await LocalNotifications.cancel({
      notifications: [{ id: 800001 }, { id: 800002 }, { id: 800003 }]
    }).catch(() => {});

    const now = new Date();
    const notificationsToSchedule = [];

    const prayers = [
      { id: 800001, name: 'Fajr (Subh)', time: timings.fajr, enabled: settings.autoPlayFajr !== false },
      { id: 800002, name: 'Dhuhr (Zuhr)', time: timings.dhuhr, enabled: settings.autoPlayDhuhr !== false },
      { id: 800003, name: 'Maghrib', time: timings.maghrib, enabled: settings.autoPlayMaghrib !== false },
    ];

    for (const p of prayers) {
      if (!p.enabled) continue;
      const cleanTime = p.time.split(' ')[0];
      const [h, m] = cleanTime.split(':').map(Number);
      if (isNaN(h) || isNaN(m)) continue;

      const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
      if (targetDate.getTime() > now.getTime()) {
        notificationsToSchedule.push({
          id: p.id,
          title: `Shia Adhan: ${p.name}`,
          body: `It is now time for ${p.name} prayer. (Ja'fari Method)`,
          channelId: 'shia_adhan_alarm',
          sound: 'shia_adhan.mp3',
          schedule: { at: targetDate, allowWhileIdle: true },
          extra: { prayer: p.name, type: 'adhan' }
        });
      }
    }

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({ notifications: notificationsToSchedule });
    }
  } catch {
    // Non-native / Web environment
  }
}
