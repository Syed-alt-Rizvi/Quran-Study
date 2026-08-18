const fs = require('fs');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <path id="leaf" d="M0,0 C20,-20 40,-10 50,0 C40,10 20,20 0,0" fill="currentColor" />
    <path id="flower" d="M0,-10 C5,-15 15,-5 0,0 C-15,-5 -5,-15 0,-10 M10,0 C15,-5 5,15 0,0 C-5,15 -15,-5 10,0" fill="currentColor" />
    <g id="corner">
      <use href="#leaf" transform="translate(10,10) rotate(45) scale(2)" opacity="0.6"/>
      <use href="#leaf" transform="translate(40,10) rotate(15) scale(1.5)" opacity="0.8"/>
      <use href="#leaf" transform="translate(10,40) rotate(75) scale(1.5)" opacity="0.8"/>
      <use href="#flower" transform="translate(30,30) scale(2)" opacity="0.9"/>
      <path d="M0,50 Q30,50 50,30 T100,10" fill="none" stroke="currentColor" stroke-width="3"/>
      <path d="M50,0 Q50,30 30,50 T10,100" fill="none" stroke="currentColor" stroke-width="3"/>
      <circle cx="30" cy="30" r="5" fill="currentColor"/>
      <circle cx="65" cy="15" r="3" fill="currentColor"/>
      <circle cx="15" cy="65" r="3" fill="currentColor"/>
    </g>
  </defs>
  <use href="#corner" />
</svg>
`;
fs.writeFileSync('test.svg', svg);
