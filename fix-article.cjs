const fs = require('fs');
let content = fs.readFileSync('src/components/ScienceArticle.tsx', 'utf8');

if (!content.includes('isMounted')) {
    content = content.replace(
        '  const toggleAyah = async (surahNumber: number, ayahNumber: number) => {',
        `  const [isMounted, setIsMounted] = useState(true);
  useEffect(() => {
    return () => setIsMounted(false);
  }, []);

  const toggleAyah = async (surahNumber: number, ayahNumber: number) => {`
    );
    
    content = content.replace(
        '        setAyahData(prev => ({',
        `        if (!isMounted) return;
        setAyahData(prev => ({`
    );
    
    fs.writeFileSync('src/components/ScienceArticle.tsx', content);
}
