fetch('https://api.alquran.cloud/v1/juz/1/quran-uthmani')
  .then(res => res.json())
  .then(data => {
     console.log(`Juz 1 has ${data.data.ayahs.length} ayahs.`);
     const surahs = new Set(data.data.ayahs.map(a => a.surah.englishName));
     console.log(`Surahs in Juz 1: ${Array.from(surahs).join(', ')}`);
  })
