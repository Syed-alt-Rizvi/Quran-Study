import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  User, 
  BookOpen, 
  Flag, 
  UserX, 
  CheckCircle2, 
  Reply, 
  Loader2, 
  ShieldCheck, 
  CornerDownRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { registerModal } from '../utils/modalBackHandler';
import { hapticImpact, hapticNotification, hapticSelection } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';
import { GuestProfile, saveGuestProfile, acceptGuidelines, hasAcceptedGuidelines } from '../utils/guestAuth';
import { useSettingsStore } from '../store';

export interface DiscussionItem {
  id: string;
  content: string;
  author: string;
  email: string | null;
  userId: string;
  createdAt: string;
  replyToId: string | null;
  isModerated: boolean;
  isOfficialAnswer?: boolean;
}

export interface DiscussionRow {
  discussion: DiscussionItem;
  ayahRef: {
    surahNumber: number;
    ayahNumber: number;
    surahName: string | null;
  } | null;
}

interface ThreadReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentRow: DiscussionRow;
  replies: DiscussionRow[];
  currentUser: GuestProfile | null;
  onSaveProfile: (profile: GuestProfile) => void;
  onSubmitReply: (content: string, replyToId: string, replyAuthor?: string) => Promise<boolean>;
  onReport: (discussionId: string, authorName: string) => void;
  onBlock: (userId: string, authorName: string) => void;
  initialReplyTarget?: string;
}

