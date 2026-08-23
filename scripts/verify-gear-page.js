import { chromium } from '@playwright/test';
import { preview } from 'vite';
import path from 'path';

async function main() {
  const previewServer = await preview({
    preview: { port: 4188 }
  });

  const url = previewServer.resolvedUrls.local[0] || 'http://localhost:4188/';
  console.log('Preview server running on', url);

  const browser = await chromium.launch({ headless: true });

  try {
    const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await desktopPage.goto(`${url}outside-the-ide`, { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(2500); // Allow preloader to finish

    const title = await desktopPage.textContent('.gear-main-title');
    console.log('Desktop Title:', title);

    const cardCount = await desktopPage.locator('.gear-card').count();
    console.log('Total Bento Cards Rendered:', cardCount);

    // Switch to Lookbook View
    await desktopPage.locator('.view-switch-btn:has-text("LOOKBOOK")').click();
    await desktopPage.waitForTimeout(600);
    const lookbookCount = await desktopPage.locator('.lookbook-card').count();
    console.log('Lookbook Cards Rendered:', lookbookCount);

    const artifactsDir = 'C:\\Users\\Kurtong\\.gemini\\antigravity-ide\\brain\\1a0b358d-5235-4f13-8c7e-ed145940cba2';
    await desktopPage.screenshot({ path: path.join(artifactsDir, 'gear_page_lookbook.png'), fullPage: true });
    console.log('Lookbook screenshot saved.');

    // Switch back to Bento View
    await desktopPage.locator('.view-switch-btn:has-text("BENTO")').click();
    await desktopPage.waitForTimeout(600);

    // Test photo slider arrow on the first card (MCHOSE Ace 60 Pro)
    const nextBtn = desktopPage.locator('.gear-card').first().locator('.gear-photo-nav-btn.next');
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await desktopPage.waitForTimeout(400);
      console.log('Photo slide navigated to index 2.');
    }

    // Toggle photo helper guide
    await desktopPage.locator('.gear-helper-toggle').click();
    await desktopPage.waitForTimeout(400);

    await desktopPage.screenshot({ path: path.join(artifactsDir, 'gear_page_desktop.png'), fullPage: true });
    console.log('Bento Desktop screenshot saved.');

    // Mobile Viewport
    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobilePage.goto(`${url}outside-the-ide`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(2500);

    await mobilePage.screenshot({ path: path.join(artifactsDir, 'gear_page_mobile.png'), fullPage: true });
    console.log('Mobile screenshot saved.');

  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    await browser.close();
    await previewServer.close();
    process.exit(0);
  }
}

main();
