import React, { useState, useEffect } from 'react';
import { Pause, Play, X, Compass, Volume2 } from 'lucide-react';
import { shiaAdhanPlayer } from '../utils/shiaAdhanPlayer';
import { hapticImpact } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';

export default function ActiveAdhanNotification() {
  const [playerStatus, setPlayerStatus] = useState(shiaAdhanPlayer.getStatus());
  const [isDismissed, setIsDismissed] = useState(false);
  const [needsGestureToPlay, setNeedsGestureToPlay] = useState(false);
  const [bannerPrayerName, setBannerPrayerName] = useState<string>('Shia Adhan');

  useEffect(() => {
    const unsub = shiaAdhanPlayer.subscribe(() => {
      const status = shiaAdhanPlayer.getStatus();
      setPlayerStatus(status);
      if (status.isPlaying) {
        setIsDismissed(false);
        setNeedsGestureToPlay(false);
        if (status.currentPrayerName) {
          setBannerPrayerName(status.currentPrayerName);
        }
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handleAdhanEvent = (e: any) => {
      const detail = e.detail || {};
      if (detail.prayerName) {
        setBannerPrayerName(detail.prayerName);
      }
      setIsDismissed(false);
      if (detail.blocked) {
        setNeedsGestureToPlay(true);
      } else {
        setNeedsGestureToPlay(false);
      }
    };

    window.addEventListener('shia-adhan-playing', handleAdhanEvent);
    return () => window.removeEventListener('shia-adhan-playing', handleAdhanEvent);
  }, []);

  const shouldShow = (!isDismissed && (playerStatus.isPlaying || needsGestureToPlay));

  if (!shouldShow) {
    return null;
  }

  const handleStartAudio = async () => {
    hapticImpact(ImpactStyle.Light);
    await shiaAdhanPlayer.unlockAudio();
    await shiaAdhanPlayer.playAdhan(bannerPrayerName, playerStatus.repeatCount || 1);
    setNeedsGestureToPlay(false);
  };

  return (
    <div className="fixed top-12 inset-x-0 z-50 p-3 max-w-lg mx-auto pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="pointer-events-auto bg-slate-950/95 dark:bg-slate-900/95 backdrop-blur-xl border border-emerald-500/40 rounded-3xl p-4 text-white shadow-2xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs animate-pulse">
              <Compass size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-100">
                  {playerStatus.currentPrayerName || bannerPrayerName}
                </span>
                <span className="text-[11px] text-emerald-300/80 font-mono">
                  Adhan Time
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Call to Prayer (Ithna-Ashari)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {needsGestureToPlay ? (
              <button
                onClick={handleStartAudio}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <Volume2 size={14} />
                <span>Play Sound</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  hapticImpact(ImpactStyle.Light);
                  shiaAdhanPlayer.pauseAdhan();
                }}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Pause"
              >
                <Pause size={16} />
              </button>
            )}

            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                shiaAdhanPlayer.stopAdhan();
                setIsDismissed(true);
                setNeedsGestureToPlay(false);
              }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Sacred phrase highlight */}
        <div className="p-2.5 rounded-2xl bg-emerald-950/70 border border-emerald-800/60 text-center">
          <p className="font-arabic text-base sm:text-lg text-emerald-300 font-normal leading-relaxed" dir="rtl">
            حَيَّ عَلَى خَيْرِ الْعَمَلِ • أَشْهَدُ أَنَّ عَلِيًّا وَلِيُّ اللَّهِ
          </p>
          <p className="text-[10px] text-emerald-100/70 mt-0.5">
            Hasten to the best of deeds &bull; I bear witness that Ali is the Wali of Allah
          </p>
        </div>
      </div>
    </div>
  );
}
