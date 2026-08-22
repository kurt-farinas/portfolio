import { chromium } from '@playwright/test';
import path from 'path';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const outDir = 'C:\\Users\\Kurtong\\.gemini\\antigravity-ide\\brain\\9dfcef69-2d25-4c55-9fa3-a0c49a86b0a3';
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'rearranged_footer.png') });

  await browser.close();
  console.log('Footer screenshot saved!');
}

capture().catch(console.error);
