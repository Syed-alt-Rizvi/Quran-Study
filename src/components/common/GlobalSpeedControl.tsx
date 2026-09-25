import React, { useState, useRef, useEffect } from 'react';
import { Gauge, Check, Sparkles } from 'lucide-react';
import { useSettingsStore } from '../../store';
import { hapticImpact, hapticSelection } from '../../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';

export const SPEED_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

interface GlobalSpeedControlProps {
  currentSpeed?: number;
  onSpeedChange?: (speed: number) => void;
  className?: string;
  variant?: 'badge' | 'button' | 'pill';
  showLabel?: boolean;
}

/**
 * Universal Speed Controller Component
 * Works seamlessly across both Quran audio recitation and Mafatih Al Jinan supplications.
 * Changes apply globally and persist in local storage.
 */
export default function GlobalSpeedControl({
  currentSpeed,
  onSpeedChange,
  className = '',
  variant = 'badge',
  showLabel = false,
}: GlobalSpeedControlProps) {
  const { globalAudioSpeed, setGlobalAudioSpeed } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeSpeed = currentSpeed !== undefined ? currentSpeed : (globalAudioSpeed || 1.0);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelectSpeed = (speed: number) => {
    hapticImpact(ImpactStyle.Light);
    setGlobalAudioSpeed(speed);
    if (onSpeedChange) {
      onSpeedChange(speed);
    }
    setIsOpen(false);
  };

  const handleCycleSpeed = (e: React.MouseEvent) => {
    // If long-pressed or right-clicked, open picker, but normal click can cycle
    e.stopPropagation();
    hapticSelection();
    const curIdx = SPEED_PRESETS.findIndex((s) => Math.abs(s - activeSpeed) < 0.05);
    const nextIdx = (curIdx + 1) % SPEED_PRESETS.length;
    const newSpeed = SPEED_PRESETS[nextIdx];
    setGlobalAudioSpeed(newSpeed);
    if (onSpeedChange) {
      onSpeedChange(newSpeed);
    }
  };

  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
      {/* Trigger Button */}
      {variant === 'pill' ? (
        <button
          type="button"
          onClick={() => {
            hapticSelection();
            setIsOpen(!isOpen);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold transition-all border shadow-xs ${
            activeSpeed !== 1.0
              ? 'bg-amber-500/15 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 border-amber-400/50 dark:border-amber-500/50'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
          }`}
          title="Adjust Recitation Speed (Quran & Mafatih)"
          aria-label={`Playback speed: ${activeSpeed}x`}
        >
          <Gauge size={13} className={activeSpeed !== 1.0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'} />
          <span>{activeSpeed}x</span>
          {showLabel && <span className="font-sans text-[11px] font-normal opacity-80">Speed</span>}
        </button>
      ) : variant === 'button' ? (
        <button
          type="button"
          onClick={() => {
            hapticSelection();
            setIsOpen(!isOpen);
          }}
          className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            activeSpeed !== 1.0
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
          }`}
          title="Adjust Audio Speed"
        >
          <Gauge size={14} />
          <span className="font-mono font-bold">{activeSpeed}x</span>
        </button>
      ) : (
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleCycleSpeed}
            onContextMenu={(e) => {
              e.preventDefault();
              setIsOpen(true);
            }}
            className={`px-2 py-0.5 text-[11px] sm:text-xs font-mono font-bold rounded-lg border transition-all active:scale-95 flex items-center gap-1 ${
              activeSpeed !== 1.0
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-400/80 dark:border-emerald-600 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            title={`Speed: ${activeSpeed}x • Tap to cycle or open speed menu`}
            aria-label={`Playback speed ${activeSpeed}x`}
          >
            <Gauge size={12} className="opacity-70" />
            <span>{activeSpeed}x</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              hapticSelection();
              setIsOpen(!isOpen);
            }}
            className="p-1 -ml-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-md transition-colors"
            title="Choose specific speed"
          >
            <span className="text-[10px] block transform rotate-90 scale-75">›</span>
          </button>
        </div>
      )}

      {/* Floating Speed Selector Popover */}
      {isOpen && (
        <div
          className="absolute bottom-full mb-2 right-0 sm:right-auto sm:left-0 z-50 w-48 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-emerald-300/60 dark:border-emerald-800/60 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150"
          style={{ willChange: 'transform, opacity' }}
        >
          <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <Sparkles size={11} />
              Audio Speed
            </span>
            <span className="text-[10px] font-mono font-semibold text-slate-400">
              Global
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {SPEED_PRESETS.map((preset) => {
              const isSelected = Math.abs(preset - activeSpeed) < 0.05;
              let label = '';
              if (preset === 1.0) label = 'Normal';
              else if (preset === 0.75) label = 'Slow (Tartil)';
              else if (preset === 0.5) label = 'Very Slow';
              else if (preset === 1.25) label = 'Swift';
              else if (preset === 1.5) label = 'Fast (Hadr)';
              else if (preset === 2.0) label = 'Very Fast';

              return (
                <button
                  key={`speed-preset-${preset}`}
                  type="button"
                  onClick={() => handleSelectSpeed(preset)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                    isSelected
                      ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">{preset}x</span>
                    {label && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                        ({label})
                      </span>
                    )}
                  </div>
                  {isSelected && <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-center text-slate-400">
            Applies to Quran &amp; Mafatih
          </div>
        </div>
      )}
    </div>
  );
}
