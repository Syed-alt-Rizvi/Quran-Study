const fs = require('fs');
const files = [
  'src/components/SurahView.tsx',
  'src/components/DiscussionModal.tsx',
  'src/services/tafseerScraper.ts'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/fetch\(getApiUrl\(`(.*?)`\)/g, 'fetch(getApiUrl(`$1`))');
  content = content.replace(/fetch\(getApiUrl\(`(.*?)`\)\.then/g, 'fetch(getApiUrl(`$1`)).then'); // just in case
  fs.writeFileSync(f, content);
});
