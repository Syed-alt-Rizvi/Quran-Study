const fs = require('fs');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace imports
  content = content.replace(
    /import \{ GoogleAuthProvider, signInWithPopup, browserPopupRedirectResolver, /g,
    "import { Capacitor } from '@capacitor/core';\nimport { GoogleAuthProvider, signInWithPopup, signInWithRedirect, "
  );
  content = content.replace(/browserPopupRedirectResolver, /g, '');

  // Replace handleSignIn
  const handleSignInRegex = /const handleSignIn = async \(\) => \{[\s\S]*?catch \(e: any\) \{/g;
  content = content.replace(handleSignInRegex, `const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      if (Capacitor.isNativePlatform()) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (e: any) {`);
    
  fs.writeFileSync(filePath, content);
}

patchFile('src/components/GlobalDiscussions.tsx');
patchFile('src/components/DiscussionModal.tsx');
console.log('patched');
