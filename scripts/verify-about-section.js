import { chromium } from 'playwright';
import { preview } from 'vite';

async function main() {
  const server = await preview({ preview: { port: 4194 } });
  const serverUrl = 'http://localhost:4194/';
  console.log(`Preview server running on ${serverUrl}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  await page.goto(serverUrl, { waitUntil: 'networkidle' });
  // Wait for preloader to dismiss (preloader takes ~1.2s)
  await page.waitForTimeout(2500);

  // Scroll to about section
  const aboutSec = await page.$('#about');
  if (aboutSec) {
    await aboutSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: 'C:/Users/Kurtong/.gemini/antigravity-ide/brain/1a0b358d-5235-4f13-8c7e-ed145940cba2/about_section_desktop.png' });
  console.log('About section desktop screenshot saved.');

  // Mobile viewport
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  if (aboutSec) {
    await aboutSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: 'C:/Users/Kurtong/.gemini/antigravity-ide/brain/1a0b358d-5235-4f13-8c7e-ed145940cba2/about_section_mobile.png' });
  console.log('About section mobile screenshot saved.');

  await browser.close();
  await server.httpServer.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
