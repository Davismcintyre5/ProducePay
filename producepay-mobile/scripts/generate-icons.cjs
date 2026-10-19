const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const SVG_PATH = path.join(ASSETS_DIR, 'logo.svg');

if (!fs.existsSync(SVG_PATH)) {
  console.error(`Missing ${SVG_PATH}`);
  console.error('Create assets/logo.svg first (a maize icon on a green rounded square).');
  process.exit(1);
}

const svgBuffer = fs.readFileSync(SVG_PATH);

const BRAND = { r: 27, g: 94, b: 32, alpha: 1 }; // #1b5e20

const icons = [
  { size: 1024, name: 'icon.png', description: 'iOS App Store' },
  { size: 180, name: 'icon-180.png', description: 'iOS 180' },
  { size: 120, name: 'icon-120.png', description: 'iOS 120' },
  { size: 76, name: 'icon-76.png', description: 'iOS 76' },

  { size: 1024, name: 'adaptive-icon.png', description: 'Android Adaptive 1024' },
  { size: 512, name: 'adaptive-icon-512.png', description: 'Android Adaptive 512' },
  { size: 192, name: 'android-icon-192.png', description: 'Android 192' },
  { size: 144, name: 'android-icon-144.png', description: 'Android 144' },
  { size: 96, name: 'android-icon-96.png', description: 'Android 96' },
  { size: 72, name: 'android-icon-72.png', description: 'Android 72' },
  { size: 48, name: 'android-icon-48.png', description: 'Android 48' },

  { size: 512, name: 'favicon-512.png', description: 'PWA 512' },
  { size: 384, name: 'favicon-384.png', description: 'PWA 384' },
  { size: 256, name: 'favicon-256.png', description: 'PWA 256' },
  { size: 192, name: 'favicon.png', description: 'Web favicon' },
  { size: 128, name: 'favicon-128.png', description: 'Web 128' },
  { size: 64, name: 'favicon-64.png', description: 'Web 64' },
  { size: 32, name: 'favicon-32.png', description: 'Web 32' },
  { size: 16, name: 'favicon-16.png', description: 'Web 16' }
];

const splashes = [
  { width: 2048, height: 2048, name: 'splash-icon.png', description: 'Expo splash icon' },
  { width: 2732, height: 2732, name: 'splash-2732.png', description: 'iOS 2732' },
  { width: 2048, height: 2048, name: 'splash-2048.png', description: 'Android 2048' },
  { width: 1242, height: 2436, name: 'splash-1242x2436.png', description: 'iOS 1242x2436' },
  { width: 1242, height: 2208, name: 'splash-1242x2208.png', description: 'iOS 1242x2208' },
  { width: 1080, height: 1920, name: 'splash-1080x1920.png', description: 'Android 1080x1920' }
];

async function generateIcons() {
  console.log('\n🎨 Icons\n');
  for (const icon of icons) {
    try {
      await sharp(svgBuffer)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: BRAND
        })
        .png()
        .toFile(path.join(ASSETS_DIR, icon.name));
      console.log(`✅ ${icon.name} (${icon.size}x${icon.size}) — ${icon.description}`);
    } catch (err) {
      console.error(`❌ ${icon.name}: ${err.message}`);
    }
  }
}

function splashSvg(width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const emojiSize = Math.round(Math.min(width, height) * 0.18);
  const titleSize = Math.round(Math.min(width, height) * 0.05);
  const taglineSize = Math.round(Math.min(width, height) * 0.025);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="#1b5e20"/>
      <text x="${centerX}" y="${centerY - titleSize * 0.3}" text-anchor="middle" fill="white" font-size="${emojiSize}">🌽</text>
      <text x="${centerX}" y="${centerY + titleSize * 1.2}" text-anchor="middle" fill="white" font-size="${titleSize}" font-weight="bold" font-family="Arial, sans-serif">ProducePay</text>
      <text x="${centerX}" y="${centerY + titleSize * 2}" text-anchor="middle" fill="#a5d6a7" font-size="${taglineSize}" font-family="Arial, sans-serif">MOIBEN Maize Management</text>
    </svg>
  `;
}

async function generateSplashes() {
  console.log('\n🎨 Splash screens\n');
  for (const splash of splashes) {
    try {
      await sharp(Buffer.from(splashSvg(splash.width, splash.height)))
        .resize(splash.width, splash.height)
        .png()
        .toFile(path.join(ASSETS_DIR, splash.name));
      console.log(`✅ ${splash.name} (${splash.width}x${splash.height}) — ${splash.description}`);
    } catch (err) {
      console.error(`❌ ${splash.name}: ${err.message}`);
    }
  }
}

async function generateNotificationIcons() {
  console.log('\n🎨 Notification icons\n');
  const sizes = [96, 72, 48, 24];

  for (const size of sizes) {
    const name = `notification-icon-${size}.png`;
    try {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <text x="${size / 2}" y="${size * 0.75}" text-anchor="middle" fill="white" font-size="${size * 0.75}">🌽</text>
        </svg>
      `;
      await sharp(Buffer.from(svg)).png().toFile(path.join(ASSETS_DIR, name));
      console.log(`✅ ${name} (${size}x${size})`);
    } catch (err) {
      console.error(`❌ ${name}: ${err.message}`);
    }
  }
}

async function main() {
  console.log('🚀 Generating ProducePay mobile icons');
  console.log(`📁 ${ASSETS_DIR}`);

  await generateIcons();
  await generateSplashes();
  await generateNotificationIcons();

  console.log('\n✨ Done.\n');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});