const fs = require('fs');

function processFile(path) {
  let content = fs.readFileSync(path, 'utf8');

  // Replace imports
  content = content.replace(/import \{ db \} from '\.\.\/lib\/firebase';/g, "import { v4 as uuidv4 } from 'uuid';");
  content = content.replace(/import \{ collection,[\s\S]*?\} from 'firebase\/firestore';/g, "");

  // Update state hooks
  content = content.replace("const [loading, setLoading] = useState(true);", 
`const [loading, setLoading] = useState(true);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [pendingDraft, setPendingDraft] = useState<any>(null);`);

  if (path.includes('GlobalDiscussions')) {
    // Replace Query
    content = content.replace(/useEffect\(\(\) => \{[\s\S]*?const unsubscribe = onSnapshot\(q, \(snapshot\) => \{[\s\S]*?setDiscussions\(docs\);[\s\S]*?setLoading\(false\);[\s\S]*?\}\);[\s\S]*?return \(\) => unsubscribe\(\);[\s\S]*?\}, \[\]\);/, 
`
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
`);
    
    // Replace submit logic
    content = content.replace(/const submitDiscussion = async \(e: React\.FormEvent\) => \{[\s\S]*?await addDoc\(collection\(db, 'discussions'\), \{[\s\S]*?isModerated: false[\s\S]*?\}\);[\s\S]*?setContent\(""\);[\s\S]*?setReplyTo\(null\);[\s\S]*?setCitationSurah\(""\);[\s\S]*?setCitationAyah\(""\);[\s\S]*?setSubmitting\(false\);[\s\S]*?\};/,
`
  const submitDiscussion = async (e: React.FormEvent) => {
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
        throw new Error(\`Status \${res.status}\`);
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
`);

  } else {
    // DiscussionModal
    content = content.replace(/useEffect\(\(\) => \{[\s\S]*?if \(!isOpen\) return;[\s\S]*?setLoading\(true\);[\s\S]*?const q = query\([\s\S]*?const unsubscribe = onSnapshot\(q, \(snapshot\) => \{[\s\S]*?setDiscussions\(docs\);[\s\S]*?setLoading\(false\);[\s\S]*?\}\);[\s\S]*?return \(\) => unsubscribe\(\);[\s\S]*?\}, \[isOpen, surah\.number, ayah\.numberInSurah\]\);/, 
`
  const fetchDiscussions = async () => {
    if (!isOpen) return;
    try {
      const res = await fetch(\`/api/discussions?surah=\${surah.number}&ayah=\${ayah.numberInSurah}\`);
      const data = await res.json();
      const docs = data.map((row: any) => ({
        id: row.discussion.id,
        ...row.discussion
      }));
      setDiscussions(docs);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDiscussions();
    const interval = setInterval(fetchDiscussions, 5000);
    return () => clearInterval(interval);
  }, [isOpen, surah.number, ayah.numberInSurah]);
`);

    content = content.replace(/const submitDiscussion = async \(e: React\.FormEvent\) => \{[\s\S]*?await addDoc\(collection\(db, 'discussions'\), \{[\s\S]*?isModerated: false[\s\S]*?\}\);[\s\S]*?setContent\(""\);[\s\S]*?setReplyTo\(null\);[\s\S]*?setSubmitting\(false\);[\s\S]*?\};/,
`
  const submitDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setRetryError(null);
    const idempotencyKey = uuidv4();
    const tempId = uuidv4();
    
    const newComment = {
      id: tempId,
      content: content.trim(),
      author: author.trim() || 'Anonymous',
      email: email.trim(),
      createdAt: new Date().toISOString(),
      replyToId: replyTo
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
      surahNumber: surah.number,
      ayahNumber: ayah.numberInSurah,
      surahName: surah.englishName
    };

    const attemptRequest = async (retries = 3, delay = 1000): Promise<boolean> => {
      try {
        const res = await fetch('/api/discussions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) return true;
        throw new Error(\`Status \${res.status}\`);
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
      setPendingDraft(null);
    } else {
      setRetryError("Failed to send message. Please try again.");
      setDiscussions(prev => prev.filter(d => d.id !== tempId));
    }
    setSubmitting(false);
  };
`);

  }

  content = content.replace(/<\/div>\s*<\/form>/, 
`          {retryError && (
            <div className="mt-4 p-3 bg-red-100/50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
              <span>{retryError}</span>
              <button type="button" onClick={submitDiscussion} className="font-bold underline hover:text-red-700 dark:hover:text-red-300">Retry</button>
            </div>
          )}
        </div>
      </form>`);

  content = content.replace(/row\.createdAt\?\.toDate \? row\.createdAt\.toDate\(\)\.toLocaleString\(\) : 'Just now'/g, "row.createdAt ? new Date(row.createdAt).toLocaleString() : 'Just now'");
  content = content.replace(/replyRow\.createdAt\?\.toDate \? replyRow\.createdAt\.toDate\(\)\.toLocaleString\(\) : 'Just now'/g, "replyRow.createdAt ? new Date(replyRow.createdAt).toLocaleString() : 'Just now'");

  fs.writeFileSync(path, content);
}

processFile('src/components/GlobalDiscussions.tsx');
processFile('src/components/DiscussionModal.tsx');
