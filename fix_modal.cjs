const fs = require('fs');
let content = fs.readFileSync('src/components/DiscussionModal.tsx', 'utf8');

// Fix the bad return
content = content.replace(/return \(\) => }, \[\]\);/, '}, []);');

// Check if author state exists, if not add it.
if (!content.includes('const [author, setAuthor]')) {
  content = content.replace(
    /const \[currentUser, setCurrentUser\] = useState<GuestProfile \| null>\(getGuestProfile\(\)\);/,
    `const [currentUser, setCurrentUser] = useState<GuestProfile | null>(getGuestProfile());\n  const [author, setAuthor] = useState(currentUser?.displayName || '');`
  );
}

fs.writeFileSync('src/components/DiscussionModal.tsx', content);

// Do the same for GlobalDiscussions.tsx
let contentG = fs.readFileSync('src/components/GlobalDiscussions.tsx', 'utf8');
contentG = contentG.replace(/return \(\) => }, \[\]\);/, '}, []);');
fs.writeFileSync('src/components/GlobalDiscussions.tsx', contentG);
