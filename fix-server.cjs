const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Move import { sqlite } from './src/db'; to the top
code = code.replace("import { sqlite } from './src/db';", "");
code = code.replace('import { db } from "./src/db";', 'import { db, sqlite } from "./src/db";');

fs.writeFileSync('server.ts', code);
