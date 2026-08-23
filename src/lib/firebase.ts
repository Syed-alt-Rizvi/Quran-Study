import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "grounded-clover-gf4nj",
  appId: "1:835618539032:web:c997f9631d315922e2a56d",
  apiKey: "AIzaSyDwKtJybm0cRwdPl9fMW5BV6JvlWRSaZ4k",
  authDomain: "grounded-clover-gf4nj.firebaseapp.com",
  storageBucket: "grounded-clover-gf4nj.firebasestorage.app",
  messagingSenderId: "835618539032",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-tafseerenamonaqu-e45100a9-eb66-416f-9e57-d1e580b5b9a6");
