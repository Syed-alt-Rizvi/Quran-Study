import { useState, useEffect } from 'react';
import { X, Send, Loader2, User } from 'lucide-react';
import { Ayah, SurahDetail } from '../api';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

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

  // Load draft
  useEffect(() => {
    if (isOpen) {
      import('../utils/storage').then(({ getStorage }) => {
        getStorage(`draft-discussion-${surah.number}-${ayah.numberInSurah}`).then((draft) => {
          if (draft) setContent(draft);
        });
      });
    }
  }, [isOpen, surah.number, ayah.numberInSurah]);

  // Save draft
  useEffect(() => {
    if (isOpen) {
      import('../utils/storage').then(({ setStorage }) => {
        setStorage(`draft-discussion-${surah.number}-${ayah.numberInSurah}`, content);
      });
    }
  }, [content, isOpen, surah.number, ayah.numberInSurah]);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    
    const q = query(
      collection(db, 'discussions'),
      where('surahNumber', '==', surah.number),
      where('ayahNumber', '==', ayah.numberInSurah),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDiscussions(docs);
      setLoading(false);
    }, (error) => {
      console.error("Firebase fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, surah.number, ayah.numberInSurah]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'discussions'), {
        content: content.trim(),
        author: 'Anonymous',
        surahNumber: surah.number,
        ayahNumber: ayah.numberInSurah,
        surahName: surah.name,
        createdAt: serverTimestamp(),
      });
      setContent('');
      import('../utils/storage').then(({ removeStorage }) => {
        removeStorage(`draft-discussion-${surah.number}-${ayah.numberInSurah}`);
      });
    } catch (e) {
      console.error("Firebase submit error:", e);
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
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-black/5"
        >
          <div className="flex items-center justify-between p-5 border-b border-white/20 dark:border-slate-700/30">
            <div>
              <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">Discussions</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Surah {surah.name} ({surah.number}), Ayah {ayah.numberInSurah}</p>
            </div>
            <button onClick={onClose} className="p-2.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-white/50 hover:bg-white/80 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 rounded-full transition-colors shadow-sm">
              <X size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={28} className="animate-spin text-emerald-500" />
              </div>
            ) : discussions.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-white/50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <User size={24} className="text-emerald-500/50" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">No discussions yet.</p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Be the first to share your reflections on this Ayah.</p>
              </div>
            ) : (
              discussions.map((d: any) => (
                <div key={d.id} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 border border-white/50 dark:border-slate-700/50 flex items-center justify-center shadow-sm">
                      <User size={14} className="text-emerald-700 dark:text-emerald-400" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{d.author || 'Anonymous'}</span>
                      {d.createdAt && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                          {d.createdAt.toDate ? d.createdAt.toDate().toLocaleString() : 'Just now'}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{d.content}</p>
                </div>
              ))
            )}
          </div>
          
          <div className="p-5 border-t border-white/20 dark:border-slate-700/30 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Share your thoughts or ask a question..."
                className="flex-1 bg-white/70 dark:bg-slate-800/70 border border-white/50 dark:border-slate-600/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-slate-200 shadow-sm placeholder:text-slate-400"
                disabled={submitting}
              />
              <button 
                type="submit" 
                disabled={submitting || !content.trim()}
                className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-full transition-all disabled:opacity-50 shadow-md shadow-emerald-500/20"
              >
                {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-1" />}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
