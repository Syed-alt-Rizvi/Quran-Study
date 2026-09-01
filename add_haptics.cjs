const fs = require('fs');

function applyToSidebar() {
  let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
  content = content.replace(
    /import \{ useSettingsStore \} from '\.\.\/store';/,
    `import { useSettingsStore } from '../store';\nimport { hapticImpact, hapticSelection } from '../utils/haptics';\nimport { ImpactStyle } from '@capacitor/haptics';`
  );
  
  // Add sound to notifications
  content = content.replace(
    /title: "Quran Study Time",\s*body: "It's time for your daily Quran reading.",\s*id: 1,/,
    `title: "Quran Study Time",\n                                body: "It's time for your daily Quran reading.",\n                                id: 1,\n                                sound: "bismillah.ogg",`
  );

  // Add haptics to toggle switches and buttons
  content = content.replace(/toggleDarkMode\(\)/g, 'hapticSelection(); toggleDarkMode()');
  content = content.replace(/toggleShowTranslation\(\)/g, 'hapticSelection(); toggleShowTranslation()');
  
  // Replace close button click
  content = content.replace(/onClick=\{onClose\}/g, 'onClick={() => { hapticImpact(ImpactStyle.Light); onClose(); }}');
  
  fs.writeFileSync('src/components/Sidebar.tsx', content);
}

function applyToHome() {
  let content = fs.readFileSync('src/components/Home.tsx', 'utf8');
  content = content.replace(
    /import \{ getApiUrl \} from '\.\.\/utils\/apiBase';/,
    `import { getApiUrl } from '../utils/apiBase';\nimport { hapticImpact } from '../utils/haptics';\nimport { ImpactStyle } from '@capacitor/haptics';`
  );
  
  // Settings click
  content = content.replace(
    /onClick=\{onOpenSettings\}/,
    'onClick={() => { hapticImpact(ImpactStyle.Light); onOpenSettings(); }}'
  );
  
  // Surah / Juz clicks
  content = content.replace(
    /onClick=\{\(\) => onSelectSurah\(surah.number\)\}/,
    'onClick={() => { hapticImpact(ImpactStyle.Medium); onSelectSurah(surah.number); }}'
  );
  content = content.replace(
    /onClick=\{\(\) => onSelectJuz\(juz.id\)\}/,
    'onClick={() => { hapticImpact(ImpactStyle.Medium); onSelectJuz(juz.id); }}'
  );

  // Read full article click
  content = content.replace(
    /onClick=\{\(\) => \{[\s\S]*?setSelectedArticle\(article\);/,
    `onClick={() => {
                          hapticImpact(ImpactStyle.Light);
                          setSelectedArticle(article);`
  );
  
  fs.writeFileSync('src/components/Home.tsx', content);
}

function applyToSurahView() {
  let content = fs.readFileSync('src/components/SurahView.tsx', 'utf8');
  content = content.replace(
    /import \{ getApiUrl \} from '\.\.\/utils\/apiBase';/,
    `import { getApiUrl } from '../utils/apiBase';\nimport { hapticImpact, hapticSelection } from '../utils/haptics';\nimport { ImpactStyle } from '@capacitor/haptics';`
  );
  
  // Back button
  content = content.replace(
    /onClick=\{onBack\}/,
    'onClick={() => { hapticImpact(ImpactStyle.Light); onBack(); }}'
  );
  
  // Play button
  content = content.replace(
    /onClick=\{handlePlaySurah\}/,
    'onClick={() => { hapticImpact(ImpactStyle.Heavy); handlePlaySurah(); }}'
  );
  
  // Ayah play button
  content = content.replace(
    /onClick=\{\(\) => \{[\s\S]*?if \(isThisAyahPlaying\) \{/,
    `onClick={() => {
                        hapticImpact(ImpactStyle.Medium);
                        if (isThisAyahPlaying) {`
  );
  
  fs.writeFileSync('src/components/SurahView.tsx', content);
}

applyToSidebar();
applyToHome();
applyToSurahView();
