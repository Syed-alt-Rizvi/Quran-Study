import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';
import os from 'os';

// Use /tmp in production to avoid read-only filesystem errors in Cloud Run
const isCloudRun = process.env.K_SERVICE !== undefined || process.env.NODE_ENV === 'production';
const dbDir = isCloudRun ? os.tmpdir() : process.cwd();
const dbPath = path.join(dbDir, 'quran.db');

export const sqlite = new Database(dbPath);

sqlite.exec(`
CREATE TABLE IF NOT EXISTS discussions (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Anonymous',
  email TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reply_to_id TEXT,
  is_moderated INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS ayah_references (
  id TEXT PRIMARY KEY,
  discussion_id TEXT NOT NULL,
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  surah_name TEXT,
  FOREIGN KEY (discussion_id) REFERENCES discussions(id)
);
CREATE TABLE IF NOT EXISTS tafseer_references (
  id TEXT PRIMARY KEY,
  discussion_id TEXT NOT NULL,
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  language TEXT NOT NULL,
  source TEXT NOT NULL,
  FOREIGN KEY (discussion_id) REFERENCES discussions(id)
);
CREATE TABLE IF NOT EXISTS science_articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  content TEXT NOT NULL,
  source TEXT NOT NULL,
  original_url TEXT,
  license TEXT,
  publication_date TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS science_topics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS article_topics (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  FOREIGN KEY (article_id) REFERENCES science_articles(id),
  FOREIGN KEY (topic_id) REFERENCES science_topics(id)
);
CREATE TABLE IF NOT EXISTS ayah_science_relationships (
  id TEXT PRIMARY KEY,
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  article_id TEXT NOT NULL,
  explanation TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES science_articles(id)
);
`);

export const db = drizzle(sqlite, { schema });