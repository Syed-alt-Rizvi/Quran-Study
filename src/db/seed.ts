import { db } from './index';
import { scienceArticles, scienceTopics, articleTopics, ayahScienceRelationships } from './schema';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  const articleId1 = uuidv4();
  const articleId2 = uuidv4();
  const topicId1 = uuidv4();
  
  await db.insert(scienceTopics).values({
    id: topicId1,
    name: 'Embryology'
  }).execute();
  
  await db.insert(scienceArticles).values([
    {
      id: articleId1,
      title: 'Embryology in the Quran',
      author: 'Dr. Keith Moore',
      content: 'The Quran describes the stages of human development in the womb with remarkable accuracy for its time. It mentions the "Alaqah" (leech-like structure) stage, which corresponds perfectly to the early embryo.',
      source: 'The Developing Human',
      originalUrl: 'https://example.com/embryology'
    },
    {
      id: articleId2,
      title: 'The Expanding Universe',
      author: 'Various Cosmologists',
      content: 'In Surah Adh-Dhariyat, it is mentioned that the universe is constantly expanding. Modern cosmology confirmed this in the 20th century.',
      source: 'Modern Cosmology and the Quran',
    }
  ]).execute();
  
  await db.insert(articleTopics).values({
    id: uuidv4(),
    articleId: articleId1,
    topicId: topicId1
  }).execute();
  
  await db.insert(ayahScienceRelationships).values([
    {
      id: uuidv4(),
      surahNumber: 23,
      ayahNumber: 14,
      articleId: articleId1,
      explanation: 'Matches the description of Alaqah and Mudghah.'
    },
    {
      id: uuidv4(),
      surahNumber: 51,
      ayahNumber: 47,
      articleId: articleId2,
      explanation: 'Mentions the expansion of the universe.'
    }
  ]).execute();
  
  console.log("Seeding complete.");
}
seed().catch(console.error);
