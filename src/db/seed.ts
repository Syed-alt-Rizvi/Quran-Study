import { db } from './index';
import { scienceArticles, scienceTopics, articleTopics, ayahScienceRelationships } from './schema';
import dataRaw from './data.json';

const data = dataRaw as any;

export async function seed() {
  console.log("Starting to seed database from data.json...");

  if (data.topics && data.topics.length > 0) {
    await db.insert(scienceTopics).values(data.topics).execute();
  }

  if (data.articles && data.articles.length > 0) {
    const formatted = data.articles.map(a => ({
      id: a.id,
      title: a.title,
      author: a.author,
      content: a.content,
      source: a.source,
      originalUrl: a.original_url,
      license: a.license,
      publicationDate: a.publication_date,
      createdAt: a.created_at
    }));
    
    const chunkSize = 50;
    for (let i = 0; i < formatted.length; i += chunkSize) {
      const chunk = formatted.slice(i, i + chunkSize);
      await db.insert(scienceArticles).values(chunk).execute();
    }
  }

  if (data.articleTopics && data.articleTopics.length > 0) {
    const formatted = data.articleTopics.map(a => ({
      id: a.id,
      articleId: a.article_id,
      topicId: a.topic_id
    }));
    const chunkSize = 50;
    for (let i = 0; i < formatted.length; i += chunkSize) {
      const chunk = formatted.slice(i, i + chunkSize);
      await db.insert(articleTopics).values(chunk).execute();
    }
  }

  if (data.relationships && data.relationships.length > 0) {
    const formatted = data.relationships.map(r => ({
      id: r.id,
      surahNumber: r.surah_number,
      ayahNumber: r.ayah_number,
      articleId: r.article_id,
      explanation: r.explanation,
      createdAt: r.created_at
    }));
    const chunkSize = 50;
    for (let i = 0; i < formatted.length; i += chunkSize) {
      const chunk = formatted.slice(i, i + chunkSize);
      await db.insert(ayahScienceRelationships).values(chunk).execute();
    }
  }

  console.log("Seeding complete. Seeded " + data.articles.length + " articles.");
}