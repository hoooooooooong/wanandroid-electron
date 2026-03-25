const sharp = require('sharp');

const inputPath = 'build/icon.png';
const outputPath = 'build/icon-256.png';

sharp(inputPath)
  .resize(256, 256, {
    kernel: sharp.kernel.lanczos3,
    fit: 'cover',
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  })
  .toFile(outputPath)
  .then(() => {
    console.log('Icon resized successfully to 256x256');
    console.log('Please rename build/icon-256.png to build/icon.png');
  })
  .catch(err => {
    console.error('Error resizing icon:', err);
  });