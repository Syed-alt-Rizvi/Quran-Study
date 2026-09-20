import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db";
import { discussions, ayahReferences, tafseerReferences, imamScienceArticles, imamScienceCategories } from "./src/db/schema";
import { eq, desc, asc, and, like, or } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { fetchTafseerAlKauthar, crawlSurahKauthar } from "./server/balaghScraper";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Request error handler for payload size and body parsing errors
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err?.type === "entity.too.large" || err?.status === 413) {
      console.warn("PayloadTooLarge caught in middleware:", err.message);
      return res.status(413).json({ error: "Payload too large. Please send smaller data." });
    }
    if (err instanceof SyntaxError && "body" in err) {
      return res.status(400).json({ error: "Invalid JSON format" });
    }
    next(err);
  });

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Google Play Compliance Public Routes
  app.get("/privacy", (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - Shia Quran</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; margin: 0; padding: 24px; }
    .container { max-width: 760px; margin: 0 auto; background: #ffffff; padding: 36px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    h1 { color: #047857; font-size: 26px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
    h2 { color: #0f172a; font-size: 18px; margin-top: 24px; }
    p, li { color: #334155; font-size: 15px; }
    .badge { display: inline-block; background: #ecfdf5; color: #065f46; padding: 4px 10px; border-radius: 9999px; font-weight: 600; font-size: 12px; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge">Google Play Compliance & Data Safety</span>
    <h1>Privacy Policy for Shia Quran</h1>
    <p><strong>Effective Date:</strong> January 1, 2025 (Last updated: September 2026)</p>
    <p>This Privacy Policy outlines how the <strong>Shia Quran</strong> mobile and web application ("we", "our", or "the app"), developed by <strong>Syed Murtaza Razavee</strong>, handles and protects user information.</p>
    
    <h2>1. Data Collection & Information Usage</h2>
    <p>Shia Quran is designed with maximum privacy in mind. We do not require personal accounts or phone numbers to use the core features of the Quran, recitations, or Tafseer.</p>
    <ul>
      <li><strong>Local Preferences & Reading Progress:</strong> Your bookmarks, reading progress, note drafts, selected reciter, and UI theme preferences are stored exclusively on your device via local storage. They are never transmitted or sold to third parties.</li>
      <li><strong>Community Discussions & Reflections:</strong> If you voluntarily participate in Quranic reflections, you may choose a public guest display name. Your comments and display name are stored in Google Cloud Firestore solely to render the community discussion feed.</li>
      <li><strong>Network Requests:</strong> Audio streams and Tafseer texts are requested via secure HTTPS endpoints to fetch authentic Islamic content from authorized sources.</li>
    </ul>

    <h2>2. Third-Party Services & APIs</h2>
    <p>The app relies on trusted, standard Islamic and cloud services:</p>
    <ul>
      <li><strong>Google Firebase Firestore:</strong> Cloud database for community reflections and content moderation reports.</li>
      <li><strong>AlQuran Cloud & EveryAyah:</strong> Public educational APIs providing verse-by-verse recitations and text indices.</li>
    </ul>
    <p>We do NOT use any third-party ad networks, advertising SDKs, tracking pixels, or cross-app analytics.</p>

    <h2>3. User Generated Content & Content Safety</h2>
    <p>Our community discussions follow strict standards. Objectionable content, hate speech, harassment, sectarian hostility, or blasphemous language is strictly prohibited. Users have real-time in-app capabilities to <strong>report inappropriate comments</strong> and <strong>block or mute users</strong>. Reported content is promptly reviewed and removed.</p>

    <h2>4. Account & Data Deletion</h2>
    <p>Users have complete sovereignty over their data. You can delete your guest profile, reset all bookmarks, wipe local notes, and anonymize discussions directly within the app settings under <em>"Delete Profile & Local Data"</em>. You can also request complete data removal by emailing us at <a href="mailto:Syedmurtazarazavee@gmail.com">Syedmurtazarazavee@gmail.com</a>.</p>

    <h2>5. Children's Privacy</h2>
    <p>Our app does not knowingly collect any personally identifiable information from children under 13 years of age.</p>

    <h2>6. Contact Developer</h2>
    <p>If you have any questions or privacy concerns, please contact:</p>
    <p><strong>Developer:</strong> Syed Murtaza Razavee<br>
    <strong>Email:</strong> <a href="mailto:Syedmurtazarazavee@gmail.com">Syedmurtazarazavee@gmail.com</a></p>
    
    <div class="footer">
      &copy; 2025–2026 Shia Quran. All rights reserved. Free, open, community Islamic resource.
    </div>
  </div>
</body>
</html>`);
  });

  app.get("/terms", (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service & Community Guidelines - Shia Quran</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; margin: 0; padding: 24px; }
    .container { max-width: 760px; margin: 0 auto; background: #ffffff; padding: 36px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    h1 { color: #047857; font-size: 26px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
    h2 { color: #0f172a; font-size: 18px; margin-top: 24px; }
    p, li { color: #334155; font-size: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Terms of Service & Community Guidelines</h1>
    <p>Welcome to <strong>Shia Quran</strong>. By using our application and participating in community reflections, you agree to these Terms of Service and Community Guidelines.</p>
    
    <h2>1. Acceptable Use</h2>
    <p>Shia Quran is an educational and religious study platform dedicated to the Holy Quran and authentic Tafseer. You agree to use the app in a respectful, peaceful, and constructive manner.</p>

    <h2>2. User Generated Content Policy (Zero Tolerance)</h2>
    <p>When posting reflections or comments:</p>
    <ul>
      <li>You must NOT post hate speech, harassment, sectarian insults, profanity, or defamatory content.</li>
      <li>You must NOT post spam, promotional commercial advertisements, or deceptive links.</li>
      <li>Any content violating these rules will be removed immediately, and offending users will be permanently blocked.</li>
    </ul>

    <h2>3. Reporting & Moderation</h2>
    <p>Users are encouraged to report any inappropriate content using the in-app "Report" button on any comment. Our moderation team reviews reported items within 24 hours.</p>

    <h2>4. Contact</h2>
    <p>For questions or reports: <a href="mailto:Syedmurtazarazavee@gmail.com">Syedmurtazarazavee@gmail.com</a></p>
  </div>
</body>
</html>`);
  });

  app.get("/data-deletion", (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>User Data Deletion Request - Shia Quran</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; margin: 0; padding: 24px; }
    .container { max-width: 760px; margin: 0 auto; background: #ffffff; padding: 36px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    h1 { color: #047857; font-size: 26px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
    h2 { color: #0f172a; font-size: 18px; margin-top: 24px; }
    p, li { color: #334155; font-size: 15px; }
    .step { background: #f1f5f9; padding: 14px 18px; border-radius: 10px; margin: 10px 0; border-left: 4px solid #047857; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Account & User Data Deletion Instructions</h1>
    <p>In accordance with Google Play's User Data policy, Shia Quran provides clear mechanisms for users to request and execute the deletion of their data.</p>
    
    <h2>Option 1: Instant In-App Data Deletion</h2>
    <div class="step">
      1. Open the <strong>Shia Quran</strong> app on your device.<br>
      2. Tap the <strong>Menu / Settings</strong> icon in the header.<br>
      3. Scroll to the <strong>Data & Account Privacy</strong> section.<br>
      4. Tap <strong>"Delete Profile & Local Data"</strong> and confirm.<br>
      <em>This will immediately wipe your guest profile ID, local reading history, notes, and bookmarks from your device.</em>
    </div>

    <h2>Option 2: Email Request for Cloud Deletion</h2>
    <div class="step">
      If you posted community reflections and wish to have all your cloud discussion records purged from the database, please email:<br><br>
      <strong>To:</strong> <a href="mailto:Syedmurtazarazavee@gmail.com">Syedmurtazarazavee@gmail.com</a><br>
      <strong>Subject:</strong> Shia Quran Data Deletion Request<br>
      <strong>Details:</strong> Mention your display name or rough date of posting.<br><br>
      <em>All matching user records and comments will be permanently erased within 48 hours.</em>
    </div>
  </div>
</body>
</html>`);
  });

  // Digital Asset Links for Android App Links / TWA verification
  app.get("/.well-known/assetlinks.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.json([
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "com.tafseerenamoona.app",
          sha256_cert_fingerprints: [
            "14:6D:E9:75:A8:6A:B2:D6:70:E7:0F:7B:8A:2C:9E:54:19:BE:84:89:FA:17:F1:C9:F6:41:61:A9:72:A2:3E:04"
          ]
        }
      }
    ]);
  });

  // Non-blocking background seed check
  (async () => {
    try {
      const existingArticles = await db.select().from(imamScienceArticles).limit(1).execute();
      if (existingArticles.length === 0) {
        console.log("Database empty. Seeding Imam & Science articles in background...");
        const { seed } = await import("./src/db/seed");
        await seed();
        console.log("Database seeding completed.");
      }
    } catch (e) {
      console.error("Failed to seed database:", e);
    }
  })();


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

  // Tafseer Al-Kauthar Official Digital Exegesis (from balaghulquran.com)
  app.get("/api/tafseer/kauthar/:surah/:ayah", async (req, res) => {
    try {
      const s = parseInt(req.params.surah, 10);
      const a = parseInt(req.params.ayah, 10);
      const force = req.query.force === "true";

      if (isNaN(s) || isNaN(a) || s < 1 || s > 114 || a < 1) {
        return res.status(400).json({ error: "Invalid surah or ayah number" });
      }

      const item = await fetchTafseerAlKauthar(s, a, force);
      res.json(item);
    } catch (e: any) {
      console.error(`[BalaghScraper] Error fetching s${req.params.surah}_a${req.params.ayah}:`, e.message);
      res.status(500).json({ error: e.message });
    }
  });

  // Fetch cached or bundle of whole Surah for Tafseer Al-Kauthar
  app.get("/api/tafseer/kauthar/:surah", async (req, res) => {
    try {
      const s = parseInt(req.params.surah, 10);
      if (isNaN(s) || s < 1 || s > 114) {
        return res.status(400).json({ error: "Invalid surah number" });
      }

      const surahBundlePath = path.join(process.cwd(), "public", "tafseer_kauthar", `surah_${s}.json`);
      if (fs.existsSync(surahBundlePath)) {
        const fileContent = fs.readFileSync(surahBundlePath, "utf8");
        return res.json(JSON.parse(fileContent));
      }

      res.status(404).json({ error: `Surah ${s} bundle not yet created. Ayahs can be fetched dynamically.` });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Background crawler trigger for a surah
  app.post("/api/tafseer/kauthar/crawl/:surah", async (req, res) => {
    try {
      const s = parseInt(req.params.surah, 10);
      const totalAyahs = parseInt(req.body.totalAyahs || "7", 10);

      crawlSurahKauthar(s, totalAyahs).catch(err => {
        console.error(`[CrawlError] Failed crawling Surah ${s}:`, err);
      });

      res.json({
        status: "crawling_started",
        surah: s,
        totalAyahs,
        message: `Crawling Tafseer Al-Kauthar for Surah ${s} in background.`
      });
    } catch (e: any) {
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

  // Imam & Science API Endpoints
  app.get("/api/imam-science/articles", async (req, res) => {
    try {
      const { category, search, sort = "shortest", limit = "60", offset = "0", includeContent = "false" } = req.query;
      const parsedLimit = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 60));
      const parsedOffset = Math.max(0, parseInt(offset as string, 10) || 0);

      let articlesQuery = db.select().from(imamScienceArticles);
      let articles;

      if (sort === "longest") {
        articles = await articlesQuery.orderBy(desc(imamScienceArticles.wordCount)).execute();
      } else if (sort === "recent") {
        articles = await articlesQuery.orderBy(desc(imamScienceArticles.createdAt)).execute();
      } else if (sort === "title") {
        articles = await articlesQuery.orderBy(asc(imamScienceArticles.title)).execute();
      } else {
        // Default: Shortest on top, lengthy ones and books on the bottom
        articles = await articlesQuery.orderBy(asc(imamScienceArticles.wordCount)).execute();
      }

      // Filter by category
      if (category && category !== "all") {
        const catStr = (category as string).toLowerCase();
        articles = articles.filter(a => {
          if (a.primaryCategory.toLowerCase() === catStr) return true;
          try {
            const cats: string[] = JSON.parse(a.categoriesJson || "[]");
            return cats.some(c => c.toLowerCase().includes(catStr) || c.toLowerCase().replace(/[^a-z0-9]+/g, "-") === catStr);
          } catch {
            return false;
          }
        });
      }

      // Filter by search query
      if (search && typeof search === "string" && search.trim().length > 0) {
        const q = search.toLowerCase().trim();
        articles = articles.filter(a => 
          a.title.toLowerCase().includes(q) || 
          (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
          a.content.toLowerCase().includes(q)
        );
      }

      const total = articles.length;
      const shouldIncludeFullContent = includeContent === "true";

      const paginated = articles.slice(parsedOffset, parsedOffset + parsedLimit).map(a => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        primaryCategory: a.primaryCategory,
        categories: JSON.parse(a.categoriesJson || "[]"),
        imageUrl: a.imageUrl,
        imageAlt: a.imageAlt,
        readingTime: a.readingTime,
        wordCount: a.wordCount,
        sourceUrl: a.sourceUrl,
        author: a.author,
        publishedDate: a.publishedDate,
        highlights: JSON.parse(a.highlightsJson || "[]"),
        headings: JSON.parse(a.headingsJson || "[]"),
        content: shouldIncludeFullContent ? a.content : (a.content.length > 500 ? a.content.slice(0, 500) + "..." : a.content)
      }));

      res.json({ total, articles: paginated });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/imam-science/articles/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;

      const found = await db.select().from(imamScienceArticles).where(or(
        eq(imamScienceArticles.slug, slug),
        eq(imamScienceArticles.id, slug)
      )).limit(1).execute();

      if (found.length === 0) {
        return res.status(404).json({ error: "Article not found" });
      }

      const article = found[0];
      res.json({
        ...article,
        categories: JSON.parse(article.categoriesJson || "[]"),
        highlights: JSON.parse(article.highlightsJson || "[]"),
        headings: JSON.parse(article.headingsJson || "[]")
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/imam-science/categories", async (req, res) => {
    try {
      const categories = await db.select().from(imamScienceCategories).orderBy(desc(imamScienceCategories.count)).execute();
      res.json(categories);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Alias for backward compatibility
  app.get("/api/science", async (req, res) => {
    try {
      const articles = await db.select().from(imamScienceArticles).orderBy(asc(imamScienceArticles.wordCount)).limit(50).execute();
      res.json(articles.map(a => ({
        ...a,
        categories: JSON.parse(a.categoriesJson || "[]"),
        highlights: JSON.parse(a.highlightsJson || "[]"),
        content: a.content.length > 500 ? a.content.slice(0, 500) + "..." : a.content
      })));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- Mafatih Al Jinan Endpoints ---
  let mafatihIndexCache: any[] | null = null;
  let mafatihFullCache: Map<string, any> | null = null;

  function loadMafatihData(): any[] {
    if (!mafatihIndexCache || mafatihIndexCache.length === 0) {
      try {
        const candidatePaths = [
          path.join(process.cwd(), 'public', 'mafatih_index.json'),
          path.join(process.cwd(), 'src', 'db', 'mafatih_index.json'),
          path.join(process.cwd(), 'dist', 'mafatih_index.json')
        ];
        for (const p of candidatePaths) {
          if (fs.existsSync(p)) {
            mafatihIndexCache = JSON.parse(fs.readFileSync(p, 'utf8'));
            break;
          }
        }
        if (!mafatihIndexCache) mafatihIndexCache = [];
      } catch (e) {
        console.error("Error loading mafatih index:", e);
        mafatihIndexCache = [];
      }
    }
    return mafatihIndexCache || [];
  }

  function getMafatihItem(id: string): any | null {
    if (!mafatihFullCache) {
      mafatihFullCache = new Map();
      try {
        const candidatePaths = [
          path.join(process.cwd(), 'src', 'db', 'mafatih_full_data.json'),
          path.join(process.cwd(), 'dist', 'mafatih_full_data.json'),
          path.join(process.cwd(), 'public', 'mafatih_full_data.json')
        ];
        for (const fullPath of candidatePaths) {
          if (fs.existsSync(fullPath)) {
            const items: any[] = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
            for (const item of items) {
              mafatihFullCache.set(item.id, item);
              if (item.code && !mafatihFullCache.has(item.code)) {
                mafatihFullCache.set(item.code, item);
              }
            }
            break;
          }
        }
          // Also set convenience aliases
          const aliases: Record<string, string> = {
            'kumayl': 'maf_dua40',
            'kumail': 'maf_dua40',
            'tawassul': 'maf_dua51',
            'ashura': 'maf_ziy86',
            'nudba': 'maf_ziy126a',
            'nudbah': 'maf_ziy126a',
            'faraj': 'maf_dua46b',
            'kisa': 'h_kisa',
            'ahad': 'maf_ziy128',
            'waritha': 'maf_ziy73a',
            'mashlool': 'maf_dua43',
            'sabah': 'maf_dua39',
            'jawshan': 'maf_dua47',
          };
          for (const [alias, realId] of Object.entries(aliases)) {
            const resolved = mafatihFullCache.get(realId);
            if (resolved) {
              mafatihFullCache.set(alias, resolved);
            }
          }
      } catch (e) {
        console.error("Failed to load mafatih full data:", e);
      }
    }
    return mafatihFullCache.get(id) || null;
  }

  // Get categories with counts
  app.get("/api/mafatih/categories", (req, res) => {
    try {
      const index = loadMafatihData();
      const catMap = new Map<string, { name: string; code: string; count: number; audioCount: number }>();
      for (const item of index) {
        const catName = item.mainCategory || "General";
        const catCode = item.mainCategoryCode || "general";
        const cur = catMap.get(catName) || { name: catName, code: catCode, count: 0, audioCount: 0 };
        cur.count++;
        if (item.hasAudio) cur.audioCount++;
        catMap.set(catName, cur);
      }
      res.json(Array.from(catMap.values()));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Get list of items with filtering, search, and pagination
  app.get("/api/mafatih/items", (req, res) => {
    try {
      const index = loadMafatihData();
      const { category, search, hasAudio, limit = "50", offset = "0" } = req.query;

      let filtered = index;
      if (category && category !== "all") {
        const catLower = String(category).toLowerCase();
        filtered = filtered.filter(i => 
          i.mainCategory?.toLowerCase() === catLower || 
          i.mainCategoryCode?.toLowerCase() === catLower ||
          i.categoryChain?.some((c: string) => c.toLowerCase() === catLower)
        );
      }

      if (search && typeof search === "string" && search.trim().length > 0) {
        const q = search.toLowerCase().trim();
        filtered = filtered.filter(i => 
          i.title?.toLowerCase().includes(q) ||
          i.snippet?.toLowerCase().includes(q) ||
          i.categoryChain?.some((c: string) => c.toLowerCase().includes(q))
        );
      }

      if (hasAudio === "true") {
        filtered = filtered.filter(i => i.hasAudio);
      }

      const parsedLimit = Math.min(Math.max(parseInt(limit as string) || 50, 1), 500);
      const parsedOffset = Math.max(parseInt(offset as string) || 0, 0);

      const items = filtered.slice(parsedOffset, parsedOffset + parsedLimit);
      res.json({
        total: filtered.length,
        offset: parsedOffset,
        limit: parsedLimit,
        items
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Get single full item with verses, arabic, translation, audio
  app.get("/api/mafatih/items/:id", (req, res) => {
    try {
      const id = req.params.id;
      const item = getMafatihItem(id);
      if (!item) {
        return res.status(404).json({ error: "Mafatih item not found" });
      }
      res.json(item);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Audio proxy to bypass strict CORS if needed
  app.get("/api/mafatih/audio-proxy", async (req, res) => {
    try {
      const audioUrl = req.query.url as string;
      if (!audioUrl || !audioUrl.startsWith("http")) {
        return res.status(400).send("Invalid audio URL");
      }
      const upstream = await fetch(audioUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ShiaQuranApp/1.0',
          'Referer': 'https://www.ya-mahdi.net/'
        }
      });
      if (!upstream.ok) {
        return res.status(upstream.status).send("Failed to fetch audio stream");
      }
      const contentType = upstream.headers.get("content-type") || "audio/mp4";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "public, max-age=86400");
      if (upstream.body) {
        const arrayBuf = await upstream.arrayBuffer();
        res.send(Buffer.from(arrayBuf));
      } else {
        res.status(404).send("Empty audio stream");
      }
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  });

  // Always serve PWA service worker, manifest, and static data files with correct MIME types
  app.get(['/sw.js', '/registerSW.js', '/manifest.webmanifest', '/mafatih_index.json'], (req, res, next) => {
    const filename = req.path.replace(/^\//, '');
    const candidatePaths = [
      path.join(process.cwd(), 'dist', filename),
      path.join(process.cwd(), 'public', filename),
      path.join(process.cwd(), 'src', 'db', filename)
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        if (filename.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
        } else if (filename.endsWith('.webmanifest')) {
          res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
        } else if (filename.endsWith('.json')) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=3600');
        }
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        return res.sendFile(p);
      }
    }
    next();
  });

  app.get(/^\/workbox-[a-zA-Z0-9_-]+\.js$/, (req, res, next) => {
    const filename = req.path.replace(/^\//, '');
    const candidatePaths = [
      path.join(process.cwd(), 'dist', filename),
      path.join(process.cwd(), 'public', filename)
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        return res.sendFile(p);
      }
    }
    next();
  });

  // Vite middleware for development
  const isProd = process.env.NODE_ENV === "production" || process.argv[1]?.endsWith("server.cjs");
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === "true" ? false : undefined,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Ensure HTML and service workers are not cached stale so older clients seamlessly update
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('index.html') || filePath.endsWith('sw.js') || filePath.endsWith('manifest.webmanifest')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      }
    }));
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is currently in use. Exiting cleanly.`);
      process.exit(1);
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });

  const handleTermination = () => {
    server.close(() => {
      process.exit(0);
    });
  };
  process.on("SIGTERM", handleTermination);
  process.on("SIGINT", handleTermination);
}

startServer();
