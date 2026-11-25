import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';
import baseConfig from '../../firebase-applet-config.json';

// Allow overriding via environment variables (e.g. CI/CD or public repo deployments)
const env = typeof import.meta !== 'undefined' ? (import.meta as any).env : {};
const firebaseConfig = {
  ...baseConfig,
  apiKey: env?.VITE_FIREBASE_API_KEY || baseConfig.apiKey || '',
  projectId: env?.VITE_FIREBASE_PROJECT_ID || baseConfig.projectId || '',
  authDomain: env?.VITE_FIREBASE_AUTH_DOMAIN || baseConfig.authDomain || '',
  firestoreDatabaseId: env?.VITE_FIREBASE_DATABASE_ID || baseConfig.firestoreDatabaseId || '',
};

let app: FirebaseApp;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (e) {
  console.warn('Firebase app initialization notice:', e);
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig, 'fallback-app');
}

const dbName = firebaseConfig.firestoreDatabaseId || undefined;

let firestoreInstance: Firestore;
try {
  // Use long-polling to prevent WebSocket/streaming timeouts in sandboxed iframes and web environments
  firestoreInstance = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  }, dbName);
} catch {
  firestoreInstance = dbName ? getFirestore(app, dbName) : getFirestore(app);
}

export const db: Firestore = firestoreInstance;
export const auth: Auth = getAuth(app);
export { app };

