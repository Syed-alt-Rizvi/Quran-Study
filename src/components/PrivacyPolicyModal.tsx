import { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, Trash2, ExternalLink, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { deleteGuestAccountAndAllData } from '../utils/guestAuth';
import { useSettingsStore } from '../store';
import { hapticNotification } from '../utils/haptics';
import { registerModal } from '../utils/modalBackHandler';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms' | 'deletion' | 'licenses';
}

export default function PrivacyPolicyModal({
  isOpen,
  onClose,
  initialTab = 'privacy',
}: PrivacyPolicyModalProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'deletion' | 'licenses'>(initialTab);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [dataDeleted, setDataDeleted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      return registerModal(onClose);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const handleDeleteAllData = () => {
    deleteGuestAccountAndAllData();
    hapticNotification('SUCCESS');
    setDataDeleted(true);
    setTimeout(() => {
      setDataDeleted(false);
      setDeleteConfirmOpen(false);
      window.location.reload();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="privacy-modal-portal" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div
            className="absolute inset-0"
            onClick={onClose}
          />
          <motion.div
            key="privacy-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden z-10"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={22} />
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base sm:text-lg">
                  Legal & Data Safety
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-4 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('privacy')}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  activeTab === 'privacy'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setActiveTab('terms')}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  activeTab === 'terms'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Terms & UGC
              </button>
              <button
                onClick={() => setActiveTab('deletion')}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  activeTab === 'deletion'
                    ? 'border-rose-600 text-rose-700 dark:text-rose-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Data Deletion
              </button>
              <button
                onClick={() => setActiveTab('licenses')}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  activeTab === 'licenses'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Open Source
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {activeTab === 'privacy' && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200">
                    <strong>Zero Ads • Zero Trackers • 100% Free Islamic Resource</strong>
                    <p className="mt-1 text-[11px] opacity-90">
                      Shia Quran does not sell your data, display commercial ads, or track you across apps.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
                      1. Information Collected
                    </h4>
                    <p>
                      <strong>Local Storage:</strong> Your bookmarks, reading position, saved notes, custom Arabic font selections, and recitation speed are stored entirely on your local device.
                    </p>
                    <p className="mt-1">
                      <strong>Community Reflections:</strong> When you share an Ayah reflection, your chosen display name and comment text are stored securely in Google Cloud Firestore solely to render the community discussion feed.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
                      2. Cloud Infrastructure & Third-Party APIs
                    </h4>
                    <p>
                      We utilize Google Firebase Firestore for storing reflections and moderation reports, and reputable Quran audio CDNs (EveryAyah, AlQuran Cloud) to stream recitations.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
                      3. Developer Contact
                    </h4>
                    <p>
                      Developer: <strong>Syed Murtaza Razavee</strong><br />
                      Email: <a href="mailto:Syedmurtazarazavee@gmail.com" className="text-emerald-600 dark:text-emerald-400 underline">Syedmurtazarazavee@gmail.com</a>
                    </p>
                  </div>

                  <div className="pt-2">
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <span>Open Web Privacy Policy URL</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              )}

              {activeTab === 'terms' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
                      Community Guidelines & User Conduct
                    </h4>
                    <p>
                      This application is intended for reverent, peaceful study of the Quran and Tafseer.
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                    <strong className="block mb-1 font-semibold">Strict UGC Standards:</strong>
                    <ul className="list-disc pl-4 space-y-1 text-[11px]">
                      <li>No hate speech, bigotry, or sectarian provocation.</li>
                      <li>No harassment, abusive commentary, or profane speech.</li>
                      <li>No spam, scam links, or commercial solicitation.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
                      Content Moderation & User Safety
                    </h4>
                    <p>
                      Every user has the right to report inappropriate comments and mute/block authors. Our moderation team reviews all flagged content within 24 hours and takes strict action including permanent device blocking.
                    </p>
                  </div>

                  <div className="pt-2">
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <span>Open Web Terms URL</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              )}

              {activeTab === 'deletion' && (
                <div className="space-y-4">
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200">
                    <strong>Google Play User Data Deletion Compliance</strong>
                    <p className="mt-1 text-[11px] opacity-90">
                      You have full rights to erase all stored data, your guest account profile, and reset your reading records at any time.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Delete In-App Data & Profile
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Pressing the button below will immediately wipe your guest profile ID, local bookmarks, reading progress, and personal Tafseer notes.
                    </p>

                    {!deleteConfirmOpen ? (
                      <button
                        onClick={() => setDeleteConfirmOpen(true)}
                        className="mt-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
                      >
                        <Trash2 size={16} />
                        <span>Delete My Profile & Local Data</span>
                      </button>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 space-y-3">
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                          <AlertTriangle size={18} />
                          <span>Are you absolutely sure? This cannot be undone.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleDeleteAllData}
                            disabled={dataDeleted}
                            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                          >
                            {dataDeleted ? 'Data Wiped!' : 'Yes, Delete Everything'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmOpen(false)}
                            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
                      Request Cloud Database Purge
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      To delete cloud reflections you previously submitted, email us at <a href="mailto:Syedmurtazarazavee@gmail.com" className="text-emerald-600 dark:text-emerald-400 underline">Syedmurtazarazavee@gmail.com</a> or visit our online deletion portal:
                    </p>
                    <a
                      href="/data-deletion"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mt-2"
                    >
                      <span>Web Account Deletion Portal</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              )}

              {activeTab === 'licenses' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                    <strong>Open Source Software & Font Attributions</strong>
                    <p className="mt-1 text-[11px] opacity-90">
                      Shia Quran proudly incorporates open-source software libraries and freely licensed Arabic typography in compliance with their respective licenses.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">React & Vite</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">MIT License</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Copyright &copy; Meta Platforms, Inc. and Vite contributors.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">Capacitor (@capacitor/*)</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">MIT License</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Copyright &copy; Drifty Co. / Ionic. Provides native mobile bridges for Android and iOS.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">Lucide Icons</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">ISC License</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Copyright &copy; Lucide Contributors. Feather Icons community fork.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">Amiri & Amiri Quran Fonts</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">SIL OFL 1.1</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Copyright &copy; 2010-2022 Khaled Hosny. Classical Naskh Quranic typeface.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">Scheherazade New & Lateef Fonts</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">SIL OFL 1.1</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Copyright &copy; SIL International. Designed for Arabic script legibility.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">AlQuran Cloud & EveryAyah</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">Open Data</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Quran text, translations, and verse-by-verse recitation audio services.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
