import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  MapPin, Search, Navigation, Volume2, Play, Pause, 
  ArrowLeft, X, Loader2, Volume1, Bell, BellOff 
} from 'lucide-react';
import { 
  getShiaPrayerTimes, ShiaPrayerTimings, getNextShiaPrayer, format12Hour, 
  SHIA_PRAYER_NAMES, ShiaPrayerKey, calculateQibla
} from '../utils/shiaPrayerTimes';
import { shiaAdhanPlayer } from '../utils/shiaAdhanPlayer';
import { useSettingsStore } from '../store';
import { hapticImpact } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';
import { POPULAR_CITIES, CityData, searchCitiesOnline, reverseGeocodeLocation } from '../data/shiaCities';

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
  const { userLocation, setUserLocation, adhanSettings, updateAdhanSettings, appLanguage } = useSettingsStore();
  const isUrdu = appLanguage === 'ur';

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

  // Subscribe to adhan player events
  useEffect(() => {
    const unsub = shiaAdhanPlayer.subscribe(() => {
      setPlayerStatus(shiaAdhanPlayer.getStatus());
    });
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
        const detected = await reverseGeocodeLocation(lat, lng);

        setUserLocation({
          name: detected.name,
          country: detected.country,
          latitude: Math.round(lat * 10000) / 10000,
          longitude: Math.round(lng * 10000) / 10000
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
    <div className="min-h-screen pb-28 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <div className="sticky top-0 z-20 liquid-glass border-b border-white/30 dark:border-white/10 px-4 py-3 shadow-xs">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 -ml-1 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                title="Back to Quran"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h1 className="text-lg sm:text-xl font-['Cormorant_Garamond',_'Playfair_Display',_Georgia,_serif] italic font-semibold text-slate-900 dark:text-slate-100 leading-none">
              Prayer Times &amp; Adhan
            </h1>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 font-medium liquid-glass px-2.5 py-1 rounded-xl border border-white/40 dark:border-white/10 shadow-2xs">
            <span>Qibla {qiblaDeg}&deg;</span>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-3 space-y-3.5">
        {/* City Location: Quiet & Minimalist */}
        <div className="liquid-glass-card rounded-2xl border border-white/40 dark:border-white/10 p-3 sm:p-3.5 shadow-xs">
          {!isSearching ? (
            <div className="flex items-center justify-between gap-2">
              <div 
                onClick={() => {
                  hapticImpact(ImpactStyle.Light);
                  setIsSearching(true);
                }}
                className="flex items-center gap-2 cursor-pointer group min-w-0"
              >
                <MapPin size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {userLocation.name}{userLocation.country ? `, ${userLocation.country}` : ''}
                </span>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-normal underline ml-0.5">
                  Change
                </span>
              </div>

              <button
                onClick={handleUseGPS}
                disabled={locatingGPS}
                className="p-1.5 rounded-xl liquid-glass text-slate-600 dark:text-slate-300 hover:text-amber-600 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors shrink-0 border border-white/40 dark:border-white/10 shadow-2xs cursor-pointer"
                title="Detect GPS Location"
              >
                {locatingGPS ? <Loader2 size={16} className="animate-spin text-amber-600" /> : <Navigation size={16} />}
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
                  className="w-full pl-8 pr-14 py-2 text-sm rounded-xl liquid-glass border border-white/40 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => setIsSearching(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-1 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* City Suggestions */}
              <div className="max-h-56 overflow-y-auto divide-y divide-white/20 dark:divide-white/10 text-sm">
                {isSearchingOnline && (
                  <div className="py-2 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                    <Loader2 size={13} className="animate-spin text-amber-600" />
                    <span>Searching global cities...</span>
                  </div>
                )}

                {searchResults.map((city) => (
                  <button
                    key={`${city.name}-${city.country}-${city.latitude}`}
                    onClick={() => handleSelectCity(city)}
                    className="w-full text-left py-2 px-1.5 flex items-center justify-between hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors cursor-pointer rounded-lg"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {city.name}, <span className="text-slate-400 font-normal">{city.country}</span>
                    </span>
                    {city.isHolySite && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
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
          <div className="rounded-3xl liquid-glass-card glass-amber-fusion text-slate-900 dark:text-white p-5 border border-amber-400/40 dark:border-amber-500/20 shadow-md relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-amber-700 dark:text-amber-300 font-bold tracking-wide uppercase">
                  {nextPrayer.isAdhanTime ? 'Next Adhan' : 'Upcoming Prayer'}
                </span>
                <div className="flex items-baseline gap-2.5 mt-0.5">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {nextPrayer.nameEn}
                  </h2>
                  <span className="text-base text-amber-800 dark:text-amber-200 font-arabic font-normal" dir="rtl">
                    {nextPrayer.nameAr}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-300">
                    {nextPrayer.time12}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    · in {nextPrayer.formattedCountdown}
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
                    shiaAdhanPlayer.playAdhan(nextPrayer.nameEn, adhanSettings.repeatCount || 1, adhanSettings.adhanVoice);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  playerStatus.isPlaying
                    ? 'bg-amber-500 text-slate-950 border border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : 'liquid-glass border border-white/40 dark:border-white/15 text-slate-800 dark:text-slate-100 hover:bg-white/40'
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
        <div className="liquid-glass rounded-2xl border border-white/40 dark:border-white/10 overflow-hidden shadow-xs">
          <div className="px-4 py-3 border-b border-white/30 dark:border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Today's Schedule
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="divide-y divide-white/20 dark:divide-white/10">
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
                      ? 'bg-amber-500/15 dark:bg-amber-500/20'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${isNext ? 'font-bold text-amber-700 dark:text-amber-300' : 'text-slate-800 dark:text-slate-200'}`}>
                      {info.en}
                    </span>
                    {isAdhan && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold liquid-glass px-1.5 py-0.5 rounded-md border border-amber-400/30">
                        Adhan
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className={`text-sm ${isNext ? 'font-bold text-amber-700 dark:text-amber-300' : 'font-medium text-slate-800 dark:text-slate-200'}`}>
                      {time12}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Automatic Playback Controls: Clean & Unobtrusive */}
        <div className="liquid-glass-card rounded-2xl border border-white/40 dark:border-white/10 p-3.5 space-y-3 shadow-xs">
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
                  shiaAdhanPlayer.playAdhan('Adhan Sound Test', 1, adhanSettings.adhanVoice);
                }
              }}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
            >
              {playerStatus.isPlaying ? 'Stop' : 'Preview Sound'}
            </button>
          </div>

          {/* Three Daily Adhan Toggles as Firm Glass Slabs */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                shiaAdhanPlayer.unlockAudio();
                updateAdhanSettings({ autoPlayFajr: adhanSettings.autoPlayFajr === false });
              }}
              className={`p-2.5 rounded-2xl text-center transition-all cursor-pointer ${
                adhanSettings.autoPlayFajr !== false
                  ? 'glass-slab-tab-active font-bold'
                  : 'glass-slab-tab text-slate-500 dark:text-slate-400'
              }`}
            >
              <div className="text-xs font-bold flex items-center justify-center gap-1">
                {adhanSettings.autoPlayFajr !== false ? <Bell size={12} className="text-emerald-500 dark:text-emerald-300" /> : <BellOff size={12} />}
                <span>Fajr</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{timings?.fajr ? format12Hour(timings.fajr) : '--:--'}</p>
            </button>

            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                shiaAdhanPlayer.unlockAudio();
                updateAdhanSettings({ autoPlayDhuhr: adhanSettings.autoPlayDhuhr === false });
              }}
              className={`p-2.5 rounded-2xl text-center transition-all cursor-pointer ${
                adhanSettings.autoPlayDhuhr !== false
                  ? 'glass-slab-tab-active font-bold'
                  : 'glass-slab-tab text-slate-500 dark:text-slate-400'
              }`}
            >
              <div className="text-xs font-bold flex items-center justify-center gap-1">
                {adhanSettings.autoPlayDhuhr !== false ? <Bell size={12} className="text-emerald-500 dark:text-emerald-300" /> : <BellOff size={12} />}
                <span>Dhuhr</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{timings?.dhuhr ? format12Hour(timings.dhuhr) : '--:--'}</p>
            </button>

            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                shiaAdhanPlayer.unlockAudio();
                updateAdhanSettings({ autoPlayMaghrib: adhanSettings.autoPlayMaghrib === false });
              }}
              className={`p-2.5 rounded-2xl text-center transition-all cursor-pointer ${
                adhanSettings.autoPlayMaghrib !== false
                  ? 'glass-slab-tab-active font-bold'
                  : 'glass-slab-tab text-slate-500 dark:text-slate-400'
              }`}
            >
              <div className="text-xs font-bold flex items-center justify-center gap-1">
                {adhanSettings.autoPlayMaghrib !== false ? <Bell size={12} className="text-emerald-500 dark:text-emerald-300" /> : <BellOff size={12} />}
                <span>Maghrib</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{timings?.maghrib ? format12Hour(timings.maghrib) : '--:--'}</p>
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

          {/* Adhan Voice / Recitation Selector */}
          <div className="pt-3 border-t border-white/20 dark:border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  {isUrdu ? 'اذان کی آواز • انتخاب' : 'Adhan Voice • Recitation'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isUrdu 
                    ? 'مکمل اذان یا 4 تکبیروں پر مشتمل مختصر اذان'
                    : 'Choose full 5-minute call or 4-Takbir short alert'}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg liquid-glass border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                {adhanSettings.adhanVoice === 'short' 
                  ? (isUrdu ? 'مختصر اذان' : 'Short (72s)') 
                  : (isUrdu ? 'مکمل اذان' : 'Full (5m)')}
              </span>
            </div>

            {/* Segmented Voice Selector */}
            <div className="grid grid-cols-2 gap-2">
              {/* Full Adhan Option */}
              <div
                onClick={() => {
                  hapticImpact(ImpactStyle.Light);
                  shiaAdhanPlayer.unlockAudio();
                  updateAdhanSettings({ adhanVoice: 'full' });
                  shiaAdhanPlayer.setAdhanVoice('full');
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  (adhanSettings.adhanVoice || 'full') === 'full'
                    ? 'liquid-glass border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-950 dark:text-emerald-100 shadow-xs font-semibold'
                    : 'liquid-glass border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-emerald-400/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">
                      {isUrdu ? 'مکمل اذان' : 'Adhan (Full)'}
                    </span>
                    {(adhanSettings.adhanVoice || 'full') === 'full' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
                    {isUrdu ? 'مکمل تلاوت • سید ہانی الموسوی (~5 منٹ)' : 'Complete Shia recitation (~5 min)'}
                  </span>
                </div>

                <div className="pt-2 mt-2 border-t border-white/20 dark:border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-mono">
                    ~5:00 min
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      hapticImpact(ImpactStyle.Light);
                      shiaAdhanPlayer.unlockAudio();
                      shiaAdhanPlayer.playPreview('full');
                    }}
                    className="px-2 py-1 rounded-lg liquid-glass border border-white/30 dark:border-white/10 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-white/40 flex items-center gap-1 cursor-pointer"
                    title="Audition Full Adhan"
                  >
                    {playerStatus.isPlaying && (playerStatus.adhanVoice === 'full' || playerStatus.currentPrayerName?.includes('Full')) ? (
                      <>
                        <Pause size={10} className="fill-current" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Play size={10} className="fill-current" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Short Adhan Option */}
              <div
                onClick={() => {
                  hapticImpact(ImpactStyle.Light);
                  shiaAdhanPlayer.unlockAudio();
                  updateAdhanSettings({ adhanVoice: 'short' });
                  shiaAdhanPlayer.setAdhanVoice('short');
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  adhanSettings.adhanVoice === 'short'
                    ? 'liquid-glass border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-950 dark:text-emerald-100 shadow-xs font-semibold'
                    : 'liquid-glass border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-emerald-400/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">
                      {isUrdu ? 'مختصر اذان' : 'Adhan (Short)'}
                    </span>
                    {adhanSettings.adhanVoice === 'short' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
                    {isUrdu ? 'صرف 4 تکبیریں • نرم اختتام (~72 سیکنڈ)' : 'First 4 Takbirs with gentle fade-out (~72s)'}
                  </span>
                </div>

                <div className="pt-2 mt-2 border-t border-white/20 dark:border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-mono">
                    ~1:12 min
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      hapticImpact(ImpactStyle.Light);
                      shiaAdhanPlayer.unlockAudio();
                      shiaAdhanPlayer.playPreview('short');
                    }}
                    className="px-2 py-1 rounded-lg liquid-glass border border-white/30 dark:border-white/10 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-white/40 flex items-center gap-1 cursor-pointer"
                    title="Audition Short Adhan"
                  >
                    {playerStatus.isPlaying && (playerStatus.adhanVoice === 'short' || playerStatus.currentPrayerName?.includes('Short')) ? (
                      <>
                        <Pause size={10} className="fill-current" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Play size={10} className="fill-current" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
