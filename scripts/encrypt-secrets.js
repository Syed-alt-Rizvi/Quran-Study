import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Firebase API key to encrypt
const FIREBASE_API_KEY = 'AIzaSyDwKtJybm0cRwdPl9fMW5BV6JvlWRSaZ4k';

// Generate encryption key (256-bit for AES-256)
const encryptionKey = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

// Encrypt the Firebase API key
const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
let encrypted = cipher.update(FIREBASE_API_KEY, 'utf8', 'hex');
encrypted += cipher.final('hex');

// Ensure scripts directory exists
const scriptsDir = path.join(__dirname);
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// Save encrypted key to file (SAFE to commit)
const encryptedData = {
  encrypted,
  iv: iv.toString('hex'),
  algorithm: 'aes-256-cbc'
};
fs.writeFileSync(
  path.join(__dirname, '../firebase-key.enc'),
  JSON.stringify(encryptedData, null, 2)
);

// Save encryption key to .env.local (DO NOT COMMIT)
const envContent = `# Encryption key for Firebase API - DO NOT COMMIT THIS FILE
ENCRYPTION_KEY=${encryptionKey.toString('hex')}
FIREBASE_API_KEY_ENCRYPTED=true
`;
fs.writeFileSync(
  path.join(__dirname, '../.env.local'),
  envContent
);

// Update .gitignore to protect encryption key
const gitignorePath = path.join(__dirname, '../.gitignore');
let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
if (!gitignoreContent.includes('.env.local')) {
  gitignoreContent += '\n# Encryption keys - NEVER commit\n.env.local\n.env.*.local\n';
  fs.writeFileSync(gitignorePath, gitignoreContent);
}

console.log('✅ Encryption successful!');
console.log('');
console.log('📁 Files created:');
console.log('   • firebase-key.enc (SAFE to commit - encrypted key)');
console.log('   • .env.local (added to .gitignore - encryption key)');
console.log('');
console.log('🔐 Your Firebase API key is now encrypted with AES-256-CBC');
console.log('');
console.log('⚠️  IMPORTANT:');
console.log('   1. Commit firebase-key.enc to your repository');
console.log('   2. NEVER commit .env.local');
console.log('   3. Share .env.local securely with your team (via encrypted email, password manager, etc.)');
console.log('   4. For production, set ENCRYPTION_KEY as an environment variable');
