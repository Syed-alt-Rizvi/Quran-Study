import { motion } from 'motion/react';
import { useEffect } from 'react';

export default function WelcomeScreen({ onComplete }: { key?: string; onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-emerald-900 text-amber-50"
    >
      <div className="flex flex-col items-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="text-center"
        >
          <h1 className="font-arabic text-5xl md:text-7xl leading-relaxed text-amber-400">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </h1>
          <p className="mt-4 text-emerald-200/80 tracking-widest uppercase text-sm md:text-base font-medium">
            In the name of Allah, the Most Gracious, the Most Merciful
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 1.2, ease: 'easeOut' }}
          className="text-center"
        >
          <h2 className="font-arabic text-4xl md:text-6xl text-amber-100/90">
            يا علي مدد
          </h2>
        </motion.div>
      </div>
    </motion.div>
  );
}
