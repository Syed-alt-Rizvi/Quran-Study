import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { DatabaseSync } from 'node:sqlite';
import * as schema from './schema';
import path from 'path';
import os from 'os';

// Use /tmp in production to avoid read-only filesystem errors in Cloud Run
const isCloudRun = process.env.K_SERVICE !== undefined || process.env.NODE_ENV === 'production';
const dbDir = isCloudRun ? os.tmpdir() : process.cwd();
const dbPath = path.join(dbDir, 'quran.db');

const sqlite = new DatabaseSync(dbPath);

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
CREATE TABLE IF NOT EXISTS imam_science_articles (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  primary_category TEXT NOT NULL DEFAULT 'Ahlebait Teachings',
  categories_json TEXT NOT NULL DEFAULT '[]',
  image_url TEXT NOT NULL,
  image_alt TEXT,
  highlights_json TEXT DEFAULT '[]',
  headings_json TEXT DEFAULT '[]',
  reading_time TEXT DEFAULT '3 min read',
  word_count INTEGER DEFAULT 0,
  source_url TEXT NOT NULL,
  author TEXT DEFAULT 'Imam & Science Research',
  published_date TEXT DEFAULT '2025-2026',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS imam_science_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  count INTEGER NOT NULL DEFAULT 0
);
`);

export const db = drizzle(async (sql, params, method) => {
  try {
    const stmt = sqlite.prepare(sql);
    if (method === 'run') {
      stmt.run(...params);
      return { rows: [] };
    } else if (method === 'get') {
      const row = stmt.get(...params);
      return { rows: row ? Object.values(row) : [] };
    } else {
      const rows = stmt.all(...params);
      return { rows: rows.map((r: any) => Object.values(r)) };
    }
  } catch (err: any) {
    console.error('SQLite execution error:', err);
    throw err;
  }
}, { schema });