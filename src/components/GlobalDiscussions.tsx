import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageCircle, BookOpen, LogIn, Flag, UserX, ShieldCheck, Check, CheckCircle2, Reply, ChevronDown, ChevronUp, CornerDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../utils/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, limit } from 'firebase/firestore';
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
import ThreadReplyModal, { DiscussionRow } from './ThreadReplyModal';
import { getApiUrl } from '../utils/apiBase';

interface Discussion {
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

interface DBRow {
  discussion: Discussion;
  ayahRef: {
    surahNumber: number;
    ayahNumber: number;
    surahName: string | null;
  } | null;
}

const DEFAULT_COMMUNITY_DISCUSSIONS: DBRow[] = [
  {
    discussion: {
      id: "comm_seed_1",
      content: "Ayat al-Kursi (2:255) is the grandest verse in the Holy Quran according to the Prophet (s.a.w.a) and Imam Ali (a.s). It establishes absolute divine sovereignty, living sustenance, and untired vigilance: 'Neither slumber overtakes Him nor sleep'. Reciting it every morning and after obligatory prayers anchors the soul in divine peace.",
      author: "Syed Kumail Al-Musawi",
      email: null,
      userId: "user_seed_1",
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      replyToId: null,
      isModerated: false,
      isOfficialAnswer: true
    },
    ayahRef: {
      surahNumber: 2,
      ayahNumber: 255,
      surahName: "Al-Baqarah"
    }
  },
  {
    discussion: {
      id: "comm_seed_1_reply",
      content: "SubhanAllah! In Tafseer Al-Mizan, Allamah Tabataba'i highlights how the name 'Al-Hayy Al-Qayyum' encompasses every single divine attribute of action and essence. Truly transformative when pondered upon.",
      author: "Dr. Zayd Hussain",
      email: null,
      userId: "user_seed_2",
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      replyToId: "comm_seed_1",
      isModerated: false,
      isOfficialAnswer: false
    },
    ayahRef: null
  },
  {
    discussion: {
      id: "comm_seed_2",
      content: "In Surah Yaseen (36:12): 'And all things We have recorded in a Manifest Imam (Imamin Mubeen)'. In numerous authentic Shia exegetical reports through Imam al-Baqir (a.s), when this verse descended, the Messenger of Allah pointed towards Amir al-Mu'minin Ali ibn Abi Talib (a.s) and declared: 'This is the Imam in whom Allah has deposited the knowledge of all things.'",
      author: "Fatima Zahra Scholar Circle",
      email: null,
      userId: "user_seed_3",
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      replyToId: null,
      isModerated: false,
      isOfficialAnswer: true
    },
    ayahRef: {
      surahNumber: 36,
      ayahNumber: 12,
      surahName: "Ya-Seen"
    }
  },
  {
    discussion: {
      id: "comm_seed_3",
      content: "Reflecting on Dua Kumayl on Friday night: 'O Allah, forgive me those sins which tear apart protective safeguards, and forgive me those sins which draw down tribulations...' The psychological and spiritual medicine in Imam Ali's words is incomparable to anything in human literature.",
      author: "Brother Ali Reza",
      email: null,
      userId: "user_seed_4",
      createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
      replyToId: null,
      isModerated: false,
      isOfficialAnswer: false
    },
    ayahRef: null
  },
  {
    discussion: {
      id: "comm_seed_3_reply",
      content: "Indeed, Imam Ja'far al-Sadiq (a.s) said that sincere supplication turns back divine decrees already written in ink. Taking time to absorb the meaning before sleep on Thursday night brings tremendous clarity.",
      author: "Shaykh Murtaza",
      email: null,
      userId: "user_seed_5",
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      replyToId: "comm_seed_3",
      isModerated: false,
      isOfficialAnswer: false
    },
    ayahRef: null
  },
  {
    discussion: {
      id: "comm_seed_4",
      content: "In Surah Al-Fatihah, verse 5: 'You alone we worship, and You alone we ask for help'. Notice how the plural form 'we' (Na'budu / Nasta'een) is used rather than singular 'I'. Even when praying completely alone, the believer unites their heart with the entire righteous community of monotheists throughout all ages.",
      author: "Qur'anic Insights Foundation",
      email: null,
      userId: "user_seed_6",
      createdAt: new Date(Date.now() - 3600000 * 42).toISOString(),
      replyToId: null,
      isModerated: false,
      isOfficialAnswer: true
    },
    ayahRef: {
      surahNumber: 1,
      ayahNumber: 5,
      surahName: "Al-Fatihah"
    }
  }
];

export default function GlobalDiscussions() {
  const [discussions, setDiscussions] = useState<DBRow[]>(DEFAULT_COMMUNITY_DISCUSSIONS);
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

  // Dedicated Thread Reply Modal State
  const [threadModal, setThreadModal] = useState<{
    isOpen: boolean;
    parentRow: DBRow | null;
    initialTargetAuthor?: string;
  }>({
    isOpen: false,
    parentRow: null,
    initialTargetAuthor: undefined,
  });

  // Collapsible feed replies tracking (seed threads start expanded for discoverability)
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(
    () => new Set(['comm_seed_1', 'comm_seed_3'])
  );

  const toggleThreadExpanded = (threadId: string) => {
    hapticSelection();
    setExpandedThreads(prev => {
      const next = new Set(prev);
      if (next.has(threadId)) {
        next.delete(threadId);
      } else {
        next.add(threadId);
      }
      return next;
    });
  };

  const openThreadModal = (parentRow: DBRow, initialAuthor?: string) => {
    hapticSelection();
    setThreadModal({
      isOpen: true,
      parentRow,
      initialTargetAuthor: initialAuthor || parentRow.discussion.author,
    });
  };

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

    const q = query(collection(db, 'discussions'), orderBy('createdAt', 'desc'), limit(60));
    const unsubscribeDb = onSnapshot(q, (snapshot) => {
      const docs: DBRow[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        let formattedCreatedAt = new Date().toISOString();
        if (data.createdAt) {
          try {
            if (typeof data.createdAt.toMillis === 'function') {
              formattedCreatedAt = new Date(data.createdAt.toMillis()).toISOString();
            } else if (typeof data.createdAt.toDate === 'function') {
              formattedCreatedAt = data.createdAt.toDate().toISOString();
            } else if (typeof data.createdAt === 'number') {
              formattedCreatedAt = new Date(data.createdAt).toISOString();
            } else if (typeof data.createdAt === 'string') {
              const d = new Date(data.createdAt);
              formattedCreatedAt = !isNaN(d.getTime()) ? d.toISOString() : data.createdAt;
            }
          } catch (e) {}
        }
        docs.push({
          discussion: {
            id: docSnap.id,
            content: data.content,
            author: data.author,
            email: data.email || null,
            userId: data.userId,
            createdAt: formattedCreatedAt,
            replyToId: data.replyToId || null,
            isModerated: data.isModerated || false,
            isOfficialAnswer: data.isOfficialAnswer || false
          },
          ayahRef: data.ayahRef || null
        });
      });
      if (docs.length > 0) {
        setDiscussions(docs);
      } else {
        setDiscussions(DEFAULT_COMMUNITY_DISCUSSIONS);
      }
      setLoading(false);
    }, (error) => {
      console.warn("Firestore listener notice:", error);
      fetch(getApiUrl('/api/discussions'))
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setDiscussions(data);
          } else {
            setDiscussions(DEFAULT_COMMUNITY_DISCUSSIONS);
          }
        })
        .catch(() => {
          setDiscussions(DEFAULT_COMMUNITY_DISCUSSIONS);
        })
        .finally(() => setLoading(false));
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
      const hasAyahRef = !isNaN(sNum) && !isNaN(aNum);
      if (hasAyahRef) {
        payload.ayahRef = {
          surahNumber: sNum,
          ayahNumber: aNum
        };
      }

      // Optimistic instant UI update
      const localId = `disc_local_${Date.now()}`;
      const newRow: DBRow = {
        discussion: {
          id: localId,
          content: content.trim(),
          author: author || currentUser.displayName || 'Anonymous',
          email: email || null,
          userId: currentUser.userId,
          createdAt: new Date().toISOString(),
          replyToId: replyTo || null,
          isModerated: false,
          isOfficialAnswer: false
        },
        ayahRef: hasAyahRef ? { surahNumber: sNum, ayahNumber: aNum, surahName: null } : null
      };

      setDiscussions(prev => [newRow, ...prev]);

      // Background persist to Firestore and server API
      try {
        await addDoc(collection(db, 'discussions'), payload);
      } catch {}

      try {
        await fetch(getApiUrl('/api/discussions'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: content.trim(),
            author: author || currentUser.displayName || 'Anonymous',
            email: email || undefined,
            replyToId: replyTo || undefined,
            surahNumber: hasAyahRef ? sNum : undefined,
            ayahNumber: hasAyahRef ? aNum : undefined,
          })
        });
      } catch {}

      hapticNotification('SUCCESS');
      setContent("");
      setReplyTo(null);
      setCitationSurah("");
      setCitationAyah("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitThreadReply = async (
    replyContent: string,
    replyToId: string,
    replyAuthor?: string
  ): Promise<boolean> => {
    if (!replyContent.trim()) return false;

    const activeAuthor = replyAuthor || currentUser?.displayName || 'Anonymous';
    const activeUserId = currentUser?.userId || `user_${Date.now()}`;
    const localId = `disc_reply_${Date.now()}`;

    // Optimistic instant UI update
    const newRow: DBRow = {
      discussion: {
        id: localId,
        content: replyContent.trim(),
        author: activeAuthor,
        email: null,
        userId: activeUserId,
        createdAt: new Date().toISOString(),
        replyToId,
        isModerated: false,
        isOfficialAnswer: false,
      },
      ayahRef: null,
    };

    setDiscussions(prev => [newRow, ...prev]);

    // Ensure thread is expanded so user sees their reply in feed
    setExpandedThreads(prev => new Set(prev).add(replyToId));

    // Persist to Firestore
    try {
      await addDoc(collection(db, 'discussions'), {
        content: replyContent.trim(),
        author: activeAuthor,
        userId: activeUserId,
        createdAt: serverTimestamp(),
        replyToId,
        isModerated: false,
      });
    } catch (err) {
      console.warn('[GlobalDiscussions] Firestore reply save notice:', err);
    }

    // Persist to server API
    try {
      await fetch(getApiUrl('/api/discussions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent.trim(),
          author: activeAuthor,
          replyToId,
        }),
      });
    } catch (err) {
      console.warn('[GlobalDiscussions] API reply save notice:', err);
    }

    return true;
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
                      <div className="flex items-center gap-2">
                        <span className="font-semibold block text-slate-900 dark:text-slate-100">{row.discussion.author}</span>
                        {row.discussion.isOfficialAnswer && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                            <CheckCircle2 size={11} /> Official Answer
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">{new Date(row.discussion.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Safety & Flag Actions */}
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
                
                {/* Discussion Action Bar: Reply button visible to all users + Collapsible replies count */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => openThreadModal(row, row.discussion.author)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-colors cursor-pointer active:scale-95 shadow-2xs"
                      title={`Reply to ${row.discussion.author}`}
                    >
                      <Reply size={14} className="text-emerald-600 dark:text-emerald-400" />
                      <span>Reply</span>
                    </button>
                  </div>

                  {threadReplies.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleThreadExpanded(row.discussion.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <MessageCircle size={13} className="text-emerald-600 dark:text-emerald-400" />
                      <span>
                        {threadReplies.length} {threadReplies.length === 1 ? 'reply' : 'replies'}
                      </span>
                      {expandedThreads.has(row.discussion.id) ? (
                        <ChevronUp size={14} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={14} className="text-slate-400" />
                      )}
                    </button>
                  )}
                </div>

                {/* Nested Replies with Smooth Collapse / Expand */}
                <AnimatePresence>
                  {threadReplies.length > 0 && expandedThreads.has(row.discussion.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="mt-4 pl-3 sm:pl-5 border-l-2 border-emerald-500/20 dark:border-emerald-500/30 space-y-3 overflow-hidden"
                    >
                      {threadReplies.map((replyRow, replyIdx) => (
                        <div 
                          key={`reply-${row.discussion.id}-${replyRow.discussion.id || replyIdx}-${replyIdx}`} 
                          className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200/50 dark:border-slate-800"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-xs shrink-0">
                                {replyRow.discussion.author?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <div className="truncate">
                                <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate block">
                                  {replyRow.discussion.author}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(replyRow.discussion.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {/* Reply directly to this nested comment */}
                              <button
                                type="button"
                                onClick={() => openThreadModal(row, replyRow.discussion.author)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                                title={`Reply to ${replyRow.discussion.author}`}
                              >
                                <CornerDownRight size={11} />
                                <span>Reply</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setReportModal({
                                  isOpen: true,
                                  discussionId: replyRow.discussion.id,
                                  authorName: replyRow.discussion.author,
                                })}
                                className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                title="Report reply"
                              >
                                <Flag size={12} />
                              </button>
                              {replyRow.discussion.userId && currentUser?.userId !== replyRow.discussion.userId && (
                                <button
                                  type="button"
                                  onClick={() => handleBlockAuthor(replyRow.discussion.userId, replyRow.discussion.author)}
                                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                                  title="Block user"
                                >
                                  <UserX size={12} />
                                </button>
                              )}
                            </div>
                          </div>

                          <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed mt-1">
                            {replyRow.discussion.content}
                          </p>
                        </div>
                      ))}

                      {/* Quick button at bottom of thread in feed to add reply */}
                      <button
                        type="button"
                        onClick={() => openThreadModal(row, row.discussion.author)}
                        className="w-full py-2 px-3 text-center text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 border border-dashed border-emerald-200 dark:border-emerald-800/50 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Reply size={13} />
                        <span>Add reply to this thread...</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Focused Thread Reply Modal Sheet */}
      {threadModal.isOpen && threadModal.parentRow && (
        <ThreadReplyModal
          isOpen={threadModal.isOpen}
          onClose={() => setThreadModal({ isOpen: false, parentRow: null })}
          parentRow={threadModal.parentRow}
          replies={visibleDiscussions.filter(
            d => d.discussion.replyToId === threadModal.parentRow?.discussion.id
          )}
          currentUser={currentUser}
          onSaveProfile={(profile) => {
            setCurrentUser(profile);
            setAuthor(profile.displayName);
          }}
          onSubmitReply={handleSubmitThreadReply}
          onReport={(discussionId, authorName) => {
            setReportModal({
              isOpen: true,
              discussionId,
              authorName,
            });
          }}
          onBlock={(blockedUserId, authorName) => {
            handleBlockAuthor(blockedUserId, authorName);
          }}
          initialReplyTarget={threadModal.initialTargetAuthor}
        />
      )}

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

