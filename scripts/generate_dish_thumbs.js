// Generates realistic-looking colourful dish thumbnail JPEGs using jpeg-js
// Each image has a gradient + noise to look more food-like
const jpeg = require('jpeg-js');
const fs = require('fs');
const path = require('path');

const W = 200, H = 160;

function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }

function rand(min, max) { return min + Math.random() * (max - min); }

// Generate a dish image with radial gradient + colour palette + noise
function makeDishImg(centerR, centerG, centerB, edgeR, edgeG, edgeB, outFile) {
  const data = Buffer.alloc(W * H * 4);
  const cx = W / 2, cy = H / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;
      const t = Math.min(1, dist * 1.4);
      const noise = (Math.random() - 0.5) * 18;

      const r = clamp(centerR * (1 - t) + edgeR * t + noise);
      const g = clamp(centerG * (1 - t) + edgeG * t + noise);
      const b = clamp(centerB * (1 - t) + edgeB * t + noise);

      const idx = (y * W + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  // Add a highlight circle in top-left (simulates bowl shine)
  for (let y = 10; y < 55; y++) {
    for (let x = 15; x < 65; x++) {
      const dx = x - 38, dy = y - 32;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 22) {
        const idx = (y * W + x) * 4;
        const alpha = (1 - d / 22) * 0.55;
        data[idx]     = clamp(data[idx]     + 255 * alpha);
        data[idx + 1] = clamp(data[idx + 1] + 240 * alpha);
        data[idx + 2] = clamp(data[idx + 2] + 200 * alpha);
      }
    }
  }

  const out = jpeg.encode({ data, width: W, height: H }, 90).data;
  fs.writeFileSync(path.join(__dirname, '..', 'assets', 'images', outFile), out);
  console.log('Created', outFile, '(' + out.length + ' bytes)');
}

// 6 new Bihari/Indian dishes with distinct food colours
// Paneer Butter Masala: deep orange-red centre, warm amber edge
makeDishImg(230, 90, 30,  200, 140, 60,  'menu_thumb_paneer_masala.jpg');

// Chana Masala: golden-brown chickpea
makeDishImg(195, 130, 40,  160, 100, 25,  'menu_thumb_chana_masala.jpg');

// Dal Tadka: warm yellow-orange
makeDishImg(240, 180, 50,  210, 140, 40,  'menu_thumb_dal_tadka.jpg');

// Aloo Poori: golden fried bread
makeDishImg(230, 170, 60,  190, 130, 30,  'menu_thumb_aloo_poori.jpg');

// Kheer: creamy white dessert
makeDishImg(252, 240, 215,  230, 200, 160, 'menu_thumb_kheer.jpg');

// Lassi: pale cream-yellow drink
makeDishImg(252, 240, 180,  240, 220, 150, 'menu_thumb_lassi.jpg');

console.log('All dish thumbnails generated!');

