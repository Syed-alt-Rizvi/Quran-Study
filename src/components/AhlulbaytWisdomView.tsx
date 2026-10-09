import React, { useState } from 'react';
import { Compass, BookOpen, Quote, Sparkles } from 'lucide-react';

interface WisdomItem {
  id: string;
  source: string;
  speaker: string;
  topic: string;
  arabicQuote: string;
  englishTranslation: string;
  scientificContext: string;
}

const WISDOM_COLLECTION: WisdomItem[] = [
  {
    id: "cosmology-ali",
    source: "Nahj al-Balagha (Sermon 1)",
    speaker: "Imam Ali ibn Abi Talib (a.s)",
    topic: "Cosmology & The Formation of Atmospheric Systems",
    arabicQuote: "أَنْشَأَ الْخَلْقَ إِنْشَاءً، وَابْتَدَأَهُ ابْتِدَاءً، بِلَا رَوِيَّةٍ أَجَالَهَا، وَلَا تَجْرِبَةٍ اسْتَفَادَهَا... ثُمَّ أَنْشَأَ سُبْحَانَهُ فَتْقَ الْأَجْوَاءِ، وَشَقَّ الْأَرْجَاءِ، وَسَكَائِكَ الْهَوَاءِ...",
    englishTranslation: "He initiated creation anew without pondering over any design, nor utilizing previous experience. Then He caused gashes to appear in the atmospheric expanse, opening wide the cosmic crevices and laminar flows of wind...",
    scientificContext: "Imam Ali's sermon describes cosmic genesis through hydrodynamics, gas stratification, and gravitational separation billions of years before modern astrophysics confirmed inflationary cosmology."
  },
  {
    id: "circulatory-sadiq",
    source: "Tawhid al-Mufaddal (Session 1)",
    speaker: "Imam Ja'far al-Sadiq (a.s)",
    topic: "Human Biology & Cardiovascular Homeostasis",
    arabicQuote: "فَكِّرْ يَا مُفَضَّلُ فِي مَجَارِي الْغِذَاءِ وَالْفَضَلَاتِ، وَكَيْفَ جُعِلَ لِلْجَسَدِ مَنَافِذُ وَأَوْعِيَةٌ تَجْرِي فِيهَا الدِّمَاءُ كَالْأَنْهَارِ...",
    englishTranslation: "Contemplate, O Mufaddal, on the pathways of nutrients and waste; how channels and vascular networks were fashioned throughout the anatomy wherein blood courses like irrigation streams...",
    scientificContext: "Spoken to his companion Al-Mufaddal ibn Umar in 8th-century Medina, anticipating William Harvey's 17th-century discovery of systemic circulatory physiology by nearly nine centuries."
  },
  {
    id: "relativity-sadiq",
    source: "Al-Misbah al-Shari'ah",
    speaker: "Imam Ja'far al-Sadiq (a.s)",
    topic: "Light, Particle Physics & Solar Luminescence",
    arabicQuote: "إِنَّ لِلضَّوْءِ سُرْعَةً لَا يُدْرِكُهَا الْبَصَرُ، وَأَنَّ الشَّمْسَ لَيْسَتْ سَاكِنَةً بَلْ تَدُورُ فِي مَدَارٍ مَعْلُومٍ...",
    englishTranslation: "Indeed, light travels with a designated speed imperceptible to the naked eye, and the sun is neither stationary nor dormant, but revolves in its designated celestial trajectory...",
    scientificContext: "Direct assertion of the finite velocity of light and solar orbital movement around the galactic core, aligning with contemporary relativistic astrophysics."
  }
];

export const AhlulbaytWisdomView: React.FC = () => {
  const [selectedWisdom, setSelectedWisdom] = useState<WisdomItem>(WISDOM_COLLECTION[0]);

  return (
    <div className="space-y-6">
      <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
            Ahlulbayt Scientific & Metaphysical Heritage
          </span>
          <h2 className="text-2xl font-bold text-slate-100 mt-1 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            Wisdom of the Ahlulbayt (a.s)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Profound discourses on cosmic creation, biological anatomy, and philosophical monotheism
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          {WISDOM_COLLECTION.map((w) => {
            const isSelected = selectedWisdom.id === w.id;
            return (
              <div
                key={w.id}
                onClick={() => setSelectedWisdom(w)}
                className={`cursor-pointer p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-emerald-500/60 bg-emerald-950/20 shadow-md ring-1 ring-emerald-500/30'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                <span className="text-[11px] font-mono uppercase text-emerald-400 block mb-1">
                  {w.source}
                </span>
                <h4 className="text-sm font-semibold text-slate-100">
                  {w.topic}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Narrated from {w.speaker}
                </p>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-2 border border-slate-800 bg-slate-900/70 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <span className="text-xs font-mono text-emerald-400 uppercase">
              {selectedWisdom.source} • {selectedWisdom.speaker}
            </span>
            <h3 className="text-xl font-bold text-slate-100 mt-1">
              {selectedWisdom.topic}
            </h3>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 text-right">
            <p className="font-quran text-xl sm:text-2xl text-slate-100 leading-loose" dir="rtl">
              {selectedWisdom.arabicQuote}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <span className="text-xs text-emerald-400 font-semibold block mb-1">English Translation:</span>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "{selectedWisdom.englishTranslation}"
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
            <span className="text-xs text-emerald-400 font-semibold block mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Scientific & Theological Significance:
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedWisdom.scientificContext}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
