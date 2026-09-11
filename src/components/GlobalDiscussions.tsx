import { useState, useEffect, useRef } from 'react';
import { Send, User, MessageCircle, BookOpen, LogIn, Flag, UserX, ShieldCheck, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../utils/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  getGuestProfile,
  saveGuestProfile,
  clearGuestProfile,
  GuestProfile,
  isUserBlocked,
  blockUserId,
  isDiscussionReported,
  hasAcceptedGuidelines,
} from '../utils/guestAuth';
import { hapticImpact, hapticNotification, hapticSelection } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';
import { registerModal } from '../utils/modalBackHandler';
import SignInModal from './SignInModal';
import ReportModal from './ReportModal';

interface Discussion {
  id: string;
  content: string;
  author: string;
  email: string | null;
  userId: string;
  createdAt: string;
  replyToId: string | null;
  isModerated: boolean;
}

interface DBRow {
  discussion: Discussion;
  ayahRef: {
    surahNumber: number;
    ayahNumber: number;
    surahName: string | null;
  } | null;
}

export default function GlobalDiscussions() {
  const [discussions, setDiscussions] = useState<DBRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<GuestProfile | null>(getGuestProfile());
  const [blockedVersion, setBlockedVersion] = useState(0);

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

  // Form state
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [citationSurah, setCitationSurah] = useState("");
  const [citationAyah, setCitationAyah] = useState("");

  // Reply state
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (currentUser && !author) {
      setAuthor(currentUser.displayName || "Anonymous");
    }

    const q = query(collection(db, 'discussions'), orderBy('createdAt', 'desc'));
    const unsubscribeDb = onSnapshot(q, (snapshot) => {
      const docs: DBRow[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        docs.push({
          discussion: {
            id: docSnap.id,
            content: data.content,
            author: data.author,
            email: data.email || null,
            userId: data.userId,
            createdAt: data.createdAt ? new Date(data.createdAt.toMillis()).toISOString() : new Date().toISOString(),
            replyToId: data.replyToId || null,
            isModerated: data.isModerated || false
          },
          ayahRef: data.ayahRef || null
        });
      });
      setDiscussions(docs);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeDb();
    };
  }, []);

  const handleSignIn = () => {
    hapticImpact(ImpactStyle.Light);
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

    try {
      const payload: any = {
        content: content.trim(),
        author: author || currentUser.displayName || 'Anonymous',
        userId: currentUser.userId,
        createdAt: serverTimestamp(),
        isModerated: false,
      };

      if (email) payload.email = email;
      if (replyTo) payload.replyToId = replyTo;
      
      const sNum = parseInt(citationSurah);
      const aNum = parseInt(citationAyah);
      if (!isNaN(sNum) && !isNaN(aNum)) {
        payload.ayahRef = {
          surahNumber: sNum,
          ayahNumber: aNum
        };
      }

      await addDoc(collection(db, 'discussions'), payload);
      hapticNotification('SUCCESS');
      setContent("");
      setReplyTo(null);
      setCitationSurah("");
      setCitationAyah("");
    } catch (e) {
      console.error(e);
    }
  };

  // Filter out blocked users and reported content (Google Play UGC compliance)
  const visibleDiscussions = discussions.filter(
    d => !isUserBlocked(d.discussion.userId) && !isDiscussionReported(d.discussion.id)
  );

  const topLevelDiscussions = visibleDiscussions.filter(d => !d.discussion.replyToId);
  const replies = visibleDiscussions.filter(d => d.discussion.replyToId);

  return (
    <div className="space-y-6">
      {/* Community Guidelines Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex items-start gap-3">
        <ShieldCheck className="text-emerald-700 dark:text-emerald-400 mt-0.5 flex-shrink-0" size={20} />
        <div className="text-xs text-slate-700 dark:text-slate-300">
          <strong className="text-emerald-900 dark:text-emerald-200 font-semibold block mb-0.5">
            Community Guidelines & Zero Tolerance for Harassment
          </strong>
          <p className="leading-relaxed text-[11px]">
            This space is reserved for authentic Quran study. Abusive, derogatory, sectarian, or inappropriate content is strictly prohibited and removed. You can report comments and block users instantly.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-[0.5px] border-slate-200/60 dark:border-slate-800 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <MessageCircle size={20} className="text-emerald-600" />
            Start a Reflection
          </h3>
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Posting as <strong className="text-emerald-600 dark:text-emerald-400">{currentUser.displayName}</strong>
              </span>
              <button
                onClick={() => {
                  clearGuestProfile();
                  setCurrentUser(null);
                  hapticSelection();
                }}
                className="text-xs text-slate-400 hover:text-rose-500 ml-2"
              >
                Sign Out
              </button>
            </div>
          ) : null}
        </div>
        
        {!currentUser ? (
          <div className="py-6 flex flex-col items-center justify-center text-center">
            <MessageCircle size={32} className="text-emerald-200 dark:text-emerald-900/50 mb-3" />
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-sm">
              Choose a display name and agree to the Community Guidelines to post reflections, questions, and notes.
            </p>
            <button
              onClick={handleSignIn}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors shadow-xs"
            >
              <LogIn size={16} />
              <span>Join Discussion</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
                <input 
                  type="text" 
                  placeholder="Your name" 
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  className="w-full p-3 rounded-xl border-[0.5px] border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Email (Optional)</label>
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-3 rounded-xl border-[0.5px] border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Surah Number (Optional Citation)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 2" 
                  value={citationSurah}
                  onChange={e => setCitationSurah(e.target.value)}
                  className="w-full p-3 rounded-xl border-[0.5px] border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Ayah Number (Optional Citation)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 255" 
                  value={citationAyah}
                  onChange={e => setCitationAyah(e.target.value)}
                  className="w-full p-3 rounded-xl border-[0.5px] border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
            {replyTo && (
              <div className="flex items-center justify-between text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border-[0.5px] border-emerald-100 dark:border-emerald-900/50">
                <span>Replying to a discussion</span>
                <button type="button" onClick={() => setReplyTo(null)} className="hover:underline">Cancel reply</button>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Discussion / Question</label>
              <div className="flex gap-2">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Share your thoughts, reflections, or questions..."
                  className="flex-1 p-3 rounded-xl border-[0.5px] border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-hidden focus:border-emerald-500 resize-y min-h-[100px] text-sm custom-scrollbar"
                />
                <button 
                  type="submit"
                  disabled={!content.trim()}
                  className="px-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors active:scale-95 shadow-xs"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      <div className="space-y-6 mt-8">
        <h3 className="font-semibold text-lg flex items-center gap-2 text-slate-800 dark:text-slate-200">
          Community Discussions
        </h3>
        
        {loading ? (
          <p className="text-slate-500 text-center py-8">Loading discussions...</p>
        ) : topLevelDiscussions.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No discussions yet. Be the first to start one!</p>
        ) : (
          topLevelDiscussions.map((row, rowIdx) => {
            const threadReplies = replies.filter(r => r.discussion.replyToId === row.discussion.id).reverse();
            return (
              <div key={`thread-${row.discussion.id || rowIdx}-${rowIdx}`} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-[0.5px] border-slate-200/60 dark:border-slate-800 shadow-xs">
                
                {row.ayahRef && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium mb-4">
                    <BookOpen size={14} />
                    <span>Qur'an {row.ayahRef.surahNumber}:{row.ayahRef.ayahNumber}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <User size={18} />
                    </div>
                    <div>
                      <span className="font-semibold block text-slate-900 dark:text-slate-100">{row.discussion.author}</span>
                      <span className="text-xs text-slate-500">{new Date(row.discussion.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Safety Actions: Report & Block */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setReportModal({
                        isOpen: true,
                        discussionId: row.discussion.id,
                        authorName: row.discussion.author,
                      })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                      title="Report comment"
                    >
                      <Flag size={14} />
                    </button>
                    {row.discussion.userId && currentUser?.userId !== row.discussion.userId && (
                      <button
                        onClick={() => handleBlockAuthor(row.discussion.userId, row.discussion.author)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        title="Block this user"
                      >
                        <UserX size={14} />
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed mb-4">
                  {row.discussion.content}
                </p>
                
                {currentUser && (
                  <button 
                    onClick={() => {
                      setReplyTo(row.discussion.id);
                      setContent(`@${row.discussion.author} `);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setTimeout(() => textareaRef.current?.focus(), 100);
                    }}
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Reply
                  </button>
                )}

                {/* Nested Replies */}
                {threadReplies.length > 0 && (
                  <div className="mt-6 pl-4 md:pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-4">
                    {threadReplies.map((replyRow, replyIdx) => (
                      <div key={`reply-${row.discussion.id}-${replyRow.discussion.id || replyIdx}-${replyIdx}`} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400">
                              <User size={14} />
                            </div>
                            <div>
                              <span className="font-medium text-sm text-slate-900 dark:text-slate-100">{replyRow.discussion.author}</span>
                              <span className="text-xs text-slate-500 ml-2">{new Date(replyRow.discussion.createdAt).toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setReportModal({
                                isOpen: true,
                                discussionId: replyRow.discussion.id,
                                authorName: replyRow.discussion.author,
                              })}
                              className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                              title="Report reply"
                            >
                              <Flag size={12} />
                            </button>
                            {replyRow.discussion.userId && currentUser?.userId !== replyRow.discussion.userId && (
                              <button
                                onClick={() => handleBlockAuthor(replyRow.discussion.userId, replyRow.discussion.author)}
                                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                title="Block user"
                              >
                                <UserX size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">
                          {replyRow.discussion.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Safety & UGC Modals */}
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
              You will no longer see reflections or comments posted by this user.
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
    </div>
  );
}

