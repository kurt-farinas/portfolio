// Write WebP copies of public PNG/JPG images to public/optimized/ and map originals to them.
// Originals stay untouched and remain the fallback. Run after adding or replacing images.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import originals from '../src/data/originalImageManifest.json' with { type: 'json' };

const root = fileURLToPath(new URL('../', import.meta.url));
const publicRoot = path.join(root, 'public');
const manifest = {};
let before = 0;
let after = 0;

for (const src of Object.keys(originals)) {
  if (!/\.(png|jpe?g)$/i.test(src) || src === '/images/grain.png') continue;
  const input = path.join(publicRoot, src);
  // Keep the extension in the name so photo.jpg and photo.png never collide.
  const out = '/optimized' + src + '.webp';
  const output = path.join(publicRoot, out);
  await fs.mkdir(path.dirname(output), { recursive: true });
  // 1920px keeps full-HD project screenshots readable in the lightbox.
  await sharp(input).rotate().resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 80 }).toFile(output);
  const [{ size: oldSize }, { size: newSize }] = await Promise.all([fs.stat(input), fs.stat(output)]);
  if (newSize < oldSize * 0.9) {
    manifest[src] = out;
    before += oldSize;
    after += newSize;
  } else {
    await fs.rm(output);
  }
}

await fs.writeFile(path.join(root, 'src/data/optimizedImageManifest.json'), JSON.stringify(manifest, null, 2) + '\n');
const mb = bytes => (bytes / 1048576).toFixed(1) + ' MB';
console.log(`Optimized ${Object.keys(manifest).length} images: ${mb(before)} -> ${mb(after)}`);
