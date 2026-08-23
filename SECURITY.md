# Security Guidelines

## 🔐 Secret Management

This project contains sensitive API keys and credentials that should NEVER be committed to version control.

### Firebase API Key

The Firebase API key is now managed through environment variables to prevent accidental exposure.

#### Setup Instructions

**For Local Development:**

1. Create a `.env` file in the root directory (this file is in `.gitignore` and will not be tracked):
   ```
   FIREBASE_API_KEY=YOUR_ACTUAL_FIREBASE_API_KEY
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   ```

2. In your application code, load the environment variable:
   ```javascript
   const firebaseConfig = {
     apiKey: process.env.FIREBASE_API_KEY,
     // ... other config
   };
   ```

**For Production Deployment:**

Set the `FIREBASE_API_KEY` environment variable in your hosting platform:

- **Google Cloud Run**: Set environment variables in the service configuration
- **Vercel/Netlify**: Use the environment variables dashboard
- **Docker**: Use Docker secrets or environment variable injection
- **GitHub Actions**: Use repository secrets via `${{ secrets.FIREBASE_API_KEY }}`

### What Changed

- ✅ Removed hardcoded API key from `firebase-applet-config.json`
- ✅ Updated `.gitignore` to prevent `.env` files from being tracked
- ✅ Added `.env.example` template showing required variables
- ✅ Updated configuration to use `${FIREBASE_API_KEY}` placeholder

### Never Commit

- `.env` files
- API keys or credentials
- OAuth tokens or secrets
- Private certificates

### If You Accidentally Commit a Secret

1. **Immediately revoke** the exposed key in your Firebase console
2. **Generate a new key**
3. **Update your deployment** with the new key
4. **Report the incident** to your security team

### Prevention Tools

To prevent future leaks, consider using:

- **git-secrets**: Pre-commit hook to detect secrets
- **gitleaks**: Scan repository history for secrets
- **GitHub Secret Scanning**: Enable in repository settings
- **Pre-commit hooks**: Validate before commits are allowed

## Questions?

Contact: Your security team or repository maintainer
