const fs = require('fs');
const fullPayload = fs.readFileSync('/tmp/fullPayload.txt', 'utf-8');

let encodedFullPayload = null;

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
        if (!encodedFullPayload) {
          encodedFullPayload = Buffer.from(fullPayload, 'utf-8');
        }
        const byteStartOffset = Buffer.from(fullPayload.substring(0, commaIdx + 1), 'utf-8').length;
        return encodedFullPayload.subarray(byteStartOffset, byteStartOffset + len).toString('utf-8');
      }
    }
  }
  return null;
};

console.log(resolveRef('$14').substring(0, 100));
console.log(resolveRef('$14').length);
