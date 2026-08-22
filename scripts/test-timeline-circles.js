import { chromium } from '@playwright/test';

async function testTimelineCircles() {
  console.log('Testing Timeline Circle Scroll Activation...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const getTimelineStates = async () => {
    return page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.timeline-item'));
      return items.map((item, idx) => {
        const icon = item.querySelector('.timeline-icon');
        return {
          index: idx + 1,
          hasVisibleClass: item.classList.contains('is-visible'),
          iconBg: icon ? window.getComputedStyle(icon).backgroundColor : null,
          iconColor: icon ? window.getComputedStyle(icon).color : null
        };
      });
    });
  };

  // 1. Initial page load (at top / hero)
  console.log('[1] Top of page (Hero):', await getTimelineStates());

  // 2. Scroll just to the timeline heading
  await page.evaluate(() => {
    const el = document.getElementById('timeline');
    window.scrollTo(0, el.offsetTop - 100);
  });
  await page.waitForTimeout(300);
  console.log('[2] Approaching Timeline:', await getTimelineStates());

  // 3. Scroll so line touches Circle 1
  await page.evaluate(() => {
    const el = document.getElementById('timeline');
    window.scrollTo(0, el.offsetTop + 180);
  });
  await page.waitForTimeout(300);
  console.log('[3] Line touching Circle 1:', await getTimelineStates());

  // 4. Scroll so line touches Circle 2 & 3
  await page.evaluate(() => {
    const el = document.getElementById('timeline');
    window.scrollTo(0, el.offsetTop + 600);
  });
  await page.waitForTimeout(300);
  console.log('[4] Line through whole timeline:', await getTimelineStates());

  // 5. Scroll back up to hero
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  console.log('[5] Returned to top:', await getTimelineStates());

  await browser.close();
  console.log('Timeline test complete!');
}

testTimelineCircles().catch(console.error);
