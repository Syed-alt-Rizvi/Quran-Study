const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const importSeed = `import { seed } from "./src/db/seed";\nasync function startServer() {`;
code = code.replace(`async function startServer() {`, importSeed);

const seedCheck = `async function startServer() {
  // Check and seed DB if empty
  try {
    const existingArticles = await db.select().from(scienceArticles).limit(1).execute();
    if (existingArticles.length === 0) {
      console.log("Database empty. Seeding...");
      await seed();
    }
  } catch (e) {
    console.error("Failed to seed database:", e);
  }
`;
code = code.replace(`async function startServer() {`, seedCheck);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts successfully");
