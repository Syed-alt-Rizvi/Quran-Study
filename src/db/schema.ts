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

export const scienceArticles = sqliteTable('science_articles', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author'),
  content: text('content').notNull(),
  source: text('source').notNull(),
  originalUrl: text('original_url'),
  license: text('license'),
  publicationDate: text('publication_date'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const scienceTopics = sqliteTable('science_topics', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
});

export const articleTopics = sqliteTable('article_topics', {
  id: text('id').primaryKey(),
  articleId: text('article_id').notNull().references(() => scienceArticles.id),
  topicId: text('topic_id').notNull().references(() => scienceTopics.id),
});

export const ayahScienceRelationships = sqliteTable('ayah_science_relationships', {
  id: text('id').primaryKey(),
  surahNumber: integer('surah_number').notNull(),
  ayahNumber: integer('ayah_number').notNull(),
  articleId: text('article_id').notNull().references(() => scienceArticles.id),
  explanation: text('explanation'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
