// Shia Adhan Audio Player & Scheduler Engine
// Plays authentic Shia Ithna Ashari Adhan at the exact announced times (Fajr, Dhuhr, Maghrib)

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

function normalizeHM(timeStr: string): string {
  if (!timeStr) return '';
  const clean = timeStr.trim().split(' ')[0];
  const parts = clean.split(':');
  if (parts.length >= 2) {
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!isNaN(h) && !isNaN(m)) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
  }
  return clean;
}

class ShiaAdhanPlayerService {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private currentPrayerName: string | null = null;
  private listeners: Set<() => void> = new Set();
  private lastAnnouncedMinute = '';
  private repeatCount = 1;
  private currentRepeat = 0;
  private isUnlocked = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
      this.setupGlobalUnlockListeners();
    }
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
        console.warn('Adhan audio error:', e);
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
    };

    ['click', 'touchstart', 'pointerdown', 'keydown'].forEach((evt) => {
      window.addEventListener(evt, unlock, { once: true, passive: true });
    });
  }

  // Pre-warms browser audio pipeline on user interaction to enable smooth autoplay
  public async unlockAudio(): Promise<boolean> {
    if (this.isUnlocked) return true;
    this.initAudio();
    if (!this.audio) return false;

    try {
      this.isUnlocked = true;
      this.audio.load();
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

      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      this.isPlaying = true;
      this.isUnlocked = true;

      // Dispatch global event for in-app UI announcement banner
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('shia-adhan-playing', {
            detail: { prayerName, time: new Date().toLocaleTimeString(), blocked: false }
          })
        );

        // System notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(`Shia Adhan: ${prayerName}`, {
              body: `It is now time for ${prayerName} prayer.`,
              icon: '/icons/icon-192.webp'
            });
          } catch {}
        }
      }

      this.notify();
      return true;
    } catch (err) {
      console.warn('Playback blocked by browser policy:', err);
      this.isPlaying = false;

      // In case background playback was deferred, show announcement banner with tap-to-play
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('shia-adhan-playing', {
            detail: { prayerName, time: new Date().toLocaleTimeString(), blocked: true }
          })
        );
      }

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

  // Scheduler check invoked continuously every second
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
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    const currentHM = `${h}:${m}`;

    if (currentHM === this.lastAnnouncedMinute) {
      return; // Already triggered for this minute
    }

    const fajrHM = normalizeHM(timings.fajr);
    const dhuhrHM = normalizeHM(timings.dhuhr);
    const maghribHM = normalizeHM(timings.maghrib);

    // Auto-play default is true for all three times unless explicitly disabled
    const autoFajr = settings.autoPlayFajr !== false;
    const autoDhuhr = settings.autoPlayDhuhr !== false;
    const autoMaghrib = settings.autoPlayMaghrib !== false;
    const repeats = settings.repeatCount || 1;

    // 1. Fajr (Subh) Adhan
    if (autoFajr && fajrHM === currentHM) {
      this.lastAnnouncedMinute = currentHM;
      this.playAdhan('Fajr (Subh)', repeats);
      return;
    }

    // 2. Dhuhr (Midday / Zawal) Adhan
    if (autoDhuhr && dhuhrHM === currentHM) {
      this.lastAnnouncedMinute = currentHM;
      this.playAdhan('Dhuhr (Zuhr)', repeats);
      return;
    }

    // 3. Maghrib (Sunset + Eastern Redness Clearance) Adhan
    if (autoMaghrib && maghribHM === currentHM) {
      this.lastAnnouncedMinute = currentHM;
      this.playAdhan('Maghrib', repeats);
      return;
    }
  }
}

export const shiaAdhanPlayer = new ShiaAdhanPlayerService();
