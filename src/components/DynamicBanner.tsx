import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const BANNERS = [
  {
    title: "Hadith al-Thaqalayn",
    arabic: "إِنِّي تَارِكٌ فِيكُمْ الثَّقَلَيْنِ كِتَابَ اللَّهِ وَعِتْرَتِي أَهْلَ بَيْتِي",
    translation: "\"Indeed, I am leaving among you two weighty things: the Book of Allah and my progeny, the members of my household.\"",
    citation: "Sahih Muslim 2408",
  },
  {
    title: "Verse of Purification",
    arabic: "إِنَّمَا يُرِيدُ ٱللَّهُ لِيُذْهِبَ عَنكُمُ ٱلرِّجْسَ أَهْلَ ٱلْبَيْتِ وَيُطَهِّرَكُمْ تَطْهِيرًۭا",
    translation: "\"Allah intends only to remove from you the impurity [of sin], O people of the [Prophet's] household, and to purify you with [extensive] purification.\"",
    citation: "Quran 33:33 (Surah Al-Ahzab)",
  },
  {
    title: "Hadith of the Pen and Paper",
    arabic: "ائْتُونِي بِكِتَابٍ أَكْتُبْ لَكُمْ كِتَابًا لَنْ تَضِلُّوا بَعْدَهُ أَبَدًا",
    translation: "\"Bring for me (writing) paper and I will write for you a statement after which you will not go astray.\"",
    citation: "Sahih al-Bukhari 114",
  },
  {
    title: "Verse of Wilayah",
    arabic: "إِنَّمَا وَلِيُّكُمُ ٱللَّهُ وَرَسُولُهُۥ وَٱلَّذِينَ ءَامَنُوا۟ ٱلَّذِينَ يُقِيمُونَ ٱلصَّلَوٰةَ وَيُؤْتُونَ ٱلزَّكَوٰةَ وَهُمْ رَٰكِعُونَ",
    translation: "\"Your ally is none but Allah and [therefore] His Messenger and those who have believed - those who establish prayer and give zakah, and they bow [in worship].\"",
    citation: "Quran 5:55 (Surah Al-Ma'idah)",
  },
  {
    title: "Verse of Tabligh",
    arabic: "يَـٰٓأَيُّهَا ٱلرَّسُولُ بَلِّغْ مَآ أُنزِلَ إِلَيْكَ مِن رَّبِّكَ ۖ وَإِن لَّمْ تَفْعَلْ فَمَا بَلَّغْتَ رِسَالَتَهُۥ",
    translation: "\"O Messenger, announce that which has been revealed to you from your Lord, and if you do not, then you have not conveyed His message.\"",
    citation: "Quran 5:67 (Surah Al-Ma'idah)",
  }
];

export default function DynamicBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
    }, 10000); // 10 seconds per banner
    return () => clearInterval(interval);
  }, []);

  const current = BANNERS[currentIndex];

  return (
    <div className="mb-8 p-6 bg-emerald-700 dark:bg-emerald-900 rounded-2xl relative overflow-hidden shadow-lg border border-emerald-600 dark:border-emerald-800">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-600/30 dark:bg-emerald-800/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-emerald-800/30 dark:bg-emerald-950/30 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center h-[280px] md:h-[220px] justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center w-full"
          >
            <h4 className="text-emerald-100 font-semibold uppercase tracking-widest text-xs mb-4">{current.title}</h4>
            <p className="font-arabic text-2xl md:text-4xl text-white leading-loose mb-5 drop-shadow-md" style={{ fontFamily: "'Thuluth', 'Amiri Quran', serif" }}>
              {current.arabic}
            </p>
            <p className="text-emerald-50 text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-4">
              {current.translation}
            </p>
            <div className="bg-emerald-800/50 dark:bg-emerald-950/50 px-4 py-1.5 rounded-full backdrop-blur-sm mt-auto">
              <p className="text-xs text-emerald-200 font-medium tracking-wide">
                {current.citation}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div className="absolute bottom-0 flex gap-2 pt-2">
          {BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex ? 'bg-emerald-300 w-4' : 'bg-emerald-500/50 hover:bg-emerald-400'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
