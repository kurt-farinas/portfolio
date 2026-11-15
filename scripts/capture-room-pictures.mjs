// Captures the desk overview as still pictures for PCs without usable WebGL (see RoomPicture.jsx).
// Usage: node scripts/capture-room-pictures.mjs [previewUrl]  (default http://localhost:4173)
// Then run: node scripts/prepare-portfolio-assets.mjs && npm run images
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const base = process.argv[2] || process.env.PORTFOLIO_PREVIEW_URL || 'http://localhost:4173';
const output = 'public/images/room';
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ args: ['--enable-gpu', '--ignore-gpu-blocklist', ...(process.platform === 'win32' ? ['--use-angle=d3d11'] : [])] });
for (const theme of ['dark', 'light']) {
  for (const [phase, hour] of [['day', 10], ['dusk', 18], ['night', 22]]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await context.addInitScript(([theme, hour]) => {
      sessionStorage.setItem('kurt-os-boot-seen', 'true');
      localStorage.setItem('portfolio-theme', theme);
      const NativeDate = Date;
      const instant = new NativeDate(2026, 9, 15, hour, 30).getTime();
      window.Date = class extends NativeDate {
        constructor(...args) { super(...(args.length ? args : [instant])); }
        static now() { return instant; }
      };
    }, [theme, hour]);
    const page = await context.newPage();
    await page.goto(base);
    await page.locator('.desk-loading').waitFor({ state: 'detached', timeout: 90000 });
    await page.addStyleTag({ content: '.desk-welcome { display: none !important; } * { cursor: none !important; }' });
    await page.mouse.move(1439, 899);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${output}/${theme}-${phase}.png` });
    await context.close();
  }
}
await browser.close();
console.log(`Captured 6 room pictures in ${output}.`);
