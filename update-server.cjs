const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const queueLogic = `
// Robust Discussion Queue & Idempotency
interface QueueItem {
  id: string;
  payload: any;
  retries: number;
}
const discussionQueue: QueueItem[] = [];
const idempotencyCache = new Set<string>();

// Optimized Connection Pool Config (via better-sqlite3 PRAGMAs)
import { sqlite } from './src/db';
sqlite.pragma('journal_mode = WAL'); // Concurrency (Write-Ahead Log)
sqlite.pragma('synchronous = NORMAL');
sqlite.pragma('busy_timeout = 5000'); // Connection pooling/wait time

// Background Worker to ingest queue
setInterval(async () => {
  if (discussionQueue.length === 0) return;
  const batch = discussionQueue.splice(0, 50); // Batch process
  
  for (const item of batch) {
    try {
      const { id, content, author, email, replyToId, surahNumber, ayahNumber, surahName, tafseerRef } = item.payload;
      
      // Atomic insertions (wrapped in try/catch for fail-safe logging)
      sqlite.transaction(() => {
        db.insert(discussions).values({
          id,
          content: content.trim(),
          author: author?.trim() || "Anonymous",
          email: email?.trim() || null,
          replyToId: replyToId || null,
          isModerated: false
        }).run();

        if (surahNumber && ayahNumber) {
          db.insert(ayahReferences).values({
            id: uuidv4(),
            discussionId: id,
            surahNumber,
            ayahNumber,
            surahName: surahName || ""
          }).run();
        }

        if (tafseerRef) {
          db.insert(tafseerReferences).values({
            id: uuidv4(),
            discussionId: id,
            surahNumber: tafseerRef.surahNumber || surahNumber,
            ayahNumber: tafseerRef.ayahNumber || ayahNumber,
            language: tafseerRef.language,
            source: tafseerRef.source
          }).run();
        }
      })();
    } catch (e: any) {
      console.error("[BACKGROUND WORKER ERROR] Failed to insert discussion.");
      console.error("Payload:", JSON.stringify(item.payload));
      console.error(e.stack);
      // Optional: push back to queue if retries < 3
      if (item.retries < 3) {
        item.retries++;
        discussionQueue.push(item);
      }
    }
  }
}, 2000);
`;

code = code.replace('const app = express();', queueLogic + '\n  const app = express();');

const oldPost = `app.post("/api/discussions", async (req, res) => {
    try {
      const { content, author, email, replyToId, surahNumber, ayahNumber, surahName, tafseerRef } = req.body;
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: "Content is required" });
      }
      
      const id = uuidv4();
      
      await db.insert(discussions).values({
        id,
        content: content.trim(),
        author: author?.trim() || "Anonymous",
        email: email?.trim() || null,
        replyToId: replyToId || null,
        isModerated: false
      }).execute();
      
      if (surahNumber && ayahNumber) {
        await db.insert(ayahReferences).values({
          id: uuidv4(),
          discussionId: id,
          surahNumber,
          ayahNumber,
          surahName: surahName || ""
        }).execute();
      }
      
      if (tafseerRef) {
        await db.insert(tafseerReferences).values({
          id: uuidv4(),
          discussionId: id,
          surahNumber: tafseerRef.surahNumber || surahNumber,
          ayahNumber: tafseerRef.ayahNumber || ayahNumber,
          language: tafseerRef.language,
          source: tafseerRef.source
        }).execute();
      }
      
      res.json({ success: true, id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });`;

const newPost = `app.post("/api/discussions", (req, res) => {
    try {
      const { content, idempotencyKey, id: clientGeneratedId } = req.body;
      
      if (!content || content.trim().length === 0) {
        return res.status(422).json({ error: "Content is required" });
      }
      
      if (idempotencyKey) {
        if (idempotencyCache.has(idempotencyKey)) {
          return res.status(202).json({ success: true, message: "Already accepted", id: clientGeneratedId });
        }
        idempotencyCache.add(idempotencyKey);
        
        // Prevent memory leak
        if (idempotencyCache.size > 10000) {
          const first = idempotencyCache.values().next().value;
          idempotencyCache.delete(first);
        }
      }
      
      const id = clientGeneratedId || uuidv4();
      
      // Decouple writes - push to queue
      discussionQueue.push({ id, payload: { ...req.body, id }, retries: 0 });
      
      // 202 Accepted
      res.status(202).json({ success: true, id });
    } catch (e: any) {
      console.error("[API ERROR] /api/discussions POST:", e);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });`;

// Replace the old post route
code = code.replace(oldPost, newPost);

// Make sure `sqlite` is exported from `src/db/index.ts`
fs.writeFileSync('server.ts', code);
