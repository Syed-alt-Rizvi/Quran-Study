import React, { useState, useMemo } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music, ExternalLink, Headphones, ChevronDown, ChevronUp } from 'lucide-react';
import { useAudioStore } from '../audioStore';
import { useSettingsStore } from '../store';
import { fetchSurahDetail } from '../api';
import staticSurahs from '../surahList.json';
import { hapticImpact, ImpactStyle } from '../utils/haptics';
import { SURAH_URDU_MAP } from '../data/surahUrduNames';
import { getArabicFontFamily } from '../utils/arabicFonts';

interface HomeQuranAudioWidgetProps {
  onSelectSurah: (surahId: number, targetAyah?: number) => void;
}

const POPULAR_SURAHS = [
  { id: 1, nameEn: 'Al-Fatiha', nameAr: 'الفاتحة', desc: 'The Opening' },
  { id: 36, nameEn: 'Yaseen', nameAr: 'يس', desc: 'Heart of Quran' },
  { id: 55, nameEn: 'Ar-Rahman', nameAr: 'الرحمن', desc: 'The Beneficent' },
  { id: 56, nameEn: 'Al-Waqiah', nameAr: 'الواقعة', desc: 'The Inevitable' },
  { id: 67, nameEn: 'Al-Mulk', nameAr: 'الملك', desc: 'The Sovereignty' },
  { id: 112, nameEn: 'Al-Ikhlas', nameAr: 'الإخلاص', desc: 'The Sincerity' },
];

