import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useSettingsStore } from '../store';
import { BookOpen, X, ArrowLeft } from 'lucide-react';
import { registerModal } from '../utils/modalBackHandler';
import { getArabicFontFamily } from '../utils/arabicFonts';

export default function DuaScreen({ 
  onContinueExit,
  onCancel 
}: { 
  key?: string; 
  onContinueExit: () => void;
  onCancel?: () => void;
}) {
  const isDarkMode = useSettingsStore(s => s.isDarkMode);
  const arabicFont = useSettingsStore(s => s.arabicFont);

  useEffect(() => {
    if (onCancel) {
      return registerModal(onCancel);
    }
  }, [onCancel]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-y-auto"
    >
      {/* Root-Safe Top Header */}
      <header className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 app-header-safe pb-2.5 sm:pb-3 gpu-layer">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                onClick={onCancel}
                className="p-2 -ml-2 text-slate-600 hover:text-emerald-600 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Return to Quran"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              Dua e Khatm e Quraan
            </span>
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 -mr-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Return to App"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full py-8 relative">
        <h2 className="text-xl md:text-2xl font-bold text-emerald-700 dark:text-emerald-500 mb-8 text-center uppercase tracking-widest font-serif">
          Dua e Khatm e Quraan
        </h2>
        
        <div className="space-y-8 text-center w-full">
          <p 
            dir="rtl"
            lang="ar"
            className="ayah-arabic-text font-arabic text-2xl sm:text-3xl text-emerald-800 dark:text-emerald-400 leading-normal font-normal text-center"
            style={{ fontFamily: getArabicFontFamily(arabicFont) }}
          >
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
          
          <p 
            dir="rtl"
            lang="ar"
            className="ayah-arabic-text font-arabic text-xl sm:text-2xl leading-[2.5] md:leading-[2.6] text-slate-800 dark:text-slate-100 px-2 sm:px-4 text-center font-normal" 
            style={{ fontFamily: getArabicFontFamily(arabicFont) }}
          >
            اَللّٰهُمَّ اِنِّي قَدْ قَرَاْتُ مَا قَضَيْتَ مِنْ كِتَابِكَ الَّذِيْ اَنْزَلْتَهُ عَلٰى نَبِيِّكَ الصَّادِقِ صَلَّى اللهُ عَلَيْهِ وَاٰلِهِ فَلَكَ الْحَمْدُ رَبَّنَا اَللّٰهُمَّ اجْعَلْنِيْ مِمَّنْ يُحِلُّ حَلَالَهُ، وَيُحَرِّمُ حَرَامَهُ، وَيُؤْمِنُ بِمُحْكَمِهِ وَمُتَشَابِهِهِ، وَاجْعَلْهُ لِيْ اُنْسًا فِيْ قَبْرِيْ، وَاُنْسًا فِيْ حَشْرِيْ وَاجْعَلْنِيْ مِمَّنْ تُرَقِّيْهِ بِكُلِّ اٰيَةٍ قَرَاَهَا دَرَجَةً فِيْ اَعْلٰى عِلِّيِّيْنَ،
          </p>

          <p 
            dir="rtl"
            lang="ar"
            className="ayah-arabic-text font-arabic text-2xl sm:text-3xl text-emerald-800 dark:text-emerald-400 mt-6 font-normal text-center"
            style={{ fontFamily: getArabicFontFamily(arabicFont) }}
          >
            اٰمِيْنَ رَبَّ الْعَالَمِيْنَ۔
          </p>
        </div>

        <div className="mt-12 pt-6 border-t-[0.5px] border-slate-200 dark:border-slate-800 w-full flex flex-col sm:flex-row items-center justify-center gap-3 pb-safe">
          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <BookOpen size={18} />
              <span>Return to Quran</span>
            </button>
          )}
          <button
            onClick={onContinueExit}
            className="w-full sm:w-auto px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-medium transition-colors cursor-pointer"
          >
            Close App
          </button>
        </div>
      </div>
    </motion.div>
  );
}
