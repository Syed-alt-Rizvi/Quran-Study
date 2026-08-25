const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Move import { sqlite } from './src/db'; to the top
code = code.replace("import { sqlite } from './src/db';", "");
code = code.replace('import { db } from "./src/db";', 'import { db, sqlite } from "./src/db";');

// Ensure db.insert uses execute() instead of run()? No, with drizzle + better-sqlite3, .run() is valid, but the user used .execute() initially. Let's change .run() to .execute().
code = code.replace(/\.run\(\);/g, '.execute();');

fs.writeFileSync('server.ts', code);
