import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const discussions = sqliteTable('discussions', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  author: text('author').notNull().default('Anonymous'),
  email: text('email'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  replyToId: text('reply_to_id'),
  isModerated: integer('is_moderated', { mode: 'boolean' }).notNull().default(false),
});

export const ayahReferences = sqliteTable('ayah_references', {
  id: text('id').primaryKey(),
  discussionId: text('discussion_id').notNull().references(() => discussions.id),
  surahNumber: integer('surah_number').notNull(),
  ayahNumber: integer('ayah_number').notNull(),
  surahName: text('surah_name'),
});

export const tafseerReferences = sqliteTable('tafseer_references', {
  id: text('id').primaryKey(),
  discussionId: text('discussion_id').notNull().references(() => discussions.id),
  surahNumber: integer('surah_number').notNull(),
  ayahNumber: integer('ayah_number').notNull(),
  language: text('language').notNull(),
  source: text('source').notNull(),
});

export const imamScienceArticles = sqliteTable('imam_science_articles', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  primaryCategory: text('primary_category').notNull().default('Ahlebait Teachings'),
  categoriesJson: text('categories_json').notNull().default('[]'),
  imageUrl: text('image_url').notNull(),
  imageAlt: text('image_alt'),
  highlightsJson: text('highlights_json').default('[]'),
  headingsJson: text('headings_json').default('[]'),
  readingTime: text('reading_time').default('3 min read'),
  wordCount: integer('word_count').default(0),
  sourceUrl: text('source_url').notNull(),
  author: text('author').default('Imam & Science Research'),
  publishedDate: text('published_date').default('2025-2026'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const imamScienceCategories = sqliteTable('imam_science_categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  count: integer('count').notNull().default(0),
});
