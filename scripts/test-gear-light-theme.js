import { chromium } from '@playwright/test';
import { preview } from 'vite';
import path from 'path';

async function testTheme() {
  const previewServer = await preview({
    preview: { port: 4189 }
  });

  const url = previewServer.resolvedUrls.local[0] || 'http://localhost:4189/';
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${url}outside-the-ide`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    // Toggle theme to light
    const themeBtn = page.locator('#themeToggleBtn').first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(600);
    }

    const artifactsDir = 'C:\\Users\\Kurtong\\.gemini\\antigravity-ide\\brain\\1a0b358d-5235-4f13-8c7e-ed145940cba2';
    await page.screenshot({ path: path.join(artifactsDir, 'gear_page_light.png'), fullPage: true });
    console.log('Light mode screenshot saved.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
    await previewServer.close();
    process.exit(0);
  }
}

testTheme();
