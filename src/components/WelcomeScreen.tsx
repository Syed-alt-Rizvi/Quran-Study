import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';

export default function WelcomeScreen({ onComplete }: { key?: string; onComplete: () => void }) {
  const { userName, setUserName } = useSettingsStore();
  const [step, setStep] = useState(0); // 0: greeting, 1: ask name
  const [inputName, setInputName] = useState(userName || '');

  // Failsafe timer: automatically advance from step 0 to step 1 after 2 seconds
  // even if onAnimationComplete does not fire in iframes or low-power modes
  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => {
        setStep(1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

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
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-amber-50 p-6 select-none"
    >
      <div className="flex flex-col items-center space-y-8 w-full max-w-md text-center">
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="flex flex-col items-center w-full cursor-pointer"
              onClick={() => setStep(1)}
            >
              <div className="w-16 h-16 rounded-full bg-emerald-800/60 border border-emerald-600/40 flex items-center justify-center mb-6 shadow-lg shadow-emerald-950/40">
                <BookOpen className="text-amber-400" size={28} />
              </div>

              <h1 className="font-arabic text-3xl sm:text-4xl leading-relaxed text-amber-300 font-bold tracking-wide">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </h1>
              <p className="mt-4 text-emerald-200/90 tracking-widest uppercase text-xs font-semibold px-4 max-w-sm">
                In the name of Allah, the Most Gracious, the Most Merciful
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
                <button
                  id="welcome-start-reading-btn"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-emerald-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Enter Shia Markaz</span>
                  <ArrowRight size={18} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStep(1);
                  }}
                  className="text-xs text-emerald-300/80 hover:text-emerald-100 py-2 transition-colors"
                >
                  Personalize App
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="font-arabic text-4xl text-amber-300/90 mb-6 font-bold">
                یا علی مدد
              </h2>
              
              <div className="w-full bg-emerald-900/60 backdrop-blur-xl border border-emerald-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl">
                <div className="flex items-center justify-center gap-2 text-amber-400 mb-2">
                  <Sparkles size={18} />
                  <h3 className="text-lg font-bold text-amber-100">Welcome to Shia Markaz</h3>
                </div>
                <p className="text-emerald-200/80 text-xs sm:text-sm mb-6">
                  What is your name? (Optional)
                </p>
                
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleNext(); }}
                  className="flex flex-col gap-3"
                >
                  <div className="flex gap-2">
                    <input
                      id="welcome-name-input"
                      type="text"
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      placeholder="Enter your name..."
                      className="flex-1 bg-emerald-950/70 border border-emerald-700/70 rounded-xl px-4 py-3 text-amber-50 placeholder-emerald-500/80 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all text-sm"
                      autoFocus
                    />
                    <button 
                      id="welcome-submit-name-btn"
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-emerald-950 px-4 py-3 rounded-xl transition-all font-bold flex items-center justify-center shadow-lg shadow-amber-500/20"
                      title="Continue"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>

                  <button
                    id="welcome-enter-app-btn"
                    type="button"
                    onClick={handleNext}
                    className="w-full mt-2 py-3 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 active:scale-95 border border-emerald-600/50 text-emerald-100 font-semibold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <BookOpen size={16} />
                    <span>Enter Shia Markaz</span>
                  </button>
                </form>
                
                <div className="mt-4 text-center">
                  <button 
                    id="welcome-skip-btn"
                    type="button" 
                    onClick={handleNext}
                    className="text-xs text-emerald-400 hover:text-emerald-200 transition-colors"
                  >
                    Skip and start reading
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
