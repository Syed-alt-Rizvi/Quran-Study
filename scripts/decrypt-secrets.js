import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load encryption key from .env.local or environment
const encryptionKeyHex = process.env.ENCRYPTION_KEY;
if (!encryptionKeyHex) {
  console.error('❌ Error: ENCRYPTION_KEY not found in environment');
  console.error('Make sure .env.local is loaded or ENCRYPTION_KEY is set');
  process.exit(1);
}

const encryptionKey = Buffer.from(encryptionKeyHex, 'hex');

// Read encrypted key
const encryptedFilePath = path.join(__dirname, '../firebase-key.enc');
const { encrypted, iv, algorithm } = JSON.parse(
  fs.readFileSync(encryptedFilePath, 'utf8')
);

// Decrypt
try {
  const decipher = crypto.createDecipheriv(algorithm, encryptionKey, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  console.log('✅ Decryption successful!');
  console.log('🔑 Firebase API Key:', decrypted);
  
  process.env.FIREBASE_API_KEY = decrypted;
  
} catch (error) {
  console.error('❌ Decryption failed - encryption key may be incorrect');
  console.error('Error:', error.message);
  process.exit(1);
}
