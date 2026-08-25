import { useState, useEffect, useRef } from 'react';
import { Send, User, MessageCircle, BookOpen, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';


export default function GlobalDiscussions() {
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [pendingDraft, setPendingDraft] = useState<any>(null);
  
  // Form state
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [citationSurah, setCitationSurah] = useState("");
  const [citationAyah, setCitationAyah] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Reply state
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load draft
  
  const fetchDiscussions = async () => {
    try {
      const res = await fetch('/api/discussions');
      const data = await res.json();
      const docs = data.map((row: any) => ({
        id: row.discussion.id,
        ...row.discussion,
        surahNumber: row.ayahRef?.surahNumber,
        ayahNumber: row.ayahRef?.ayahNumber,
        surahName: row.ayahRef?.surahName
      }));
      setDiscussions(docs);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
    const interval = setInterval(fetchDiscussions, 5000); // Polling for updates
    return () => clearInterval(interval);
  }, []);


    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setRetryError(null);
    const idempotencyKey = uuidv4();
    const tempId = uuidv4();
    
    // Optimistic UI
    const newComment = {
      id: tempId,
      content: content.trim(),
      author: author.trim() || 'Anonymous',
      email: email.trim(),
      createdAt: new Date().toISOString(),
      replyToId: replyTo,
      surahNumber: citationSurah ? parseInt(citationSurah) : null,
      ayahNumber: citationAyah ? parseInt(citationAyah) : null
    };
    
    setDiscussions(prev => [newComment, ...prev]);
    setPendingDraft(newComment);

    const payload = {
      id: tempId,
      idempotencyKey,
      content: content.trim(),
      author: author.trim() || 'Anonymous',
      email: email.trim(),
      replyToId: replyTo,
      surahNumber: citationSurah ? parseInt(citationSurah) : undefined,
      ayahNumber: citationAyah ? parseInt(citationAyah) : undefined
    };

    const attemptRequest = async (retries = 3, delay = 1000): Promise<boolean> => {
      try {
        const res = await fetch('/api/discussions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) return true;
        throw new Error(`Status ${res.status}`);
      } catch (error) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptRequest(retries - 1, delay * 2);
        }
        return false;
      }
    };

    const success = await attemptRequest();
    
    if (success) {
      setContent("");
      setReplyTo(null);
      setCitationSurah("");
      setCitationAyah("");
      setPendingDraft(null);
    } else {
      setRetryError("Failed to send message. Please try again.");
      setDiscussions(prev => prev.filter(d => d.id !== tempId));
    }
    setSubmitting(false);
  };

  const topLevelDiscussions = discussions.filter(d => !d.replyToId);
  const replies = discussions.filter(d => d.replyToId);

  return (
    <div className="space-y-8">
      {/* Glassmorphism Start Discussion Box */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/40 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5 relative overflow-hidden">
        {/* Subtle decorative gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <h3 className="font-bold text-2xl mb-6 flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
          <MessageCircle size={24} className="text-emerald-500" />
          Discussions
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-5 relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500/80 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Name</label>
              <input 
                type="text" 
                placeholder="Your name" 
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-white/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-sm placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500/80 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Email (Optional)</label>
              <input 
                type="email" 
                placeholder="your@email.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-white/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-sm placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500/80 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Surah (Optional)</label>
              <input 
                type="number" 
                placeholder="e.g. 2" 
                value={citationSurah}
                onChange={e => setCitationSurah(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-white/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-sm placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500/80 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Ayah (Optional)</label>
              <input 
                type="number" 
                placeholder="e.g. 255" 
                value={citationAyah}
                onChange={e => setCitationAyah(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-white/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-sm placeholder:text-slate-400"
              />
            </div>
          </div>

          {replyTo && (
            <div className="flex items-center justify-between text-xs font-semibold tracking-wide text-emerald-700 dark:text-emerald-300 bg-gradient-to-r from-emerald-100/50 to-teal-50/50 dark:from-emerald-900/30 dark:to-teal-900/30 p-3.5 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50 backdrop-blur-md">
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Replying to a discussion</span>
              <button type="button" onClick={() => setReplyTo(null)} className="hover:text-emerald-800 dark:hover:text-emerald-100 hover:underline">Cancel reply</button>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500/80 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Discussion / Question</label>
            <div className="flex gap-3">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Share your thoughts, reflections, or questions..."
                className="flex-1 p-4 rounded-2xl border border-white/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-y min-h-[120px] text-sm custom-scrollbar transition-all shadow-sm placeholder:text-slate-400"
              />
              <button 
                type="submit"
                disabled={submitting || !content.trim()}
                className="px-6 bg-gradient-to-br from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 disabled:from-slate-400 disabled:to-slate-400 text-white rounded-2xl flex items-center justify-center transition-all shadow-md shadow-emerald-500/20"
              >
                {submitting ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
              </button>
            </div>
                    {retryError && (
            <div className="mt-4 p-3 bg-red-100/50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
              <span>{retryError}</span>
              <button type="button" onClick={handleSubmit} className="font-bold underline hover:text-red-700 dark:hover:text-red-300">Retry</button>
            </div>
          )}
        </div>
      </form>
      </div>

      {/* Glassmorphism Discussions List */}
      <div className="space-y-6 mt-10">
        <h3 className="font-bold text-2xl flex items-center gap-2 text-slate-800 dark:text-slate-200">
          Community 
        </h3>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-emerald-500" />
          </div>
        ) : topLevelDiscussions.length === 0 ? (
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-12 text-center border border-white/40 dark:border-slate-700/50 shadow-sm">
            <MessageCircle size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 font-medium">No discussions yet.</p>
            <p className="text-sm text-slate-400 mt-1">Be the first to start a conversation.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {topLevelDiscussions.map((row) => {
              const threadReplies = replies.filter(r => r.replyToId === row.id).reverse();
              return (
                <div key={row.id} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-white/40 dark:border-slate-700/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] ring-1 ring-black/5 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                  
                  {row.surahNumber && row.ayahNumber && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-100/50 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold tracking-wide mb-5 shadow-sm">
                      <BookOpen size={14} />
                      <span>Qur'an {row.surahNumber}:{row.ayahNumber}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 border border-white/50 dark:border-slate-700/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                      <User size={18} />
                    </div>
                    <div>
                      <span className="font-bold block text-slate-900 dark:text-slate-100">{row.author || 'Anonymous'}</span>
                      <span className="text-[11px] font-medium text-slate-400 block mt-0.5 uppercase tracking-wide">
                        {row.createdAt ? new Date(row.createdAt).toLocaleString() : 'Just now'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed mb-5 text-sm md:text-base">
                    {row.content}
                  </p>
                  
                  <button 
                    onClick={() => {
                      setReplyTo(row.id);
                      setContent(`@${row.author || 'Anonymous'} `);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setTimeout(() => textareaRef.current?.focus(), 100);
                    }}
                    className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1"
                  >
                    Reply
                  </button>

                  {/* Nested Replies */}
                  {threadReplies.length > 0 && (
                    <div className="mt-6 pl-5 md:pl-8 border-l-2 border-emerald-100 dark:border-slate-700 space-y-4">
                      {threadReplies.map(replyRow => (
                        <div key={replyRow.id} className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl p-5 border border-white/40 dark:border-slate-700/50 shadow-sm">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border border-white/50 dark:border-slate-600/50 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm">
                              <User size={14} />
                            </div>
                            <div>
                              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{replyRow.author || 'Anonymous'}</span>
                              <span className="text-[10px] font-medium text-slate-400 ml-2 uppercase tracking-wide">
                                {replyRow.createdAt ? new Date(replyRow.createdAt).toLocaleString() : 'Just now'}
                              </span>
                            </div>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                            {replyRow.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
