(global as any).localStorage = { getItem: () => null, setItem: () => {} };
import { fetchTafseer } from './src/services/tafseerScraper.ts';
const originalFetch = global.fetch;
global.fetch = async (url) => originalFetch("https://www.tafseerenamoona.net/surahs/2");
fetchTafseer(2, 5).then(res => console.log(res.en.substring(0, 500))).catch(console.error);
