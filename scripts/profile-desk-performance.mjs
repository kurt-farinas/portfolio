// Frame-time profile of the 3D desk on the real GPU with 4x CPU throttling (a mid-range laptop stand-in).
// Usage: node scripts/profile-desk-performance.mjs [previewUrl]  (default http://localhost:4173)
import { chromium } from 'playwright';

const base = process.argv[2] || process.env.PORTFOLIO_PREVIEW_URL || 'http://localhost:4173';
const CPU_THROTTLE = Number(process.env.CPU_THROTTLE || 4);
const browser = await chromium.launch({ args: ['--enable-gpu', '--ignore-gpu-blocklist', ...(process.platform === 'win32' ? ['--use-angle=d3d11'] : [])] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
await context.addInitScript(() => {
  sessionStorage.setItem('kurt-os-boot-seen', 'true');
  const frames = window.__frames = [];
  const tick = now => { frames.push(now); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
});
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
page.on('console', m => { if (m.text().startsWith('[perf]')) console.log('   ', m.text()); });
await cdp.send('Performance.enable');
const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));

async function phase(name, action) {
  const before = await metrics();
  const start = await page.evaluate(() => performance.now());
  await action();
  const end = await page.evaluate(() => performance.now());
  const after = await metrics();
  const frames = await page.evaluate(([a, b]) => window.__frames.filter(t => t >= a && t <= b), [start, end]);
  const gaps = frames.slice(1).map((t, i) => t - frames[i]).sort((a, b) => a - b);
  const pick = q => gaps.length ? gaps[Math.min(gaps.length - 1, Math.floor(q * gaps.length))].toFixed(1) : '-';
  const ms = key => ((after[key] - before[key]) * 1000).toFixed(0);
  console.log(`${name.padEnd(14)} frames ${String(gaps.length).padStart(4)}  p50 ${pick(0.5)}ms  p95 ${pick(0.95)}ms  max ${pick(1)}ms  >50ms ${gaps.filter(g => g > 50).length}  script ${ms('ScriptDuration')}ms  style ${ms('RecalcStyleDuration')}ms  layout ${ms('LayoutDuration')}ms  task ${ms('TaskDuration')}ms`);
}

const renderer = await page.evaluate(() => {
  const gl = document.createElement('canvas').getContext('webgl2');
  return gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);
});
console.log(`GPU: ${renderer}  CPU throttle: ${CPU_THROTTLE}x`);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU_THROTTLE });
await phase('load', async () => {
  await page.goto(base);
  await page.locator('.desk-loading').waitFor({ state: 'detached', timeout: 60000 });
  await page.waitForTimeout(3000);
});
await phase('idle overview', () => page.waitForTimeout(5000));
await phase('hover sweep', async () => {
  for (let i = 0; i <= 60; i += 1) { await page.mouse.move(300 + i * 14, 420 + Math.sin(i / 4) * 120); await page.waitForTimeout(40); }
});
await phase('to monitor', async () => {
  await page.getByRole('button', { name: 'Open desktop', exact: true }).click();
  await page.waitForTimeout(2500);
});
await phase('to desk', async () => {
  await page.getByRole('button', { name: 'Back to desk', exact: true }).click();
  await page.waitForTimeout(2500);
});
await phase('orbit drag', async () => {
  await page.mouse.move(200, 700); await page.mouse.down();
  for (let i = 0; i < 40; i += 1) { await page.mouse.move(200 + i * 8, 700 - i * 2); await page.waitForTimeout(30); }
  await page.mouse.up(); await page.waitForTimeout(1500);
});
await browser.close();
