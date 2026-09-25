import React, { useState } from 'react';
import { Download, Share2, PlusSquare, Smartphone, Check, X, Sparkles, WifiOff, Volume2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { hapticImpact } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [installing, setInstalling] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    hapticImpact(ImpactStyle.Medium);
    if (isInstallable) {
      setInstalling(true);
      const outcome = await install();
      setInstalling(false);
      if (outcome === 'accepted') {
        onClose();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with App Branding */}
        <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white text-center">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/90 transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>

          <div className="w-16 h-16 mx-auto rounded-2xl bg-white p-1 shadow-lg ring-2 ring-emerald-300/40 mb-3 overflow-hidden">
            <img src="/pwa-192x192.png" alt="Shia Markaz" className="w-full h-full object-cover rounded-xl" />
          </div>

          <h2 className="text-xl font-bold tracking-tight">Download Shia Markaz</h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            Install the web application directly onto your Android or iPhone device
          </p>
        </div>

        {/* Benefits List */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <Sparkles size={18} className="mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
              <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Native Feel</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400">Full-screen UI</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <WifiOff size={18} className="mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
              <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Works Offline</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400">Cached Quran</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <Volume2 size={18} className="mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
              <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Audio Support</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400">Continuous playback</p>
            </div>
          </div>

          {/* Conditional Install Instructions */}
          {isInstalled ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center">
              <div className="flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                <Check size={18} />
                <span>Application is already installed!</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                You are currently running Shia Markaz in standalone mode.
              </p>
            </div>
          ) : isInstallable ? (
            /* Android / Chromium 1-Click Install */
            <div className="space-y-3">
              <button
                onClick={handleInstallClick}
                disabled={installing}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Download size={18} />
                <span>{installing ? 'Installing...' : 'Install on Device (1-Tap)'}</span>
              </button>
              <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
                Adds Shia Markaz directly to your home screen with zero app store delays.
              </p>
            </div>
          ) : isIOS ? (
            /* iOS Safari Step-by-Step Instructions */
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
                <Smartphone size={15} className="text-emerald-600 dark:text-emerald-400" />
                <span>How to Install on iPhone / iPad (Safari)</span>
              </h3>
              
              <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    Tap the <strong>Share</strong> button <Share2 size={13} className="inline text-blue-500 mx-0.5" /> in the bottom toolbar of Safari.
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    Scroll down and select <strong>Add to Home Screen</strong> <PlusSquare size={13} className="inline text-slate-700 dark:text-slate-200 mx-0.5" />.
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    Tap <strong>Add</strong> in the top right corner. The Shia Markaz icon will appear on your home screen!
                  </div>
                </li>
              </ol>
            </div>
          ) : (
            /* Android / Generic Browser Fallback Instructions */
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
                <Smartphone size={15} className="text-emerald-600 dark:text-emerald-400" />
                <span>Manual Installation Steps</span>
              </h3>
              
              <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                  <span>Tap your browser's menu (three dots <strong>⋮</strong> in Chrome or Edge).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                  <span>Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.</span>
                </li>
              </ol>
            </div>
          )}

          <div className="pt-1">
            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
