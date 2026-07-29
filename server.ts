import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as cheerio from "cheerio";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API route for scraping tafseer
  app.get("/api/tafseer/surah/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const fetchRes = await fetch(`https://www.tafseerenamoona.net/surahs/${id}`);
      if (!fetchRes.ok) {
        return res.status(fetchRes.status).json({ error: "Failed to fetch from tafseerenamoona.net" });
      }
      const html = await fetchRes.text();
      const $ = cheerio.load(html);

      const items = [];
      let currentVerses = [];
      let currentTafseerBlocks = [];

      // We will iterate through all relevant elements
      const elements = $('div[dir="rtl"], h3[dir="ltr"], p[dir="ltr"]');
      
      let currentTafseerHeader = null;
      let currentTafseerContent = [];

      elements.each((i, el) => {
        const tagName = el.tagName.toLowerCase();
        
        if (tagName === 'div' && $(el).css('font-family')?.includes('Noto Naskh')) {
           // If we have accumulated tafseer blocks from previous verses, we save them
           if (currentVerses.length > 0 && currentTafseerBlocks.length > 0) {
              items.push({
                 verses: currentVerses,
                 tafseer: currentTafseerBlocks
              });
              currentVerses = [];
              currentTafseerBlocks = [];
           }
           // Add to current verses (sometimes multiple verses are grouped)
           currentVerses.push($(el).text().trim());
        } else if (tagName === 'h3') {
           // Save the previous tafseer block if exists
           if (currentTafseerHeader) {
              currentTafseerBlocks.push({
                 header: currentTafseerHeader,
                 paragraphs: currentTafseerContent
              });
           }
           currentTafseerHeader = $(el).text().replace(/^[0-9\.]+/, '').trim(); // remove "1.1 "
           currentTafseerContent = [];
        } else if (tagName === 'p') {
           if (currentTafseerHeader) {
              currentTafseerContent.push($(el).text().trim());
           }
        }
      });

      if (currentTafseerHeader) {
         currentTafseerBlocks.push({
            header: currentTafseerHeader,
            paragraphs: currentTafseerContent
         });
      }
      
      if (currentVerses.length > 0) {
         items.push({
            verses: currentVerses,
            tafseer: currentTafseerBlocks
         });
      }

      res.json({ data: items });
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
