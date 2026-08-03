const fs = require('fs');
let code = fs.readFileSync('src/services/tafseerScraper.ts', 'utf8');

const oldCode = `  let encodedFullPayload: Uint8Array | null = null;
  const resolveRef = (ref: string) => {
    const id = ref.substring(1);
    const prefix = \`\\n\${id}:T\`;
    const startIdx = fullPayload.indexOf(prefix);
    if (startIdx !== -1) {
      const commaIdx = fullPayload.indexOf(',', startIdx);
      if (commaIdx !== -1) {
        const hexLen = fullPayload.substring(startIdx + prefix.length, commaIdx);
        const len = parseInt(hexLen, 16);
        if (!isNaN(len)) {
          // Next.js text lengths are in UTF-8 bytes. 
          if (!encodedFullPayload) {
            encodedFullPayload = new TextEncoder().encode(fullPayload);
          }
          const byteStartOffset = new TextEncoder().encode(fullPayload.substring(0, commaIdx + 1)).length;
          const slicedBytes = encodedFullPayload.slice(byteStartOffset, byteStartOffset + len);
          return new TextDecoder('utf-8').decode(slicedBytes);
        }
      }
    }
    return null;
  };`;

const newCode = `  let encodedFullPayload: Uint8Array | null = null;
  const resolveRef = (ref: string) => {
    const id = ref.substring(1);
    const prefixStr = \`\${id}:T\`;
    
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
                    if (!encodedFullPayload) {
                        encodedFullPayload = new TextEncoder().encode(fullPayload);
                    }
                    const byteStartOffset = new TextEncoder().encode(fullPayload.substring(0, commaIdx + 1)).length;
                    const slicedBytes = encodedFullPayload.slice(byteStartOffset, byteStartOffset + len);
                    let str = new TextDecoder('utf-8').decode(slicedBytes);
                    if (str.startsWith('"') && str.endsWith('"')) {
                        try { str = JSON.parse(str); } catch(e) { str = str.substring(1, str.length - 1); }
                    }
                    return str;
                }
            }
        }
        searchStart = idx + 1;
    }
  };`;

code = code.replace(oldCode, newCode);
code = code.replace(/_v2/g, '_v3');

fs.writeFileSync('src/services/tafseerScraper.ts', code);
