import fs from 'fs';
import path from 'path';
import { db } from './index';
import { imamScienceArticles, imamScienceCategories } from './schema';

export async function seed() {
  const dataPath = path.join(process.cwd(), 'public', 'imam_science_data.json');
  if (!fs.existsSync(dataPath)) {
    console.log("No imam_science_data.json found in public directory to seed.");
    return;
  }
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8')) as any;
  console.log("Starting to seed database from public/imam_science_data.json...");

  if (data.categories && data.categories.length > 0) {
    const formattedCategories = data.categories.map((c: any) => ({
      id: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: c.name,
      slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      count: c.count || 0
    }));
    try {
      await db.delete(imamScienceCategories).execute();
      await db.insert(imamScienceCategories).values(formattedCategories).execute();
    } catch (e: any) {
      console.warn("Categories already seeded or duplicate:", e.message);
    }
  }

  if (data.articles && data.articles.length > 0) {
    const formattedArticles = data.articles.map((a: any) => ({
      id: a.id || a.slug,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt || null,
      content: a.content || "",
      primaryCategory: a.primaryCategory || (a.categories && a.categories[0]) || "Ahlebait Teachings",
      categoriesJson: JSON.stringify(a.categories || []),
      imageUrl: a.imageUrl || "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=800&q=80",
      imageAlt: a.imageAlt || a.title,
      highlightsJson: JSON.stringify(a.highlights || []),
      headingsJson: JSON.stringify(a.headings || []),
      readingTime: a.readingTime || "3 min read",
      wordCount: a.wordCount || 0,
      sourceUrl: a.sourceUrl || "https://imamandscience.com/all-topics/",
      author: a.author || "Imam & Science Research",
      publishedDate: a.publishedDate || "2025-2026"
    }));
    
    try {
      await db.delete(imamScienceArticles).execute();
    } catch (e: any) {
      console.warn("Could not delete existing articles:", e.message);
    }

    const chunkSize = 25;
    for (let i = 0; i < formattedArticles.length; i += chunkSize) {
      const chunk = formattedArticles.slice(i, i + chunkSize);
      try {
        await db.insert(imamScienceArticles).values(chunk).execute();
      } catch (e: any) {
        console.warn("Articles chunk error (possible duplicates):", e.message);
      }
    }
  }

  console.log("Seeding complete. Seeded Imam & Science articles.");
}

// Auto-run if executed directly via CLI
if (process.argv[1] && (process.argv[1].includes('seed.ts') || process.argv[1].includes('seed.js'))) {
  seed().catch(err => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
}
