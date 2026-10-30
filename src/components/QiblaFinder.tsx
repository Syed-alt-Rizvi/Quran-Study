import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Compass, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Crosshair, 
  Search, 
  Check, 
  X, 
  Loader2,
  ShieldCheck,
  Sliders
} from 'lucide-react';
import { useSettingsStore } from '../store';
import { 
  calculateGeodesicQibla, 
  estimateMagneticDeclination, 
  calculateTiltCompensatedHeading,
  QiblaResult 
} from '../utils/qiblaApi';
import { POPULAR_CITIES, CityData, searchCitiesOnline, reverseGeocodeLocation } from '../data/shiaCities';
import { hapticImpact } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';
import { registerModal } from '../utils/modalBackHandler';

interface QiblaFinderProps {
  onBack?: () => void;
}

const QUICK_SHRINES: CityData[] = [
  { name: 'Karbala', country: 'Iraq', latitude: 32.6160, longitude: 44.0249, timezone: 'Asia/Baghdad', isHolySite: true },
  { name: 'Najaf', country: 'Iraq', latitude: 32.0000, longitude: 44.3333, timezone: 'Asia/Baghdad', isHolySite: true },
  { name: 'Mashhad', country: 'Iran', latitude: 36.2972, longitude: 59.6067, timezone: 'Asia/Tehran', isHolySite: true },
  { name: 'Qum', country: 'Iran', latitude: 34.6416, longitude: 50.8746, timezone: 'Asia/Tehran', isHolySite: true },
  { name: 'Medina', country: 'Saudi Arabia', latitude: 24.5247, longitude: 39.5692, timezone: 'Asia/Riyadh', isHolySite: true },
  { name: 'Mecca', country: 'Saudi Arabia', latitude: 21.4225, longitude: 39.8262, timezone: 'Asia/Riyadh', isHolySite: true },
  { name: 'Kufa', country: 'Iraq', latitude: 32.0294, longitude: 44.4022, timezone: 'Asia/Baghdad', isHolySite: true },
  { name: 'Samarra', country: 'Iraq', latitude: 34.1983, longitude: 43.8742, timezone: 'Asia/Baghdad', isHolySite: true },
];

