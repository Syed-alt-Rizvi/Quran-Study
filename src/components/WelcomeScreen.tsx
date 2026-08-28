import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useSettingsStore } from '../store';
import { ArrowRight } from 'lucide-react';

export default function WelcomeScreen({ onComplete }: { key?: string; onComplete: () => void }) {
  const { userName, setUserName } = useSettingsStore();
  const [step, setStep] = useState(0); // 0: greeting, 1: ask name
  const [inputName, setInputName] = useState('');

  const handleNext = () => {
    if (inputName.trim()) {
      setUserName(inputName.trim());
    }
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-emerald-900 text-amber-50 p-6"
    >
      <div className="flex flex-col items-center space-y-12 w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="text-center"
              onAnimationComplete={() => {
                setTimeout(() => setStep(1), 2500);
              }}
            >
              <h1 className="font-arabic text-5xl md:text-7xl leading-relaxed text-amber-400">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </h1>
              <p className="mt-4 text-emerald-200/80 tracking-widest uppercase text-sm md:text-base font-medium">
                In the name of Allah, the Most Gracious, the Most Merciful
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="font-arabic text-4xl md:text-6xl text-amber-100/90 mb-8">
                يا علي مدد
              </h2>
              
              <div className="w-full bg-emerald-800/50 backdrop-blur-md border border-emerald-700/50 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-xl font-medium text-amber-100 mb-2">Welcome!</h3>
                <p className="text-emerald-200/80 text-sm mb-6">What is your beautiful name?</p>
                
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleNext(); }}
                  className="flex gap-3"
                >
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="Enter your name..."
                    className="flex-1 bg-emerald-900/50 border border-emerald-700 rounded-xl px-4 py-3 text-amber-50 placeholder-emerald-600 focus:outline-none focus:border-amber-500 transition-colors"
                    autoFocus
                  />
                  <button 
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-emerald-950 p-3 rounded-xl transition-colors"
                  >
                    <ArrowRight size={24} />
                  </button>
                </form>
                
                <div className="mt-4 text-center">
                  <button 
                    type="button" 
                    onClick={handleNext}
                    className="text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
