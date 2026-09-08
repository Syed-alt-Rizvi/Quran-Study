import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db";
import { discussions, ayahReferences, tafseerReferences, scienceArticles, ayahScienceRelationships } from "./src/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { getOrRefineTafseer } from "./server/geminiTafseer";
import { cleanTafseerUrduText } from "./src/services/cleanTafseerText";

import { seed } from "./src/db/seed";

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
      const existingArticles = await db.select().from(scienceArticles).limit(1).execute();
      if (existingArticles.length === 0) {
        console.log("Database empty. Seeding in background...");
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

  // Tafseer Al-Kauthar Direct API with Gemini AI Approximation
  app.get("/api/tafseer/kauthar/:surah/:ayah", async (req, res) => {
    try {
      const s = parseInt(req.params.surah, 10);
      const a = parseInt(req.params.ayah, 10);
      const autoRefine = req.query.autoRefine === "true" || req.query.refine === "true";

      // 1. Check refined cache directory first
      const refinedFilePath = path.join(process.cwd(), "public", "tafseer_kauthar_refined", `s${s}_a${a}.json`);
      if (fs.existsSync(refinedFilePath)) {
        try {
          const cached = JSON.parse(fs.readFileSync(refinedFilePath, "utf8"));
          if (cached && cached.text) {
            return res.json({
              surah: s,
              ayah: a,
              ur: cached.text,
              en: "Tafseer Al-Kauthar by Allama Sheikh Mohsin Ali Najafi",
              tafseer_title: "تفسیر الکوثر — علامہ شیخ محسن علی نجفی"
            });
          }
        } catch (e) {}
      }

      const surahFilePath = path.join(process.cwd(), "public", "tafseer_kauthar", `surah_${s}.json`);
      let rawMatch: any = null;
      
      if (fs.existsSync(surahFilePath)) {
        const fileContent = fs.readFileSync(surahFilePath, "utf8");
        const list = JSON.parse(fileContent);
        rawMatch = list.find((item: any) => item.ayah === a);
      }

      if (rawMatch) {
        const cleanedUrdu = cleanTafseerUrduText(rawMatch.ur || "");
        return res.json({
          ...rawMatch,
          ur: cleanedUrdu,
          en: "Tafseer Al-Kauthar by Allama Sheikh Mohsin Ali Najafi",
          tafseer_title: "تفسیر الکوثر — علامہ شیخ محسن علی نجفی"
        });
      }

      res.status(404).json({ error: `Tafseer Al-Kauthar not found for Surah ${s}, Ayah ${a}` });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Explicit endpoint to trigger Gemini AI approximation and grammatical correction
  app.post("/api/tafseer/kauthar/refine", async (req, res) => {
    try {
      const { surah, ayah, rawText, force } = req.body;
      const s = parseInt(surah, 10);
      const a = parseInt(ayah, 10);

      let textToRefine = rawText;
      if (!textToRefine) {
        const surahFilePath = path.join(process.cwd(), "public", "tafseer_kauthar", `surah_${s}.json`);
        if (fs.existsSync(surahFilePath)) {
          const list = JSON.parse(fs.readFileSync(surahFilePath, "utf8"));
          const match = list.find((item: any) => item.ayah === a);
          if (match) textToRefine = match.ur;
        }
      }

      if (!textToRefine) {
        return res.status(404).json({ error: "Text to refine not found." });
      }

      const result = await getOrRefineTafseer(s, a, textToRefine, force === true);
      return res.json({
        surah: s,
        ayah: a,
        ur: result.text,
        isAiRefined: result.isAiRefined
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/tafseer/kauthar/:surah", async (req, res) => {
    try {
      const s = parseInt(req.params.surah, 10);
      const surahFilePath = path.join(process.cwd(), "public", "tafseer_kauthar", `surah_${s}.json`);
      if (fs.existsSync(surahFilePath)) {
        const fileContent = fs.readFileSync(surahFilePath, "utf8");
        return res.json(JSON.parse(fileContent));
      }
      res.status(404).json({ error: `Tafseer Al-Kauthar not found for Surah ${s}` });
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
  const isProd = process.env.NODE_ENV === "production" || process.argv[1]?.endsWith("server.cjs");
  if (!isProd) {
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
