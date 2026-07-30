import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as cheerio from "cheerio";

async function startServer() {
  const app = express();
  const PORT = 3000;

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
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  app.use(express.json());

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
