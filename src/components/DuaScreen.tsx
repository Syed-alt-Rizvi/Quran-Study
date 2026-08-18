import { motion } from 'motion/react';
import { useSettingsStore } from '../store';

export default function DuaScreen({ onContinueExit }: { key?: string; onContinueExit: () => void }) {
  const { isDarkMode } = useSettingsStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-y-auto"
    >
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full py-12">
        <h2 className="text-xl md:text-2xl font-bold text-emerald-700 dark:text-emerald-500 mb-12 text-center uppercase tracking-widest">
          Dua e Khatm e Quraan
        </h2>
        
        <div className="space-y-10 text-center w-full">
          <p className="font-arabic text-3xl md:text-4xl text-emerald-800 dark:text-emerald-400">
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
          
          <p className="font-arabic text-2xl md:text-3xl leading-[2.5] md:leading-[2.5] text-slate-800 dark:text-slate-100 px-4 text-justify" dir="rtl">
            اَللّٰهُمَّ اِنِّي قَدْ قَرَاْتُ مَا قَضَيْتَ مِنْ كِتَابِكَ الَّذِيْ اَنْزَلْتَهُ عَلٰى نَبِيِّكَ الصَّادِقِ صَلَّى اللهُ عَلَيْهِ وَاٰلِهِ فَلَكَ الْحَمْدُ رَبَّنَا اَللّٰهُمَّ اجْعَلْنِيْ مِمَّنْ يُحِلُّ حَلَالَهُ، وَيُحَرِّمُ حَرَامَهُ، وَيُؤْمِنُ بِمُحْكَمِهِ وَمُتَشَابِهِهِ، وَاجْعَلْهُ لِيْ اُنْسًا فِيْ قَبْرِيْ، وَاُنْسًا فِيْ حَشْرِيْ وَاجْعَلْنِيْ مِمَّنْ تُرَقِّيْهِ بِكُلِّ اٰيَةٍ قَرَاَهَا دَرَجَةً فِيْ اَعْلٰى عِلِّيِّيْنَ،
          </p>

          <p className="font-arabic text-3xl md:text-4xl text-emerald-800 dark:text-emerald-400 mt-8">
            اٰمِيْنَ رَبَّ الْعَالَمِيْنَ۔
          </p>
        </div>

        <div className="mt-16 pt-8 border-t-[0.5px] border-slate-200 dark:border-slate-800 w-full flex justify-center">
          <button
            onClick={onContinueExit}
            className="px-8 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-full font-medium transition-colors"
          >
            Close App
          </button>
        </div>
      </div>
    </motion.div>
  );
}
