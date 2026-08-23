import { chromium } from '@playwright/test';
import { preview } from 'vite';
import path from 'path';

async function main() {
  const previewServer = await preview({
    preview: { port: 4192 }
  });

  const url = previewServer.resolvedUrls.local[0] || 'http://localhost:4192/';
  console.log('Preview server running on', url);

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    const artifactsDir = 'C:\\Users\\Kurtong\\.gemini\\antigravity-ide\\brain\\1a0b358d-5235-4f13-8c7e-ed145940cba2';
    
    // Screenshot Hero
    await page.screenshot({ path: path.join(artifactsDir, 'home_hero_untouched.png') });
    console.log('Hero screenshot saved.');

    // Scroll to Projects and beyond
    await page.evaluate(() => window.scrollBy(0, 950));
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(artifactsDir, 'home_projects_compact.png') });
    console.log('Projects screenshot saved.');

    // Full page screenshot
    await page.screenshot({ path: path.join(artifactsDir, 'home_full_page.png'), fullPage: true });
    console.log('Full page screenshot saved.');
  } finally {
    await browser.close();
    await previewServer.httpServer.close();
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
