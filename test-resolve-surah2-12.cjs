const http = require('https');

http.get('https://www.tafseerenamoona.net/surahs/2', (res) => {
  let html = '';
  res.on('data', d => html += d);
  res.on('end', () => {
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
          else if (char === '\\') escape = true;
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
        } catch(e) {}
      }
    }
    
    let regex = /([0-9a-fA-F]+):T([0-9a-fA-F]+),/g;
    let match;
    let foundIDs = [];
    while((match = regex.exec(fullPayload)) !== null) {
       foundIDs.push(match[1]);
    }
    console.log("Found IDs:", foundIDs.slice(0, 50).join(', '));
  });
});
