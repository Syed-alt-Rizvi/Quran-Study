with open('src/services/tafseerScraper.ts', 'r') as f:
    content = f.read()

target = """  const resolveRef = (ref: string) => {
    const id = ref.substring(1);
    const prefix = `\\n${id}:T`;
    const startIdx = fullPayload.indexOf(prefix);
    if (startIdx !== -1) {
      const commaIdx = fullPayload.indexOf(',', startIdx);
      if (commaIdx !== -1) {
        const hexLen = fullPayload.substring(startIdx + prefix.length, commaIdx);"""

replacement = """  const resolveRef = (ref: string) => {
    const id = ref.substring(1);
    let prefix = `\\n${id}:T`;
    let startIdx = fullPayload.indexOf(prefix);
    if (startIdx === -1) {
      prefix = `${id}:T`;
      startIdx = fullPayload.indexOf(prefix);
    }
    
    if (startIdx !== -1) {
      const commaIdx = fullPayload.indexOf(',', startIdx);
      if (commaIdx !== -1) {
        const hexLen = fullPayload.substring(startIdx + prefix.length, commaIdx);"""

if target in content:
    with open('src/services/tafseerScraper.ts', 'w') as f:
        f.write(content.replace(target, replacement))
    print("Replaced successfully")
else:
    print("Target not found")