const RECITERS = [
  { id: 'ar.alafasy', name: 'Mishary Alafasy' },
  { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit' },
  { id: 'ar.minshawi', name: 'Mohamed Al-Minshawi' },
  { id: 'ar.abdurrahmaansudais', name: 'Abdur-Rahman As-Sudais' },
];

export default function HomeQuranAudioWidget({ onSelectSurah }: HomeQuranAudioWidgetProps) {
  const { playlist, currentIndex, isPlaying, surahId, play, pause, next, prev, setPlaylist } = useAudioStore();
  const { reciter, setReciter, appLanguage, arabicFont } = useSettingsStore();
  const isUrdu = appLanguage === 'ur';

  const [selectedSurahId, setSelectedSurahId] = useState<number>(surahId && surahId > 0 ? surahId : 1);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync selectedSurahId when global playback switches surahs
  React.useEffect(() => {
    if (surahId && surahId > 0 && surahId !== selectedSurahId) {
      setSelectedSurahId(surahId);
    }
  }, [surahId, selectedSurahId]);

  // Active surah metadata
  const currentSurahMeta = useMemo(() => {
    const list = Array.isArray(staticSurahs) ? staticSurahs : [];
    return list.find((s: any) => s.number === selectedSurahId) || {
      number: 1,
      name: 'سُورَةُ ٱلْفَاتِحَةِ',
      englishName: 'Al-Faatiha',
      englishNameTranslation: 'The Opening',
      numberOfAyahs: 7,
    };
  }, [selectedSurahId]);

  const isCurrentSurahPlaying = isPlaying && surahId === selectedSurahId;

  const handlePlaySurah = async (sId: number) => {
    hapticImpact(ImpactStyle.Light);
    setSelectedSurahId(sId);

    // If already loaded and matches current surah, toggle play/pause
    if (surahId === sId && playlist.length > 0) {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
      return;
    }

    // Load surah ayahs and start playing
    try {
      setLoadingAudio(true);
      const data = await fetchSurahDetail(sId);
      if (data?.ayahs && data.ayahs.length > 0) {
        setPlaylist(sId, data.ayahs, 0);
      }
    } catch (err) {
      console.error('Failed to load audio for surah:', err);
    } finally {
      setLoadingAudio(false);
    }
  };

  const handleSelectChip = (sId: number) => {
    handlePlaySurah(sId);
  };

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = parseInt(e.target.value, 10);
    if (!isNaN(sId) && sId >= 1 && sId <= 114) {
      handlePlaySurah(sId);
    }
  };

  const currentAyah = playlist[currentIndex];
  const urduSurahName = SURAH_URDU_MAP[selectedSurahId];

  // If collapsed (default), render a sleek narrow bar matching the Adhan bar
  if (!isExpanded) {
    return (
      <div 
        onClick={() => {
          hapticImpact(ImpactStyle.Light);
          setIsExpanded(true);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(true);
          }
        }}
        className="mb-3 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white shadow-xs border border-emerald-800/60 hover:border-emerald-600/70 active:scale-[0.99] transition-all flex items-center justify-between gap-2 cursor-pointer select-none"
        title="Expand Quran Audio Player"
      >
        {/* Left: Icon + Active Surah Name + Status */}
        <div className="flex items-center gap-2 min-w-0">
          <Headphones size={15} className={`text-emerald-400 shrink-0 ${isCurrentSurahPlaying ? 'animate-pulse' : ''}`} />

          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium truncate">
            <span className="font-semibold text-white tracking-tight">
              {isUrdu && urduSurahName ? `سورۃ ${urduSurahName}` : currentSurahMeta.englishName}
            </span>
            <span className="text-[11px] text-emerald-300 font-normal">
              {isCurrentSurahPlaying && currentAyah 
                ? `(Ayah ${currentAyah.numberInSurah}/${currentSurahMeta.numberOfAyahs})`
                : `(${currentSurahMeta.numberOfAyahs} Ayahs)`}
            </span>
          </div>
        </div>

        {/* Right: Inline Play/Pause Trigger + Expand Chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePlaySurah(selectedSurahId);
            }}
            disabled={loadingAudio}
            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              isCurrentSurahPlaying
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
            title={isCurrentSurahPlaying ? 'Pause Audio' : 'Play Audio'}
            aria-label={isCurrentSurahPlaying ? 'Pause' : 'Play'}
          >
            {loadingAudio ? (
              <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : isCurrentSurahPlaying ? (
              <Pause size={12} className="fill-current" />
            ) : (
              <Play size={12} className="fill-current ml-0.5" />
            )}
          </button>

          <ChevronDown size={15} className="text-emerald-400/80 shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-white p-4 sm:p-5 shadow-lg border border-emerald-800/40 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-40 h-40 bg-radial from-emerald-500/10 to-transparent pointer-events-none rounded-full blur-2xl" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Headphones size={17} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
              {isUrdu ? 'قرآن آڈیو پلیئر' : "Holy Qur'an Audio Player"}
            </span>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              <span>{isUrdu && urduSurahName ? `سورۃ ${urduSurahName}` : currentSurahMeta.englishName}</span>
              <span className="text-xs text-emerald-400/80">({currentSurahMeta.numberOfAyahs} {isUrdu ? 'آیات' : 'Ayahs'})</span>
            </h3>
          </div>
        </div>

        {/* Reciter Selector & Collapse Button */}
        <div className="flex items-center gap-1.5">
          <select
            value={reciter}
            onChange={(e) => {
              hapticImpact(ImpactStyle.Light);
              setReciter(e.target.value);
              // If already playing, refresh audio
              if (surahId) {
                fetchSurahDetail(surahId).then((data) => {
                  if (data?.ayahs) setPlaylist(surahId, data.ayahs, currentIndex);
                }).catch(() => {});
              }
            }}
            className="bg-black/50 text-emerald-200 text-[11px] font-medium rounded-xl px-2.5 py-1.5 border border-emerald-800/60 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
            title="Select Reciter"
          >
            {RECITERS.map((r) => (
              <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                {r.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              hapticImpact(ImpactStyle.Light);
              setIsExpanded(false);
            }}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-300 hover:text-white transition-colors cursor-pointer"
            title="Collapse Audio Player"
            aria-label="Collapse"
          >
            <ChevronUp size={15} />
          </button>
        </div>
      </div>

      {/* Center Surah Calligraphy & Recitation Details */}
      <div className="my-2.5 p-3 rounded-2xl bg-black/40 border border-emerald-800/40 flex items-center justify-between gap-3 relative z-10">
        <div className="min-w-0">
          <p
            dir="rtl"
            lang="ar"
            className="font-arabic text-xl sm:text-2xl text-emerald-200 font-normal truncate leading-relaxed"
            style={{ fontFamily: getArabicFontFamily(arabicFont) }}
          >
            {currentSurahMeta.name}
          </p>
          <p className="text-[11px] text-slate-400 truncate">
            {isCurrentSurahPlaying && currentAyah
              ? (isUrdu ? `آیت ${currentAyah.numberInSurah} جاری ہے` : `Reciting Ayah ${currentAyah.numberInSurah} of ${currentSurahMeta.numberOfAyahs}`)
              : (currentSurahMeta.englishNameTranslation || 'Chapter of the Holy Quran')}
          </p>
        </div>

        {/* Play / Pause Primary Button */}
        <button
          onClick={() => handlePlaySurah(selectedSurahId)}
          disabled={loadingAudio}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md cursor-pointer shrink-0 ${
            isCurrentSurahPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-emerald-950 active:scale-95'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
          }`}
          title={isCurrentSurahPlaying ? 'Pause Audio' : 'Play Surah'}
          aria-label={isCurrentSurahPlaying ? 'Pause' : 'Play'}
        >
          {loadingAudio ? (
            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : isCurrentSurahPlaying ? (
            <Pause size={22} className="fill-current" />
          ) : (
            <Play size={22} className="fill-current ml-0.5" />
          )}
        </button>
      </div>

      {/* Surah Dropdown Picker & Nav Controls */}
      <div className="flex items-center justify-between gap-2 mt-2 relative z-10">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (selectedSurahId > 1) {
                handlePlaySurah(selectedSurahId - 1);
              }
            }}
            disabled={selectedSurahId <= 1}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white transition-colors cursor-pointer"
            title="Previous Surah"
          >
            <SkipBack size={15} />
          </button>
          <button
            onClick={() => {
              if (selectedSurahId < 114) {
                handlePlaySurah(selectedSurahId + 1);
              }
            }}
            disabled={selectedSurahId >= 114}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white transition-colors cursor-pointer"
            title="Next Surah"
          >
            <SkipForward size={15} />
          </button>
        </div>

        {/* 114 Surah Select Dropdown */}
        <select
          value={selectedSurahId}
          onChange={handleDropdownChange}
          className="flex-1 bg-black/40 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 border border-emerald-800/50 focus:outline-none focus:border-emerald-500 transition-colors truncate cursor-pointer"
        >
          {Array.isArray(staticSurahs) &&
            staticSurahs.map((s: any) => (
              <option key={`surah-opt-${s.number}`} value={s.number} className="bg-slate-900 text-white">
                {s.number}. {s.englishName} ({s.name})
              </option>
            ))}
        </select>

        <button
          onClick={() => {
            hapticImpact(ImpactStyle.Light);
            onSelectSurah(selectedSurahId);
          }}
          className="p-1.5 rounded-xl bg-emerald-700/60 hover:bg-emerald-600 text-emerald-200 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          title="Open Full Surah View"
        >
          <ExternalLink size={15} />
        </button>
      </div>

      {/* Quick Play Beloved Surah Chips */}
      <div className="mt-3 pt-2.5 border-t border-emerald-800/50 relative z-10">
        <p className="text-[10px] text-slate-400 mb-1.5 font-medium uppercase tracking-wider">
          {isUrdu ? 'مقبول سورتیں:' : 'Quick Recitations:'}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_SURAHS.map((s) => {
            const isThisActive = selectedSurahId === s.id;
            return (
              <button
                key={`popular-${s.id}`}
                onClick={() => handleSelectChip(s.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isThisActive
                    ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-400/50'
                    : 'bg-black/40 hover:bg-black/60 text-emerald-300/80 hover:text-white border border-emerald-800/40'
                }`}
              >
                <span>{s.nameEn}</span>
                <span className="font-arabic text-xs font-normal opacity-80">{s.nameAr}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
