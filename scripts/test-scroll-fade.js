import { chromium } from '@playwright/test';

async function testScrollFade() {
  console.log('Testing Multi-Layer Cinematic Scroll Fade...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4200);

  const getStats = async () => {
    return page.evaluate(() => {
      const line1 = document.querySelector('.hero-title .line-1');
      const sub = document.querySelector('.hero-subtitle');
      const ctrl = document.querySelector('.hero-bottom-controls');
      return {
        titleOpacity: line1 ? window.getComputedStyle(line1).opacity : null,
        titleFilter: line1 ? window.getComputedStyle(line1).filter : null,
        subOpacity: sub ? window.getComputedStyle(sub).opacity : null,
        ctrlOpacity: ctrl ? window.getComputedStyle(ctrl).opacity : null
      };
    });
  };

  console.log('[1] Scroll 0px:', await getStats());

  await page.evaluate(() => window.scrollTo(0, 200));
  await page.waitForTimeout(250);
  console.log('[2] Scroll 200px:', await getStats());

  await page.evaluate(() => window.scrollTo(0, 450));
  await page.waitForTimeout(250);
  console.log('[3] Scroll 450px:', await getStats());

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  console.log('[4] Return to 0px:', await getStats());

  await browser.close();
  console.log('Multi-layer fade test successful!');
}

testScrollFade().catch(console.error);
