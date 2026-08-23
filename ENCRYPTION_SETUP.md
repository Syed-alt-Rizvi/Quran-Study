# Firebase Encrypted Config

This directory contains the encrypted Firebase configuration.

## Files

- `firebase-key.enc` - **SAFE TO COMMIT** - Encrypted Firebase API key
- `.env.local` - **DO NOT COMMIT** - Contains the encryption key (in .gitignore)

## How It Works

1. Firebase API key is encrypted using AES-256-CBC
2. Only the encryption key in `.env.local` can decrypt it
3. The encrypted file is safe to commit to Git
4. The encryption key is never committed

## Usage in Your App

```javascript
import firebaseConfig from './scripts/load-firebase-config.js';
import { initializeApp } from 'firebase/app';

// Automatically decrypts and initializes Firebase
const app = initializeApp(firebaseConfig);
```

## For Team Members

To use this encrypted key:

1. Receive `.env.local` from the team lead (securely)
2. Place it in the project root
3. The decryption will happen automatically when loading the config

## For Production

Set the `ENCRYPTION_KEY` environment variable in your hosting platform:
- Google Cloud Run
- Vercel
- Netlify
- AWS Lambda
- etc.

The app will automatically decrypt the key on startup.
