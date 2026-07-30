const fs = require('fs');
const html = fs.readFileSync('test.html', 'utf8');

const parts = html.split('self.__next_f.push(');
let fullPayload = "";
for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const endIdx = part.indexOf('])');
    if (endIdx > 0) {
        const jsonStr = part.substring(0, endIdx + 1);
        try {
            const arr = JSON.parse(jsonStr);
            if (arr && arr.length > 1 && typeof arr[1] === 'string') {
                fullPayload += arr[1];
            }
        } catch(e) {}
    }
}

// Convert payload to Buffer
const payloadBuffer = Buffer.from(fullPayload, 'utf8');
console.log("Buffer length:", payloadBuffer.length);
console.log("String length:", fullPayload.length);

let idx = fullPayload.indexOf('\n13:T');
idx++; 
// Get the byte index of `commaIdx + 1`
const commaIdx = fullPayload.indexOf(',', idx);
const hexLen = fullPayload.substring(fullPayload.indexOf(':', idx) + 2, commaIdx);
const byteLen = parseInt(hexLen, 16);
console.log("byteLen:", byteLen);

const byteStart = Buffer.byteLength(fullPayload.substring(0, commaIdx + 1), 'utf8');
const byteEnd = byteStart + byteLen;

const nextPartStr = payloadBuffer.toString('utf8', byteEnd, byteEnd + 10);
console.log("char at byteEnd:", nextPartStr);
