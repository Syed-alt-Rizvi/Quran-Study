import { useState, useEffect } from 'react';
import { X, Send, Loader2, User, LogIn, Flag, UserX, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Ayah, SurahDetail } from '../api';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../utils/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, serverTimestamp, where, deleteDoc, doc } from 'firebase/firestore';
import {
  getGuestProfile,
  saveGuestProfile,
  GuestProfile,
  isUserBlocked,
  blockUserId,
  isDiscussionReported,
} from '../utils/guestAuth';
import { hapticNotification } from '../utils/haptics';
import { registerModal } from '../utils/modalBackHandler';
import SignInModal from './SignInModal';
import ReportModal from './ReportModal';

interface DiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ayah: Ayah;
  surah: SurahDetail;
}

function formatDiscussionDate(createdAt: any): string {
  if (!createdAt) return 'Just now';
  try {
    if (typeof createdAt.toDate === 'function') {
      return createdAt.toDate().toLocaleString();
    }
    if (typeof createdAt.toMillis === 'function') {
      return new Date(createdAt.toMillis()).toLocaleString();
    }
    if (typeof createdAt === 'number') {
      return new Date(createdAt).toLocaleString();
    }
    if (typeof createdAt === 'string') {
      const parsed = new Date(createdAt);
      return !isNaN(parsed.getTime()) ? parsed.toLocaleString() : createdAt;
    }
  } catch (e) {}
  return 'Just now';
}

