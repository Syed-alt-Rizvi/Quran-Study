import React, { useState } from 'react';
import { Smartphone, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';
import { hapticImpact } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';
import { useSettingsStore } from '../store';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '',
  variant = 'compact'
}) => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const { appLanguage } = useSettingsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isUrdu = appLanguage === 'ur';

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
          title={isUrdu ? 'موبائل پر انسٹال کریں' : 'Install app to your home screen'}
          className={`group relative inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-full liquid-glass border border-amber-400/40 dark:border-amber-400/25 text-slate-800 dark:text-amber-100 hover:border-amber-400/70 hover:text-amber-600 dark:hover:text-amber-200 transition-all duration-200 shadow-2xs hover:shadow-[0_2px_12px_-2px_rgba(251,191,36,0.25)] active:scale-95 cursor-pointer select-none ${className}`}
        >
          {/* Subtle golden ambient glimmer pip */}
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-300 ring-2 ring-amber-400/25 shrink-0" />
          <Smartphone size={12} strokeWidth={1.6} className="text-amber-600 dark:text-amber-400 shrink-0 transition-transform group-hover:-translate-y-0.5" />
          <span className="font-sans tracking-wide leading-none">{isUrdu ? 'ایپ انسٹال کریں' : 'Install App'}</span>
        </button>
      )}

      {variant === 'full' && (
        <button
          onClick={handleClick}
          className={`w-full flex items-center justify-between p-3.5 rounded-2xl liquid-glass-card glass-amber-fusion border border-amber-400/30 dark:border-amber-500/20 text-slate-900 dark:text-slate-100 font-medium text-xs hover:border-amber-400/60 transition-all shadow-xs active:scale-[0.99] cursor-pointer ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl liquid-glass border border-amber-400/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
              <Smartphone size={16} strokeWidth={1.6} />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                {isUrdu ? 'موبائل ایپ انسٹال کریں' : 'Install Shia Markaz'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                {isUrdu ? 'ہوم اسکرین پر شامل کریں (آف لائن رسائی)' : 'Add to Home Screen for fast offline access'}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-semibold rounded-lg shrink-0 shadow-xs transition-colors">
            {isUrdu ? 'انسٹال' : 'Install'}
          </span>
        </button>
      )}

      <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
