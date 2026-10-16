import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';

const base = process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:4182';
const output = 'test-results/camera-zoom';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch();
async function settled(page) {
  let previous = '';
  let stable = 0;
  await expect.poll(async () => {
    const next = await page.locator('.desk-projected-html > div').evaluate(el => el.style.transform);
    stable = next === previous ? stable + 1 : 0;
    previous = next;
    return stable;
  }, { timeout: 12000, intervals: [100] }).toBeGreaterThanOrEqual(3);
}
async function sample(page, action, checkTail = true) {
  const trace = page.evaluate(() => new Promise(resolve => {
    const rows = []; const start = performance.now();
    const step = time => {
      const rect = document.querySelector('.desk-projection-frame').getBoundingClientRect();
      rows.push([time, rect.x, rect.y, rect.width, rect.height]);
      if (time - start < 3500) requestAnimationFrame(step); else resolve(rows);
    };
    requestAnimationFrame(step);
  }));
  await action();
  const rows = await trace;
  // A completed damping tail must not jump faster than the preceding tail.
  const steps = rows.slice(1).map((row, i) => {
    const prior = rows[i]; const dt = row[0] - prior[0];
    const pixels = Math.hypot(...row.slice(1).map((n, j) => n - prior[j + 1]));
    return { time: row[0] - rows[0][0], dt, pixels, speed: pixels * 1000 / dt };
  });
  for (let i = 1; i < steps.length; i += 1) {
    const a = steps[i - 1], b = steps[i];
    if (b.time < 400 || a.dt > 80 || b.dt > 80) continue;
    expect(b.pixels, 'no discontinuous camera tail').toBeLessThan(120);
    if (checkTail && a.speed < 100 && b.pixels > 1) expect(b.speed, 'no late snap').toBeLessThan(a.speed * 4 + 40);
  }
  return rows;
}
try {
  for (const theme of ['dark', 'light']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(theme => {
      localStorage.setItem('portfolio-theme', theme);
      sessionStorage.setItem('kurt-os-boot-seen', 'true');
      const raf = window.requestAnimationFrame.bind(window);
      window.__cameraTestFrames = 0;
      window.requestAnimationFrame = callback => { window.__cameraTestFrames++; return raf(callback); };
    }, theme);
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base); await expect(page.locator('.desk-loading')).toHaveCount(0, { timeout: 30000 });
    await settled(page);
    const shell = page.locator('.immersive-portfolio-shell');
    const entry = await sample(page, () => page.getByRole('button', { name: 'Open desktop', exact: true }).click());
    await settled(page);
    const frames = await page.evaluate(() => window.__cameraTestFrames);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => window.__cameraTestFrames)).toBeLessThanOrEqual(frames + 2);
    const exit = await sample(page, () => page.getByRole('button', { name: 'Back to desk', exact: true }).press('Enter'));
    await settled(page);
    // The camera follows the cursor: dwell on the monitor glass zooms in, leaving the desktop zooms out.
    const frame = await page.locator('.desk-projection-frame').boundingBox();
    const hoverEntry = await sample(page, async () => {
      await page.mouse.move(frame.x + frame.width / 2 - 30, frame.y + frame.height / 2);
      await page.mouse.move(frame.x + frame.width / 2, frame.y + frame.height / 2, { steps: 6 });
      await expect(shell).toHaveAttribute('data-view', 'screen');
    }, false);
    await settled(page);
    const wide = await page.locator('.desk-projection-frame').boundingBox();
    const hoverExit = await sample(page, async () => {
      await page.mouse.move(wide.x / 2, wide.y + wide.height / 2, { steps: 6 });
      await expect(shell).toHaveAttribute('data-view', 'desk');
    }, false);
    // Scroll path: dolly past 5.5 units with the cursor off the glass (no hover dwell), then reverse past 6.
    await page.mouse.move(1380, 650);
    const wheelEntry = await sample(page, async () => {
      for (let i = 0; i < 90 && await shell.getAttribute('data-view') === 'desk'; i++) {
        await page.mouse.wheel(0, -40); await page.waitForTimeout(18);
      }
      await expect(shell).toHaveAttribute('data-view', 'screen');
      // Reverse before it settles, then reverse again. Each gesture retargets once.
      await page.mouse.wheel(0, 120);
      await expect(shell).toHaveAttribute('data-view', 'desk');
      await page.mouse.wheel(0, -120);
      await expect(shell).toHaveAttribute('data-view', 'screen');
    }, false);
    await settled(page);
    const wheelExit = await sample(page, async () => {
      await page.mouse.move(1380, 650);
      for (let i = 0; i < 20 && await shell.getAttribute('data-view') === 'screen'; i++) {
        await page.mouse.wheel(0, 160); await page.waitForTimeout(18);
      }
      await expect(shell).toHaveAttribute('data-view', 'desk');
    }, false);
    await settled(page);
    await expect(shell).toHaveAttribute('data-view', 'desk');
    await fs.writeFile(`${output}/${theme}-motion.json`, JSON.stringify({ entry, exit, hoverEntry, hoverExit, wheelEntry, wheelExit }));
    await page.screenshot({ path: `${output}/${theme}-desk.png` });
    expect(errors).toEqual([]);
    await context.close();
    console.log(`${theme}: camera tails, idle rendering, hover-dwell and wheel zoom in and out passed.`);
  }
} finally { await browser.close(); }
