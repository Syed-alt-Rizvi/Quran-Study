const fs = require('fs');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <pattern id="p" width="100" height="100" patternUnits="userSpaceOnUse">
      <g stroke="#d4af37" stroke-width="1.5" fill="none" opacity="0.8">
        <circle cx="50" cy="50" r="30" />
        <path d="M50,10 L60,40 L90,50 L60,60 L50,90 L40,60 L10,50 L40,40 Z" />
        <path d="M20,20 L50,35 L80,20 L65,50 L80,80 L50,65 L20,80 L35,50 Z" />
        <path d="M50,0 L50,100 M0,50 L100,50" opacity="0.3"/>
      </g>
    </pattern>
  </defs>
  <rect width="100" height="100" fill="url(#p)" />
</svg>`;
fs.writeFileSync('star.svg', svg);
