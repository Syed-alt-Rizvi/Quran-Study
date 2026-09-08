import { useState } from 'react';
import { User, X, Check, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { saveGuestProfile, acceptGuidelines, GuestProfile } from '../utils/guestAuth';
import { hapticNotification } from '../utils/haptics';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: GuestProfile) => void;
}

export default function SignInModal({ isOpen, onClose, onSuccess }: SignInModalProps) {
  const [name, setName] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a display name');
      return;
    }
    if (!agreed) {
      setError('You must agree to the Community Guidelines to post');
      return;
    }

    const profile = saveGuestProfile(name.trim());
    acceptGuidelines();
    hapticNotification('SUCCESS');
    onSuccess(profile);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            key="signin-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onClose}
          />
          <motion.div
            key="signin-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <User size={20} />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Join Quran Reflections
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Choose a Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="e.g. Student of Quran, Ali, Fatima"
                  maxLength={30}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500"
                  autoFocus
                />
                {error && <p className="text-[11px] text-rose-500 mt-1">{error}</p>}
              </div>

              {/* Community Guidelines Agreement (Mandatory for Google Play UGC) */}
              <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck size={16} />
                  <span>Community Guidelines & Safety</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Reflections must remain respectful and scholarly. Obscene language, harassment, hate speech, sectarian slander, or commercial spam is strictly prohibited and subject to immediate removal and author bans.
                </p>
                <label className="flex items-start gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 rounded-sm text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
                    I agree to the Community Guidelines & Terms of Service
                  </span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!agreed}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-xs ${
                    agreed
                      ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                      : 'bg-slate-400 cursor-not-allowed'
                  }`}
                >
                  Confirm & Join
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
