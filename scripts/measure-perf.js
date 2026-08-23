import { chromium } from '@playwright/test';

async function measurePerformance() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Measuring Core Web Vitals and Performance on live Vercel URL...');
  
  await page.goto('https://kurt-farinas-portfolio.vercel.app/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4500); // allow canvas, animations, preloader

  const perfMetrics = await page.evaluate(() => {
    const timing = performance.getEntriesByType('navigation')[0];
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(p => p.name === 'first-contentful-paint')?.startTime || 0;

    // Get LCP
    let lcp = 0;
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    if (lcpEntries && lcpEntries.length > 0) {
      lcp = lcpEntries[lcpEntries.length - 1].startTime;
    }

    // Get CLS
    let cls = 0;
    const layoutShiftEntries = performance.getEntriesByType('layout-shift');
    if (layoutShiftEntries) {
      for (const entry of layoutShiftEntries) {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      }
    }

    return {
      ttfb: Math.round(timing?.responseStart - timing?.requestStart) || 0,
      domContentLoaded: Math.round(timing?.domContentLoadedEventEnd - timing?.fetchStart) || 0,
      loadComplete: Math.round(timing?.loadEventEnd - timing?.fetchStart) || 0,
      fcp: Math.round(fcp),
      lcp: Math.round(lcp),
      cls: Number(cls.toFixed(4)),
      totalResourceCount: performance.getEntriesByType('resource').length,
      transferSize: performance.getEntriesByType('resource').reduce((acc, r) => acc + (r.transferSize || 0), 0)
    };
  });

  console.log('Performance Metrics:', perfMetrics);
  await browser.close();
}

measurePerformance().catch(console.error);
