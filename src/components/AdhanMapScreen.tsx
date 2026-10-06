import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  MapPin, Search, Navigation, Volume2, Play, Pause, 
  ArrowLeft, X, Loader2, Check, Volume1
} from 'lucide-react';
import { 
  getShiaPrayerTimes, ShiaPrayerTimings, getNextShiaPrayer, format12Hour, 
  SHIA_PRAYER_NAMES, ShiaPrayerKey, calculateQibla
} from '../utils/shiaPrayerTimes';
import { shiaAdhanPlayer } from '../utils/shiaAdhanPlayer';
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
  const [audioUnlocked, setAudioUnlocked] = useState(shiaAdhanPlayer.isAudioUnlocked());

  // Subscribe to adhan player events
  useEffect(() => {
    const unsub = shiaAdhanPlayer.subscribe(() => {
      setPlayerStatus(shiaAdhanPlayer.getStatus());
      setAudioUnlocked(shiaAdhanPlayer.isAudioUnlocked());
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

  // Load prayer times for current locked city
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
      // Default suggested shrines and global hubs
      setSearchResults(POPULAR_CITIES.slice(0, 8));
      setIsSearchingOnline(false);
      return;
    }

    const localMatches = POPULAR_CITIES.filter(
      (c) => c.name.toLowerCase().includes(query) || c.country.toLowerCase().includes(query)
    );

    setSearchResults(localMatches.slice(0, 8));

    // If local results are sparse, search online
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
    hapticImpact(ImpactStyle.Medium);
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Back to Quran"
              >
                <ArrowLeft size={19} />
              </button>
            )}
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50 leading-tight">
                Shia Adhan &amp; Prayer Times
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ja'fari Method &bull; Leva Research Institute (Qum)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60">
              Qibla {qiblaDeg}&deg;
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* City Selector: Minimalist Locked Mode vs Search Mode */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs">
          {!isSearching ? (
            /* Locked In State */
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/40">
                  <MapPin size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Selected City:</span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <Check size={13} /> Locked in
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                    {userLocation.name}
                    {userLocation.country ? `, ${userLocation.country}` : ''}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {userLocation.latitude.toFixed(2)}&deg; N, {userLocation.longitude.toFixed(2)}&deg; E
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleUseGPS}
                  disabled={locatingGPS}
                  className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Detect GPS Location"
                >
                  {locatingGPS ? <Loader2 size={18} className="animate-spin text-emerald-600" /> : <Navigation size={18} />}
                </button>
                <button
                  onClick={() => {
                    hapticImpact(ImpactStyle.Light);
                    setIsSearching(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Search size={13} />
                  <span>Change</span>
                </button>
              </div>
            </div>
          ) : (
            /* Search Mode: Interactive search bar that locks in upon choosing */
            <div className="space-y-3">
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-3 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter city name (e.g. Karbala, Najaf, London, Toronto, Karachi)..."
                  className="w-full pl-9 pr-16 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => setIsSearching(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-1.5 py-1 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Suggestions / Search Results Dropdown */}
              <div className="space-y-1 max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 border-t border-slate-100 dark:border-slate-800 pt-2">
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
                    className="w-full text-left py-2 px-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          {city.name}
                        </span>
                        {city.isHolySite && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            Holy Shrine
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{city.country}</span>
                    </div>

                    <span className="text-xs text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                      Lock in &rarr;
                    </span>
                  </button>
                ))}

                {!isSearchingOnline && searchResults.length === 0 && searchQuery && (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    No matching city found. Please check spelling or use GPS detection.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Hero Upcoming Prayer Card (Serene, Elegant, Minimalist) */}
        {nextPrayer && (
          <div className="rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white p-5 shadow-sm border border-emerald-800/60 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
                    {nextPrayer.isAdhanTime ? 'Next Shia Adhan' : 'Next Prayer'}
                  </span>
                  <span className="text-xs font-arabic text-emerald-200/90" dir="rtl">
                    {nextPrayer.nameAr}
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mt-1">
                  <h2 className="text-3xl font-extrabold tracking-tight">
                    {nextPrayer.nameEn}
                  </h2>
                  <span className="text-2xl font-bold text-emerald-200">
                    {nextPrayer.time12}
                  </span>
                </div>

                <p className="text-xs text-emerald-200/80 mt-1">
                  Announced in {nextPrayer.formattedCountdown}
                </p>
              </div>

              {/* Clean Single Action Button */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
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
                  className="px-4 py-2.5 rounded-xl bg-white text-emerald-950 font-bold text-xs hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-sm active:scale-95"
                >
                  {playerStatus.isPlaying ? (
                    <>
                      <Pause size={15} className="fill-emerald-950" />
                      <span>Stop Adhan</span>
                    </>
                  ) : (
                    <>
                      <Play size={15} className="fill-emerald-950" />
                      <span>Play Adhan</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* If Adhan audio is playing: show time elapsed and sacred phrase */}
            {playerStatus.isPlaying && (
              <div className="mt-4 pt-3 border-t border-emerald-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-200/80 font-mono">
                  <span>Playing: {formatAudioTime(playerStatus.currentTime)}</span>
                  <span>{playerStatus.duration ? formatAudioTime(playerStatus.duration) : '4:53'}</span>
                </div>

                {playerStatus.duration > 0 && (
                  <div 
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const ratio = clickX / rect.width;
                      shiaAdhanPlayer.seek(ratio * playerStatus.duration);
                    }}
                    className="w-full h-1.5 bg-emerald-950 rounded-full overflow-hidden cursor-pointer"
                  >
                    <div 
                      className="h-full bg-emerald-400 transition-all"
                      style={{ width: `${(playerStatus.currentTime / playerStatus.duration) * 100}%` }}
                    />
                  </div>
                )}

                <p className="font-arabic text-sm text-center text-emerald-200/90 pt-1" dir="rtl">
                  حَيَّ عَلَى خَيْرِ الْعَمَلِ • أَشْهَدُ أَنَّ عَلِيًّا وَلِيُّ اللَّهِ
                </p>
              </div>
            )}
          </div>
        )}

        {/* Today's Prayer Schedule: Clean, Minimalist Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Today's Prayer Schedule
              </h3>
              <p className="text-[11px] text-slate-400">
                {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {loadingTimings && (
              <span className="text-xs text-emerald-600 flex items-center gap-1">
                <Loader2 size={13} className="animate-spin" /> Updating
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {timings && (['fajr', 'sunrise', 'dhuhr', 'asr', 'sunset', 'maghrib', 'isha', 'midnight'] as ShiaPrayerKey[]).map((key) => {
              const time24 = timings[key];
              const time12 = format12Hour(time24);
              const info = SHIA_PRAYER_NAMES[key];
              const isNext = nextPrayer?.key === key;
              const isAdhan = info.isAdhan;

              return (
                <div
                  key={key}
                  className={`px-4 py-3 flex items-center justify-between transition-colors ${
                    isNext
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30'
                      : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${isNext ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'}`}>
                          {info.en}
                        </span>
                        {isAdhan && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            &bull; Adhan
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-arabic" dir="rtl">
                        {info.ar}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-sm font-bold ${isNext ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-900 dark:text-slate-100'}`}>
                      {time12}
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {time24}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Automatic Thrice-Daily Adhan Playback Guarantee & Sound Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                <Volume2 size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Automatic Daily Adhan (3 Times)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Plays automatically at the exact moment of Fajr, Dhuhr, and Maghrib
                </p>
              </div>
            </div>

            {/* Quick Test Audio Button */}
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
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              {playerStatus.isPlaying ? 'Stop' : 'Test Sound'}
            </button>
          </div>

          {/* Autoplay Toggles for the 3 Adhans */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                shiaAdhanPlayer.unlockAudio();
                updateAdhanSettings({ autoPlayFajr: adhanSettings.autoPlayFajr === false ? true : false });
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                adhanSettings.autoPlayFajr !== false
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">1. Fajr</span>
                {adhanSettings.autoPlayFajr !== false ? <Check size={13} className="text-emerald-600" /> : null}
              </div>
              <p className="text-[10px] mt-0.5 opacity-80">{timings?.fajr ? format12Hour(timings.fajr) : 'Dawn'}</p>
            </button>

            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                shiaAdhanPlayer.unlockAudio();
                updateAdhanSettings({ autoPlayDhuhr: adhanSettings.autoPlayDhuhr === false ? true : false });
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                adhanSettings.autoPlayDhuhr !== false
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">2. Dhuhr</span>
                {adhanSettings.autoPlayDhuhr !== false ? <Check size={13} className="text-emerald-600" /> : null}
              </div>
              <p className="text-[10px] mt-0.5 opacity-80">{timings?.dhuhr ? format12Hour(timings.dhuhr) : 'Noon'}</p>
            </button>

            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                shiaAdhanPlayer.unlockAudio();
                updateAdhanSettings({ autoPlayMaghrib: adhanSettings.autoPlayMaghrib === false ? true : false });
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                adhanSettings.autoPlayMaghrib !== false
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">3. Maghrib</span>
                {adhanSettings.autoPlayMaghrib !== false ? <Check size={13} className="text-emerald-600" /> : null}
              </div>
              <p className="text-[10px] mt-0.5 opacity-80">{timings?.maghrib ? format12Hour(timings.maghrib) : 'Sunset'}</p>
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 pt-1">
            <Volume1 size={16} className="text-slate-400 shrink-0" />
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
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-400 shrink-0">
              {Math.round((adhanSettings.volume ?? 0.9) * 100)}%
            </span>
          </div>

          {/* Reassuring note about audio readiness */}
          {!audioUnlocked && (
            <button
              onClick={() => {
                shiaAdhanPlayer.unlockAudio();
                setAudioUnlocked(true);
              }}
              className="w-full py-2 px-3 text-center text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              Tap here to ensure background audio permission is enabled on this browser
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
