npm install sharp
node -e "
const sharp = require('sharp');
sharp('assets/icon.svg').resize(1024, 1024).png().toFile('assets/icon.png');
sharp('assets/splash.svg').resize(2732, 2732).png().toFile('assets/splash.png');
"
