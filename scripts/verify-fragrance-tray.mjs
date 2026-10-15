import { chromium, expect } from '@playwright/test';
import { PerspectiveCamera, Vector3 } from 'three';
import fs from 'node:fs/promises';
import { gearCatalogData } from '../src/data/projectData.js';

const base = process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:4182';
const output = 'test-results/fragrance-tray';
const items = ['hawas-ice', 'afnan-sce', 'liquid-brun', 'jaguar-red'].map(id => gearCatalogData.find(item => item.id === id));
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch();
// Project reference points on the visible bottle faces using the approved overview pose.
function point(width, height, x, y, z) {
  const aspect = width / height, k = Math.min(1.4, Math.max(1, 2.21 / aspect));
  const camera = new PerspectiveCamera(38, aspect, 0.1, 100);
  const target = new Vector3(0, 2.5, 0);
  camera.position.set(2 * k, 2.5 + 1.7 * k, 11.5 * k);
  camera.lookAt(target); camera.updateMatrixWorld();
  const p = new Vector3(x, y, z).project(camera);
  return [(p.x + 1) * width / 2, (1 - p.y) * height / 2];
}
const pose = page => page.locator('.desk-projected-html > div').evaluate(el => el.style.transform);
try {
  for (const theme of ['dark', 'light']) {
    for (const [width, height] of [[1440, 900], [1366, 768], [1100, 768]]) {
      for (const [phase, hour] of [['day', 10], ['dusk', 18], ['night', 22]]) {
        const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', timezoneId: 'Asia/Manila' });
        await context.addInitScript(({ theme, hour }) => {
          localStorage.setItem('portfolio-theme', theme); sessionStorage.setItem('kurt-os-boot-seen', 'true');
          const NativeDate = Date, instant = new NativeDate(2026, 9, 15, hour, 30).getTime();
          window.Date = class extends NativeDate { constructor(...args) { super(...(args.length ? args : [instant])); } static now() { return instant; } };
        }, { theme, hour });
        const page = await context.newPage(), errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.goto(base); await expect(page.locator('.desk-loading')).toHaveCount(0, { timeout: 30000 });
        await expect(page.locator('.desk-canvas canvas')).toBeVisible();
        await page.screenshot({ path: `${output}/${width}-${theme}-${phase}.png` });
        if (width === 1440) await page.screenshot({ path: `${output}/${theme}-${phase}-tray.png`, clip: { x: 970, y: 500, width: 270, height: 155 } });
        const initial = await pose(page);
        const active = await page.locator('.desktop-window.is-active').getAttribute('data-app-id');
        for (const [index, item] of items.entries()) {
          const [x, y] = point(width, height, 3.87 + index * 0.52, 1.14, index % 2 ? 0.10 : 0.26);
          await page.mouse.move(x, y);
          await expect(page.locator('.desk-tooltip')).toHaveText(item.title);
          // Capture the real DOM opener after mouse-down, before click opens the dialog.
          await page.mouse.down();
          const focus = await page.evaluate(() => ({ tag: document.activeElement.tagName, label: document.activeElement.getAttribute('aria-label') }));
          await page.mouse.up();
          const dialog = page.locator('#screenshotModal');
          await expect(dialog).toBeVisible();
          await expect(page.locator('#screenshotModalCaption')).toHaveText(item.images[0].caption);
          await expect(page.locator('#screenshotModalImg')).toHaveAttribute('src', new RegExp(item.id === 'afnan-sce' ? 'afnan-sce' : item.id));
          const product = dialog.getByRole('link', { name: 'View product', exact: true });
          await expect(product).toHaveAttribute('href', item.url);
          await expect(product).toHaveAttribute('rel', 'noopener noreferrer');
          const close = dialog.getByRole('button', { name: 'Close image preview' });
          await expect(close).toBeFocused();
          await page.keyboard.press('Shift+Tab'); await expect(product).toBeFocused();
          await page.keyboard.press('Tab'); await expect(close).toBeFocused();
          await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0);
          expect(await page.evaluate(() => ({ tag: document.activeElement.tagName, label: document.activeElement.getAttribute('aria-label') }))).toEqual(focus);
          expect(await pose(page)).toBe(initial);
          await expect(page.locator('.immersive-portfolio-shell')).toHaveAttribute('data-view', 'desk');
          await expect(page.locator('.desktop-window.is-active')).toHaveAttribute('data-app-id', active);
        }
        const rim = point(width, height, 4.65, 0.86, 0.485);
        await page.mouse.move(...rim); await expect(page.locator('.desk-tooltip')).toHaveText('Gear & Collections');
        await page.mouse.click(...rim); await expect(page.locator('.desktop-window.is-active')).toHaveAttribute('data-app-id', 'gear');
        await page.getByRole('button', { name: 'Back to desk', exact: true }).press('Enter');
        for (const [label, reference, app] of [
          ['Contact', [3.05, 1.3, -1.15], 'contact'],
          ['Print résumé', [3.65, 0.99, -2.5], 'resume']
        ]) {
          const location = point(width, height, ...reference);
          await page.mouse.move(...location); await expect(page.locator('.desk-tooltip')).toHaveText(label);
          await page.mouse.click(...location); await expect(page.locator('.desktop-window.is-active')).toHaveAttribute('data-app-id', app);
          await page.getByRole('button', { name: 'Back to desk', exact: true }).press('Enter');
        }
        expect(errors).toEqual([]); await context.close();
        console.log(`${width} ${theme} ${phase}: four photos/links, focus, unchanged room pose and tray shortcut passed.`);
      }
    }
    for (const [width, touch] of [[375, true], [1280, true]]) {
      const context = await browser.newContext({ viewport: { width, height: 812 }, hasTouch: touch });
      await context.addInitScript(theme => { localStorage.setItem('portfolio-theme', theme); sessionStorage.setItem('kurt-os-boot-seen', 'true'); }, theme);
      const page = await context.newPage(), requests = [];
      page.on('request', r => { if (/DeskScene-.*\.js/.test(r.url())) requests.push(r.url()); });
      await page.goto(base); await expect(page.locator('.mobile-workbench')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(requests).toEqual([]);
      await page.screenshot({ path: `${output}/${width}-${theme}-fallback.png` });
      await context.close();
    }
  }
} finally { await browser.close(); }
