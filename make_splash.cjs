const sharp = require('sharp');
sharp({
  create: {
    width: 2732,
    height: 2732,
    channels: 4,
    background: { r: 238, g: 238, b: 238, alpha: 1 }
  }
})
.png()
.toFile('assets/splash.png')
.then(() => console.log('Splash created'));
