import { useState, useEffect } from 'react';
import { X, Send, Loader2, User, LogIn } from 'lucide-react';
import { Ayah, SurahDetail } from '../api';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../utils/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface DiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ayah: Ayah;
  surah: SurahDetail;
}

export default function DiscussionModal({ isOpen, onClose, ayah, surah }: DiscussionModalProps) {
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

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

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error("Sign in error:", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !currentUser) return;
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'discussions'), {
        content,
        author: currentUser.displayName || 'Anonymous',
        userId: currentUser.uid,
        email: currentUser.email || null,
        createdAt: serverTimestamp(),
        isModerated: false,
        ayahRef: {
          surahNumber: surah.number,
          ayahNumber: ayah.numberInSurah,
          surahName: surah.name
        }
      });
      setContent('');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b-[0.5px] border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Discussions</h3>
              <p className="text-sm text-slate-500">Surah {surah.name} ({surah.number}), Ayah {ayah.numberInSurah}</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 size={24} className="animate-spin text-slate-400" />
              </div>
            ) : discussions.length === 0 ? (
              <p className="text-center text-slate-500 py-10">No discussions yet. Start the conversation!</p>
            ) : (
              discussions.map((d: any) => (
                <div key={d.discussion.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400">
                      <User size={14} />
                    </div>
                    <div>
                      <span className="font-medium text-sm text-slate-900 dark:text-slate-100">{d.discussion.author}</span>
                      <span className="text-xs text-slate-500 ml-2">
                        {d.discussion.createdAt ? new Date(d.discussion.createdAt.toMillis ? d.discussion.createdAt.toMillis() : d.discussion.createdAt).toLocaleString() : 'Just now'}
                      </span>
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
                 <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Sign in with Google to post.</p>
                 <button onClick={handleSignIn} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors">
                   <LogIn size={16} />
                   Sign In
                 </button>
               </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input 
                  type="text"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="flex-1 p-3 rounded-full border-[0.5px] border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-emerald-500"
                />
                <button 
                  type="submit"
                  disabled={!content.trim() || submitting}
                  className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white flex items-center justify-center transition-colors flex-shrink-0"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-1" />}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
