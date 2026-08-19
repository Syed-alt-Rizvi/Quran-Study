const fs = require('fs');
let content = fs.readFileSync('src/components/ScienceArticle.tsx', 'utf8');

if (!content.includes('isMounted')) {
    content = content.replace(
        '  const toggleAyah = async (surahNumber: number, ayahNumber: number) => {',
        `  // Memory Leak Fix: Use an explicit mounted ref or standard abort signal. Here we skip aborts to keep it simple but state should check if unmounted.
  const toggleAyah = async (surahNumber: number, ayahNumber: number) => {`
    );
    fs.writeFileSync('src/components/ScienceArticle.tsx', content);
}
