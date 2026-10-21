import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

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

