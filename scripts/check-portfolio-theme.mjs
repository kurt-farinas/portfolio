import fs from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const failures = [];
const files = ['variables.css', 'fonts.css', 'reset.css', 'studio-shared.css', 'studio-home.css', 'studio-after-hours.css', 'studio-overlays.css', 'desktop.css', 'retro-os.css'];
for (const name of files) {
  const source = await fs.readFile(path.join(root, 'src/styles', name), 'utf8');
  postcss.parse(source).walkDecls(declaration => {
    const value = declaration.value.replace(/url\([^)]*\)/g, '');
    if (name !== 'variables.css' && /#[\da-f]{3,8}\b|rgba?\(|hsla?\(/i.test(value)) failures.push(name + ': color outside tokens');
    if (/gradient\(|blur\(|pixelated|--dither/i.test(value)) failures.push(name + ': obsolete visual effect');
    if (declaration.prop === 'font-weight' && !['400', '500', '600', '700', '400 700'].includes(value)) failures.push(name + ': unsupported font weight');
  });
}
const css = await fs.readFile(path.join(root, 'src/styles/reset.css'), 'utf8');
if (!css.includes('prefers-reduced-motion') || !css.includes('outline: 3px')) failures.push('Missing reduced motion or focus safeguards');
const app = await fs.readFile(path.join(root, 'src/App.jsx'), 'utf8');
if (app.includes('HeroMotionProvider')) failures.push('Dither lifecycle remains mounted');
if (!app.includes("lazy(() => import('./components/desktop/DeskScene'))")) failures.push('3D scene is not dynamically imported');
if (app.includes("import DeskScene from './components/desktop/DeskScene'")) failures.push('3D scene is in the initial bundle');
const scene = await fs.readFile(path.join(root, 'src/components/desktop/DeskScene.jsx'), 'utf8');
if (!scene.includes('frameloop="demand"')) failures.push('3D scene does not sleep between interactions');
if (!/<Html\b[^>]*\btransform(?:\s|=|>)/.test(scene)) failures.push('Monitor does not project the React desktop');
const workspace = await fs.readFile(path.join(root, 'src/context/DesktopWorkspaceContext.jsx'), 'utf8');
if (!workspace.includes('window.innerWidth >= 1100') || !workspace.includes("'(pointer: fine)'")) failures.push('3D eligibility does not exclude small/coarse-pointer screens');
for (const directory of ['src/components/sections', 'src/components/common']) {
  for (const name of await fs.readdir(path.join(root, directory))) {
    if (!name.endsWith('.jsx')) continue;
    const source = await fs.readFile(path.join(root, directory, name), 'utf8');
    if (/import .*DitherImage|import .*HeroDither/.test(source)) failures.push(name + ': dither still active');
  }
}
const font = await fs.readFile(path.join(root, 'public/fonts/figtree-latin.woff2'));
if (font.subarray(0, 4).toString() !== 'wOF2') failures.push('Invalid self-hosted WOFF2 font');
const license = await fs.readFile(path.join(root, 'public/fonts/OFL.txt'), 'utf8');
if (!license.includes('SIL Open Font License')) failures.push('Missing font license');
const manifest = JSON.parse(await fs.readFile(path.join(root, 'src/data/originalImageManifest.json'), 'utf8'));
for (const [url, size] of Object.entries(manifest)) {
  await fs.access(path.join(root, 'public', url.slice(1)));
  if (!(size.width > 0 && size.height > 0)) failures.push(url + ': missing intrinsic dimensions');
}
if (failures.length) throw new Error(failures.join('\n'));
console.log('Portfolio palette, typography, original assets, focus, and motion safeguards passed.');
console.log('Preserved legacy scripts are excluded from the active theme audit.');
