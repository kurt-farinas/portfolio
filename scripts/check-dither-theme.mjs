import fs from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const failures = [];
const legacy = [];
const effects = /(?:rgba?|hsla?)\(|(?:linear|radial|conic)-gradient\(|(?:backdrop-filter|box-shadow)\s*:|blur\(/i;
async function visit(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { if (!entry.name.endsWith('-src') && entry.name !== 'assets') await visit(file); continue; }
    if (!/\.(css|jsx?|html)$/.test(entry.name)) continue;
    const text = await fs.readFile(file, 'utf8');
    const relative = path.relative(root, file).replaceAll('\\', '/');
    if (relative.startsWith('src/js/')) { if (effects.test(text) || /#[a-f\d]{3,8}\b/i.test(text)) legacy.push(relative); continue; }
    const clean = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/url\([^)]*\)/g, '');
    const hex = clean.match(/(?<!&)#[a-f\d]{3,8}\b/gi) || [];
    if (hex.length && (relative !== 'src/styles/variables.css' || hex.some(value => !['#FFFFFF', '#000000'].includes(value)))) failures.push(relative + ': color literal outside tokens');
    if (effects.test(clean)) failures.push(relative + ': forbidden color function or soft effect');
    if (/(?:fillOpacity|strokeOpacity|opacity)\s*[:=]\s*['"]?0?\./.test(clean)) failures.push(relative + ': fractional opacity');
    if (entry.name.endsWith('.css')) {
      postcss.parse(text).walkDecls(decl => {
        const value = decl.value.replace(/url\([^)]*\)/g, '');
        if (/\b(?:black|white|gray|grey|red|green|blue|yellow|orange|purple|silver|pink|navy|teal|maroon|lime|aqua|fuchsia)\b/i.test(value)) failures.push(relative + ': named color in ' + decl.prop);
        if (decl.prop === 'opacity' && !['0','1'].includes(value)) failures.push(relative + ': fractional opacity');
        if (decl.prop === 'border-radius' && value !== '0') failures.push(relative + ': rounded corner');
        if (decl.prop === 'font-weight' && !['400','700'].includes(value)) failures.push(relative + ': unsupported font weight');
        if (/^(?:animation|transition)/.test(decl.prop) && value !== 'none') failures.push(relative + ': non-instant CSS motion');
      });
    }
  }
}
await visit(path.join(root, 'src'));
const html = await fs.readFile(path.join(root, 'index.html'), 'utf8');
if (effects.test(html) || /#[a-f\d]{3,8}\b/i.test(html)) failures.push('index.html: forbidden color/effect');
if (failures.length) throw new Error(failures.join('\n'));
console.log('Active source passed the two-color/effect audit.');
console.log('Untouched, unreferenced legacy files with old effects: ' + (legacy.join(', ') || 'none'));
