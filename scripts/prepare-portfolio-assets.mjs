// Regenerate original-image dimensions and a deterministic, static grain tile.
// Originals are read only. Run after adding or replacing portfolio photography.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const publicRoot = path.join(root, 'public');
const dimensions = {};
async function visit(directory) {
  for (const item of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) await visit(file);
    else if (/\.(png|jpe?g|webp)$/i.test(item.name) && item.name !== 'grain.png') {
      const { width, height } = await sharp(file).metadata();
      dimensions['/' + path.relative(publicRoot, file).replaceAll('\\', '/')] = { width, height };
    }
  }
}
await visit(publicRoot);
await fs.writeFile(path.join(root, 'src/data/originalImageManifest.json'), JSON.stringify(Object.fromEntries(Object.entries(dimensions).sort()), null, 2) + '\n');
const pixels = Buffer.alloc(128 * 128 * 4);
let seed = 42;
for (let i = 0; i < pixels.length; i += 4) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  const value = seed >>> 24;
  pixels[i] = pixels[i + 1] = pixels[i + 2] = value;
  pixels[i + 3] = 255;
}
await sharp(pixels, { raw: { width: 128, height: 128, channels: 4 } }).png().toFile(path.join(publicRoot, 'images/grain.png'));
console.log('Prepared dimensions for ' + Object.keys(dimensions).length + ' original images and static grain.');