export default function DiscussionModal({ isOpen, onClose, ayah, surah }: DiscussionModalProps) {
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<GuestProfile | null>(getGuestProfile());
  const [author, setAuthor] = useState(currentUser?.displayName || '');
  const [blockedVersion, setBlockedVersion] = useState(0);

  useEffect(() => {
    if (isOpen) {
      return registerModal(onClose);
    }
  }, [isOpen, onClose]);

  // Modals state
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [blockConfirm, setBlockConfirm] = useState<{ userId: string; authorName: string } | null>(null);
  const [reportModal, setReportModal] = useState<{
    isOpen: boolean;
    discussionId: string;
    authorName: string;
  }>({
    isOpen: false,
    discussionId: '',
    authorName: '',
  });

  useEffect(() => {
    if (blockConfirm) {
      return registerModal(() => setBlockConfirm(null));
    }
  }, [blockConfirm]);

  useEffect(() => {
    if (currentUser && !author) {
      setAuthor(currentUser.displayName || "Anonymous");
    }
  }, [currentUser]);

  // Load draft
  useEffect(() => {
    if (isOpen) {
      const draft = localStorage.getItem(`draft-discussion-${surah.number}-${ayah.numberInSurah}`);
      if (draft) setContent(draft);
    }
  }, [isOpen, surah.number, ayah.numberInSurah]);

  // Save draft
  useEffect(() => {
    if (isOpen) {
      localStorage.setItem(`draft-discussion-${surah.number}-${ayah.numberInSurah}`, content);
    }
  }, [content, isOpen, surah.number, ayah.numberInSurah]);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    const q = query(
      collection(db, 'discussions'), 
      where('ayahRef.surahNumber', '==', surah.number),
      where('ayahRef.ayahNumber', '==', ayah.numberInSurah)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        discussion: {
          id: doc.id,
          ...doc.data()
        }
      }));
      // Sort on client to avoid Firestore composite index requirement
      docs.sort((a: any, b: any) => {
        const tA = a.discussion.createdAt?.toMillis ? a.discussion.createdAt.toMillis() : (a.discussion.createdAt || 0);
        const tB = b.discussion.createdAt?.toMillis ? b.discussion.createdAt.toMillis() : (b.discussion.createdAt || 0);
        return tB - tA;
      });
      setDiscussions(docs);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, surah.number, ayah.numberInSurah]);

  const handleSignIn = () => {
    setShowSignInModal(true);
  };

  const handleBlockAuthor = (userId: string, authorName: string) => {
    if (!userId) return;
    setBlockConfirm({ userId, authorName });
  };

  const confirmBlock = () => {
    if (!blockConfirm) return;
    blockUserId(blockConfirm.userId);
    hapticNotification('SUCCESS');
    setBlockedVersion(v => v + 1);
    setBlockConfirm(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!currentUser) {
      setShowSignInModal(true);
      return;
    }
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'discussions'), {
        content: content.trim(),
        author: currentUser.displayName || 'Anonymous',
        userId: currentUser.userId,
        createdAt: serverTimestamp(),
        isModerated: false,
        ayahRef: {
          surahNumber: surah.number,
          ayahNumber: ayah.numberInSurah,
          surahName: surah.name
        }
      });
      setContent('');
      localStorage.removeItem(`draft-discussion-${surah.number}-${ayah.numberInSurah}`);
      hapticNotification('SUCCESS');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter out blocked users and reported items
  const visibleDiscussions = discussions.filter(
    (d: any) => !isUserBlocked(d.discussion?.userId) && !isDiscussionReported(d.discussion?.id)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key={`modal-overlay-${surah.number || 's'}-${ayah.numberInSurah || 'a'}`}
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b-[0.5px] border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Ayah Reflections</h3>
                <p className="text-xs text-slate-500">Surah {surah.name} ({surah.number}), Ayah {ayah.numberInSurah}</p>
              </div>
              <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* Moderation safety notice */}
            <div className="px-4 py-2 bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center gap-2 text-[11px] text-emerald-800 dark:text-emerald-300">
              <ShieldCheck size={14} className="flex-shrink-0 text-emerald-600" />
              <span>Community Reflections are moderated. Tap the flag on any comment to report violations.</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 size={24} className="animate-spin text-slate-400" />
                </div>
              ) : visibleDiscussions.length === 0 ? (
                <p className="text-center text-slate-500 py-10 text-xs">No reflections yet for this Ayah. Be the first to reflect!</p>
              ) : (
                visibleDiscussions.map((d: any, dIdx: number) => (
                  <div key={`modal-disc-${d.id || d.discussion?.id || dIdx}-${dIdx}`} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400">
                          <User size={14} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-slate-900 dark:text-slate-100">{d.discussion.author}</span>
                            {d.discussion.isOfficialAnswer && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                                <CheckCircle2 size={10} /> Official
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">
                            {formatDiscussionDate(d.discussion.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Flag / Block actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setReportModal({
                            isOpen: true,
                            discussionId: d.discussion.id,
                            authorName: d.discussion.author,
                          })}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Report reflection"
                        >
                          <Flag size={14} />
                        </button>
                        {d.discussion.userId && currentUser?.userId !== d.discussion.userId && (
                          <button
                            onClick={() => handleBlockAuthor(d.discussion.userId, d.discussion.author)}
                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                            title="Block author"
                          >
                            <UserX size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">
                      {d.discussion.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t-[0.5px] border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              {!currentUser ? (
                 <div className="flex flex-col items-center justify-center text-center py-2">
                   <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Choose a display name and agree to Community Guidelines to reflect.</p>
                   <button onClick={handleSignIn} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs">
                     <LogIn size={14} />
                     <span>Join Discussions</span>
                   </button>
                 </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input 
                      type="text"
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="Share your reflection on this Ayah..."
                      className="flex-1 p-3 rounded-full border-[0.5px] border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-hidden focus:border-emerald-500"
                    />
                    <button 
                      type="submit"
                      disabled={!content.trim() || submitting}
                      className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white flex items-center justify-center transition-colors flex-shrink-0 shadow-xs"
                    >
                      {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                    </button>
                  </form>
              )}
            </div>
          </motion.div>

          {/* Sub-modals for UGC Safety */}
          <SignInModal
            isOpen={showSignInModal}
            onClose={() => setShowSignInModal(false)}
            onSuccess={(profile) => {
              setCurrentUser(profile);
              setAuthor(profile.displayName);
            }}
          />

          <ReportModal
            isOpen={reportModal.isOpen}
            onClose={() => setReportModal({ isOpen: false, discussionId: '', authorName: '' })}
            discussionId={reportModal.discussionId}
            authorName={reportModal.authorName}
            onReportSuccess={() => setBlockedVersion(v => v + 1)}
          />

          {/* In-app Block Confirmation Dialog */}
          {blockConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-3">
                  <UserX size={22} />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Block {blockConfirm.authorName}?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                  You will no longer see comments or reflections posted by this user. This action can be managed anytime.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBlockConfirm(null)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmBlock}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-colors"
                  >
                    Block User
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
