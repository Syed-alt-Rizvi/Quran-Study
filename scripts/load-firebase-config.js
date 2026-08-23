import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local if it exists
const envLocalPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}

// Load encryption key from .env.local or environment
const encryptionKeyHex = process.env.ENCRYPTION_KEY;
if (!encryptionKeyHex) {
  throw new Error('ENCRYPTION_KEY not found in environment. Make sure .env.local exists or ENCRYPTION_KEY is set.');
}

const encryptionKey = Buffer.from(encryptionKeyHex, 'hex');

// Read encrypted key
const encryptedFilePath = path.join(__dirname, '../firebase-key.enc');
const { encrypted, iv, algorithm } = JSON.parse(
  fs.readFileSync(encryptedFilePath, 'utf8')
);

// Decrypt
const decipher = crypto.createDecipheriv(algorithm, encryptionKey, Buffer.from(iv, 'hex'));
let decrypted = decipher.update(encrypted, 'hex', 'utf8');
decrypted += decipher.final('utf8');

// Create Firebase config with decrypted key
const firebaseConfig = {
  projectId: "grounded-clover-gf4nj",
  appId: "1:835618539032:web:c997f9631d315922e2a56d",
  apiKey: decrypted,
  authDomain: "grounded-clover-gf4nj.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-tafseerenamonaqu-e45100a9-eb66-416f-9e57-d1e580b5b9a6",
  storageBucket: "grounded-clover-gf4nj.firebasestorage.app",
  messagingSenderId: "835618539032",
  measurementId: "",
  oAuthClientId: "835618539032-2umsn13vg9t0kvcrbcustndhn73sndsu.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

export default firebaseConfig;
