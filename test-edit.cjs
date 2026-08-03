const fs = require('fs');
let code = fs.readFileSync('src/services/tafseerScraper.ts', 'utf8');

const oldCode = `  // 4. Parse RSC payload
  const parts = html.split('self.__next_f.push(');
  let fullPayload = "";
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const endIdx = part.indexOf('])');
    if (endIdx > 0) {
      const jsonStr = part.substring(0, endIdx + 1);
      try {
        const arr = JSON.parse(jsonStr);
        if (Array.isArray(arr) && arr.length > 1 && typeof arr[1] === 'string') {
          fullPayload += arr[1];
        }
      } catch (e) {
        // ignore
      }
    }
  }`;

const newCode = `  // 4. Parse RSC payload
  const parts = html.split('self.__next_f.push(');
  let fullPayload = "";
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const startIdx = part.indexOf('[');
    if (startIdx === -1) continue;
    
    let parsed = null;
    let bracketCount = 0;
    let inString = false;
    let escape = false;
    let endIdx = -1;
    
    for (let j = startIdx; j < part.length; j++) {
      const char = part[j];
      if (!inString) {
        if (char === '[') bracketCount++;
        else if (char === ']') {
          bracketCount--;
          if (bracketCount === 0) {
            endIdx = j;
            break;
          }
        } else if (char === '"') inString = true;
      } else {
        if (escape) escape = false;
        else if (char === '\\\\') escape = true;
        else if (char === '"') inString = false;
      }
    }
    
    if (endIdx !== -1) {
      try {
        const jsonStr = part.substring(startIdx, endIdx + 1);
        parsed = JSON.parse(jsonStr);
        if (parsed && Array.isArray(parsed) && typeof parsed[1] === 'string') {
          fullPayload += parsed[1];
        }
      } catch (e) {
        // ignore
      }
    }
  }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/services/tafseerScraper.ts', code);
