import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink } from 'lucide-react';
import { hapticImpact } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function TafseerAlKautharViewer({ isOpen, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="tafseer-alkauthar-viewer-modal"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-900 flex flex-col"
        >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                onClose();
              }}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={24} className="text-slate-700 dark:text-slate-300" />
            </button>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Tafseer Al-Kauthar</h2>
          </div>
          <a
            href="https://archive.org/details/tafseer-alkauthar"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => hapticImpact(ImpactStyle.Light)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 transition-colors"
          >
            Open in Browser <ExternalLink size={16} />
          </a>
        </div>

        {/* Iframe content */}
        <div className="flex-1 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
          <iframe 
            src="https://archive.org/embed/tafseer-alkauthar" 
            className="w-full h-full border-0 absolute inset-0"
            allowFullScreen
          ></iframe>
        </div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
