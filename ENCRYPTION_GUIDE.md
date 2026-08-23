# Encryption Setup for Sensitive Secrets

This guide explains how to encrypt and protect the Firebase API key using industry-standard encryption.

## Option 1: Using `dotenv-enc` (Recommended for Development)

### Installation
```bash
npm install dotenv-enc
```

### Setup
1. Create an encrypted `.env.enc` file:
```bash
npx dotenv-enc set FIREBASE_API_KEY AIzaSyDwKtJybm0cRwdPl9fMW5BV6JvlWRSaZ4k
```

2. This creates an encrypted version of your secrets. Update your app to load it:
```javascript
import * as dotenvEnc from 'dotenv-enc';
dotenvEnc.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  // ... rest of config
};
```

3. Add to `.gitignore`:
```
.env.enc.key
```

## Option 2: Using `crypto` (Built-in Node.js - No Dependencies)

### Encryption Script
Create `encrypt-secrets.js`:
```javascript
const crypto = require('crypto');
const fs = require('fs');

const secret = 'AIzaSyDwKtJybm0cRwdPl9fMW5BV6JvlWRSaZ4k';
const encryptionKey = crypto.randomBytes(32); // Store this securely
const iv = crypto.randomBytes(16);

const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
let encrypted = cipher.update(secret, 'utf8', 'hex');
encrypted += cipher.final('hex');

// Save encrypted key (safe to commit)
fs.writeFileSync('firebase-key.enc', JSON.stringify({ encrypted, iv: iv.toString('hex') }));

// Save encryption key (DO NOT COMMIT - add to .env)
fs.writeFileSync('.env.local', `ENCRYPTION_KEY=${encryptionKey.toString('hex')}`);

console.log('✅ Encrypted successfully');
```

### Decryption Script
Create `decrypt-secrets.js`:
```javascript
const crypto = require('crypto');
const fs = require('fs');

const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const { encrypted, iv } = JSON.parse(fs.readFileSync('firebase-key.enc', 'utf8'));

const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, Buffer.from(iv, 'hex'));
let decrypted = decipher.update(encrypted, 'hex', 'utf8');
decrypted += decipher.final('utf8');

console.log('Firebase API Key:', decrypted);
```

## Option 3: Using AWS KMS / Google Cloud KMS (Enterprise)

For production environments with high security requirements:

### Google Cloud KMS
```bash
# Install Cloud KMS client
npm install @google-cloud/kms

# Encrypt
gcloud kms encrypt --plaintext-file=secret.txt \
  --ciphertext-file=secret.txt.enc \
  --location=global \
  --keyring=my-keyring \
  --key=my-key

# Decrypt in your app
const kms = new KMS();
const [result] = await kms.decrypt(config);
```

## Current Setup

Your Firebase API key is now:
- ✅ Removed from source code
- ✅ Stored in environment variables
- ✅ Protected by `.gitignore`
- ✅ Ready to be encrypted using any of the above methods

## Recommended Approach

**For this project (Development):**
- Use **Option 1: dotenv-enc** (simplest and most secure for development)
- Or **Option 2: crypto** (if you prefer no external dependencies)

**For Production:**
- Use **Option 3: Cloud KMS** (enterprise-grade security with audit logs)
- Or set secrets in your hosting platform (Vercel, Cloud Run, etc.) which handle encryption automatically

## Next Steps

1. Choose an encryption method above
2. Implement it in your setup
3. Commit the encrypted file (safe to track)
4. Keep the encryption key in `.env` (never commit)

---

**Questions?** Refer to the official docs:
- [dotenv-enc Documentation](https://github.com/abhishekpanchal/dotenv-enc)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)
- [Google Cloud KMS](https://cloud.google.com/kms/docs)