export default function ThreadReplyModal({
  isOpen,
  onClose,
  parentRow,
  replies,
  currentUser,
  onSaveProfile,
  onSubmitReply,
  onReport,
  onBlock,
  initialReplyTarget
}: ThreadReplyModalProps) {
  const { userName } = useSettingsStore();

  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingToAuthor, setReplyingToAuthor] = useState<string | null>(initialReplyTarget || null);
  
  // Quick onboarding state if user has no display name yet
  const [quickName, setQuickName] = useState(currentUser?.displayName || userName || '');
  const [agreedGuidelines, setAgreedGuidelines] = useState(hasAcceptedGuidelines());
  const [showNameError, setShowNameError] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const repliesEndRef = useRef<HTMLDivElement>(null);

  // Register Android back button and ESC key
  useEffect(() => {
    if (isOpen) {
      return registerModal(onClose);
    }
  }, [isOpen, onClose]);

  // Sync initial target and focus
  useEffect(() => {
    if (isOpen) {
      if (initialReplyTarget) {
        setReplyingToAuthor(initialReplyTarget);
        setReplyText(`@${initialReplyTarget} `);
      } else {
        setReplyingToAuthor(parentRow.discussion.author);
        setReplyText('');
      }
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 250);
    }
  }, [isOpen, initialReplyTarget, parentRow.discussion.author]);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || submitting) return;

    // Check if user needs to set a display name
    let activeUser = currentUser;
    if (!activeUser || !activeUser.displayName?.trim()) {
      const trimmedName = quickName.trim();
      if (!trimmedName) {
        setShowNameError(true);
        hapticNotification('WARNING');
        return;
      }
      // Create guest profile
      activeUser = saveGuestProfile(trimmedName);
      acceptGuidelines();
      setAgreedGuidelines(true);
      onSaveProfile(activeUser);
      setShowNameError(false);
    }

    try {
      setSubmitting(true);
      hapticImpact(ImpactStyle.Light);
      
      const success = await onSubmitReply(
        replyText.trim(),
        parentRow.discussion.id,
        activeUser.displayName
      );

      if (success) {
        setReplyText('');
        setReplyingToAuthor(parentRow.discussion.author);
        hapticNotification('SUCCESS');
        setTimeout(() => {
          repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } catch (err) {
      console.error('[ThreadReplyModal] Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyToSpecificAuthor = (authorName: string) => {
    hapticSelection();
    setReplyingToAuthor(authorName);
    setReplyText((prev) => {
      const clean = prev.replace(/^@[a-zA-Z0-9_\u0600-\u06FF\s]+\s/, '');
      return `@${authorName} ${clean}`;
    });
    textareaRef.current?.focus();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
        {/* Backdrop click to close */}
        <div 
          onClick={onClose}
          className="absolute inset-0 cursor-pointer"
          aria-hidden="true"
        />

        {/* Modal Sheet Container */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.98 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl overflow-hidden z-10"
        >
          {/* Mobile Drag Indicator */}
          <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden" />

          {/* Modal Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Reply size={16} />
              </div>
              <div className="truncate min-w-0">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 truncate">
                  Discussion Thread
                </h3>
                {parentRow.ayahRef && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate flex items-center gap-1">
                    <BookOpen size={12} className="shrink-0" />
                    <span>Qur'an {parentRow.ayahRef.surahNumber}:{parentRow.ayahRef.ayahNumber}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close thread dialog"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Thread Content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 custom-scrollbar">
            
            {/* Root Parent Message Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 relative">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {parentRow.discussion.author?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {parentRow.discussion.author}
                      </span>
                      {parentRow.discussion.isOfficialAnswer && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                          <CheckCircle2 size={11} /> Official Answer
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(parentRow.discussion.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Safety actions on parent */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onReport(parentRow.discussion.id, parentRow.discussion.author)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Report discussion"
                  >
                    <Flag size={14} />
                  </button>
                  {parentRow.discussion.userId && currentUser?.userId !== parentRow.discussion.userId && (
                    <button
                      type="button"
                      onClick={() => onBlock(parentRow.discussion.userId, parentRow.discussion.author)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      title="Block user"
                    >
                      <UserX size={14} />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {parentRow.discussion.content}
              </p>
            </div>

            {/* Thread Replies Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Replies ({replies.length})
                </span>
                <span className="text-[11px] text-slate-400">
                  Ahlulbayt Discourse Guidelines
                </span>
              </div>

              {replies.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                  <p>No replies yet to this thought.</p>
                  <p className="mt-1 text-slate-500">Be the first to share an authentic reflection or question!</p>
                </div>
              ) : (
                <div className="space-y-3 pl-2 sm:pl-3 border-l-2 border-emerald-500/20 dark:border-emerald-500/30">
                  {replies.map((replyRow, rIdx) => {
                    const isOwnReply = currentUser?.userId === replyRow.discussion.userId;
                    return (
                      <div 
                        key={`modal-reply-${replyRow.discussion.id || rIdx}-${rIdx}`}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                              {replyRow.discussion.author?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="truncate">
                              <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate block">
                                {replyRow.discussion.author} {isOwnReply && <span className="text-[10px] text-emerald-600 font-normal">(You)</span>}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(replyRow.discussion.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Inline Reply-To button */}
                            <button
                              type="button"
                              onClick={() => handleReplyToSpecificAuthor(replyRow.discussion.author)}
                              className="px-2 py-1 rounded-md text-[11px] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-medium transition-colors flex items-center gap-1 cursor-pointer"
                              title={`Reply to ${replyRow.discussion.author}`}
                            >
                              <CornerDownRight size={11} />
                              <span>Reply</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onReport(replyRow.discussion.id, replyRow.discussion.author)}
                              className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                              title="Report reply"
                            >
                              <Flag size={12} />
                            </button>
                            {replyRow.discussion.userId && !isOwnReply && (
                              <button
                                type="button"
                                onClick={() => onBlock(replyRow.discussion.userId, replyRow.discussion.author)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                                title="Block user"
                              >
                                <UserX size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed mt-1">
                          {replyRow.discussion.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
              <div ref={repliesEndRef} />
            </div>

          </div>

          {/* Sticky Bottom Reply Composer */}
          <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md">
            
            {/* Context Banner: Who the user is replying to */}
            {replyingToAuthor && (
              <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg mb-2 border border-emerald-200/50 dark:border-emerald-800/40">
                <span className="truncate">Replying to <strong>@{replyingToAuthor}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setReplyingToAuthor(parentRow.discussion.author);
                    setReplyText('');
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-2 cursor-pointer font-bold"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Frictionless display-name prompt if unregistered */}
            {(!currentUser || !currentUser.displayName?.trim()) && (
              <div className="mb-2.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1.5">
                  <User size={13} />
                  <span>Choose your display name to participate:</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={quickName}
                    onChange={(e) => {
                      setQuickName(e.target.value);
                      if (showNameError) setShowNameError(false);
                    }}
                    placeholder="e.g. Ali Reza, Fatima..."
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border ${
                      showNameError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-700'
                    } focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-slate-100`}
                  />
                </div>
                {showNameError && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">Please enter a display name to post your reply.</p>
                )}
                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                  <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
                  <span>By replying, you agree to respectful Islamic Community Guidelines.</span>
                </div>
              </div>
            )}

            {/* Input form */}
            <form onSubmit={handleSend} className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={`Write your reply to ${replyingToAuthor || parentRow.discussion.author}...`}
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none custom-scrollbar"
                />
                <span className="absolute bottom-1.5 right-2 text-[10px] text-slate-400 font-mono select-none">
                  {replyText.length > 0 ? `${replyText.length} chars` : 'Ctrl+Enter to send'}
                </span>
              </div>

              <button
                type="submit"
                disabled={!replyText.trim() || submitting}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0 cursor-pointer mb-0.5"
                title="Send Reply"
                aria-label="Send Reply"
              >
                {submitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} className="ml-0.5" />
                )}
              </button>
            </form>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
