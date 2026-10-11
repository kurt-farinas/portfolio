import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { imageConfig } from './dither-config.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(await fs.readFile(path.join(root, 'src/data/ditherManifest.json'), 'utf8'));
const expectedFiles = new Set(Object.values(manifest).map(image => path.resolve(root, 'src/data', image.file)));
for (const group of ['projects', 'personal']) {
  for (const name of await fs.readdir(path.join(root, 'src/assets', group))) {
    if (name.endsWith('.png') && !expectedFiles.has(path.join(root, 'src/assets', group, name))) throw new Error('Untracked generated PNG: ' + name);
  }
}
for (const image of imageConfig) {
  if (!image.optional && !manifest[image.source]) throw new Error('Missing generated image: ' + image.source);
}
for (const [source, image] of Object.entries(manifest)) {
  const file = path.resolve(root, 'src/data', image.file);
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== image.width || info.height !== image.height) throw new Error('Incorrect dimensions: ' + source);
  const colors = new Set();
  for (let i = 0; i < data.length; i += info.channels) {
    const [r, g, b, a] = data.subarray(i, i + 4);
    if (a !== 255 || r !== g || g !== b || (r !== 0 && r !== 255)) throw new Error('Non-binary or transparent pixel: ' + source);
    colors.add(r);
  }
  if (colors.size > 2) throw new Error('More than two colors: ' + source);
}
console.log('Verified ' + Object.keys(manifest).length + ' PNGs: opaque black and white only.');
