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
