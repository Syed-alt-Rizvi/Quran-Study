import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  RotateCw, 
  Repeat, 
  Gauge, 
  Volume2, 
  VolumeX, 
  Square, 
  LocateFixed, 
  Check, 
  ChevronDown,
  Sparkles,
  BookOpen,
  Headphones
} from 'lucide-react';
import { SacredAlbumArt } from './SacredAlbumArt';
import { useAudioStore } from '../audioStore';
import { useMafatihAudioStore, isSameTrack } from '../mafatihAudioStore';
import { useSettingsStore } from '../store';
import { QURAN_RECITERS } from '../utils/quranAudioEngine';
import { hapticImpact, hapticSelection, ImpactStyle } from '../utils/haptics';
import { getMafatihUrduTitle, getMafatihUrduCategory, toUrduNumerals } from '../utils/mafatihUrdu';
import { getMafatihArabicTitle, getMafatihEnglishTitle } from '../utils/mafatihArabic';
import { t } from '../i18n';
import { MafatihDetail } from '../mafatihApi';

export interface DedicatedQuranPlayerProps {
  mode: 'quran';
  surahNumber: number;
  surahNameArabic?: string;
  surahNameEnglish?: string;
  revelationType?: 'Meccan' | 'Medinan' | string;
  ayahCount?: number;
  ayahs?: Array<{ numberInSurah: number; text: string; translationEn?: string; translationUr?: string }>;
  variant?: 'sidebar' | 'full';
  onScrollToActiveAyah?: () => void;
  onSwitchToTextView?: () => void;
}

export interface DedicatedMafatihPlayerProps {
  mode: 'mafatih';
  item: MafatihDetail;
  variant?: 'sidebar' | 'full';
  onSwitchToTextView?: () => void;
}

export type DedicatedMusicPlayerProps = DedicatedQuranPlayerProps | DedicatedMafatihPlayerProps;

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5];

