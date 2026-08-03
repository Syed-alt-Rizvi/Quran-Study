const fs = require('fs');
const fullPayload = fs.readFileSync('/tmp/fullPayload.txt', 'utf-8');

const ayahRegex = /"ayat_number":(\d+)[\s\S]*?"tafseer_topics":\[([\s\S]*?)\]/g;
let ayahMatch;
while ((ayahMatch = ayahRegex.exec(fullPayload)) !== null) {
  const currentAyah = parseInt(ayahMatch[1], 10);
  console.log("Ayah:", currentAyah);
  const topicsStr = "[" + ayahMatch[2] + "]";
  try {
    const topics = JSON.parse(topicsStr);
    for (const topic of topics) {
      console.log("  Topic:", topic.title, topic.details ? topic.details.substring(0, 20) : null);
    }
  } catch (e) {
    console.error("  Error parsing topics for ayah", currentAyah);
  }
}
