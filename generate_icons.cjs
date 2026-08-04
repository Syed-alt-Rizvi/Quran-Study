const sharp = require('sharp');
const fs = require('fs');

async function generate() {
  const input = 'book.jpg';
  
  await sharp(input)
    .resize(192, 192)
    .toFile('public/pwa-192x192.png');
    
  await sharp(input)
    .resize(512, 512)
    .toFile('public/pwa-512x512.png');
    
  await sharp(input)
    .resize(180, 180)
    .toFile('public/apple-touch-icon.png');
    
  // Simple 32x32 for favicon
  await sharp(input)
    .resize(32, 32)
    .toFile('public/favicon.ico');
    
  console.log("Icons generated successfully.");
}

generate().catch(console.error);
