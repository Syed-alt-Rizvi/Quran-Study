const fs = require('fs');
let code = fs.readFileSync('src/components/GlobalDiscussions.tsx', 'utf8');

// Replace firebase imports
code = code.replace(/import \{ db \} from '\.\.\/lib\/firebase';/, "import { v4 as uuidv4 } from 'uuid';");
code = code.replace(/import \{ collection.*\} from 'firebase\/firestore';/, "");

code = code.replace("const [loading, setLoading] = useState(true);", `const [loading, setLoading] = useState(true);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [pendingDraft, setPendingDraft] = useState<any>(null);`);

// Replace Load Discussions
const loadLogic = `
  // Load Discussions via API
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
`;

// we need to replace the useEffect that calls onSnapshot
code = code.replace(/useEffect\(\(\) => \{\s+const q = query\([\s\S]*?return \(\) => unsubscribe\(\);\s+\}, \[\]\);/, loadLogic);

// Replace Submit Discussion
const submitLogic = `
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
      createdAt: { toDate: () => new Date() }, // Simulate Firestore timestamp for UI
      replyToId: replyTo,
      surahNumber: citationSurah ? parseInt(citationSurah) : null,
      ayahNumber: citationAyah ? parseInt(citationAyah) : null
    };
    
    setDiscussions(prev => [newComment, ...prev]);
    setPendingDraft(newComment); // Save in case of failure

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
        if (res.ok) {
          return true;
        }
        throw new Error(\`Status \${res.status}\`);
      } catch (error) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptRequest(retries - 1, delay * 2); // Exponential backoff
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
      // Keep text intact, rollback optimistic UI
      setDiscussions(prev => prev.filter(d => d.id !== tempId));
    }
    
    setSubmitting(false);
  };
`;

code = code.replace(/const submitDiscussion = async \(e: React\.FormEvent\) => \{[\s\S]*?setSubmitting\(false\);\s+\};/, submitLogic);

// Add Retry Error UI
code = code.replace(/<\/div>\s*<\/form>/, `
          {retryError && (
            <div className="mt-4 p-3 bg-red-100/50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
              <span>{retryError}</span>
              <button type="button" onClick={submitDiscussion} className="font-bold underline hover:text-red-700 dark:hover:text-red-300">Retry</button>
            </div>
          )}
        </div>
      </form>
`);

// Some rows might use row.createdAt?.toDate, wait, sqlite created_at is a string!
// We must parse it.
code = code.replace(/row\.createdAt\?\.toDate \? row\.createdAt\.toDate\(\)\.toLocaleString\(\) : 'Just now'/g, "row.createdAt ? new Date(row.createdAt).toLocaleString() : 'Just now'");
code = code.replace(/replyRow\.createdAt\?\.toDate \? replyRow\.createdAt\.toDate\(\)\.toLocaleString\(\) : 'Just now'/g, "replyRow.createdAt ? new Date(replyRow.createdAt).toLocaleString() : 'Just now'");

fs.writeFileSync('src/components/GlobalDiscussions.tsx', code);
