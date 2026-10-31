import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Compass, 
  Navigation, 
  CheckCircle2, 
  Crosshair, 
  Search, 
  Check, 
  X, 
  Loader2,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { useSettingsStore } from '../store';
import { 
  calculateGeodesicQibla, 
  estimateMagneticDeclination, 
  extract2DCompassHeading,
  getScreenAngle,
  degreesToUnitVector,
  unitVectorToDegrees,
  lowPassFilterVector,
  Vector2D,
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

export interface LiveGPSData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  timestamp: number;
}

export default function QiblaFinder({ onBack }: QiblaFinderProps) {
  const { 
    userLocation, 
    setUserLocation, 
    appLanguage,
    qiblaCalibrationOffset,
    setQiblaCalibrationOffset
  } = useSettingsStore();
  const isUrdu = appLanguage === 'ur';

  // Live Phone GPS Hardware Pipeline
  const [liveGPS, setLiveGPS] = useState<LiveGPSData | null>(null);
  const [isLiveGPSActive, setIsLiveGPSActive] = useState<boolean>(true);
  const [gpsPermissionState, setGpsPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'checking'>('checking');
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string | null>(null);
  const [isAcquiringGPS, setIsAcquiringGPS] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(null);

  // Active Coordinates for True Qibla Determination:
  // Uses High-Accuracy Live Satellite GPS when enabled & locked, otherwise falls back gracefully to city preset
  const activeCoordinates = useMemo(() => {
    if (isLiveGPSActive && liveGPS) {
      return {
        latitude: liveGPS.latitude,
        longitude: liveGPS.longitude,
        accuracy: liveGPS.accuracy,
        isGPS: true,
        displayName: userLocation.name || 'Live GPS Position',
        displayCountry: userLocation.country || ''
      };
    }
    return {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      accuracy: null,
      isGPS: false,
      displayName: userLocation.name,
      displayCountry: userLocation.country
    };
  }, [isLiveGPSActive, liveGPS, userLocation]);

  // 1. Pure Local Spherical Geodesy (Pillars App Great-Circle Azimuth to Mecca)
  // Evaluated directly against the user's live physical GPS coordinates
  const qiblaData: QiblaResult = useMemo(() => {
    const geo = calculateGeodesicQibla(activeCoordinates.latitude, activeCoordinates.longitude);
    return {
      direction: geo.direction,
      compassBearing: geo.compassBearing,
      distanceKm: geo.distanceKm,
      location: { latitude: activeCoordinates.latitude, longitude: activeCoordinates.longitude },
      source: 'geodesic'
    };
  }, [activeCoordinates.latitude, activeCoordinates.longitude]);

  // Local magnetic declination for true north alignment from exact active coordinates
  const magneticDeclination = useMemo(() => {
    return estimateMagneticDeclination(activeCoordinates.latitude, activeCoordinates.longitude);
  }, [activeCoordinates.latitude, activeCoordinates.longitude]);

  // 2. High-Performance Decoupled Hardware Sensor & Direct GPU Transform State
  // Telemetry state is only updated on whole degree changes to prevent 60 FPS React re-render lag
  const [normalizedFacing, setNormalizedFacing] = useState<number>(0);
  const [isAligned, setIsAligned] = useState<boolean>(false);
  const [hasCompassSensor, setHasCompassSensor] = useState<boolean>(false);
  const [manualHeading, setManualHeading] = useState<number | null>(null);

  // Direct DOM references for 60/120 FPS GPU transforms (Zero React Render Overhead)
  const dialRef = useRef<HTMLDivElement>(null);
  const targetHeadingRef = useRef<number>(0);
  const smoothedVectorRef = useRef<Vector2D>({ x: 0, y: 1 });
  const renderedAngleRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const hasAbsoluteRef = useRef<boolean>(false);
  const lastFacingRef = useRef<number>(0);
  const prevAlignedRef = useRef<boolean>(false);
  const offsetRef = useRef<number>(qiblaCalibrationOffset);
  offsetRef.current = qiblaCalibrationOffset;

  // 3. Search Bar State
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityData[]>(() => POPULAR_CITIES.slice(0, 10));
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // High-Accuracy Continuous Live GPS Watcher
  const startLiveGPSWatch = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsPermissionState('denied');
      setGpsErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setIsAcquiringGPS(true);
    setGpsErrorMsg(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy, altitude, speed } = pos.coords;
        setLiveGPS({
          latitude,
          longitude,
          accuracy,
          altitude: altitude ?? null,
          speed: speed ?? null,
          timestamp: pos.timestamp
        });
        setIsLiveGPSActive(true);
        setIsAcquiringGPS(false);
        setGpsPermissionState('granted');
        setGpsErrorMsg(null);

        // Keep local reverse-geocoded place name synced
        try {
          const detected = await reverseGeocodeLocation(latitude, longitude);
          if (detected && detected.name) {
            setUserLocation({
              name: detected.name,
              country: detected.country,
              latitude: Math.round(latitude * 10000) / 10000,
              longitude: Math.round(longitude * 10000) / 10000
            });
          }
        } catch (e) {
          console.warn('Reverse geocode error:', e);
        }
      },
      (err) => {
        setIsAcquiringGPS(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsPermissionState('denied');
          setGpsErrorMsg('Location permission was denied. Tap "Allow GPS" or check browser settings.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGpsErrorMsg('GPS satellite signal unavailable. Using city preset.');
        } else if (err.code === err.TIMEOUT) {
          setGpsErrorMsg('GPS request timed out. Retrying...');
        }
      },
      {
        enableHighAccuracy: true, // Hardware GPS satellites
        timeout: 15000,
        maximumAge: 0
      }
    );
  }, [setUserLocation]);

  // Request explicit GPS permission on tap
  const handleRequestGPSPermission = useCallback(() => {
    hapticImpact(ImpactStyle.Medium);
    setIsAcquiringGPS(true);
    setGpsErrorMsg(null);

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsPermissionState('denied');
      setGpsErrorMsg('Geolocation is not supported on this device.');
      setIsAcquiringGPS(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy, altitude, speed } = pos.coords;
        setLiveGPS({
          latitude,
          longitude,
          accuracy,
          altitude: altitude ?? null,
          speed: speed ?? null,
          timestamp: pos.timestamp
        });
        setIsLiveGPSActive(true);
        setGpsPermissionState('granted');
        setIsAcquiringGPS(false);
        setGpsErrorMsg(null);

        // Start continuous watcher
        startLiveGPSWatch();

        try {
          const detected = await reverseGeocodeLocation(latitude, longitude);
          if (detected && detected.name) {
            setUserLocation({
              name: detected.name,
              country: detected.country,
              latitude: Math.round(latitude * 10000) / 10000,
              longitude: Math.round(longitude * 10000) / 10000
            });
          }
        } catch {}
      },
      (err) => {
        setIsAcquiringGPS(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsPermissionState('denied');
          setGpsErrorMsg('Location permission was denied. Please allow location access in your device/browser settings.');
        } else {
          setGpsErrorMsg('Could not acquire GPS fix. Please ensure device location is enabled.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }, [startLiveGPSWatch, setUserLocation]);

  // Switch back to phone GPS from manual city search
  const handleSwitchToLiveGPS = useCallback(() => {
    hapticImpact(ImpactStyle.Light);
    setIsLiveGPSActive(true);
    if (!liveGPS) {
      handleRequestGPSPermission();
    } else {
      startLiveGPSWatch();
    }
  }, [liveGPS, handleRequestGPSPermission, startLiveGPSWatch]);

  // Check permission & automatically start live GPS on mount
  useEffect(() => {
    let isMounted = true;
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName })
        .then((perm) => {
          if (!isMounted) return;
          setGpsPermissionState(perm.state as 'prompt' | 'granted' | 'denied');
          if (perm.state === 'granted') {
            startLiveGPSWatch();
          }
          perm.onchange = () => {
            if (!isMounted) return;
            setGpsPermissionState(perm.state as 'prompt' | 'granted' | 'denied');
            if (perm.state === 'granted') {
              startLiveGPSWatch();
            }
          };
        })
        .catch(() => {
          if (isMounted) {
            setGpsPermissionState('prompt');
            startLiveGPSWatch();
          }
        });
    } else {
      setGpsPermissionState('prompt');
      startLiveGPSWatch();
    }

    return () => {
      isMounted = false;
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [startLiveGPSWatch]);

  // Register modal back handler when search is active
  useEffect(() => {
    if (isSearching) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
      return registerModal(() => setIsSearching(false));
    }
  }, [isSearching]);

  // Automatically activate live compass motion sensors on mount and on first user interaction
  useEffect(() => {
    let isActive = true;

    const requestSensorPermission = async () => {
      if (
        typeof window !== 'undefined' &&
        typeof (window as any).DeviceOrientationEvent !== 'undefined' &&
        typeof (window as any).DeviceOrientationEvent.requestPermission === 'function'
      ) {
        try {
          const response = await (window as any).DeviceOrientationEvent.requestPermission();
          if (response === 'granted' && isActive) {
            setHasCompassSensor(true);
          }
        } catch {
          // If browser requires user gesture on iOS, hook seamlessly to first touch or click
          const handleFirstInteraction = async () => {
            try {
              if (typeof (window as any).DeviceOrientationEvent?.requestPermission === 'function') {
                const res = await (window as any).DeviceOrientationEvent.requestPermission();
                if (res === 'granted' && isActive) {
                  setHasCompassSensor(true);
                }
              }
            } catch {}
          };

          window.addEventListener('touchstart', handleFirstInteraction, { once: true, passive: true });
          window.addEventListener('click', handleFirstInteraction, { once: true, passive: true });
          window.addEventListener('pointerdown', handleFirstInteraction, { once: true, passive: true });
        }
      }
    };

    requestSensorPermission();

    return () => {
      isActive = false;
    };
  }, []);

  // 1-Tap 90° Offset Adjustment for Devices with Misaligned Sensor HAL / Hardware
  const handleCycleOffset = (newOffset: number) => {
    hapticImpact(ImpactStyle.Light);
    const diff = (newOffset - qiblaCalibrationOffset + 360) % 360;
    setQiblaCalibrationOffset(newOffset);
    offsetRef.current = newOffset;
    targetHeadingRef.current = (targetHeadingRef.current + diff + 360) % 360;
  };

  // 4. Ultra-Smooth Lag-Free Render Loop (2D Unit-Vector Filtering, Direct GPU Transform)
  const startRafLoop = useCallback(() => {
    if (rafIdRef.current !== null) return;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const target = targetHeadingRef.current;
      const targetVec = degreesToUnitVector(target);
      const currentVec = smoothedVectorRef.current;

      // Measure angular difference in degrees via dot product
      const dot = Math.max(-1, Math.min(1, currentVec.x * targetVec.x + currentVec.y * targetVec.y));
      const angleDiffDeg = Math.acos(dot) * (180 / Math.PI);

      // Deadband noise filter: eliminates micro sensor tremble when phone is held still
      if (angleDiffDeg > 0.15) {
        // Fast dynamic responsiveness: instantly tracks rapid movement (> 4°), smoothly eases when settling
        const speed = angleDiffDeg > 4 ? 26 : 18;
        const factor = Math.min(1, dt * speed);

        smoothedVectorRef.current = lowPassFilterVector(currentVec, targetVec, factor);
        const smoothedDeg = unitVectorToDegrees(smoothedVectorRef.current);

        // Continuous angular unwrapping so CSS transform does not snap across 0°/360°
        let delta = ((smoothedDeg - (renderedAngleRef.current % 360)) + 540) % 360 - 180;
        renderedAngleRef.current += delta;

        // Direct DOM update on GPU compositor thread (Zero React re-render lag)
        if (dialRef.current) {
          dialRef.current.style.transform = `rotate3d(0, 0, 1, ${-renderedAngleRef.current}deg)`;
        }

        // Throttled degree & alignment updates to React state
        const deg = Math.round(((smoothedDeg % 360) + 360) % 360);
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

    // 1. Android Absolute Orientation Listener (Google Chrome on Android)
    const handleAbsoluteOrientation = (e: any) => {
      const screenAngle = getScreenAngle();
      const heading2D = extract2DCompassHeading(e.alpha, null, screenAngle);
      if (heading2D === null) return;
      hasAbsoluteRef.current = true;
      setHasCompassSensor(true);
      targetHeadingRef.current = (heading2D + offsetRef.current + 360) % 360;
    };

    // 2. Standard / iOS DeviceOrientation Listener
    const handleDeviceOrientation = (e: any) => {
      // iOS Safari provides webkitCompassHeading directly relative to True/Magnetic North in 2D
      if (e.webkitCompassHeading !== undefined && e.webkitCompassHeading !== null) {
        const heading2D = extract2DCompassHeading(null, e.webkitCompassHeading);
        if (heading2D !== null) {
          setHasCompassSensor(true);
          targetHeadingRef.current = (heading2D + offsetRef.current + 360) % 360;
          return;
        }
      }

      // If Android absolute listener is active, ignore relative orientation events
      if (hasAbsoluteRef.current) {
        return;
      }

      const screenAngle = getScreenAngle();

      // If standard event reports absolute: true
      if (e.absolute === true && e.alpha !== null) {
        const heading2D = extract2DCompassHeading(e.alpha, null, screenAngle);
        if (heading2D !== null) {
          setHasCompassSensor(true);
          targetHeadingRef.current = (heading2D + offsetRef.current + 360) % 360;
          return;
        }
      }

      // Fallback: Pure 2D planar rotation with magnetic declination offset
      if (e.alpha !== null && !hasAbsoluteRef.current) {
        const heading2D = extract2DCompassHeading(e.alpha, null, screenAngle);
        if (heading2D !== null) {
          setHasCompassSensor(true);
          targetHeadingRef.current = (heading2D + magneticDeclination + offsetRef.current + 360) % 360;
        }
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
  }, [magneticDeclination, startRafLoop, stopRafLoop, qiblaCalibrationOffset]);

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

  // High-precision Live Phone GPS activation
  const handleDetectGPS = () => {
    handleRequestGPSPermission();
  };

  const handleSelectCity = (city: CityData) => {
    hapticImpact(ImpactStyle.Light);
    setIsLiveGPSActive(false); // Explicitly switch to viewing chosen city preset
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
      {/* 1. LOCATION SEARCH & LIVE GPS CALCULATION */}
      <div className="liquid-glass-card rounded-2xl border border-white/60 dark:border-white/12 p-2 sm:p-2.5 shadow-md">
        <div className="flex items-center gap-2">
          {/* Search bar asking for location */}
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!isSearching) setIsSearching(true);
              }}
              onFocus={() => setIsSearching(true)}
              placeholder={
                isUrdu
                  ? 'مقام یا شہر تلاش کریں...'
                  : activeCoordinates.displayName
                  ? `Search location (${activeCoordinates.displayName})`
                  : 'Search location or city...'
              }
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl liquid-glass border border-white/40 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={14} />
              </button>
            ) : isSearching ? (
              <button
                onClick={() => setIsSearching(false)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold cursor-pointer"
              >
                {isUrdu ? 'بند' : 'Close'}
              </button>
            ) : null}
          </div>

          {/* Simple button for asking GPS permission and calculating Qibla direction */}
          <button
            onClick={() => {
              setIsSearching(false);
              handleDetectGPS();
            }}
            disabled={isAcquiringGPS}
            className={`px-3 sm:px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 text-xs sm:text-sm shrink-0 cursor-pointer shadow-md transition-all active:scale-95 ${
              activeCoordinates.isGPS
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            title={isUrdu ? 'فون GPS کی اجازت دیں اور سمت معلوم کریں' : 'Ask permission & calculate Qibla using GPS'}
          >
            {isAcquiringGPS ? (
              <Loader2 size={15} className="animate-spin text-white" />
            ) : (
              <Navigation size={15} className={activeCoordinates.isGPS ? "fill-emerald-600 dark:fill-emerald-400" : ""} />
            )}
            <span>
              {isAcquiringGPS
                ? (isUrdu ? 'تلاش جاری...' : 'Locating...')
                : activeCoordinates.isGPS
                ? (isUrdu ? 'GPS فعال' : 'GPS Active')
                : (isUrdu ? 'GPS اجازت دیں' : 'Use GPS')}
            </span>
          </button>
        </div>

        {/* GPS Error note if permission denied */}
        {gpsErrorMsg && (
          <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5 px-1 pt-1.5">
            <AlertCircle size={13} className="shrink-0" />
            <span>{gpsErrorMsg}</span>
          </div>
        )}

        {/* Search Results Dropdown when searching */}
        {isSearching && (
          <div className="mt-2.5 space-y-2 pt-2 border-t border-white/20 dark:border-white/10">
            {/* Quick Shrines */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
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
            <div className="max-h-56 overflow-y-auto divide-y divide-white/20 dark:divide-white/10 text-xs rounded-xl liquid-glass border border-white/30 dark:border-white/10">
              {isSearchingOnline && (
                <div className="py-2.5 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin text-emerald-600" />
                  <span>{isUrdu ? 'تلاش جاری ہے...' : 'Searching places...'}</span>
                </div>
              )}

              {searchResults.map((city) => {
                const itemQibla = calculateGeodesicQibla(city.latitude, city.longitude);
                const isSelected = !activeCoordinates.isGPS && userLocation.name === city.name && Math.abs(userLocation.latitude - city.latitude) < 0.01;

                return (
                  <button
                    key={`${city.name}-${city.country}-${city.latitude}-${city.longitude}`}
                    onClick={() => handleSelectCity(city)}
                    className={`w-full text-left p-2.5 flex items-center justify-between gap-2 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
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
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5 tabular-nums">
                        Lat: {city.latitude.toFixed(4)}° • Lng: {city.longitude.toFixed(4)}°
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div className="px-2 py-0.5 rounded-lg bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1 border border-emerald-500/30">
                        <Compass size={11} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{itemQibla.direction}° {itemQibla.compassBearing}</span>
                      </div>
                      {isSelected && (
                        <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}

              {!isSearchingOnline && searchResults.length === 0 && searchQuery && (
                <div className="py-4 text-center text-xs text-slate-400">
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
                style={{ willChange: 'transform', transform: 'rotate3d(0, 0, 1, 0deg)' }}
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
                <div className="flex items-center justify-center gap-1 mt-1">
                  {activeCoordinates.isGPS && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  )}
                  <span className="text-[10px] text-emerald-400/90 font-mono font-bold tracking-tight">
                    {activeCoordinates.displayName}
                  </span>
                </div>
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

      {/* 4. CALIBRATION & 90° ALIGN */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl liquid-glass border border-white/40 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1.5 truncate">
          <span className="text-amber-500 font-bold select-none">∞</span>
          <span className="text-[11px] truncate">
            {isUrdu ? 'فون کو 8 کی شکل میں گھما کر کیلیبریٹ کریں' : 'Move phone in figure-8 motion to calibrate'}
          </span>
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {qiblaCalibrationOffset !== 0 && (
            <button
              onClick={() => handleCycleOffset(0)}
              className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/25 cursor-pointer"
              title="Reset offset to 0°"
            >
              {isUrdu ? '0°' : 'Reset 0°'}
            </button>
          )}
          <button
            onClick={() => handleCycleOffset((qiblaCalibrationOffset + 90) % 360)}
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 cursor-pointer flex items-center gap-1"
            title="Rotate compass alignment by 90°"
          >
            <span>⟳</span>
            <span>{qiblaCalibrationOffset > 0 ? `+${qiblaCalibrationOffset}°` : isUrdu ? '90° رخ' : '90° Align'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
