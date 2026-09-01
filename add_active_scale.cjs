const fs = require('fs');

function applyToHome() {
  let content = fs.readFileSync('src/components/Home.tsx', 'utf8');
  content = content.replace(
    /className="([^"]*bg-white dark:bg-slate-900 rounded-2xl p-4[^"]*hover:border-emerald-500\/50[^"]*)"/g,
    'className="$1 active:scale-[0.98] transition-all"'
  );
  content = content.replace(
    /className="([^"]*bg-emerald-600 hover:bg-emerald-700[^"]*)"/g,
    'className="$1 active:scale-95"'
  );
  fs.writeFileSync('src/components/Home.tsx', content);
}

function applyToSurahView() {
  let content = fs.readFileSync('src/components/SurahView.tsx', 'utf8');
  content = content.replace(
    /className="([^"]*w-12 h-12 rounded-full flex items-center justify-center bg-emerald-600[^"]*)"/g,
    'className="$1 active:scale-95"'
  );
  content = content.replace(
    /className="([^"]*w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100[^"]*hover:bg-emerald-200[^"]*)"/g,
    'className="$1 active:scale-90"'
  );
  fs.writeFileSync('src/components/SurahView.tsx', content);
}

function applyToGlobalDiscussions() {
  let content = fs.readFileSync('src/components/GlobalDiscussions.tsx', 'utf8');
  content = content.replace(
    /className="([^"]*bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl[^"]*)"/g,
    'className="$1 active:scale-95"'
  );
  content = content.replace(
    /import \{ getGuestProfile, saveGuestProfile, clearGuestProfile, GuestProfile \} from '\.\.\/utils\/guestAuth';/,
    `import { getGuestProfile, saveGuestProfile, clearGuestProfile, GuestProfile } from '../utils/guestAuth';\nimport { hapticImpact, hapticNotification } from '../utils/haptics';\nimport { ImpactStyle } from '@capacitor/haptics';`
  );
  content = content.replace(
    /await addDoc\(collection\(db, 'discussions'\), payload\);[\s\S]*?setContent\(""\);/,
    `await addDoc(collection(db, 'discussions'), payload);
      hapticNotification('SUCCESS');
      setContent("");`
  );
  content = content.replace(
    /const handleSignIn = async \(\) => \{/,
    `const handleSignIn = async () => {
    hapticImpact(ImpactStyle.Light);`
  );
  fs.writeFileSync('src/components/GlobalDiscussions.tsx', content);
}

applyToHome();
applyToSurahView();
applyToGlobalDiscussions();
