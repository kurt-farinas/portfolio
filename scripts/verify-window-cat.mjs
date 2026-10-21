import { chromium, expect } from '@playwright/test';
import { PerspectiveCamera, Vector3 } from 'three';
import fs from 'node:fs/promises';

// Clicks the room window in the desk overview and captures the cat's leap, in both themes, by day and night,
// plus a reduced-motion run where the cat appears without the leap.
const base = process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:4173';
const output = 'test-results/window-cat';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch();
function point(width, height, x, y, z) {
  const aspect = width / height, k = Math.min(1.4, Math.max(1, 2.21 / aspect));
  const camera = new PerspectiveCamera(38, aspect, 0.1, 100);
  camera.position.set(2 * k, 2.5 + 1.7 * k, 11.5 * k);
  camera.lookAt(new Vector3(0, 2.5, 0)); camera.updateMatrixWorld();
  const p = new Vector3(x, y, z).project(camera);
  return [(p.x + 1) * width / 2, (1 - p.y) * height / 2];
}
const [width, height] = [1440, 900];
try {
  for (const [theme, hour, reducedMotion] of [['dark', 10, 'no-preference'], ['light', 22, 'no-preference'], ['dark', 18, 'reduce']]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion, timezoneId: 'Asia/Manila' });
    await context.addInitScript(({ theme, hour }) => {
      localStorage.setItem('portfolio-theme', theme); sessionStorage.setItem('kurt-os-boot-seen', 'true');
      const NativeDate = Date, instant = new NativeDate(2026, 9, 15, hour, 30).getTime();
      window.Date = class extends NativeDate { constructor(...args) { super(...(args.length ? args : [instant])); } static now() { return instant; } };
    }, { theme, hour });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base); await expect(page.locator('.desk-loading')).toHaveCount(0, { timeout: 30000 });
    await page.waitForTimeout(reducedMotion === 'reduce' ? 500 : 2500);
    const [x, y] = point(width, height, 4.6, 4.3, -4.85);
    await page.mouse.move(x, y); await page.waitForTimeout(300);
    const before = await page.evaluate(() => sessionStorage.getItem('kurt-os-achievements'));
    await page.mouse.click(x, y);
    const name = `${theme}-${hour}-${reducedMotion}`;
    for (const at of [150, 450, 900]) {
      await page.waitForTimeout(at === 150 ? 150 : at === 450 ? 300 : 450);
      await page.screenshot({ path: `${output}/${name}-${at}ms.png`, clip: { x: x - 120, y: y - 200, width: 360, height: 300 } });
    }
    const after = await page.evaluate(() => sessionStorage.getItem('kurt-os-achievements'));
    if (!String(after).includes('curiosity')) throw new Error(name + ': Curiosity was not unlocked (before ' + before + ', after ' + after + ')');
    if (errors.length) throw new Error(name + ': ' + errors.join('\n'));
    await context.close();
  }
  console.log('Window cat verified; screenshots in ' + output);
} finally { await browser.close(); }
