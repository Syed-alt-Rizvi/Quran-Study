import { useEffect, useState, useRef, useCallback } from 'react';
import { useSettingsStore } from '../store';
import { getShiaPrayerTimes, ShiaPrayerTimings } from '../utils/shiaPrayerTimes';
import { shiaAdhanPlayer, scheduleNativeAdhanAlarms } from '../utils/shiaAdhanPlayer';

function getLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function useGlobalAdhanScheduler() {
  const { userLocation, adhanSettings } = useSettingsStore();
  const [currentTimings, setCurrentTimings] = useState<ShiaPrayerTimings | null>(null);
  const lastDateRef = useRef<string>('');

  // Function to refresh timings for the given date (accounts for seasonal shifts across 365 days)
  const refreshTimingsForDate = useCallback(async (date: Date) => {
    try {
      const result = await getShiaPrayerTimes(userLocation.latitude, userLocation.longitude, date);
      setCurrentTimings(result);
      // Sync native Android device alarms (runs locally without any external push server)
      scheduleNativeAdhanAlarms(result, adhanSettings);
    } catch (err) {
      console.warn('Global adhan scheduler failed to refresh timings:', err);
    }
  }, [userLocation.latitude, userLocation.longitude, adhanSettings]);

  // Initial load on mount or coordinate change
  useEffect(() => {
    const today = new Date();
    const dateStr = getLocalDateKey(today);
    lastDateRef.current = dateStr;
    refreshTimingsForDate(today);
  }, [userLocation.latitude, userLocation.longitude, refreshTimingsForDate]);

  // Unthrottled ticker using Web Worker (persists even when tab is backgrounded)
  useEffect(() => {
    const handleTick = () => {
      const now = new Date();
      const dateStr = getLocalDateKey(now);

      // Midnight Rollover Detection: Automatically refresh timings on date change
      if (dateStr !== lastDateRef.current) {
        lastDateRef.current = dateStr;
        refreshTimingsForDate(now);
      }

      // Check scheduled adhan times
      if (currentTimings) {
        shiaAdhanPlayer.checkScheduledTimes(
          {
            fajr: currentTimings.fajr,
            dhuhr: currentTimings.dhuhr,
            maghrib: currentTimings.maghrib
          },
          {
            autoPlayFajr: adhanSettings.autoPlayFajr,
            autoPlayDhuhr: adhanSettings.autoPlayDhuhr,
            autoPlayMaghrib: adhanSettings.autoPlayMaghrib,
            repeatCount: adhanSettings.repeatCount || 1
          }
        );
      }
    };

    let worker: Worker | null = null;
    let fallbackInterval: any = null;

    try {
      const workerCode = `
        let timer = null;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            if (!timer) {
              timer = setInterval(function() {
                self.postMessage('tick');
              }, 1000);
            }
          } else if (e.data === 'stop') {
            if (timer) {
              clearInterval(timer);
              timer = null;
            }
          }
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      worker = new Worker(workerUrl);
      worker.onmessage = () => {
        handleTick();
      };
      worker.postMessage('start');
    } catch {
      // Graceful fallback to standard interval if Web Workers are restricted
      fallbackInterval = setInterval(handleTick, 1000);
    }

    const onVisibilityOrFocus = () => {
      handleTick();
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibilityOrFocus);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', onVisibilityOrFocus);
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibilityOrFocus);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', onVisibilityOrFocus);
      }
      if (worker) {
        worker.postMessage('stop');
        worker.terminate();
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, [currentTimings, adhanSettings, refreshTimingsForDate]);

  return {
    timings: currentTimings,
    refreshTimings: () => refreshTimingsForDate(new Date())
  };
}
