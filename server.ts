import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db";
import { discussions, ayahReferences, tafseerReferences, scienceArticles, ayahScienceRelationships } from "./src/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for proxying HTML to bypass CORS on the web
  app.get("/api/tafseer/proxy/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const fetchRes = await fetch(`https://www.tafseerenamoona.net/surahs/${id}`);
      if (!fetchRes.ok) {
        return res.status(fetchRes.status).json({ error: "Failed to fetch from tafseerenamoona.net" });
      }
      const html = await fetchRes.text();
      res.send(html);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // Discussions API
  app.get("/api/discussions", async (req, res) => {
    try {
      const { surah, ayah } = req.query;
      
      let query = db.select({
        discussion: discussions,
        ayahRef: ayahReferences
      }).from(discussions)
        .leftJoin(ayahReferences, eq(discussions.id, ayahReferences.discussionId));
        
      if (surah && ayah) {
        // filter by surah and ayah
        const s = parseInt(surah as string);
        const a = parseInt(ayah as string);
        
        const results = await query.where(and(
          eq(ayahReferences.surahNumber, s),
          eq(ayahReferences.ayahNumber, a)
        )).orderBy(desc(discussions.createdAt)).execute();
        
        return res.json(results);
      }
      
      const results = await query.orderBy(desc(discussions.createdAt)).limit(50).execute();
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/discussions", async (req, res) => {
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
  });

  // Science API
  app.get("/api/science", async (req, res) => {
    try {
      const { surah, ayah } = req.query;
      
      if (surah) {
        const s = parseInt(surah as string);
        const conditions = [eq(ayahScienceRelationships.surahNumber, s)];
        
        if (ayah) {
          conditions.push(eq(ayahScienceRelationships.ayahNumber, parseInt(ayah as string)));
        }
        
        const results = await db.select({
          article: scienceArticles,
          relation: ayahScienceRelationships
        }).from(ayahScienceRelationships)
          .innerJoin(scienceArticles, eq(ayahScienceRelationships.articleId, scienceArticles.id))
          .where(and(...conditions))
          .execute();
          
        return res.json(results);
      }
      
      const articles = await db.select().from(scienceArticles).orderBy(desc(scienceArticles.createdAt)).execute();
      const relationships = await db.select().from(ayahScienceRelationships).execute();
      
      const response = articles.map(article => ({
         ...article,
         relations: relationships.filter(r => r.articleId === article.id)
      }));
      
      res.json(response);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
