import React, { useState, useEffect, useMemo } from 'react';
import { Compass, ChevronRight, Volume2 } from 'lucide-react';
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
      className="mb-3 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white shadow-xs border border-emerald-800/60 hover:border-emerald-500/70 active:scale-[0.99] transition-all flex items-center justify-between gap-2 cursor-pointer select-none"
      title="View Adhan & Prayer Times"
    >
      {/* Left: Compass / Audio Playing icon + Next Prayer + Time + Countdown */}
      <div className="flex items-center gap-2 min-w-0">
        {isPlaying ? (
          <Volume2 size={15} className="text-emerald-300 animate-pulse shrink-0" />
        ) : (
          <Compass size={15} className="text-emerald-400 shrink-0" />
        )}

        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium truncate">
          <span className="font-semibold text-white tracking-tight">{nextPrayer.nameEn}</span>
          <span className="text-emerald-300 font-bold">{nextPrayer.time12}</span>
          <span className="text-[11px] text-emerald-200/70 font-normal">
            ({nextPrayer.formattedCountdown})
          </span>
        </div>
      </div>

      {/* Right: City name + Chevron */}
      <div className="flex items-center gap-1.5 shrink-0 text-emerald-200/80">
        <span className="text-[11px] sm:text-xs font-normal truncate max-w-[110px] sm:max-w-[160px] text-emerald-100/80 hidden xs:inline">
          {userLocation.name}
        </span>
        <ChevronRight size={15} className="text-emerald-400 shrink-0" />
      </div>
    </div>
  );
}