export default function QiblaFinder({ onBack }: QiblaFinderProps) {
  const { userLocation, setUserLocation, appLanguage } = useSettingsStore();
  const isUrdu = appLanguage === 'ur';

  // 1. Pure Local Spherical Geodesy (Pillars App Great-Circle Azimuth to Mecca)
  const qiblaData: QiblaResult = useMemo(() => {
    const geo = calculateGeodesicQibla(userLocation.latitude, userLocation.longitude);
    return {
      direction: geo.direction,
      compassBearing: geo.compassBearing,
      distanceKm: geo.distanceKm,
      location: { latitude: userLocation.latitude, longitude: userLocation.longitude },
      source: 'geodesic'
    };
  }, [userLocation.latitude, userLocation.longitude]);

  // Local magnetic declination for true north alignment
  const magneticDeclination = useMemo(() => {
    return estimateMagneticDeclination(userLocation.latitude, userLocation.longitude);
  }, [userLocation.latitude, userLocation.longitude]);

  // 2. High-Performance Decoupled Hardware Sensor & Direct GPU Transform State
  // Telemetry state is only updated on whole degree changes to prevent 60 FPS React re-render lag
  const [normalizedFacing, setNormalizedFacing] = useState<number>(0);
  const [isAligned, setIsAligned] = useState<boolean>(false);
  const [hasCompassSensor, setHasCompassSensor] = useState<boolean>(false);
  const [needsSensorPermission, setNeedsSensorPermission] = useState<boolean>(false);
  const [sensorPermissionGranted, setSensorPermissionGranted] = useState<boolean>(false);
  const [manualHeading, setManualHeading] = useState<number | null>(null);

  // Direct DOM references for 60/120 FPS GPU transforms (Zero React Render Overhead)
  const dialRef = useRef<HTMLDivElement>(null);
  const targetHeadingRef = useRef<number>(0);
  const currentAngleRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const hasAbsoluteRef = useRef<boolean>(false);
  const lastFacingRef = useRef<number>(0);
  const prevAlignedRef = useRef<boolean>(false);

  // 3. Search Bar State
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityData[]>(() => POPULAR_CITIES.slice(0, 10));
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [locatingGPS, setLocatingGPS] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Register modal back handler when search is active
  useEffect(() => {
    if (isSearching) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
      return registerModal(() => setIsSearching(false));
    }
  }, [isSearching]);

  // Check iOS 13+ sensor permission requirement
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof (window as any).DeviceOrientationEvent !== 'undefined' &&
      typeof (window as any).DeviceOrientationEvent.requestPermission === 'function'
    ) {
      setNeedsSensorPermission(true);
    }
  }, []);

  // Request explicit iOS motion permission
  const requestCompassPermission = async () => {
    hapticImpact(ImpactStyle.Light);
    if (
      typeof window !== 'undefined' &&
      typeof (window as any).DeviceOrientationEvent?.requestPermission === 'function'
    ) {
      try {
        const response = await (window as any).DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          setSensorPermissionGranted(true);
          setNeedsSensorPermission(false);
          setHasCompassSensor(true);
        }
      } catch (err) {
        console.warn('Compass sensor permission error:', err);
      }
    }
  };

  // 4. Ultra-Smooth Lag-Free Render Loop (Direct GPU Transform, Zero-Jitter Dynamic Damping)
  const startRafLoop = useCallback(() => {
    if (rafIdRef.current !== null) return;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const target = targetHeadingRef.current;
      const current = currentAngleRef.current;

      // Shortest angular delta (-180° to +180°)
      const diff = (((target - (current % 360)) + 540) % 360) - 180;
      const absDiff = Math.abs(diff);

      // Deadband noise filter: eliminates micro sensor tremble when phone is still
      if (absDiff > 0.15) {
        // Fast dynamic responsiveness: instantly tracks rapid movement (> 4°), smoothly eases when settling
        const speed = absDiff > 4 ? 26 : 18;
        const factor = Math.min(1, dt * speed);
        currentAngleRef.current = current + diff * factor;

        // Direct DOM update on GPU compositor thread (Zero React re-render lag)
        if (dialRef.current) {
          dialRef.current.style.transform = `rotate3d(0, 0, 1, ${-currentAngleRef.current}deg)`;
        }

        // Throttled degree & alignment updates to React state
        const deg = Math.round(((currentAngleRef.current % 360) + 360) % 360);
        if (deg !== lastFacingRef.current) {
          lastFacingRef.current = deg;
          setNormalizedFacing(deg);

          // Calculate alignment with Mecca
          let aDiff = (qiblaData.direction - deg) % 360;
          if (aDiff > 180) aDiff -= 360;
          if (aDiff < -180) aDiff += 360;
          const aligned = Math.abs(aDiff) <= 4;

          setIsAligned(aligned);

          if (aligned && !prevAlignedRef.current) {
            hapticImpact(ImpactStyle.Medium);
          }
          prevAlignedRef.current = aligned;
        }
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
  }, [qiblaData.direction]);

  const stopRafLoop = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  // 5. Hardware Sensor Pipeline: Chrome Absolute Priority, W3C Tilt Compensation, Screen Posture
  useEffect(() => {
    startRafLoop();

    const getScreenAngle = () => {
      if (typeof window === 'undefined') return 0;
      if (window.screen?.orientation?.angle !== undefined) {
        return window.screen.orientation.angle;
      }
      if (typeof window.orientation === 'number') {
        return window.orientation;
      }
      return 0;
    };

    // 1. Android Absolute Orientation Listener (Google Chrome on Android)
    const handleAbsoluteOrientation = (e: any) => {
      if (e.alpha === null || e.alpha === undefined) return;
      hasAbsoluteRef.current = true;
      setHasCompassSensor(true);

      // W3C Tilt-compensated heading relative to True North
      const tiltHeading = calculateTiltCompensatedHeading(e.alpha, e.beta, e.gamma);
      const screenAngle = getScreenAngle();
      targetHeadingRef.current = (tiltHeading + screenAngle + 360) % 360;
    };

    // 2. Standard / iOS DeviceOrientation Listener
    const handleDeviceOrientation = (e: any) => {
      // iOS Safari provides webkitCompassHeading directly relative to True/Magnetic North, pre-compensated
      if (e.webkitCompassHeading !== undefined && e.webkitCompassHeading !== null) {
        setHasCompassSensor(true);
        const screenAngle = getScreenAngle();
        targetHeadingRef.current = (e.webkitCompassHeading + screenAngle + 360) % 360;
        return;
      }

      // If Android absolute listener is active, ignore relative orientation events
      if (hasAbsoluteRef.current) {
        return;
      }

      // If standard event reports absolute: true
      if (e.absolute === true && e.alpha !== null) {
        setHasCompassSensor(true);
        const tiltHeading = calculateTiltCompensatedHeading(e.alpha, e.beta, e.gamma);
        const screenAngle = getScreenAngle();
        targetHeadingRef.current = (tiltHeading + screenAngle + 360) % 360;
        return;
      }

      // Fallback: Apply magnetic declination offset
      if (e.alpha !== null && !hasAbsoluteRef.current) {
        setHasCompassSensor(true);
        const tiltHeading = calculateTiltCompensatedHeading(e.alpha, e.beta, e.gamma);
        const screenAngle = getScreenAngle();
        targetHeadingRef.current = (tiltHeading + magneticDeclination + screenAngle + 360) % 360;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('deviceorientationabsolute' as any, handleAbsoluteOrientation, { passive: true });
      window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });
    }

    // Lifecycle Resource Throttling: suspend render loop when app is in background
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopRafLoop();
      } else {
        startRafLoop();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopRafLoop();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientationabsolute' as any, handleAbsoluteOrientation);
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      }
    };
  }, [magneticDeclination, startRafLoop, stopRafLoop]);

  // Angular difference between device facing direction and Qibla for turn instructions
  const angleDiff = useMemo(() => {
    let diff = (qiblaData.direction - normalizedFacing) % 360;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff -= 360;
    return diff;
  }, [qiblaData.direction, normalizedFacing]);

  // Real-time debounced location search for any village, town, or city
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchResults(POPULAR_CITIES.slice(0, 10));
      setIsSearchingOnline(false);
      return;
    }

    const localMatches = POPULAR_CITIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    );
    setSearchResults(localMatches.slice(0, 8));

    if (q.length >= 2) {
      setIsSearchingOnline(true);
      const timer = setTimeout(async () => {
        const results = await searchCitiesOnline(q);
        setSearchResults(results);
        setIsSearchingOnline(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsSearchingOnline(false);
    }
  }, [searchQuery]);

  // High-precision GPS Detect with reverse-geocoding
  const handleDetectGPS = () => {
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

  const handleManualSliderChange = (deg: number) => {
    setManualHeading(deg);
    targetHeadingRef.current = deg;
  };

  return (
    <div className="space-y-3.5 max-w-xl mx-auto px-1 sm:px-2 pb-6 min-w-0" dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* 1. TOP SEARCH BAR (For every village, town, or city on Earth) */}
      <div className="liquid-glass-card rounded-2xl border border-white/60 dark:border-white/12 p-2.5 sm:p-3 shadow-md transition-all">
        {!isSearching ? (
          <div className="flex items-center justify-between gap-2.5">
            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                setIsSearching(true);
              }}
              className="flex items-center gap-2.5 flex-1 text-left min-w-0 cursor-pointer group py-0.5"
              title="Search every village, town, or city on Earth"
            >
              <div className="w-8 h-8 rounded-xl liquid-glass flex items-center justify-center border border-emerald-400/40 text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Search size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {userLocation.name}{userLocation.country ? `, ${userLocation.country}` : ''}
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold underline underline-offset-2">
                    {isUrdu ? 'شہر / بستی بدلیں' : 'Change Location'}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  Lat: {userLocation.latitude.toFixed(4)}° • Lng: {userLocation.longitude.toFixed(4)}°
                </div>
              </div>
            </button>

            <button
              onClick={handleDetectGPS}
              disabled={locatingGPS}
              className="px-3 py-1.5 rounded-xl liquid-glass border border-emerald-400/40 text-slate-700 dark:text-slate-200 hover:text-emerald-600 flex items-center gap-1.5 text-xs font-semibold cursor-pointer shrink-0 shadow-2xs transition-colors"
              title="Detect Current GPS Location"
            >
              {locatingGPS ? <Loader2 size={14} className="animate-spin text-emerald-600" /> : <Navigation size={14} className="text-emerald-500" />}
              <span className="hidden xs:inline">{isUrdu ? 'جی پی ایس' : 'GPS'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Input with Instant Live Suggestions */}
            <div className="relative flex items-center">
              <Search size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isUrdu ? 'کسی بھی شہر، بستی یا گاؤں کا نام...' : 'Search every village, town, or city...'}
                className="w-full pl-9 pr-16 py-2.5 text-sm rounded-xl liquid-glass border border-emerald-400/60 dark:border-emerald-400/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-inner"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  onClick={() => setIsSearching(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-1.5 py-1 font-semibold cursor-pointer"
                >
                  {isUrdu ? 'بند کریں' : 'Cancel'}
                </button>
              </div>
            </div>

            {/* Quick Action Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <button
                onClick={handleDetectGPS}
                disabled={locatingGPS}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold flex items-center gap-1 shrink-0 shadow-xs cursor-pointer hover:bg-emerald-500 transition-colors"
              >
                {locatingGPS ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
                <span>{isUrdu ? 'موجودہ جی پی ایس' : 'Current GPS'}</span>
              </button>

              {QUICK_SHRINES.map((shrine) => (
                <button
                  key={`shrine-${shrine.name}`}
                  onClick={() => handleSelectCity(shrine)}
                  className="px-2 py-1 rounded-lg liquid-glass border border-white/40 dark:border-white/10 hover:border-emerald-400/50 text-slate-700 dark:text-slate-200 font-medium shrink-0 cursor-pointer transition-colors"
                >
                  🕌 {shrine.name}
                </button>
              ))}
            </div>

            {/* Global Search Results List */}
            <div className="max-h-60 overflow-y-auto divide-y divide-white/20 dark:divide-white/10 text-xs rounded-xl liquid-glass border border-white/30 dark:border-white/10">
              {isSearchingOnline && (
                <div className="py-2.5 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin text-emerald-600" />
                  <span>{isUrdu ? 'تلاش جاری ہے...' : 'Searching places globally...'}</span>
                </div>
              )}

              {searchResults.map((city) => {
                const itemQibla = calculateGeodesicQibla(city.latitude, city.longitude);
                const isSelected = userLocation.name === city.name && Math.abs(userLocation.latitude - city.latitude) < 0.01;

                return (
                  <button
                    key={`${city.name}-${city.country}-${city.latitude}-${city.longitude}`}
                    onClick={() => handleSelectCity(city)}
                    className={`w-full text-left p-2.5 flex items-start justify-between gap-2 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                      isSelected ? 'bg-emerald-500/15 dark:bg-emerald-500/20 font-bold' : ''
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                          {city.name}
                        </span>
                        {city.state && (
                          <span className="text-slate-500 dark:text-slate-400 font-normal">
                            {city.state},
                          </span>
                        )}
                        <span className="text-slate-500 dark:text-slate-400 font-normal">
                          {city.country}
                        </span>
                        {city.isHolySite && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-semibold border border-amber-500/30">
                            Sacred Shrine
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5 tabular-nums">
                        Lat: {city.latitude.toFixed(4)}° • Lng: {city.longitude.toFixed(4)}°
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end">
                      <div className="px-2 py-0.5 rounded-lg bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1 border border-emerald-500/30">
                        <Compass size={11} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{itemQibla.direction}° {itemQibla.compassBearing}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {itemQibla.distanceKm.toLocaleString()} km
                      </span>
                    </div>

                    {isSelected && (
                      <Check size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 self-center ml-1" />
                    )}
                  </button>
                );
              })}

              {!isSearchingOnline && searchResults.length === 0 && searchQuery && (
                <div className="py-5 text-center text-xs text-slate-400">
                  No places found matching &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. THE 3D COMPASS (Inscribed with "Ashhadu Anna Aliyan Waliyullah") */}
      <div className="relative p-5 sm:p-6 rounded-3xl liquid-glass-card border border-white/60 dark:border-white/12 shadow-xl flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Alignment Glow Aura */}
        <div 
          className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
            isAligned ? 'bg-radial from-emerald-500/35 via-emerald-500/15 to-transparent opacity-100' : 'opacity-0'
          }`} 
        />

        {/* Alignment Status Header Pill */}
        <div className="mb-2 z-10">
          {isAligned ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/25 text-emerald-800 dark:text-emerald-200 border border-emerald-400/80 shadow-[0_0_24px_rgba(16,185,129,0.55)] animate-pulse">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-300" />
              <span className="text-xs sm:text-sm font-bold tracking-tight">
                {isUrdu ? 'قبلۂ شریف کی سمت درست ہے! (کعبہ رخ)' : 'Directly Facing the Holy Kaaba!'}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full liquid-glass text-slate-700 dark:text-slate-300 border border-white/40 dark:border-white/10 text-xs font-semibold shadow-xs">
              <Crosshair size={13} className="text-emerald-500" />
              <span>
                {angleDiff > 0
                  ? isUrdu
                    ? `دائیں جانب ${Math.abs(Math.round(angleDiff))}° موڑیں`
                    : `Turn ${Math.abs(Math.round(angleDiff))}° Right`
                  : isUrdu
                  ? `بائیں جانب ${Math.abs(Math.round(angleDiff))}° موڑیں`
                  : `Turn ${Math.abs(Math.round(angleDiff))}° Left`}
              </span>
            </div>
          )}
        </div>

        {/* 3D COMPASS HOUSING & DIAL (The Pillars App Tech) */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 select-none flex items-center justify-center my-2">
          {/* Top Gold Alignment Needle (Pointing Forward at 12 O'clock) */}
          <div 
            className={`compass-top-needle ${isAligned ? 'compass-top-needle-aligned' : ''}`}
            title="Point your phone forward until the Kaaba aligns with this needle"
          />

          {/* Outer 3D Beveled Ring Housing */}
          <div className={`w-full h-full compass-3d-housing ${isAligned ? 'compass-3d-housing-aligned' : ''}`}>
            {/* Deep Sunken Dial Plate */}
            <div className="compass-3d-dial flex items-center justify-center">
              
              {/* Rotating Compass Ring (Direct 60/120 FPS GPU Transform) */}
              <div 
                ref={dialRef}
                className="absolute inset-0"
                style={{ willChange: 'transform' }}
              >
                {/* 360 Degree Ticks */}
                {[...Array(36)].map((_, i) => {
                  const deg = i * 10;
                  const isMajor = deg % 30 === 0;
                  const isCardinal = deg % 90 === 0;
                  return (
                    <div
                      key={`deg-tick-${deg}`}
                      className="absolute inset-0 flex justify-center pointer-events-none"
                      style={{ transform: `rotate(${deg}deg)` }}
                    >
                      <div 
                        className={`w-0.5 rounded-full ${
                          isCardinal
                            ? 'h-3.5 bg-amber-400/90 shadow-[0_0_6px_rgba(251,191,36,0.6)]' 
                            : isMajor 
                            ? 'h-2.5 bg-slate-300/80 dark:bg-slate-400/80' 
                            : 'h-1.5 bg-slate-400/40 dark:bg-slate-500/40'
                        }`} 
                      />
                    </div>
                  );
                })}

                {/* Cardinal Markers: North (Ruby Red), South, East, West */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <span className="text-[13px] font-black text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">N</span>
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <span className="text-[11px] font-bold text-slate-400">S</span>
                </div>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex flex-col items-center">
                  <span className="text-[11px] font-bold text-slate-400">E</span>
                </div>
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex flex-col items-center">
                  <span className="text-[11px] font-bold text-slate-400">W</span>
                </div>

                {/* Qibla Indicator Marker Pin at exact Great-Circle azimuth angle on the rotating dial */}
                <div
                  className="absolute inset-0 flex justify-center pointer-events-none"
                  style={{ transform: `rotate(${qiblaData.direction}deg)` }}
                >
                  <div className="flex flex-col items-center -mt-2">
                    {/* Glowing Kaaba Crest */}
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 via-teal-600 to-emerald-400 text-white flex items-center justify-center font-bold text-xs border-2 border-amber-300 ring-2 ring-emerald-400/60 shadow-lg ${
                      isAligned ? 'animate-bounce shadow-[0_0_24px_rgba(16,185,129,1)] scale-110' : 'shadow-[0_0_14px_rgba(16,185,129,0.7)]'
                    }`}>
                      🕋
                    </div>
                    {/* Direction Ray Line */}
                    <div className="w-1.5 h-16 bg-gradient-to-b from-amber-400 via-emerald-400 to-transparent mt-0.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  </div>
                </div>
              </div>

              {/* SACRED ARABIC INSCRIPTION IN THE 3D CENTER: Pure Arabic Calligraphy */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-2 pointer-events-none select-none max-w-[210px]">
                <h3 
                  className={`font-arabic text-base sm:text-lg font-black leading-snug transition-all duration-300 ${
                    isAligned 
                      ? 'text-amber-200 drop-shadow-[0_2px_16px_rgba(251,191,36,0.9)] scale-105' 
                      : 'text-amber-300/90 dark:text-amber-200/90 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]'
                  }`}
                  style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
                >
                  أَشْهَدُ أَنَّ عَلِيّاً وَلِيُّ اللَّهِ
                </h3>
                <span className="text-[10px] text-emerald-400/90 font-mono font-bold mt-1 tracking-tight">
                  {userLocation.name}
                </span>
              </div>

              {/* 3D Center Glass Bevel Reflection */}
              <div className="compass-glass-reflection" />

              {/* Fixed 3D Center Hub */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-slate-950 to-slate-800 text-white flex items-center justify-center shadow-lg border-2 border-emerald-400 ring-2 ring-black/40">
                  <div className={`w-2 h-2 rounded-full ${isAligned ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 3. SWIFT TELEMETRY DISPLAY */}
        <div className="mt-3 grid grid-cols-3 gap-2 w-full max-w-sm">
          <div className="glass-slab-tab p-2 rounded-2xl flex flex-col items-center justify-center shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isUrdu ? 'سمتِ قبلہ' : 'Qibla'}
            </span>
            <span className="text-base font-mono font-black text-emerald-700 dark:text-emerald-300 mt-0.5 tabular-nums">
              {qiblaData.direction}° <span className="text-xs font-sans">{qiblaData.compassBearing}</span>
            </span>
          </div>

          <div className="glass-slab-tab p-2 rounded-2xl flex flex-col items-center justify-center shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isUrdu ? 'موجودہ رخ' : 'Facing'}
            </span>
            <span className="text-base font-mono font-black text-slate-800 dark:text-slate-200 mt-0.5 tabular-nums">
              {normalizedFacing}°
            </span>
          </div>

          <div className="glass-slab-tab p-2 rounded-2xl flex flex-col items-center justify-center shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isUrdu ? 'فاصلہ' : 'Distance'}
            </span>
            <span className="text-base font-mono font-black text-slate-800 dark:text-slate-200 mt-0.5 tabular-nums">
              {qiblaData.distanceKm.toLocaleString()} <span className="text-[10px] font-sans font-medium text-slate-500">km</span>
            </span>
          </div>
        </div>

        {/* Required Permissions Trigger (iOS DeviceOrientation / Sensors) */}
        {needsSensorPermission && !sensorPermissionGranted && (
          <div className="mt-3.5 w-full max-w-sm">
            <button
              onClick={requestCompassPermission}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
            >
              <ShieldCheck size={16} />
              <span>{isUrdu ? 'فون کمپاس سینسر فعال کریں' : 'Enable Live Compass Motion Sensor'}</span>
            </button>
          </div>
        )}

        {/* Desktop / Laptop Fallback Slider when physical magnetometer is absent */}
        {!hasCompassSensor && (
          <div className="w-full max-w-sm mt-3 p-2.5 rounded-xl liquid-glass border border-white/40 dark:border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Sliders size={13} className="text-emerald-500" />
                <span>{isUrdu ? 'رخ گھمائیں (ٹیسٹ)' : 'Rotate Heading (Desktop Test)'}</span>
              </span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{normalizedFacing}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="359"
              value={normalizedFacing}
              onChange={(e) => handleManualSliderChange(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* 4. CALIBRATION NOTICE (Pillars App Style - Clean, Calm, Non-Messy) */}
      <div className="p-3 sm:p-3.5 rounded-2xl liquid-glass border border-white/50 dark:border-white/10 flex items-center gap-3 text-left">
        <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 font-bold text-lg select-none">
          ∞
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {isUrdu ? 'بہترین درستگی کے لیے کیلیبریشن' : 'Calibrate Your Compass'}
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
            {isUrdu 
              ? 'فون کو مقناطیسی اشیاء یا کور سے دور رکھیں۔ درستگی کے لیے فون کو 8 (انفینٹی) کی شکل میں چند بار گھمائیں۔'
              : 'Hold your phone flat away from magnetic objects. If the compass drifts, move your phone in a figure-8 motion a few times to calibrate.'}
          </p>
        </div>
      </div>
    </div>
  );
}
