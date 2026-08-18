import { useState, useEffect } from 'react';
import { X, Send, Loader2, User } from 'lucide-react';
import { Ayah, SurahDetail } from '../api';
import { motion, AnimatePresence } from 'motion/react';

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

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch(`/api/discussions?surah=${surah.number}&ayah=${ayah.numberInSurah}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDiscussions(data);
        } else {
          console.error("Failed to fetch discussions:", data);
          setDiscussions([]);
        }
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [isOpen, surah.number, ayah.numberInSurah]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          author: 'Anonymous',
          surahNumber: surah.number,
          ayahNumber: ayah.numberInSurah,
          surahName: surah.name
        })
      });
      
      if (res.ok) {
        setContent('');
        // Refresh
        const newData = await fetch(`/api/discussions?surah=${surah.number}&ayah=${ayah.numberInSurah}`).then(r => r.json());
        setDiscussions(newData);
      }
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
                <div key={d.discussion.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border-[0.5px] border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <User size={14} className="text-slate-500" />
                    </div>
                    <span className="font-medium text-sm text-slate-700 dark:text-slate-300">{d.discussion.author || 'Anonymous'}</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 text-sm whitespace-pre-wrap">{d.discussion.content}</p>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t-[0.5px] border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Share your thoughts or ask a question..."
                className="flex-1 bg-white dark:bg-slate-950 border-[0.5px] border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-200"
                disabled={submitting}
              />
              <button 
                type="submit" 
                disabled={submitting || !content.trim()}
                className="w-10 h-10 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
