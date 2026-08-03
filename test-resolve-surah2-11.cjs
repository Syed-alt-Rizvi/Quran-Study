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
    
    let bytePayload = Buffer.from(fullPayload, 'utf-8');
    
    const resolveRef = (ref) => {
        const id = ref.substring(1);
        const prefixStr = `${id}:T`;
        
        let searchStart = 0;
        while (true) {
            let idx = fullPayload.indexOf(prefixStr, searchStart);
            if (idx === -1) return null;
            
            // Allow prevChar to be \n, " (from previous chunk end), or . (like 'Quran.')
            // Actually, we can just check if hexLen is valid and parses out a valid JSON string!
            const commaIdx = fullPayload.indexOf(',', idx);
            if (commaIdx !== -1 && commaIdx - idx < 20) {
                const hexLen = fullPayload.substring(idx + prefixStr.length, commaIdx);
                if (/^[0-9a-fA-F]+$/.test(hexLen)) {
                    const len = parseInt(hexLen, 16);
                    const byteStartOffset = Buffer.from(fullPayload.substring(0, commaIdx + 1), 'utf-8').length;
                    let str = bytePayload.subarray(byteStartOffset, byteStartOffset + len).toString('utf-8');
                    if (str.startsWith('"') && str.endsWith('"')) {
                        try { str = JSON.parse(str); } catch(e) { str = str.substring(1, str.length - 1); }
                        return str;
                    }
                }
            }
            searchStart = idx + 1;
        }
    };

    const ayahRegex = /"ayat_number":(\d+)[\s\S]*?"tafseer_topics":\[([\s\S]*?)\]/g;
    let match;
    let found = 0;
    while((match = ayahRegex.exec(fullPayload)) !== null && found < 5) {
        const topicsStr = "[" + match[2] + "]";
        try {
          const topics = JSON.parse(topicsStr);
          for(let topic of topics) {
              let detailRef = topic.details || topic.details_ur;
              if(detailRef && detailRef.startsWith('$')) {
                  const resolved = resolveRef(detailRef);
                  if(resolved) {
                     console.log(`Ayah ${match[1]} - Topic: ${topic.title || topic.title_ur}`);
                     console.log(`Length: ${resolved.length}, Ends with quote: ${resolved.endsWith('"')}`);
                     console.log("Ends with:", resolved.substring(resolved.length - 30));
                     found++;
                  } else {
                     console.log("NOT FOUND:", detailRef);
                  }
              }
          }
        } catch(e) {}
    }
  });
});
