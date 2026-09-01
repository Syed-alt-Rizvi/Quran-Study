const fs = require('fs');

function updateGlobalDiscussions() {
  let content = fs.readFileSync('src/components/GlobalDiscussions.tsx', 'utf8');
  
  // Replace auth imports
  content = content.replace(
    /import { GoogleAuthProvider.*?from "firebase\/auth";/g,
    `import { getGuestProfile, saveGuestProfile, GuestProfile } from '../utils/guestAuth';`
  );
  content = content.replace(/import { db, auth } from '\.\.\/utils\/firebase';/, `import { db } from '../utils/firebase';`);
  
  // Replace state
  content = content.replace(
    /const \[currentUser, setCurrentUser\] = useState<FirebaseUser \| null>\(null\);/,
    `const [currentUser, setCurrentUser] = useState<GuestProfile | null>(getGuestProfile());`
  );

  // Remove auth observer
  content = content.replace(
    /const unsubscribeAuth = onAuthStateChanged\(auth, \(user\) => {[\s\S]*?}\);/,
    `if (currentUser && !author) {\n      setAuthor(currentUser.displayName || "Anonymous");\n    }`
  );

  content = content.replace(/unsubscribeAuth\(\);\s*/, '');

  // Update handleSignIn
  content = content.replace(
    /const handleSignIn = async \(\) => {[\s\S]*?};/,
    `const handleSignIn = async () => {\n    const name = prompt("Please enter a Display Name to post:");\n    if (name && name.trim()) {\n      const profile = saveGuestProfile(name.trim());\n      setCurrentUser(profile);\n      setAuthor(profile.displayName);\n    }\n  };`
  );

  // Update handleSubmit
  content = content.replace(
    /userId: currentUser\.uid,/,
    `userId: currentUser.userId,`
  );

  content = content.replace(
    /author: author \|\| currentUser\.displayName \|\| 'Anonymous',/,
    `author: author || currentUser.displayName || 'Anonymous',`
  );

  fs.writeFileSync('src/components/GlobalDiscussions.tsx', content);
}

function updateDiscussionModal() {
  let content = fs.readFileSync('src/components/DiscussionModal.tsx', 'utf8');
  
  // Replace auth imports
  content = content.replace(
    /import { GoogleAuthProvider.*?from "firebase\/auth";/g,
    `import { getGuestProfile, saveGuestProfile, GuestProfile } from '../utils/guestAuth';`
  );
  content = content.replace(/import { db, auth } from '\.\.\/utils\/firebase';/, `import { db } from '../utils/firebase';`);
  
  // Replace state
  content = content.replace(
    /const \[currentUser, setCurrentUser\] = useState<FirebaseUser \| null>\(null\);/,
    `const [currentUser, setCurrentUser] = useState<GuestProfile | null>(getGuestProfile());`
  );

  // Remove auth observer
  content = content.replace(
    /const unsubscribeAuth = onAuthStateChanged\(auth, \(user\) => {[\s\S]*?}\);/,
    `if (currentUser && !author) {\n      setAuthor(currentUser.displayName || "Anonymous");\n    }`
  );

  content = content.replace(/unsubscribeAuth\(\);\s*/, '');

  // Update handleSignIn
  content = content.replace(
    /const handleSignIn = async \(\) => {[\s\S]*?};/,
    `const handleSignIn = async () => {\n    const name = prompt("Please enter a Display Name to post:");\n    if (name && name.trim()) {\n      const profile = saveGuestProfile(name.trim());\n      setCurrentUser(profile);\n      setAuthor(profile.displayName);\n    }\n  };`
  );

  // Update handleSubmit
  content = content.replace(
    /userId: currentUser\.uid,/,
    `userId: currentUser.userId,`
  );

  content = content.replace(
    /author: author \|\| currentUser\.displayName \|\| 'Anonymous',/,
    `author: author || currentUser.displayName || 'Anonymous',`
  );

  fs.writeFileSync('src/components/DiscussionModal.tsx', content);
}

updateGlobalDiscussions();
updateDiscussionModal();
