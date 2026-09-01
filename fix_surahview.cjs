const fs = require('fs');
let surahContent = fs.readFileSync('src/components/SurahView.tsx', 'utf8');

surahContent = surahContent.replace(
  /fetch\(getApiUrl\(\`\/api\/science\?surah=\$\{surahId\}\`\)\)[\s\S]*?\.catch\(\(\) => setScienceRels\(\[\]\)\);/,
  `fetch('/data.json')
      .then(r => r.json())
      .then(data => {
        if (data && data.articles && data.relationships) {
          const surahRels = data.relationships.filter((r: any) => r.surah_number === surahId);
          const results = surahRels.map((rel: any) => {
            const article = data.articles.find((a: any) => a.id === rel.article_id);
            if (!article) return null;
            return {
              relation: {
                surahNumber: rel.surah_number,
                ayahNumber: rel.ayah_number,
                explanation: rel.explanation
              },
              article: {
                id: article.id,
                title: article.title,
                author: article.author,
                content: article.content,
                originalUrl: article.original_url
              }
            };
          }).filter(Boolean);
          setScienceRels(results);
        } else {
          setScienceRels([]);
        }
      })
      .catch(() => setScienceRels([]));`
);

fs.writeFileSync('src/components/SurahView.tsx', surahContent);
