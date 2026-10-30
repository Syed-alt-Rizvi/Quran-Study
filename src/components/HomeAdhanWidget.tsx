import React, { useState, useEffect, useMemo } from 'react';
import { Clock, ChevronRight, Volume2 } from 'lucide-react';
import { useSettingsStore } from '../store';
import { getShiaPrayerTimes, ShiaPrayerTimings, getNextShiaPrayer } from '../utils/shiaPrayerTimes';
import { shiaAdhanPlayer } from '../utils/shiaAdhanPlayer';

interface HomeAdhanWidgetProps {
  onOpenMapAndPrayers: () => void;
}

export default function HomeAdhanWidget({ onOpenMapAndPrayers }: HomeAdhanWidgetProps) {
  const { userLocation } = useSettingsStore();
  const [timings, setTimings] = useState<ShiaPrayerTimings | null>(null);
  const [now, setNow] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(shiaAdhanPlayer.getStatus().isPlaying);

  useEffect(() => {
    const unsub = shiaAdhanPlayer.subscribe(() => {
      setIsPlaying(shiaAdhanPlayer.getStatus().isPlaying);
    });
    return unsub;
  }, []);

  useEffect(() => {
    getShiaPrayerTimes(userLocation.latitude, userLocation.longitude, new Date())
      .then(setTimings)
      .catch((err) => console.warn('Prayer fetch err in Home widget:', err));
  }, [userLocation.latitude, userLocation.longitude]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const nextPrayer = useMemo(() => {
    if (!timings) return null;
    return getNextShiaPrayer(timings, now);
  }, [timings, now]);

  if (!timings || !nextPrayer) return null;

  return (
    <div 
      onClick={onOpenMapAndPrayers}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenMapAndPrayers();
        }
      }}
      className="mb-3 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl liquid-glass-card glass-amber-fusion border border-amber-400/40 dark:border-amber-500/20 shadow-xs hover:border-amber-400/70 active:scale-[0.99] transition-all flex items-center justify-between gap-2 cursor-pointer select-none"
      title="View Adhan & Prayer Times"
    >
      {/* Left: Clock / Audio Playing icon + Next Prayer + Time + Countdown */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-xl liquid-glass flex items-center justify-center border border-amber-400/40 text-amber-600 dark:text-amber-400 shrink-0 shadow-2xs">
          {isPlaying ? (
            <Volume2 size={15} className="text-amber-500 animate-pulse shrink-0" />
          ) : (
            <Clock size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium truncate">
          <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">{nextPrayer.nameEn}</span>
          <span className="text-amber-600 dark:text-amber-400 font-extrabold">{nextPrayer.time12}</span>
          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-normal">
            ({nextPrayer.formattedCountdown})
          </span>
        </div>
      </div>

      {/* Right: City name + Chevron */}
      <div className="flex items-center gap-1.5 shrink-0 text-slate-700 dark:text-slate-300">
        <span className="text-[11px] sm:text-xs font-medium truncate max-w-[110px] sm:max-w-[160px] hidden xs:inline">
          {userLocation.name}
        </span>
        <ChevronRight size={15} className="text-amber-500 shrink-0" />
      </div>
    </div>
  );
}
