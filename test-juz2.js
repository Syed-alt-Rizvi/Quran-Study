fetch('https://api.alquran.cloud/v1/juz/2/quran-uthmani')
  .then(res => res.json())
  .then(data => {
     console.log(`Juz 2 has ${data.data.ayahs.length} ayahs.`);
     const surahs = new Set(data.data.ayahs.map(a => a.surah.englishName));
     console.log(`Surahs in Juz 2: ${Array.from(surahs).join(', ')}`);
     console.log(`First ayah: ${data.data.ayahs[0].surah.englishName} ${data.data.ayahs[0].numberInSurah}`);
     console.log(`Last ayah: ${data.data.ayahs[data.data.ayahs.length-1].surah.englishName} ${data.data.ayahs[data.data.ayahs.length-1].numberInSurah}`);
  })
