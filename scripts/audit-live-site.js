import { chromium } from '@playwright/test';
import path from 'path';

async function auditLive() {
  const browser = await chromium.launch({ headless: true });
  const outDir = 'C:\\Users\\Kurtong\\.gemini\\antigravity-ide\\brain\\9dfcef69-2d25-4c55-9fa3-a0c49a86b0a3';

  // Desktop Context (1440x900)
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();

  console.log('Navigating to live portfolio (Desktop)...');
  await desktopPage.goto('https://kurt-farinas-portfolio.vercel.app/', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(4000); // Wait for preloader/hero animations

  // Capture Above-the-fold desktop
  await desktopPage.screenshot({ path: path.join(outDir, 'desktop_atf.png'), fullPage: false });
  console.log('Saved desktop_atf.png');

  // Scroll through to trigger all scroll/intersection animations
  await desktopPage.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 150);
    });
  });

  await desktopPage.waitForTimeout(2000);

  // Capture Full-page desktop
  await desktopPage.screenshot({ path: path.join(outDir, 'desktop_full.png'), fullPage: true });
  console.log('Saved desktop_full.png');

  // Extract computed styles for Hero, About, Projects, Contact
  const computedData = await desktopPage.evaluate(() => {
    const getStyles = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const s = window.getComputedStyle(el);
      return {
        fontFamily: s.fontFamily,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        lineHeight: s.lineHeight,
        color: s.color,
        backgroundColor: s.backgroundColor,
        padding: s.padding,
        margin: s.margin,
        borderRadius: s.borderRadius,
        border: s.border,
        maxWidth: s.maxWidth
      };
    };

    return {
      heroH1Line1: getStyles('.hero-title .line-1'),
      heroH1Line2: getStyles('.hero-title .line-2'),
      heroSubtitle: getStyles('.hero-subtitle'),
      heroCtaButton: getStyles('.btn-view-projects'),
      projectCard: getStyles('.ticket'),
      projectTitle: getStyles('.ticket-title'),
      projectDesc: getStyles('.ticket-desc'),
      projectPills: getStyles('.ticket-tech-pills span'),
      aboutText: getStyles('.about-text p'),
      aboutLedgerVal: getStyles('.ledger-val'),
      contactTitle: getStyles('.contact-hero-title'),
      contactInput: getStyles('.form-group input'),
      contactButton: getStyles('.btn-submit-hero')
    };
  });

  console.log('Computed Data:', JSON.stringify(computedData, null, 2));

  // Mobile Context (390x844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });
  const mobilePage = await mobileContext.newPage();

  console.log('Navigating to live portfolio (Mobile 390x844)...');
  await mobilePage.goto('https://kurt-farinas-portfolio.vercel.app/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(4000); // Wait for preloader/hero animations

  // Capture Above-the-fold mobile
  await mobilePage.screenshot({ path: path.join(outDir, 'mobile_atf.png'), fullPage: false });
  console.log('Saved mobile_atf.png');

  // Scroll through mobile
  await mobilePage.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 150);
    });
  });

  await mobilePage.waitForTimeout(2000);

  // Capture Full-page mobile
  await mobilePage.screenshot({ path: path.join(outDir, 'mobile_full.png'), fullPage: true });
  console.log('Saved mobile_full.png');

  await browser.close();
  console.log('All captures and audits completed!');
}

auditLive().catch(console.error);
