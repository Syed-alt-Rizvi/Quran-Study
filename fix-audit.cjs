const fs = require('fs');
let content = fs.readFileSync('src/components/ScienceArticle.tsx', 'utf8');

if (!content.includes('isMounted')) {
    content = content.replace(
        '  const toggleAyah = async (surahNumber: number, ayahNumber: number) => {',
        `  const toggleAyah = async (surahNumber: number, ayahNumber: number) => {`
    );
}

// 1. Race condition in Home.tsx
let homeContent = fs.readFileSync('src/components/Home.tsx', 'utf8');
if (!homeContent.includes('AbortController')) {
    homeContent = homeContent.replace(
        '    fetchSurahs()',
        `    const abortController = new AbortController();
    fetchSurahs()`
    ).replace(
        '  }, []);',
        `    return () => abortController.abort();
  }, []);`
    );
    fs.writeFileSync('src/components/Home.tsx', homeContent);
}

