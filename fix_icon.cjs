const sharp = require('sharp');
sharp('assets/icon.png')
  .resize(1024, 1024)
  .png({ force: true })
  .withMetadata(false)
  .toFile('assets/icon_fixed.png')
  .then(() => console.log('Fixed icon'))
  .catch(err => console.error(err));
