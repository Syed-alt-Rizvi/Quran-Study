import { useState, useEffect, useRef } from 'react';
import { Send, User, MessageCircle, BookOpen, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../utils/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';

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
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

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
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && !author) {
        setAuthor(user.displayName || "Anonymous");
        setEmail(user.email || "");
      }
    });

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
      unsubscribeAuth();
      unsubscribeDb();
    };
  }, []);

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

    try {
      const payload: any = {
        content,
        author: author || currentUser.displayName || 'Anonymous',
        userId: currentUser.uid,
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

      setContent("");
      setReplyTo(null);
      setCitationSurah("");
      setCitationAyah("");
    } catch (e) {
      console.error(e);
    }
  };

  const topLevelDiscussions = discussions.filter(d => !d.discussion.replyToId);
  const replies = discussions.filter(d => d.discussion.replyToId);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-[0.5px] border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <MessageCircle size={20} className="text-emerald-600" />
            Start a Discussion
          </h3>
          {currentUser ? (
            <button onClick={() => signOut(auth)} className="text-xs text-slate-500 hover:text-red-500">
              Sign Out
            </button>
          ) : null}
        </div>
        
        {!currentUser ? (
          <div className="py-6 flex flex-col items-center justify-center text-center">
            <MessageCircle size={32} className="text-emerald-200 dark:text-emerald-900/50 mb-3" />
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Sign in with Google to join the discussion, ask questions, or share your reflections.</p>
            <button onClick={handleSignIn} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors">
              <LogIn size={16} />
              Sign In to Participate
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
