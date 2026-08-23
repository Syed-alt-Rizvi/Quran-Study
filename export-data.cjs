const Database = require('better-sqlite3');
const fs = require('fs');
const os = require('os');
const path = require('path');

const isCloudRun = process.env.K_SERVICE !== undefined || process.env.NODE_ENV === 'production';
const dbDir = isCloudRun ? os.tmpdir() : process.cwd();
const dbPath = path.join(dbDir, 'quran.db');

const db = new Database(dbPath);

const articles = db.prepare('SELECT * FROM science_articles').all();
const topics = db.prepare('SELECT * FROM science_topics').all();
const articleTopics = db.prepare('SELECT * FROM article_topics').all();
const relationships = db.prepare('SELECT * FROM ayah_science_relationships').all();

const data = {
  articles,
  topics,
  articleTopics,
  relationships
};

fs.writeFileSync('src/db/data.json', JSON.stringify(data, null, 2));
console.log("Data exported to src/db/data.json successfully.");
