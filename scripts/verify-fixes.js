import { chromium } from '@playwright/test';

async function verify() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(4000);

  // 1. Contrast & Color checks
  const colors = await page.evaluate(() => {
    const getC = sel => window.getComputedStyle(document.querySelector(sel)).color;
    return {
      heroLine2: getC('.hero-title .line-2'),
      profileHeaderSub: getC('.profile-header-sub'),
      focusDesc: getC('.focus-desc'),
      navLink: getC('.nav-links a'),
      logoText: getC('.logo-text')
    };
  });

  console.log('Computed Colors:', colors);

  // 2. Check About Section Focus Grid
  const focusItems = await page.evaluate(() => {
    const cells = Array.from(document.querySelectorAll('.focus-cell'));
    return cells.map(c => ({
      num: c.querySelector('.focus-num')?.textContent,
      label: c.querySelector('.focus-label')?.textContent,
      desc: c.querySelector('.focus-desc')?.textContent
    }));
  });

  console.log('Focus Items:', focusItems);

  // 3. Ensure old ledger is gone
  const hasOldLedger = await page.evaluate(() => !!document.querySelector('.about-ledger-grid'));
  console.log('Old Ledger Present:', hasOldLedger);

  await page.screenshot({ path: 'C:\\Users\\Kurtong\\.gemini\\antigravity-ide\\brain\\9dfcef69-2d25-4c55-9fa3-a0c49a86b0a3\\about_focus_verified.png' });

  await browser.close();
}

verify().catch(console.error);
