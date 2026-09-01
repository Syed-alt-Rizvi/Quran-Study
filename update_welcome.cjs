const fs = require('fs');

let content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf8');

// Update Arabic text sizing
content = content.replace(/text-5xl md:text-7xl/g, 'text-[2rem] leading-tight');
content = content.replace(/text-4xl md:text-6xl/g, 'text-4xl');

// Update English translation text sizing
content = content.replace(/text-sm md:text-base/g, 'text-[0.8rem] leading-snug px-4');

fs.writeFileSync('src/components/WelcomeScreen.tsx', content);
