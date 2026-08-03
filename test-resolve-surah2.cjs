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
    
    let encodedFullPayload = Buffer.from(fullPayload, 'utf-8');
    const resolveRef = (ref) => {
      const id = ref.substring(1);
      const prefix = `\n${id}:T`;
      const startIdx = fullPayload.indexOf(prefix);
      if (startIdx !== -1) {
        const commaIdx = fullPayload.indexOf(',', startIdx);
        if (commaIdx !== -1) {
          const hexLen = fullPayload.substring(startIdx + prefix.length, commaIdx);
          const len = parseInt(hexLen, 16);
          if (!isNaN(len)) {
            const byteStartOffset = Buffer.from(fullPayload.substring(0, commaIdx + 1), 'utf-8').length;
            let str = encodedFullPayload.subarray(byteStartOffset, byteStartOffset + len).toString('utf-8');
            // Check if string starts with " and ends with "
            if (str.startsWith('"') && str.endsWith('"')) {
               try {
                  str = JSON.parse(str);
               } catch(e) {
                  // if not valid json, maybe strip quotes?
                  str = str.substring(1, str.length - 1);
               }
            }
            return str;
          }
        }
      }
      return null;
    };
    
    const ayahRegex = /"ayat_number":(\d+)[\s\S]*?"tafseer_topics":\[([\s\S]*?)\]/g;
    let match = ayahRegex.exec(fullPayload);
    match = ayahRegex.exec(fullPayload);
    if(match) {
        const topicsStr = "[" + match[2] + "]";
        const topics = JSON.parse(topicsStr);
        let topic = topics[0];
        console.log("Topic Title:", topic.title);
        let detailRef = topic.details || topic.details_ur;
        console.log("Details Ref:", detailRef);
        if(detailRef && detailRef.startsWith('$')) {
            const resolved = resolveRef(detailRef);
            console.log("Resolved Length:", resolved ? resolved.length : 'null');
            if(resolved) {
               console.log("End of resolved:", resolved.substring(resolved.length - 100));
            }
        }
    }
  });
});
