import { useEffect, useState, useRef, useCallback } from 'react';
import { useSettingsStore } from '../store';
import { getShiaPrayerTimes, ShiaPrayerTimings } from '../utils/shiaPrayerTimes';
import { shiaAdhanPlayer } from '../utils/shiaAdhanPlayer';

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
    } catch (err) {
      console.warn('Global adhan scheduler failed to refresh timings:', err);
    }
  }, [userLocation.latitude, userLocation.longitude]);

  // Initial load on mount or coordinate change
  useEffect(() => {
    const today = new Date();
    const dateStr = getLocalDateKey(today);
    lastDateRef.current = dateStr;
    refreshTimingsForDate(today);
  }, [userLocation.latitude, userLocation.longitude, refreshTimingsForDate]);

  // Continuous background second-by-second ticker
  useEffect(() => {
    const ticker = setInterval(() => {
      const now = new Date();
      const dateStr = getLocalDateKey(now);

      // Midnight Rollover Detection: Automatically compensate for seasonal adhan shift on day change
      if (dateStr !== lastDateRef.current) {
        lastDateRef.current = dateStr;
        refreshTimingsForDate(now);
      }

      // Check scheduled adhan times for exact minute announcement
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
    }, 1000);

    return () => clearInterval(ticker);
  }, [currentTimings, adhanSettings, refreshTimingsForDate]);

  return {
    timings: currentTimings,
    refreshTimings: () => refreshTimingsForDate(new Date())
  };
}
