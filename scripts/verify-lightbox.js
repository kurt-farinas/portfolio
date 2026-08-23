import { chromium } from 'playwright';
import { preview } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

async function test() {
  const server = await preview({
    root,
    preview: { port: 4189 }
  });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:4189/outside-the-ide', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Take overview screenshot without the upper-right badge
    await page.screenshot({
      path: 'C:/Users/Kurtong/.gemini/antigravity-ide/brain/1a0b358d-5235-4f13-8c7e-ed145940cba2/gear_page_no_badge.png',
      fullPage: false
    });
    console.log('No-badge overview screenshot saved.');

    // Click on the Hawas Ice image box to open lightbox
    const hawasCard = page.locator('.gear-card').filter({ hasText: 'Rasasi Hawas Ice' });
    const hawasMedia = hawasCard.locator('.gear-media-box');
    await hawasMedia.click();
    await page.waitForSelector('#screenshotModal.active');
    await page.waitForTimeout(400);

    // Verify product button exists
    const productBtn = page.locator('.screenshot-product-btn');
    const isVisible = await productBtn.isVisible();
    const btnText = await productBtn.innerText();
    const btnHref = await productBtn.getAttribute('href');
    console.log(`Lightbox opened. Product button visible: ${isVisible}, Text: "${btnText}", Href: "${btnHref}"`);

    // Capture screenshot of the full picture modal with product link button
    await page.screenshot({
      path: 'C:/Users/Kurtong/.gemini/antigravity-ide/brain/1a0b358d-5235-4f13-8c7e-ed145940cba2/lightbox_product_button.png'
    });
    console.log('Lightbox modal screenshot saved.');

  } finally {
    await browser.close();
    server.httpServer.close();
  }
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
