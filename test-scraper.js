const fs = require('fs');

const html = fs.readFileSync('/tmp/surah1.html', 'utf-8');
const parts = html.split('self.__next_f.push(');
let fullPayload = "";
for (let i = 1; i < parts.length; i++) {
  const part = parts[i];
  // More robust parsing: find the first '[' and the matching ']'
  const startIdx = part.indexOf('[');
  if (startIdx === -1) continue;
  
  // Try parsing increasing lengths until it's valid JSON
  let parsed = null;
  for (let j = part.length; j > startIdx; j--) {
    if (part[j] === ']') {
      try {
        const jsonStr = part.substring(startIdx, j + 1);
        parsed = JSON.parse(jsonStr);
        break;
      } catch (e) {
        // try next ']'
      }
    }
  }
  
  if (parsed && Array.isArray(parsed) && typeof parsed[1] === 'string') {
    fullPayload += parsed[1];
  }
}

fs.writeFileSync('/tmp/fullPayload.txt', fullPayload);
console.log("Payload length:", fullPayload.length);
