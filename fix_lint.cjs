const fs = require('fs');
let contentG = fs.readFileSync('src/components/GlobalDiscussions.tsx', 'utf8');

// Fix signOut
contentG = contentG.replace(/await signOut\(auth\);/, 'clearGuestProfile();');
contentG = contentG.replace(/import { clearGuestProfile } from '\.\.\/utils\/guestAuth';/, ''); // in case
contentG = contentG.replace(/import { getGuestProfile, saveGuestProfile, GuestProfile }/, 'import { getGuestProfile, saveGuestProfile, clearGuestProfile, GuestProfile }');

fs.writeFileSync('src/components/GlobalDiscussions.tsx', contentG);

let contentM = fs.readFileSync('src/components/DiscussionModal.tsx', 'utf8');
contentM = contentM.replace(/await signOut\(auth\);/, 'clearGuestProfile();');
contentM = contentM.replace(/import { getGuestProfile, saveGuestProfile, GuestProfile }/, 'import { getGuestProfile, saveGuestProfile, clearGuestProfile, GuestProfile }');
// Fix email on GuestProfile
contentM = contentM.replace(/email: currentUser\.email \|\| null,/, '');
contentM = contentM.replace(/if \(email\) payload\.email = email;/, '');

fs.writeFileSync('src/components/DiscussionModal.tsx', contentM);
