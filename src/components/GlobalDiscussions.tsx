import { useState, useEffect, useRef } from 'react';
import { Send, User, MessageCircle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Discussion {
  id: string;
  content: string;
  author: string;
  email: string | null;
  createdAt: string;
  replyToId: string | null;
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
    loadDiscussions();
  }, []);

  const loadDiscussions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/discussions');
      const data = await res.json();
      if (Array.isArray(data)) {
        setDiscussions(data);
      } else {
        console.error("Failed to fetch global discussions:", data);
        setDiscussions([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          author: author || 'Anonymous',
          email: email || undefined,
          surahNumber: citationSurah ? parseInt(citationSurah) : undefined,
          ayahNumber: citationAyah ? parseInt(citationAyah) : undefined,
          replyToId: replyTo
        })
      });
      setContent("");
      setReplyTo(null);
      setCitationSurah("");
      setCitationAyah("");
      loadDiscussions();
    } catch (e) {
      console.error(e);
    }
  };

  const topLevelDiscussions = discussions.filter(d => !d.discussion.replyToId);
  const replies = discussions.filter(d => d.discussion.replyToId);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-[0.5px] border-slate-200/60 dark:border-slate-800 shadow-sm">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <MessageCircle size={20} className="text-emerald-600" />
          Start a Discussion
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
              <input 
                type="text" 
                placeholder="Your name" 
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="w-full p-3 rounded-xl border-[0.5px] border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Email (Optional)</label>
              <input 
                type="email" 
                placeholder="your@email.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl border-[0.5px] border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-emerald-500"
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
                className="w-full p-3 rounded-xl border-[0.5px] border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Ayah Number (Optional Citation)</label>
              <input 
                type="number" 
                placeholder="e.g. 255" 
                value={citationAyah}
                onChange={e => setCitationAyah(e.target.value)}
                className="w-full p-3 rounded-xl border-[0.5px] border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-emerald-500"
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
                className="flex-1 p-3 rounded-xl border-[0.5px] border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-emerald-500 resize-y min-h-[100px] text-sm custom-scrollbar"
              />
              <button 
                type="submit"
                disabled={!content.trim()}
                className="px-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </form>
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
          topLevelDiscussions.map((row) => {
            const threadReplies = replies.filter(r => r.discussion.replyToId === row.discussion.id).reverse();
            return (
              <div key={row.discussion.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-[0.5px] border-slate-200/60 dark:border-slate-800 shadow-sm">
                
                {row.ayahRef && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium mb-4">
                    <BookOpen size={14} />
                    <span>Qur'an {row.ayahRef.surahNumber}:{row.ayahRef.ayahNumber}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <User size={18} />
                  </div>
                  <div>
                    <span className="font-semibold block text-slate-900 dark:text-slate-100">{row.discussion.author}</span>
                    <span className="text-xs text-slate-500">{new Date(row.discussion.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed mb-4">
                  {row.discussion.content}
                </p>
                
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

                {/* Nested Replies */}
                {threadReplies.length > 0 && (
                  <div className="mt-6 pl-4 md:pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-4">
                    {threadReplies.map(replyRow => (
                      <div key={replyRow.discussion.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400">
                            <User size={14} />
                          </div>
                          <div>
                            <span className="font-medium text-sm text-slate-900 dark:text-slate-100">{replyRow.discussion.author}</span>
                            <span className="text-xs text-slate-500 ml-2">{new Date(replyRow.discussion.createdAt).toLocaleString()}</span>
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
    </div>
  );
}
