import { chromium } from '@playwright/test';

async function testResumeButton() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:5173/...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  console.log('Locating Resume button in hero social pill...');
  const resumeBtn = page.locator('.hero-social-pill button[title="Preview Resume PDF"]');
  const count = await resumeBtn.count();
  console.log(`Resume button count: ${count}`);

  if (count > 0) {
    const isVisible = await resumeBtn.isVisible();
    const isEnabled = await resumeBtn.isEnabled();
    console.log(`Resume button visible: ${isVisible}, enabled: ${isEnabled}`);

    console.log('Clicking Resume button...');
    await resumeBtn.click();
    await page.waitForTimeout(600);

    const modalExists = await page.locator('#resumeModal').count();
    const modalVisible = await page.locator('#resumeModal').isVisible();
    console.log(`Resume modal in DOM: ${modalExists}, visible: ${modalVisible}`);

    await page.screenshot({ path: 'test-resume-modal.png' });
    console.log('Saved test-resume-modal.png');
  }

  await browser.close();
}

testResumeButton().catch(err => {
  console.error(err);
  process.exit(1);
});
