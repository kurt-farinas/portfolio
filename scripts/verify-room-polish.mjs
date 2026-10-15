import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const base = process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:4182';
const output = 'test-results/room-polish';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch();
async function contextFor(theme = 'dark', width = 1440, height = 900, hour = 10, motion = 'reduce') {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: motion, timezoneId: 'Asia/Manila' });
  await context.addInitScript(({ theme, hour }) => {
    localStorage.setItem('portfolio-theme', theme);
    sessionStorage.setItem('kurt-os-boot-seen', 'true');
    const NativeDate = Date;
    const instant = new NativeDate(2026, 9, 15, hour, 30).getTime();
    window.Date = class extends NativeDate {
      constructor(...args) { super(...(args.length ? args : [instant])); }
      static now() { return instant; }
    };
  }, { theme, hour });
  return context;
}
async function ready(page) {
  await expect(page.locator('.desk-loading')).toHaveCount(0, { timeout: 30000 });
  await expect(page.locator('.desk-canvas canvas')).toBeVisible();
}
const pose = page => page.locator('.desk-projected-html > div').evaluate(el => el.style.transform);
try {
  if (!process.env.ROOM_POLISH_INTERACTIONS_ONLY) {
  for (const theme of ['dark', 'light']) {
    for (const [phase, hour] of [['day', 10], ['dusk', 18], ['night', 22]]) {
      const context = await contextFor(theme, 1440, 900, hour);
      const page = await context.newPage();
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.goto(base); await ready(page);
      await expect(page.locator('.desk-canvas')).toHaveAttribute('data-room-phase', phase);
      await page.screenshot({ path: `${output}/1440-${theme}-${phase}.png` });
      expect(errors).toEqual([]); await context.close();
    }
    for (const [width, height] of [[1366, 768], [1100, 768]]) {
      const context = await contextFor(theme, width, height);
      const page = await context.newPage(); await page.goto(base); await ready(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `${output}/${width}-${theme}-day.png` });
      await context.close();
    }
    const context = await contextFor(theme, 375, 812);
    const page = await context.newPage(); const sceneRequests = [];
    page.on('request', request => { if (/DeskScene-.*\.js/.test(request.url())) sceneRequests.push(request.url()); });
    await page.goto(base);
    await expect(page.locator('.mobile-workbench')).toBeVisible();
    await expect(page.locator('.desk-canvas')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `${output}/375-${theme}-workstation.png` });
    expect(sceneRequests).toEqual([]); await context.close();
  }
  console.log('Room composition captured in both themes, three lighting phases, desktop breakpoints and 375px fallback.');

  // Escape independently from both real loading stages, then allow the late request to finish.
  for (const stage of ['module', 'assets']) {
    const context = await contextFor(); const page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    let release; const held = new Promise(resolve => { release = resolve; });
    const pattern = stage === 'module' ? '**/assets/DeskScene-*.js' : '**/images/outside/10.jpg*';
    await page.route(pattern, async route => { await held; await route.continue().catch(() => {}); });
    try {
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.desk-loading')).toHaveAttribute('data-loading-stage', stage, { timeout: 30000 });
      await expect(page.getByRole('link', { name: 'Open résumé PDF', exact: true })).toHaveAttribute('href', '/resume.pdf');
      await page.screenshot({ path: `${output}/loading-${stage}.png` });
      await page.getByRole('button', { name: 'Use 2D desktop', exact: true }).click();
      await expect(page.locator('.desktop-workspace-expanded')).toBeVisible();
      release(); await page.waitForLoadState('networkidle');
      await expect(page.locator('.desk-canvas')).toHaveCount(0);
      expect(errors).toEqual([]);
    } finally { release(); await context.close(); }
  }
  {
    const context = await contextFor(); const page = await context.newPage();
    await page.route('**/images/outside/10.jpg*', route => route.abort());
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.desktop-workspace')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.desk-canvas')).toHaveCount(0);
    await context.close();
  }
  console.log('Module and asset loading expose usable 2D/PDF escapes; late completion stays in 2D and asset failure recovers.');

  }
  const context = await contextFor('dark', 1440, 900, 10, 'no-preference');
  const page = await context.newPage(); const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base); await ready(page);
  // Coordinates are grounded in the 1440px overview capture. Test actual mesh hit targets.
  await page.mouse.move(938, 410);
  await expect(page.locator('.desk-tooltip')).toContainText('Projects');
  await page.mouse.click(938, 410);
  await expect(page.locator('[data-app-id="projects"]')).toHaveClass(/is-maximized/);
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Back to desk', exact: true }).press('Enter');
  await expect(page.locator('.immersive-portfolio-shell')).toHaveAttribute('data-view', 'desk');
  await page.waitForTimeout(1500);
  await page.mouse.move(695, 266);
  await expect(page.locator('.desk-tooltip')).toContainText('Photo:');
  await page.mouse.click(695, 266);
  await expect(page.locator('#screenshotModal')).toBeVisible();
  await page.keyboard.press('Escape');
  for (let iteration = 0; iteration < 3; iteration += 1) {
    await page.getByRole('main').getByRole('button', { name: 'Open desktop', exact: true }).press('Enter');
    await page.getByRole('button', { name: 'Back to desk', exact: true }).press('Enter');
  }
  await page.getByRole('main').getByRole('button', { name: 'Open desktop', exact: true }).press('Enter');
  await page.setViewportSize({ width: 1366, height: 768 });
  await expect(page.locator('.immersive-portfolio-shell')).toHaveAttribute('data-view', 'screen');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(1500);
  const settled = await pose(page); await page.waitForTimeout(1000);
  expect(await pose(page)).toBe(settled);
  const frame = await page.locator('.desk-projection-frame').boundingBox();
  expect(frame.x).toBeGreaterThanOrEqual(0); expect(frame.y).toBeGreaterThanOrEqual(0);
  expect(frame.x + frame.width).toBeLessThanOrEqual(1440); expect(frame.y + frame.height).toBeLessThanOrEqual(900);
  await page.getByRole('button', { name: 'Open Projects', exact: true }).click();
  // Tab backwards into About: keyboard focus must raise the previously covered app.
  await page.getByRole('button', { name: 'Move Projects window', exact: true }).focus();
  await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Shift+Tab');
  await expect(page.locator('.desktop-window.is-active')).toHaveAttribute('data-app-id', 'about');
  await page.getByRole('button', { name: 'Open Projects', exact: true }).click();
  const scroller = page.locator('[data-app-scroll="projects"]');
  await scroller.hover(); await page.mouse.wheel(0, 350);
  await expect.poll(() => scroller.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  const scrollTop = await scroller.evaluate(el => el.scrollTop);
  await page.getByRole('button', { name: 'Expand desktop', exact: true }).press('Enter');
  await expect(page.locator('.desktop-workspace-expanded')).toBeVisible();
  await page.getByRole('button', { name: 'Back to monitor', exact: true }).press('Enter');
  await ready(page); await expect.poll(() => scroller.evaluate(el => el.scrollTop)).toBe(scrollTop);
  await page.screenshot({ path: `${output}/monitor-after-transitions.png` });
  expect(errors).toEqual([]); await context.close();
  console.log('Mesh shortcuts, photo access, interrupted camera moves, resizing, stable final pose, keyboard window activation and expanded scroll restoration passed.');
} finally { await browser.close(); }
