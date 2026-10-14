import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  MapPin, Search, Navigation, Volume2, Play, Pause, 
  ArrowLeft, X, Loader2, Volume1, Bell, BellOff,
  ShieldCheck, Cpu, BatteryCharging, CheckCircle2, AlertCircle, RefreshCw, Smartphone
} from 'lucide-react';
import { 
  getShiaPrayerTimes, ShiaPrayerTimings, getNextShiaPrayer, format12Hour, 
  SHIA_PRAYER_NAMES, ShiaPrayerKey, calculateQibla
} from '../utils/shiaPrayerTimes';
import { shiaAdhanPlayer, AdhanNative } from '../utils/shiaAdhanPlayer';
import { Capacitor } from '@capacitor/core';
import { useSettingsStore } from '../store';
import { hapticImpact } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';
import { POPULAR_CITIES, CityData, searchCitiesOnline } from '../data/shiaCities';

interface AdhanMapScreenProps {
  onBack?: () => void;
}

function formatAudioTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function AdhanMapScreen({ onBack }: AdhanMapScreenProps) {
  const { userLocation, setUserLocation, adhanSettings, updateAdhanSettings } = useSettingsStore();

  const [timings, setTimings] = useState<ShiaPrayerTimings | null>(null);
  const [loadingTimings, setLoadingTimings] = useState(false);
  const [now, setNow] = useState(new Date());

  // Search state for cities
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityData[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [locatingGPS, setLocatingGPS] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Audio player status
  const [playerStatus, setPlayerStatus] = useState(shiaAdhanPlayer.getStatus());
  const [exactAlarmGranted, setExactAlarmGranted] = useState<boolean | null>(null);
  const [batteryBypassed, setBatteryBypassed] = useState<boolean | null>(null);
  const [testingNativeAlarm, setTestingNativeAlarm] = useState(false);

  // Subscribe to adhan player events and query native alarm system status
  useEffect(() => {
    const unsub = shiaAdhanPlayer.subscribe(() => {
      setPlayerStatus(shiaAdhanPlayer.getStatus());
    });

    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
      AdhanNative.checkExactAlarmPermission().then(res => setExactAlarmGranted(res.granted)).catch(() => {});
      AdhanNative.checkBatteryOptimization().then(res => setBatteryBypassed(res.ignoringBatteryOptimizations)).catch(() => {});
    }

    return unsub;
  }, []);

  // Live timer for countdown & background scheduler checks
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());

      if (timings) {
        shiaAdhanPlayer.checkScheduledTimes(
          { fajr: timings.fajr, dhuhr: timings.dhuhr, maghrib: timings.maghrib },
          {
            autoPlayFajr: adhanSettings.autoPlayFajr,
            autoPlayDhuhr: adhanSettings.autoPlayDhuhr,
            autoPlayMaghrib: adhanSettings.autoPlayMaghrib,
            repeatCount: adhanSettings.repeatCount || 1
          }
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timings, adhanSettings]);

  // Load prayer times for current city
  const loadTimes = useCallback(async (lat: number, lng: number) => {
    setLoadingTimings(true);
    try {
      const res = await getShiaPrayerTimes(lat, lng, new Date());
      setTimings(res);
    } catch (err) {
      console.warn('Failed to load Shia prayer times:', err);
    } finally {
      setLoadingTimings(false);
    }
  }, []);

  useEffect(() => {
    loadTimes(userLocation.latitude, userLocation.longitude);
  }, [userLocation.latitude, userLocation.longitude, loadTimes]);

  // Handle instant fuzzy search on city input change
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setSearchResults(POPULAR_CITIES.slice(0, 8));
      setIsSearchingOnline(false);
      return;
    }

    const localMatches = POPULAR_CITIES.filter(
      (c) => c.name.toLowerCase().includes(query) || c.country.toLowerCase().includes(query)
    );

    setSearchResults(localMatches.slice(0, 8));

    if (localMatches.length < 3 && query.length >= 3) {
      setIsSearchingOnline(true);
      const timer = setTimeout(async () => {
        const online = await searchCitiesOnline(query);
        setSearchResults(online);
        setIsSearchingOnline(false);
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setIsSearchingOnline(false);
    }
  }, [searchQuery]);

  // Focus input when search opens
  useEffect(() => {
    if (isSearching) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isSearching]);

  // Lock in selected city
  const handleSelectCity = (city: CityData) => {
    hapticImpact(ImpactStyle.Light);
    setUserLocation({
      name: city.name,
      country: city.country,
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.timezone
    });
    setIsSearching(false);
    setSearchQuery('');
  };

  // GPS Locate User
  const handleUseGPS = () => {
    if (!navigator.geolocation) return;
    hapticImpact(ImpactStyle.Light);
    setLocatingGPS(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let detectedName = 'Current Location';
        let detectedCountry = '';

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { headers: { 'Accept': 'application/json' } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            detectedName = addr.city || addr.town || addr.village || addr.county || 'Current Location';
            detectedCountry = addr.country || '';
          }
        } catch {}

        setUserLocation({
          name: detectedName,
          country: detectedCountry,
          latitude: lat,
          longitude: lng
        });
        setLocatingGPS(false);
        setIsSearching(false);
      },
      (err) => {
        console.warn('GPS location error:', err);
        setLocatingGPS(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Upcoming prayer computation
  const nextPrayer = useMemo(() => {
    if (!timings) return null;
    return getNextShiaPrayer(timings, now);
  }, [timings, now]);

  // Qibla bearing
  const qiblaDeg = useMemo(() => {
    return Math.round(calculateQibla(userLocation.latitude, userLocation.longitude));
  }, [userLocation.latitude, userLocation.longitude]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 -ml-1 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Back to Quran"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Prayer Times &amp; Adhan
            </h1>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Qibla {qiblaDeg}&deg;</span>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-3 space-y-3.5">
        {/* City Location: Quiet & Minimalist */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-3 sm:p-3.5">
          {!isSearching ? (
            <div className="flex items-center justify-between gap-2">
              <div 
                onClick={() => {
                  hapticImpact(ImpactStyle.Light);
                  setIsSearching(true);
                }}
                className="flex items-center gap-2 cursor-pointer group min-w-0"
              >
                <MapPin size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {userLocation.name}{userLocation.country ? `, ${userLocation.country}` : ''}
                </span>
                <span className="text-xs text-slate-400 font-normal underline ml-0.5">
                  Change
                </span>
              </div>

              <button
                onClick={handleUseGPS}
                disabled={locatingGPS}
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                title="Detect GPS Location"
              >
                {locatingGPS ? <Loader2 size={16} className="animate-spin text-emerald-600" /> : <Navigation size={16} />}
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="relative flex items-center">
                <Search size={15} className="absolute left-3 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter city name..."
                  className="w-full pl-8 pr-14 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => setIsSearching(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-1 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* City Suggestions */}
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {isSearchingOnline && (
                  <div className="py-2 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                    <Loader2 size={13} className="animate-spin text-emerald-600" />
                    <span>Searching global cities...</span>
                  </div>
                )}

                {searchResults.map((city) => (
                  <button
                    key={`${city.name}-${city.country}-${city.latitude}`}
                    onClick={() => handleSelectCity(city)}
                    className="w-full text-left py-2 px-1.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {city.name}, <span className="text-slate-400 font-normal">{city.country}</span>
                    </span>
                    {city.isHolySite && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Holy Site
                      </span>
                    )}
                  </button>
                ))}

                {!isSearchingOnline && searchResults.length === 0 && searchQuery && (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    No matching city found.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Central Reverent Upcoming Prayer Card */}
        {nextPrayer && (
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white p-5 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-emerald-400 font-medium tracking-wide">
                  {nextPrayer.isAdhanTime ? 'Next Adhan' : 'Upcoming Prayer'}
                </span>
                <div className="flex items-baseline gap-2.5 mt-0.5">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {nextPrayer.nameEn}
                  </h2>
                  <span className="text-base text-slate-400 font-arabic" dir="rtl">
                    {nextPrayer.nameAr}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl sm:text-2xl font-bold text-emerald-200">
                    {nextPrayer.time12}
                  </span>
                  <span className="text-xs text-slate-400">
                    &bull; in {nextPrayer.formattedCountdown}
                  </span>
                </div>
              </div>

              {/* Quiet Play / Stop Button */}
              <button
                onClick={() => {
                  hapticImpact(ImpactStyle.Light);
                  shiaAdhanPlayer.unlockAudio();
                  if (playerStatus.isPlaying) {
                    shiaAdhanPlayer.stopAdhan();
                  } else {
                    shiaAdhanPlayer.playAdhan(nextPrayer.nameEn, adhanSettings.repeatCount || 1);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  playerStatus.isPlaying
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-white/10 hover:bg-white/15 text-slate-200'
                }`}
                title={playerStatus.isPlaying ? 'Stop' : 'Play Adhan'}
              >
                {playerStatus.isPlaying ? (
                  <>
                    <Pause size={13} className="fill-current" />
                    <span>Stop Adhan</span>
                  </>
                ) : (
                  <>
                    <Play size={13} className="fill-current" />
                    <span>Play Adhan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Today's Prayer Schedule: Clean, Minimalist Table */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Today's Schedule
            </span>
            <span className="text-[11px] text-slate-400">
              {now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {timings && (['fajr', 'sunrise', 'dhuhr', 'asr', 'sunset', 'maghrib', 'isha', 'midnight'] as ShiaPrayerKey[]).map((key) => {
              const time24 = timings[key];
              const time12 = format12Hour(time24);
              const info = SHIA_PRAYER_NAMES[key];
              const isNext = nextPrayer?.key === key;
              const isAdhan = info.isAdhan;

              return (
                <div
                  key={key}
                  className={`px-4 py-2.5 flex items-center justify-between transition-colors ${
                    isNext
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/25'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${isNext ? 'font-bold text-emerald-700 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'}`}>
                      {info.en}
                    </span>
                    {isAdhan && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Adhan
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className={`text-sm ${isNext ? 'font-bold text-emerald-700 dark:text-emerald-300' : 'font-medium text-slate-800 dark:text-slate-200'}`}>
                      {time12}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Automatic Playback Controls: Clean & Unobtrusive */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Automatic Daily Adhan
              </h3>
              <p className="text-[11px] text-slate-400">
                Plays on time at Fajr, Dhuhr, and Maghrib
              </p>
            </div>

            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                shiaAdhanPlayer.unlockAudio();
                if (playerStatus.isPlaying) {
                  shiaAdhanPlayer.stopAdhan();
                } else {
                  shiaAdhanPlayer.playAdhan('Adhan Sound Test', 1);
                }
              }}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
            >
              {playerStatus.isPlaying ? 'Stop' : 'Preview Sound'}
            </button>
          </div>

          {/* Three Daily Adhan Toggles */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                shiaAdhanPlayer.unlockAudio();
                updateAdhanSettings({ autoPlayFajr: adhanSettings.autoPlayFajr === false });
              }}
              className={`p-2 rounded-xl border text-center transition-all ${
                adhanSettings.autoPlayFajr !== false
                  ? 'border-emerald-500/60 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-medium'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-xs font-semibold flex items-center justify-center gap-1">
                {adhanSettings.autoPlayFajr !== false ? <Bell size={12} /> : <BellOff size={12} />}
                <span>Fajr</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{timings?.fajr ? format12Hour(timings.fajr) : '--:--'}</p>
            </button>

            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                shiaAdhanPlayer.unlockAudio();
                updateAdhanSettings({ autoPlayDhuhr: adhanSettings.autoPlayDhuhr === false });
              }}
              className={`p-2 rounded-xl border text-center transition-all ${
                adhanSettings.autoPlayDhuhr !== false
                  ? 'border-emerald-500/60 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-medium'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-xs font-semibold flex items-center justify-center gap-1">
                {adhanSettings.autoPlayDhuhr !== false ? <Bell size={12} /> : <BellOff size={12} />}
                <span>Dhuhr</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{timings?.dhuhr ? format12Hour(timings.dhuhr) : '--:--'}</p>
            </button>

            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                shiaAdhanPlayer.unlockAudio();
                updateAdhanSettings({ autoPlayMaghrib: adhanSettings.autoPlayMaghrib === false });
              }}
              className={`p-2 rounded-xl border text-center transition-all ${
                adhanSettings.autoPlayMaghrib !== false
                  ? 'border-emerald-500/60 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-medium'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-xs font-semibold flex items-center justify-center gap-1">
                {adhanSettings.autoPlayMaghrib !== false ? <Bell size={12} /> : <BellOff size={12} />}
                <span>Maghrib</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{timings?.maghrib ? format12Hour(timings.maghrib) : '--:--'}</p>
            </button>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-2.5 pt-1">
            <Volume1 size={15} className="text-slate-400 shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={adhanSettings.volume ?? 0.9}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                shiaAdhanPlayer.setVolume(vol);
                updateAdhanSettings({ volume: vol });
              }}
              className="w-full accent-emerald-600 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] font-mono text-slate-400 shrink-0">
              {Math.round((adhanSettings.volume ?? 0.9) * 100)}%
            </span>
          </div>

          {/* OS-Level Scheduling & Battery Optimization Card */}
          <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>OS Background Scheduling &amp; Battery Safety</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                {Capacitor.isNativePlatform() ? 'AlarmClock Active' : 'Web Worker Sync'}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Uses <code className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">AlarmManager.setAlarmClock()</code> and <code className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">UNCalendarNotificationTrigger</code> to wake the device CPU and bypass modern Android Doze Mode, OEM task killers, and iOS background restrictions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {/* Rolling 48h Queue & Midnight Refresh Badge */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>48h Rolling Queue</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Pre-queues 24–48 hours ahead with daily 00:02 AM automatic Midnight Refresh.
                </p>
              </div>

              {/* Foreground Audio Service */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                  <Cpu size={13} className="text-emerald-500" />
                  <span>START_STICKY Service</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Persistent notification and CPU WakeLock prevent OS audio termination midway.
                </p>
              </div>
            </div>

            {/* Android Exact Alarm & Battery Permissions Controls */}
            {Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android' && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {exactAlarmGranted === false && (
                  <button
                    onClick={async () => {
                      hapticImpact(ImpactStyle.Light);
                      const res = await AdhanNative.requestExactAlarmPermission();
                      if (res.alreadyGranted) setExactAlarmGranted(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <AlertCircle size={12} />
                    <span>Grant Exact Alarm Permission (Android 12+)</span>
                  </button>
                )}

                {batteryBypassed === false && (
                  <button
                    onClick={async () => {
                      hapticImpact(ImpactStyle.Light);
                      await AdhanNative.requestIgnoreBatteryOptimization();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-teal-500/15 border border-teal-500/40 text-teal-700 dark:text-teal-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <BatteryCharging size={12} />
                    <span>Disable Battery Saver for Adhan</span>
                  </button>
                )}

                <button
                  onClick={async () => {
                    hapticImpact(ImpactStyle.Light);
                    setTestingNativeAlarm(true);
                    try {
                      await AdhanNative.playAdhanNow({ prayerName: 'Adhan Foreground Test' });
                      setTimeout(async () => {
                        await AdhanNative.stopAdhanPlayback();
                        setTestingNativeAlarm(false);
                      }, 5000);
                    } catch {
                      setTestingNativeAlarm(false);
                    }
                  }}
                  disabled={testingNativeAlarm}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ml-auto"
                >
                  {testingNativeAlarm ? <RefreshCw size={11} className="animate-spin" /> : <Play size={11} />}
                  <span>{testingNativeAlarm ? 'Playing Foreground Service (5s)...' : 'Test Native Alarm Service'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
