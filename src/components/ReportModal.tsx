import { useState } from 'react';
import { Flag, X, ShieldAlert, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { reportDiscussion } from '../utils/guestAuth';
import { hapticNotification } from '../utils/haptics';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  discussionId: string;
  authorName: string;
  onReportSuccess: () => void;
}

const REPORT_REASONS = [
  { id: 'inappropriate', label: 'Inappropriate or offensive content' },
  { id: 'harassment', label: 'Harassment, hate speech, or abuse' },
  { id: 'spam', label: 'Spam, advertisement, or repetitive text' },
  { id: 'misinformation', label: 'Misleading religious information or distortion' },
  { id: 'other', label: 'Other policy violation' },
];

export default function ReportModal({
  isOpen,
  onClose,
  discussionId,
  authorName,
  onReportSuccess,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('inappropriate');
  const [customText, setCustomText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reasonText = selectedReason === 'other' && customText.trim()
      ? customText.trim()
      : REPORT_REASONS.find(r => r.id === selectedReason)?.label || selectedReason;

    reportDiscussion(discussionId, reasonText);
    hapticNotification('SUCCESS');
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      onReportSuccess();
      onClose();
    }, 1800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            key="report-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onClose}
          />
          <motion.div
            key="report-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden z-10"
          >
            {submitted ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Reflection Reported
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto">
                  Thank you for keeping our community safe. This comment has been hidden from your view and submitted for moderator review within 24 hours.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                    <ShieldAlert size={20} />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Report Comment
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
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Why are you reporting this reflection by <strong className="text-slate-700 dark:text-slate-200">{authorName}</strong>?
                  </p>

                  <div className="space-y-2">
                    {REPORT_REASONS.map((r) => (
                      <label
                        key={r.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedReason === r.id
                            ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 font-medium'
                            : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="report-reason"
                          value={r.id}
                          checked={selectedReason === r.id}
                          onChange={(e) => setSelectedReason(e.target.value)}
                          className="text-rose-600 focus:ring-rose-500"
                        />
                        <span>{r.label}</span>
                      </label>
                    ))}
                  </div>

                  {selectedReason === 'other' && (
                    <textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Please describe the issue..."
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-rose-500"
                      rows={2}
                      required
                    />
                  )}

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
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all shadow-xs"
                    >
                      Submit Report
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
