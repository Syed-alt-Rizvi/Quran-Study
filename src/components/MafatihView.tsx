import React, { useState } from 'react';
import { BookMarked, Play, Pause, Search, Sparkles, Clock, Heart } from 'lucide-react';
import { MAFATIH_COLLECTION, MafatihItem } from '../data/mafatihData';

export const MafatihView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'dua' | 'ziyarat' | 'munajat'>('all');
  const [activeItem, setActiveItem] = useState<MafatihItem>(MAFATIH_COLLECTION[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const filteredItems = selectedCategory === 'all'
    ? MAFATIH_COLLECTION
    : MAFATIH_COLLECTION.filter(i => i.category === selectedCategory);

  const toggleAudio = (url?: string) => {
    if (!url) return;

    if (isPlaying && currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio(url);
    audio.play().then(() => {
      setCurrentAudio(audio);
      setIsPlaying(true);
    }).catch(err => {
      console.error(err);
      setIsPlaying(false);
    });

    audio.onended = () => {
      setIsPlaying(false);
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
            Sheikh Abbas Qummi (مفاتيح الجنان)
          </span>
          <h2 className="text-2xl font-bold text-slate-100 mt-1 flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-emerald-400" />
            Mafatih Al-Jinan (Keys to the Heavens)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Authentic supplications, ziyaraat, and munajaat narrated through the Ahlulbayt (a.s)
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedCategory === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setSelectedCategory('dua')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedCategory === 'dua'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Duas (أدعية)
          </button>
          <button
            onClick={() => setSelectedCategory('ziyarat')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedCategory === 'ziyarat'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ziyaraat (زيارات)
          </button>
          <button
            onClick={() => setSelectedCategory('munajat')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedCategory === 'munajat'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Munajaat (مناجاة)
          </button>
        </div>
      </div>

      {/* Grid: Selector list & Detail view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items list */}
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isSelected = activeItem.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  setActiveItem(item);
                  if (currentAudio) {
                    currentAudio.pause();
                    setIsPlaying(false);
                  }
                }}
                className={`cursor-pointer p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-emerald-500/60 bg-emerald-950/20 shadow-md ring-1 ring-emerald-500/30'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {item.category}
                  </span>
                  <span className="font-amiri font-bold text-slate-200 text-sm">
                    {item.titleArabic}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-100 mt-1">
                  {item.titleEnglish}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right: Active Supplication Detail */}
        <div className="lg:col-span-2 border border-slate-800 bg-slate-900/70 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  {activeItem.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {activeItem.recommendedTime}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mt-1 font-amiri">
                {activeItem.titleArabic} — {activeItem.titleEnglish}
              </h3>
            </div>

            {activeItem.audioUrl && (
              <button
                onClick={() => toggleAudio(activeItem.audioUrl)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'Pause Recitation' : 'Play Recitation'}</span>
              </button>
            )}
          </div>

          {/* Description & Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-emerald-400 font-semibold block mb-1">Background & Origin:</span>
              <p className="text-slate-300 leading-relaxed">{activeItem.description}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-emerald-400 font-semibold block mb-1">Spiritual Merits (Fada'il):</span>
              <p className="text-slate-300 leading-relaxed">{activeItem.benefits}</p>
            </div>
          </div>

          {/* Arabic Text & English Translation */}
          <div className="space-y-4 pt-2">
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 text-right">
              <span className="text-xs text-slate-500 block mb-2 font-mono">مقطع من الدعاء المبارك</span>
              <p className="font-quran text-xl sm:text-2xl text-slate-100 leading-loose" dir="rtl">
                {activeItem.arabicExcerpt}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <span className="text-xs text-emerald-400 font-semibold block mb-1">English Translation:</span>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{activeItem.englishExcerpt}"
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800">
            <span>Reciter: {activeItem.audioReciter}</span>
            <span>Source: Mafatih Al-Jinan, Allamah Majlisi Zad al-Ma'ad</span>
          </div>
        </div>
      </div>
    </div>
  );
};
