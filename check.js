const starts = {
  1: [1, 1],
  2: [2, 142],
  3: [2, 253],
  4: [3, 93],
  5: [4, 24],
  6: [4, 148],
  7: [5, 82],
  8: [6, 111],
  9: [7, 88],
  10: [8, 41],
  11: [9, 93],
  12: [11, 6],
  13: [12, 53],
  14: [15, 1],
  15: [17, 1],
  16: [18, 75],
  17: [21, 1],
  18: [23, 1],
  19: [25, 21],
  20: [27, 56],
  21: [29, 45],
  22: [33, 31],
  23: [36, 28],
  24: [39, 32],
  25: [41, 47],
  26: [46, 1],
  27: [51, 31],
  28: [58, 1],
  29: [67, 1],
  30: [78, 1]
};

async function check() {
  for (let i = 1; i <= 30; i++) {
    let r = await fetch(`https://api.alquran.cloud/v1/juz/${i}/quran-uthmani`);
    let d = await r.json();
    while (!d.data) {
      await new Promise(res => setTimeout(res, 500));
      r = await fetch(`https://api.alquran.cloud/v1/juz/${i}/quran-uthmani`);
      d = await r.json();
    }
    const actS = d.data.ayahs[0].surah.number;
    const actA = d.data.ayahs[0].numberInSurah;
    const expS = starts[i][0];
    const expA = starts[i][1];
    if (actS !== expS || actA !== expA) {
      console.log(`Juz ${i} mismatch! Expected ${expS}:${expA}, got ${actS}:${actA}`);
    } else {
      console.log(`Juz ${i} OK`);
    }
  }
}
check();
