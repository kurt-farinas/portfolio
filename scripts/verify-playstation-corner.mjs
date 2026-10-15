import { chromium, expect } from '@playwright/test';
import { PerspectiveCamera, Vector3 } from 'three';
import fs from 'node:fs/promises';
const base = process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:4182';
const output = 'test-results/playstation-decorative';
await fs.mkdir(output, { recursive: true });

const browser = await chromium.launch();
function point(width, height, x, y, z) {
  const aspect = width / height, k = Math.min(1.4, Math.max(1, 2.21 / aspect));
  const camera = new PerspectiveCamera(38, aspect, .1, 100);
  camera.position.set(2 * k, 2.5 + 1.7 * k, 11.5 * k); camera.lookAt(new Vector3(0, 2.5, 0)); camera.updateMatrixWorld();
  const p = new Vector3(x, y, z).project(camera); return [(p.x + 1) * width / 2, (1 - p.y) * height / 2];
}
async function setup(theme, width, height, hour = 10, hasTouch = false) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', hasTouch, timezoneId: 'Asia/Manila' });
  await context.addInitScript(({ theme, hour }) => {
    localStorage.setItem('portfolio-theme', theme); sessionStorage.setItem('kurt-os-boot-seen', 'true');
    const NativeDate = Date, instant = new NativeDate(2026, 9, 15, hour, 30).getTime();
    window.Date = class extends NativeDate { constructor(...args) { super(...(args.length ? args : [instant])); } static now() { return instant; } };
  }, { theme, hour });
  return context;
}
const pose = page => page.locator('.desk-projected-html > div').evaluate(el => el.style.transform);
try {
  for (const theme of ['dark', 'light']) {
    for (const [width, height] of [[1440, 900], [1366, 768], [1100, 768]]) {
      for (const [phase, hour] of [['day', 10], ['dusk', 18], ['night', 22]]) {
        const context = await setup(theme, width, height, hour), page = await context.newPage();
        const errors = []; page.on('pageerror', error => errors.push(error.message));
        await page.goto(base); await expect(page.locator('.desk-loading')).toHaveCount(0, { timeout: 30000 });
        await expect(page.locator('.desk-canvas canvas')).toBeVisible();
        const initial = await pose(page), url = page.url();
        const app = await page.locator('.desktop-window.is-active').getAttribute('data-app-id');
        for (const ref of [[-7.1, 2.02, -3.88], [-5.62, 1.87, -3.92], [-5.12, 1.82, -3.87], [-4.61, 1.97, -4.47], [-4.03, 1.97, -4.47], [-4.36, 1.83, -3.96]]) {
          const location = point(width, height, ...ref);
          await page.mouse.move(...location);
          await expect(page.locator('.desk-tooltip')).toHaveCount(0);
          expect(await page.evaluate(() => document.body.style.cursor)).not.toBe('pointer');
          await page.mouse.click(...location);
          await expect(page.locator('.immersive-portfolio-shell')).toHaveAttribute('data-view', 'desk');
          await expect(page.locator('.desktop-window.is-active')).toHaveAttribute('data-app-id', app);
          await expect(page.locator('[data-app-id="playstation"]')).toHaveCount(0);
          expect(await pose(page)).toBe(initial); expect(page.url()).toBe(url);
        }
        await page.mouse.move(width - 30, height - 30);
        await page.screenshot({ path: `${output}/${width}-${theme}-${phase}.png` });
        expect(errors).toEqual([]); await context.close(); console.log(`${width} ${theme} ${phase}: decorative corner passed`);
      }
    }
    for (const [width, hasTouch] of [[375, false], [1280, true]]) {
      const context = await setup(theme, width, 812, 10, hasTouch), page = await context.newPage(), scenes = [];
      page.on('request', request => { if (request.url().includes('/assets/DeskScene-')) scenes.push(request.url()); });
      // Obsolete hashes use the existing unknown-anchor fallback, never an orphan app.
      await page.goto(base + '/#playstation');
      await expect(page.locator('[data-app-id="about"].is-active')).toBeVisible();
      await expect(page.locator('[data-app-id="playstation"]')).toHaveCount(0);
      await expect(page.locator('.mobile-workbench > svg')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(scenes).toEqual([]);
      await page.screenshot({ path: `${output}/${width}-${theme}-fallback.png` });
      await page.getByRole('button', { name: 'Open application list' }).click();
      await expect(page.getByRole('button', { name: 'Open PlayStation Collection', exact: true })).toHaveCount(0);
      await context.close();
    }
  }
  const context = await setup('dark', 1440, 900), page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.route('**/images/playstation/*.webp', route => route.abort());
  await page.goto(base); await expect(page.locator('.desk-loading')).toHaveCount(0, { timeout: 30000 });
  await expect(page.locator('.desk-canvas canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Open desktop', exact: true }).click();
  await expect(page.locator('#desktop-launcher .desktop-icon')).toHaveCount(16);
  await expect(page.getByRole('button', { name: 'Open PlayStation Collection', exact: true })).toHaveCount(0);
  expect(errors).toEqual([]); await context.close();
  console.log('Decorative PlayStation corner: 18 room combinations, no click/hover effects, mobile/coarse fallback, app removal and optional texture failure passed.');
} finally { await browser.close(); }
