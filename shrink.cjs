const sharp = require('sharp');
sharp('/app/applet/src/assets/images/quran_sunset_icon_1785950329291.jpg')
  .resize(1024, 1024, { fit: 'cover' })
  .png({ compressionLevel: 9, quality: 80, palette: true })
  .toFile('assets/icon.png')
  .then(() => console.log('Done'));
