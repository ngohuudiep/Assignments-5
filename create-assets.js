const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Base64 valid 1x1 PNG image
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWPjfDwAEfQHzx5Y+eQAAAABJRU5ErkJggg==';
const buffer = Buffer.from(pngBase64, 'base64');

['favicon.png', 'icon.png', 'splash.png', 'adaptive-icon.png'].forEach((filename) => {
  fs.writeFileSync(path.join(assetsDir, filename), buffer);
});

console.log('Done creating assets!');
