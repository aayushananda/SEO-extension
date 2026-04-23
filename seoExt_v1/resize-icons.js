import sharp from 'sharp';
import fs from 'fs';

const sizes = [16, 48, 128];
const iconDir = './Icon';

// Create the folder if it doesn't exist
fs.mkdirSync(iconDir, { recursive: true });

async function generateIcons() {
  for (const size of sizes) {
    try {
      const info = await sharp('./Icon/icon-original.png')
        .resize(size, size, {
          kernel: sharp.kernel.lanczos3,
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({ compressionLevel: 9 })
        .toFile(`./Icon/icon${size}.png`);

      console.log(`✅ icon${size}.png — ${info.size} bytes`);
    } catch (err) {
      console.error(`❌ Failed at ${size}px:`, err.message);
    }
  }

  console.log('🎉 All icons generated!');
}

generateIcons();
