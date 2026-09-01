import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const auth = getAuth(app);

createUserWithEmailAndPassword(auth, "testuser" + Date.now() + "@example.com", "password123")
  .then((userCredential) => {
    console.log("SUCCESS:", userCredential.user.uid);
    process.exit(0);
  })
  .catch((error) => {
    console.error("ERROR:", error.code, error.message);
    process.exit(1);
  });
