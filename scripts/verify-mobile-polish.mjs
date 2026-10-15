import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';

const base = process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:4174';
const output = 'test-results/mobile-polish/verification';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch();
const sizes = [[320, 740], [375, 812], [390, 844], [812, 375], [1280, 800]];
let combinations = 0;
try {
  for (const [width, height] of sizes) for (const theme of ['dark', 'light']) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, reducedMotion: 'reduce' });
    await context.addInitScript(theme => {
      localStorage.setItem('portfolio-theme', theme);
      sessionStorage.setItem('kurt-os-boot-seen', 'true');
    }, theme);
    const page = await context.newPage();
    const errors = [], scenes = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (/DeskScene|\/three[.-]/i.test(request.url())) scenes.push(request.url()); });
    await page.goto(base + '/projects');
    const active = page.locator('.desktop-window.is-active');
    await expect(active).toHaveAttribute('data-app-id', 'projects');
    await expect(page.getByRole('button', { name: 'Apps', exact: true })).toHaveCount(0);
    for (const [selector, expected] of [['.desktop-menubar', 52], ['.desktop-window.is-active .desktop-window-titlebar', 50], ['.desktop-taskbar', 56]]) {
      expect(Math.round((await page.locator(selector).boundingBox()).height)).toBe(expected);
    }
    expect(await active.locator('h1').evaluate(el => getComputedStyle(el).fontSize)).toBe('24px');
    const image = page.locator('#pmpc-pis img');
    await expect.poll(() => image.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
    expect((await image.boundingBox()).height).toBeLessThanOrEqual(160);
    expect(await image.evaluate(el => getComputedStyle(el).objectFit)).toBe('contain');
    const start = page.getByRole('button', { name: 'Open application list', exact: true });
    await start.click();
    await expect(page.getByRole('navigation', { name: 'Start menu' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(start).toBeFocused();
    await start.click();
    await page.getByRole('button', { name: 'Open Contact', exact: true }).click();
    await expect(active).toHaveAttribute('data-app-id', 'contact');
    await page.goBack();
    await expect(active).toHaveAttribute('data-app-id', 'projects');
    await page.goForward();
    await expect(active).toHaveAttribute('data-app-id', 'contact');
    await page.getByRole('button', { name: 'Home: Open About app', exact: true }).click();
    await expect(active.locator('.mobile-workbench')).toBeVisible();
    await expect(active.locator('.studio-profile-photo')).toBeVisible();
    await expect(active.locator('.mobile-workbench-shortcuts button')).toHaveCount(3);
    await page.screenshot({ path: `${output}/${width}-${height}-${theme}-about.png` });
    await start.click();
    await page.getByRole('button', { name: 'Open Projects', exact: true }).click();
    const scroll = active.locator('[data-app-scroll]');
    await scroll.evaluate(el => { el.scrollTop = 150; });
    await active.getByRole('button', { name: 'Minimize Projects window', exact: true }).click();
    await page.getByRole('button', { name: 'Restore Projects', exact: true }).click();
    expect(await scroll.evaluate(el => el.scrollTop)).toBe(150);
    await scroll.evaluate(el => { el.scrollTop = 0; });
    const opener = page.getByRole('button', { name: "View project: PMPC People's Information System", exact: true });
    await opener.click();
    await expect(page.locator('#projectModal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(opener).toBeFocused();
    await page.getByRole('button', { name: 'Open app search' }).click();
    await page.getByRole('combobox', { name: 'Search commands' }).fill('resume');
    await page.keyboard.press('Escape');
    await page.goto(base + '/#resume');
    await expect(active.locator('a[download]')).toHaveAttribute('href', '/resume.pdf');
    await active.getByRole('button', { name: 'Open accessible résumé preview' }).click();
    await expect(page.locator('#resumeModal')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.goto(base + '/#contact');
    const field = page.getByRole('textbox', { name: 'Message', exact: true });
    await page.setViewportSize({ width, height: Math.min(height, 400) });
    await field.focus();
    await field.fill('Local viewport verification; never submitted.');
    await field.scrollIntoViewIfNeeded();
    await expect(field).toBeInViewport();
    expect(await field.evaluate(el => getComputedStyle(el).fontSize)).toBe('16px');
    await page.setViewportSize({ width, height });
    // Simulate nonzero safe-area insets; desktop browsers report zero hardware insets.
    await page.locator('.desktop-workspace').evaluate(el => {
      for (const [side, value] of [['top', 20], ['bottom', 24], ['left', 8], ['right', 8]]) el.style.setProperty('--mobile-safe-' + side, value + 'px');
    });
    expect(Math.round((await page.locator('.desktop-menubar').boundingBox()).height)).toBe(72);
    expect(Math.round((await page.locator('.desktop-taskbar').boundingBox()).height)).toBe(80);
    const targetSizes = await page.locator('.desktop-menubar button, .desktop-taskbar button, .desktop-window.is-active .desktop-window-controls button').evaluateAll(elements => elements.filter(el => el.getClientRects().length).map(el => ({ label: el.getAttribute('aria-label'), width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })));
    for (const target of targetSizes) {
      expect(target.width, target.label).toBeGreaterThanOrEqual(44);
      expect(target.height, target.label).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(scenes).toEqual([]);
    expect(errors).toEqual([]);
    // Exercise every Start entry once, including the session switch to Classic last.
    if (width === 375) {
      await start.click();
      const labels = await page.locator('.retro-start-items .desktop-icon').evaluateAll(buttons => buttons.map(button => button.getAttribute('aria-label')));
      await page.keyboard.press('Escape');
      expect(labels).toHaveLength(16);
      for (const label of labels.filter(label => label !== 'Open Classic Portfolio')) {
        await start.click();
        await page.getByRole('navigation', { name: 'Start menu' }).getByRole('button', { name: label, exact: true }).click();
        await expect(active.locator('.desktop-window-titlebar h2')).toHaveText(label.replace(/^Open /, ''));
      }
      await start.click();
      await page.getByRole('navigation', { name: 'Start menu' }).getByRole('button', { name: 'Open Classic Portfolio', exact: true }).click();
      await expect(page.locator('html')).toHaveAttribute('data-mode', 'classic');
      await expect(page.getByRole('button', { name: /Back to Kurt-OS/ })).toBeVisible();
    }
    await context.close();
    combinations++;
  }
  console.log(`Mobile polish passed ${combinations} viewport/theme combinations: Start, all 16 apps, sizing, touch targets, history, scroll, search, dialogs, résumé, short viewport, simulated safe areas, and 3D exclusion.`);
} finally { await browser.close(); }
