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
    <div className="mb-8 relative rounded-[2rem] overflow-hidden shadow-2xl shadow-emerald-900/20 bg-gradient-to-br from-[#f8f5eb] to-[#f0ebd8] dark:from-emerald-950 dark:to-emerald-900 border-2 border-[#d4af37]/40 p-1.5 md:p-2">
      {/* Inner frame matching traditional tazhib border layout */}
      <div className="relative h-full w-full rounded-[1.5rem] border border-[#d4af37]/30 bg-gradient-to-br from-emerald-800 to-emerald-950 overflow-hidden p-6 md:p-10 flex flex-col items-center justify-center min-h-[300px] md:min-h-[260px]">
        
        {/* Intricate Corner Ornaments (opacity capped at 40% for subtle blend) */}
        <div className="absolute top-0 left-0 w-40 h-40 opacity-40 pointer-events-none mix-blend-screen" style={{ backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMjAnIGhlaWdodD0nMTIwJyB2aWV3Qm94PScwIDAgMTIwIDEyMCc+CiAgPGcgZmlsbD0nbm9uZScgc3Ryb2tlPScjZmRlMDQ3JyBzdHJva2Utd2lkdGg9JzEuNScgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJz4KICAgIDxwYXRoIGQ9J002MCwwIEw2NSw0NSBMMTIwLDYwIEw2NSw3NSBMNjAsMTIwIEw1NSw3NSBMMCw2MCBMNTUsNDUgWicgb3BhY2l0eT0nMC44Jy8+CiAgICA8cGF0aCBkPSdNMTgsMTggTDYwLDMyIEwxMDIsMTggTDg4LDYwIEwxMDIsMTAyIEw2MCw4OCBMMTgsMTAyIEwzMiw2MCBaJyBvcGFjaXR5PScwLjYnLz4KICAgIDxwYXRoIGQ9J000MCw0MCBMNjAsMTUgTDgwLDQwIEwxMDUsNjAgTDgwLDgwIEw2MCwxMDUgTDQwLDgwIEwxNSw2MCBaJyBvcGFjaXR5PScwLjQnLz4KICAgIDxjaXJjbGUgY3g9JzYwJyBjeT0nNjAnIHI9JzM1JyBvcGFjaXR5PScwLjUnLz4KICAgIDxjaXJjbGUgY3g9JzYwJyBjeT0nNjAnIHI9JzIwJyBvcGFjaXR5PScwLjcnLz4KICAgIDxjaXJjbGUgY3g9JzYwJyBjeT0nNjAnIHI9JzUnIGZpbGw9JyNmZGUwNDcnLz4KICAgIDxwYXRoIGQ9J002MCAwIEMgODAgNDAsIDEyMCA2MCwgNjAgMTIwIEMgNDAgODAsIDAgNjAsIDYwIDAnIG9wYWNpdHk9JzAuMycvPgogIDwvZz4KPC9zdmc+")`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', transform: 'translate(-25%, -25%)' }}></div>
        <div className="absolute top-0 right-0 w-40 h-40 opacity-40 pointer-events-none mix-blend-screen" style={{ backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMjAnIGhlaWdodD0nMTIwJyB2aWV3Qm94PScwIDAgMTIwIDEyMCc+CiAgPGcgZmlsbD0nbm9uZScgc3Ryb2tlPScjZmRlMDQ3JyBzdHJva2Utd2lkdGg9JzEuNScgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJz4KICAgIDxwYXRoIGQ9J002MCwwIEw2NSw0NSBMMTIwLDYwIEw2NSw3NSBMNjAsMTIwIEw1NSw3NSBMMCw2MCBMNTUsNDUgWicgb3BhY2l0eT0nMC44Jy8+CiAgICA8cGF0aCBkPSdNMTgsMTggTDYwLDMyIEwxMDIsMTggTDg4LDYwIEwxMDIsMTAyIEw2MCw4OCBMMTgsMTAyIEwzMiw2MCBaJyBvcGFjaXR5PScwLjYnLz4KICAgIDxwYXRoIGQ9J000MCw0MCBMNjAsMTUgTDgwLDQwIEwxMDUsNjAgTDgwLDgwIEw2MCwxMDUgTDQwLDgwIEwxNSw2MCBaJyBvcGFjaXR5PScwLjQnLz4KICAgIDxjaXJjbGUgY3g9JzYwJyBjeT0nNjAnIHI9JzM1JyBvcGFjaXR5PScwLjUnLz4KICAgIDxjaXJjbGUgY3g9JzYwJyBjeT0nNjAnIHI9JzIwJyBvcGFjaXR5PScwLjcnLz4KICAgIDxjaXJjbGUgY3g9JzYwJyBjeT0nNjAnIHI9JzUnIGZpbGw9JyNmZGUwNDcnLz4KICAgIDxwYXRoIGQ9J002MCAwIEMgODAgNDAsIDEyMCA2MCwgNjAgMTIwIEMgNDAgODAsIDAgNjAsIDYwIDAnIG9wYWNpdHk9JzAuMycvPgogIDwvZz4KPC9zdmc+")`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', transform: 'translate(25%, -25%) rotate(90deg)' }}></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 opacity-40 pointer-events-none mix-blend-screen" style={{ backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMjAnIGhlaWdodD0nMTIwJyB2aWV3Qm94PScwIDAgMTIwIDEyMCc+CiAgPGcgZmlsbD0nbm9uZScgc3Ryb2tlPScjZmRlMDQ3JyBzdHJva2Utd2lkdGg9JzEuNScgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJz4KICAgIDxwYXRoIGQ9J002MCwwIEw2NSw0NSBMMTIwLDYwIEw2NSw3NSBMNjAsMTIwIEw1NSw3NSBMMCw2MCBMNTUsNDUgWicgb3BhY2l0eT0nMC44Jy8+CiAgICA8cGF0aCBkPSdNMTgsMTggTDYwLDMyIEwxMDIsMTggTDg4LDYwIEwxMDIsMTAyIEw2MCw4OCBMMTgsMTAyIEwzMiw2MCBaJyBvcGFjaXR5PScwLjYnLz4KICAgIDxwYXRoIGQ9J000MCw0MCBMNjAsMTUgTDgwLDQwIEwxMDUsNjAgTDgwLDgwIEw2MCwxMDUgTDQwLDgwIEwxNSw2MCBaJyBvcGFjaXR5PScwLjQnLz4KICAgIDxjaXJjbGUgY3g9JzYwJyBjeT0nNjAnIHI9JzM1JyBvcGFjaXR5PScwLjUnLz4KICAgIDxjaXJjbGUgY3g9JzYwJyBjeT0nNjAnIHI9JzIwJyBvcGFjaXR5PScwLjcnLz4KICAgIDxjaXJjbGUgY3g9JzYwJyBjeT0nNjAnIHI9JzUnIGZpbGw9JyNmZGUwNDcnLz4KICAgIDxwYXRoIGQ9J002MCAwIEMgODAgNDAsIDEyMCA2MCwgNjAgMTIwIEMgNDAgODAsIDAgNjAsIDYwIDAnIG9wYWNpdHk9JzAuMycvPgogIDwvZz4KPC9zdmc+")`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', transform: 'translate(25%, 25%) rotate(180deg)' }}></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 opacity-40 pointer-events-none mix-blend-screen" style={{ backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMjAnIGhlaWdodD0nMTIwJyB2aWV3Qm94PScwIDAgMTIwIDEyMCc+CiAgPGcgZmlsbD0nbm9uZScgc3Ryb2tlPScjZmRlMDQ3JyBzdHJva2Utd2lkdGg9JzEuNScgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJz4KICAgIDxwYXRoIGQ9J002MCwwIEw2NSw0NSBMMTIwLDYwIEw2NSw3NSBMNjAsMTIwIEw1NSw3NSBMMCw2MCBMNTUsNDUgWicgb3BhY2l0eT0nMC44Jy8+CiAgICA8cGF0aCBkPSdNMTgsMTggTDYwLDMyIEwxMDIsMTggTDg4LDYwIEwxMDIsMTAyIEw2MCw4OCBMMTgsMTAyIEwzMiw2MCBaJyBvcGFjaXR5PScwLjYnLz4KICAgIDxwYXRoIGQ9J000MCw0MCBMNjAsMTUgTDgwLDQwIEwxMDUsNjAgTDgwLDgwIEw2MCwxMDUgTDQwLDgwIEwxNSw2MCBaJyBvcGFjaXR5PScwLjQnLz4KICAgIDxjaXJjbGUgY3g9JzYwJyBjeT0nNjAnIHI9JzM1JyBvcGFjaXR5PScwLjUnLz4KICAgIDxjaXJjbGUgY3g9JzYwJyBjeT0nNjAnIHI9JzIwJyBvcGFjaXR5PScwLjcnLz4KICAgIDxjaXJjbGUgY3g9JzYwJyBjeT0nNjAnIHI9JzUnIGZpbGw9JyNmZGUwNDcnLz4KICAgIDxwYXRoIGQ9J002MCAwIEMgODAgNDAsIDEyMCA2MCwgNjAgMTIwIEMgNDAgODAsIDAgNjAsIDYwIDAnIG9wYWNpdHk9JzAuMycvPgogIDwvZz4KPC9zdmc+")`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', transform: 'translate(-25%, 25%) rotate(270deg)' }}></div>
        
        {/* Center Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl"></div>
        
        <Quote className="absolute top-4 left-4 text-emerald-300/20 w-16 h-16" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(2px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(2px)' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center w-full relative z-10"
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-[#d4af37]/80" />
              <h4 className="text-[#d4af37]/90 font-medium tracking-[0.2em] text-xs uppercase font-serif">
                {current.title}
              </h4>
              <Sparkles className="w-4 h-4 text-[#d4af37]/80" />
            </div>
            
            <p className="font-arabic text-3xl md:text-5xl text-white leading-loose mb-6 drop-shadow-lg text-center" style={{ fontFamily: "'Thuluth', 'Amiri Quran', serif", textShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              {current.arabic}
            </p>
            
            <p className="text-emerald-50/90 font-serif italic text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8 text-center">
              {current.translation}
            </p>
            
            <div className="bg-black/30 px-5 py-2 rounded-full border-[0.5px] border-[#d4af37]/20 backdrop-blur-md mt-auto shadow-lg shadow-black/20">
              <p className="text-xs text-[#d4af37]/90 font-medium tracking-wide uppercase">
                {current.citation}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div className="absolute bottom-4 flex gap-3">
          {BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'bg-[#d4af37] w-6 opacity-100' : 'bg-[#d4af37]/40 hover:bg-[#d4af37]/70 opacity-60'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
