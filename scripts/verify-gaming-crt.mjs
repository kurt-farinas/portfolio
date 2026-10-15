import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import { drawFightingDemo, fightingPose } from '../src/components/desktop/fightingDemo.js';
const base = process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:4182';
const output = 'test-results/gaming-crt';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch();
async function prepare(context, theme) {
 await context.addInitScript(theme => {
  localStorage.setItem('portfolio-theme', theme); sessionStorage.setItem('kurt-os-boot-seen', 'true');
  const stats = window.__gamingCrtQA = { draws: 0, times: [], initialFrames: [], uploads: 0, disposed: 0, canvas: null };
  const fill = CanvasRenderingContext2D.prototype.fillRect;
  CanvasRenderingContext2D.prototype.fillRect = function(x, y, w, h) {
   const result = fill.call(this, x, y, w, h);
   if (!stats.captureOnly && this.canvas.width === 160 && this.canvas.height === 120 && x === 0 && y === 0 && w === 160 && h === 120) {
    const first = stats.canvas !== this.canvas;
    stats.canvas = this.canvas; stats.draws++; stats.times.push(performance.now());
    if (first) queueMicrotask(() => stats.initialFrames.push(this.canvas.toDataURL()));
   }
   return result;
  };
  const bindings = new WeakMap(), owned = new Set();
  for (const type of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
   if (!type) continue;
   const proto = type.prototype;
   if (Object.hasOwn(proto, 'bindTexture')) {
    const bind = proto.bindTexture;
    proto.bindTexture = function(target, texture) {
     let map = bindings.get(this); if (!map) bindings.set(this, map = new Map()); map.set(target, texture);
     return bind.call(this, target, texture);
    };
   }
   for (const name of ['texImage2D', 'texSubImage2D']) {
    if (!Object.hasOwn(proto, name)) continue;
    const upload = proto[name];
    proto[name] = function(...args) {
     if (args.some(arg => arg instanceof HTMLCanvasElement && arg.width === 160 && arg.height === 120)) {
      const texture = bindings.get(this)?.get(args[0]); if (texture) owned.add(texture); stats.uploads++;
     }
     return upload.apply(this, args);
    };
   }
   if (Object.hasOwn(proto, 'deleteTexture')) {
    const dispose = proto.deleteTexture;
    proto.deleteTexture = function(texture) { if (owned.delete(texture)) stats.disposed++; return dispose.call(this, texture); };
   }
  }
 }, theme);
}
const state = page => page.evaluate(() => ({ draws: window.__gamingCrtQA.draws, uploads: window.__gamingCrtQA.uploads, disposed: window.__gamingCrtQA.disposed, initialFrames: window.__gamingCrtQA.initialFrames, image: window.__gamingCrtQA.canvas?.toDataURL() }));
async function frozen(page, duration = 700) {
 await page.waitForTimeout(150); const before = await state(page);
 await page.waitForTimeout(duration); const after = await state(page);
 expect(after.draws).toBe(before.draws); expect(after.image).toBe(before.image); return after;
}
try {
 for (const theme of ['dark', 'light']) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  await prepare(context, theme); const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base); await expect(page.locator('.desk-loading')).toHaveCount(0, { timeout: 30000 });
  await expect.poll(async () => (await state(page)).draws).toBeGreaterThan(1);
  await expect.poll(async () => (await state(page)).uploads).toBeGreaterThan(0);
  await page.screenshot({ path: `${output}/${theme}-overview.png` });
  // Capture deterministic raster frames from the same draw function used by the real screen.
  const colors = await page.evaluate(() => {
   const read = key => getComputedStyle(document.documentElement).getPropertyValue('--desk-' + key).trim();
   return Object.fromEntries(['skyNight:sky-night','hardwareEdge:hardware-edge','hardwareDetail:hardware-detail','hardwareBlack:hardware-black','curtain:curtain','objectDark:object-dark','paper:paper','fragranceStone:fragrance-stone','mug:mug','led:led','fragranceRed:fragrance-red'].map(pair => { const [key, token] = pair.split(':'); return [key, read(token)]; }));
  });
  for (const [name, time] of [['idle', 0], ['fighting', 4.5], ['reset', 11.6]]) {
   const data = await page.evaluate(({ source, colors, pose }) => {
    const canvas = document.createElement('canvas'); canvas.width = 160; canvas.height = 120;
    const draw = new Function('return (' + source + ')')(); window.__gamingCrtQA.captureOnly = true;
    try { draw(canvas.getContext('2d'), colors, pose); return canvas.toDataURL(); } finally { window.__gamingCrtQA.captureOnly = false; }
   }, { source: drawFightingDemo.toString(), colors, pose: fightingPose(time) });
   await fs.writeFile(`${output}/${theme}-${name}-screen.png`, Buffer.from(data.split(',')[1], 'base64'));
  }
  // Draw counts track actual canvas updates: initial draw plus 12 quantized frames per second.
  const baseline = (await state(page)).draws;
  await page.waitForTimeout(1100); const moving = await state(page);
  expect(moving.draws - baseline).toBeGreaterThan(0); expect(moving.draws - baseline).toBeLessThanOrEqual(15);
  // Wait through the first exchange and reset, capturing their actual room presentation.
  await expect.poll(async () => (await state(page)).draws, { timeout: 40000, intervals: [40] }).toBeGreaterThanOrEqual(55);
  await page.screenshot({ path: `${output}/${theme}-fighting-room.png` });
  await expect.poll(async () => (await state(page)).draws, { timeout: 40000, intervals: [40] }).toBeGreaterThanOrEqual(140);
  await page.screenshot({ path: `${output}/${theme}-reset-room.png` });
  await page.getByRole('button', { name: 'Open desktop', exact: true }).click();
  const paused = await frozen(page);
  await page.getByRole('button', { name: 'Expand desktop', exact: true }).click();
  await expect.poll(async () => (await state(page)).disposed).toBeGreaterThanOrEqual(1);
  await page.getByRole('button', { name: 'Back to monitor', exact: true }).click();
  await expect(page.locator('.desk-canvas canvas')).toBeVisible();
  await expect.poll(async () => (await state(page)).initialFrames.length).toBeGreaterThanOrEqual(2);
  const restored = await frozen(page);
  expect(restored.initialFrames.at(-1)).toBe(paused.image);
  await page.getByRole('button', { name: 'Back to desk', exact: true }).click();
  await expect.poll(async () => (await state(page)).draws).toBeGreaterThan(restored.draws);
  // Simulate the browser visibility signal, without production test hooks.
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
  const hidden = await frozen(page);
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect.poll(async () => (await state(page)).draws).toBeGreaterThan(hidden.draws);
  await page.emulateMedia({ reducedMotion: 'reduce' }); await frozen(page);
  await page.screenshot({ path: `${output}/${theme}-reduced-motion.png` });
  expect(errors).toEqual([]); await context.close();
  console.log(`${theme}: real texture uploads, 12fps cap, frozen monitor/visibility/reduced-motion states, expanded-view phase restoration and GPU texture disposal passed`);
 }
} finally { await browser.close(); }
