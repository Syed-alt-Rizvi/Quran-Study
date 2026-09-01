const fs = require('fs');

let homeContent = fs.readFileSync('src/components/Home.tsx', 'utf8');

// Replace the API fetch with static JSON fetch
homeContent = homeContent.replace(
  /fetch\(getApiUrl\('\/api\/science'\)\)[\s\S]*?\.catch\(console\.error\);/,
  `fetch('/data.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.articles) {
          const processedArticles = data.articles.map((article: any) => ({
            id: article.id,
            title: article.title,
            author: article.author,
            content: article.content,
            originalUrl: article.original_url,
            relations: (data.relationships || []).filter((r: any) => r.article_id === article.id).map((r: any) => ({
              surahNumber: r.surah_number,
              ayahNumber: r.ayah_number
            }))
          }));
          setScienceArticles(processedArticles);
        } else {
          console.error("Failed to parse static articles");
        }
      })
      .catch(console.error);`
);

fs.writeFileSync('src/components/Home.tsx', homeContent);

let surahContent = fs.readFileSync('src/components/SurahView.tsx', 'utf8');

surahContent = surahContent.replace(
  /fetch\(getApiUrl\(\`\/api\/science\?surah=\$\{surahId\}\`\)\)[\s\S]*?\.catch\(console\.error\);/,
  `fetch('/data.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.articles && data.relationships) {
          // Find all relationships for this surah
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
          
          setScienceArticles(results);
        }
      })
      .catch(console.error);`
);

fs.writeFileSync('src/components/SurahView.tsx', surahContent);
