#!/bin/bash

echo "🔐 Encrypting Firebase API Key..."
node scripts/encrypt-secrets.js

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Encryption complete!"
  echo ""
  echo "📋 Next steps:"
  echo "1. Commit firebase-key.enc to your repository:"
  echo "   git add firebase-key.enc"
  echo "   git commit -m 'feat: Add encrypted Firebase API key'"
  echo ""
  echo "2. Share .env.local securely with your team (via encrypted email, password manager, etc.)"
  echo ""
  echo "3. For local development, make sure .env.local is in your .gitignore"
  echo ""
  echo "4. For production, set the ENCRYPTION_KEY environment variable"
  echo ""
  echo "5. Load Firebase config in your app:"
  echo "   import firebaseConfig from './scripts/load-firebase-config.js';"
  echo ""
else
  echo "❌ Encryption failed"
  exit 1
fi
