import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Quote } from 'lucide-react';

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
    <div className="mb-8 p-6 md:p-10 bg-gradient-to-br from-emerald-800 to-teal-900 dark:from-emerald-900 dark:to-teal-950 rounded-[2rem] relative overflow-hidden shadow-2xl shadow-emerald-900/20 border border-emerald-500/20">
      {/* Decorative Ornaments */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/5 rounded-full blur-3xl -ml-20 -mb-20"></div>
      
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      
      <div className="relative z-10 flex flex-col items-center text-center min-h-[300px] md:min-h-[240px] justify-center">
        <Quote className="absolute top-0 left-0 text-white/10 w-24 h-24 -mt-4 -ml-4" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col items-center w-full relative z-10"
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-emerald-300/80" />
              <h4 className="text-emerald-100/90 font-medium tracking-[0.2em] text-xs uppercase font-serif">
                {current.title}
              </h4>
              <Sparkles className="w-4 h-4 text-emerald-300/80" />
            </div>
            
            <p className="font-arabic text-3xl md:text-5xl text-white leading-loose mb-6 drop-shadow-lg" style={{ fontFamily: "'Thuluth', 'Amiri Quran', serif", textShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              {current.arabic}
            </p>
            
            <p className="text-emerald-50/90 font-serif italic text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              {current.translation}
            </p>
            
            <div className="bg-black/20 px-5 py-2 rounded-full border border-white/10 backdrop-blur-md mt-auto">
              <p className="text-xs text-emerald-100/70 font-medium tracking-wide uppercase">
                {current.citation}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div className="absolute bottom-0 flex gap-3 pt-4">
          {BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'bg-white w-6 opacity-100' : 'bg-white/30 hover:bg-white/50 opacity-50'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
