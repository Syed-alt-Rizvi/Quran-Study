import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';
import { hapticImpact } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '',
  variant = 'compact'
}) => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already running inside installed standalone mode, suppress
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    hapticImpact(ImpactStyle.Light);
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') return;
    }
    // If not directly installable via prompt (e.g. iOS Safari), show the guided modal
    setIsModalOpen(true);
  };

  return (
    <>
      {variant === 'compact' && (
        <button
          onClick={handleClick}
          title="Download app to your phone"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95 ${className}`}
        >
          <Download size={13} className="shrink-0 animate-bounce" />
          <span className="truncate">Install App</span>
        </button>
      )}

      {variant === 'full' && (
        <button
          onClick={handleClick}
          className={`w-full flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-xs ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Download size={16} />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">Download Web App</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Add to Android or iPhone Home Screen</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-lg shrink-0">
            Install
          </span>
        </button>
      )}

      <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
