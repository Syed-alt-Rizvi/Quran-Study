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
    
    let encodedFullPayload = null;
    const resolveRef = (ref) => {
        const id = ref.substring(1);
        const prefixStr = `${id}:T`;
        
        let searchStart = 0;
        while (true) {
            let idx = fullPayload.indexOf(prefixStr, searchStart);
            if (idx === -1) return null;
            
            const prevChar = idx > 0 ? fullPayload[idx - 1] : '';
            if (!/^[0-9a-fA-F]$/.test(prevChar)) {
                const commaIdx = fullPayload.indexOf(',', idx);
                if (commaIdx !== -1 && commaIdx - idx < 20) {
                    const hexLen = fullPayload.substring(idx + prefixStr.length, commaIdx);
                    if (/^[0-9a-fA-F]+$/.test(hexLen)) {
                        const len = parseInt(hexLen, 16);
                        const byteStartOffset = Buffer.from(fullPayload.substring(0, commaIdx + 1), 'utf-8').length;
                        let str = bytePayload.subarray(byteStartOffset, byteStartOffset + len).toString('utf-8');
                        if (str.startsWith('"') && str.endsWith('"')) {
                            try { str = JSON.parse(str); } catch(e) { str = str.substring(1, str.length - 1); }
                        }
                        return str;
                    }
                }
            }
            searchStart = idx + 1;
        }
    };

    const ayahRegex = /"ayat_number":(\d+)[\s\S]*?"tafseer_topics":\[([\s\S]*?)\]/g;
    let match;
    let allData = {};
    while((match = ayahRegex.exec(fullPayload)) !== null) {
        const topicsStr = "[" + match[2] + "]";
        try {
          const topics = JSON.parse(topicsStr);
          let combinedUrdu = "";
          let combinedEnglish = "";
          for(let topic of topics) {
              let detailsUr = topic.details || topic.details_ur;
              if(detailsUr && detailsUr.startsWith('$')) detailsUr = resolveRef(detailsUr) || detailsUr;
              let titleUr = topic.title || topic.title_ur;
              if(titleUr && titleUr.startsWith('$')) titleUr = resolveRef(titleUr) || titleUr;
              
              if(detailsUr && detailsUr.trim().length > 0) combinedUrdu += `**${titleUr}**\n\n${detailsUr}\n\n`;
              
              let detailsEn = topic.details_en;
              if (detailsEn && detailsEn.startsWith('$')) detailsEn = resolveRef(detailsEn) || detailsEn;
              let titleEn = topic.title_en;
              if (titleEn && titleEn.startsWith('$')) titleEn = resolveRef(titleEn) || titleEn;
              if (detailsEn && detailsEn.trim().length > 0) combinedEnglish += `**${titleEn}**\n\n${detailsEn}\n\n`;
          }
          allData[match[1]] = { ur: combinedUrdu, en: combinedEnglish };
        } catch(e) {}
    }
    
    console.log("Total size for Surah 2:", Buffer.from(JSON.stringify(allData)).length / 1024 / 1024, "MB");
  });
});
