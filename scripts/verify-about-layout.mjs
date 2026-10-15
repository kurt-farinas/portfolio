import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';

const base = process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:4174';
const output = 'test-results/about-layout';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch();
try {
  for (const theme of ['dark', 'light']) {
    for (const width of [1440, 375]) {
      const context = await browser.newContext({ viewport: { width, height: width === 375 ? 812 : 900 }, reducedMotion: 'reduce' });
      await context.addInitScript(theme => {
        localStorage.setItem('portfolio-theme', theme);
        sessionStorage.setItem('kurt-os-boot-seen', 'true');
      }, theme);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      if (process.env.PORTFOLIO_BASELINE_URL) {
        await page.goto(process.env.PORTFOLIO_BASELINE_URL + '/#about');
        await page.locator('[data-app-scroll="about"]').press('Control+Home');
        await page.screenshot({ path: `${output}/${width}-${theme}-before.png` });
      }
      await page.goto(base + '/#about');
      const scroll = page.locator('[data-app-scroll="about"]');
      const about = page.locator('.desktop-about-app');
      await expect(about.locator('img.studio-profile-photo')).toBeVisible();
      await expect.poll(() => scroll.evaluate(el => el.scrollTop)).toBe(0);
      await expect(about.locator('.studio-about-lead')).toHaveCount(2);
      expect(await about.locator('h1').evaluate(el => getComputedStyle(el).fontSize)).toBe('24px');
      const positions = await about.locator('.studio-container, .retro-profile-facts').evaluateAll(elements => elements.map(el => el.getBoundingClientRect().left));
      expect(Math.max(...positions) - Math.min(...positions)).toBeLessThan(1);
      expect(await scroll.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      await expect(about.locator('.studio-profile-resume')).toHaveAttribute('href', '/resume.pdf');
      await expect(about.getByLabel('GitHub profile')).toHaveAttribute('href', /github.com\/kurt-farinas/);
      await expect(about.getByLabel('LinkedIn profile')).toHaveAttribute('href', /linkedin.com/);
      await about.getByLabel('Copy email address').focus();
      await expect(about.getByLabel('Copy email address')).toBeFocused();
      await scroll.press('Control+Home');
      await page.screenshot({ path: `${output}/${width}-${theme}-after.png` });

      // Give both sizes a shorter reading area so restoration is tested with real overflow.
      await page.setViewportSize({ width, height: 500 });
      await scroll.evaluate(el => { el.scrollTop = 120; });
      await expect.poll(() => scroll.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
      const saved = await scroll.evaluate(el => el.scrollTop);
      await page.getByRole('button', { name: 'Open application list', exact: true }).click();
      await page.getByRole('button', { name: 'Open Contact', exact: true }).click();
      await expect(page.locator('.desktop-window.is-active')).toHaveAttribute('data-app-id', 'contact');
      await page.getByRole('button', { name: 'Home: Open About app', exact: true }).click();
      await expect.poll(() => scroll.evaluate(el => el.scrollTop)).toBe(saved);
      await page.setViewportSize({ width, height: width === 375 ? 812 : 900 });
      if (width === 1440) {
        // About opens maximized on the desktop; Restore below checks the windowed layout.
        await expect(page.locator('[data-app-id="about"]')).toHaveClass(/is-maximized/);
        await scroll.press('Control+Home');
        await page.screenshot({ path: `${output}/${width}-${theme}-maximized.png` });
        await page.getByRole('button', { name: 'Restore About window', exact: true }).click();
        const handle = page.locator('.desktop-window.is-active .desktop-window-resize-handle');
        const box = await handle.boundingBox();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x - 160, box.y, { steps: 8 });
        await page.mouse.up();
        expect(await scroll.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
        await page.screenshot({ path: `${output}/${width}-${theme}-resized.png` });

        await page.goto(base + '/');
        await page.getByRole('main').getByRole('button', { name: 'Open desktop', exact: true }).click();
        await expect(page.locator('.desktop-workspace-screen')).toBeVisible({ timeout: 30000 });
        await page.getByRole('button', { name: 'Home: Open About app', exact: true }).click();
        await expect.poll(() => scroll.evaluate(el => el.scrollTop)).toBe(0);
        await scroll.evaluate(el => { el.scrollTop = 80; });
        const monitorSaved = await scroll.evaluate(el => el.scrollTop);
        await page.getByRole('button', { name: 'Expand desktop', exact: true }).click();
        await expect(page.locator('.desktop-workspace-expanded')).toBeVisible();
        await expect.poll(() => scroll.evaluate((el, saved) => el.scrollTop === Math.min(saved, el.scrollHeight - el.clientHeight), monitorSaved)).toBe(true);
        await page.getByRole('button', { name: 'Back to monitor', exact: true }).click();
        await expect(page.locator('.desktop-workspace-screen')).toBeVisible({ timeout: 30000 });
        await expect.poll(() => scroll.evaluate(el => el.scrollTop)).toBe(monitorSaved);
        await scroll.press('Control+Home');
        await page.screenshot({ path: `${output}/${width}-${theme}-monitor.png` });
      }
      expect(errors).toEqual([]);
      if (width === 375) {
        await page.goto(base + '/classic');
        await expect(page.locator('html')).toHaveAttribute('data-mode', 'classic');
        await expect(page.locator('.desktop-about-app')).toHaveCount(0);
        await expect(page.locator('.studio-about-lead')).toHaveCount(1);
        await expect(page.locator('.studio-about-lead')).toContainText('Previously, I led frontend development');
      }
      await context.close();
    }
  }
  console.log('About layout passed: both themes, desktop/mobile, resize/maximize, fresh entry and app/view scroll restoration.');
} finally {
  await browser.close();
}
