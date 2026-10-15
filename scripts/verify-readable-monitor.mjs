import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const base=process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:4182';
const browser=await chromium.launch();
await fs.mkdir('test-results/readable-monitor',{recursive:true});
try {
 for(const theme of ['dark','light']) for(const [width,height] of [[1440,900],[1366,768],[1100,768]]) {
  const context=await browser.newContext({viewport:{width,height}, reducedMotion:'reduce'});
  await context.addInitScript(theme=>{localStorage.setItem('portfolio-theme',theme);sessionStorage.setItem('kurt-os-boot-seen','true');},theme);
  const page=await context.newPage();await page.goto(base);
  await page.getByRole('main').getByRole('button',{name:'Projects',exact:true}).click();
  const win=page.locator('[data-app-id="projects"]');
  await expect(win).toHaveClass(/is-maximized/);
  await expect(page.locator('.desktop-workspace-screen')).toBeVisible();
  await expect(page.locator('.desk-loading')).toBeHidden({timeout:30000});
  const frame=page.locator('.desk-projection-frame');
  await expect.poll(async()=>frame.evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;})).toBe(true);
  await page.screenshot({path:`test-results/readable-monitor/${width}-${theme}.png`});
  await page.getByRole('button',{name:'Restore Projects window',exact:true}).click();
  const rect=await win.getAttribute('style');
  await page.getByRole('button',{name:'Minimize Projects window',exact:true}).click();
  await page.getByRole('button',{name:'Restore Projects',exact:true}).click();
  await expect(win).toHaveClass(/is-maximized/);
  await page.getByRole('button',{name:'Restore Projects window',exact:true}).click();
  expect(await win.getAttribute('style')).toBe(rect);
  await page.getByRole('button',{name:'Open Projects',exact:true}).click();
  await expect(win).toHaveClass(/is-maximized/);
  await page.getByRole('button',{name:'Expand desktop',exact:true}).click();
  await page.getByRole('button',{name:'Restore Projects window',exact:true}).click();
  await page.getByRole('button',{name:'Open Projects',exact:true}).click();
  await expect(win).not.toHaveClass(/is-maximized/);
  await page.getByRole('button',{name:'Back to monitor',exact:true}).click();
  await expect(frame).toBeVisible();
  await context.close();
 }
 console.log('Readable monitor verified at 1440, 1366 and 1100px in both themes: complete screen, maximization, minimized recovery, restore rectangle, expanded behavior and reduced motion.');
} finally {await browser.close();}
