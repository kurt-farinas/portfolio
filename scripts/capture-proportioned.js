import { chromium } from '@playwright/test';
import path from 'path';

async function captureAll() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const outDir = 'C:\\Users\\Kurtong\\.gemini\\antigravity-ide\\brain\\9dfcef69-2d25-4c55-9fa3-a0c49a86b0a3';

  // 1. Hero
  await page.screenshot({ path: path.join(outDir, 'proportioned_hero.png') });

  // 2. Projects
  await page.evaluate(() => document.getElementById('projects').scrollIntoView());
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'proportioned_projects.png') });

  // 3. Timeline
  await page.evaluate(() => document.getElementById('timeline').scrollIntoView());
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'proportioned_timeline.png') });

  // 4. Skills
  await page.evaluate(() => document.getElementById('skills').scrollIntoView());
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'proportioned_skills.png') });

  // 5. Awards
  await page.evaluate(() => document.getElementById('awards').scrollIntoView());
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'proportioned_awards.png') });

  // 6. Outside
  await page.evaluate(() => document.getElementById('beyond').scrollIntoView());
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'proportioned_beyond.png') });

  // 7. Contact
  await page.evaluate(() => document.getElementById('contact').scrollIntoView());
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'proportioned_contact.png') });

  await browser.close();
  console.log('All proportioned screenshots saved!');
}

captureAll().catch(console.error);