export const DedicatedMusicPlayer: React.FC<DedicatedMusicPlayerProps> = (props) => {
  const { mode, variant = 'sidebar' } = props;
  const appLanguage = useSettingsStore((s) => s.appLanguage);
  const isUrdu = appLanguage === 'ur';

  // -------------------------------------------------------------
  // QURAN MODE STATE & ACTIONS
  // -------------------------------------------------------------
  const quranAudio = useAudioStore();
  const { 
    reciter, 
    setReciter, 
    globalAudioSpeed, 
    setGlobalAudioSpeed, 
    autoScrollAudio, 
    toggleAutoScrollAudio 
  } = useSettingsStore();

  const [showReciterPicker, setShowReciterPicker] = useState(false);

  // -------------------------------------------------------------
  // MAFATIH MODE STATE & ACTIONS
  // -------------------------------------------------------------
  const mafatihAudio = useMafatihAudioStore();

  if (mode === 'quran') {
    const {
      surahNumber,
      surahNameArabic,
      surahNameEnglish,
      revelationType,
      ayahCount,
      ayahs = [],
      onScrollToActiveAyah,
      onSwitchToTextView
    } = props;

    const isThisSurahInStore = quranAudio.surahId === surahNumber && quranAudio.playlist.length > 0;
    const isPlaying = isThisSurahInStore && quranAudio.isPlaying;
    const isBuffering = isThisSurahInStore && quranAudio.isBuffering;
    const currentAyahIndex = isThisSurahInStore ? quranAudio.currentIndex : 0;
    const activeAyah = ayahs[currentAyahIndex] || (isThisSurahInStore && quranAudio.playlist[currentAyahIndex]);
    const currentAyahNumber = activeAyah?.numberInSurah || (currentAyahIndex + 1);

    const activeReciter = QURAN_RECITERS[reciter] || QURAN_RECITERS['ar.alafasy'];

    const handlePlayPause = () => {
      hapticImpact(ImpactStyle.Heavy);
      if (isPlaying) {
        quranAudio.pause();
      } else {
        if ((!isThisSurahInStore || quranAudio.playlist.length === 0) && ayahs.length > 0) {
          quranAudio.setPlaylist(surahNumber, ayahs as any, currentAyahIndex);
        } else {
          quranAudio.play();
        }
      }
    };

    const handleNext = () => {
      hapticImpact(ImpactStyle.Light);
      if (isThisSurahInStore) {
        quranAudio.next();
      } else if (ayahs.length > 0) {
        quranAudio.setPlaylist(surahNumber, ayahs as any, Math.min(ayahs.length - 1, currentAyahIndex + 1));
      }
    };

    const handlePrev = () => {
      hapticImpact(ImpactStyle.Light);
      if (isThisSurahInStore) {
        quranAudio.prev();
      } else if (ayahs.length > 0) {
        quranAudio.setPlaylist(surahNumber, ayahs as any, Math.max(0, currentAyahIndex - 1));
      }
    };

    const handleSpeedChange = () => {
      hapticImpact(ImpactStyle.Light);
      const cur = globalAudioSpeed || 1.0;
      const nextIdx = (SPEED_OPTIONS.indexOf(cur) + 1) % SPEED_OPTIONS.length;
      setGlobalAudioSpeed(SPEED_OPTIONS[nextIdx]);
    };

    const totalAyahs = ayahCount || ayahs.length || 1;
    const progressPercent = Math.min(100, Math.round(((currentAyahIndex + 1) / totalAyahs) * 100));

    return (
      <div 
        className={`w-full flex flex-col items-center liquid-glass-card border border-white/50 dark:border-white/10 rounded-3xl p-4 sm:p-6 shadow-xl relative ${
          variant === 'full' ? 'max-w-md mx-auto my-auto min-h-[500px] justify-around' : 'sticky top-20'
        }`}
      >
        {/* Soft Ambient Radial Backdrop with isolated overflow clipping */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Top Bar: Mode Switcher & Reciter Selector */}
        <div className="w-full flex items-center justify-between gap-2 mb-4 relative z-10">
          <div className="flex items-center gap-2">
            {isPlaying ? (
              <div className="flex items-end gap-0.5 h-3.5 w-3.5" aria-hidden="true">
                <span className="w-1 bg-emerald-500 rounded-xs animate-[pulse_0.8s_ease-in-out_infinite] h-full" />
                <span className="w-1 bg-emerald-400 rounded-xs animate-[pulse_0.5s_ease-in-out_infinite] h-2/3" />
                <span className="w-1 bg-teal-400 rounded-xs animate-[pulse_0.9s_ease-in-out_infinite] h-4/5" />
              </div>
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-400/60 dark:bg-slate-500/60" />
            )}
            <span className="text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300 uppercase">
              {isUrdu ? 'آڈیو پلیئر' : 'Sacred Player'}
            </span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                setShowReciterPicker((prev) => !prev);
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full liquid-glass border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all cursor-pointer shadow-2xs"
            >
              <Headphones size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span className="truncate max-w-[110px]">{activeReciter.name.split(' ')[0]}</span>
              <ChevronDown size={12} />
            </button>

            {/* Reciter Picker Dropdown with Backdrop */}
            {showReciterPicker && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowReciterPicker(false)} 
                />
                <div className="absolute right-0 top-full mt-2 w-56 p-1.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/15 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Reciter / قاری
                  </div>
                  {Object.values(QURAN_RECITERS).map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        hapticSelection();
                        setReciter(r.id);
                        setShowReciterPicker(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        reciter === r.id
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="truncate font-semibold">{r.name}</div>
                        <div className={`text-[10px] truncate ${reciter === r.id ? 'text-white/80' : 'text-slate-400'}`}>
                          {r.style}
                        </div>
                      </div>
                      {reciter === r.id && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Central Album Artwork (Unique per Surah) */}
        <div className="my-2 relative z-10 flex flex-col items-center">
          <SacredAlbumArt
            type="quran"
            surahNumber={surahNumber}
            surahNameArabic={surahNameArabic}
            surahNameEnglish={surahNameEnglish}
            revelationType={revelationType}
            ayahCount={totalAyahs}
            isPlaying={isPlaying}
            size="lg"
          />
        </div>

        {/* Live Active Ayah Snippet Card */}
        {activeAyah && (
          <div 
            onClick={onScrollToActiveAyah}
            className="w-full mt-3 p-3 rounded-2xl liquid-glass border border-emerald-500/30 text-center relative z-10 cursor-pointer group hover:border-emerald-500/60 transition-all shadow-xs"
            title="Click to jump to this Ayah in reading text"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400">
                {isUrdu ? `آیت ${toUrduNumerals(currentAyahNumber)}` : `Ayah ${currentAyahNumber} of ${totalAyahs}`}
              </span>
              <span className="flex items-center gap-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                <LocateFixed size={12} />
                <span>{isUrdu ? 'متن دیکھیں' : 'Jump to Text'}</span>
              </span>
            </div>
            <p 
              dir="rtl" 
              className="font-arabic text-sm sm:text-base text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed"
            >
              {activeAyah.text}
            </p>
          </div>
        )}

        {/* Progress Bar & Interactive Ayah Scrubber */}
        <div className="w-full mt-4 space-y-1.5 relative z-10">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>{isUrdu ? `${toUrduNumerals(currentAyahNumber)} / ${toUrduNumerals(totalAyahs)}` : `Ayah ${currentAyahNumber}`}</span>
            <span className="font-bold text-emerald-800 dark:text-emerald-400">{progressPercent}%</span>
            <span>{isUrdu ? `${toUrduNumerals(totalAyahs)} آیات` : `${totalAyahs} Ayahs`}</span>
          </div>

          <div className="relative group/scrub flex items-center py-1">
            <input
              type="range"
              min={1}
              max={totalAyahs}
              step={1}
              value={currentAyahNumber}
              onChange={(e) => {
                const targetAyah = parseInt(e.target.value, 10);
                const targetIdx = Math.max(0, Math.min(totalAyahs - 1, targetAyah - 1));
                if (ayahs.length > 0) {
                  quranAudio.setPlaylist(surahNumber, ayahs as any, targetIdx);
                }
              }}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
              style={{
                background: `linear-gradient(to right, #059669 0%, #10b981 ${progressPercent}%, rgba(148, 163, 184, 0.3) ${progressPercent}%, rgba(148, 163, 184, 0.3) 100%)`
              }}
              aria-label="Seek Ayah"
            />
          </div>
        </div>

        {/* Main Controls Row */}
        <div className="w-full flex items-center justify-between gap-2 mt-4 relative z-10">
          {/* Loop Ayah Toggle */}
          <button
            type="button"
            onClick={() => {
              hapticImpact(ImpactStyle.Light);
              quranAudio.toggleLoopAyah();
            }}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              quranAudio.isLoopingAyah
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title={quranAudio.isLoopingAyah ? 'Repeat Ayah: ON' : 'Repeat Ayah: OFF'}
          >
            <Repeat size={18} />
          </button>

          {/* Prev Ayah */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentAyahIndex <= 0}
            className="p-2.5 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-30 rounded-xl transition-colors cursor-pointer"
            title="Previous Ayah"
          >
            <SkipBack size={22} fill="currentColor" />
          </button>

          {/* Grand Play / Pause Button */}
          <button
            type="button"
            onClick={handlePlayPause}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isBuffering ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause size={24} fill="currentColor" />
            ) : (
              <Play size={24} fill="currentColor" className="ml-1" />
            )}
          </button>

          {/* Next Ayah */}
          <button
            type="button"
            onClick={handleNext}
            disabled={currentAyahIndex >= totalAyahs - 1}
            className="p-2.5 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-30 rounded-xl transition-colors cursor-pointer"
            title="Next Ayah"
          >
            <SkipForward size={22} fill="currentColor" />
          </button>

          {/* Playback Speed Cycler */}
          <button
            type="button"
            onClick={handleSpeedChange}
            className="px-2 py-1 text-xs font-mono font-bold rounded-xl liquid-glass border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            title="Playback Speed"
          >
            {globalAudioSpeed || 1.0}x
          </button>
        </div>

        {/* Footer Actions: Auto-scroll sync & View Switch */}
        <div className="w-full flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 text-xs relative z-10">
          <button
            type="button"
            onClick={() => {
              hapticImpact(ImpactStyle.Light);
              toggleAutoScrollAudio();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              autoScrollAudio
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-400/40'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles size={14} className={autoScrollAudio ? 'text-emerald-600' : 'text-slate-400'} />
            <span>{isUrdu ? 'خودکار سکرول' : 'Auto-Scroll'}</span>
          </button>

          {onSwitchToTextView && (
            <button
              type="button"
              onClick={onSwitchToTextView}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold liquid-glass border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-600 cursor-pointer shadow-2xs"
            >
              <BookOpen size={14} />
              <span>{isUrdu ? 'متن دیکھیں' : 'Read Ayahs'}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAFATIH MODE RENDER
  // -------------------------------------------------------------
  const { item, onSwitchToTextView } = props;
  const isThisItemActive = isSameTrack(mafatihAudio.currentTrack, {
    id: item.id,
    title: item.title,
    audioUrl: item.audioUrl || ''
  });
  const isPlaying = isThisItemActive && mafatihAudio.isPlaying;
  const isBuffering = isThisItemActive && mafatihAudio.isBuffering;
  const activeCurrentTime = isThisItemActive ? mafatihAudio.currentTime : 0;
  const activeDuration = isThisItemActive ? mafatihAudio.duration : 0;

  const handleTogglePlay = () => {
    hapticImpact(ImpactStyle.Heavy);
    const effectiveAudioUrl = item.audioUrl || (isThisItemActive ? mafatihAudio.currentTrack?.audioUrl : null);
    if (!effectiveAudioUrl) return;
    mafatihAudio.toggleTrack({
      id: item.id,
      title: item.title,
      category: (item.categoryChain || []).join(' › ') || item.mainCategory,
      audioUrl: effectiveAudioUrl
    });
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const str = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return isUrdu ? toUrduNumerals(str) : str;
  };

  const progressPercent = activeDuration > 0 ? Math.min(100, (activeCurrentTime / activeDuration) * 100) : 0;
  const displayTitle = isUrdu ? getMafatihUrduTitle(item.id, item.title) : getMafatihEnglishTitle(item.id, item.title);
  const displayCategory = isUrdu ? getMafatihUrduCategory(item.mainCategory) : item.mainCategory;
  const arTitle = getMafatihArabicTitle(item.id, item.title, item.mainCategory);

  return (
    <div 
      className={`w-full flex flex-col items-center liquid-glass-card border border-white/50 dark:border-white/10 rounded-3xl p-4 sm:p-6 shadow-xl relative ${
        variant === 'full' ? 'max-w-md mx-auto my-auto min-h-[500px] justify-around' : 'sticky top-20'
      }`}
    >
      {/* Soft Ambient Radial Backdrop with isolated overflow clipping */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top Bar: Sacred Badge & Quality Indicator */}
      <div className="w-full flex items-center justify-between gap-2 mb-4 relative z-10">
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <div className="flex items-end gap-0.5 h-3.5 w-3.5" aria-hidden="true">
              <span className="w-1 bg-emerald-500 rounded-xs animate-[pulse_0.8s_ease-in-out_infinite] h-full" />
              <span className="w-1 bg-emerald-400 rounded-xs animate-[pulse_0.5s_ease-in-out_infinite] h-2/3" />
              <span className="w-1 bg-teal-400 rounded-xs animate-[pulse_0.9s_ease-in-out_infinite] h-4/5" />
            </div>
          ) : (
            <span className="w-2 h-2 rounded-full bg-slate-400/60 dark:bg-slate-500/60" />
          )}
          <span className="text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300 uppercase">
            {isUrdu ? 'مفاتیح آڈیو پلیئر' : 'Devotional Player'}
          </span>
        </div>

        <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 tracking-wider uppercase font-semibold">
          {item.audioUrl ? 'HD Audio' : 'Text Only'}
        </span>
      </div>

      {/* Central Album Artwork (Unique per Dua/Ziyarat/Munajat) */}
      <div className="my-2 relative z-10 flex flex-col items-center">
        <SacredAlbumArt
          type="mafatih"
          itemId={item.id}
          title={item.title}
          arabicTitle={arTitle}
          category={item.mainCategory}
          isPlaying={isPlaying}
          size={variant === 'full' ? 'lg' : 'lg'}
        />
      </div>

      {/* Item Title & Attribution */}
      <div className="w-full text-center mt-3 relative z-10">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
          {displayTitle}
        </h2>
        {arTitle && (
          <p dir="rtl" className="font-arabic text-sm text-emerald-600 dark:text-emerald-400 mt-0.5 truncate drop-shadow-2xs">
            {arTitle}
          </p>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
          {displayCategory} • {isUrdu ? 'تالیف: شیخ عباس قمی (رح)' : 'Sheikh Abbas Qummi (r.a)'}
        </p>
      </div>

      {/* Audio Time & Fluid Range Scrubber */}
      <div className="w-full mt-4 space-y-1 relative z-10">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <span>{formatTime(activeCurrentTime)}</span>
          <span className="text-emerald-800 dark:text-emerald-400 font-bold">{Math.round(progressPercent)}%</span>
          <span>{activeDuration > 0 ? formatTime(activeDuration) : '--:--'}</span>
        </div>

        <input
          type="range"
          min={0}
          max={activeDuration || 100}
          step={0.1}
          value={activeCurrentTime}
          onChange={(e) => {
            const target = parseFloat(e.target.value);
            if (isThisItemActive) {
              mafatihAudio.seek(target);
            }
          }}
          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
          style={{
            background: `linear-gradient(to right, #059669 0%, #10b981 ${progressPercent}%, rgba(148, 163, 184, 0.3) ${progressPercent}%, rgba(148, 163, 184, 0.3) 100%)`
          }}
          aria-label="Seek audio"
        />
      </div>

      {/* Transport Controls */}
      <div className="w-full flex items-center justify-between gap-2 mt-4 relative z-10">
        {/* Loop Toggle */}
        <button
          type="button"
          onClick={() => {
            hapticImpact(ImpactStyle.Light);
            mafatihAudio.toggleLoop();
          }}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            mafatihAudio.isLooping
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          title={mafatihAudio.isLooping ? 'Loop Track: ON' : 'Loop Track: OFF'}
        >
          <Repeat size={18} />
        </button>

        {/* Skip -10s */}
        <button
          type="button"
          onClick={() => {
            hapticImpact(ImpactStyle.Light);
            if (isThisItemActive) mafatihAudio.skip(-10);
          }}
          className="p-2.5 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-colors cursor-pointer"
          title="Rewind 10 seconds"
        >
          <RotateCcw size={20} />
        </button>

        {/* Grand Play / Pause Button */}
        <button
          type="button"
          onClick={handleTogglePlay}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isBuffering ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause size={24} fill="currentColor" />
          ) : (
            <Play size={24} fill="currentColor" className="ml-1" />
          )}
        </button>

        {/* Skip +10s */}
        <button
          type="button"
          onClick={() => {
            hapticImpact(ImpactStyle.Light);
            if (isThisItemActive) mafatihAudio.skip(10);
          }}
          className="p-2.5 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-colors cursor-pointer"
          title="Forward 10 seconds"
        >
          <RotateCw size={20} />
        </button>

        {/* Playback Speed Cycler */}
        <button
          type="button"
          onClick={() => {
            hapticImpact(ImpactStyle.Light);
            mafatihAudio.cycleSpeed();
          }}
          className="px-2 py-1 text-xs font-mono font-bold rounded-xl liquid-glass border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          title="Playback Speed"
        >
          {mafatihAudio.playbackSpeed}x
        </button>
      </div>

      {/* Footer Controls: Volume & View Switch */}
      <div className="w-full flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 text-xs relative z-10">
        <div className="flex items-center gap-1.5 text-slate-500">
          <button
            type="button"
            onClick={() => {
              hapticImpact(ImpactStyle.Light);
              mafatihAudio.toggleMute();
            }}
            className="p-1 hover:text-emerald-600 transition-colors cursor-pointer"
            title={mafatihAudio.isMuted ? 'Unmute' : 'Mute'}
          >
            {mafatihAudio.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={mafatihAudio.isMuted ? 0 : mafatihAudio.volume}
            onChange={(e) => mafatihAudio.setVolume(parseFloat(e.target.value))}
            style={{
              background: `linear-gradient(to right, #059669 0%, #10b981 ${(mafatihAudio.isMuted ? 0 : mafatihAudio.volume) * 100}%, rgba(148, 163, 184, 0.3) ${(mafatihAudio.isMuted ? 0 : mafatihAudio.volume) * 100}%, rgba(148, 163, 184, 0.3) 100%)`
            }}
            className="w-16 sm:w-20 h-1.5 rounded-full appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
            aria-label="Volume"
          />
        </div>

        {onSwitchToTextView && (
          <button
            type="button"
            onClick={onSwitchToTextView}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold liquid-glass border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-600 cursor-pointer shadow-2xs"
          >
            <BookOpen size={14} />
            <span>{isUrdu ? 'متن دیکھیں' : 'Read Text'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
