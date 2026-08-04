const sharp = require('sharp');

async function generate() {
  const input = 'book.jpg';
  
  await sharp(input)
    .resize(1024, 1024, { fit: 'cover' })
    .toFormat('png')
    .toFile('assets/icon.png');
    
  await sharp(input)
    .resize(2732, 2732, { fit: 'cover' })
    .toFormat('png')
    .toFile('assets/splash.png');
    
  console.log("Assets generated successfully.");
}

generate().catch(console.error);
