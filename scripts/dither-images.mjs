import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { imageConfig, bayer8 } from './dither-config.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = {};
const reports = [];
for (const image of imageConfig) {
  if (manifest[image.source]) continue;
  const original = path.join(root, 'public', image.source.slice(1));
  const name = path.parse(original).name + '.png';
  const sourceDir = path.join(root, 'src/assets', image.group + '-src');
  const outputDir = path.join(root, 'src/assets', image.group);
  await fs.mkdir(sourceDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });
  try { await fs.access(original); }
  catch (error) {
    if (!image.optional) throw error;
    reports.push({ source: image.source, status: 'missing original; existing schematic fallback retained' });
    continue;
  }
  const source = path.join(sourceDir, path.basename(original));
  await fs.copyFile(original, source);
  const width = image.exportWidth || Math.ceil(image.cssWidth / 2);
  const { data, info } = await sharp(source).autoOrient().flatten({ background: 'white' })
    .resize({ width }).greyscale().normalise().raw().toBuffer({ resolveWithObject: true });
  const binary = Buffer.alloc(info.width * info.height);
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const threshold = (bayer8[y % 8][x % 8] + 0.5) / 64 * 255;
      binary[y * info.width + x] = data[(y * info.width + x) * info.channels] > threshold ? 255 : 0;
    }
  }
  await sharp(binary, { raw: { width: info.width, height: info.height, channels: 1 } })
    .png({ palette: true, colours: 2, dither: 0 }).toFile(path.join(outputDir, name));
  manifest[image.source] = { file: '../assets/' + image.group + '/' + name, width: info.width, height: info.height };
  reports.push({ source: image.source, exportWidth: info.width, cssWidth: image.cssWidth, reason: image.reason || 'half-size export', crop: null });
}
const manifestPath = path.join(root, 'src/data/ditherManifest.json');
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
await fs.writeFile(path.join(root, 'scripts/dither-report.json'), JSON.stringify(reports, null, 2) + '\n');
console.log('Generated ' + Object.keys(manifest).length + ' opaque two-color PNGs.');
